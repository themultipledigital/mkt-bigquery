# PWA Deployment Checklist

## ✅ Completed Setup

- [x] **Icons**: All sizes created (192x192, 384x384, 512x512)
- [x] **Manifest**: Updated with all icon sizes and screenshots
- [x] **Netlify Config**: `netlify.toml` created with proper redirects and caching
- [x] **Service Worker**: Ready (currently disabled for local dev)
- [x] **OneSignal**: Configured (needs your App ID)
- [x] **Google Translate**: Kept but won't break if unavailable

## 📋 Pre-Deployment Checklist

### 1. Re-enable Service Worker (REQUIRED for production)

Before deploying, edit `index.html` and replace the service worker section (lines 26-54) with:

```javascript
<script type="module">
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./pwabuilder-sw.js", { scope: "./" })
      .then(function (reg) {
        console.log('Service worker registered:', reg);
      })
      .catch(function(err) {
        console.error('Service worker registration failed:', err);
      });
  }
</script>
```

### 2. Update OneSignal App ID (REQUIRED)

1. Get your OneSignal App ID (see `ONESIGNAL_SETUP.md`)
2. In `index.html`, find line ~897 and replace:
   ```javascript
   appId: "a12bf87b-b0db-4e4e-b145-8f18e94d397a",  // Replace with your App ID
   ```

### 3. Deploy to Netlify

See `DEPLOY_TO_NETLIFY.md` for detailed instructions.

**Quick method**: Drag the `template_bigbasssplashplaygame` folder to https://app.netlify.com

## 📁 File Structure

```
template_bigbasssplashplaygame/
├── index.html                    # Main HTML file
├── manifest.json                 # PWA manifest (updated with all icons)
├── pwabuilder-sw.js             # Service worker (Workbox)
├── netlify.toml                  # Netlify configuration
├── static/
│   ├── css/                      # All stylesheets
│   ├── js/                       # JavaScript files
│   ├── icons/                     # Icons (192, 384, 512)
│   └── images/                    # Screenshots and images
├── ONESIGNAL_SETUP.md            # OneSignal configuration guide
└── DEPLOY_TO_NETLIFY.md          # Deployment instructions
```

## 🔧 Configuration Files

- **`netlify.toml`**: Handles SPA routing and caching
- **`manifest.json`**: PWA configuration with icons and screenshots
- **`pwabuilder-sw.js`**: Service worker using Workbox CDN (no credentials needed)

## 📝 Notes

- **Workbox**: Uses CDN, no credentials needed
- **Google Translate**: Kept in code but won't break if unavailable
- **OneSignal**: Requires your App ID (free tier available)
- **Service Worker**: Must be enabled for production deployment

## 🚀 Quick Deploy Commands

```bash
# Option 1: Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod

# Option 2: Git + Netlify
git init
git add .
git commit -m "Deploy PWA"
# Push to GitHub, then connect in Netlify dashboard

# Option 3: Drag & Drop
# Just drag this folder to app.netlify.com
```

## ✅ Post-Deployment Testing

1. Visit your Netlify URL
2. Check browser console for errors
3. Test PWA installation prompt
4. Install PWA and test offline mode
5. Configure OneSignal with your Netlify URL
6. Test push notifications

## 📚 Documentation

- `ONESIGNAL_SETUP.md` - OneSignal configuration
- `DEPLOY_TO_NETLIFY.md` - Detailed deployment guide
- `CLEAR_SERVICE_WORKER.md` - Service worker troubleshooting

