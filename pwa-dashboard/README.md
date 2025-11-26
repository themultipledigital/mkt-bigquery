# PWA Management System

A comprehensive web interface for managing and generating Progressive Web Apps (PWAs) from templates.

## Features

- **Dashboard**: List, filter, and search PWAs
- **Editor**: Comprehensive PWA configuration interface with multiple tabs
- **Template System**: Support for multiple PWA templates
- **Generation**: Create PWA files from templates with custom data
- **External APIs**: ChatGPT integration, App Store/Play Store scraping
- **Export**: Download generated PWAs as ZIP files

## Installation

1. Copy all files to your web server (PHP 7.4+ required)
2. Ensure `data/` and `generated/` directories are writable
3. Access via web browser

## Configuration

### ChatGPT API (Optional)

To enable ChatGPT integration for auto-generating descriptions and comments:

1. Get an OpenAI API key
2. Set environment variable:
   ```bash
   export OPENAI_API_KEY=your-api-key-here
   ```
   Or add to `.htaccess` or PHP configuration

### OneSignal (Optional)

Configure OneSignal App ID in the editor's Push Notifications tab for push notifications support.

## Usage

1. **Create a new PWA**: Click "New PWA" button on dashboard
2. **Configure PWA**: Fill in all details in the editor
3. **Copy from Store** (Optional): Use "Copy from App Store" or "Copy from Google Play" buttons
4. **Generate Description/Comments** (Optional): Use ChatGPT integration
5. **Generate PWA**: Click "Generate" button to create PWA files
6. **Download**: Download generated PWA as ZIP file for deployment

## File Structure

```
pwa-dashboard/
├── index.php                 # Main dashboard
├── editor.php                # PWA editor
├── api/
│   ├── save-pwa.php          # Save PWA configuration
│   ├── generate-pwa.php      # Generate PWA from template
│   ├── delete-pwa.php        # Delete PWA
│   ├── download-pwa.php      # Download generated PWA
│   ├── chatgpt.php           # ChatGPT API integration
│   ├── scrape-appstore.php   # App Store scraping
│   └── scrape-playstore.php  # Play Store scraping
├── templates/
│   └── template_bigbasssplashplaygame/  # PWA templates
├── generated/                # Generated PWA files (temp)
├── data/
│   └── pwas.json            # PWA configurations storage
├── includes/
│   ├── functions.php        # Core functions
│   ├── template-engine.php  # Template processing engine
│   ├── header.php
│   ├── sidebar.php
│   ├── topbar.php
│   └── editor/
│       └── (editor components)
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── README.md
```

## Templates

Templates are stored in `templates/` directory. Each template should have:
- `index.html` or `home.php` - Main entry point
- `manifest.json` - PWA manifest
- `pwabuilder-sw.js` - Service worker
- `static/` - Static assets (CSS, JS, images, icons)

## Data Storage

PWAs are stored in JSON format in `data/pwas.json`. This can be easily migrated to MySQL/PostgreSQL if needed.

## Notes

- Generated PWAs are stored temporarily in `generated/` directory
- ZIP files are created on-demand and deleted after download
- Make sure PHP has write permissions for `data/` and `generated/` directories
- For production, consider adding authentication

