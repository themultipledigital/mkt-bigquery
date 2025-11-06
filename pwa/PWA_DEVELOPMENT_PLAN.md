# PWA Development Plan

## Overview
This document outlines the plan to create a PWA website using the downloaded template from `bigbasssplashplaygame.com` and integrating it with the Cloudflare Worker (`pwa_bot_worker_name.js`).

## Architecture Analysis

### Cloudflare Worker Structure
Based on `pwa_bot_worker_name.js`, the worker expects:

1. **Template Files**: `pwa/template/` - Base template files
2. **Hostname-Specific Files**: `pwa/source/{hostname}/` - Customized per domain
3. **File Organization**:
   - HTML: `pwa/template/html/index.html` or `pwa/source/{hostname}/html/index.html`
   - Service Workers: Root or `pwa/template/static/js/`
   - Manifest: Root or `pwa/template/static/js/`
   - Static Assets: `pwa/template/static/` or `pwa/source/{hostname}/static/`

### Firebase Storage Integration
- Base URL: `https://firebasestorage.googleapis.com/v0/b/pwa-bot-99957.appspot.com/o/`
- Files are served with `?alt=media` parameter
- Worker uses fallback mechanism: tries hostname-specific first, then template

## Development Phases

### Phase 1: Template Preparation ✅
- [x] Download PWA files from live site
- [x] Organize files in proper structure
- [ ] Clean up and normalize file paths
- [ ] Convert PHP files to static files (manifest, pages)
- [ ] Update all internal references

### Phase 2: File Structure Setup
- [ ] Create proper directory structure matching worker expectations:
  ```
  pwa/
  ├── template/              # Base template (shared across all PWAs)
  │   ├── html/
  │   │   └── index.html
  │   ├── static/
  │   │   ├── js/
  │   │   ├── css/
  │   │   ├── images/
  │   │   └── icons/
  │   ├── manifest.json
  │   ├── service-worker.js (or pwabuilder-sw.js)
  │   └── firebase-messaging-sw.js (if needed)
  └── source/                # Hostname-specific customizations
      └── {hostname}/
          ├── html/
          └── static/
  ```

### Phase 3: Path Updates
- [ ] Update HTML file paths:
  - CSS: `./static/css/` or relative paths
  - JS: `./static/js/` or relative paths
  - Images: `./static/images/` or relative paths
  - Icons: `./static/icons/` or relative paths
- [ ] Update manifest.json:
  - `start_url`: Point to correct HTML location
  - `icons`: Update paths to match new structure
  - `scope`: Ensure correct scope for service worker
- [ ] Update service worker:
  - Cache patterns
  - Workbox configuration
  - Asset paths

### Phase 4: Service Worker Optimization
- [ ] Review `pwabuilder-sw.js`:
  - [ ] Check Workbox CDN dependency (consider bundling)
  - [ ] Update cache strategies if needed
  - [ ] Add offline fallback page
  - [ ] Configure precaching if needed
- [ ] Test service worker registration
- [ ] Verify offline functionality

### Phase 5: Manifest Configuration
- [ ] Ensure `manifest.json` is valid JSON
- [ ] Update all icon paths
- [ ] Configure theme colors
- [ ] Set up proper app metadata
- [ ] Add screenshots if available
- [ ] Configure display mode (standalone, fullscreen, etc.)

### Phase 6: External Dependencies
- [ ] **OneSignal**: 
  - Decide: Keep CDN or self-host
  - Update configuration if needed
- [ ] **Google Translate**:
  - Decide: Keep or remove
  - Update if keeping
- [ ] **Workbox**:
  - Option A: Keep CDN (requires online for first load)
  - Option B: Bundle with service worker (better offline)
  - Recommendation: Bundle for better PWA experience

### Phase 7: Testing
- [ ] Local testing:
  - [ ] Serve files with simple HTTP server
  - [ ] Test all asset loading
  - [ ] Verify service worker registration
  - [ ] Test offline mode
  - [ ] Check manifest installation
- [ ] Browser testing:
  - [ ] Chrome DevTools PWA audit
  - [ ] Lighthouse PWA score
  - [ ] Test on mobile devices
  - [ ] Test installation flow

### Phase 8: Firebase Storage Deployment
- [ ] Set up Firebase Storage bucket (if not already)
- [ ] Upload template files to `pwa/template/`
- [ ] Upload hostname-specific files to `pwa/source/{hostname}/`
- [ ] Verify file permissions and CORS settings
- [ ] Test file access via Firebase Storage URLs

### Phase 9: Cloudflare Worker Configuration
- [ ] Verify worker routing logic
- [ ] Test with preview domains (`preview.sweetbonana.online`, `preview.pwa.bot`)
- [ ] Test with custom hostname
- [ ] Verify fallback mechanism works
- [ ] Test redirect functionality if needed

### Phase 10: Customization System
- [ ] Create system for hostname-specific customizations:
  - [ ] Branding (colors, logos, names)
  - [ ] Content customization
  - [ ] Feature flags
- [ ] Document customization process

## File Organization Strategy

### Template Files (Shared)
Files in `pwa/template/` are used as fallback and base for all PWAs:
- Core HTML structure
- Base CSS/JS libraries
- Default icons
- Service worker
- Manifest template

### Hostname-Specific Files
Files in `pwa/source/{hostname}/` override template files:
- Custom HTML pages
- Custom CSS (theme overrides)
- Custom images/logos
- Custom manifest (if needed)

## Key Decisions Needed

1. **Workbox**: Bundle or CDN?
   - **Recommendation**: Bundle for offline-first PWA

2. **OneSignal**: Keep or replace?
   - Depends on push notification requirements

3. **Google Translate**: Keep or remove?
   - Depends on multi-language requirements

4. **PHP Files**: 
   - `manifestdirect.php` → Convert to `manifest.json`
   - `pagedirect.php` → Check if needed or replace with `index.html`

5. **Asset Paths**:
   - Absolute paths (easier for Firebase Storage)
   - Relative paths (more portable)
   - **Recommendation**: Relative paths for flexibility

## Tools & Scripts

### Created Scripts
1. **`download_pwa_template.py`**: Downloads PWA from live site
   - Usage: `python download_pwa_template.py [URL]`
   - Output: Organized template structure

### Scripts to Create
1. **Path updater script**: Updates all file references in HTML/CSS/JS
2. **Manifest generator**: Creates/updates manifest.json
3. **Service worker bundler**: Bundles Workbox with service worker
4. **Firebase uploader**: Uploads files to Firebase Storage
5. **Local test server**: Simple HTTP server for testing

## Success Criteria

- [ ] PWA installs successfully on mobile devices
- [ ] Offline functionality works
- [ ] All assets load correctly
- [ ] Service worker caches properly
- [ ] Manifest is valid and complete
- [ ] Lighthouse PWA score > 90
- [ ] Works with Cloudflare Worker routing
- [ ] Supports hostname-specific customizations

## Next Immediate Steps

1. **Review downloaded files** in `template_bigbasssplashplaygame/`
2. **Create proper structure** matching worker expectations
3. **Update all file paths** in HTML, CSS, JS, and manifest
4. **Test locally** before deploying
5. **Deploy to Firebase Storage**
6. **Test with Cloudflare Worker**

## Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Manifest Specification](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

