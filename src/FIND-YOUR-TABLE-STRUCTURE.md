# 🔍 FIND YOUR TABLE STRUCTURE

## ❌ Problem:
Your database tables don't have the columns we expected (`slug`, `sort_order`, etc.)

## ✅ Solution:
I created a PHP script that will show us EXACTLY what columns you have!

---

## 🎯 STEP 1: Upload The Checker Script

**Upload this file:**
- **From:** `/server-deploy/api/check-tables.php`
- **To:** `/public_html/api/check-tables.php`

---

## 🎯 STEP 2: Visit The URL

Open this in your browser:

```
https://bluehand.ro/api/check-tables.php
```

**This will show you:**
- ✅ Which tables exist
- ✅ What columns each table has
- ✅ Sample data from each table
- ✅ How many rows are in each table

---

## 🎯 STEP 3: Send Me A Screenshot

Take a screenshot of the ENTIRE page and send it to me!

I'll see exactly what columns you have and create the perfect INSERT statements.

---

## 🚀 Alternative: Run SQL Directly

If you prefer, run this in phpMyAdmin instead:

```sql
DESCRIBE categories;
DESCRIBE frame_types;
DESCRIBE sizes;
```

Send me screenshots of all 3 results!

---

## 📊 What I'm Looking For:

I need to know which of these columns exist:

### For `categories` table:
- `id` ← probably exists
- `name` ← probably exists
- `slug` ← might NOT exist (causing the error)
- `description` ← might NOT exist
- `sort_order` ← might NOT exist
- `active` ← might NOT exist
- `image_url` ← might NOT exist

### For `frame_types` table:
- `id` ← probably exists
- `name` ← probably exists
- `slug` ← might NOT exist (causing the error)
- `price_percentage` ← might NOT exist
- `description` ← might NOT exist

### For `sizes` table:
- `id` ← probably exists
- `name` ← probably exists
- `width` ← might exist
- `height` ← might exist
- `base_price` OR `price` ← one of these should exist

---

## ⚡ Quick Test:

Try inserting with ONLY the `name` column:

```sql
INSERT IGNORE INTO `categories` (`name`) VALUES ('Test Category');
```

**If that works:** Your table ONLY has basic columns!
**If that fails:** Your table might have a different structure entirely!

---

## 🚨 After I See Your Table Structure:

I'll create custom INSERT statements like:

```sql
-- Custom for YOUR table structure
INSERT IGNORE INTO `categories` (column1, column2, column3) VALUES
('value1', 'value2', 'value3'),
...
```

---

**Upload check-tables.php and visit the URL, or run DESCRIBE in phpMyAdmin!** 📸
