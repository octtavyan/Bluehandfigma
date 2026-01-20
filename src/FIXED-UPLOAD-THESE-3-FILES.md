# 🔥 CRITICAL FIX - UPLOAD THESE 3 FILES NOW!

## ❌ **Problem Found:**
```
Fatal error: Call to undefined function getDB()
```

## ✅ **Problem Fixed:**

The issue was that the PHP files were calling `getDB()` at the top level (line 6), before entering the switch statement. This caused the function to be unavailable when the files were loaded by index.php.

**Fix:** Moved `getDB()` calls INSIDE each switch case, so they're only called when needed.

---

## 🚨 **RE-UPLOAD THESE 3 FILES:**

| # | File | Upload To Server | Status |
|---|------|------------------|---------|
| 1 | `/server-deploy/api/sizes.php` | `/public_html/api/sizes.php` | ✅ FIXED |
| 2 | `/server-deploy/api/frame-types.php` | `/public_html/api/frame-types.php` | ✅ FIXED |
| 3 | `/server-deploy/api/categories.php` | `/public_html/api/categories.php` | ✅ FIXED |

**index.php does NOT need to be re-uploaded** (it's fine as is)

---

## 📋 **QUICK UPLOAD STEPS:**

### **1. Go to cPanel File Manager**
- URL: https://bluehand.ro:2083
- Navigate to: `/public_html/api/`

### **2. OVERWRITE the 3 files:**
- Upload `sizes.php` (overwrite existing)
- Upload `frame-types.php` (overwrite existing)
- Upload `categories.php` (overwrite existing)

### **3. Test The Endpoints:**

Open these in your browser:

1. ✅ https://bluehand.ro/api/sizes
2. ✅ https://bluehand.ro/api/frame-types
3. ✅ https://bluehand.ro/api/categories

**Expected result:** JSON data (not "Fatal error")

---

## ✅ **What Changed:**

### **BEFORE (❌ Broken):**
```php
<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();  // ❌ Called here - TOO EARLY!

try {
    switch ($method) {
        case 'GET':
            // ...
```

### **AFTER (✅ Fixed):**
```php
<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $db = getDB();  // ✅ Called here - INSIDE the case!
            // ...
```

---

## 🎯 **Expected Results:**

### **API Response (sizes.php):**
```json
[
  {
    "id": 1,
    "name": "20x30 cm",
    "width": 20,
    "height": 30,
    "basePrice": 89,
    "sortOrder": 1,
    "active": true
  },
  ...
]
```

### **API Response (frame-types.php):**
```json
[
  {
    "id": 1,
    "name": "Fără Ramă",
    "slug": "fara-rama",
    "pricePercentage": 0,
    "sortOrder": 1,
    "active": true
  },
  ...
]
```

### **API Response (categories.php):**
```json
[
  {
    "id": 1,
    "name": "Peisaje",
    "slug": "peisaje",
    "description": "Tablouri cu peisaje naturale și urbane",
    "sortOrder": 1,
    "active": true
  },
  ...
]
```

---

## 🚨 **If You Still Get Errors:**

### **Error: "Table 'sizes' doesn't exist"**

**Solution:** Run this SQL in phpMyAdmin:

```sql
-- Check if tables exist
SHOW TABLES LIKE 'sizes';
SHOW TABLES LIKE 'frame_types';
SHOW TABLES LIKE 'categories';
```

**If they don't exist:**
1. Go to phpMyAdmin
2. Select database: `wiseguy_bluehand`
3. Click "SQL" tab
4. Copy-paste from: `/server-deploy/ENSURE-TABLES-EXIST.sql`
5. Click "Go"

---

## ✅ **After Upload - Checklist:**

- [ ] Uploaded `sizes.php` to `/public_html/api/sizes.php`
- [ ] Uploaded `frame-types.php` to `/public_html/api/frame-types.php`
- [ ] Uploaded `categories.php` to `/public_html/api/categories.php`
- [ ] Tested https://bluehand.ro/api/sizes (returns JSON)
- [ ] Tested https://bluehand.ro/api/frame-types (returns JSON)
- [ ] Tested https://bluehand.ro/api/categories (returns JSON)
- [ ] Refreshed website (Ctrl+Shift+R)
- [ ] Checked console (F12) - no more 404 errors!

---

**Upload the 3 FIXED files now and test again!** 🚀
