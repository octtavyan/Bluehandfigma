# 🚀 Quick FTP Upload Guide

## What You're Uploading

All files are ready in the `/server-deploy/` folder on your computer!

---

## 📦 Files to Upload

### File 1: .htaccess
```
From: /server-deploy/.htaccess
To:   /public_html/.htaccess
```

### Files 2-7: API Backend
```
From: /server-deploy/api/index.php
To:   /public_html/api/index.php

From: /server-deploy/api/config.php
To:   /public_html/api/config.php

From: /server-deploy/api/paintings.php
To:   /public_html/api/paintings.php

From: /server-deploy/api/orders.php
To:   /public_html/api/orders.php

From: /server-deploy/api/auth.php
To:   /public_html/api/auth.php

From: /server-deploy/api/upload.php
To:   /public_html/api/upload.php
```

---

## 📁 Folders to Create

Create these empty folders on your server:

```
/public_html/api/
/public_html/uploads/
/public_html/uploads/paintings/
/public_html/uploads/orders/
/public_html/uploads/sliders/
/public_html/uploads/blog/
```

---

## ⚙️ FTP Connection Settings

```
Protocol: FTP
Host:     89.41.38.220
          (or ftp.bluehand.ro)
Port:     21
Username: wiseguy
Password: [your FTP password]
```

---

## ✏️ IMPORTANT: Edit Before Uploading!

### Edit `/server-deploy/api/config.php`

**Line 7:** Change database password
```php
define('DB_PASS', 'YOUR_MYSQL_PASSWORD_HERE');
```
↓
```php
define('DB_PASS', 'your_actual_password');
```

**Line 14:** Change JWT secret
```php
define('JWT_SECRET', 'bluehand-canvas-secret-key-change-this-2026');
```
↓
```php
define('JWT_SECRET', 'any-random-string-min-32-characters-long-12345');
```

**Save the file!**

---

## 🎯 Step-by-Step Upload Process

### Using FileZilla (Free FTP Client):

**Step 1:** Download FileZilla
- https://filezilla-project.org/download.php?type=client

**Step 2:** Connect
1. Open FileZilla
2. Enter connection details:
   - Host: `ftp.bluehand.ro`
   - Username: `wiseguy`
   - Password: [your password]
   - Port: `21`
3. Click "Quickconnect"

**Step 3:** Navigate
- **Left side (your computer):** Go to `/server-deploy/`
- **Right side (your server):** Go to `/public_html/`

**Step 4:** Upload .htaccess
1. Find `.htaccess` on left side
2. Drag it to right side (`/public_html/`)
3. If asked to overwrite, click "Yes"

**Step 5:** Create api folder
1. Right-click on right side (in `/public_html/`)
2. Select "Create directory"
3. Name it: `api`
4. Double-click to enter the folder

**Step 6:** Upload all PHP files
1. On left side, open `/server-deploy/api/` folder
2. Select all 6 `.php` files (hold Ctrl/Cmd)
3. Drag them to right side (`/public_html/api/`)

**Step 7:** Create uploads folders
1. Go back to `/public_html/`
2. Create directory: `uploads`
3. Enter `uploads/` folder
4. Create these subdirectories:
   - `paintings`
   - `orders`
   - `sliders`
   - `blog`

**Step 8:** Set permissions
1. Right-click on `uploads` folder
2. Select "File permissions"
3. Enter: `755`
4. Check "Recurse into subdirectories"
5. Click OK

**Done!** 🎉

---

## ✅ Verification Checklist

After uploading, verify these files exist on your server:

```
✓ /public_html/.htaccess
✓ /public_html/api/index.php
✓ /public_html/api/config.php
✓ /public_html/api/paintings.php
✓ /public_html/api/orders.php
✓ /public_html/api/auth.php
✓ /public_html/api/upload.php
✓ /public_html/uploads/paintings/ (empty folder)
✓ /public_html/uploads/orders/ (empty folder)
✓ /public_html/uploads/sliders/ (empty folder)
✓ /public_html/uploads/blog/ (empty folder)
```

---

## 🧪 Test It!

Open your browser and visit:

```
https://bluehand.ro/api/health
```

**You should see:**
```json
{
  "status": "ok",
  "message": "BlueHand Canvas API v1.0"
}
```

**✅ If you see this → SUCCESS! API is working!**

---

## 🆘 Troubleshooting

### "404 Not Found"
→ Check if `.htaccess` was uploaded to `/public_html/`

### "500 Internal Server Error"
→ Check `/public_html/api/error.log` for details
→ Verify `config.php` has correct database password

### "Database connection failed"
→ Edit `config.php`:
  - Make sure `DB_HOST` is `localhost`
  - Check `DB_PASS` is correct

### Can't see .htaccess file
→ In FileZilla: Go to "Server" menu → "Force showing hidden files"

---

## 📞 Need Help?

**Check error log:**
- In FileZilla, navigate to `/public_html/api/`
- Download `error.log` file
- Open it to see error messages

**Contact your hosting provider if:**
- mod_rewrite is not enabled
- PHP version is below 7.4
- PDO MySQL extension is missing

---

## 🎉 Next Steps After API Works

1. Build React app on your computer:
   ```bash
   npm run build
   ```

2. Upload `dist/` folder contents to `/public_html/`

3. Visit: `https://bluehand.ro`

---

**Total upload time: 5-10 minutes** ⚡

Good luck! 🚀
