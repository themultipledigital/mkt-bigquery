# Deploy PWA Dashboard to Namecheap - Quick Steps

## Prerequisites

- ✅ Namecheap hosting account (you mentioned you have this)
- ✅ cPanel access or FTP credentials
- ✅ Domain name configured

## Step-by-Step Deployment

### Step 1: Log into cPanel

1. Go to your Namecheap account
2. Click on **"Manage"** for your hosting account
3. Find **"cPanel"** or **"cPanel Admin"** button
4. Log into cPanel

### Step 2: Open File Manager

1. In cPanel, find **"File Manager"** icon
2. Click to open

### Step 3: Navigate to Your Domain Folder

**Option A: Domain-specific folder (if you have one)**
- Navigate to: `public_html/yourdomain.com/`

**Option B: Root folder**
- Navigate to: `public_html/`

**Option C: Create subfolder (Recommended)**
- In `public_html/`, click **"New Folder"**
- Name it: `pwa-admin` (or `pwa-dashboard`)
- Enter the new folder

### Step 4: Upload Files

**Method 1: Upload via File Manager**

1. Click **"Upload"** button in File Manager
2. Select all files from your `pwa-dashboard` folder on your computer
3. Upload all files (this may take a few minutes)
4. **Maintain folder structure:**
   - Upload `api/` folder with all files
   - Upload `includes/` folder with all files
   - Upload `assets/` folder with all files
   - Upload `templates/` folder with all files
   - Upload all `.php` files from root
   - Upload `.htaccess` file

**Method 2: Upload via FTP (Faster for many files)**

1. Download **FileZilla**: https://filezilla-project.org/
2. Get FTP credentials from cPanel:
   - Go to cPanel → **"FTP Accounts"**
   - Note: Host, Username, Password
3. Connect with FileZilla:
   - Host: Usually `ftp.yourdomain.com` or server IP
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21
4. Navigate to `public_html/pwa-admin/` (or your chosen folder)
5. Drag and drop all `pwa-dashboard` files from your computer
6. Wait for upload to complete

### Step 5: Create Required Folders

In File Manager, make sure these folders exist:
- `data/` (for storing PWA configurations)
- `generated/` (for generated PWAs)

If they don't exist:
1. Click **"New Folder"**
2. Create: `data`
3. Create: `generated`

### Step 6: Set Folder Permissions

**For `data/` folder:**
1. Right-click `data/` folder
2. Click **"Change Permissions"** or **"CHMOD"**
3. Set to: **`755`** (if that doesn't work, try **`777`**)
4. Click **"Change Permissions"**

**For `generated/` folder:**
1. Right-click `generated/` folder
2. Click **"Change Permissions"**
3. Set to: **`755`** (if that doesn't work, try **`777`**)
4. Click **"Change Permissions"**

**Note:** `777` is more permissive (works better for write operations) but slightly less secure. For this application, `777` is fine.

### Step 7: Access Your Dashboard

**If deployed to subfolder (`pwa-admin`):**
```
https://yourdomain.com/pwa-admin/index.php
```

**If deployed to root:**
```
https://yourdomain.com/index.php
```

### Step 8: Test

1. Open your browser
2. Navigate to the URL above
3. You should see the PWA Dashboard!

### Step 9: Create Your First PWA

1. Click **"New PWA"** button
2. Fill in the details
3. Click **"Save"**
4. Click **"Generate"** to create PWA files
5. Download the ZIP file

---

## Troubleshooting

### "500 Internal Server Error"

**Check these:**
1. Verify `.htaccess` file was uploaded
2. Check folder permissions (`data/` and `generated/` should be `755` or `777`)
3. View error logs in cPanel → **"Error Log"**

### "Cannot write to data directory"

**Fix:**
1. Set `data/` folder permissions to **`777`**
2. Make sure folder exists
3. Check if folder is empty (should be okay)

### "Template not found"

**Fix:**
1. Verify `templates/` folder was uploaded
2. Check that `templates/template_bigbasssplashplaygame/` exists
3. Verify folder structure is intact

### CSS/JavaScript not loading

**Fix:**
1. Check that `assets/` folder was uploaded
2. Verify file paths in browser console (F12)
3. Make sure files exist in `assets/css/` and `assets/js/`

### Blank page

**Fix:**
1. Enable error display temporarily:
   - Add to top of `index.php`:
   ```php
   <?php error_reporting(E_ALL); ini_set('display_errors', 1); ?>
   ```
2. Check what error appears
3. Fix the issue
4. Remove the error display code

---

## File Upload Checklist

Make sure all these are uploaded:

```
✅ index.php
✅ editor.php
✅ api/ (entire folder)
   ✅ save-pwa.php
   ✅ generate-pwa.php
   ✅ delete-pwa.php
   ✅ download-pwa.php
   ✅ chatgpt.php
   ✅ scrape-appstore.php
   ✅ scrape-playstore.php
✅ includes/ (entire folder)
   ✅ functions.php
   ✅ template-engine.php
   ✅ header.php
   ✅ sidebar.php
   ✅ topbar.php
   ✅ footer.php
   ✅ editor/ (entire folder with all component files)
✅ assets/ (entire folder)
   ✅ css/
   ✅ js/
   ✅ images/
✅ templates/ (entire folder)
   ✅ template_bigbasssplashplaygame/ (entire template)
✅ data/ (folder - can be empty)
✅ generated/ (folder - can be empty)
✅ .htaccess
✅ README.md (optional)
```

---

## Security Note

After deployment, consider adding password protection:
- Use cPanel → **"Password Protect Directories"**
- Protect the `pwa-admin` folder
- Set username and password

---

## Success!

Once you see the dashboard, you're all set! 🎉

If you encounter any issues, check the troubleshooting section above or review the error logs in cPanel.

