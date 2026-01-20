# 🚀 Deploy BlueHand Canvas NOW - Step by Step

## ✅ What I Created For You

All the PHP backend files are ready in the `/server-deploy/` folder:

```
/server-deploy/
├── .htaccess              ← Apache rewrite rules
└── api/
    ├── index.php          ← API router
    ├── config.php         ← Database config (EDIT THIS!)
    ├── paintings.php      ← Paintings endpoints
    ├── orders.php         ← Orders endpoints
    ├── auth.php           ← Authentication
    └── upload.php         ← File uploads
```

---

## 📋 STEP 1: Edit config.php (2 minutes)

**Open:** `/server-deploy/api/config.php`

**Find these lines and change them:**

```php
define('DB_PASS', 'YOUR_MYSQL_PASSWORD_HERE');  // ← Put your MySQL password here!
```

```php
define('JWT_SECRET', 'bluehand-canvas-secret-key-change-this-2026');  // ← Change to any random string
```

**Save the file.**

---

## 📋 STEP 2: Upload via FTP (5 minutes)

### Connect to FTP:
- **Host:** `ftp.bluehand.ro` or `89.41.38.220`
- **Username:** `wiseguy`
- **Password:** [your FTP password]
- **Port:** 21

### Upload these files:

1. **Upload `.htaccess`:**
   - From: `/server-deploy/.htaccess`
   - To: `/public_html/.htaccess`

2. **Create and upload API folder:**
   - Create folder: `/public_html/api/`
   - Upload all files from `/server-deploy/api/` to `/public_html/api/`
   
   **Result:**
   ```
   /public_html/api/
   ├── index.php
   ├── config.php
   ├── paintings.php
   ├── orders.php
   ├── auth.php
   └── upload.php
   ```

3. **Create uploads folders:**
   ```
   /public_html/uploads/
   /public_html/uploads/paintings/
   /public_html/uploads/orders/
   /public_html/uploads/sliders/
   /public_html/uploads/blog/
   ```

4. **Set folder permissions:**
   - `/public_html/uploads/` → 755
   - `/public_html/api/` → 755
   - All `.php` files → 644

---

## 📋 STEP 3: Test the API (1 minute)

Open your browser and visit these URLs:

### Test 1: Health Check
```
https://bluehand.ro/api/health
```

**Expected result:**
```json
{
  "status": "ok",
  "message": "BlueHand Canvas API v1.0",
  "timestamp": "2026-01-19 12:34:56",
  "environment": "production"
}
```

✅ **If you see this → API is working!**

---

### Test 2: Database Connection
```
https://bluehand.ro/api/test-db
```

**Expected result:**
```json
{
  "status": "ok",
  "message": "Database connected",
  "paintings_count": 0
}
```

✅ **If you see this → Database is connected!**

---

### Test 3: Get Paintings
```
https://bluehand.ro/api/paintings
```

**Expected result:**
```json
{
  "paintings": []
}
```

✅ **If you see this → Paintings endpoint works!**

---

## 🔧 Troubleshooting

### Problem: "404 Not Found"

**Cause:** `.htaccess` not working

**Solution:**
1. Check if mod_rewrite is enabled on your server
2. Make sure `.htaccess` is in `/public_html/` folder
3. Check file permissions: `.htaccess` should be 644

---

### Problem: "Database connection failed"

**Cause:** Wrong database credentials

**Solution:**
1. Check `/public_html/api/config.php`
2. Verify:
   - `DB_HOST` is `localhost` (not IP address!)
   - `DB_NAME` is `wiseguy_bluehand`
   - `DB_USER` is `wiseguy_bluehand`
   - `DB_PASS` is your actual MySQL password

To find your database password:
- Log into cPanel
- Go to "MySQL Databases"
- Check current users

---

### Problem: "Internal Server Error"

**Cause:** PHP syntax error or missing extension

**Solution:**
1. Check error logs in cPanel → "Error Log"
2. Make sure PHP version is 7.4 or higher
3. Check if PDO MySQL extension is enabled

---

## 📁 Final File Structure

After uploading, your server should look like this:

```
/public_html/
├── .htaccess                    ← Apache rules
├── index.html                   ← React app (will add later)
├── assets/                      ← React assets (will add later)
├── api/                         ← PHP backend ✅
│   ├── index.php
│   ├── config.php
│   ├── paintings.php
│   ├── orders.php
│   ├── auth.php
│   └── upload.php
└── uploads/                     ← File uploads ✅
    ├── paintings/
    ├── orders/
    ├── sliders/
    └── blog/
```

---

## ✅ Next Steps

After the API is working:

1. **Build the React app** (on your computer):
   ```bash
   npm install
   npm run build
   ```

2. **Upload the built files:**
   - Upload contents of `dist/` folder to `/public_html/`

3. **Visit your website:**
   - Frontend: https://bluehand.ro
   - Admin: https://bluehand.ro/admin

---

## 🎉 Success Checklist

- [ ] Edited `config.php` with correct database password
- [ ] Uploaded `.htaccess` to `/public_html/`
- [ ] Uploaded all 6 PHP files to `/public_html/api/`
- [ ] Created `/public_html/uploads/` folders
- [ ] Tested `https://bluehand.ro/api/health` → ✅ Works!
- [ ] Tested `https://bluehand.ro/api/test-db` → ✅ Database connected!
- [ ] Tested `https://bluehand.ro/api/paintings` → ✅ Returns data!

---

## 🆘 Need Help?

**Check the error log:**
```
/public_html/api/error.log
```

This file will show detailed error messages if something goes wrong.

**Common issues:**
- Wrong MySQL password → Edit `config.php`
- mod_rewrite not enabled → Contact hosting support
- PHP version too old → Upgrade to PHP 7.4+ in cPanel

---

## 📞 Quick Commands Reference

### Test API from terminal:
```bash
# Health check
curl https://bluehand.ro/api/health

# Database test
curl https://bluehand.ro/api/test-db

# Get paintings
curl https://bluehand.ro/api/paintings
```

### Check PHP version via FTP:
Create `/public_html/phpinfo.php`:
```php
<?php phpinfo(); ?>
```

Visit: `https://bluehand.ro/phpinfo.php`
(Delete this file after checking!)

---

## 🎯 Status

**Current status:** API files ready to upload!

**What you need to do:**
1. ✅ Edit `config.php` (2 min)
2. ✅ Upload files via FTP (5 min)
3. ✅ Test API endpoints (1 min)

**Total time:** 8 minutes! 🚀

---

Let me know when you've uploaded the files and I'll help you test everything!
