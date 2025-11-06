#!/usr/bin/env python3
"""
PWA Template Downloader

Downloads all files from a live PWA website to create a local template.
Extracts HTML, CSS, JS, images, manifest.json, service workers, and all other assets.
"""

import os
import re
import requests
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
from bs4 import BeautifulSoup
import json
import time


class PWADownloader:
    def __init__(self, base_url, output_dir="template"):
        """
        Initialize the PWA downloader.
        
        Args:
            base_url: The base URL of the PWA website (e.g., "https://bigbasssplashplaygame.com/")
            output_dir: Directory to save downloaded files
        """
        self.base_url = base_url.rstrip('/')
        self.output_dir = Path(output_dir)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.downloaded_urls = set()
        self.failed_urls = []
        
        # Create output directory structure
        self.output_dir.mkdir(parents=True, exist_ok=True)
        (self.output_dir / "html").mkdir(exist_ok=True)
        (self.output_dir / "static").mkdir(exist_ok=True)
        (self.output_dir / "static" / "js").mkdir(exist_ok=True)
        (self.output_dir / "static" / "css").mkdir(exist_ok=True)
        (self.output_dir / "static" / "images").mkdir(exist_ok=True)
        (self.output_dir / "static" / "icons").mkdir(exist_ok=True)
        
    def normalize_url(self, url):
        """Convert relative URLs to absolute URLs."""
        if url.startswith('//'):
            return 'https:' + url
        elif url.startswith('/'):
            return self.base_url + url
        elif url.startswith('http'):
            return url
        else:
            return urljoin(self.base_url + '/', url)
    
    def get_file_path(self, url, default_ext=''):
        """
        Determine local file path for a URL.
        Preserves directory structure relative to base URL.
        """
        parsed = urlparse(url)
        path = unquote(parsed.path)
        
        # Remove leading slash
        if path.startswith('/'):
            path = path[1:]
        
        # If no path or just '/', it's index.html
        if not path or path == '/':
            return self.output_dir / "html" / "index.html"
        
        # Determine file type and organize accordingly
        if path.endswith('.html') or path.endswith('.htm'):
            return self.output_dir / "html" / path.split('/')[-1]
        elif path.endswith('.js'):
            filename = path.split('/')[-1]
            # Service workers go to root, others to static/js
            if 'service-worker' in filename.lower() or 'sw.js' in filename.lower() or 'firebase-messaging' in filename.lower():
                return self.output_dir / filename
            return self.output_dir / "static" / "js" / filename
        elif path.endswith('.css'):
            filename = path.split('/')[-1]
            return self.output_dir / "static" / "css" / filename
        elif path.endswith('.json'):
            filename = path.split('/')[-1]
            if 'manifest' in filename.lower():
                return self.output_dir / filename
            return self.output_dir / "static" / filename
        elif any(path.endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico']):
            filename = path.split('/')[-1]
            # Icons go to icons folder, others to images
            if 'icon' in filename.lower() or 'favicon' in filename.lower():
                return self.output_dir / "static" / "icons" / filename
            return self.output_dir / "static" / "images" / filename
        else:
            # Preserve directory structure for other files
            parts = path.split('/')
            filename = parts[-1] if parts[-1] else 'index.html'
            if not filename or '.' not in filename:
                filename += default_ext
            return self.output_dir / filename
    
    def download_file(self, url, file_path):
        """Download a file and save it to the specified path."""
        if url in self.downloaded_urls:
            return True
        
        try:
            # Create parent directories
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            response = self.session.get(url, timeout=30, allow_redirects=True)
            response.raise_for_status()
            
            # Save file
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            self.downloaded_urls.add(url)
            print(f"  ✓ Downloaded: {url}")
            return True
            
        except Exception as e:
            print(f"  ✗ Failed: {url} - {str(e)}")
            self.failed_urls.append((url, str(e)))
            return False
    
    def extract_assets_from_html(self, html_content, base_url):
        """Extract all asset URLs from HTML content."""
        soup = BeautifulSoup(html_content, 'html.parser')
        assets = []
        
        # Find manifest
        manifest_link = soup.find('link', rel='manifest')
        if manifest_link and manifest_link.get('href'):
            assets.append(('manifest', urljoin(base_url, manifest_link['href'])))
        
        # Find all stylesheets
        for link in soup.find_all('link', rel='stylesheet'):
            if link.get('href'):
                assets.append(('css', urljoin(base_url, link['href'])))
        
        # Find all scripts
        for script in soup.find_all('script'):
            if script.get('src'):
                assets.append(('js', urljoin(base_url, script['src'])))
        
        # Find all images
        for img in soup.find_all('img'):
            if img.get('src'):
                assets.append(('image', urljoin(base_url, img['src'])))
            if img.get('srcset'):
                # Parse srcset
                for srcset_item in img['srcset'].split(','):
                    src_url = srcset_item.strip().split()[0]
                    assets.append(('image', urljoin(base_url, src_url)))
        
        # Find favicon
        favicon = soup.find('link', rel='icon') or soup.find('link', rel='shortcut icon')
        if favicon and favicon.get('href'):
            assets.append(('icon', urljoin(base_url, favicon['href'])))
        
        # Find apple-touch-icon
        apple_icon = soup.find('link', rel='apple-touch-icon')
        if apple_icon and apple_icon.get('href'):
            assets.append(('icon', urljoin(base_url, apple_icon['href'])))
        
        # Find meta images (og:image, twitter:image)
        for meta in soup.find_all('meta'):
            if meta.get('property') in ['og:image', 'twitter:image'] and meta.get('content'):
                assets.append(('image', urljoin(base_url, meta['content'])))
        
        # Find service worker registration in scripts
        for script in soup.find_all('script'):
            if script.string:
                # Look for service worker registration - more comprehensive patterns
                sw_patterns = [
                    r"register\(['\"]([^'\"]*\.js)['\"]",  # .register("file.js")
                    r"['\"]([^'\"]*service-worker[^'\"]*\.js)['\"]",  # service-worker.js
                    r"['\"]([^'\"]*sw\.js)['\"]",  # sw.js
                    r"['\"]([^'\"]*firebase-messaging-sw\.js)['\"]",  # firebase-messaging-sw.js
                    r"['\"]([^'\"]*pwabuilder[^'\"]*\.js)['\"]",  # pwabuilder-sw.js
                ]
                for pattern in sw_patterns:
                    sw_matches = re.findall(pattern, script.string, re.IGNORECASE)
                    for sw_url in sw_matches:
                        assets.append(('sw', urljoin(base_url, sw_url)))
        
        return assets
    
    def extract_assets_from_manifest(self, manifest_content, base_url):
        """Extract icon URLs from manifest.json."""
        assets = []
        try:
            manifest = json.loads(manifest_content)
            
            # Get icons
            if 'icons' in manifest:
                for icon in manifest['icons']:
                    if 'src' in icon:
                        assets.append(('icon', urljoin(base_url, icon['src'])))
            
            # Get start_url, scope if needed
            if 'start_url' in manifest:
                start_url = urljoin(base_url, manifest['start_url'])
                if start_url != base_url + '/' and start_url != base_url + '/index.html':
                    assets.append(('html', start_url))
                    
        except json.JSONDecodeError as e:
            print(f"  ⚠ Could not parse manifest.json: {e}")
        
        return assets
    
    def download_pwa(self):
        """Main method to download the entire PWA."""
        print(f"Downloading PWA from: {self.base_url}")
        print(f"Output directory: {self.output_dir}")
        print("=" * 60)
        
        # Step 1: Download main HTML
        print("\n[1/4] Downloading main HTML...")
        try:
            response = self.session.get(self.base_url, timeout=30)
            response.raise_for_status()
            html_content = response.text
            
            # Save HTML
            html_path = self.output_dir / "html" / "index.html"
            html_path.parent.mkdir(parents=True, exist_ok=True)
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print(f"  ✓ Saved: {html_path}")
            
        except Exception as e:
            print(f"  ✗ Failed to download main HTML: {e}")
            return
        
        # Step 2: Extract and download assets from HTML
        print("\n[2/4] Extracting assets from HTML...")
        assets = self.extract_assets_from_html(html_content, self.base_url)
        print(f"  Found {len(assets)} assets")
        
        # Download manifest first (it may contain more assets)
        manifest_url = None
        for asset_type, url in assets:
            if asset_type == 'manifest':
                manifest_url = url
                break
        
        if manifest_url:
            print(f"\n  Downloading manifest: {manifest_url}")
            manifest_path = self.get_file_path(manifest_url)
            if self.download_file(manifest_url, manifest_path):
                # If manifest is a PHP file but contains JSON, rename it to manifest.json
                if manifest_path.suffix == '.php':
                    try:
                        with open(manifest_path, 'r', encoding='utf-8') as f:
                            content = f.read().strip()
                            # Check if it's valid JSON
                            json.loads(content)
                            # It's JSON, rename to manifest.json
                            new_manifest_path = manifest_path.parent / "manifest.json"
                            with open(new_manifest_path, 'w', encoding='utf-8') as f:
                                f.write(content)
                            print(f"  ✓ Renamed {manifest_path.name} to manifest.json (contains JSON)")
                            manifest_path = new_manifest_path
                    except (json.JSONDecodeError, ValueError):
                        pass  # Not JSON, keep original name
                
                # Extract assets from manifest
                try:
                    with open(manifest_path, 'r', encoding='utf-8') as f:
                        manifest_content = f.read()
                    manifest_assets = self.extract_assets_from_manifest(manifest_content, self.base_url)
                    assets.extend(manifest_assets)
                    print(f"  Found {len(manifest_assets)} additional assets in manifest")
                except Exception as e:
                    print(f"  ⚠ Could not read manifest: {e}")
        
        # Step 3: Download all assets
        print("\n[3/4] Downloading assets...")
        for asset_type, url in assets:
            if url in self.downloaded_urls:
                continue
            
            normalized_url = self.normalize_url(url)
            file_path = self.get_file_path(normalized_url)
            
            # Small delay to be respectful
            time.sleep(0.1)
            self.download_file(normalized_url, file_path)
        
        # Step 4: Try to find service workers (common names)
        print("\n[4/4] Checking for service workers...")
        common_sw_names = [
            'service-worker.js',
            'sw.js',
            'firebase-messaging-sw.js',
            'serviceWorker.js',
            'ServiceWorker.js'
        ]
        
        for sw_name in common_sw_names:
            sw_url = urljoin(self.base_url + '/', sw_name)
            sw_path = self.output_dir / sw_name
            if sw_url not in self.downloaded_urls:
                self.download_file(sw_url, sw_path)
        
        # Summary
        print("\n" + "=" * 60)
        print("Download Summary:")
        print(f"  ✓ Successfully downloaded: {len(self.downloaded_urls)} files")
        print(f"  ✗ Failed: {len(self.failed_urls)} files")
        
        if self.failed_urls:
            print("\nFailed URLs:")
            for url, error in self.failed_urls[:10]:  # Show first 10
                print(f"  - {url}: {error}")
            if len(self.failed_urls) > 10:
                print(f"  ... and {len(self.failed_urls) - 10} more")
        
        print(f"\nFiles saved to: {self.output_dir.absolute()}")
        print("\nNext steps:")
        print("  1. Review the downloaded files")
        print("  2. Update paths in HTML/CSS/JS if needed")
        print("  3. Test the template locally")


def main():
    """Main entry point."""
    import sys
    
    # Default URL
    default_url = "https://bigbasssplashplaygame.com/"
    
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = default_url
    
    # Get output directory name from URL
    parsed_url = urlparse(url)
    domain = parsed_url.netloc.replace('www.', '').split('.')[0]
    output_dir = f"template_{domain}"
    
    downloader = PWADownloader(url, output_dir)
    downloader.download_pwa()


if __name__ == "__main__":
    main()

