# BlueHand Canvas - Server Configuration Guide

## Architecture Overview

Your BlueHand Canvas setup uses a **split architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                       DNS (CNAME)                            │
│              bluehand.ro → GitHub Pages                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (GitHub Pages)                    │
│  • React Application                                         │
│  • Static HTML/CSS/JS                                        │
│  • Images served from dedicated server                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              DEDICATED SERVER (Your Server)                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  MySQL Database (phpMyAdmin)                           │ │
│  │  • wiseguy_bluehand database                           │ │
│  │  • Port: 3306                                          │ │
│  │  • Remote access enabled                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  File Storage (uploads/)                               │ │
│  │  • /uploads/paintings/                                 │ │
│  │  • /uploads/orders/                                    │ │
│  │  • /uploads/sliders/                                   │ │
│  │  • /uploads/blog/                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Web Server (Apache/Nginx)                             │ │
│  │  • Serves images via HTTP                              │ │
│  │  • API endpoint for file uploads                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Database Configuration (phpMyAdmin)

### Step 1: Import Database

1. **Access phpMyAdmin** on your dedicated server
2. **Create a new database** named `wiseguy_bluehand`
3. **Import the SQL file**: `bluehand_canvas_database.sql`
   - Click on the database name
   - Go to "Import" tab
   - Choose the SQL file
   - Click "Go"

### Step 2: Create Database User

```sql
-- Create user for remote access
CREATE USER 'wiseguy_bluehand'@'%' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON wiseguy_bluehand.* TO 'wiseguy_bluehand'@'%';

-- Flush privileges
FLUSH PRIVILEGES;
```

### Step 3: Enable Remote MySQL Access

**Edit MySQL configuration** (usually `/etc/mysql/my.cnf` or `/etc/my.cnf`):

```ini
[mysqld]
# Bind to all interfaces (allow remote connections)
bind-address = 0.0.0.0

# Or bind to specific IP if you prefer
# bind-address = YOUR_SERVER_IP

# Max connections
max_connections = 200

# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

**Restart MySQL**:
```bash
sudo systemctl restart mysql
# or
sudo service mysql restart
```

**Open firewall** (if applicable):
```bash
# For UFW
sudo ufw allow 3306/tcp

# For firewalld
sudo firewall-cmd --permanent --add-port=3306/tcp
sudo firewall-cmd --reload
```

⚠️ **SECURITY WARNING**: For production, restrict MySQL access to specific IPs:
```sql
-- Only allow access from Supabase Edge Functions IP range
CREATE USER 'wiseguy_bluehand'@'SUPABASE_IP' IDENTIFIED BY 'PASSWORD';
```

---

## 2. File Storage Configuration

### Step 1: Create Upload Directories

```bash
# Navigate to your web root
cd /var/www/html  # or /home/your-user/public_html

# Create upload directories
mkdir -p uploads/paintings
mkdir -p uploads/orders
mkdir -p uploads/sliders
mkdir -p uploads/blog

# Set proper permissions
chmod -R 755 uploads
chown -R www-data:www-data uploads  # or your web server user

# For Apache user (might be different)
# chown -R apache:apache uploads
```

### Step 2: Configure Web Server to Serve Images

#### Option A: Apache (.htaccess)

Create `/var/www/html/uploads/.htaccess`:

```apache
# Enable CORS for images
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</IfModule>

# Enable image caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
</IfModule>

# Prevent directory listing
Options -Indexes

# Allow image access
<FilesMatch "\.(jpg|jpeg|png|gif|webp)$">
    Require all granted
</FilesMatch>
```

#### Option B: Nginx

Add to your Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-server.com;
    
    # Upload folder
    location /uploads/ {
        root /var/www/html;
        
        # Enable CORS
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Content-Type';
        
        # Cache images for 1 year
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Disable directory listing
        autoindex off;
    }
    
    # Handle OPTIONS requests for CORS
    location /uploads/ {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

Reload Nginx:
```bash
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

