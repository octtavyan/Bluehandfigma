# 🚨 CRITICAL FIX - UPLOAD .htaccess FILE NOW!

## ❌ **ROOT CAUSE OF ALL ERRORS:**

Your Apache server can't route API requests because `.htaccess` is MISSING!

**Without .htaccess:**
- ❌ `https://bluehand.ro/api/paintings` → 404 Not Found
- ❌ `https://bluehand.ro/api/orders` → 404 Not Found
- ❌ `https://bluehand.ro/api/sizes` → 404 Not Found

**With .htaccess:**
- ✅ All requests route through `index.php`
- ✅ CORS headers enabled
- ✅ Authorization header passed to PHP
- ✅ Everything works!

---

## 🎯 **THE FIX (2 MINUTES):**

### **STEP 1: Upload .htaccess File**

**File Location:** `/server-deploy/api/.htaccess`  
**Upload To:** `/public_html/api/.htaccess`

**CRITICAL:** The file MUST be named exactly `.htaccess` (with the dot at the start)

#### **Method A: cPanel File Manager (Recommended)**

1. Open cPanel → File Manager
2. Navigate to `/public_html/api/`
3. Click "Settings" (top right) → Check "Show Hidden Files (dotfiles)"
4. Click "Upload"
5. Upload the `.htaccess` file from `/server-deploy/api/.htaccess`

#### **Method B: Create Manually in cPanel**

1. Go to cPanel → File Manager
2. Navigate to `/public_html/api/`
3. Click "+ File"
4. Name it exactly: `.htaccess` (with the dot!)
5. Right-click → Edit
6. Paste this content:

```apache
# BlueHand Canvas API - Apache Configuration

RewriteEngine On

# Pass Authorization header to PHP (CRITICAL for admin auth)
RewriteCond %{HTTP:Authorization} .
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

# Enable CORS headers (CRITICAL for frontend to work)
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header always set Access-Control-Max-Age "3600"
</IfModule>

# Handle OPTIONS requests (preflight)
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ index.php [R=200,L]

# Route all requests through index.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [L,QSA]

# Disable directory listing
Options -Indexes

# PHP Settings
<IfModule mod_php7.c>
    php_value upload_max_filesize 20M
    php_value post_max_size 20M
    php_value max_execution_time 300
    php_value memory_limit 256M
</IfModule>
```

6. Click "Save Changes"

---

### **STEP 2: Upload index.php (Router)**

**File Location:** `/server-deploy/api/index.php`  
**Upload To:** `/public_html/api/index.php`

This file routes all API requests to the correct handlers (paintings.php, orders.php, etc.)

---

### **STEP 3: Test The Fix**

After uploading `.htaccess` and `index.php`:

1. **Test API Health:**
   ```
   https://bluehand.ro/api/
   ```
   Should return:
   ```json
   {
     "status": "ok",
     "message": "BlueHand Canvas API v1.0",
     "timestamp": "2025-01-20 12:00:00",
     "environment": "production"
   }
   ```

2. **Test Paintings API:**
   ```
   https://bluehand.ro/api/paintings
   ```
   Should return:
   ```json
   {"paintings": []}
   ```

3. **Test Orders API:**
   ```
   https://bluehand.ro/api/orders
   ```
   Should return:
   ```json
   {"error": "Unauthorized"}
   ```
   (This is correct! It means the API works but requires admin login)

4. **Test Sizes API:**
   ```
   https://bluehand.ro/api/sizes
   ```
   Should return:
   ```json
   {"sizes": [...]}
   ```

---

## ✅ **After Upload - Everything Will Work!**

### **What Will Be Fixed:**

1. ✅ **Paintings API** - "Failed to fetch" → WORKS!
2. ✅ **Orders API** - "Failed to fetch" → WORKS!
3. ✅ **Sizes API** - "Failed to fetch" → WORKS!
4. ✅ **CORS Errors** - All gone!
5. ✅ **Admin Panel** - Fully functional!
6. ✅ **Frontend** - Can load paintings!

---

## 📋 **Files You Need to Upload:**

All files are in `/server-deploy/api/` folder:

1. **`.htaccess`** ← **CRITICAL! Must upload first!**
2. **`index.php`** ← Routes all requests
3. **`config.php`** ← Already uploaded ✓
4. **`paintings.php`** ← Paintings CRUD
5. **`orders.php`** ← Orders CRUD
6. **`sizes.php`** ← Already working ✓
7. **`categories.php`** ← Already working ✓
8. **`frame-types.php`** ← Already working ✓
9. **`auth.php`** ← Login/authentication

---

## 🆘 **Troubleshooting:**

### **Error: "Internal Server Error" after uploading .htaccess**

**Cause:** Apache `mod_rewrite` or `mod_headers` not enabled

**Fix:** Contact your hosting provider or enable in cPanel:
1. cPanel → Apache Handlers
2. Enable `mod_rewrite`
3. Enable `mod_headers`

### **Error: Still "Failed to fetch"**

**Check 1:** File exists?
```bash
# In cPanel File Manager, navigate to /public_html/api/
# You should see:
.htaccess          ← MUST exist!
index.php          ← MUST exist!
config.php         ← Already there
paintings.php      ← Upload this
orders.php         ← Upload this
```

**Check 2:** .htaccess file is named correctly?
- ✅ Correct: `.htaccess` (with dot at start, no extension)
- ❌ Wrong: `htaccess`, `htaccess.txt`, `.htaccess.txt`

**Check 3:** Test with curl
```bash
curl -I https://bluehand.ro/api/
```

Should show:
```
HTTP/2 200
access-control-allow-origin: *
content-type: application/json
```

---

## 🎯 **Quick Action Checklist:**

- [ ] Upload `.htaccess` to `/public_html/api/`
- [ ] Upload `index.php` to `/public_html/api/`
- [ ] Upload `paintings.php` to `/public_html/api/`
- [ ] Upload `orders.php` to `/public_html/api/`
- [ ] Upload `auth.php` to `/public_html/api/`
- [ ] Test: https://bluehand.ro/api/
- [ ] Test: https://bluehand.ro/api/paintings
- [ ] Test: https://bluehand.ro/api/orders
- [ ] Refresh your app
- [ ] All errors GONE! ✓

---

## 🎉 **Expected Result:**

After uploading `.htaccess`:
- ✅ API health check works
- ✅ Paintings API returns data
- ✅ Orders API returns "Unauthorized" (correct!)
- ✅ Sizes API works (already working)
- ✅ No more CORS errors
- ✅ No more "Failed to fetch"
- ✅ Admin panel fully functional
- ✅ Frontend loads paintings

---

## ⚡ **DO THIS NOW:**

1. **Download** `/server-deploy/api/.htaccess`
2. **Upload to** `/public_html/api/.htaccess`
3. **Test** https://bluehand.ro/api/
4. **See magic happen!** 🎊

---

**The .htaccess file is THE missing piece! Upload it now!** 🚀
