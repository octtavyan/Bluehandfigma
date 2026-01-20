# 🚀 PHP Backend Installation Guide

## ❌ Problem Found
Your PHP files have a **syntax error** causing them to return HTML instead of JSON:
```
Parse error: syntax error, unexpected '&lt;', expecting end of file
```

## ✅ Solution: Replace with Clean PHP Files

---

## 📁 Step 1: Upload Files to Server

Connect to your server via SSH or FTP and upload these files:

### **Directory Structure:**
```
/var/www/html/api/
├── config.php          (from: 01-config.php)
├── health.php          (from: 02-health.php)
├── paintings.php       (from: 03-paintings.php)
├── categories.php      (from: 05-categories.php)
├── sizes.php           (from: 06-sizes.php)
├── orders.php          (from: 07-orders.php)
└── auth/
    └── login.php       (from: 04-auth-login.php)
```

### **File Mapping:**
- `01-config.php` → `/var/www/html/api/config.php`
- `02-health.php` → `/var/www/html/api/health.php`
- `03-paintings.php` → `/var/www/html/api/paintings.php`
- `04-auth-login.php` → `/var/www/html/api/auth/login.php` ⚠️ (create `auth/` folder first!)
- `05-categories.php` → `/var/www/html/api/categories.php`
- `06-sizes.php` → `/var/www/html/api/sizes.php`
- `07-orders.php` → `/var/www/html/api/orders.php`

---

## 🔧 Step 2: Update Database Credentials

Edit `/var/www/html/api/config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'bluehand_db');        // ⚠️ Change to your database name
define('DB_USER', 'bluehand_user');      // ⚠️ Change to your MySQL user
define('DB_PASS', 'your_password_here'); // ⚠️ Change to your MySQL password
```

---

## 📂 Step 3: Create auth/ Folder

```bash
mkdir -p /var/www/html/api/auth
chmod 755 /var/www/html/api/auth
```

---

## 🔑 Step 4: Set File Permissions

```bash
cd /var/www/html/api
chmod 644 *.php
chmod 644 auth/*.php
chmod 755 auth/
chown -R www-data:www-data /var/www/html/api
```

---

## 🧪 Step 5: Test Each Endpoint

### **Test 1: Health Check**
Open in browser: `https://bluehand.ro/api/health.php`

**Expected Response:**
```json
{
  "success": true,
  "message": "BlueHand API is running",
  "timestamp": "2026-01-20 12:34:56",
  "version": "1.0"
}
```

✅ If you see this, CORS and basic PHP are working!

---

### **Test 2: Database Connection**
Open in browser: `https://bluehand.ro/api/paintings.php`

**Expected Response (if table is empty):**
```json
{
  "success": true,
  "paintings": []
}
```

**Or if you have data:**
```json
{
  "success": true,
  "paintings": [{"id": 1, "title": "..."}]
}
```

✅ If you see JSON, database connection works!

**If you see an error:**
```json
{
  "success": false,
  "error": "SQLSTATE[HY000] [1045] Access denied for user..."
}
```
→ Fix database credentials in `config.php`

---

### **Test 3: Login Endpoint**

Use cURL to test login:
```bash
curl -X POST https://bluehand.ro/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Expected Response (success):**
```json
{
  "success": true,
  "token": "abc123...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@bluehand.ro",
    "role": "admin",
    "full_name": "admin"
  }
}
```

**Expected Response (wrong password):**
```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

✅ Both responses are correct - it means the endpoint works!

---

## 🗄️ Step 6: Verify Admin User Exists

```bash
mysql -u bluehand_user -p bluehand_db
```

```sql
-- Check if admin user exists
SELECT id, username, role, is_active FROM users WHERE username = 'admin';
```

**If no user exists, create one:**
```sql
INSERT INTO users (username, password_hash, role, is_active, created_at)
VALUES (
  'admin',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
  'admin',
  1,
  NOW()
);
```

---

## ✅ Step 7: Test from Figma Make

1. Go to Figma Make preview
2. Navigate to `/diagnostic` or click **"🔍 Test API Connection"** on login page
3. Should see:
   - ✅ Base URL: `https://bluehand.ro/api`
   - ✅ Status: 200
   - ✅ Response is valid JSON
   - ✅ No more parse errors!

4. Try logging in:
   - Username: `admin`
   - Password: `admin123`
   - Should work! ✅

---

## 🐛 Troubleshooting

### **Still seeing HTML errors?**

1. **Check PHP syntax:**
   ```bash
   php -l /var/www/html/api/health.php
   ```
   Should say: `No syntax errors detected`

2. **Check PHP error logs:**
   ```bash
   tail -f /var/log/apache2/error.log
   ```

3. **Verify file encoding:**
   Make sure files are saved as **UTF-8 without BOM**

4. **Check for extra characters:**
   Make sure there's no whitespace or HTML before `<?php` tag

---

### **CORS still not working?**

1. **Enable Apache headers module:**
   ```bash
   sudo a2enmod headers
   sudo systemctl restart apache2
   ```

2. **Check if headers are sent:**
   ```bash
   curl -I https://bluehand.ro/api/health.php
   ```
   Should see:
   ```
   Access-Control-Allow-Origin: *
   Content-Type: application/json; charset=UTF-8
   ```

---

## 📞 After Installation

Once all files are uploaded and tested:

1. ✅ Visit `https://bluehand.ro/api/health.php` → Should return JSON
2. ✅ Run Figma Make diagnostic page → Should show green checkmarks
3. ✅ Try admin login → Should work!

---

## 🎯 Quick Checklist

- [ ] All 7 PHP files uploaded to correct locations
- [ ] `config.php` has correct database credentials
- [ ] `auth/` folder created with correct permissions
- [ ] Admin user exists in database with password_hash
- [ ] `health.php` returns JSON (not HTML)
- [ ] Figma Make diagnostic shows Status: 200 + valid JSON
- [ ] Login works from Figma Make preview

---

## 💡 Common Issues

### Issue: "Call to undefined function password_verify()"
**Solution:** Update PHP to 5.5+ or use alternative password check

### Issue: "Access denied for user 'bluehand_user'@'localhost'"
**Solution:** Fix database credentials in `config.php`

### Issue: "Table 'bluehand_db.users' doesn't exist"
**Solution:** Create database tables (see previous SQL scripts)

### Issue: Still showing parse error
**Solution:** 
1. Delete ALL old PHP files
2. Upload new files fresh
3. Make sure no extra characters before `<?php`
