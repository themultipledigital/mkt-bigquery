# PWA Template Downloader

This script downloads all files from a live PWA website to create a local template that can be used with the Cloudflare Worker.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r ../requirements.txt
   ```

## Usage

### Basic Usage (uses default URL)
```bash
python download_pwa_template.py
```

### Custom URL
```bash
python download_pwa_template.py https://bigbasssplashplaygame.com/
```

## What It Does

The script will:

1. **Download the main HTML file** (`index.html`)
2. **Parse HTML** to find all referenced assets:
   - CSS stylesheets
   - JavaScript files
   - Images
   - Icons (favicon, apple-touch-icon)
   - Manifest.json
   - Service workers
3. **Download manifest.json** and extract icon URLs from it
4. **Download all assets** and organize them in a structured folder:
   ```
   template_[domain]/
   ├── html/
   │   └── index.html
   ├── static/
   │   ├── js/
   │   ├── css/
   │   ├── images/
   │   └── icons/
   ├── manifest.json
   ├── service-worker.js (if found)
   └── firebase-messaging-sw.js (if found)
   ```

## Output Structure

The downloaded files are organized to match the Cloudflare Worker's expected structure:
- **HTML files** → `html/` directory
- **Service workers** → Root directory (for easy access)
- **Manifest** → Root directory
- **JavaScript** → `static/js/`
- **CSS** → `static/css/`
- **Images** → `static/images/`
- **Icons** → `static/icons/`

## Notes

- The script respects rate limits with small delays between downloads
- Failed downloads are logged and shown in the summary
- All URLs are normalized (relative → absolute)
- Directory structure is preserved where possible

## Next Steps

After downloading:

1. Review the downloaded files in the `template_[domain]` folder
2. Update any hardcoded URLs in HTML/CSS/JS files if needed
3. Test the template locally
4. Deploy to Firebase Storage or your hosting service
5. Configure the Cloudflare Worker to serve from the correct paths

