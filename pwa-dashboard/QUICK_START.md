# PWA Dashboard - Quick Start Guide

## 🚀 Local Access (Development)

### Start the Dashboard:
```bash
cd pwa-dashboard
php -S localhost:8000
```

### Access in Browser:
Open: **http://localhost:8000**

The server is currently running! Just open your browser and go to that URL.

---

## 🌐 Deploy to Namecheap (Production)

### Step 1: Connect via FTP
- Use FileZilla or cPanel File Manager
- Connect to: `ftp.yourdomain.com` (or server IP)
- Username: Your cPanel username
- Password: Your FTP password

### Step 2: Upload Files
**Option A: Root Deployment**
- Upload all `pwa-dashboard` files to `public_html/`
- Access at: `https://yourdomain.com/index.php`

**Option B: Subfolder Deployment (Recommended)**
- Create folder: `public_html/pwa-admin/`
- Upload all `pwa-dashboard` files to `pwa-admin/`
- Access at: `https://yourdomain.com/pwa-admin/index.php`

### Step 3: Set Permissions
- Set `data/` folder to `755` or `777`
- Set `generated/` folder to `755` or `777`

### Step 4: Test
- Open browser and go to your dashboard URL
- You should see the PWA Dashboard!

---

## ✅ Requirements Checklist

- ✅ PHP 7.4+ (Namecheap usually has this)
- ✅ cURL extension (usually enabled)
- ✅ ZipArchive extension (usually enabled)
- ✅ Write permissions on `data/` and `generated/` folders

---

## 📝 First Steps

1. **Access the dashboard** (local or Namecheap)
2. **Click "New PWA"** button
3. **Fill in PWA details:**
   - Domain settings
   - Store page design
   - Images and screenshots
   - Description and tags
4. **Click "Generate"** to create PWA files
5. **Download ZIP** file for deployment

---

## 🔧 Configuration (Optional)

### Enable ChatGPT Integration:
1. Get OpenAI API key
2. Set environment variable in cPanel:
   - Variable: `OPENAI_API_KEY`
   - Value: `your-api-key-here`

### Enable OneSignal Push Notifications:
1. Get OneSignal App ID
2. Enter in editor → Push Notifications tab

---

## 📁 Important Files

- `index.php` - Main dashboard
- `editor.php` - PWA editor
- `data/pwas.json` - PWA storage (auto-created)
- `generated/` - Generated PWAs (auto-created)
- `templates/` - PWA templates

---

## 🆘 Troubleshooting

**Can't access dashboard?**
- Check if PHP server is running (local)
- Verify files uploaded correctly (Namecheap)
- Check file permissions

**500 Error?**
- Check `.htaccess` file
- View PHP error logs in cPanel
- Verify PHP version (7.4+)

**Can't save PWAs?**
- Check `data/` folder permissions (755 or 777)
- Verify folder exists

**Can't generate PWAs?**
- Check `generated/` folder permissions (755 or 777)
- Verify `templates/` folder exists

---

## 📖 Detailed Guides

- `START_LOCAL.md` - Detailed local setup
- `DEPLOY_TO_NAMECHEAP.md` - Detailed deployment guide
- `README.md` - Full documentation

