#!/usr/bin/env python3
"""
Add Version Comments to Workers and BigQuery Views

Adds version comments to the top of files that don't already have them.
Works with Cloudflare Workers (.js) and BigQuery Views (.sql).
"""

import re
from pathlib import Path


def has_version_comment(content):
    """
    Check if file already has a version comment.
    
    Args:
        content: File content
        
    Returns:
        bool: True if version comment exists
    """
    # Check first 20 lines for version comment
    lines = content.split('\n')[:20]
    for line in lines:
        if re.search(r'version:\s*\d+\.\d+', line, re.IGNORECASE):
            return True
    return False


def add_version_to_js_file(file_path):
    """
    Add version comment to JavaScript/Worker file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        bool: True if file was modified
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if has_version_comment(content):
        return False
    
    # Add version comment at the top
    version_comment = "// Version: 1.0.0\n"
    
    # If file starts with a multi-line comment, add after it
    if content.startswith('/*'):
        # Find end of comment block
        comment_end = content.find('*/')
        if comment_end != -1:
            # Add version inside the comment block, after the opening
            lines = content.split('\n')
            if lines[0].strip() == '/*' or lines[0].strip().startswith('/*'):
                # Insert after first line
                new_content = lines[0] + '\n * Version: 1.0.0\n' + '\n'.join(lines[1:])
            else:
                # Just add at top
                new_content = version_comment + content
        else:
            new_content = version_comment + content
    else:
        # Add at the very top
        new_content = version_comment + content
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True


def add_version_to_sql_file(file_path):
    """
    Add version comment to SQL file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        bool: True if file was modified
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if has_version_comment(content):
        return False
    
    # Check if file starts with SQL comments
    lines = content.split('\n')
    insert_pos = 0
    
    # Skip existing header comments to add version after them
    for i, line in enumerate(lines):
        if line.strip().startswith('--'):
            insert_pos = i + 1
        elif line.strip() == '':
            continue
        else:
            break
    
    # Add version comment
    version_line = "-- Version: 1.0.0"
    
    if insert_pos > 0:
        # Add after existing comments
        lines.insert(insert_pos, version_line)
    else:
        # Add at the very top
        lines.insert(0, version_line)
    
    new_content = '\n'.join(lines)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True


def process_directory(directory, file_extension, add_version_func):
    """
    Process all files in a directory.
    
    Args:
        directory: Directory path
        file_extension: File extension to process (e.g., '.js', '.sql')
        add_version_func: Function to add version comment
        
    Returns:
        tuple: (modified_count, skipped_count)
    """
    dir_path = Path(directory)
    
    if not dir_path.exists():
        print(f"Directory {directory} not found!")
        return 0, 0
    
    files = list(dir_path.glob(f"*{file_extension}"))
    modified = 0
    skipped = 0
    
    for file_path in sorted(files):
        # Skip files in subdirectories
        if file_path.parent != dir_path:
            continue
            
        try:
            if add_version_func(file_path):
                print(f"  ✓ Added version: {file_path.name}")
                modified += 1
            else:
                print(f"  - Already has version: {file_path.name}")
                skipped += 1
        except Exception as e:
            print(f"  ✗ Error processing {file_path.name}: {e}")
    
    return modified, skipped


def main():
    """Main function."""
    print("Adding Version Comments to Workers and Views")
    print("=" * 50)
    
    # Process Cloudflare Workers
    print("\nCloudflare Workers (.js files):")
    js_modified, js_skipped = process_directory(
        "cloudflareworkers",
        ".js",
        add_version_to_js_file
    )
    
    # Process BigQuery Views
    print("\nBigQuery Views (.sql files):")
    sql_modified, sql_skipped = process_directory(
        "bigqueryviews",
        ".sql",
        add_version_to_sql_file
    )
    
    # Summary
    print(f"\n{'=' * 50}")
    print("Summary:")
    print(f"  Workers: {js_modified} modified, {js_skipped} already had versions")
    print(f"  Views:   {sql_modified} modified, {sql_skipped} already had versions")
    print(f"  Total:   {js_modified + sql_modified} files updated")


if __name__ == "__main__":
    main()

