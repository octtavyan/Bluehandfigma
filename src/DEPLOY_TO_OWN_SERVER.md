# 🚀 Deploy BlueHand Canvas to Your Own Server

## Overview

Deploy the entire BlueHand Canvas application to your dedicated server without GitHub or Supabase.

**What you need:**
- ✅ FTP access to your server
- ✅ MySQL database access
- ✅ Domain pointing to your server (bluehand.ro)
- ✅ cPanel or file manager access

**Result:**
- Everything runs from: `https://bluehand.ro`
- Database: Local MySQL on your server
- Files: Local filesystem on your server
- Backend: PHP API on your server

---

## 📦 Step 1: Prepare the Application

### On Your Computer:

1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Version 18 or higher

2. **Build the React Application**

Open terminal in the project folder and run:

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with your compiled application.

---

## 📁 Step 2: Prepare Server Files

You'll upload these to your server:

```
/public_html/
├── index.html                    (from dist/)
├── assets/                       (from dist/)
├── uploads/                      (create new)
│   ├── paintings/
│   ├── orders/
│   ├── sliders/
│   └── blog/
├── api/                          (create new - PHP backend)
│   ├── index.php                 (main API router)
│   ├── config.php                (database config)
│   ├── paintings.php             (paintings endpoints)
│   ├── orders.php                (orders endpoints)
│   ├── auth.php                  (admin authentication)
│   └── upload.php                (file uploads)
└── .htaccess                     (rewrite rules)
```

---

## 🗄️ Step 3: Setup Database

### 3.1: Import Database

1. Log into **phpMyAdmin**
2. Create database: `wiseguy_bluehand`
3. Import: `bluehand_canvas_database.sql`

### 3.2: Create Database User

```sql
CREATE USER 'wiseguy_bluehand'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';
GRANT ALL PRIVILEGES ON wiseguy_bluehand.* TO 'wiseguy_bluehand'@'localhost';
FLUSH PRIVILEGES;
```

**Note:** Use `localhost` since database is on same server as website!

---

## 📤 Step 4: Upload Files via FTP

### 4.1: Connect via FTP

- **Host:** 89.41.38.220 (or ftp.bluehand.ro)
- **Username:** wiseguy (or your FTP username)
- **Password:** [your FTP password]
- **Port:** 21

### 4.2: Upload Files

1. **Upload built application:**
   - Upload contents of `dist/` folder to `/public_html/`
   - This includes `index.html` and `assets/` folder

2. **Create folders:**
   ```
   /public_html/uploads/paintings/
   /public_html/uploads/orders/
   /public_html/uploads/sliders/
   /public_html/uploads/blog/
   /public_html/api/
   ```

3. **Set permissions:**
   - `uploads/` and subfolders: 755
   - All PHP files: 644

---

## 🔧 Step 5: Create PHP Backend

Since you're not using Supabase Edge Functions, we need a PHP backend.

### Create `/public_html/api/config.php`:

```php
<?php
// Database configuration
define('DB_HOST', 'localhost');  // ← localhost since DB is on same server
define('DB_PORT', '3306');
define('DB_NAME', 'wiseguy_bluehand');
define('DB_USER', 'wiseguy_bluehand');
define('DB_PASS', 'YOUR_MYSQL_PASSWORD');  // ← Change this!

// Application settings
define('UPLOAD_DIR', dirname(__DIR__) . '/uploads/');
define('UPLOAD_URL', 'https://bluehand.ro/uploads/');
define('JWT_SECRET', 'change-this-to-random-secret-key-min-32-chars');  // ← Change this!

// Error reporting (disable in production)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_log_file(__DIR__ . '/error.log');

// CORS headers
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
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            error_log('Database error: ' . $e->getMessage());
            exit;
        }
    }
    
    return $pdo;
}

// JSON response helper
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
?>
```

### Create `/public_html/api/index.php`:

