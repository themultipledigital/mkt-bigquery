# Fix Broken PWA After Installation

## The Problem

When you install the PWA, it may show a broken page because:
1. **Old cache**: Service worker cached the old/broken version
2. **Cache version**: Need to update cache version to force refresh

## Solution Applied

### 1. Updated Service Worker
- Changed cache name to `pwabuilder-offline-v1.0.1` (forces new cache)
- Changed strategy from `StaleWhileRevalidate` to `NetworkFirst` (gets fresh content first)
- Added cache cleanup on activation (deletes old caches)

### 2. Fixed Flickering
- Added smooth opacity transition
- Body becomes visible as soon as DOM is ready (not waiting for full page load)

## How to Fix Your Installed PWA

### Option 1: Clear App Data (Recommended)
**Android:**
1. Settings → Apps → [Your PWA Name]
2. Storage → Clear Data
3. Uninstall and reinstall

**iOS:**
1. Settings → Safari → Clear History and Website Data
2. Delete the app
3. Reinstall from browser

### Option 2: Force Service Worker Update
1. Open the installed PWA
2. Open browser DevTools (if possible)
3. Go to Application → Service Workers
4. Click "Unregister"
5. Close and reopen the app

### Option 3: Redeploy with Updated Files
1. The service worker has been updated with new cache version
2. Redeploy to Netlify
3. The new version will automatically clear old cache

## After Redeploying

The updated service worker will:
- ✅ Create a new cache (old cache won't interfere)
- ✅ Use NetworkFirst strategy (gets fresh content)
- ✅ Automatically delete old caches

Users who already installed will need to:
- Clear app data, OR
- Wait for service worker to update (may take a few visits)

## Testing

1. **Clear your browser cache** for the Netlify site
2. **Uninstall the old PWA** from your device
3. **Redeploy** the updated files to Netlify
4. **Reinstall** the PWA
5. **Test** - should work correctly now!

