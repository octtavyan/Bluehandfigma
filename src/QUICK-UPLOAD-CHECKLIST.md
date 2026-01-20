# ✅ QUICK UPLOAD CHECKLIST

## 📦 Files to Upload (4 files total):

```
┌─────────────────────────────────────────────────────────────┐
│  FROM FIGMA MAKE              →    TO SERVER                │
├─────────────────────────────────────────────────────────────┤
│  /server-deploy/api/          →    /public_html/api/        │
│                                                              │
│  ☐ sizes.php                  →    sizes.php        [NEW]   │
│  ☐ frame-types.php            →    frame-types.php  [NEW]   │
│  ☐ categories.php             →    categories.php   [NEW]   │
│  ☐ index.php                  →    index.php     [REPLACE]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Step-by-Step Upload Process:

### 1️⃣ Download/Export Files
- [ ] Look for "Export" button in Figma Make
- [ ] OR copy-paste each file manually from `/server-deploy/api/`

### 2️⃣ Login to cPanel
- [ ] Go to: https://bluehand.ro:2083
- [ ] Click "File Manager"
- [ ] Navigate to `/public_html/api/`

### 3️⃣ Upload Files
- [ ] Click "Upload" button
- [ ] Select all 4 files
- [ ] Wait for upload to complete
- [ ] Click "Yes" to overwrite index.php

### 4️⃣ Set Permissions
- [ ] Right-click `sizes.php` → Permissions → Set to 644
- [ ] Right-click `frame-types.php` → Permissions → Set to 644
- [ ] Right-click `categories.php` → Permissions → Set to 644
- [ ] Right-click `index.php` → Permissions → Set to 644

### 5️⃣ Test Endpoints (Open in Browser)
- [ ] https://bluehand.ro/api/sizes (should show JSON)
- [ ] https://bluehand.ro/api/frame-types (should show JSON)
- [ ] https://bluehand.ro/api/categories (should show JSON)

### 6️⃣ Test Website
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Open https://bluehand.ro
- [ ] Press F12 to open console
- [ ] Verify NO 404 errors for sizes/frame-types/categories

---

## ✅ Expected Console Output (After Upload):

```javascript
✅ 📏 Loaded sizes with discounts: Array(8)
   [0]: {id: 1, name: "20x30 cm", basePrice: 89}
   [1]: {id: 2, name: "30x40 cm", basePrice: 129}
   ...

✅ 🖼️ Loaded frame types: Array(5)
   [0]: {id: 1, name: "Fără Ramă", pricePercentage: 0}
   [1]: {id: 2, name: "Ramă Neagră", pricePercentage: 25}
   ...

✅ ✅ Paintings loaded: 24
✅ ✅ Orders loaded: X
```

---

## ❌ What Should DISAPPEAR (After Upload):

```javascript
❌ /api/sizes:1 Failed to load resource: 404
❌ /api/frame-types:1 Failed to load resource: 404
❌ /api/categories:1 Failed to load resource: 404
```

---

## 🚨 Common Mistakes to Avoid:

- ❌ **DON'T** upload to `/public_html/` (missing `/api/` folder!)
- ❌ **DON'T** rename files (must be exact: `sizes.php` not `Sizes.php`)
- ❌ **DON'T** forget to set permissions to 644
- ❌ **DON'T** skip overwriting `index.php` (it needs to be updated!)

---

## 🎉 Done? Report Back With:

1. **Endpoint test results:**
   - Does https://bluehand.ro/api/sizes return JSON? (YES/NO)
   - Does https://bluehand.ro/api/frame-types return JSON? (YES/NO)
   - Does https://bluehand.ro/api/categories return JSON? (YES/NO)

2. **Console output:**
   - Copy-paste what you see in the console after refresh

3. **Any errors?**
   - Screenshot of console errors (if any)

---

## 🔧 Quick Fixes:

### If still getting 404:
1. Check files are in `/public_html/api/` (not `/public_html/`)
2. Check file names are exact: `sizes.php`, `frame-types.php`, `categories.php`
3. Check permissions are 644

### If getting "Permission denied":
1. Set file permissions to 644
2. Set folder `/public_html/api/` permissions to 755

### If getting database errors:
1. Go to phpMyAdmin
2. Select `wiseguy_bluehand` database
3. Run the SQL file: `/server-deploy/ENSURE-TABLES-EXIST.sql`

---

**Upload now and check back! 🚀**
