# Deploying to aztecslotgames.com Root

This guide covers deploying the PWA to the root of your existing domain.

## ⚠️ Important Notes

**Root deployment means the PWA files will be in the same directory as your existing site files.**
- Make sure you won't overwrite existing important files
- Backup your existing site before deploying
- Consider if `index.html` conflicts with your existing `index.php`

## Step 1: Check Your Current Structure

First, check what's currently in your domain folder:

**Via cPanel File Manager:**
1. Log into cPanel
2. Open File Manager
3. Navigate to `public_html/aztecslotgames.com/` (or `public_html/` if domain is root)

**Note the existing files:**
- Is there an `index.php` or `index.html`?
- What other important files exist?
- Can you safely add/replace files?

## Step 2: Backup Your Existing Site

**CRITICAL:** Backup before proceeding!

**Via cPanel:**
1. cPanel → Backup → Download a Full Website Backup
2. Or use FTP to download all files

## Step 3: Upload Strategy

You have two options:

### Option A: Replace Existing index (if safe)
- Upload PWA files directly
- The PWA `index.html` will be the new landing page
- Your existing site might become inaccessible unless you rename it

### Option B: Keep Existing Site + Add PWA
- Rename PWA `index.html` → `pwa-install.html` (or similar)
- Upload all other PWA files
- Users access PWA via `https://aztecslotgames.com/pwa-install.html`
- Your existing site remains at `index.php`

## Step 4: Upload Files

**If using FTP (FileZilla):**
```
public_html/aztecslotgames.com/
├── index.html          (or pwa-install.html)
├── home.php
├── 8dqCjkdMkv.php
├── manifest.json
├── pwabuilder-sw.js
├── OneSignalSDKWorker.js
├── favicon.ico
└── static/            (entire folder)
```

## Step 5: Update index.html (if renamed)

If you renamed `index.html` to `pwa-install.html`, you'll need to access it at:
`https://aztecslotgames.com/pwa-install.html`

The PWA will still install correctly.

## Step 6: Verify PHP Requirements

Ensure PHP extensions are enabled:
- cURL (required for Adspect)
- JSON (required for Adspect)

Via cPanel → Select PHP Version → Enable extensions

## Step 7: Test Deployment

1. Visit `https://aztecslotgames.com/index.html` (or your renamed file)
2. Visit `https://aztecslotgames.com/home.php`
3. Check browser console for errors
4. Install PWA and verify it works
5. Verify your existing site still works (if you kept it)

## Access URLs

- **Install page:** `https://aztecslotgames.com/index.html` (or renamed file)
- **Home page:** `https://aztecslotgames.com/home.php`
- **Manifest:** `https://aztecslotgames.com/manifest.json`

