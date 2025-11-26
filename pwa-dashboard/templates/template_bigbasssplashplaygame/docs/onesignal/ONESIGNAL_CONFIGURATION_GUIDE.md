# OneSignal Configuration Guide - Step by Step

## Your Current Setup
- **Site Name**: Gates of Olympus PWA ✅
- **Site URL**: https://rococo-cuchufli-32e2d8.netlify.app/ ✅

## How to Fill Out Each Field

### 1. Choose Integration
**Select: "Typical Site Integration"** ✅
- This is the correct choice for a PWA
- OneSignal will automatically handle the integration
- No need for custom code or WordPress plugin

### 2. Site Setup

#### Site Name
**Value**: `Gates of Olympus PWA` ✅ (Already filled)

#### Site URL
**Value**: `https://rococo-cuchufli-32e2d8.netlify.app/` ✅ (Already filled)
- Make sure there's NO trailing slash: `https://rococo-cuchufli-32e2d8.netlify.app` (remove the `/` at the end)
- Or keep it as is - both should work

#### Auto Resubscribe
**Enable this** ✅ (Recommended)
- Check the box: "Auto Resubscribe"
- This allows users to automatically resubscribe if they clear browser cache
- Helps with user retention

#### Default Icon URL
**Value**: `https://rococo-cuchufli-32e2d8.netlify.app/static/icons/icon-512x512.png`

**How to get it:**
1. Visit your Netlify site: `https://rococo-cuchufli-32e2d8.netlify.app/static/icons/icon-512x512.png`
2. Verify the icon loads (should see your app icon)
3. Copy that full URL
4. Paste it in the "Default Icon URL" field

**Alternative icons you can use:**
- `https://rococo-cuchufli-32e2d8.netlify.app/static/icons/icon-192x192.png` (smaller)
- `https://rococo-cuchufli-32e2d8.netlify.app/static/icons/icon-384x384.png` (medium)
- `https://rococo-cuchufli-32e2d8.netlify.app/static/icons/icon.png` (512x512)

**Recommended**: Use `icon-512x512.png` for best quality

### 3. Permission Prompt Setup

**Current Setup**: "Push Slide Prompt" ✅
- **Appearance**: All pages, 1 pageview, 10 seconds
- **Action**: Opens push slide prompt

**This is fine as-is**, but you can customize:
- **When to show**: Currently shows after 1 pageview and 10 seconds
- **Where to show**: Currently shows on all pages

**Recommendation**: Keep it as is for now. You can adjust later if needed.

### 4. Welcome Notification (Optional)

**Current Setup**:
- ✅ Send welcome notification after subscribing: **Enabled**
- Title: `Gates of Olympus PWA` ✅
- Message: `Thanks for subscribing!` ✅
- Link: (empty)

**Recommendations**:
- **Link**: You can leave it empty, or add your site URL: `https://rococo-cuchufli-32e2d8.netlify.app`
- This will send a notification when users first subscribe
- Good for user engagement

### 5. Advanced Push Settings

#### Service Workers ⚠️ IMPORTANT
**Action**: Click "Customize service worker paths and filenames"

**Settings to configure**:
- **Main Service Worker File Name**: `pwabuilder-sw.js`
- **Service Worker Registration Scope**: `/`
- **Service Worker Path**: `/pwabuilder-sw.js`
- **Service Worker Update Path**: `/pwabuilder-sw.js` (same)
- **HTTP Service Worker Path**: Leave empty (not needed for HTTPS)

**Why this matters:**
- Your PWA uses a custom service worker: `pwabuilder-sw.js`
- OneSignal needs to know where it is
- This allows OneSignal to work with your existing service worker

#### Webhooks
**Leave disabled** for now (unless you need webhook functionality)

#### Click Behavior
**Current Settings** (defaults are fine):
- **Matching Strategy**: Exact (default) ✅
- **Action Strategy**: Navigate (default) ✅

#### Persistence
**Leave disabled** (default)
- Notifications will disappear after a few seconds (standard behavior)
- Only enable if you want notifications to stay until clicked

#### Safari Certificate
**Leave empty** for now
- Only needed if you want to customize Safari push notifications
- OneSignal provides a default certificate

## Summary - Quick Checklist

✅ **Integration**: Typical Site Integration
✅ **Site Name**: Gates of Olympus PWA
✅ **Site URL**: https://rococo-cuchufli-32e2d8.netlify.app (remove trailing `/`)
✅ **Auto Resubscribe**: Enable
✅ **Default Icon URL**: `https://rococo-cuchufli-32e2d8.netlify.app/static/icons/icon-512x512.png`
✅ **Main Service Worker File Name**: `pwabuilder-sw.js`
✅ **Service Worker Registration Scope**: `/`
✅ **Service Worker Path**: `/pwabuilder-sw.js`
✅ **Welcome Notification**: Keep enabled (optional but recommended)
✅ **Permission Prompt**: Keep as is (can customize later)

## After Configuration

1. **Save the configuration**
2. **Get your App ID** from the OneSignal dashboard
3. **Update `index.html`** line ~961 with your App ID:
   ```javascript
   OneSignal.init({
     appId: "YOUR_ONESIGNAL_APP_ID_HERE",  // Replace this
     ...
   })
   ```
4. **Redeploy to Netlify**
5. **Test**: Visit your site and allow notifications

## Testing

1. Visit your Netlify site
2. You should see the OneSignal prompt (after 10 seconds or 1 pageview)
3. Click "Allow" to subscribe
4. You should receive the welcome notification
5. In OneSignal dashboard → Audience → Subscribers, you should see yourself

## Troubleshooting

**If notifications don't work:**
- Check browser console for errors
- Verify App ID is correct in `index.html`
- Make sure site URL in OneSignal matches your Netlify URL exactly
- Check that service worker path is correct: `/pwabuilder-sw.js`

**If service worker conflicts:**
- OneSignal will automatically integrate with your existing service worker
- No need to modify `pwabuilder-sw.js`
- OneSignal adds its own service worker code automatically

## Next Steps

After completing the configuration:
1. Copy your OneSignal App ID
2. Update `index.html` with your App ID
3. See `ONESIGNAL_SETUP.md` for code update instructions
4. Redeploy to Netlify
5. Test push notifications

