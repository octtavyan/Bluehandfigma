# 📊 Import Database Schema

## Quick Import via phpMyAdmin (5 minutes)

### Step 1: Download the SQL File
Download this file from the project:
```
/server-deploy/database-schema.sql
```

### Step 2: Open phpMyAdmin
1. Login to your cPanel
2. Click "phpMyAdmin"
3. Select database: `wiseguy_bluehand` (click on it in the left sidebar)

### Step 3: Import
1. Click the **"Import"** tab at the top
2. Click **"Choose File"**
3. Select `database-schema.sql`
4. Scroll down and click **"Go"**

### Step 4: Verify
You should see a success message like:
```
Import has been successfully finished, 15 queries executed.
```

---

## What Gets Created

### Core Tables (11 total):
1. ✅ **categories** - Product categories (Peisaje, Abstract, etc.)
2. ✅ **styles** - Art styles (Realism, Modern, etc.)
3. ✅ **print_types** - Canvas Premium, Print Foto, etc.
4. ✅ **frame_types** - Frame options with % pricing
5. ✅ **sizes** - 8 standard sizes (20x30 to 100x150)
6. ✅ **paintings** - Your products (empty, ready for data)
7. ✅ **painting_sizes** - Link paintings to available sizes
8. ✅ **orders** - Customer orders
9. ✅ **order_items** - Items in orders
10. ✅ **users** - Admin users
11. ✅ **settings** - Site configuration
12. ✅ **blog_posts** - Blog articles
13. ✅ **sliders** - Homepage carousel

### Sample Data Included:
- 🎨 6 categories
- 🖼️ 6 styles
- 🖨️ 3 print types
- 🖼️ 5 frame types
- 📏 8 standard sizes
- 👤 1 admin user (email: `admin@bluehand.ro`, password: `admin123`)
- ⚙️ Default settings

---

## Test After Import

### Test 1: Check Paintings Count
Visit: `https://bluehand.ro/api/index.php/paintings`

Should see:
```json
{
  "paintings": [],
  "total": 0
}
```

### Test 2: Check Categories
Visit: `https://bluehand.ro/api/index.php/categories`

Should see:
```json
{
  "categories": [
    {"id": 1, "name": "Peisaje", "slug": "peisaje", ...},
    {"id": 2, "name": "Abstract", "slug": "abstract", ...},
    ...
  ]
}
```

### Test 3: Check Sizes
Visit: `https://bluehand.ro/api/index.php/sizes`

Should see 8 sizes from 20x30 to 100x150 cm

---

## Default Admin Login

After importing, you can login to admin panel with:

**Email:** `admin@bluehand.ro`  
**Password:** `admin123`

⚠️ **IMPORTANT:** Change this password immediately after first login!

---

## Troubleshooting

### Error: "Table already exists"
**Cause:** You already have some tables created

**Solution:** The SQL uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run. It will skip existing tables.

### Error: "Unknown column"
**Cause:** Old table structure doesn't match new schema

**Solution:** Drop the old tables first:
```sql
DROP TABLE IF EXISTS painting_sizes;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS paintings;
-- Then import the SQL file again
```

### Error: "Foreign key constraint fails"
**Cause:** Tables being created in wrong order

**Solution:** The SQL file creates tables in the correct order. Make sure you import the ENTIRE file, not just parts of it.

---

## Next Steps

After successful import:

1. ✅ Visit: `https://bluehand.ro/api/index.php/paintings` → Should return empty array
2. ✅ Visit: `https://bluehand.ro/api/index.php/categories` → Should return 6 categories
3. ✅ Tell me it worked!
4. 🚀 I'll update the frontend to use your PHP backend

---

## Quick Checklist

- [ ] Downloaded `database-schema.sql`
- [ ] Opened phpMyAdmin
- [ ] Selected database `wiseguy_bluehand`
- [ ] Imported the SQL file
- [ ] Saw success message
- [ ] Tested `/api/index.php/paintings` → Works!
- [ ] Tested `/api/index.php/categories` → Works!

**Let me know when you complete these steps!** 🎯
