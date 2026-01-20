# 🚀 DEPLOYMENT FIX - Upload These Files

## ✅ Files to Upload to Your Server

Upload these 3 files to `/home/wiseguy/public_html/bluehand.ro/api/`:

### 1. **index.php** (REPLACE existing)
📁 Source: `/server-deploy/api/index-fixed.php`
🎯 Destination: `/home/wiseguy/public_html/bluehand.ro/api/index.php`

### 2. **config.php** (REPLACE existing)
📁 Source: `/server-deploy/api/config.php`
🎯 Destination: `/home/wiseguy/public_html/bluehand.ro/api/config.php`
⚠️ Make sure display_errors is set to 0

### 3. **cart.php** (NEW FILE)
📁 Source: `/server-deploy/api/cart.php`
🎯 Destination: `/home/wiseguy/public_html/bluehand.ro/api/cart.php`

---

## 🗄️ SQL to Run in MySQL

Run this SQL in your `wiseguy_bluehand` database:

```sql
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
```

---

## 🧪 After Upload - Test These URLs:

1. **Test paintings API:**
   ```
   https://bluehand.ro/api/paintings
   ```
   Should return: `{"paintings":[]}`

2. **Test cart load:**
   ```
   https://bluehand.ro/api/index.php?action=cart_load&sessionId=test123
   ```
   Should return: `{"success":true,"cart":[]}`

3. **Test health check:**
   ```
   https://bluehand.ro/api/health
   ```
   Should return: `{"status":"ok",...}`

---

## 🎯 What This Fixes:

✅ **Paintings error** - Fixed by disabling HTML error display
✅ **Cart error** - Fixed by adding cart.php and routing
✅ **Orders error** - Fixed by proper error handling (will return JSON errors for missing auth instead of HTML)

---

## 📝 Notes:

- Make sure files are uploaded in **text/ASCII mode**, not binary
- File permissions should be **644** (rw-r--r--)
- If you see **blank pages** instead of JSON, check your server's error log at `/home/wiseguy/public_html/bluehand.ro/api/error.log`
