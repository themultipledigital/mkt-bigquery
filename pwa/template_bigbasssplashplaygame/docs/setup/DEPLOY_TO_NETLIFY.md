# Deploy to Netlify Guide

## Quick Deploy (Drag & Drop)

### Step 1: Prepare Files
✅ All files are ready in `template_bigbasssplashplaygame/` folder
✅ `netlify.toml` is configured
✅ Icons and manifest are updated

### Step 2: Deploy
1. Go to https://app.netlify.com
2. Sign up or log in
3. Drag the entire `template_bigbasssplashplaygame` folder onto the deploy area
4. Wait for deployment (usually 30-60 seconds)
5. Your site will be live at `https://random-name.netlify.app`

### Step 3: Re-enable Service Worker
Before deploying, you need to re-enable the service worker for production:

1. Open `index.html`
2. Find the service worker section (around line 26-54)
3. Uncomment the service worker registration:
   ```javascript
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
   ```
4. Remove or comment out the unregister code

## Git Deployment (Recommended)

### Step 1: Initialize Git
```bash
cd template_bigbasssplashplaygame
git init
git add .
git commit -m "Initial PWA deployment"
```

### Step 2: Push to GitHub
1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Connect to Netlify
1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub
4. Select your repository
5. Build settings:
   - **Base directory**: Leave blank (or `pwa/template_bigbasssplashplaygame` if repo is at root)
   - **Publish directory**: `.` (or leave blank)
   - **Build command**: Leave blank (no build needed)
6. Click **"Deploy site"**

## Netlify CLI Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd template_bigbasssplashplaygame
netlify deploy --prod
```

## After Deployment

### 1. Test PWA Installation
- Visit your Netlify URL
- Look for install prompt in browser
- Or use browser menu → "Install [App Name]"

### 2. Test Offline Mode
- Install the PWA
- Turn off internet
- Open the app - should work offline

### 3. Update OneSignal
- Add your Netlify URL in OneSignal dashboard
- See `ONESIGNAL_SETUP.md` for details

### 4. Custom Domain (Optional)
- In Netlify dashboard → **Domain settings**
- Add your custom domain
- Update OneSignal with new domain

## Important Notes

- **HTTPS**: Netlify provides HTTPS automatically
- **Service Worker**: Must be re-enabled for production (currently disabled for local dev)
- **OneSignal**: Update App ID before deploying (see `ONESIGNAL_SETUP.md`)
- **Cache**: `netlify.toml` is configured for optimal caching

## Troubleshooting

### Service Worker Not Working
- Check browser console for errors
- Verify `pwabuilder-sw.js` is accessible
- Clear browser cache and reload

### PWA Not Installing
- Check manifest.json is valid
- Verify icons are accessible
- Test on HTTPS (required for PWA)

### OneSignal Not Working
- Verify App ID is correct
- Check site URL is added in OneSignal dashboard
- Ensure HTTPS is enabled

