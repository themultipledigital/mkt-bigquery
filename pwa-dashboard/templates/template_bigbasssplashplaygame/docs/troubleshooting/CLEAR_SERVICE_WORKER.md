# Clear Service Worker Cache

The service worker is causing "Failed to fetch" errors. Follow these steps to clear it:

## Method 1: Chrome DevTools (Recommended)

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. In the left sidebar, click **Service Workers**
4. Click **Unregister** for any registered service workers
5. Go to **Storage** → **Clear site data**
6. Check all boxes and click **Clear site data**
7. Refresh the page (Ctrl+Shift+R)

## Method 2: Chrome Settings

1. Go to `chrome://settings/clearBrowserData`
2. Select "Cached images and files" and "Cookies and other site data"
3. Time range: "All time"
4. Click **Clear data**
5. Refresh the page

## Method 3: Incognito Mode

Simply open the page in an incognito/private window - service workers won't be active there.

## After Clearing

The service worker is now disabled in the code for local development. After clearing the cache, the page should load properly without the "Failed to fetch" errors.