---

## 3. BlueHand Canvas Admin Settings Configuration

Based on your screenshot, fill in the **"Configurare Server MySQL"** section with these values:

### Database Configuration

| Field | Value | Notes |
|-------|-------|-------|
| **Host** | `your-server-ip.com` or `123.45.67.89` | Your dedicated server IP or hostname |
| **Port** | `3306` | Default MySQL port |
| **Nume Bază de Date** | `wiseguy_bluehand` | As shown in your screenshot |
| **Username** | `wiseguy_bluehand` | As shown in your screenshot |
| **Password** | `YOUR_DATABASE_PASSWORD` | Your MySQL password (hidden) |
| **Folosește SSL** | ✅ Checked (recommended) | Enable if your server supports SSL |

### Storage Configuration

In the **"Configurare Stocare pe Server"** section:

| Field | Value | Example |
|-------|-------|---------|
| **URL Bază Server** | `https://your-server.com` | Your dedicated server URL |
| **Endpoint Upload** | `/upload.php` | Upload script endpoint (see below) |
| **API Key** | `your-secure-api-key-123` | Optional, for securing uploads |

---

## 4. Create Upload Script on Server

Create `/var/www/html/upload.php`:

```php
<?php
/**
 * BlueHand Canvas - File Upload Endpoint
 * This script handles file uploads from the application
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Optional: API Key authentication
$apiKey = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$expectedKey = 'Bearer your-secure-api-key-123'; // Change this!

if ($apiKey !== $expectedKey) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

// Get uploaded file and folder
$file = $_FILES['file'] ?? null;
$folder = $_POST['folder'] ?? 'paintings';

// Validate
if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No file uploaded or upload error']);
    exit;
}

// Validate folder
$allowedFolders = ['paintings', 'orders', 'sliders', 'blog'];
if (!in_array($folder, $allowedFolders)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid folder']);
    exit;
}

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file type. Only images allowed.']);
    exit;
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = time() . '_' . uniqid() . '.' . $extension;

// Create directory if it doesn't exist
$uploadDir = __DIR__ . '/uploads/' . $folder . '/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Move uploaded file
$destination = $uploadDir . $filename;
if (move_uploaded_file($file['tmp_name'], $destination)) {
    $url = 'https://' . $_SERVER['HTTP_HOST'] . '/uploads/' . $folder . '/' . $filename;
    
    echo json_encode([
        'success' => true,
        'url' => $url,
        'filename' => $filename,
        'folder' => $folder,
        'size' => filesize($destination)
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save file']);
}
?>
```

**Set permissions**:
```bash
chmod 644 /var/www/html/upload.php
```

---

## 5. DNS Configuration

### GitHub Pages Setup

1. **In your GitHub repository**, go to Settings → Pages
2. **Custom domain**: Enter `bluehand.ro`
3. **Enable HTTPS**: ✅ Check "Enforce HTTPS"

### DNS Records (Cloudflare/Your DNS Provider)

Add these DNS records:

```
Type    Name    Content                     TTL     Proxy
CNAME   @       your-github-username.github.io   Auto    ✅ Proxied
CNAME   www     your-github-username.github.io   Auto    ✅ Proxied

# Optional: API subdomain pointing to your dedicated server
A       api     123.45.67.89 (your server IP)    Auto    ❌ DNS only
```

---

## 6. Supabase Edge Function Configuration

Since you're still using Supabase for the Edge Functions (backend API), you need to configure it to connect to your MySQL server.

### Environment Variables in Supabase

In your Supabase project dashboard, add these secrets:

```bash
MYSQL_HOST=your-server-ip.com
MYSQL_PORT=3306
MYSQL_DATABASE=wiseguy_bluehand
MYSQL_USER=wiseguy_bluehand
MYSQL_PASSWORD=YOUR_DATABASE_PASSWORD

# Server storage
SERVER_STORAGE_URL=https://your-server.com
SERVER_STORAGE_API_KEY=your-secure-api-key-123
```

