# 🚨 CRITICAL FIX: .htaccess Configuration

## ❌ **Problem**
```
Error fetching paintings: TypeError: Failed to fetch
Error fetching orders: TypeError: Failed to fetch
```

**Root Cause:** The `.htaccess` file in `/public_html/.htaccess` needs API routing rules!

---

## ✅ **Solution**

### **Step 1: Update Root .htaccess**

**Location:** `/public_html/.htaccess` (NOT in the /api/ folder!)

Replace your entire `.htaccess` file with this content:

```apache
# BlueHand Canvas - Root .htaccess
# Location: /public_html/.htaccess

# Enable Rewrite Engine
RewriteEngine On

# Enable CORS for all requests
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"

# Handle OPTIONS preflight requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# ============================================================================
# API ROUTES - Route all /api/* requests to appropriate PHP files
# ============================================================================

# Route /api/paintings/* to paintings.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/paintings(.*)$ /api/paintings.php [L,QSA]

# Route /api/orders/* to orders.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/orders(.*)$ /api/orders.php [L,QSA]

# Route /api/auth/* to auth.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/auth(.*)$ /api/auth.php [L,QSA]

# Route /api/cart/* to cart.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/cart(.*)$ /api/cart.php [L,QSA]

# Route /api/unsplash/* to unsplash.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/unsplash(.*)$ /api/unsplash.php [L,QSA]

# Route /api/upload to upload.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/upload$ /api/upload.php [L,QSA]

# Default: Route /api/* to index.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ /api/index.php [L,QSA]

# ============================================================================
# FRONTEND ROUTES - Single Page Application (React Router)
# ============================================================================

# Don't rewrite files or directories that exist
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Don't rewrite API routes (already handled above)
RewriteCond %{REQUEST_URI} !^/api/

# Don't rewrite uploads
RewriteCond %{REQUEST_URI} !^/uploads/

# Route everything else to index.html for React Router
RewriteRule ^(.*)$ /index.html [L,QSA]
```

---

### **Step 2: How to Update in cPanel**

1. **Login to cPanel** at `https://bluehand.ro:2083`
2. **Open File Manager**
3. **Navigate to:** `/public_html/`
4. **Find:** `.htaccess` file (enable "Show Hidden Files" if you don't see it)
5. **Right-click** → **Edit**
6. **Replace entire content** with the code above
7. **Save** and close

---

### **Step 3: Test API Endpoints**

Open these URLs in your browser:

**1. Test Paintings:**
```
https://bluehand.ro/api/paintings
```
**Expected:** `{"paintings":[...]}`

**2. Test Orders:**
```
https://bluehand.ro/api/orders
```
**Expected:** `{"orders":[...]}`

**3. Test Unsplash:**
```
https://bluehand.ro/api/unsplash/settings
```
**Expected:** `{"success":true,"settings":{...}}`

**4. Test Auth:**
```
https://bluehand.ro/api/auth/test
```
**Expected:** JSON response

---

### **Step 4: Clear Browser Cache**

After updating .htaccess:

1. **Hard refresh:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Or clear cache:** Browser Settings → Clear browsing data

---

## 🔍 **Troubleshooting**

### **Still seeing errors?**

#### **1. Check file location**
- ✅ File: `/public_html/.htaccess` (in root, NOT in /api/)
- ❌ NOT: `/public_html/api/.htaccess` (delete this if it exists)

#### **2. Check file permissions**
```bash
-rw-r--r--  (644)
```

#### **3. Test direct PHP access**

Visit directly:
```
https://bluehand.ro/api/paintings.php
```

If this works but `https://bluehand.ro/api/paintings` doesn't, the .htaccess routing is broken.

#### **4. Check Apache modules**

In cPanel → Software → Select PHP Version:
- ✅ `mod_rewrite` must be enabled
- ✅ `mod_headers` must be enabled

#### **5. Check error logs**

cPanel → Metrics → Errors:
- Look for "File not found" 
- Look for "500 Internal Server Error"

---

## 📋 **File Structure**

Your server should have:

```
/public_html/
  ├── .htaccess              ← ROOT .htaccess (THIS IS THE ONE!)
  ├── index.html             ← React app
  ├── /api/
  │   ├── paintings.php
  │   ├── orders.php
  │   ├── auth.php
  │   ├── cart.php
  │   ├── unsplash.php
  │   ├── upload.php
  │   ├── config.php
  │   └── index.php
  └── /uploads/
      └── (uploaded files)
```

**IMPORTANT:** There should be NO `.htaccess` file inside `/public_html/api/`!

---

## ✅ **Verification Checklist**

After fixing:

- [ ] `.htaccess` updated in `/public_html/.htaccess` (root)
- [ ] NO `.htaccess` file in `/public_html/api/`
- [ ] File permissions set to 644
- [ ] `https://bluehand.ro/api/paintings` returns JSON ✅
- [ ] `https://bluehand.ro/api/orders` returns JSON ✅
- [ ] `https://bluehand.ro/api/unsplash/settings` returns JSON ✅
- [ ] Admin dashboard loads without errors ✅
- [ ] Paintings page displays images ✅
- [ ] Orders page shows data ✅

---

## 🎯 **What This Does**

The root `.htaccess` file:

1. **Routes API requests** - Sends `/api/paintings` → `/api/paintings.php`
2. **Enables CORS** - Allows frontend to call backend
3. **Handles SPA routing** - All non-API/non-file requests go to `index.html`
4. **Protects uploads** - Doesn't rewrite `/uploads/*` URLs

---

## ✨ **Success!**

Once updated:

1. All API endpoints work ✅
2. No more "Failed to fetch" errors ✅
3. Admin dashboard loads properly ✅
4. React Router works ✅

---

**The .htaccess file is in the ROOT, not in /api/!** 🚀
