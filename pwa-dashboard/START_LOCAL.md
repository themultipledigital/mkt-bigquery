# Running PWA Dashboard Locally

## Prerequisites
- PHP 7.4 or higher installed
- Command line/terminal access

## Quick Start

1. **Open terminal/command prompt** in the `pwa-dashboard` directory

2. **Start PHP built-in server:**
   ```bash
   php -S localhost:8000
   ```
   (For Windows PowerShell, use the same command)

3. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

## Alternative Ports

If port 8000 is busy, use a different port:
```bash
php -S localhost:8080
```

Then access at: `http://localhost:8080`

## Directory Permissions

Make sure these directories are writable:
- `data/` - For storing PWA configurations
- `generated/` - For generated PWA files

On Windows, these should work automatically. On Linux/Mac, you may need to set permissions:
```bash
chmod 755 data generated
```

## Troubleshooting

**Port already in use:**
- Try a different port (8080, 3000, 5000, etc.)

**PHP not found:**
- Make sure PHP is installed and in your PATH
- Check with: `php -v`

**Cannot write to data directory:**
- Check directory permissions
- On Windows, make sure you have write access to the folder

