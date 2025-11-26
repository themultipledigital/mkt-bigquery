# Deploying to aztecslotgames.com

This guide covers deploying the PWA to your existing Namecheap-hosted website at `aztecslotgames.com`.

## Deployment Options

You have **3 main options** for deploying the PWA:

### Option 1: Deploy to Root (Replace/Add to Main Site) ⚠️
**Location:** `public_html/aztecslotgames.com/`
- The PWA files would be at the root of your domain
- **Access:** `https://aztecslotgames.com/index.html`
- **Pros:** Simple URLs, easy to access
- **Cons:** May conflict with existing site files

### Option 2: Deploy to Subfolder (Recommended) ✅
**Location:** `public_html/aztecslotgames.com/pwa/` or `/game/`
- The PWA files would be in a subfolder
- **Access:** `https://aztecslotgames.com/pwa/index.html`
- **Pros:** Keeps existing site intact, easy to manage
- **Cons:** Slightly longer URLs

### Option 3: Deploy to Subdomain 🆕
**Location:** `public_html/pwa.aztecslotgames.com/`
- The PWA would have its own subdomain
- **Access:** `https://pwa.aztecslotgames.com/`
- **Pros:** Clean separation, can use root URLs
- **Cons:** Requires subdomain setup in cPanel

## Recommended: Subfolder Deployment

For your existing site, **Option 2 (Subfolder)** is recommended. This keeps your existing site intact and makes management easier.

## Step-by-Step: Subfolder Deployment

### Step 1: Determine Your Current Folder Structure

Check your Namecheap file structure:

**Option A:** Domain-specific folder
```
public_html/
└── aztecslotgames.com/
    ├── index.php (or index.html - your existing site)
    ├── (your existing site files)
    └── pwa/ (we'll create this)
```

**Option B:** Domain is root
```
public_html/ (which is aztecslotgames.com)
├── index.php (your existing site)
├── (your existing site files)
└── pwa/ (we'll create this)
```

### Step 2: Update PWA Paths for Subfolder

If deploying to a subfolder, we need to update paths. I'll create a subfolder-ready version.

### Step 3: Upload Files

Upload all PWA files to your chosen location:
- **Subfolder:** Upload to `public_html/aztecslotgames.com/pwa/` (or `public_html/pwa/`)
- **Root:** Upload to `public_html/aztecslotgames.com/`

### Step 4: Update Manifest Scope (If Subfolder)

If using a subfolder, the manifest scope needs to be updated to `/pwa/` instead of `./`

## Quick Decision Guide

**Choose Subfolder if:**
- ✅ You want to keep your existing site unchanged
- ✅ You want separate management of the PWA
- ✅ You plan to have multiple games/apps

**Choose Root if:**
- ✅ You want this to be the main site
- ✅ You're replacing or adding alongside your existing site
- ✅ You want the simplest URLs

**Choose Subdomain if:**
- ✅ You want complete separation
- ✅ You're comfortable setting up DNS/cPanel subdomain

Let me know which option you prefer, and I'll provide the exact steps and path updates needed!

