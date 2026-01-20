# 🔍 DEBUG: CORS "Failed to Fetch" Error

## 🚨 **Current Problem**

```
Error fetching paintings: TypeError: Failed to fetch
Error fetching orders: TypeError: Failed to fetch
Error loading search stats: TypeError: Failed to fetch
Failed to track search: TypeError: Failed to fetch
```

**BUT:** `https://bluehand.ro/api/paintings` works when opened directly in browser! ✅

This means:
- ✅ PHP files exist
- ✅ .htaccess routing works  
- ❌ **CORS headers are NOT being sent properly**

---

## 🔬 **Step-by-Step Diagnosis**

### **Test 1: Check CORS Headers in Browser**

1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Visit: `https://bluehand.ro/api/paintings`
4. Click on the `paintings` request
5. Look at **Response Headers**

**What you should see:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Content-Type: application/json
```

**❌ If you DON'T see these headers** → CORS headers aren't being sent!

---

### **Test 2: Check with curl (from your computer)**

Open Terminal/Command Prompt and run:

```bash
curl -v https://bluehand.ro/api/paintings
```

**Look for these headers in the response:**
```
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
< Content-Type: application/json
```

**❌ If missing** → Problem is in PHP or Apache configuration

---

### **Test 3: Check .htaccess is working**

1. Login to cPanel → File Manager
2. Go to `/public_html/`
3. Find `.htaccess` file
4. **Check it contains:**

```apache
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</IfModule>
```

**If missing or different** → Upload the correct `.htaccess` from `/server-deploy/.htaccess`

---

### **Test 4: Check mod_headers is enabled**

**In cPanel:**

1. Software → **Select PHP Version**
2. Look for **Apache Modules**
3. **Verify these are enabled:**
   - ✅ `mod_headers`
   - ✅ `mod_rewrite`

**❌ If not enabled** → Enable them and restart Apache

---

## 🔧 **Most Likely Fixes**

### **Fix #1: Update .htaccess with proper CORS**

**File:** `/public_html/.htaccess`

Replace entire content with this:

```apache
# BlueHand Canvas - Root .htaccess
RewriteEngine On
RewriteBase /

# Enable CORS - CRITICAL!
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header always set Access-Control-Max-Age "3600"
</IfModule>

# Handle OPTIONS preflight
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# API Routes
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

# React Router - Frontend
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/uploads/
RewriteRule ^(.*)$ /index.html [L,QSA]
```

**Then:** Restart Apache in cPanel

---

### **Fix #2: Update config.php**

**File:** `/public_html/api/config.php`

Make sure CORS headers are sent at the VERY TOP:

```php
<?php
// CORS headers - MUST be first!
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ... rest of config
```

---

### **Fix #3: Check Apache Configuration**

Some hosting providers override `.htaccess` headers. You might need to add this to your hosting's Apache config:

**Contact your hosting support and ask them to enable:**

```apache
<Directory "/public_html">
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</Directory>
```

---

### **Fix #4: Alternative - Use PHP only (no .htaccess headers)**

If `.htaccess` headers don't work, update ALL PHP files to send headers with `header_remove()` first:

```php
<?php
// Remove any existing headers
header_remove();

// Send CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ... rest of PHP file
```

---

## 🧪 **After Each Fix - Test**

1. **Clear browser cache:** Ctrl+Shift+Delete → Clear all
2. **Hard refresh:** Ctrl+Shift+R
3. **Open DevTools → Network tab**
4. **Reload page**
5. **Check if fetch errors are gone**

---

## ✅ **How to Know It's Fixed**

When it's working:

1. ✅ No "Failed to fetch" errors in console
2. ✅ Network tab shows `paintings` request with status **200**
3. ✅ Response headers include `Access-Control-Allow-Origin: *`
4. ✅ Admin dashboard loads paintings and orders
5. ✅ Unsplash integration works

---

## 🆘 **If Still Not Working**

### **Check Server Error Logs**

cPanel → **Metrics** → **Errors**

Look for:
- `mod_headers not found`
- `Invalid command 'Header'`
- `.htaccess: Invalid command`

**This means:** `mod_headers` is not enabled on your server!

**Solution:** Contact hosting support to enable `mod_headers`

---

## 📋 **Quick Checklist**

- [ ] `.htaccess` in `/public_html/` with CORS headers
- [ ] `mod_headers` enabled in Apache
- [ ] `mod_rewrite` enabled in Apache
- [ ] All PHP files send CORS headers at top
- [ ] Browser cache cleared
- [ ] Hard refresh done (Ctrl+Shift+R)
- [ ] Network tab shows 200 responses
- [ ] Response headers include CORS headers

---

## 🎯 **Root Cause**

The issue is that **CORS headers are not being sent** by the server.

This can happen if:
1. ❌ `.htaccess` doesn't have `<IfModule mod_headers.c>` section
2. ❌ `mod_headers` Apache module is disabled
3. ❌ PHP files don't send headers before other output
4. ❌ Apache config overrides `.htaccess`
5. ❌ Browser is caching old failed requests

---

**The fix is to ensure CORS headers are sent with EVERY API response!** 🚀