```php
<?php
require_once 'config.php';

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';
$path = trim($path, '/');

// Route requests
switch (true) {
    // Paintings
    case preg_match('#^paintings$#', $path):
        require 'paintings.php';
        handlePaintings($method);
        break;
    
    case preg_match('#^paintings/([a-zA-Z0-9-]+)$#', $path, $matches):
        require 'paintings.php';
        handlePainting($method, $matches[1]);
        break;
    
    // Orders
    case preg_match('#^orders$#', $path):
        require 'orders.php';
        handleOrders($method);
        break;
    
    case preg_match('#^orders/([a-zA-Z0-9-]+)$#', $path, $matches):
        require 'orders.php';
        handleOrder($method, $matches[1]);
        break;
    
    // Upload
    case $path === 'upload':
        require 'upload.php';
        handleUpload();
        break;
    
    // Auth
    case $path === 'auth/login':
        require 'auth.php';
        handleLogin();
        break;
    
    case $path === 'auth/verify':
        require 'auth.php';
        handleVerify();
        break;
    
    // Health check
    case $path === '' || $path === 'health':
        jsonResponse(['status' => 'ok', 'message' => 'BlueHand Canvas API']);
        break;
    
    default:
        jsonResponse(['error' => 'Endpoint not found'], 404);
}
?>
```

### Create `/public_html/api/paintings.php`:

```php
<?php
require_once 'config.php';

function handlePaintings($method) {
    $db = getDB();
    
    switch ($method) {
        case 'GET':
            $stmt = $db->query("SELECT * FROM paintings WHERE is_active = 1 ORDER BY created_at DESC");
            $paintings = $stmt->fetchAll();
            jsonResponse(['paintings' => $paintings]);
            break;
        
        case 'POST':
            // Check authentication
            requireAuth();
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $db->prepare("
                INSERT INTO paintings (id, title, category, description, image, available_sizes, price, discount, is_active)
                VALUES (:id, :title, :category, :description, :image, :sizes, :price, :discount, :active)
            ");
            
            $id = 'painting-' . time() . '-' . uniqid();
            
            $stmt->execute([
                'id' => $id,
                'title' => $data['title'],
                'category' => $data['category'],
                'description' => $data['description'] ?? '',
                'image' => $data['image'],
                'sizes' => json_encode($data['available_sizes'] ?? []),
                'price' => $data['price'],
                'discount' => $data['discount'] ?? 0,
                'active' => $data['is_active'] ?? 1,
            ]);
            
            jsonResponse(['success' => true, 'id' => $id], 201);
            break;
        
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
}

function handlePainting($method, $id) {
    $db = getDB();
    
    switch ($method) {
        case 'GET':
            $stmt = $db->prepare("SELECT * FROM paintings WHERE id = ?");
            $stmt->execute([$id]);
            $painting = $stmt->fetch();
            
            if (!$painting) {
                jsonResponse(['error' => 'Painting not found'], 404);
            }
            
            jsonResponse(['painting' => $painting]);
            break;
        
        case 'PUT':
            requireAuth();
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $db->prepare("
                UPDATE paintings 
                SET title = :title, category = :category, description = :description,
                    image = :image, price = :price, discount = :discount, is_active = :active
                WHERE id = :id
            ");
            
            $stmt->execute([
                'id' => $id,
                'title' => $data['title'],
                'category' => $data['category'],
                'description' => $data['description'] ?? '',
                'image' => $data['image'],
                'price' => $data['price'],
                'discount' => $data['discount'] ?? 0,
                'active' => $data['is_active'] ?? 1,
            ]);
            
            jsonResponse(['success' => true]);
            break;
        
        case 'DELETE':
            requireAuth();
            
            $stmt = $db->prepare("DELETE FROM paintings WHERE id = ?");
            $stmt->execute([$id]);
            
            jsonResponse(['success' => true]);
            break;
        
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
}

function requireAuth() {
    // Simple JWT verification - you'll need to implement this
    $token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_replace('Bearer ', '', $token);
    
    if (empty($token)) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
    
    // TODO: Verify JWT token
    // For now, accept any non-empty token in development
}
?>
```

