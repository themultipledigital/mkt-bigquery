# Quick Deployment Checklist

## ✅ Changes Made

- [x] Converted `home.html` to `home.php`
- [x] Integrated Adspect script (`8dqCjkdMkv.php`)
- [x] Updated `index.html` to redirect to `home.php` instead of `home.html`
- [x] Verified `manifest.json` already has `start_url: "./home.php"`

## 📤 Files to Upload to Namecheap

### Required Files:
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

### Optional/Cleanup:
```
- netlify.toml (can delete - not needed for Namecheap)
```

## 🔧 Pre-Deployment Steps

1. **Verify PHP Version:** Namecheap typically has PHP 7.4+ (sufficient)
2. **Enable Extensions:** Ensure cURL and JSON are enabled in cPanel
3. **SSL Certificate:** Install/activate SSL (required for PWA)
4. **Set Permissions:** Files = 644, Folders = 755

## 🧪 Post-Deployment Testing

1. [ ] `https://yourdomain.com/index.html` loads (install page)
2. [ ] `https://yourdomain.com/home.php` loads (home page)
3. [ ] No PHP errors in browser console
4. [ ] PWA installs successfully
5. [ ] Installed PWA opens `home.php` automatically
6. [ ] Service worker registers
7. [ ] OneSignal prompts for notifications
8. [ ] Adspect integration works (check network requests)

## 📋 Configuration to Verify

- **Adspect SID:** Should match `$ADSPECT_DEFAULT_SID` in `8dqCjkdMkv.php`
- **OneSignal App ID:** Verify in `home.php` (line ~60)
- **Asset Paths:** All paths use relative `./static/` (should work)

## 🚀 Quick Upload Commands (if using CLI)

```bash
# Using SFTP (recommended)
sftp username@yourdomain.com
put -r pwa/template_bigbasssplashplaygame/* /public_html/

# Using rsync over SSH
rsync -avz --exclude 'node_modules' \
  pwa/template_bigbasssplashplaygame/ \
  username@yourdomain.com:/public_html/
```

## 📖 Full Guide

See `docs/deployment/NAMECHEAP_DEPLOYMENT_GUIDE.md` for detailed instructions.

