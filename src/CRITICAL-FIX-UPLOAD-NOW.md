# 🚨 CRITICAL FIX - Upload NOW!

## ❌ **Problem:**
```
Fatal error: Call to undefined function getDB()
```

## ✅ **Root Cause:**
The files are being called FROM `index.php`, so the relative path `require_once 'config.php'` didn't work!

---

## 🔧 **What I Fixed:**

Changed this in ALL 3 files:
```php
// ❌ OLD (relative path - BROKEN)
require_once 'config.php';

// ✅ NEW (absolute path - WORKS!)
require_once __DIR__ . '/config.php';
```

**`__DIR__` makes the path absolute, so it works from anywhere!**

---

## 📦 **RE-UPLOAD THESE 3 FILES:**

| # | File | Upload To |
|---|------|-----------|
| 1 | `/server-deploy/api/sizes.php` | `/public_html/api/sizes.php` |
| 2 | `/server-deploy/api/frame-types.php` | `/public_html/api/frame-types.php` |
| 3 | `/server-deploy/api/categories.php` | `/public_html/api/categories.php` |

**OVERWRITE the existing files!**

---

## ✅ **THEN TEST:**

1. **Categories:** https://bluehand.ro/api/categories
2. **Frame Types:** https://bluehand.ro/api/frame-types
3. **Sizes:** https://bluehand.ro/api/sizes

**Should return JSON with NO ERRORS!** 🎉

---

## 🎯 **THIS IS THE FINAL FIX!**

Upload → Test → Done! ✅