### Create `/public_html/api/upload.php`:

```php
<?php
require_once 'config.php';

function handleUpload() {
    // Check if file was uploaded
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        jsonResponse(['error' => 'No file uploaded'], 400);
    }
    
    $file = $_FILES['file'];
    $folder = $_POST['folder'] ?? 'paintings';
    
    // Validate folder
    $allowedFolders = ['paintings', 'orders', 'sliders', 'blog'];
    if (!in_array($folder, $allowedFolders)) {
        jsonResponse(['error' => 'Invalid folder'], 400);
    }
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        jsonResponse(['error' => 'Invalid file type'], 400);
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = time() . '_' . uniqid() . '.' . $extension;
    
    // Upload directory
    $uploadDir = UPLOAD_DIR . $folder . '/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Move file
    $destination = $uploadDir . $filename;
    if (move_uploaded_file($file['tmp_name'], $destination)) {
        chmod($destination, 0644);
        
        $url = UPLOAD_URL . $folder . '/' . $filename;
        
        jsonResponse([
            'success' => true,
            'url' => $url,
            'filename' => $filename,
            'folder' => $folder,
        ]);
    } else {
        jsonResponse(['error' => 'Failed to upload file'], 500);
    }
}
?>
```

### Create `/public_html/api/auth.php`:

```php
<?php
require_once 'config.php';

function handleLogin() {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        jsonResponse(['error' => 'Username and password required'], 400);
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password_hash'])) {
        jsonResponse(['error' => 'Invalid credentials'], 401);
    }
    
    // Generate JWT token (simplified version)
    $token = base64_encode(json_encode([
        'user_id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
        'exp' => time() + (7 * 24 * 60 * 60), // 7 days
    ]));
    
    jsonResponse([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
        ],
    ]);
}

function handleVerify() {
    requireAuth();
    jsonResponse(['success' => true, 'valid' => true]);
}
?>
```

### Create `/public_html/api/orders.php`:

```php
<?php
require_once 'config.php';

function handleOrders($method) {
    $db = getDB();
    
    switch ($method) {
        case 'GET':
            requireAuth();
            
            $stmt = $db->query("SELECT * FROM orders ORDER BY created_at DESC");
            $orders = $stmt->fetchAll();
            jsonResponse(['orders' => $orders]);
            break;
        
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $id = 'order-' . time() . '-' . uniqid();
            $orderNumber = 'BHC' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
            
            $stmt = $db->prepare("
                INSERT INTO orders (
                    id, order_number, customer_name, customer_email, customer_phone,
                    address, city, county, items, subtotal, total, delivery_price,
                    delivery_method, payment_method, payment_status
                ) VALUES (
                    :id, :order_number, :name, :email, :phone,
                    :address, :city, :county, :items, :subtotal, :total, :delivery_price,
                    :delivery_method, :payment_method, 'pending'
                )
            ");
            
            $stmt->execute([
                'id' => $id,
                'order_number' => $orderNumber,
                'name' => $data['customer']['name'],
                'email' => $data['customer']['email'],
                'phone' => $data['customer']['phone'],
                'address' => $data['delivery']['address'],
                'city' => $data['delivery']['city'],
                'county' => $data['delivery']['county'],
                'items' => json_encode($data['items']),
                'subtotal' => $data['subtotal'],
                'total' => $data['total'],
                'delivery_price' => $data['deliveryPrice'],
                'delivery_method' => $data['deliveryMethod'],
                'payment_method' => $data['paymentMethod'],
            ]);
            
            jsonResponse(['success' => true, 'order_id' => $id, 'order_number' => $orderNumber], 201);
            break;
        
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
}

function handleOrder($method, $id) {
    $db = getDB();
    
    switch ($method) {
        case 'GET':
            $stmt = $db->prepare("SELECT * FROM orders WHERE id = ? OR order_number = ?");
            $stmt->execute([$id, $id]);
            $order = $stmt->fetch();
            
            if (!$order) {
                jsonResponse(['error' => 'Order not found'], 404);
            }
            
            jsonResponse(['order' => $order]);
            break;
        
        case 'PUT':
            requireAuth();
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $db->prepare("
                UPDATE orders 
                SET payment_status = :status, awb_number = :awb, tracking_status = :tracking
                WHERE id = :id
            ");
            
            $stmt->execute([
                'id' => $id,
                'status' => $data['payment_status'] ?? 'pending',
                'awb' => $data['awb_number'] ?? null,
                'tracking' => $data['tracking_status'] ?? null,
            ]);
            
            jsonResponse(['success' => true]);
            break;
        
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
}
?>
```

