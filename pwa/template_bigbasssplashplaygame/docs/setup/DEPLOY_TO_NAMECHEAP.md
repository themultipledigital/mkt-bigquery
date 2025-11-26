# Deploy to Namecheap (cPanel + PHP Hosting)

This guide explains how to deploy the PWA to a Namecheap shared hosting account (or any similar cPanel host that supports PHP).

## 1. Prerequisites
- Namecheap shared hosting with cPanel access (PHP 7.4+ recommended).
- A primary domain or subdomain pointed at the hosting account.
- HTTPS enabled (AutoSSL from cPanel or Cloudflare proxy).
- Local copy of the project (`template_bigbasssplashplaygame/`).

## 2. Prepare the build
1. Ensure the following files have been updated (already handled in this branch):
   - `home.php` (installed landing page).
   - `manifest.json` `start_url` → `./home.php`.
   - `index.html` `INSTALLED_HOME_URL` → `./home.php`.
2. If you made additional edits, run any local build/compression steps you need.
3. Compress the entire `template_bigbasssplashplaygame/` folder into a `.zip` archive (optional but makes upload easier).

## 3. Upload files via cPanel File Manager
1. Log into the Namecheap dashboard → **Hosting List** → click **Go to cPanel**.
2. Open **File Manager**.
3. Navigate to the document root for your site (usually `public_html/` or a subfolder if using an addon domain/subdomain).
4. Upload the `.zip` archive (or drag the folder contents directly).
5. If you uploaded a `.zip`, select it and choose **Extract** → confirm the extraction path (`public_html/` or your chosen subfolder).
6. Ensure the structure looks like:
   ```
   public_html/
     home.php
     index.html
     manifest.json
     pwabuilder-sw.js
     static/
     docs/
     ...
   ```

## 4. Verify PHP permissions
- `home.php` loads Adspect before rendering the page. No additional configuration is usually needed.
- Confirm `8dqCjkdMkv.php` is in the same directory as `home.php` (it should be by default).

## 5. Configure HTTPS
PWA installation requires HTTPS.
- **AutoSSL (cPanel)**: In cPanel, open **SSL/TLS Status** → ensure AutoSSL is enabled for your domain. Wait for the certificate to issue.
- **Cloudflare (optional)**: If using Cloudflare, set the domain to “Full (strict)” HTTPS and proxy the traffic.

## 6. Update domain references (optional)
If you plan to serve the PWA from a subdomain (e.g., `app.example.com`):
1. Create the subdomain in cPanel.
2. Upload the project into the subdomain’s document root.
3. Update any analytics/measurement URLs if they rely on the hostname.
4. Reissue SSL (AutoSSL usually re-runs automatically when the subdomain is added).

## 7. Test the deployment
1. Visit `https://your-domain.com/`. You should see the install landing page (`index.html`).
2. Install the PWA from the browser menu.
3. Open the installed app → it should load `home.php` (adspect guard will run before showing content).
4. Verify push notification prompt appears (OneSignal must be configured with the production domain).
5. Test offline behaviour (install, go offline, reopen → should still work after first load).

## 8. Common issues
| Issue | Fix |
| --- | --- |
| `home.php` downloads instead of rendering | PHP handler not enabled; ensure the site is on a PHP-capable plan and the file is inside `public_html`. |
| PWA won’t install | Confirm `https://your-domain.com/manifest.json` is reachable and uses the updated `start_url`. |
| Push notifications fail | Update OneSignal dashboard with the production domain and ensure the OneSignal app ID is correct in `home.php` and `index.html`. |
| Service worker errors | Check your browser console for `pwabuilder-sw.js` 404s; ensure the file is in the project root and served over HTTPS. |

## 9. Optional: tweak caching
- Apache/cPanel often caches aggressively. If you need to force-refresh assets, consider adding or editing `.htaccess` to control cache headers for `static/` assets vs PHP pages.

## 10. Maintain the deployment
- When you update the project, repeat the upload/extract steps (or use FTP/SFTP for incremental updates).
- Clear browser caches or update filenames when shipping critical changes to JS/CSS.
- Re-run PWA install/offline tests after each update.

You’re now ready to host the PWA on Namecheap! ✅