---

## 7. Testing the Configuration

### Test Database Connection

In the BlueHand Canvas admin panel:
1. Go to **Settings** → **Configurare DB & Stocare** tab
2. Fill in your MySQL credentials
3. Click **"Testează Conexiunea"**
4. Should see ✅ "Conexiune MySQL reușită!"

### Test File Upload

```bash
# Test upload endpoint
curl -X POST https://your-server.com/upload.php \
  -H "Authorization: Bearer your-secure-api-key-123" \
  -F "file=@test-image.jpg" \
  -F "folder=paintings"

# Expected response:
{
  "success": true,
  "url": "https://your-server.com/uploads/paintings/1234567890_abc123.jpg",
  "filename": "1234567890_abc123.jpg",
  "folder": "paintings",
  "size": 123456
}
```

### Test Image Access

```bash
# Should return image
curl https://your-server.com/uploads/paintings/1234567890_abc123.jpg
```

---

## 8. Security Checklist

- ✅ Change default admin password immediately
- ✅ Use strong MySQL password
- ✅ Enable MySQL SSL if possible
- ✅ Restrict MySQL access to specific IPs
- ✅ Change the upload API key to something secure
- ✅ Enable HTTPS on your dedicated server
- ✅ Set proper file permissions (755 for directories, 644 for files)
- ✅ Configure firewall rules
- ✅ Regular backups of database and uploads folder
- ✅ Monitor server logs for unauthorized access

---

## 9. Backup Strategy

### Database Backup (cron job)

```bash
# Create backup script
sudo nano /root/backup-bluehand.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u wiseguy_bluehand -p'YOUR_PASSWORD' wiseguy_bluehand > $BACKUP_DIR/db_$DATE.sql
gzip $BACKUP_DIR/db_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/html/uploads

# Delete backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x /root/backup-bluehand.sh
```

**Add to crontab** (daily at 2 AM):
```bash
crontab -e
```

Add line:
```
0 2 * * * /root/backup-bluehand.sh >> /var/log/bluehand-backup.log 2>&1
```

---

## 10. Final Configuration Summary

Your configuration in the BlueHand Canvas admin should be:

**Provider Bază de Date**: ✅ Server Dedicat  
**Mod Stocare Fișiere**: ✅ Server Filesystem

**MySQL Settings**:
- Host: `your-server-ip.com`
- Port: `3306`
- Database: `wiseguy_bluehand`
- Username: `wiseguy_bluehand`
- Password: `••••••••••••` (your secure password)
- SSL: ✅ Enabled

**Server Storage Settings**:
- Base URL: `https://your-server.com`
- Upload Endpoint: `/upload.php`
- API Key: `your-secure-api-key-123`

---

## Support

If you encounter issues:

1. **Check server logs**:
   - Apache: `/var/log/apache2/error.log`
   - Nginx: `/var/log/nginx/error.log`
   - MySQL: `/var/log/mysql/error.log`

2. **Check PHP upload limits** in `php.ini`:
   ```ini
   upload_max_filesize = 50M
   post_max_size = 50M
   max_execution_time = 300
   ```

3. **Verify MySQL connection**:
   ```bash
   mysql -h your-server-ip -u wiseguy_bluehand -p wiseguy_bluehand
   ```

4. **Test file permissions**:
   ```bash
   ls -la /var/www/html/uploads/
   ```

---

## Next Steps

1. ✅ Import database SQL file
2. ✅ Configure MySQL remote access
3. ✅ Create upload directories
4. ✅ Create upload.php script
5. ✅ Configure web server (Apache/Nginx)
6. ✅ Update BlueHand Canvas admin settings
7. ✅ Test database connection
8. ✅ Test file uploads
9. ✅ Configure DNS
10. ✅ Set up backups

**Your site will be accessible at**: `https://bluehand.ro` (GitHub Pages)  
**Images will be served from**: `https://your-server.com/uploads/`  
**Database hosted at**: Your dedicated server MySQL
