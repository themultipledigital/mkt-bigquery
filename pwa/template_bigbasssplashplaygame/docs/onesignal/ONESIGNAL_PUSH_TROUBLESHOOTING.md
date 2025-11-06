# OneSignal Push Notification Troubleshooting

## Issue
Notifications show as "delivered" in OneSignal dashboard but are not received on devices (Android, iOS, Desktop PWA).

## Root Cause
OneSignal requires its service worker code to handle push notifications. The existing service worker (`pwabuilder-sw.js`) didn't include OneSignal integration.

## Fix Applied
Added OneSignal service worker import to `pwabuilder-sw.js`:
```javascript
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
```

**CRITICAL**: 
- Must use `.sw.js` (service worker), NOT `.page.js` (page script)
- Must be imported BEFORE other service worker code (like Workbox)
- This import enables push notification handling in the service worker

## Additional Checks

### 1. Verify Notification Permission
**Check in browser console:**
```javascript
OneSignal.Notifications.permission
```
Should return: `"granted"`

**If not granted:**
- Check browser notification settings
- Clear cache and re-subscribe
- Check OneSignal dashboard → Audience → Subscribers (verify you're subscribed)

### 2. Check Service Worker
**In browser DevTools:**
- Application → Service Workers
- Verify `pwabuilder-sw.js` is registered and active
- Check for any errors

### 3. Verify OneSignal Subscription
**In browser console:**
```javascript
OneSignal.User.PushSubscription.id
```
Should return a subscription ID (not null/undefined)

**Or check OneSignal dashboard:**
- Audience → Subscribers
- You should see yourself listed
- Check subscription status

### 4. Check OneSignal Dashboard Settings
- **Settings → Platforms → Web Push:**
  - Site URL matches your Netlify URL exactly
  - Service worker path: `/pwabuilder-sw.js`
  - Service worker scope: `/`

### 5. Test Notification Delivery
**In OneSignal dashboard:**
- Messages → New Push
- Send to "Subscribed Users" or specific segment
- Check delivery status
- If "delivered" but not received, see troubleshooting below

## Common Issues & Solutions

### Issue: "Delivered" but Not Received

**Possible causes:**
1. **Browser blocking notifications:**
   - Check browser notification settings
   - Some browsers suppress notifications if tab is active
   - Try closing the browser/tab and sending notification

2. **Service worker not active:**
   - Service worker must be active to receive push
   - Check DevTools → Application → Service Workers
   - Unregister and re-register if needed

3. **Device/browser in focus:**
   - Some browsers don't show notifications when tab is active
   - Close the browser/tab, then send notification
   - Or minimize the browser window

4. **Notification permission revoked:**
   - Check browser settings
   - Re-subscribe if needed

5. **OneSignal service worker not loaded:**
   - Verify service worker includes OneSignal import
   - Check service worker console for errors

### Issue: Not Subscribed

**Check subscription:**
1. Open browser console
2. Run: `OneSignal.User.PushSubscription.id`
3. If null, you're not subscribed
4. Re-subscribe by allowing notifications again

### Issue: iOS Not Working

**Requirements:**
- iOS 16.4+ required
- PWA must be installed (not just in Safari)
- Check iOS version
- Verify PWA is installed as standalone app

## Debugging Steps

### Step 1: Check Service Worker
```javascript
// In browser console
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
  console.log('Active:', reg.active);
});
```

### Step 2: Check OneSignal Status
```javascript
// In browser console
console.log('OneSignal:', window.OneSignal);
console.log('Permission:', OneSignal.Notifications.permission);
console.log('Subscription:', OneSignal.User.PushSubscription.id);
```

### Step 3: Check OneSignal Dashboard
- Audience → Subscribers
- Verify you're listed
- Check subscription status
- Verify device/browser info

### Step 4: Test Notification
1. Close browser/tab completely
2. Send notification from OneSignal dashboard
3. Wait a few seconds
4. Check if notification appears

## After Fix Applied

1. **Redeploy to Netlify** with updated service worker
2. **Clear service worker cache:**
   - DevTools → Application → Service Workers → Unregister
   - Or clear browser cache
3. **Re-subscribe:**
   - Visit site
   - Allow notifications again
4. **Test:**
   - Close browser/tab
   - Send test notification
   - Should receive notification

## Important Notes

- **Service Worker Required**: OneSignal needs service worker code to handle push
- **Active Service Worker**: Service worker must be active to receive notifications
- **Browser State**: Some browsers don't show notifications when tab is active
- **Permission**: Must have notification permission granted
- **Subscription**: Must be subscribed in OneSignal

The fix has been applied - redeploy and test! 🚀

