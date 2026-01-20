# ✅ Simple Deploy Checklist - Your Own Server

## 🎯 What We're Doing

Deploying BlueHand Canvas **entirely on your server** at `bluehand.ro`:
- ✅ Website files
- ✅ PHP backend
- ✅ MySQL database  
- ✅ Image uploads

**No GitHub. No Supabase. Just your server!**

---

## 📋 Quick Checklist (30 minutes)

### Part 1: On Your Computer (10 minutes)

- [ ] 1. Install Node.js from https://nodejs.org/
- [ ] 2. Open terminal in project folder
- [ ] 3. Run: `npm install`
- [ ] 4. Run: `npm run build`
- [ ] 5. Find the `dist/` folder (this is your built app!)

### Part 2: Database Setup (5 minutes)

- [ ] 1. Log into phpMyAdmin
- [ ] 2. Create database: `wiseguy_bluehand`
- [ ] 3. Import `bluehand_canvas_database.sql`
- [ ] 4. Verify: Should see 11 tables

### Part 3: FTP Upload (10 minutes)

**Connect FTP:**
- Host: `89.41.38.220` or `ftp.bluehand.ro`
- Username: `wiseguy`
- Password: [your FTP password]

**Upload these:**
- [ ] 1. Upload everything from `dist/` folder to `/public_html/`
- [ ] 2. Create folder: `/public_html/uploads/`
- [ ] 3. Create subfolders:
  - `/public_html/uploads/paintings/`
  - `/public_html/uploads/orders/`
  - `/public_html/uploads/sliders/`
  - `/public_html/uploads/blog/`
- [ ] 4. Create folder: `/public_html/api/`

### Part 4: PHP Backend Files (5 minutes)

I'll give you 6 PHP files to upload to `/public_html/api/`:

- [ ] 1. `config.php` - Database settings
- [ ] 2. `index.php` - API router
- [ ] 3. `paintings.php` - Paintings API
- [ ] 4. `orders.php` - Orders API
- [ ] 5. `auth.php` - Admin login
- [ ] 6. `upload.php` - Image uploads

### Part 5: Configuration (2 minutes)

- [ ] 1. Edit `/public_html/api/config.php`:
  - Change `DB_PASS` to your MySQL password
  - Change `JWT_SECRET` to random string
- [ ] 2. Test: Visit `https://bluehand.ro/api/health`
  - Should see: `{"status":"ok"}`

### Part 6: Done! (2 minutes)

- [ ] 1. Visit: `https://bluehand.ro`
- [ ] 2. Visit: `https://bluehand.ro/admin`
- [ ] 3. Login with default credentials (change immediately!)

---

## 📁 What Files Do You Need?

### Files I Already Gave You:
1. ✅ `bluehand_canvas_database.sql` - Database structure

### Files You'll Build:
2. ⏳ `dist/` folder - Run `npm run build` to create

### Files I'll Give You Now:
3. ⏳ PHP backend files (see below)
4. ⏳ `.htaccess` file
5. ⏳ `config.js` file

---

## 🔧 Backend Files You Need to Create

### File 1: `/public_html/api/config.php`

Copy this and save as `config.php` in `/public_html/api/`:

```php
<?php
// ⚠️ CHANGE THESE VALUES!
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'wiseguy_bluehand');
define('DB_USER', 'wiseguy_bluehand');
define('DB_PASS', 'YOUR_MYSQL_PASSWORD_HERE');  // ← CHANGE THIS!

define('UPLOAD_DIR', dirname(__DIR__) . '/uploads/');
define('UPLOAD_URL', 'https://bluehand.ro/uploads/');
define('JWT_SECRET', 'change-this-random-secret-min-32-chars-bhc2026');  // ← CHANGE THIS!

// Errors
ini_set('display_errors', 0);
error_reporting(E_ALL);

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database connection
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            die(json_encode(['error' => 'Database connection failed']));
        }
    }
    return $pdo;
}

// Helper
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
?>
```

### File 2: `/public_html/.htaccess`

```apache
RewriteEngine On

# API routes
RewriteCond %{REQUEST_URI} ^/api/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^api/(.*)$ /api/index.php/$1 [L,QSA]

# React routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/uploads/
RewriteRule ^ index.html [L]

# CORS
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>
```

### Files 3-6: Other PHP Files

I'll provide simplified versions. Create these files:

**`/public_html/api/index.php`:**
```php
<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';
$path = trim($path, '/');

// Health check
if (empty($path) || $path === 'health') {
    jsonResponse(['status' => 'ok', 'message' => 'BlueHand Canvas API v1.0']);
}

// Route to specific files
if (strpos($path, 'paintings') === 0) {
    require 'paintings.php';
} elseif (strpos($path, 'orders') === 0) {
    require 'orders.php';
} elseif (strpos($path, 'auth') === 0) {
    require 'auth.php';
} elseif ($path === 'upload') {
    require 'upload.php';
} else {
    jsonResponse(['error' => 'Not found'], 404);
}
?>
```

