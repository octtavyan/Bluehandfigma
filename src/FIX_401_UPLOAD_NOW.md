# 🔥 FIX 401 UNAUTHORIZED - UPLOAD 2 FILES NOW!

## 🎯 THE PROBLEM

Your server isn't passing the `Authorization` header to PHP, so the backend can't validate your login token.

**Console shows:**
```
POST /api/index.php/paintings 401 (Unauthorized)
GET /api/index.php/orders 401 (Unauthorized)
```

**Why:** Apache isn't forwarding the Authorization header to PHP.

---

## ✅ THE FIX - Upload 2 Files

### File 1: `config.php` (Updated auth handling)
**Location:** `/server-deploy/api/config.php`
**Upload to:** `89.41.38.220:/bluehand.ro/api/config.php`

**What it fixes:**
- ✅ Tries 3 different methods to get Authorization header
- ✅ Checks `$_SERVER['HTTP_AUTHORIZATION']`
- ✅ Checks `$_SERVER['REDIRECT_HTTP_AUTHORIZATION']` (Apache)
- ✅ Checks `getallheaders()['Authorization']`
- ✅ Adds detailed error logging

### File 2: `.htaccess` (NEW - Forces Apache to pass header)
**Location:** `/server-deploy/api/.htaccess`
**Upload to:** `89.41.38.220:/bluehand.ro/api/.htaccess`

**What it fixes:**
- ✅ Forces Apache to pass Authorization header to PHP
- ✅ Enables proper CORS headers
- ✅ Routes all requests through index.php
- ✅ Handles OPTIONS preflight requests

---

## 🔼 UPLOAD STEPS

### Using FileZilla:

1. **Connect to server:**
   - Host: `89.41.38.220`
   - Username: Your FTP username
   - Password: Your FTP password

2. **Navigate to `/bluehand.ro/api/`**

3. **Upload File 1:**
   - Drag `config.php` from `/server-deploy/api/config.php`
   - Overwrite existing file

4. **Upload File 2:**
   - Drag `.htaccess` from `/server-deploy/api/.htaccess`
   - **Important:** Show hidden files in FileZilla (View → Show hidden files)
   - This is a NEW file (didn't exist before)

5. **Done!**

---

## 🧪 TEST IMMEDIATELY

### Test 1: Create Painting
```
1. Go to: https://bluehand.ro/admin/login
2. Login with your credentials
3. Go to: Admin → Printuri si Canvas
4. Click "Adaugă Tablou Nou"
5. Fill in form and click "Salvează"
6. ✅ Should save successfully!
7. ✅ Should appear in list immediately!
```

### Test 2: Check Console
```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Create a painting
4. Should see:
   ✅ POST /api/index.php/paintings 201 (Created)
   NOT:
   ❌ POST /api/index.php/paintings 401 (Unauthorized)
```

### Test 3: Run Diagnostic
```
1. Go to: https://bluehand.ro/diagnostic.html
2. Click "Re-run Diagnostics"
3. Should see:
   ✅ Has Token: YES
   ✅ Paintings API: 200 OK
   ✅ Orders API: 200 OK (after login)
```

---

## 🔍 What Changed

### Before (Broken):
```php
// OLD config.php - Only checked one variable
function requireAuth() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    // ❌ Fails if Apache rewrites header name
}
```

```apache
# NO .htaccess file
# ❌ Apache doesn't forward Authorization header
```

### After (Fixed):
```php
// NEW config.php - Checks 3 different variables
function requireAuth() {
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'];
    }
    // ✅ Works with all Apache configurations
}
```

```apache
# NEW .htaccess file
RewriteCond %{HTTP:Authorization} .
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
# ✅ Forces Apache to pass header to PHP
```

---

## 📋 AFTER UPLOAD CHECKLIST

- [ ] Uploaded `config.php` to `/bluehand.ro/api/`
- [ ] Uploaded `.htaccess` to `/bluehand.ro/api/`
- [ ] Logged in at `/admin/login`
- [ ] Tried creating a painting
- [ ] ✅ Success! No 401 error
- [ ] Painting saved and appears in list

---

## 🚨 IMPORTANT NOTES

### About `.htaccess`:
- ✅ File name starts with a dot: `.htaccess`
- ✅ No extension (not `.htaccess.txt`)
- ✅ Must be in `/bluehand.ro/api/` folder
- ✅ Make sure "Show hidden files" is enabled in FTP client

### If Still Getting 401:
1. Check server error log: `/bluehand.ro/api/error.log`
2. Look for these messages:
   - `🔐 requireAuth: authHeader=Bearer ...` ✅ Header received
   - `❌ requireAuth: No token provided` ❌ Header not passed
3. Take screenshot and share

---

## 🔥 WHY THIS WORKS

**The Problem:**
- Your React app sends: `Authorization: Bearer <token>`
- Apache receives it correctly
- But Apache doesn't pass it to PHP by default
- PHP sees no header, returns 401

**The Fix:**
- `.htaccess` tells Apache: "Pass Authorization header to PHP!"
- `config.php` checks multiple header locations (just in case)
- PHP receives header, validates token, allows request
- ✅ Everything works!

---

## 📸 WHAT YOU SHOULD SEE

### After Creating Painting:

**Console (F12):**
```
✅ POST https://bluehand.ro/api/index.php/paintings 201
✅ Painting added successfully
```

**Admin Panel:**
```
✅ Painting appears in list immediately
✅ Can edit, delete, toggle active
```

**Diagnostic Page:**
```
✅ Has Token: YES
✅ Paintings API: 200 OK
✅ Paintings Found: 1
✅ Paintings in DB: 1
```

---

**UPLOAD NOW:**
1. `/server-deploy/api/config.php` → Server
2. `/server-deploy/api/.htaccess` → Server (NEW FILE!)

**TEST:** Create a painting - it should work! 🎨

---

## 🆘 TROUBLESHOOTING

### Issue: FileZilla doesn't show .htaccess
**Solution:**
1. FileZilla → Server menu
2. Click "Force showing hidden files"
3. Refresh directory
4. Upload .htaccess

### Issue: .htaccess causes 500 error
**Solution:**
1. Some servers don't allow RewriteEngine
2. Contact hosting provider
3. Or try alternate .htaccess (I'll provide)

### Issue: Still 401 after upload
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Logout and login again
3. Check error.log on server
4. Share error.log contents

---

**CRITICAL:** The `.htaccess` file is the key! Make sure it uploads correctly! ✨
