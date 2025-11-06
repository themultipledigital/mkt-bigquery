#!/usr/bin/env python3
"""
Setup Local PWA

Prepares the downloaded PWA template for local development by:
1. Converting PHP manifest to JSON
2. Updating all file paths in HTML
3. Moving files to correct locations
4. Creating a local server setup
"""

import json
import re
from pathlib import Path
from shutil import copy2, move
import os


class LocalPWASetup:
    def __init__(self, template_dir):
        """
        Initialize the local PWA setup.
        
        Args:
            template_dir: Path to the downloaded template directory
        """
        self.template_dir = Path(template_dir)
        self.html_file = self.template_dir / "html" / "index.html"
        self.manifest_php = self.template_dir / "manifestdirect.php"
        self.manifest_json = self.template_dir / "manifest.json"
        self.service_worker = self.template_dir / "pwabuilder-sw.js"
        
    def convert_manifest(self):
        """Convert PHP manifest to JSON if it contains JSON."""
        if not self.manifest_php.exists():
            print("⚠ manifestdirect.php not found")
            return False
        
        try:
            with open(self.manifest_php, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            # Try to parse as JSON
            manifest_data = json.loads(content)
            
            # Save as manifest.json
            with open(self.manifest_json, 'w', encoding='utf-8') as f:
                json.dump(manifest_data, f, indent=2, ensure_ascii=False)
            
            print(f"✓ Converted {self.manifest_php.name} to manifest.json")
            return True
            
        except json.JSONDecodeError as e:
            print(f"✗ Could not parse manifest as JSON: {e}")
            return False
    
    def update_html_paths(self):
        """Update all file paths in HTML to work locally."""
        if not self.html_file.exists():
            print("⚠ index.html not found")
            return False
        
        with open(self.html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        original_content = html_content
        
        # Update manifest reference
        html_content = re.sub(
            r'href=["\']\./manifestdirect\.php["\']',
            'href="./manifest.json"',
            html_content,
            flags=re.IGNORECASE
        )
        
        # Update CSS paths (from ./filename.css to ./static/css/filename.css)
        css_files = ['swiper-bundle.min.css', 'dark.css', 'light.css']
        for css_file in css_files:
            html_content = re.sub(
                rf'href=["\']\./{re.escape(css_file)}["\']',
                f'href="./static/css/{css_file}"',
                html_content,
                flags=re.IGNORECASE
            )
        
        # Update JS paths (from ./filename.js to ./static/js/filename.js)
        js_files = ['swiper-bundle.min.js', 'ua-parser.js']
        for js_file in js_files:
            html_content = re.sub(
                rf'src=["\']\./{re.escape(js_file)}["\']',
                f'src="./static/js/{js_file}"',
                html_content,
                flags=re.IGNORECASE
            )
        
        # Update icon paths (from ./icon.png to ./static/icons/icon.png)
        html_content = re.sub(
            r'src=["\']\./icon\.png["\']',
            'src="./static/icons/icon.png"',
            html_content,
            flags=re.IGNORECASE
        )
        
        # Update service worker path (should be in root, already correct)
        # But ensure it's referenced correctly
        html_content = re.sub(
            r'register\(["\']pwabuilder-sw\.js["\']',
            'register("./pwabuilder-sw.js"',
            html_content,
            flags=re.IGNORECASE
        )
        
        # Only write if changes were made
        if html_content != original_content:
            with open(self.html_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print("✓ Updated file paths in index.html")
            return True
        else:
            print("ℹ No path updates needed in index.html")
            return True
    
    def move_files_to_root(self):
        """Move key files to root for easier local serving."""
        # Move HTML to root (or keep in html/ and serve from there)
        # Actually, let's keep structure but ensure service worker is accessible
        
        # Ensure service worker is in root
        if self.service_worker.exists():
            print(f"✓ Service worker found: {self.service_worker.name}")
        else:
            print("⚠ Service worker not found")
        
        # Copy HTML to root as well for easier access
        root_html = self.template_dir / "index.html"
        if not root_html.exists():
            copy2(self.html_file, root_html)
            print(f"✓ Copied index.html to root")
    
    def update_manifest_paths(self):
        """Update paths in manifest.json to match local structure."""
        if not self.manifest_json.exists():
            print("⚠ manifest.json not found")
            return False
        
        try:
            with open(self.manifest_json, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
            
            updated = False
            
            # Update start_url
            if 'start_url' in manifest:
                if manifest['start_url'] == './pagedirect.php':
                    manifest['start_url'] = './index.html'
                    updated = True
                elif manifest['start_url'].endswith('.php'):
                    manifest['start_url'] = './index.html'
                    updated = True
            
            # Update icon paths
            if 'icons' in manifest:
                for icon in manifest['icons']:
                    if 'src' in icon:
                        # Update icon path if it's just ./icon.png
                        if icon['src'] == './icon.png':
                            icon['src'] = './static/icons/icon.png'
                            updated = True
                        elif not icon['src'].startswith('./static/'):
                            # Try to fix relative paths
                            if 'icon' in icon['src'].lower():
                                icon['src'] = './static/icons/' + Path(icon['src']).name
                                updated = True
            
            if updated:
                with open(self.manifest_json, 'w', encoding='utf-8') as f:
                    json.dump(manifest, f, indent=2, ensure_ascii=False)
                print("✓ Updated paths in manifest.json")
            
            return True
            
        except Exception as e:
            print(f"✗ Error updating manifest: {e}")
            return False
    
    def create_local_server_script(self):
        """Create a simple local server script."""
        server_script = self.template_dir / "serve_local.py"
        
        script_content = '''#!/usr/bin/env python3
"""
Simple local HTTP server for PWA testing.

Run this script to serve the PWA locally on http://localhost:8000
"""

import http.server
import socketserver
import os
from pathlib import Path

PORT = 8000

class PWAHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # Add PWA headers
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Suppress some logs for cleaner output
        if args[0] not in ['304', '200']:
            super().log_message(format, *args)

if __name__ == "__main__":
    # Change to script directory
    os.chdir(Path(__file__).parent)
    
    with socketserver.TCPServer(("", PORT), PWAHTTPRequestHandler) as httpd:
        print(f"\\n🚀 PWA Local Server")
        print(f"📱 Serving at: http://localhost:{PORT}")
        print(f"📱 Or try: http://127.0.0.1:{PORT}")
        print(f"\\nPress Ctrl+C to stop\\n")
        httpd.serve_forever()
'''
        
        with open(server_script, 'w', encoding='utf-8') as f:
            f.write(script_content)
        
        # Make executable on Unix systems
        try:
            os.chmod(server_script, 0o755)
        except:
            pass
        
        print(f"✓ Created local server script: {server_script.name}")
    
    def setup(self):
        """Run all setup steps."""
        print("Setting up local PWA...")
        print("=" * 60)
        
        self.convert_manifest()
        self.update_html_paths()
        self.update_manifest_paths()
        self.move_files_to_root()
        self.create_local_server_script()
        
        print("\n" + "=" * 60)
        print("✓ Local PWA setup complete!")
        print("\nTo run locally:")
        print(f"  cd {self.template_dir.name}")
        print("  python serve_local.py")
        print("\nThen open: http://localhost:8000")


def main():
    import sys
    
    # Default template directory
    default_template = "template_bigbasssplashplaygame"
    
    if len(sys.argv) > 1:
        template_dir = sys.argv[1]
    else:
        template_dir = default_template
    
    # Check if template directory exists
    template_path = Path(template_dir)
    if not template_path.exists():
        print(f"✗ Template directory not found: {template_dir}")
        print(f"  Looking for: {template_path.absolute()}")
        return
    
    setup = LocalPWASetup(template_dir)
    setup.setup()


if __name__ == "__main__":
    main()

