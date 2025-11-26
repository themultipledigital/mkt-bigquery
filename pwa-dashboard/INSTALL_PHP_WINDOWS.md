# Install PHP on Windows - Step by Step

## Method 1: XAMPP (Easiest - Recommended)

### Step 1: Download XAMPP
1. Go to: https://www.apachefriends.org/download.html
2. Download **XAMPP for Windows** (latest version with PHP 7.4+)
3. Choose the installer version (.exe file)

### Step 2: Install XAMPP
1. Run the downloaded `.exe` file
2. Follow the installation wizard
3. **Install to:** `C:\xampp` (default - recommended)
4. **Select components:** PHP, Apache (MySQL optional)
5. Click "Install"

### Step 3: Start Apache
1. Open **XAMPP Control Panel** from Start Menu
2. Find **Apache** in the list
3. Click **"Start"** button
4. Status should turn green

### Step 4: Copy Dashboard Files
1. Copy your `pwa-dashboard` folder
2. Paste into: `C:\xampp\htdocs\pwa-dashboard\`

### Step 5: Access Dashboard
Open browser and go to:
```
http://localhost/pwa-dashboard/index.php
```

**That's it!** Your dashboard should be running.

---

## Method 2: Manual PHP Installation

### Step 1: Download PHP
1. Visit: https://windows.php.net/download/
2. Download **PHP 8.1** or **PHP 7.4** (Thread Safe version)
3. Choose **ZIP** file (not installer)

### Step 2: Extract PHP
1. Extract the ZIP file to: `C:\php`
2. You should have folders like: `C:\php\ext`, `C:\php\php.exe`, etc.

### Step 3: Add to PATH
1. Press `Windows + X` → **System**
2. Click **"Advanced system settings"**
3. Click **"Environment Variables"** button
4. Under **"System variables"**, find **"Path"**
5. Click **"Edit"**
6. Click **"New"**
7. Add: `C:\php`
8. Click **OK** on all windows

### Step 4: Configure PHP
1. Go to `C:\php`
2. Copy `php.ini-development` file
3. Rename copy to `php.ini`
4. Open `php.ini` in Notepad
5. Find and uncomment (remove `;` from) these lines:
   ```ini
   extension=curl
   extension=openssl
   extension=mbstring
   extension=zip
   ```
6. Save and close

### Step 5: Restart PowerShell
1. Close all PowerShell windows
2. Open new PowerShell
3. Test: `php -v`

### Step 6: Run Dashboard
```powershell
cd pwa-dashboard
php -S localhost:8000
```

---

## Method 3: Laragon (Alternative)

### Step 1: Download Laragon
1. Visit: https://laragon.org/download/
2. Download **Laragon Full** or **Laragon Portable**
3. Install or extract

### Step 2: Start Laragon
1. Open Laragon application
2. Click **"Start All"** button
3. Wait for services to start (green indicators)

### Step 3: Copy Dashboard
1. Copy `pwa-dashboard` folder
2. Paste into: `C:\laragon\www\pwa-dashboard\`

### Step 4: Access Dashboard
Open browser:
```
http://localhost/pwa-dashboard/index.php
```

---

## Which Method Should I Use?

### Use XAMPP if:
- ✅ You want the easiest setup
- ✅ You're new to PHP development
- ✅ You want everything included (Apache + PHP)

### Use Manual PHP if:
- ✅ You only need PHP (not Apache)
- ✅ You want more control
- ✅ You're comfortable with PATH configuration

### Use Laragon if:
- ✅ You want a modern, lightweight option
- ✅ You prefer automatic URL routing
- ✅ You want Nginx instead of Apache

### Use Docker if:
- ✅ You already have Docker installed
- ✅ You want isolated environments
- ✅ You're comfortable with containers

---

## Troubleshooting

### "php is not recognized"
- PHP is not in PATH
- Restart PowerShell after adding to PATH
- Verify with: `php -v`

### "Port 80 already in use" (XAMPP)
- Stop other web servers (IIS, Skype, etc.)
- Change Apache port in XAMPP control panel

### "Access Denied" errors
- Check folder permissions
- Run as Administrator (if needed)

---

## Quick Recommendation

**For beginners:** Use **XAMPP** - it's the easiest and includes everything you need.

**Installation time:** ~5 minutes

