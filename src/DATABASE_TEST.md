# 🧪 Database Connection Test

## ✅ Step 1: Test Database Connection

Visit this URL in your browser:

```
https://bluehand.ro/api/index.php/test-db
```

---

## 📋 Expected Results

### ✅ SUCCESS (Database is connected):
```json
{
  "status": "ok",
  "message": "Database connected",
  "paintings_count": 0
}
```

This means:
- ✅ MySQL connection is working
- ✅ Database `wiseguy_bluehand` exists
- ✅ Table `paintings` exists
- ✅ Everything is configured correctly!

---

### ❌ ERROR 1: Connection Refused
```json
{
  "status": "error",
  "message": "Database error: SQLSTATE[HY000] [2002] Connection refused"
}
```

**Cause:** Wrong database host

**Fix:** Edit `/public_html/bluehand.ro/api/config.php` and change:
```php
define('DB_HOST', 'localhost'); // Should be 'localhost' for same-server MySQL
```

---

### ❌ ERROR 2: Access Denied
```json
{
  "status": "error",
  "message": "Database error: SQLSTATE[HY000] [1045] Access denied for user 'username'@'localhost'"
}
```

**Cause:** Wrong MySQL username or password

**Fix:** Edit `/public_html/bluehand.ro/api/config.php` and verify:
```php
define('DB_USER', 'wiseguy_bluehand'); // Your MySQL username
define('DB_PASS', 'your_actual_password'); // Your MySQL password
```

To find the correct credentials:
1. Open cPanel
2. Go to "MySQL Databases"
3. See your database name and username
4. If you forgot the password, create a new MySQL user

---

### ❌ ERROR 3: Unknown Database
```json
{
  "status": "error",
  "message": "Database error: SQLSTATE[HY000] [1049] Unknown database 'wiseguy_bluehand'"
}
```

**Cause:** Database doesn't exist yet

**Fix:** Create the database in cPanel:
1. Open cPanel → MySQL Databases
2. Create new database: `wiseguy_bluehand`
3. Add user to database with ALL PRIVILEGES

---

### ❌ ERROR 4: Table doesn't exist
```json
{
  "status": "error",
  "message": "Database error: SQLSTATE[42S02]: Base table or view not found: 1146 Table 'wiseguy_bluehand.paintings' doesn't exist"
}
```

**Cause:** Database exists but tables haven't been created yet

**Fix:** We need to import the database schema (SQL file)

---

## 🎯 What to Do

**Please:**
1. Visit: `https://bluehand.ro/api/index.php/test-db`
2. Take a screenshot of what you see
3. Copy the FULL JSON response

Then I'll help you fix any issues!

---

## 📊 Database Schema

If the database exists but tables don't, I'll need to create an SQL dump file for you to import via phpMyAdmin.

The database should have these tables:
- `paintings` - All painting/print products
- `categories` - Product categories
- `styles` - Art styles
- `sizes` - Available sizes with print type support
- `frame_types` - Frame options
- `orders` - Customer orders
- `order_items` - Items in each order
- `users` - Admin users
- `settings` - Site settings
- `blog_posts` - Blog articles
- `sliders` - Homepage sliders

---

## 🔥 Quick Test Checklist

- [ ] Visit `https://bluehand.ro/api/index.php` → See "status: ok"
- [ ] Visit `https://bluehand.ro/api/index.php/test-db` → ???

**Tell me what you see at the second URL!** 🚀
