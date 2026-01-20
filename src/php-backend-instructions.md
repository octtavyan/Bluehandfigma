# 🔧 PHP Backend CORS Fix Instructions

## ❌ Problem
Figma Make preview is getting "Failed to fetch" errors because your PHP backend at `bluehand.ro/api` is blocking requests from Figma's domain due to CORS (Cross-Origin Resource Sharing) restrictions.

## ✅ Solution: Add CORS Headers to PHP

You need to add CORS headers to **ALL your PHP files** on your server.

---

## 📝 Method 1: Add to Each PHP File (Recommended)

Add these lines **at the very top** of EVERY PHP file (before any other code):

```php
<?php
// CORS Headers - Allow requests from any domain
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400'); // 24 hours

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Your existing code continues here...
```

### Files to update:
1. ✅ `/api/index.php` (or index-fixed.php)
2. ✅ `/api/config.php`
3. ✅ `/api/cart.php`
4. ✅ `/api/auth/login.php` (if this file exists)
5. ✅ Any other PHP files in `/api/`

---

## 📝 Method 2: .htaccess (Global Fix)

Alternatively, add this to your `.htaccess` file in the `/api` directory:

```apache
# CORS Headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
Header always set Access-Control-Max-Age "86400"

# Handle OPTIONS preflight
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]
```

---

## 🧪 Test After Adding CORS

1. Save your PHP files with the CORS headers
2. In Figma Make, click **🔍 Debug Auth** button
3. Look at the **API Configuration** section
4. Try to login again with:
   - Username: `admin`
   - Password: `admin123`

---

## 🔍 Expected Result

After adding CORS headers, you should see:
- ✅ No more "Failed to fetch" errors
- ✅ Login works successfully
- ✅ Debug Auth shows: "Using PHP Backend (bluehand.ro)"

---

## 📋 Complete Example: auth/login.php

Create or update `/api/auth/login.php`:

```php
<?php
// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include config
require_once '../config.php';

// Get request body
$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'error' => 'Username and password required']);
    exit;
}

try {
    // Query database
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($password, $user['password_hash'])) {
        // Generate token (simple - use JWT for production)
        $token = bin2hex(random_bytes(32));
        
        // Return success
        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'full_name' => $user['username'] // Add full_name column if needed
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

## 🎯 Quick Checklist

- [ ] Added CORS headers to all PHP files OR .htaccess
- [ ] Created `/api/auth/login.php` file
- [ ] Verified admin user exists in database (username: admin)
- [ ] Tested login from Figma Make preview
- [ ] Checked browser console for any remaining errors

---

## ❓ Still Not Working?

If you still see "Failed to fetch" errors:

1. Open browser console (F12)
2. Look for CORS errors in the Console tab
3. Check Network tab - click on the failed request
4. Share the error message with me

You can also test directly:
```bash
curl -X POST https://bluehand.ro/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

This should return JSON with `{"success":true,...}` if everything works!
