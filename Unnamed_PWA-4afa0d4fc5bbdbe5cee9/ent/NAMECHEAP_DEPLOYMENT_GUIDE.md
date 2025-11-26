# Namecheap Deployment Guide

This guide walks you through deploying the PWA to Namecheap hosting.

## Prerequisites

- Namecheap hosting account with PHP support
- FTP/SFTP access credentials
- Domain name configured
- SSL certificate enabled (required for PWA)

## Step 1: Prepare Files

All files should be uploaded maintaining the same directory structure as your local project.

## Step 2: Upload Files via FTP/SFTP

### Required Files and Folders:

```
public_html/
├── index.html                 (Install page - shown to non-installed users)
├── home.php                   (Home page - shown to installed PWA users)
├── 8dqCjkdMkv.php            (Adspect integration script)
├── manifest.json              (PWA manifest)
├── pwabuilder-sw.js          (Service worker)
├── OneSignalSDKWorker.js     (OneSignal service worker)
├── netlify.toml              (Not needed for Namecheap, can be deleted)
├── favicon.ico               
├── static/
│   ├── css/
│   ├── js/
│   ├── icons/
│   ├── images/
│   └── home/
│       ├── css/
│       └── images/
└── (other files as needed)
```

### Upload Method:

1. **Using FileZilla or similar FTP client:**
   - Connect to your Namecheap FTP server
   - Navigate to `public_html/` (or your domain's root directory)
   - Upload all files maintaining the directory structure

2. **Using cPanel File Manager:**
   - Log into cPanel
   - Open "File Manager"
   - Navigate to `public_html/`
   - Upload files (you may need to extract ZIP files if uploading in bulk)

## Step 3: Verify PHP Requirements

Namecheap shared hosting typically includes:
- PHP 7.4+ (should be sufficient)
- cURL extension (required for Adspect)
- JSON extension (required for Adspect)

### Check PHP Version:

1. Create a test file `phpinfo.php`:
   ```php
   <?php phpinfo(); ?>
   ```

2. Upload it to `public_html/phpinfo.php`
3. Visit `https://yourdomain.com/phpinfo.php`
4. Check for:
   - PHP version (should be 7.4+)
   - cURL extension enabled
   - JSON extension enabled

5. **Delete `phpinfo.php` after checking** (security best practice)

### Enable Required PHP Extensions (if needed):

If cURL or JSON are missing:

1. Go to cPanel → Select PHP Version
2. Enable extensions:
   - `curl`
   - `json`
3. Click "Save"

## Step 4: Configure SSL/HTTPS

PWAs **require HTTPS**. Namecheap hosting includes free SSL certificates.

### Enable SSL:

1. **Using cPanel:**
   - Go to cPanel → SSL/TLS Status
   - Find your domain
   - Click "Run AutoSSL" or install a free Let's Encrypt certificate

2. **Wait for certificate activation** (usually 5-10 minutes)

3. **Force HTTPS redirect** (optional but recommended):
   - Go to cPanel → Redirects
   - Create redirect from HTTP to HTTPS
   - Or add to `.htaccess`:
     ```apache
     RewriteEngine On
     RewriteCond %{HTTPS} off
     RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
     ```

## Step 5: Verify File Permissions

Set correct file permissions:

- **Files:** `644` or `644` (readable by web server)
- **Directories:** `755` (executable by web server)
- **PHP files:** `644` (same as regular files)

Using cPanel File Manager:
- Right-click files/folders → Change Permissions
- Or use FTP client to set permissions

## Step 6: Test the Deployment

### 1. Test Install Page:
   - Visit `https://yourdomain.com/index.html`
   - Should show the install/landing page

### 2. Test Home Page (PHP):
   - Visit `https://yourdomain.com/home.php`
   - Should show the installed PWA home page
   - Check browser console for any PHP errors

### 3. Test PWA Installation:
   - Open `https://yourdomain.com/index.html` in mobile browser
   - Install the PWA
   - Launch installed PWA
   - Should redirect to `home.php` automatically

### 4. Test Service Worker:
   - Open browser DevTools → Application tab
   - Check Service Workers section
   - Should show `pwabuilder-sw.js` as registered

### 5. Test OneSignal:
   - Check browser console for OneSignal initialization
   - Should prompt for push notification permission (if configured)

## Step 7: Troubleshooting

### PHP Errors:

1. **Check error logs:**
   - cPanel → Error Log
   - Look for PHP warnings/errors

2. **Enable error display temporarily** (for debugging only):
   - In `home.php`, temporarily change:
     ```php
     ini_set('display_errors', '1');
     ```

### 404 Errors:

1. **Check file paths:**
   - Verify all files uploaded correctly
   - Check `static/` folder structure

2. **Check `.htaccess` (if exists):**
   - May need to allow PHP execution
   - Verify rewrite rules don't interfere

### Adspect Not Working:

1. **Check cURL:**
   - Verify cURL extension enabled
   - Test with `phpinfo.php`

2. **Check network:**
   - Ensure `rpc.adspect.net` is reachable
   - Some hosts block external connections

3. **Check SID:**
   - Verify `$ADSPECT_DEFAULT_SID` in `8dqCjkdMkv.php`
   - Should match your Adspect configuration

### Service Worker Issues:

1. **Check HTTPS:**
   - Service workers require HTTPS
   - Verify SSL certificate active

2. **Clear cache:**
   - Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
   - Clear browser cache

3. **Check scope:**
   - Service worker scope should be `./`
   - Verify `pwabuilder-sw.js` in root

## Step 8: Production Checklist

- [ ] All files uploaded with correct structure
- [ ] PHP version 7.4+ confirmed
- [ ] cURL and JSON extensions enabled
- [ ] SSL certificate installed and active
- [ ] HTTPS redirect configured
- [ ] File permissions set correctly (644/755)
- [ ] `index.html` loads correctly
- [ ] `home.php` loads correctly
- [ ] PWA installs successfully
- [ ] Installed PWA redirects to `home.php`
- [ ] Service worker registers
- [ ] OneSignal initializes
- [ ] No console errors
- [ ] Tested on mobile device
- [ ] `phpinfo.php` deleted (if created)

## Additional Configuration

### Set Default Directory Index:

In `.htaccess` (create if doesn't exist):

```apache
DirectoryIndex index.html index.php
```

### Cache Control (Optional):

Add to `.htaccess` for better caching:

```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

## Support Resources

- **Namecheap Knowledge Base:** https://www.namecheap.com/support/
- **cPanel Documentation:** https://cpanel.net/docs/
- **PHP Requirements:** Check `phpinfo.php` output

## Notes

- The `netlify.toml` file is specific to Netlify and can be ignored on Namecheap
- Keep `home.php` (not `home.html`) as the installed PWA entry point
- Ensure Adspect SID matches your configuration in `8dqCjkdMkv.php`
- Test thoroughly before going live with real traffic