---

## 🔀 Step 6: Create .htaccess for Clean URLs

### Create `/public_html/.htaccess`:

```apache
# Enable rewrite engine
RewriteEngine On

# API routes - redirect to api/index.php
RewriteCond %{REQUEST_URI} ^/api/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ /api/index.php/$1 [L,QSA]

# Frontend routes - redirect all to index.html (React Router)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/uploads/
RewriteRule ^ index.html [L]

# Enable CORS
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Compress files
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

---

## ⚙️ Step 7: Update Frontend API URLs

The React app needs to know where the API is. Since everything is on the same server, update the API base URL.

### Create `/public_html/config.js`:

```javascript
window.APP_CONFIG = {
  apiBaseUrl: 'https://bluehand.ro/api',
  uploadUrl: 'https://bluehand.ro/uploads',
};
```

### Add to `/public_html/index.html` (in <head>):

```html
<script src="/config.js"></script>
```

---

## ✅ Step 8: Test Everything

### 8.1: Test Website

Visit: `https://bluehand.ro`

Should see your website!

### 8.2: Test API

Visit: `https://bluehand.ro/api/health`

Should see: `{"status":"ok","message":"BlueHand Canvas API"}`

### 8.3: Test Database

Visit: `https://bluehand.ro/api/paintings`

Should see: `{"paintings":[...]}`

### 8.4: Test Upload

Try uploading an image in admin panel.

---

## 🔒 Step 9: Security

### 9.1: Change Default Passwords

```sql
-- Login to MySQL
mysql -u root -p

-- Update admin password
USE wiseguy_bluehand;
UPDATE users SET password_hash = '$2y$10$NEW_HASH_HERE' WHERE username = 'admin';
```

To generate new password hash in PHP:
```php
<?php
echo password_hash('your_new_password', PASSWORD_DEFAULT);
?>
```

### 9.2: Secure config.php

```bash
chmod 600 /public_html/api/config.php
```

### 9.3: Block direct access to API folder

Add to `/public_html/api/.htaccess`:

```apache
# Only allow access through index.php
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule !^index\.php$ - [F]
```

---

## 📊 Final Structure

```
Your Server (89.41.38.220)
└── /public_html/
    ├── index.html                 ← React app entry
    ├── config.js                  ← API configuration
    ├── assets/                    ← Built React assets
    │   ├── index-abc123.js
    │   └── index-def456.css
    ├── uploads/                   ← Uploaded images
    │   ├── paintings/
    │   ├── orders/
    │   ├── sliders/
    │   └── blog/
    ├── api/                       ← PHP backend
    │   ├── index.php              ← API router
    │   ├── config.php             ← Database config
    │   ├── paintings.php          ← Paintings endpoints
    │   ├── orders.php             ← Orders endpoints
    │   ├── auth.php               ← Authentication
    │   └── upload.php             ← File uploads
    └── .htaccess                  ← URL rewriting
```

---

## 🎉 You're Done!

Your complete application is now running on your server at:
- **Website:** https://bluehand.ro
- **Admin:** https://bluehand.ro/admin
- **API:** https://bluehand.ro/api
- **Uploads:** https://bluehand.ro/uploads

**No Supabase, no GitHub Pages, no external dependencies!**

Everything runs from YOUR server! 🚀
