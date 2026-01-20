# 🚀 Complete PHP Backend Setup for BlueHand.ro

## 📋 Summary
Your React app in Figma Make is correctly configured to connect to `https://bluehand.ro/api`, but it's getting **HTML error pages** instead of JSON. This guide will fix everything.

---

## ❌ Current Problem
- ✅ React app points to `https://bluehand.ro/api` 
- ❌ PHP endpoints are returning HTML errors (PHP errors or missing files)
- ❌ No CORS headers = "Failed to fetch" errors

---

## ✅ Complete Solution

### **Step 1: Create Directory Structure**

On your server at `bluehand.ro`, create:
```
/var/www/html/api/
├── .htaccess
├── config.php
├── index.php
├── health.php
├── test-db.php
├── paintings.php
├── categories.php
├── sizes.php
├── styles.php
├── print-types.php
├── frame-types.php
├── orders.php
└── auth/
    └── login.php
```

---

### **Step 2: Create `.htaccess` (Enable Pretty URLs)**

**File: `/var/www/html/api/.htaccess`**

```apache
# Enable CORS for all API endpoints
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
Header always set Access-Control-Max-Age "86400"

# Handle OPTIONS preflight requests
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Route all requests through index.php (optional - only if you want a router)
# RewriteCond %{REQUEST_FILENAME} !-f
# RewriteCond %{REQUEST_FILENAME} !-d
# RewriteRule ^(.*)$ index.php [QSA,L]
```

---

### **Step 3: Create `config.php` (Database Connection)**

**File: `/var/www/html/api/config.php`**

```php
<?php
// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'bluehand_db');
define('DB_USER', 'bluehand_user');
define('DB_PASS', 'your_password_here');

// PDO Connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
?>
```

**🔧 UPDATE:** Change `DB_NAME`, `DB_USER`, `DB_PASS` to match your MySQL credentials!

---

### **Step 4: Create `health.php` (Simple Health Check)**

**File: `/var/www/html/api/health.php`**

```php
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'BlueHand API is running',
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_NAME']
]);
?>
```

---

### **Step 5: Create `test-db.php` (Database Test)**

**File: `/var/www/html/api/test-db.php`**

```php
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

try {
    // Test query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connected successfully',
        'users_count' => $result['count']
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
```

---

### **Step 6: Create `auth/login.php` (Authentication)**

**File: `/var/www/html/api/auth/login.php`**

```php
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'error' => 'Username and password required']);
    exit;
}

try {
    // Query user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password_hash'])) {
        // Generate simple token (use JWT in production)
        $token = bin2hex(random_bytes(32));
        
        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'full_name' => $user['username'] // or add full_name column
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
```

---

### **Step 7: Create Other Endpoints**

**File: `/var/www/html/api/paintings.php`**

```php
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT * FROM paintings WHERE is_active = 1");
    $paintings = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'paintings' => $paintings
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
```

**Repeat similar structure for:**
- `categories.php` → `SELECT * FROM categories WHERE is_active = 1`
- `sizes.php` → `SELECT * FROM sizes WHERE is_active = 1`
- `styles.php` → `SELECT * FROM styles WHERE is_active = 1`
- `print-types.php` → `SELECT * FROM print_types WHERE is_active = 1`
- `frame-types.php` → `SELECT * FROM frame_types WHERE is_active = 1`
- `orders.php` → `SELECT * FROM orders` (with auth check)

---

## 🧪 **Testing Your Setup**

### **Test 1: Direct Browser Access**

Visit in your browser:
```
https://bluehand.ro/api/health.php
```

**Expected:** `{"success":true,"message":"BlueHand API is running",...}`

If you see HTML error, check PHP error logs.

---

### **Test 2: From Figma Make**

1. Go to Admin Dashboard in Figma Make
2. Click **🧪 Test API** button
3. Click **Run All Tests**

**Expected Results:**
- ✅ Health Check: Success
- ✅ Database Test: Success  
- ✅ All other endpoints: Success or proper JSON errors

---

### **Test 3: Test Login**

1. Click **🔍 Debug Auth** button
2. Click **Test API Connection**

**Expected:** JSON response (not HTML error)

---

## 🐛 **Troubleshooting**

### **Problem: Still seeing HTML errors**

**Check PHP error logs:**
```bash
tail -f /var/log/apache2/error.log
# or
tail -f /var/log/php_errors.log
```

**Common issues:**
- Missing database tables
- Wrong database credentials in `config.php`
- PHP syntax errors
- Missing file permissions

---

### **Problem: "Failed to fetch" / CORS errors**

1. Verify `.htaccess` has CORS headers
2. Check Apache has `mod_headers` enabled:
```bash
sudo a2enmod headers
sudo systemctl restart apache2
```

---

### **Problem: 404 Not Found**

Check file paths:
```bash
ls -la /var/www/html/api/
ls -la /var/www/html/api/auth/
```

All files should be readable by Apache user (www-data).

---

## ✅ **Success Checklist**

- [ ] All PHP files created with CORS headers
- [ ] `config.php` has correct database credentials
- [ ] Admin user exists in database (run SQL from previous message)
- [ ] `https://bluehand.ro/api/health.php` returns JSON
- [ ] `https://bluehand.ro/api/test-db.php` returns success
- [ ] Figma Make Test API shows all green checkmarks
- [ ] Login works from Figma Make preview

---

## 📞 **Need Help?**

After setting up these files:

1. Visit `https://bluehand.ro/api/health.php` in browser
2. Copy the response (or error message)
3. Tell me what you see!

Also run the **🧪 Test API** and **🔍 Debug Auth** buttons in Figma Make and share the results.
