# 🚀 COMPLETE FIX GUIDE - Upload & Test

## ✅ Step 1: Upload PHP Files to Server

Upload these **3 files** to `/home/wiseguy/public_html/bluehand.ro/api/`:

### 1. **index.php** (REPLACE existing)
- Source: `/server-deploy/api/index-fixed.php`  
- Destination: `/home/wiseguy/public_html/bluehand.ro/api/index.php`

### 2. **config.php** (REPLACE existing)
- Source: `/server-deploy/api/config.php`  
- Destination: `/home/wiseguy/public_html/bluehand.ro/api/config.php`

### 3. **cart.php** (NEW file)
- Source: `/server-deploy/api/cart.php`  
- Destination: `/home/wiseguy/public_html/bluehand.ro/api/cart.php`

**IMPORTANT:** Make sure files are uploaded in **text/ASCII mode**, not binary!

---

## 🗄️ Step 2: Run SQL in MySQL Database

Connect to your `wiseguy_bluehand` database and run this SQL:

```sql
-- Create cart_sessions table
CREATE TABLE IF NOT EXISTS cart_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    cart_data TEXT,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_session (session_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify table was created
SHOW TABLES LIKE 'cart_sessions';
```

---

## 🧪 Step 3: Test the Fixes

### **Option A: Use Login Test Page (Recommended)**

1. Go to: **`https://bluehand.ro/login-test`** (or `/login-test` in Figma Make)
2. Enter username: `admin`
3. Enter your password
4. Click "Test Login"
5. Should show ✅ Success with user data and token

### **Option B: Use API Test Page**

1. Login to admin dashboard first
2. Click the **"🧪 Test API"** button in the top-right
3. Click "Run All Tests"
4. Check results - all should be ✅ except Orders (needs auth)

### **Option C: Test Manually**

Test these URLs directly:

1. **Health Check:**  
   `https://bluehand.ro/api/health`  
   Should return: `{"status":"ok",...}`

2. **Paintings API:**  
   `https://bluehand.ro/api/paintings`  
   Should return: `{"paintings":[]}`

3. **Cart Load:**  
   `https://bluehand.ro/api/index.php?action=cart_load&sessionId=test`  
   Should return: `{"success":true,"cart":[]}`

4. **Login Test:**  
   ```bash
   curl -X POST https://bluehand.ro/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"YOUR_PASSWORD"}'
   ```
   Should return: `{"success":true,"token":"...","user":{...}}`

---

## ❓ Troubleshooting

### **If you see blank pages or HTML errors:**

1. Check PHP error log:  
   `/home/wiseguy/public_html/bluehand.ro/api/error.log`

2. Verify `display_errors = 0` in `config.php` line 19

3. Check file permissions: Should be **644** (rw-r--r--)

### **If login fails with "Invalid credentials":**

You need to create an admin user! Run this SQL:

```sql
-- Create admin user with password "admin123"
INSERT INTO users (username, password_hash, email, full_name, role, is_active, created_at)
VALUES (
    'admin',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin@bluehand.ro',
    'Administrator',
    'full-admin',
    1,
    NOW()
);
```

**Default credentials:**
- Username: `admin`
- Password: `admin123`

**⚠️ CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!**

### **If cart errors persist:**

Make sure the `cart_sessions` table exists:

```sql
SHOW TABLES LIKE 'cart_sessions';
SELECT COUNT(*) FROM cart_sessions;
```

---

## 📝 What Was Fixed:

1. ✅ **PHP syntax error** - Fixed corrupted index.php
2. ✅ **HTML error display** - Changed `display_errors = 0` in config.php
3. ✅ **Missing cart API** - Created cart.php with load/save/clear endpoints
4. ✅ **Missing cart routing** - Added cart routing to index.php
5. ✅ **Missing database table** - Added cart_sessions table SQL

---

## 🎯 Next Steps After Fix:

1. **Test login** at `https://bluehand.ro/admin/login`
2. **Add test data** through the CMS admin panels
3. **Test the public site** - cart, checkout, etc.
4. **Change default password!**

---

## 🆘 Still Having Issues?

Run the diagnostic tools:

- `/login-test` - Test login directly
- `/api-test` - Test all API endpoints
- Check browser console for errors (F12)
- Check PHP error log on server
