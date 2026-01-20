# 🎯 BlueHand Canvas - Own Server Deployment

## 📋 Summary

You asked to deploy on **your own server** instead of using GitHub + Supabase. 

**✅ I've created a complete PHP backend for you!**

---

## 🎉 What's Ready

All files are in the `/server-deploy/` folder:

```
/server-deploy/
├── .htaccess              ✅ Apache rewrite rules
└── api/
    ├── index.php          ✅ API router with health check
    ├── config.php         ✅ Database configuration (EDIT THIS!)
    ├── paintings.php      ✅ All paintings endpoints
    ├── orders.php         ✅ All orders endpoints
    ├── auth.php           ✅ Admin authentication
    └── upload.php         ✅ File upload handler
```

---

## 📚 Documentation Created

1. **`DEPLOY_NOW.md`** ⭐ **START HERE!**
   - Complete deployment guide
   - Step-by-step instructions
   - Testing procedures

2. **`QUICK_FTP_GUIDE.md`**
   - Detailed FTP upload guide
   - FileZilla instructions
   - Troubleshooting tips

3. **`SIMPLE_DEPLOY_CHECKLIST.md`**
   - 30-minute complete setup
   - Full PHP code included

4. **`DEPLOY_TO_OWN_SERVER.md`**
   - Detailed technical documentation
   - Architecture explanation
   - Security recommendations

---

## ⚡ Quick Start (3 Steps)

### Step 1: Edit config.php (2 minutes)

Open: `/server-deploy/api/config.php`

Change line 7:
```php
define('DB_PASS', 'YOUR_MYSQL_PASSWORD_HERE');
```
to:
```php
define('DB_PASS', 'your_actual_mysql_password');
```

### Step 2: Upload via FTP (5 minutes)

**Upload these files to your server:**
- `/server-deploy/.htaccess` → `/public_html/.htaccess`
- `/server-deploy/api/*` → `/public_html/api/*`

**Create these folders:**
- `/public_html/uploads/paintings/`
- `/public_html/uploads/orders/`
- `/public_html/uploads/sliders/`
- `/public_html/uploads/blog/`

### Step 3: Test (1 minute)

Visit: `https://bluehand.ro/api/health`

**Should see:**
```json
{
  "status": "ok",
  "message": "BlueHand Canvas API v1.0"
}
```

✅ **If you see this → API WORKS!**

---

## 🎯 Architecture

### Old Way (Complex):
```
User → GitHub Pages → Supabase Edge Functions → Supabase DB
                     ↓
              Costly egress: $100-170/month
```

### New Way (Simple):
```
User → Your Server → PHP Backend → MySQL DB
                   ↓
            Everything local: $0 extra cost!
```

---

## 🚀 API Endpoints Included

### Public Endpoints:
- ✅ `GET /api/health` - Health check
- ✅ `GET /api/test-db` - Database connection test
- ✅ `GET /api/paintings` - Get all paintings
- ✅ `GET /api/paintings/{slug}` - Get single painting
- ✅ `GET /api/categories` - Get all categories
- ✅ `GET /api/settings` - Get settings
- ✅ `POST /api/orders` - Create order
- ✅ `GET /api/orders/{id}` - Get order (public)
- ✅ `POST /api/upload` - Upload image

### Admin Endpoints (Require Authentication):
- ✅ `POST /api/auth/login` - Admin login
- ✅ `POST /api/auth/verify` - Verify token
- ✅ `POST /api/auth/change-password` - Change password
- ✅ `POST /api/paintings` - Create painting
- ✅ `PUT /api/paintings/{id}` - Update painting
- ✅ `DELETE /api/paintings/{id}` - Delete painting
- ✅ `GET /api/orders` - Get all orders (admin)
- ✅ `PUT /api/orders/{id}` - Update order
- ✅ `DELETE /api/orders/{id}` - Delete order

---

## 🔒 Security Features

- ✅ Password hashing with `password_hash()`
- ✅ JWT-like token authentication
- ✅ SQL injection prevention with PDO prepared statements
- ✅ File type validation for uploads
- ✅ CORS headers configured
- ✅ Protected config files via `.htaccess`
- ✅ Error logging (not displayed to users)

---

## 📊 Database Configuration

**In `config.php`:**
```php
DB_HOST: 'localhost'           ← Same server!
DB_PORT: '3306'
DB_NAME: 'wiseguy_bluehand'
DB_USER: 'wiseguy_bluehand'
DB_PASS: 'your_password'       ← Change this!
```

**Why `localhost`?**
- Database and website are on the SAME server
- No remote MySQL needed
- Faster and more secure
- No networking issues

---

## 📁 File Structure After Deployment

```
Your Server: 89.41.38.220 / bluehand.ro
└── /public_html/
    ├── .htaccess                   ← URL rewriting
    ├── index.html                  ← React app (later)
    ├── assets/                     ← React assets (later)
    ├── api/                        ← PHP backend ✅
    │   ├── index.php
    │   ├── config.php
    │   ├── paintings.php
    │   ├── orders.php
    │   ├── auth.php
    │   ├── upload.php
    │   └── error.log              ← Error logs
    └── uploads/                    ← File storage ✅
        ├── paintings/
        ├── orders/
        ├── sliders/
        └── blog/
```

