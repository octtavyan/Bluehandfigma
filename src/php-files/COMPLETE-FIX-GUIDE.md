# 🎯 COMPLETE FIX GUIDE - Failed to Fetch Errors

## 📊 **Current Status**

✅ **Working:**
- `https://bluehand.ro/api/paintings` returns JSON in browser

❌ **Broken:**
- Frontend gets "Failed to fetch" when calling API
- CORS headers not being sent to browser

---

## 🔍 **Root Cause**

The `.htaccess` file **exists** and **routes correctly**, but **CORS headers are not being sent**.

**This happens when:**
1. `mod_headers` Apache module is **disabled**
2. `.htaccess` CORS directives are ignored
3. Browser blocks cross-origin requests

---

## 🔧 **3-Step Fix**

### **STEP 1: Enable mod_headers**

**In cPanel:**

1. Login to cPanel: `https://bluehand.ro:2083`
2. Go to **Software** section
3. Click **Select PHP Version** or **MultiPHP Manager**
4. Find **Apache Modules** section
5. **Enable these modules:**
   - ☑️ `mod_headers` ← **CRITICAL!**
   - ☑️ `mod_rewrite` ← Already enabled (routing works)
6. Click **Save**
7. **Restart Apache** (if option available)

**❌ If you don't see "Apache Modules":**
- Your host might not allow module configuration
- Contact support: *"Please enable mod_headers for my account"*

---

### **STEP 2: Update Root .htaccess**

**Location:** `/public_html/.htaccess` (ROOT, not in /api/)

**Content:**

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

**How to update:**

1. cPanel → File Manager
2. Navigate to `/public_html/`
3. Enable "Show Hidden Files" (Settings)
4. Find `.htaccess`
5. Right-click → Edit
6. Replace ALL content with code above
7. Save

---

### **STEP 3: Test & Verify**

#### **Test A: Check Headers with curl**

Open terminal and run:

```bash
curl -I https://bluehand.ro/api/paintings
```

**Expected output:**
```
HTTP/1.1 200 OK
access-control-allow-origin: *
access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
content-type: application/json
```

**✅ If you see these headers** → Fixed!

**❌ If missing** → `mod_headers` not enabled

---

#### **Test B: Check in Browser**

1. Open `https://bluehand.ro/api/paintings`
2. Press **F12** (DevTools)
3. Go to **Network** tab
4. Refresh page
5. Click on `paintings` request
6. Check **Response Headers** tab

**Must include:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

---

#### **Test C: Test Frontend**

1. Clear browser cache: `Ctrl+Shift+Delete`
2. Hard refresh: `Ctrl+Shift+R`
3. Open `https://bluehand.ro/admin`
4. Open Console (F12)

**Expected:** NO "Failed to fetch" errors ✅

**Broken:** Still seeing errors → See troubleshooting below

---

## 🆘 **Troubleshooting**

### **Issue: "Invalid command 'Header'"**

**Check error logs:**
- cPanel → Metrics → Errors
- Look for: `Invalid command 'Header'`

**This means:** `mod_headers` is NOT installed/enabled

**Solution:**
1. Contact hosting support
2. Ask: *"Please enable mod_headers Apache module"*
3. Wait for confirmation
4. Test again

---

### **Issue: mod_headers not available in cPanel**

Some hosts don't allow `.htaccess` header manipulation.

**Alternative solution:** Send headers from PHP only

**Update these files:**

**File:** `/public_html/api/config.php`

Add at **VERY TOP** (line 1):

```php
<?php
header_remove();
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ... existing config code below
```

**Do the same for:**
- `/public_html/api/paintings.php` ← Already has headers
- `/public_html/api/orders.php` ← Already has headers
- `/public_html/api/unsplash.php` ← Already has headers
- `/public_html/api/index.php`

---

### **Issue: Still getting errors after all fixes**

**Check browser console details:**

```
Failed to fetch
```

**This could mean:**

1. **Network issue** → Test curl from different network
2. **Firewall blocking** → Check server firewall rules
3. **SSL issue** → Verify SSL certificate is valid
4. **Cached failure** → Clear ALL browser data and try incognito mode

---

### **Issue: Works in incognito, fails in normal browser**

**This is cached failure!**

**Solution:**
1. Clear all browser data (not just cache)
2. Close ALL browser windows
3. Reopen browser
4. Try again

---

## 📋 **File Checklist**

Verify these files exist on your server:

**Structure:**
```
/public_html/
├── .htaccess              ← MUST have CORS headers
├── index.html             ← React app
├── /api/
│   ├── config.php        ← Database config
│   ├── paintings.php     ← Has CORS headers
│   ├── orders.php        ← Has CORS headers
│   ├── unsplash.php      ← Has CORS headers
│   ├── index.php         ← Fallback handler
│   ├── upload.php
│   ├── auth.php
│   └── cart.php
└── /uploads/             ← Uploaded files
```

**❌ DO NOT create** `.htaccess` inside `/api/` folder!

---

## ✅ **Success Indicators**

When everything works:

- [ ] `curl -I https://bluehand.ro/api/paintings` shows CORS headers
- [ ] Browser Network tab shows CORS headers
- [ ] Admin dashboard loads without errors
- [ ] Paintings page shows images
- [ ] Orders page shows data
- [ ] Unsplash search works
- [ ] NO console errors

---

## 🎯 **Summary**

**Problem:** CORS headers not sent → Browser blocks requests

**Solution:**
1. Enable `mod_headers` in cPanel
2. Add CORS to `/public_html/.htaccess`
3. Ensure PHP files send headers too (backup)
4. Clear browser cache
5. Test with curl and browser

**Most common issue:** `mod_headers` not enabled!

**Quick test:**
```bash
curl -I https://bluehand.ro/api/paintings | grep -i access-control
```

**Expected:** Shows `access-control-allow-origin: *`

**If empty:** `mod_headers` is OFF → Enable it!

---

## 📞 **Need Help from Hosting?**

**Email template:**

```
Subject: Please enable mod_headers Apache module

Hi,

I need to set CORS (Cross-Origin Resource Sharing) headers for my API.
Please enable the mod_headers Apache module for my account.

Domain: bluehand.ro
Account: [your cpanel username]

Thank you!
```

---

**After following this guide, your API will work!** 🚀
