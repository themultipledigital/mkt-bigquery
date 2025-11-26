# OneSignal Service Worker Configuration

## Your Current Service Worker Setup

Based on your code in `index.html`:
```javascript
navigator.serviceWorker.register("./pwabuilder-sw.js", { scope: "./" })
```

## OneSignal Service Worker Settings

When configuring OneSignal, use these exact values:

### Main Service Worker File Name
**Value**: `pwabuilder-sw.js`

**Explanation**: 
- This is the filename of your service worker
- Located in the root directory of your site
- OneSignal will integrate with this existing service worker

### Service Worker Registration Scope
**Value**: `/`

**Explanation**:
- Your code uses `scope: "./"` which means root scope
- In OneSignal, this should be entered as `/` (root path)
- This means the service worker controls the entire site

### Service Worker Path
**Value**: `/pwabuilder-sw.js`

**Explanation**:
- Full path to your service worker file
- Starts with `/` because it's in the root directory
- OneSignal needs this to know where to find your service worker

### Service Worker Update Path
**Value**: `/pwabuilder-sw.js` (same as above)

**Explanation**:
- Same as Service Worker Path
- Used for updating the service worker

### HTTP Service Worker Path
**Value**: Leave empty

**Explanation**:
- Not needed since you're using HTTPS (Netlify provides this)
- Only needed if you have HTTP fallback

## Complete OneSignal Service Worker Configuration

When you see the "Customize service worker paths and filenames" section:

1. **Main Service Worker File Name**: `pwabuilder-sw.js`
2. **Service Worker Registration Scope**: `/`
3. **Service Worker Path**: `/pwabuilder-sw.js`
4. **Service Worker Update Path**: `/pwabuilder-sw.js`
5. **HTTP Service Worker Path**: (leave empty)

## Why These Values?

- **File Name**: Your service worker is named `pwabuilder-sw.js`
- **Scope**: Your registration uses `scope: "./"` which equals `/` (root)
- **Path**: The file is in the root directory, so path is `/pwabuilder-sw.js`

## Important Notes

✅ **OneSignal Integration**: OneSignal will automatically integrate with your existing `pwabuilder-sw.js` service worker. You don't need to modify it.

✅ **No Conflicts**: OneSignal's service worker code will work alongside your Workbox service worker code.

✅ **Automatic Updates**: OneSignal will handle push notification functionality through your existing service worker.

## Verification

After configuration, you can verify:
1. Visit your Netlify site
2. Open DevTools → Application → Service Workers
3. You should see `pwabuilder-sw.js` registered
4. OneSignal functionality will be integrated automatically

## Troubleshooting

**If OneSignal doesn't work:**
- Verify the service worker file name matches exactly: `pwabuilder-sw.js`
- Check that scope is set to `/` (root)
- Make sure the path is `/pwabuilder-sw.js` (with leading slash)
- Clear browser cache and service worker, then reload

