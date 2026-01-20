# 🧪 Test Your API - Step by Step

## 📁 Files to Re-upload

I fixed the routing issue! Re-upload these files:

### 1. Upload Updated index.php
**File:** `/server-deploy/api/index.php`
**Destination:** `/public_html/bluehand.ro/api/index.php`
**What changed:** Added fix to handle direct access (removes "index.php" from path)

### 2. Upload Updated .htaccess
**File:** `/server-deploy/.htaccess`
**Destination:** `/public_html/bluehand.ro/.htaccess`
**What changed:** Simplified rewrite rules

---

## ✅ Tests to Run

After re-uploading, test these URLs in order:

### Test 1: Direct Access to index.php
```
https://bluehand.ro/api/index.php
```

**Expected result:**
```json
{
  "status": "ok",
  "message": "BlueHand Canvas API v1.0",
  "timestamp": "2026-01-19 ...",
  "environment": "production"
}
```

✅ **If you see this → index.php is working!**

---

### Test 2: Health Check via Clean URL
```
https://bluehand.ro/api/health
```

**Expected result:**
```json
{
  "status": "ok",
  "message": "BlueHand Canvas API v1.0"
}
```

✅ **If you see this → .htaccess rewrite is working!**

---

### Test 3: Database Connection
```
https://bluehand.ro/api/index.php/test-db
```

**Expected result (SUCCESS):**
```json
{
  "status": "ok",
  "message": "Database connected",
  "paintings_count": 0
}
```

**Or (ERROR):**
```json
{
  "status": "error",
  "message": "Database error: SQLSTATE[HY000] [2002] ..."
}
```

---

### Test 4: Get Paintings
```
https://bluehand.ro/api/index.php/paintings
```

**Expected result:**
```json
{
  "paintings": []
}
```

---

## 🔧 If Database Test Fails

The error message will tell us what's wrong. Common issues:

### Error: "SQLSTATE[HY000] [2002] Connection refused"
**Cause:** Wrong database host
**Fix:** In `config.php`, make sure `DB_HOST` is `'localhost'`

### Error: "SQLSTATE[HY000] [1045] Access denied"
**Cause:** Wrong username or password
**Fix:** In `config.php`, verify:
- `DB_USER` matches your MySQL username
- `DB_PASS` matches your MySQL password

### Error: "SQLSTATE[HY000] [1049] Unknown database"
**Cause:** Database doesn't exist
**Fix:** Create database `wiseguy_bluehand` in phpMyAdmin

---

## 📋 Current Folder Structure

Based on your screenshot, files should be at:

```
/public_html/bluehand.ro/
├── .htaccess              ← Re-upload this!
├── index.html             ← Your React app (already working!)
├── assets/                ← React assets
├── api/                   ← API folder
│   ├── index.php          ← Re-upload this!
│   ├── config.php         ← Already uploaded
│   ├── paintings.php      ← Already uploaded
│   ├── orders.php         ← Already uploaded
│   ├── auth.php           ← Already uploaded
│   └── upload.php         ← Already uploaded
└── uploads/               ← For images
    ├── paintings/
    ├── orders/
    ├── sliders/
    └── blog/
```

---

## 🎯 Step-by-Step Action Plan

### Step 1: Re-upload index.php
1. Download `/server-deploy/api/index.php` from this project
2. Upload to `/public_html/bluehand.ro/api/index.php`
3. Overwrite the existing file

### Step 2: Re-upload .htaccess
1. Download `/server-deploy/.htaccess` from this project
2. Upload to `/public_html/bluehand.ro/.htaccess`
3. Overwrite if it already exists

### Step 3: Test!
Visit: `https://bluehand.ro/api/index.php`

**What do you see?**

---

## 🆘 Troubleshooting

### Still getting 404?
- Make sure files are in `/public_html/bluehand.ro/api/` (NOT `/public_html/api/`)
- Check file permissions: 644 for PHP files

### Getting blank page?
- Check `/public_html/bluehand.ro/api/error.log`
- Make sure PHP version is 7.4+

### Getting JSON error?
- Copy the FULL error message
- It will tell us exactly what to fix!

---

## ✅ Success Checklist

After re-uploading, you should be able to visit:

- [ ] `https://bluehand.ro/api/index.php` → ✅ Shows "status: ok"
- [ ] `https://bluehand.ro/api/health` → ✅ Shows "status: ok"
- [ ] `https://bluehand.ro/api/index.php/test-db` → ✅ Shows database status
- [ ] `https://bluehand.ro/api/index.php/paintings` → ✅ Shows empty array

---

## 🎉 Next Step

Once Test 1 works (seeing JSON from `/api/index.php`), we'll test the database connection!

**Let me know what you see after re-uploading!** 🚀
