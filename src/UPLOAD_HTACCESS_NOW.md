# 🔥 CRITICAL FIX - Upload .htaccess File to Server

## 🎯 THE ISSUE
Your 401 errors happen because **Apache isn't passing the Authorization header to PHP**.

## ✅ THE FIX - Upload .htaccess File

### Step 1: Get the File
I've created: `/server-deploy/htaccess-file-rename-to-dothtaccess.txt`

### Step 2: Upload to Server via FTP/SSH

#### Option A: Using FileZilla (FTP)
```
1. Open FileZilla
2. Connect to: 89.41.38.220
3. Navigate to: /bluehand.ro/api/
4. Upload: htaccess-file-rename-to-dothtaccess.txt
5. After upload, right-click → Rename to: .htaccess
   (delete the .txt, add a dot at the start)
6. Done!
```

#### Option B: Using SSH (Terminal)
```bash
# 1. Upload the file
scp /path/to/htaccess-file-rename-to-dothtaccess.txt user@89.41.38.220:/bluehand.ro/api/

# 2. Connect via SSH
ssh user@89.41.38.220

# 3. Rename the file
cd /bluehand.ro/api/
mv htaccess-file-rename-to-dothtaccess.txt .htaccess

# 4. Set permissions
chmod 644 .htaccess

# Done!
```

#### Option C: Create Directly on Server
```bash
# 1. SSH into server
ssh user@89.41.38.220

# 2. Navigate to api folder
cd /bluehand.ro/api/

# 3. Create .htaccess file
nano .htaccess

# 4. Paste this content:
```

```apache
# BlueHand Canvas API - Apache Configuration

# Enable Rewrite Engine
RewriteEngine On

# Pass Authorization header to PHP - CRITICAL!
RewriteCond %{HTTP:Authorization} .
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

# Enable CORS headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"

# Handle OPTIONS requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Route all requests through index.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php/$1 [L,QSA]

# Disable directory listing
Options -Indexes

# PHP Settings
php_value upload_max_filesize 20M
php_value post_max_size 20M
php_value max_execution_time 300
php_value memory_limit 256M
```

```bash
# 5. Save and exit (Ctrl+X, then Y, then Enter)

# 6. Set permissions
chmod 644 .htaccess

# 7. Verify file exists
ls -la | grep htaccess
# Should show: -rw-r--r-- .htaccess
```

---

## 🧪 VERIFY IT WORKS

### After Upload:

1. **Check file exists:**
   ```bash
   ssh user@89.41.38.220
   cd /bluehand.ro/api/
   ls -la .htaccess
   # Should show: -rw-r--r-- 1 user user 1234 Jan 19 12:00 .htaccess
   ```

2. **Test in browser:**
   - Login: https://bluehand.ro/admin/login
   - Go to: Admin → Printuri si Canvas
   - Create a painting
   - Open Console (F12)
   - Should see: ✅ `POST /api/paintings 201` (not 401!)

3. **Check diagnostic:**
   - Go to: https://bluehand.ro/diagnostic.html
   - Click "Re-run Diagnostics"
   - Should show: ✅ All APIs return 200 OK

---

## 🚨 CRITICAL INFO

### Why .htaccess is needed:
```
WITHOUT .htaccess:
Browser sends → Authorization: Bearer abc123
Apache receives → Authorization: Bearer abc123
PHP receives → (nothing) ❌
Backend returns → 401 Unauthorized

WITH .htaccess:
Browser sends → Authorization: Bearer abc123
Apache receives → Authorization: Bearer abc123
.htaccess forwards → HTTP_AUTHORIZATION: Bearer abc123
PHP receives → ✅ Valid token
Backend returns → 200 OK
```

### File must be named exactly:
- ✅ Correct: `.htaccess` (with dot, no extension)
- ❌ Wrong: `htaccess.txt`
- ❌ Wrong: `htaccess`
- ❌ Wrong: `.htaccess.txt`

---

## 🔍 TROUBLESHOOTING

### Issue: Can't see .htaccess after upload
**Cause:** Hidden files not shown

**Solution:**
```bash
# Via SSH:
ls -la /bluehand.ro/api/ | grep htaccess

# Via FileZilla:
View → Show hidden files → Refresh
```

### Issue: 500 Internal Server Error after upload
**Cause:** Server doesn't support RewriteEngine

**Solution:**
```bash
# Edit .htaccess, comment out rewrite lines:
# RewriteEngine On
# RewriteCond %{HTTP:Authorization} .
# RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

# Or use PHP-only solution (I'll provide if needed)
```

### Issue: Still 401 after upload
**Check:**
1. File is named `.htaccess` (not .txt)
2. File is in `/bluehand.ro/api/` folder
3. Permissions are 644: `chmod 644 .htaccess`
4. Clear browser cache and logout/login

---

## 📋 QUICK CHECKLIST

Before upload:
- [ ] I have access to server via FTP or SSH
- [ ] I know the path: `/bluehand.ro/api/`
- [ ] I have the htaccess content ready

After upload:
- [ ] File is named `.htaccess` (with dot!)
- [ ] File is in `/bluehand.ro/api/.htaccess`
- [ ] File permissions are 644
- [ ] Logged out and logged back in
- [ ] Tested creating a painting
- [ ] ✅ No 401 errors in console!

---

## 🎯 NEXT STEPS

1. **Upload .htaccess to server** (Option A, B, or C above)
2. **Also upload updated config.php** (already in `/server-deploy/api/config.php`)
3. **Test:** Login + Create painting
4. **Verify:** Console shows 201, not 401
5. **Celebrate!** 🎉

---

**THE MOST CRITICAL FILE IS .htaccess - WITHOUT IT, AUTH WON'T WORK!**

Upload it now and let me know the result! 🚀
