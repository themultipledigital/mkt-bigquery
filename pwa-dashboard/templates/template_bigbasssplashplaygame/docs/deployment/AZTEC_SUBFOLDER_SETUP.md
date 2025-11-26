# Deploying to aztecslotgames.com/pwa/ (Subfolder)

This guide covers deploying the PWA to a subfolder on your existing Namecheap site.

## Step 1: Prepare Files for Subfolder Deployment

The files are mostly ready, but we need to update the manifest.json for subfolder paths.

## Step 2: Upload Structure

Upload files maintaining this structure:

```
public_html/
└── aztecslotgames.com/        (your existing site)
    ├── index.php              (your existing site)
    ├── (your existing files)
    └── pwa/                   ← Create this folder
        ├── index.html
        ├── home.php
        ├── 8dqCjkdMkv.php
        ├── manifest.json
        ├── pwabuilder-sw.js
        ├── OneSignalSDKWorker.js
        ├── favicon.ico
        └── static/
            ├── css/
            ├── js/
            ├── icons/
            ├── images/
            └── home/
                ├── css/
                └── images/
```

## Step 3: Update manifest.json for Subfolder

After uploading, edit `pwa/manifest.json` and update the icon paths:

**Change from:**
```json
"src": "/static/icons/icon-192x192.png",
```

**Change to:**
```json
"src": "./static/icons/icon-192x192.png",
```

Do this for all 3 icon entries (lines 15, 21, 27).

## Step 4: Access URLs

After deployment:
- **Install page:** `https://aztecslotgames.com/pwa/index.html`
- **Home page:** `https://aztecslotgames.com/pwa/home.php`
- **PWA install:** Users install from the `/pwa/` URL

## Step 5: Update index.html Redirect

The `index.html` redirects to `./home.php` which will work correctly in the subfolder.

## Verification Checklist

After uploading:
- [ ] Visit `https://aztecslotgames.com/pwa/index.html` - should load
- [ ] Visit `https://aztecslotgames.com/pwa/home.php` - should load
- [ ] Check browser console for any 404 errors
- [ ] Install PWA and verify it opens correctly
- [ ] Verify icons load (check manifest in DevTools)

