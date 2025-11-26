# How to Create a New PWA with Existing Template

## Step-by-Step Guide

### Step 1: Access the Dashboard

1. Open your browser
2. Navigate to: `https://aztecslotgames.com/pwa-dashboard/index.php`
3. You should see the PWA Dashboard with "My PWAs" list

### Step 2: Create a New PWA

1. **Click the "New PWA" button** (green button, top right of the dashboard)
2. You'll be redirected to the editor page

### Step 3: Fill in Basic Information

**In the editor, fill in the following tabs:**

#### Tab: **Domain** (optional)
- **Domain:** Your domain name (e.g., `myapp.com`)
- **Geo:** Geographic region (e.g., `KW`, `US`, `DE`)
- **Status:** Choose `New`, `Active`, or `Stopped`

#### Tab: **Design** (Main Configuration)

**1. Design Settings:**
- You can choose:
  - **Copy from App Store** - Scrape design from App Store URL
  - **Copy from Google Play** - Scrape design from Google Play Store URL
  - **Do it manually** - Fill in all fields yourself

**2. PWA Language and Category:**
- **Language:** Select language (English, German, French, etc.)
- **Category:** Select category (Gambling, Games, Entertainment, etc.)

**3. Store Page Design:**
- **App Icon:** Click "Upload Icon" and select an image (PNG, JPG)
- **App Name:** Enter your app name (e.g., "Big Bass Splash")
- **Developer:** Enter developer name (e.g., "HELIX WatchStudio")
- **Rating:** Enter rating (0-5, e.g., 5.0)
- **Size:** Enter app size (e.g., "3ML")
- **Age:** Enter age rating (e.g., "17+")
- **Installs:** Enter install count (e.g., "1,00" or "10K")

**4. Images and Video:**
- **YouTube Video URL:** (Optional) Add YouTube video URL
- **Screenshots:** Upload up to 6 screenshots (click each screenshot box to upload)

**5. App Description and Tags:**
- **App Description:** Enter your app description
  - Or click **"Generate description by ChatGPT"** to auto-generate
- **Tags:** Enter comma-separated tags (e.g., `game, puzzle, casino`)

**6. Rating and Reviews:**
- **Rating:** Overall rating (will auto-update based on distribution)
- **Number of reviews:** (e.g., "1M")
- **Rating Distribution:** Enter counts for each star rating:
  - 5 stars: 70
  - 4 stars: 20
  - 3 stars: 5
  - 2 stars: 3
  - 1 star: 2

**7. Comments:**
- Click **"+ Add comment"** to add user reviews
- Enter: Username, Rating (1-5), Comment text
- Or click **"Generate by ChatGPT"** to auto-generate comments

#### Tab: **Tracker** (Optional)
- **Offer Link:** Your tracking/offer URL
- **Tracking Parameters:** UTM parameters

#### Tab: **Analytics** (Optional)
- **Google Analytics ID:** Your GA tracking ID
- **Facebook Pixel ID:** Your Facebook Pixel ID

#### Tab: **Push Notifications** (Optional)
- **OneSignal App ID:** Your OneSignal App ID
- **Enable push notifications:** Check if enabled

#### Tab: **Miscellaneous**
- **Template:** Should already be set to `template_bigbasssplashplaygame` ✅
- **PWA Name:** Enter a name for this PWA (e.g., "My New Casino App")

### Step 4: Save Your PWA

1. **Click the "Save" button** (green button, top right)
2. Your PWA configuration will be saved
3. You'll see a success message

### Step 5: Generate the PWA Files

1. **Click the "Generate" button** (blue button, next to Save button)
2. Confirm the generation
3. Wait for the process to complete (may take a moment)
4. You'll see: "PWA generated successfully! Files processed: X"

### Step 6: Download the Generated PWA

1. After generation, you'll be prompted to download
2. Click **"Download ZIP"** or click the download link
3. The ZIP file will contain all the generated PWA files

### Step 7: Deploy Your PWA

1. Extract the downloaded ZIP file
2. Upload all files to your hosting (via FTP or cPanel)
3. Your PWA is now live!

---

## Quick Example: Creating a Simple PWA

### Minimal Required Fields:

1. **Go to Design tab:**
   - **App Name:** "Big Bass Splash"
   - **Developer:** "HELIX WatchStudio"
   - **Rating:** 5.0
   - **Description:** "An amazing casino game with exciting features!"

2. **Click "Save"**

3. **Click "Generate"**

4. **Download ZIP**

5. **Deploy!**

---

## Tips

### Using the Template
- The template `template_bigbasssplashplaygame` is **already selected by default**
- You don't need to change it unless you have other templates
- All generated PWAs will use this template structure

### Auto-Fill Options
- **Copy from App Store:** Enter App Store URL → auto-fills name, developer, description
- **Copy from Google Play:** Enter Play Store URL → auto-fills name, developer, description
- **ChatGPT Description:** Auto-generates compelling app description
- **ChatGPT Comments:** Auto-generates realistic user reviews

### Required vs Optional
**Required for a working PWA:**
- ✅ App Name
- ✅ Developer
- ✅ Description
- ✅ App Icon (at least one)

**Optional but recommended:**
- Screenshots
- Rating distribution
- Comments/reviews
- Tracking links
- Analytics IDs

### Template Features Included
The `template_bigbasssplashplaygame` template includes:
- ✅ PWA manifest
- ✅ Service worker
- ✅ Install page (index.html)
- ✅ Home page (home.php)
- ✅ Dark/Light theme support
- ✅ OneSignal push notification support
- ✅ Responsive design
- ✅ Adspect integration (cloaking)

---

## Troubleshooting

### "Template not found" error
- Verify `templates/template_bigbasssplashplaygame/` folder exists
- Check folder permissions

### "Cannot write to generated directory"
- Set `generated/` folder permissions to `777`
- Check if folder exists

### Generation fails
- Check PHP error logs in cPanel
- Verify all template files were uploaded
- Check PHP version (needs 7.4+)

### Generated PWA doesn't work
- Verify all files were uploaded correctly
- Check file permissions on hosting
- Verify manifest.json was generated
- Check browser console for errors

---

## Next Steps After Creation

1. **Test the generated PWA** locally before deploying
2. **Customize further** if needed by editing and regenerating
3. **Deploy to hosting** when ready
4. **Test on mobile devices** for PWA installation

---

## Need Help?

If you encounter issues:
1. Check browser console (F12) for errors
2. Check PHP error logs in cPanel
3. Verify all files were uploaded correctly
4. Check folder permissions