**`/public_html/api/paintings.php`:**
```php
<?php
$db = getDB();

if ($method === 'GET' && $path === 'paintings') {
    // Get all paintings
    $stmt = $db->query("SELECT * FROM paintings WHERE is_active = 1");
    jsonResponse(['paintings' => $stmt->fetchAll()]);
    
} elseif ($method === 'GET' && preg_match('#^paintings/(.+)$#', $path, $m)) {
    // Get single painting
    $stmt = $db->prepare("SELECT * FROM paintings WHERE id = ?");
    $stmt->execute([$m[1]]);
    $painting = $stmt->fetch();
    
    if (!$painting) {
        jsonResponse(['error' => 'Not found'], 404);
    }
    
    jsonResponse(['painting' => $painting]);
    
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
?>
```

**`/public_html/api/orders.php`:**
```php
<?php
$db = getDB();

if ($method === 'POST' && $path === 'orders') {
    // Create order
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = 'order-' . time();
    $orderNumber = 'BHC' . rand(10000, 99999);
    
    $stmt = $db->prepare("
        INSERT INTO orders (id, order_number, customer_name, customer_email, 
            customer_phone, items, total, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    ");
    
    $stmt->execute([
        $id,
        $orderNumber,
        $data['customer']['name'],
        $data['customer']['email'],
        $data['customer']['phone'],
        json_encode($data['items']),
        $data['total']
    ]);
    
    jsonResponse([
        'success' => true, 
        'order_id' => $id,
        'order_number' => $orderNumber
    ], 201);
    
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
?>
```

**`/public_html/api/auth.php`:**
```php
<?php
$db = getDB();

if ($method === 'POST' && $path === 'auth/login') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $db->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$data['username']]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($data['password'], $user['password_hash'])) {
        jsonResponse(['error' => 'Invalid credentials'], 401);
    }
    
    $token = base64_encode(json_encode([
        'user_id' => $user['id'],
        'exp' => time() + (7 * 86400)
    ]));
    
    jsonResponse([
        'success' => true,
        'token' => $token,
        'user' => ['username' => $user['username'], 'role' => $user['role']]
    ]);
    
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
?>
```

**`/public_html/api/upload.php`:**
```php
<?php
require_once 'config.php';

if (!isset($_FILES['file'])) {
    jsonResponse(['error' => 'No file'], 400);
}

$file = $_FILES['file'];
$folder = $_POST['folder'] ?? 'paintings';
$allowed = ['paintings', 'orders', 'sliders', 'blog'];

if (!in_array($folder, $allowed)) {
    jsonResponse(['error' => 'Invalid folder'], 400);
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = time() . '_' . uniqid() . '.' . $ext;
$dir = UPLOAD_DIR . $folder . '/';

if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

if (move_uploaded_file($file['tmp_name'], $dir . $filename)) {
    jsonResponse([
        'success' => true,
        'url' => UPLOAD_URL . $folder . '/' . $filename,
        'filename' => $filename
    ]);
} else {
    jsonResponse(['error' => 'Upload failed'], 500);
}
?>
```

---

## 🧪 Testing Steps

### Step 1: Test API
```
Visit: https://bluehand.ro/api/health
Should see: {"status":"ok","message":"BlueHand Canvas API v1.0"}
```

### Step 2: Test Database
```
Visit: https://bluehand.ro/api/paintings
Should see: {"paintings":[...]}
```

### Step 3: Test Website
```
Visit: https://bluehand.ro
Should see: Your website!
```

### Step 4: Test Admin
```
Visit: https://bluehand.ro/admin
Login: admin / admin123
Should work!
```

---

## ⚠️ Important Notes

### 1. Change Default Password!

After first login, change the admin password:

```sql
-- In phpMyAdmin, run:
UPDATE users 
SET password_hash = '$2y$10$YOUR_NEW_HASH' 
WHERE username = 'admin';
```

To generate hash, create `hash.php`:
```php
<?php
echo password_hash('your_new_password', PASSWORD_DEFAULT);
?>
```

Visit `https://bluehand.ro/hash.php` to get the hash, then delete the file!

### 2. File Permissions

```
uploads/ → 755
api/ → 755
*.php → 644
```

### 3. SSL Certificate

Make sure your domain has SSL enabled (HTTPS). Most cPanel hosts provide free Let's Encrypt SSL.

---

## 🎉 That's It!

Your complete e-commerce platform is now running on YOUR server at:

- 🌐 **Website:** https://bluehand.ro
- 🔐 **Admin:** https://bluehand.ro/admin  
- 📡 **API:** https://bluehand.ro/api
- 📸 **Uploads:** https://bluehand.ro/uploads

**Total Cost:** Just your server hosting fee!  
**No Supabase fees. No GitHub fees. No egress charges!**

Everything runs from one place! 🚀
