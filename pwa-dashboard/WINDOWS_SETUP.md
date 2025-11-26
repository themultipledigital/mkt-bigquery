# Windows Setup Guide for PWA Dashboard

## Option 1: Install PHP on Windows (Recommended)

### Quick Installation with XAMPP

1. **Download XAMPP:**
   - Visit: https://www.apachefriends.org/download.html
   - Download XAMPP for Windows (PHP 7.4+ or 8.x)

2. **Install XAMPP:**
   - Run the installer
   - Install to default location: `C:\xampp`
   - Select PHP, Apache, and MySQL components

3. **Start XAMPP:**
   - Open XAMPP Control Panel
   - Click "Start" next to Apache

4. **Access Dashboard:**
   - Copy the `pwa-dashboard` folder to: `C:\xampp\htdocs\`
   - Rename it to `pwa-dashboard` (if not already)
   - Open browser: **http://localhost/pwa-dashboard/index.php**

### Alternative: Install PHP Manually

1. **Download PHP:**
   - Visit: https://windows.php.net/download/
   - Download PHP 7.4+ or 8.x (Thread Safe, ZIP package)

2. **Extract PHP:**
   - Extract to: `C:\php`
   - Add `C:\php` to your Windows PATH:
     - Right-click "This PC" → Properties
     - Advanced System Settings → Environment Variables
     - Under "System Variables", find "Path" → Edit
     - Add: `C:\php`

3. **Configure PHP:**
   - Copy `php.ini-development` to `php.ini` in `C:\php`
   - Edit `php.ini` and enable these extensions:
     ```ini
     extension=curl
     extension=openssl
     extension=mbstring
     extension=zip
     ```

4. **Restart PowerShell** and try again:
   ```powershell
   cd pwa-dashboard
   php -S localhost:8000
   ```

---

## Option 2: Use Laragon (Easy Alternative)

1. **Download Laragon:**
   - Visit: https://laragon.org/download/
   - Download and install Laragon

2. **Copy Dashboard:**
   - Copy `pwa-dashboard` folder to: `C:\laragon\www\`

3. **Start Laragon:**
   - Open Laragon
   - Click "Start All"

4. **Access Dashboard:**
   - Open: **http://pwa-dashboard.test** or **http://localhost/pwa-dashboard/index.php**

---

## Option 3: Deploy Directly to Namecheap (No Local Setup Needed)

If you prefer not to install PHP locally, you can deploy directly to Namecheap:

1. **Use FileZilla** (or cPanel File Manager)
2. **Upload all files** from `pwa-dashboard/` to Namecheap
3. **Access via browser** at your domain

See `DEPLOY_TO_NAMECHEAP.md` for detailed instructions.

---

## Option 4: Use Docker (Advanced)

If you have Docker installed:

1. **Create `docker-compose.yml`** in `pwa-dashboard/`:
   ```yaml
   version: '3.8'
   services:
     web:
       image: php:7.4-apache
       ports:
         - "8000:80"
       volumes:
         - .:/var/www/html
       working_dir: /var/www/html
   ```

2. **Run:**
   ```powershell
   docker-compose up
   ```

3. **Access:** http://localhost:8000

---

## Quick Test: Verify PHP Installation

After installing PHP, verify it works:
```powershell
php -v
```

You should see PHP version information.

---

## Recommended: Use XAMPP

**XAMPP is the easiest option for Windows:**
- ✅ One-click installation
- ✅ Includes Apache and PHP
- ✅ No PATH configuration needed
- ✅ Perfect for local development

**Steps:**
1. Install XAMPP
2. Copy `pwa-dashboard` to `C:\xampp\htdocs\`
3. Start Apache from XAMPP Control Panel
4. Access: **http://localhost/pwa-dashboard/index.php**

---

## Need Help?

If you encounter issues:
- Check that Apache is running in XAMPP
- Verify folder permissions (usually not an issue on Windows)
- Check XAMPP error logs if needed

