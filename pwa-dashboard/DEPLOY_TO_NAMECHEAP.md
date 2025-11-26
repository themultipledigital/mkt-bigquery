# Deploying PWA Dashboard to Namecheap

## Prerequisites
- Namecheap hosting account with PHP support
- FTP/SFTP access credentials
- cPanel access (usually provided with Namecheap hosting)

## Step 1: Prepare Files

All files in the `pwa-dashboard` directory are ready for deployment. No changes needed.

## Step 2: Upload Files via FTP/SFTP

### Option A: Using FileZilla (Recommended)

1. **Download and install FileZilla** (if not already installed)
   - Download from: https://filezilla-project.org/

2. **Connect to your Namecheap FTP:**
   - Host: Usually `ftp.yourdomain.com` or your server IP
   - Username: Your cPanel username
   - Password: Your FTP password (from cPanel)
   - Port: 21 (or 22 for SFTP)

3. **Navigate to your domain folder:**
   - Usually `public_html/` or `public_html/yourdomain.com/`
   
   **Option 1: Deploy to root (main website)**
   - Upload all `pwa-dashboard` files directly to `public_html/`
   - Access at: `https://yourdomain.com/index.php`

   **Option 2: Deploy to subfolder (recommended)**
   - Create folder: `public_html/pwa-admin/`
   - Upload all `pwa-dashboard` files to `public_html/pwa-admin/`
   - Access at: `https://yourdomain.com/pwa-admin/index.php`

4. **Upload all files:**
   - Upload the entire contents of `pwa-dashboard` folder
   - Maintain the directory structure
   - This may take a few minutes depending on file sizes

### Option B: Using cPanel File Manager

1. **Log into cPanel**
2. **Open "File Manager"**
3. **Navigate to your domain folder:**
   - Usually `public_html/` or `public_html/yourdomain.com/`
4. **Create subfolder** (if using subfolder deployment):
   - Click "New Folder"
   - Name it `pwa-admin`
5. **Upload files:**
   - Click "Upload"
   - Select all files from `pwa-dashboard` directory
   - Or use "Extract" if uploading as ZIP file

## Step 3: Set Directory Permissions

### Via cPanel File Manager:
1. Navigate to `data/` folder
2. Right-click → "Change Permissions"
3. Set to `755` (or `777` if 755 doesn't work)
4. Repeat for `generated/` folder

### Via FTP:
- Set `data/` folder permissions to `755` or `777`
- Set `generated/` folder permissions to `755` or `777`

## Step 4: Verify PHP Requirements

Namecheap hosting typically includes:
- PHP 7.4+ ✅
- cURL extension ✅
- JSON extension ✅
- ZipArchive extension ✅

### Check PHP Version:
1. Create a test file `test.php` in your dashboard folder:
   ```php
   <?php phpinfo(); ?>
   ```
2. Access it via browser: `https://yourdomain.com/pwa-admin/test.php`
3. Check PHP version and extensions
4. **Delete `test.php` after checking** (security)

## Step 5: Configure (Optional)

### Set Environment Variables (if needed):

**For ChatGPT API:**
Create a `.htaccess` file in your dashboard root (if not exists) and add:
```apache
SetEnv OPENAI_API_KEY your-api-key-here
```

Or set in cPanel → PHP Configuration → Environment Variables

### Update Base Path (if in subfolder):
If deployed to subfolder, you may need to update paths in:
- `includes/header.php` (if using relative paths)
- `includes/functions.php` (if using absolute paths)

Currently, all paths are relative, so they should work correctly in subfolders.

## Step 6: Test Access

1. **Open your browser**
2. **Navigate to:**
   - Root deployment: `https://yourdomain.com/index.php`
   - Subfolder deployment: `https://yourdomain.com/pwa-admin/index.php`

3. **You should see:**
   - The PWA Dashboard login/home page
   - "My PWAs" list (initially empty)

## Step 7: Create Your First PWA

1. Click "New PWA" button
2. Fill in the configuration
3. Save and generate your first PWA!

## Security Recommendations

### 1. Add Authentication (Recommended)
Currently, there's no authentication. For production:
- Add a simple password protection via `.htaccess`
- Or implement user login system

### 2. Protect Data Directory
The `.htaccess` file already protects JSON files, but you can add:

```apache
# Deny direct access to data directory
<Directory "data">
    Order Deny,Allow
    Deny from all
</Directory>
```

### 3. Use HTTPS
Make sure SSL is enabled in cPanel for secure access.

## Troubleshooting

### "500 Internal Server Error"
- Check `.htaccess` file for errors
- Check PHP error logs in cPanel
- Verify file permissions

### "Cannot write to data directory"
- Set `data/` folder permissions to `777`
- Check if folder exists

### "Template not found"
- Verify `templates/` folder was uploaded
- Check folder permissions

### Files not loading (CSS/JS broken)
- Check if `assets/` folder was uploaded
- Verify file paths in browser console (F12)

## File Upload Checklist

Make sure these are uploaded:
- ✅ `index.php`
- ✅ `editor.php`
- ✅ `api/` folder (all PHP files)
- ✅ `includes/` folder (all PHP files)
- ✅ `templates/` folder (entire template directories)
- ✅ `assets/` folder (CSS, JS, images)
- ✅ `data/` folder (can be empty, but must exist)
- ✅ `generated/` folder (can be empty, but must exist)
- ✅ `.htaccess` file
- ✅ `README.md` (optional)

## Support

If you encounter issues:
1. Check cPanel error logs
2. Enable PHP error display temporarily
3. Verify all files were uploaded correctly
4. Check file permissions

