# OneSignal Setup Guide

## Current Configuration

The PWA currently uses a placeholder OneSignal App ID from the original site:
- **App ID**: `a12bf87b-b0db-4e4e-b145-8f18e94d397a`

## Steps to Configure Your Own OneSignal

### 1. Create OneSignal Account
1. Go to https://onesignal.com
2. Sign up for a free account
3. Verify your email

### 2. Create a Web Push App
1. In OneSignal dashboard, click **"New App/Website"**
2. Choose **"Web Push"**
3. Enter app name (e.g., "Big Bass Splash PWA")
4. Click **"Create"**

### 3. Get Your App ID
1. After creating the app, you'll see your **App ID** (looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
2. Copy this App ID

### 4. Update the Code
1. Open `index.html`
2. Find line ~897 (in the `initOnesignal()` function)
3. Replace the App ID:
   ```javascript
   OneSignal.init({
     appId: "YOUR_ONESIGNAL_APP_ID_HERE",  // Replace with your App ID
     promptOptions: {
       slidedown: {
         prompts: []
       }
     }
   })
   ```

### 5. Configure Your Site URL
1. In OneSignal dashboard, go to **Settings** → **Platforms** → **Web Push**
2. Under **"Site URL"**, add your Netlify URL:
   - Example: `https://your-site.netlify.app`
   - Or your custom domain if you have one
3. Click **"Save"**

### 6. (Optional) Customize Notification Settings
- **Default Notification Icon**: Upload your app icon
- **Welcome Notification**: Enable/disable
- **Prompt Settings**: Customize when to show permission prompt

### 7. Test Push Notifications
1. Deploy your PWA to Netlify
2. Visit your site
3. Allow notification permissions when prompted
4. In OneSignal dashboard, go to **Messages** → **New Push**
5. Send a test notification to yourself

## Important Notes

- **HTTPS Required**: Push notifications only work on HTTPS (Netlify provides this automatically)
- **User Permission**: Users must grant notification permission
- **Browser Support**: Works on Chrome, Firefox, Edge, Safari (iOS 16.4+)
- **Free Tier**: OneSignal free tier includes up to 10,000 subscribers

## Current Code Location

The OneSignal initialization is in `index.html` around line 889-939 in the `initOnesignal()` function.

