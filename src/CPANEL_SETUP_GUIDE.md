# 🎛️ BlueHand Canvas - cPanel Setup Guide

## 📋 Overview for cPanel Users

Since you're using **cPanel**, the setup is much simpler! cPanel provides graphical tools for everything:
- ✅ MySQL database creation
- ✅ phpMyAdmin access
- ✅ File uploads
- ✅ Remote MySQL configuration

---

## 🗄️ Part 1: Database Setup (10 minutes)

### Step 1: Create MySQL Database

1. **Log in to cPanel**
   - URL: Usually `https://your-domain.com/cpanel` or `https://your-domain.com:2083`
   - Enter your cPanel username and password

2. **Navigate to "MySQL Databases"**
   - Find it under the **"Databases"** section
   - Click on **"MySQL Databases"**

3. **Create New Database**
   - Under **"Create New Database"**
   - Database Name: `bluehand` (cPanel will prefix it automatically, e.g., `wiseguy_bluehand`)
   - Click **"Create Database"**
   - ✅ Note the full database name (e.g., `wiseguy_bluehand`)

### Step 2: Create MySQL User

1. **Scroll down to "MySQL Users"** section
2. **Add New User:**
   - Username: `bluehand` (will become `wiseguy_bluehand`)
   - Password: Generate a strong password (use cPanel's password generator)
   - Click **"Create User"**
   - ✅ **IMPORTANT:** Save this password securely! You'll need it later.

### Step 3: Add User to Database

1. **Scroll to "Add User to Database"**
2. **Select:**
   - User: `wiseguy_bluehand`
   - Database: `wiseguy_bluehand`
3. Click **"Add"**
4. **On the privileges page:**
   - Check **"ALL PRIVILEGES"** (or click the checkbox at the top)
   - Click **"Make Changes"**

✅ **You now have:** Database created, user created, permissions granted!

---

### Step 4: Import Database Schema

1. **In cPanel, go to "phpMyAdmin"**
   - Find it under the **"Databases"** section
   - Opens in a new window

2. **Select your database**
   - Click on `wiseguy_bluehand` in the left sidebar

3. **Import the SQL file**
   - Click the **"Import"** tab at the top
   - Click **"Choose File"** button
   - Select `bluehand_canvas_database.sql` from your computer
   - Scroll down and click **"Go"** button
   - Wait for import to complete (should take 10-30 seconds)

4. **Verify import**
   - Click on your database in the left sidebar
   - You should see **11 tables:**
     - blog_posts
     - categories
     - clients
     - frame_types
     - hero_slides
     - kv_store
     - orders
     - paintings
     - settings
     - sizes
     - users

✅ **Database is ready!**

---

## 🔌 Part 2: Enable Remote MySQL Access

**Important:** By default, cPanel blocks remote MySQL connections for security.

### Option A: Using cPanel Remote MySQL (Recommended)

1. **In cPanel, find "Remote MySQL"**
   - Under the **"Databases"** section
   - Click **"Remote MySQL®"**

2. **Add Access Host**
   - You need to allow Supabase to connect to your database
   - **Problem:** Supabase uses dynamic IPs, so we need to allow all IPs (or use Supabase's IP ranges)
   
3. **For Development/Testing (NOT recommended for production):**
   - Enter: `%` (allows all IPs)
   - Click **"Add Host"**
   - ⚠️ **Security Warning:** This allows any IP to try connecting (they still need password)

4. **For Production (More Secure):**
   - Contact your host and ask: "What are the MySQL remote connection requirements?"
   - Or use a VPN/fixed IP for your Supabase Edge Functions
   - Or use SSH tunnel (advanced)

### Option B: Ask Your Hosting Provider

If you can't find "Remote MySQL" in cPanel:

**Contact your hosting support and say:**
> "I need to enable remote MySQL access for my database `wiseguy_bluehand` to connect from an external application (Supabase Edge Functions). Can you please enable remote MySQL access or provide instructions?"

---

## 📁 Part 3: File Upload Setup (15 minutes)

### Step 1: Create Upload Folders

1. **In cPanel, go to "File Manager"**
   - Under **"Files"** section
   - Opens in a new window

2. **Navigate to your public folder**
   - Usually `public_html` (this is your website root)
   - This is where `https://your-domain.com/` points to

3. **Create "uploads" folder**
   - Click **"+ Folder"** button at the top
   - Name: `uploads`
   - Click **"Create New Folder"**

4. **Enter the uploads folder**
   - Double-click on `uploads` folder

5. **Create subfolders**
   - Create 4 folders inside uploads:
     - `paintings`
     - `orders`
     - `sliders`
     - `blog`

Your structure should look like:
```
public_html/
└── uploads/
    ├── paintings/
    ├── orders/
    ├── sliders/
    └── blog/
```

### Step 2: Create Upload Script

1. **Still in File Manager, go back to `public_html`**
2. **Click "+ File" button**
   - File Name: `upload.php`
   - Click **"Create New File"**

3. **Right-click on `upload.php`** → **"Edit"**
4. **Paste this code:**

```php
<?php
/**
 * BlueHand Canvas - Upload Endpoint for cPanel
 */

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't show errors to users
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/upload_errors.log');

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// ============================================
// CONFIGURATION - CHANGE THESE VALUES!
// ============================================
define('UPLOAD_API_KEY', 'your-secure-api-key-change-this-now-12345'); // ⚠️ CHANGE THIS!
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB max file size
define('UPLOAD_BASE_DIR', __DIR__ . '/uploads/');

// Get API key from header
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$providedKey = str_replace('Bearer ', '', $authHeader);

// Validate API key (optional - comment out if not using)
if ($providedKey !== UPLOAD_API_KEY) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized - Invalid API key']);
    exit;
}

// Get uploaded file
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errorMsg = 'No file uploaded';
    if (isset($_FILES['file']['error'])) {
        switch ($_FILES['file']['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $errorMsg = 'File too large';
                break;
            case UPLOAD_ERR_PARTIAL:
                $errorMsg = 'File partially uploaded';
                break;
            case UPLOAD_ERR_NO_FILE:
                $errorMsg = 'No file uploaded';
                break;
            default:
                $errorMsg = 'Upload error: ' . $_FILES['file']['error'];
        }
    }
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $errorMsg]);
    exit;
}

$file = $_FILES['file'];

// Get folder (default: paintings)
$folder = $_POST['folder'] ?? 'paintings';

// Validate folder
$allowedFolders = ['paintings', 'orders', 'sliders', 'blog'];
if (!in_array($folder, $allowedFolders)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid folder. Allowed: ' . implode(', ', $allowedFolders)]);
    exit;
}

// Check file size
if ($file['size'] > MAX_FILE_SIZE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File too large. Max size: ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB']);
    exit;
}

// Validate file type using MIME type
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Only images allowed (JPG, PNG, WebP, GIF). Detected: ' . $mimeType]);
    exit;
}

// Generate unique filename
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (empty($extension)) {
    // Determine extension from MIME type
    $mimeToExt = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif'
    ];
    $extension = $mimeToExt[$mimeType] ?? 'jpg';
}

$filename = time() . '_' . uniqid() . '.' . $extension;

// Create directory if it doesn't exist
$uploadDir = UPLOAD_BASE_DIR . $folder . '/';
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create upload directory']);
        exit;
    }
}

// Move uploaded file
$destination = $uploadDir . $filename;
if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Set proper permissions
    chmod($destination, 0644);
    
    // Build URL
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $url = $protocol . '://' . $host . '/uploads/' . $folder . '/' . $filename;
    
    // Success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'url' => $url,
        'filename' => $filename,
        'folder' => $folder,
        'size' => filesize($destination),
        'mime_type' => $mimeType
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save file. Check folder permissions.']);
}
?>
```

5. **Save the file** (Click "Save Changes")

6. **⚠️ IMPORTANT: Change the API Key**
   - Line 23: `define('UPLOAD_API_KEY', 'your-secure-api-key-change-this-now-12345');`
   - Change to something random and secure, for example:
   - `define('UPLOAD_API_KEY', 'bhc_2026_xK9mP2vN8qL5wR3tY7uI0oP4');`
   - Save this key! You'll need it for the admin settings.

### Step 3: Set Permissions (Usually automatic in cPanel)

cPanel usually sets correct permissions automatically, but verify:

1. **In File Manager:**
   - Right-click `uploads` folder → **"Change Permissions"**
   - Should be **755** (drwxr-xr-x)
   - Check **"Recurse into subdirectories"**
   - Click **"Change Permissions"**

2. **For `upload.php`:**
   - Right-click `upload.php` → **"Change Permissions"**
   - Should be **644** (-rw-r--r--)

✅ **File upload is ready!**

---

## 🎯 Part 4: Configure BlueHand Canvas Admin

Now you need to fill in the settings from your screenshot.

### Where to find your cPanel values:

1. **Host (Server Address):**
   - **Option 1:** Your domain name: `your-domain.com`
   - **Option 2:** Server hostname - Check cPanel's right sidebar under "General Information" → "Hostname"
   - **Option 3:** Server IP address - Check cPanel's right sidebar under "General Information" → "Server IP Address"
   
   ⚠️ **NOT `localhost`** - that only works if the app is on the same server

2. **Port:**
   - Always `3306` (standard MySQL port)

3. **Database Name:**
   - The full name from cPanel, e.g., `wiseguy_bluehand`
   - (Your cPanel username + underscore + database name)

4. **Username:**
   - The full username from cPanel, e.g., `wiseguy_bluehand`
   - (Same prefix as database)

5. **Password:**
   - The password you created in Step 2 (MySQL User creation)

6. **SSL:**
   - ✅ Check "Folosește SSL" if your hosting supports it
   - Most modern cPanel hosts support this

### Example Configuration:

Based on your screenshot, here's what it should look like:

```
Provider Bază de Date: ✅ Server Dedicat

Host: your-domain.com  (or server123.hosting.com)
Port: 3306
Nume Bază de Date: wiseguy_bluehand
Username: wiseguy_bluehand
Password: [the password you created]
✅ Folosește SSL pentru conexiune
```

### Server Storage Configuration:

```
Mod Stocare Fișiere: ✅ Server Filesystem

URL Bază Server: https://your-domain.com
Endpoint Upload: /upload.php
API Key: bhc_2026_xK9mP2vN8qL5wR3tY7uI0oP4  (the one from upload.php)
```

---

## ✅ Part 5: Testing

### Test 1: Database Connection

1. **In BlueHand Canvas Admin:**
   - Go to **Settings** → **Configurare DB & Stocare** tab
   - Fill in all the database details
   - Click **"Testează Conexiunea"**
   - Should see: ✅ **"Conexiune MySQL reușită!"**

If you get an error:
- ❌ "Connection refused" → Remote MySQL not enabled
- ❌ "Access denied" → Wrong username/password
- ❌ "Unknown database" → Database name is wrong
- ❌ "Host not found" → Wrong hostname/IP

### Test 2: File Upload

**Option A: Use the test page**

1. Open `test-upload.html` in your browser
2. Fill in:
   - Server URL: `https://your-domain.com`
   - API Key: `bhc_2026_xK9mP2vN8qL5wR3tY7uI0oP4`
   - Folder: `paintings`
3. Choose an image
4. Click "Încarcă Imagine"
5. Should see success message with image URL

**Option B: Upload from admin panel**

1. Go to **Paintings** → **Add New Painting**
2. Try uploading an image
3. Should upload successfully

### Test 3: Image Access

1. After uploading, copy the image URL (e.g., `https://your-domain.com/uploads/paintings/1234567890_abc.jpg`)
2. Open it in a new browser tab
3. Image should display

---

## 🔍 Troubleshooting

### Issue: "Remote MySQL not available in cPanel"

**Solution:**
- Contact your hosting provider support
- Ask them to enable remote MySQL access
- Or ask if they provide a "MySQL Hostname" for remote connections

### Issue: "Upload fails with 403 Forbidden"

**Solution:**
```
1. In cPanel File Manager, check upload.php permissions
2. Should be 644 (not 600)
3. Check .htaccess file - might be blocking PHP execution
```

### Issue: "Images show broken/can't load"

**Solution:**
```
1. Check if image file exists in cPanel File Manager
2. Check uploads folder permissions (should be 755)
3. Check if URL is correct (https://your-domain.com/uploads/...)
4. Check for .htaccess files blocking access
```

### Issue: "File too large"

**Solution:**
1. In cPanel, go to **"Select PHP Version"** (or "MultiPHP INI Editor")
2. Find and increase:
   - `upload_max_filesize` → `50M`
   - `post_max_size` → `50M`
   - `max_execution_time` → `300`
3. Save and try again

### Issue: "Can't connect to database from admin panel"

**Common causes:**
1. ❌ Using `localhost` as host (won't work from Supabase Edge Functions)
2. ❌ Remote MySQL not enabled in cPanel
3. ❌ Firewall blocking port 3306
4. ❌ Wrong credentials

**Solutions:**
1. Use your server's hostname or IP, not `localhost`
2. Enable "Remote MySQL" in cPanel
3. Contact hosting provider about MySQL remote access
4. Double-check database name includes prefix (e.g., `wiseguy_bluehand`)

---

## 📊 What You Should See in cPanel

### MySQL Databases Page:
```
Current Databases:
wiseguy_bluehand (11 tables)

Privileged Users:
wiseguy_bluehand (ALL PRIVILEGES)
```

### File Manager (public_html):
```
📁 public_html/
  ├── 📁 uploads/
  │   ├── 📁 paintings/
  │   ├── 📁 orders/
  │   ├── 📁 sliders/
  │   └── 📁 blog/
  ├── 📄 upload.php
  └── ... (other website files)
```

### phpMyAdmin:
```
Database: wiseguy_bluehand

Tables (11):
✅ blog_posts
✅ categories
✅ clients
✅ frame_types
✅ hero_slides
✅ kv_store
✅ orders
✅ paintings
✅ settings
✅ sizes
✅ users
```

---

## 🎉 You're Done!

After completing all steps:

✅ Database created and populated  
✅ Remote MySQL access enabled  
✅ Upload folders created  
✅ Upload script deployed  
✅ Admin panel configured  
✅ Connection tested  
✅ File upload tested  

Your BlueHand Canvas should now be using your cPanel server for database and storage instead of Supabase, **eliminating egress costs!**

---

## 💡 Important Notes

1. **Backup regularly** - Use cPanel's backup tool
2. **Monitor storage space** - cPanel shows disk usage
3. **Keep credentials secure** - Don't share your API key
4. **Update PHP** - Make sure you're on PHP 7.4 or higher
5. **SSL Certificate** - Make sure your domain has HTTPS enabled

---

## 📞 Need Help?

**cPanel Documentation:** https://docs.cpanel.net/  
**Your Hosting Provider Support:** Check your hosting control panel for support options

Most hosting providers with cPanel offer 24/7 support and can help with:
- Enabling remote MySQL
- Setting up correct permissions
- Troubleshooting upload issues
- Increasing PHP limits
