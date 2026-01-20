# 🚀 BlueHand Server Setup Instructions

## Problem: Getting 404 errors on `/api/` endpoints

This means the API files don't exist or aren't configured correctly on your server.

---

## ✅ Solution: Set up the API on your server

### Step 1: SSH into your server

```bash
ssh root@89.41.38.220
# or
ssh root@bluehand.ro
```

### Step 2: Navigate to your web root

```bash
cd /var/www/html
# or if different:
# cd /home/bluehand/public_html
```

### Step 3: Create the `/api` directory

```bash
mkdir -p api
cd api
```

### Step 4: Create `index.php`

```bash
nano index.php
```

**Paste this code:**

```php
<?php
// CORS HEADERS - MUST BE FIRST!
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json');

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
$host = 'localhost';
$dbname = 'bluehand_db'; // CHANGE THIS
$username = 'bluehand_user'; // CHANGE THIS
$password = 'your_password'; // CHANGE THIS

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// Routing
$path = str_replace('/api/', '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$path = trim($path, '/');
$segments = explode('/', $path);
$endpoint = $segments[0] ?? '';

// Endpoints
switch ($endpoint) {
    case 'paintings':
        $stmt = $pdo->query("SELECT * FROM paintings");
        echo json_encode(['paintings' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    
    case 'categories':
        $stmt = $pdo->query("SELECT * FROM categories");
        echo json_encode(['categories' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    
    case 'sizes':
        $stmt = $pdo->query("SELECT * FROM sizes");
        echo json_encode(['sizes' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    
    case 'styles':
        $stmt = $pdo->query("SELECT * FROM styles");
        echo json_encode(['styles' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    
    case 'print-types':
        $stmt = $pdo->query("SELECT * FROM print_types");
        echo json_encode(['printTypes' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    
    case 'frame-types':
        $stmt = $pdo->query("SELECT * FROM frame_types");
        echo json_encode(['frameTypes' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    
    case 'orders':
        $stmt = $pdo->query("SELECT * FROM orders");
        echo json_encode(['orders' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    
    case 'health':
        echo json_encode(['status' => 'ok', 'database' => 'connected']);
        break;
    
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}
```

**Save:** Ctrl+X, then Y, then Enter

### Step 5: Create `.htaccess`

```bash
nano .htaccess
```

**Paste this:**

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [L,QSA]
```

**Save:** Ctrl+X, then Y, then Enter

### Step 6: Set correct permissions

```bash
chmod 644 index.php
chmod 644 .htaccess
```

### Step 7: Enable mod_rewrite (if not already enabled)

```bash
# For Apache:
sudo a2enmod rewrite
sudo systemctl restart apache2

# For Nginx: Already enabled by default
```

### Step 8: Test the API

```bash
curl https://bluehand.ro/api/health
```

**You should see:**
```json
{"status":"ok","database":"connected"}
```

---

## 🧪 Verify it works

**Open in browser:**
- https://bluehand.ro/api/health
- https://bluehand.ro/api/paintings

**You should see JSON data, not 404!**

---

## ❌ Troubleshooting

### Still getting 404?

1. **Check Apache virtual host config:**
   ```bash
   nano /etc/apache2/sites-available/bluehand.ro.conf
   ```
   
   Make sure it has:
   ```apache
   <Directory /var/www/html>
       AllowOverride All
   </Directory>
   ```

2. **Restart Apache:**
   ```bash
   sudo systemctl restart apache2
   ```

3. **Check error logs:**
   ```bash
   tail -f /var/log/apache2/error.log
   ```

### Getting database errors?

Update the database credentials in `index.php`:
```php
$dbname = 'your_actual_db_name';
$username = 'your_actual_username';
$password = 'your_actual_password';
```

---

## 📁 File Structure

After setup, you should have:

```
/var/www/html/
├── api/
│   ├── index.php     (Main API file)
│   └── .htaccess     (URL rewriting)
└── uploads/          (For file uploads)
```

---

## ✅ Once it works

The app will automatically connect and all errors will disappear!
