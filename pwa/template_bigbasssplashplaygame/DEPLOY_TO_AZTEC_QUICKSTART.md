# Quick Start: Deploy to aztecslotgames.com

## Which Deployment Method?

Choose one:

### 🗂️ **Option 1: Subfolder (Recommended)**
**Best for:** Keeping your existing site unchanged
- Deploy to: `public_html/aztecslotgames.com/pwa/`
- Access: `https://aztecslotgames.com/pwa/index.html`
- ✅ Safe - won't affect existing site
- ✅ Easy to manage separately

### 📂 **Option 2: Root**
**Best for:** Making PWA the main site or alongside existing site
- Deploy to: `public_html/aztecslotgames.com/`
- Access: `https://aztecslotgames.com/index.html`
- ⚠️ May conflict with existing `index.php`
- ⚠️ Backup first!

---

## Quick Deployment Steps

### If Choosing Subfolder (Recommended):

1. **Connect via FTP/cPanel File Manager**

2. **Create folder:**
   - Navigate to `public_html/aztecslotgames.com/`
   - Create folder: `pwa`

3. **Upload all PWA files** to `public_html/aztecslotgames.com/pwa/`:
   ```
   ✓ index.html
   ✓ home.php
   ✓ 8dqCjkdMkv.php
   ✓ manifest.json
   ✓ pwabuilder-sw.js
   ✓ OneSignalSDKWorker.js
   ✓ favicon.ico
   ✓ static/ (entire folder with all subfolders)
   ```

4. **Test:**
   - Visit: `https://aztecslotgames.com/pwa/index.html`
   - Should see the install page
   - Visit: `https://aztecslotgames.com/pwa/home.php`
   - Should see the home page

### If Choosing Root:

1. **Backup your existing site first!**

2. **Upload all PWA files** to `public_html/aztecslotgames.com/`:
   - Same files as above
   - **Note:** If you have an existing `index.php`, decide:
     - Replace it with PWA `index.html`, OR
     - Rename PWA `index.html` to `pwa-install.html` to keep both

3. **Test:**
   - Visit: `https://aztecslotgames.com/index.html`
   - Visit: `https://aztecslotgames.com/home.php`

---

## Verification Checklist

After uploading:
- [ ] Files uploaded successfully
- [ ] Can access install page (`/index.html` or `/pwa/index.html`)
- [ ] Can access home page (`/home.php` or `/pwa/home.php`)
- [ ] No 404 errors in browser console
- [ ] No PHP errors
- [ ] PWA installs successfully
- [ ] Installed PWA opens correctly
- [ ] Service worker registers
- [ ] Icons load correctly

---

## Troubleshooting

### 404 Errors:
- **Check file paths** - verify all files uploaded correctly
- **Check folder structure** - must match exactly
- **Check permissions** - files should be 644, folders 755

### PHP Errors:
- **Check PHP version** - Namecheap typically has 7.4+ (sufficient)
- **Check extensions** - Enable cURL and JSON in cPanel → Select PHP Version
- **Check error logs** - cPanel → Error Log

### Icons Not Loading:
- **Check manifest.json** - icons use relative paths (`./static/...`) ✓ (already updated)
- **Verify static folder** - all icons should be in `static/icons/`

---

## Detailed Guides

- **Subfolder deployment:** See `docs/deployment/AZTEC_SUBFOLDER_SETUP.md`
- **Root deployment:** See `docs/deployment/AZTEC_ROOT_SETUP.md`
- **General Namecheap guide:** See `docs/deployment/NAMECHEAP_DEPLOYMENT_GUIDE.md`

---

## Current Configuration

✅ **Manifest updated** - Uses relative paths (works in root and subfolder)
✅ **Paths configured** - All asset paths use relative URLs (`./static/...`)
✅ **PHP ready** - `home.php` integrated with Adspect script
✅ **Service worker** - Configured for relative scope (`./`)

## Ready to Deploy!

1. Choose your deployment method (subfolder recommended)
2. Upload files to the chosen location
3. Test access URLs
4. Install PWA and verify

---

## Need Help?

- Check `docs/deployment/NAMECHEAP_DEPLOYMENT_GUIDE.md` for detailed instructions
- Verify PHP extensions are enabled (cURL, JSON)
- Ensure SSL is enabled (required for PWA)
- Check browser console for specific errors

