"""
Convert BigQuery Documentation Markdown to HTML

This script converts the filtered BigQuery documentation from Markdown to a 
styled, professional HTML document with syntax highlighting and navigation.
"""

import re
import markdown
from markdown.extensions.tables import TableExtension
from markdown.extensions.fenced_code import FencedCodeExtension
from markdown.extensions.codehilite import CodeHiliteExtension

# Configuration
INPUT_FILE = "bigquery_documentation_filtered.md"
OUTPUT_FILE = "bigquery_documentation_filtered.html"

# HTML Template
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BigQuery Documentation - level-hope-462409-a8</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/languages/sql.min.js"></script>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f7fa;
            padding: 20px;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 8px;
        }}
        
        h1 {{
            color: #1a73e8;
            border-bottom: 3px solid #1a73e8;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 2.5em;
        }}
        
        h2 {{
            color: #1967d2;
            margin-top: 40px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e8eaed;
            font-size: 2em;
        }}
        
        h3 {{
            color: #174ea6;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 1.5em;
        }}
        
        h4 {{
            color: #185abc;
            margin-top: 25px;
            margin-bottom: 10px;
            font-size: 1.25em;
            padding: 10px;
            background-color: #f8f9fa;
            border-left: 4px solid #1a73e8;
        }}
        
        p {{
            margin-bottom: 15px;
            line-height: 1.8;
        }}
        
        ul, ol {{
            margin-left: 30px;
            margin-bottom: 15px;
        }}
        
        li {{
            margin-bottom: 8px;
        }}
        
        code {{
            background-color: #f1f3f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #d01884;
        }}
        
        pre {{
            background-color: #282c34;
            color: #abb2bf;
            padding: 20px;
            border-radius: 6px;
            overflow-x: auto;
            margin-bottom: 20px;
            border-left: 4px solid #1a73e8;
        }}
        
        pre code {{
            background-color: transparent;
            padding: 0;
            color: inherit;
            font-size: 0.95em;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}
        
        th {{
            background-color: #1a73e8;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }}
        
        td {{
            padding: 12px;
            border-bottom: 1px solid #e8eaed;
        }}
        
        tr:hover {{
            background-color: #f8f9fa;
        }}
        
        tr:nth-child(even) {{
            background-color: #fafafa;
        }}
        
        .toc {{
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 30px;
            border-left: 4px solid #1a73e8;
        }}
        
        .toc ul {{
            list-style-type: none;
            margin-left: 0;
        }}
        
        .toc li {{
            margin-bottom: 8px;
        }}
        
        .toc a {{
            color: #1a73e8;
            text-decoration: none;
            transition: color 0.2s;
        }}
        
        .toc a:hover {{
            color: #174ea6;
            text-decoration: underline;
        }}
        
        .summary-box {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        
        .summary-box h2 {{
            color: white;
            border-bottom: 2px solid rgba(255,255,255,0.3);
            margin-top: 0;
        }}
        
        .summary-box ul {{
            list-style-type: none;
            margin-left: 0;
        }}
        
        .summary-box li {{
            padding: 5px 0;
            font-size: 1.1em;
        }}
        
        .summary-box h3 {{
            color: white;
            margin-top: 20px;
        }}
        
        .summary-box code {{
            background-color: rgba(255,255,255,0.2);
            color: #fff;
        }}
        
        .join-guide {{
            background-color: #e8f5e9;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 20px;
            border-left: 4px solid #4caf50;
        }}
        
        .utm-box {{
            background-color: #fff3e0;
            padding: 15px;
            border-radius: 6px;
            margin-top: 15px;
            border-left: 4px solid #ff9800;
        }}
        
        .utm-box strong {{
            color: #e65100;
        }}
        
        details {{
            margin-bottom: 20px;
            border: 1px solid #e8eaed;
            border-radius: 6px;
            padding: 15px;
            background-color: #fafafa;
        }}
        
        summary {{
            cursor: pointer;
            font-weight: 600;
            color: #1a73e8;
            padding: 5px;
        }}
        
        summary:hover {{
            color: #174ea6;
        }}
        
        .note {{
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #2196f3;
            margin: 20px 0;
        }}
        
        .note strong {{
            color: #1565c0;
        }}
        
        .back-to-top {{
            position: fixed;
            bottom: 30px;
            right: 30px;
            background-color: #1a73e8;
            color: white;
            padding: 15px 20px;
            border-radius: 50px;
            text-decoration: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            transition: background-color 0.3s;
            display: none;
        }}
        
        .back-to-top:hover {{
            background-color: #174ea6;
        }}
        
        @media (max-width: 768px) {{
            .container {{
                padding: 20px;
            }}
            
            h1 {{
                font-size: 2em;
            }}
            
            h2 {{
                font-size: 1.5em;
            }}
            
            table {{
                font-size: 0.9em;
            }}
        }}
        
        /* Syntax highlighting adjustments */
        .hljs {{
            background-color: #282c34;
            padding: 20px;
            border-radius: 6px;
        }}
        
        .metadata {{
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }}
        
        .metadata strong {{
            color: #1a73e8;
        }}
    </style>
</head>
<body>
    <div class="container">
        {content}
    </div>
    
    <a href="#" class="back-to-top" id="backToTop">↑ Back to Top</a>
    
    <script>
        // Initialize syntax highlighting
        hljs.highlightAll();
        
        // Back to top button
        window.addEventListener('scroll', function() {{
            var backToTop = document.getElementById('backToTop');
            if (window.pageYOffset > 300) {{
                backToTop.style.display = 'block';
            }} else {{
                backToTop.style.display = 'none';
            }}
        }});
        
        document.getElementById('backToTop').addEventListener('click', function(e) {{
            e.preventDefault();
            window.scrollTo({{ top: 0, behavior: 'smooth' }});
        }});
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {{
            anchor.addEventListener('click', function (e) {{
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {{
                    target.scrollIntoView({{ behavior: 'smooth', block: 'start' }});
                }}
            }});
        }});
    </script>
</body>
</html>
"""


def preprocess_markdown(content):
    """Preprocess markdown content for better HTML conversion."""
    
    # Wrap summary section in special div
    content = re.sub(
        r'(## Summary\n\n.*?)(?=\n##)',
        r'<div class="summary-box">\n\n\1\n</div>\n',
        content,
        flags=re.DOTALL
    )
    
    # Wrap join guide section
    content = re.sub(
        r'(## Join Keys and Hierarchies\n\n.*?)(?=\n## Table of Contents)',
        r'<div class="join-guide">\n\n\1\n</div>\n',
        content,
        flags=re.DOTALL
    )
    
    # Wrap UTM Parameters sections
    content = re.sub(
        r'(\*\*UTM Parameters:\*\*.*?```.*?```)',
        r'<div class="utm-box">\n\n\1\n\n</div>',
        content,
        flags=re.DOTALL
    )
    
    # Wrap Note sections
    content = re.sub(
        r'(\*\*Note:\*\* .*?)(\n\n)',
        r'<div class="note">\n\n\1\n\n</div>\n\n',
        content
    )
    
    # Wrap metadata sections (Full Name, Rows, Size, Created, Modified, Location)
    content = re.sub(
        r'(\*\*Full Name:\*\*.*?\n\*\*Rows:\*\*.*?\n\*\*Size:\*\*.*?\n\*\*Created:\*\*.*?\n\*\*Modified:\*\*.*?)\n',
        r'<div class="metadata">\n\n\1\n\n</div>\n',
        content,
        flags=re.DOTALL
    )
    
    # Handle dataset metadata
    content = re.sub(
        r'(\*\*Location:\*\*.*?\n\*\*Created:\*\*.*?\n\*\*Modified:\*\*.*?\n\*\*Tables:\*\*.*?\n)',
        r'<div class="metadata">\n\n\1\n\n</div>\n',
        content,
        flags=re.DOTALL
    )
    
    return content


def convert_markdown_to_html(markdown_file):
    """Convert markdown file to HTML with styling."""
    
    print(f"Reading {markdown_file}...")
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("Preprocessing markdown...")
    content = preprocess_markdown(content)
    
    print("Converting to HTML...")
    # Initialize markdown with extensions
    md = markdown.Markdown(extensions=[
        'tables',
        'fenced_code',
        'codehilite',
        'toc',
        'extra'
    ])
    
    # Convert to HTML
    html_content = md.convert(content)
    
    # Wrap in template
    final_html = HTML_TEMPLATE.format(content=html_content)
    
    return final_html


def main():
    """Main execution function."""
    print(f"Converting {INPUT_FILE} to HTML...")
    
    try:
        html_output = convert_markdown_to_html(INPUT_FILE)
        
        print(f"Writing HTML to {OUTPUT_FILE}...")
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(html_output)
        
        print(f"\n[SUCCESS] HTML documentation created: {OUTPUT_FILE}")
        print(f"  Open this file in your web browser to view the styled documentation.")
        
    except FileNotFoundError:
        print(f"ERROR: {INPUT_FILE} not found!")
    except Exception as e:
        print(f"ERROR: {e}")


if __name__ == "__main__":
    main()

