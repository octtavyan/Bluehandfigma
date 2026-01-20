# 🚨 URGENT FIX - CORS Headers Not Working

## ✅ **What Works**
- `https://bluehand.ro/api/paintings` → Opens in browser ✅
- PHP files exist and run ✅
- .htaccess routing works ✅

## ❌ **What's Broken**
- Frontend can't fetch from API ❌
- "Failed to fetch" errors ❌
- **CORS headers not being sent!** ❌

---

## 🔥 **IMMEDIATE ACTION REQUIRED**

### **Step 1: Check if mod_headers is enabled**

**In cPanel:**
1. Go to **Software** → **Select PHP Version**
2. Click **Switch To PHP Options** or **Extensions**
3. **Look for Apache Modules**
4. **Verify these are CHECKED:**
   - ☑️ `mod_headers`
   - ☑️ `mod_rewrite`

**❌ If NOT checked** → Check them and click **Save**!

---

### **Step 2: Verify .htaccess Location**

**File MUST be at:** `/public_html/.htaccess` (ROOT directory!)

**NOT at:** `/public_html/api/.htaccess` ❌

---

### **Step 3: Update .htaccess**

Copy this **EXACT** content to `/public_html/.htaccess`:

```apache
RewriteEngine On
RewriteBase /

<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header always set Access-Control-Max-Age "3600"
</IfModule>

RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/paintings(.*)$ /api/paintings.php [L,QSA]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/orders(.*)$ /api/orders.php [L,QSA]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/unsplash(.*)$ /api/unsplash.php [L,QSA]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ /api/index.php [L,QSA]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/uploads/
RewriteRule ^(.*)$ /index.html [L,QSA]
```

---

### **Step 4: Test CORS Headers**

**Method A: Browser Test**

1. Open: `https://bluehand.ro/api/paintings`
2. Press **F12** (DevTools)
3. Go to **Network** tab
4. Refresh page
5. Click on `paintings` request
6. Check **Response Headers**

**You MUST see:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

**❌ If missing** → `mod_headers` is NOT enabled!

---

**Method B: curl Test**

```bash
curl -v https://bluehand.ro/api/paintings
```

**Look for:**
```
< access-control-allow-origin: *
< access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
```

---

### **Step 5: Clear Cache & Test**

1. In browser: Ctrl+Shift+Delete → Clear all browsing data
2. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. Open admin dashboard
4. Check console for errors

**Expected:** NO "Failed to fetch" errors ✅

---

## 🆘 **If Still Broken**

### **Problem: mod_headers not available**

**Some cheap hosting** doesn't allow `.htaccess` to set headers.

**Solution:** Contact hosting support:

> "Please enable mod_headers Apache module for my account. I need to set CORS headers in .htaccess for my API."

---

### **Alternative: PHP-only CORS (if mod_headers unavailable)**

If your host doesn't support `mod_headers`, you need to **edit ALL PHP files** and add this at the VERY TOP (before any other code):

```php
<?php
header_remove(); // Remove any default headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ... rest of PHP code
```

**Files to update:**
- `/public_html/api/paintings.php`
- `/public_html/api/orders.php`
- `/public_html/api/unsplash.php`
- `/public_html/api/index.php`
- `/public_html/api/config.php`

---

## ✅ **Success Checklist**

After fixing, you should have:

- [ ] `mod_headers` enabled in cPanel
- [ ] `.htaccess` in `/public_html/` (root)
- [ ] CORS headers in `.htaccess`
- [ ] No `.htaccess` in `/public_html/api/`
- [ ] Browser cache cleared
- [ ] `curl -v https://bluehand.ro/api/paintings` shows CORS headers
- [ ] Browser DevTools shows CORS headers in Network tab
- [ ] NO "Failed to fetch" errors in console
- [ ] Admin dashboard loads data successfully

---

## 🎯 **Root Cause**

**The problem is:** CORS headers are NOT being sent!

**Why:** Either `mod_headers` is disabled OR `.htaccess` is in wrong location

**Fix:** Enable `mod_headers` + Put `.htaccess` in `/public_html/` (root)

---

**DO THIS NOW:**

1. ✅ Enable `mod_headers` in cPanel
2. ✅ Update `/public_html/.htaccess`
3. ✅ Test with curl
4. ✅ Clear browser cache
5. ✅ Reload admin dashboard

**It will work!** 🚀