---

## 🧪 Testing Checklist

After uploading, test each endpoint:

- [ ] **Health Check:** `https://bluehand.ro/api/health`
  - Should return: `{"status":"ok"}`

- [ ] **Database Test:** `https://bluehand.ro/api/test-db`
  - Should return: `{"status":"ok", "paintings_count": 0}`

- [ ] **Get Paintings:** `https://bluehand.ro/api/paintings`
  - Should return: `{"paintings": []}`

- [ ] **Get Categories:** `https://bluehand.ro/api/categories`
  - Should return: `{"categories": [...]}`

- [ ] **Get Settings:** `https://bluehand.ro/api/settings`
  - Should return: `{"settings": {...}}`

---

## 💰 Cost Comparison

### Before (Supabase + GitHub):
- Supabase egress: $100-170/month
- GitHub Pages: Free
- **Total: $100-170/month**

### After (Your Server Only):
- Server hosting: [what you already pay]
- API hosting: $0 (on same server)
- Database: $0 (on same server)
- File storage: $0 (on same server)
- **Total: $0 additional cost!**

**Annual savings: $1,200 - $2,040** 🎉

---

## 🔧 Requirements

Your server needs:
- ✅ PHP 7.4 or higher
- ✅ Apache with mod_rewrite
- ✅ MySQL 5.7 or higher
- ✅ PDO MySQL extension
- ✅ FTP access
- ✅ File write permissions

**Most cPanel hosting includes all of these!**

---

## 🆘 Troubleshooting

### Problem: "404 Not Found" when visiting `/api/health`

**Solution:**
1. Check if `.htaccess` is uploaded to `/public_html/`
2. Verify mod_rewrite is enabled (contact hosting support)
3. Make sure file permissions are correct (644 for .htaccess)

---

### Problem: "Database connection failed"

**Solution:**
1. Open `/public_html/api/config.php`
2. Verify these settings:
   - `DB_HOST` = `'localhost'` (NOT an IP address!)
   - `DB_NAME` = `'wiseguy_bluehand'`
   - `DB_USER` = `'wiseguy_bluehand'`
   - `DB_PASS` = your actual MySQL password
3. Test database connection via phpMyAdmin

---

### Problem: "500 Internal Server Error"

**Solution:**
1. Check error log: `/public_html/api/error.log`
2. Verify PHP version is 7.4+ (check in cPanel)
3. Make sure PDO MySQL extension is enabled
4. Check file permissions:
   - PHP files: 644
   - Folders: 755

---

### Problem: Can't upload images

**Solution:**
1. Check folder exists: `/public_html/uploads/paintings/`
2. Set permissions: 755
3. Check `config.php`:
   - `UPLOAD_DIR` should be `dirname(__DIR__) . '/uploads/'`
   - `UPLOAD_URL` should be `https://bluehand.ro/uploads/`
4. Check PHP upload settings:
   - `upload_max_filesize` = 10M or higher
   - `post_max_size` = 10M or higher

---

## 📞 Support Resources

### Check error logs:
```
/public_html/api/error.log
```

### Check PHP version:
Create `/public_html/phpinfo.php`:
```php
<?php phpinfo(); ?>
```
Visit: `https://bluehand.ro/phpinfo.php`
(Delete after checking!)

### Test database via phpMyAdmin:
1. Log into cPanel
2. Open phpMyAdmin
3. Select `wiseguy_bluehand` database
4. Run: `SELECT * FROM paintings;`

---

## ✅ Next Steps

After API is working:

### Step 1: Update Frontend
The React app needs to know where the API is.

**Will do later:** Update API URLs in frontend code to use:
- `https://bluehand.ro/api/`

### Step 2: Build React App
```bash
npm install
npm run build
```

### Step 3: Upload Frontend
Upload contents of `dist/` folder to `/public_html/`

### Step 4: Done!
Visit: `https://bluehand.ro`

---

## 🎉 Benefits of This Approach

✅ **No external dependencies** - Everything on your server
✅ **No egress costs** - All data stays local
✅ **Simple architecture** - Just PHP + MySQL
✅ **Full control** - You own everything
✅ **Easy to debug** - Check error logs directly
✅ **Fast performance** - No network hops
✅ **Secure** - No remote database connections

---

## 📖 What To Read Next

**For uploading:** Read `QUICK_FTP_GUIDE.md`
**For testing:** Read `DEPLOY_NOW.md`
**For details:** Read `DEPLOY_TO_OWN_SERVER.md`

---

## 🚀 Current Status

**✅ Backend code ready**
**✅ Documentation complete**
**⏳ Waiting for you to upload files**

**Estimated upload time:** 10 minutes
**Estimated total setup:** 15 minutes

---

**Let's get your API working!** 🎯

Upload the files and test `https://bluehand.ro/api/health` - let me know what you see!
