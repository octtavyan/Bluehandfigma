# 🚀 BlueHand Canvas - Server Migration Complete

## 📦 Files Created

### 1. **Database Export** 
   - **File:** `/bluehand_canvas_database.sql`
   - **Purpose:** Complete MySQL database schema with sample data
   - **Usage:** Import into phpMyAdmin on your dedicated server

### 2. **Configuration Guide**
   - **File:** `/SERVER_CONFIGURATION_GUIDE.md`
   - **Purpose:** Step-by-step setup instructions
   - **Includes:** MySQL setup, file storage, DNS config, security

### 3. **Migration Checklist**
   - **File:** `/MIGRATION_CHECKLIST.md`
   - **Purpose:** Complete checklist for migration process
   - **Includes:** Pre-migration, testing, go-live steps

---

## 🎯 Quick Start (5 Minutes)

### Your Current Setup (from screenshot):
```
Host: localhost → Change to: your-server-ip.com
Port: 3306 ✅ (correct)
Database: wiseguy_bluehand ✅ (correct)
Username: wiseguy_bluehand ✅ (correct)
Password: ••••••••••••• (your password)
SSL: ✅ Folosește SSL pentru conexiune
```

### What You Need:

1. **Your Dedicated Server Details:**
   - IP Address or Domain: `_________________`
   - SSH Access: `ssh user@your-server`
   - Control Panel: `_________________`

2. **MySQL Configuration:**
   - ✅ Import `bluehand_canvas_database.sql` via phpMyAdmin
   - ✅ Create user `wiseguy_bluehand` with password
   - ✅ Enable remote access (bind-address = 0.0.0.0)
   - ✅ Open port 3306 in firewall

3. **File Storage Setup:**
   - ✅ Create folders: `/var/www/html/uploads/{paintings,orders,sliders,blog}`
   - ✅ Create `upload.php` script (see configuration guide)
   - ✅ Configure web server for CORS

4. **BlueHand Canvas Admin Settings:**
   - Navigate to: **Settings → Configurare DB & Stocare**
   - Select: **Server Dedicat** + **Server Filesystem**
   - Fill in your server details
   - Click: **Testează Conexiunea**

---

## 🏗️ Architecture

### Before (Supabase Only):
```
Frontend → Supabase Database
         → Supabase Storage (HIGH EGRESS! 💸)
```

### After (Hybrid with Dedicated Server):
```
Frontend (GitHub Pages) → Supabase Edge Functions → Your MySQL Server
                        → Your Server Filesystem (NO EGRESS! 💰)
```

### Future (Full Migration):
```
Frontend (GitHub Pages) → Your Dedicated Server
                           ├─ MySQL Database
                           ├─ File Storage
                           └─ API Endpoints
```

---

## 💰 Cost Savings

| Component | Before (Supabase) | After (Dedicated) | Savings |
|-----------|-------------------|-------------------|---------|
| **Database** | $0 (Free tier) | $0 (Own server) | $0 |
| **Storage** | 1GB free | Unlimited | ∞ |
| **Egress** | 5GB/month → **$10/GB over** | Unlimited | **$100s/month** |
| **Total Monthly** | ~$50-200 (if over limits) | ~$10-30 (server only) | **$40-170/month** |

---

## 📊 Database Schema

Your `wiseguy_bluehand` database includes:

### Core Tables:
1. **kv_store** - Key-value storage (compatibility with current system)
2. **paintings** - Canvas artworks catalog
3. **orders** - Customer orders with tracking
4. **clients** - Customer information
5. **users** - Admin users for CMS
6. **blog_posts** - Blog articles
7. **hero_slides** - Homepage slider
8. **categories** - Product categories
9. **sizes** - Product sizes with pricing
10. **frame_types** - Frame options with pricing
11. **settings** - Application settings

### Pre-loaded Data:
- ✅ Default admin user (username: `admin`, password: `admin123` - **CHANGE THIS!**)
- ✅ 10 standard sizes (30x20 to 150x100)
- ✅ 8 frame types (Canvas and Hartie)
- ✅ 6 sample categories
- ✅ Default configuration settings

---

## 🔧 Server Requirements

### Minimum Specifications:
- **OS:** Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **RAM:** 2GB minimum, 4GB recommended
- **Storage:** 20GB minimum, 100GB+ for images
- **CPU:** 2 cores minimum
- **Bandwidth:** Unlimited or high limit (for images)

### Required Software:
- ✅ MySQL 5.7+ or MariaDB 10.3+
- ✅ PHP 7.4+ (with extensions: mysqli, gd, curl, json)
- ✅ Apache 2.4+ or Nginx 1.18+
- ✅ phpMyAdmin (for database management)
- ✅ SSL Certificate (Let's Encrypt free)

---

## 🔒 Security Checklist

### Critical Security Steps:
1. ✅ **Change default admin password** in database
2. ✅ **Use strong MySQL password** (16+ characters)
3. ✅ **Change upload API key** in upload.php
4. ✅ **Enable SSL/HTTPS** on server
5. ✅ **Configure firewall** (only open necessary ports)
6. ✅ **Disable root SSH login**
7. ✅ **Set proper file permissions** (755 for dirs, 644 for files)
8. ✅ **Enable automated backups**

---

## 📁 Directory Structure on Server

```
/var/www/html/
├── uploads/                    # Public image directory
│   ├── paintings/             # Tablouri canvas images
│   ├── orders/                # Custom order images
│   ├── sliders/               # Hero slide images
│   └── blog/                  # Blog post images
├── upload.php                 # Upload API endpoint
└── .htaccess                  # Apache configuration (if using Apache)

/root/
└── backup-bluehand.sh         # Automated backup script
```

---

## 🧪 Testing Your Migration

### 1. Test Database Connection
```bash
# From your local machine
mysql -h your-server-ip.com -u wiseguy_bluehand -p wiseguy_bluehand

# Should connect successfully
mysql> SHOW TABLES;
# Should show 11 tables
```

### 2. Test File Upload
```bash
# Test upload endpoint
curl -X POST https://your-server.com/upload.php \
  -H "Authorization: Bearer your-api-key" \
  -F "file=@test.jpg" \
  -F "folder=paintings"

# Expected response:
{
  "success": true,
  "url": "https://your-server.com/uploads/paintings/1234567890_abc.jpg",
  "filename": "1234567890_abc.jpg",
  "folder": "paintings"
}
```

### 3. Test Image Access
```bash
# Image should be accessible
curl -I https://your-server.com/uploads/paintings/1234567890_abc.jpg
# Should return 200 OK with image content-type
```

### 4. Test from Admin Panel
1. Log in to BlueHand Canvas admin
2. Go to Settings → Configurare DB & Stocare
3. Click "Testează Conexiunea"
4. Should see: ✅ "Conexiune MySQL reușită!"

---

## 🚨 Common Issues & Solutions

### Issue: "Connection refused" when connecting to MySQL
**Solution:**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Check bind-address
sudo grep bind-address /etc/mysql/mysql.conf.d/mysqld.cnf
# Should be: bind-address = 0.0.0.0

# Restart MySQL
sudo systemctl restart mysql

# Check firewall
sudo ufw status
sudo ufw allow 3306/tcp
```

### Issue: "Access denied" for user
**Solution:**
```sql
# Grant permissions again
GRANT ALL PRIVILEGES ON wiseguy_bluehand.* TO 'wiseguy_bluehand'@'%';
FLUSH PRIVILEGES;
```

### Issue: "CORS error" when uploading images
**Solution:**
```php
// Add to upload.php at the top
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### Issue: Upload folder permissions error
**Solution:**
```bash
sudo chown -R www-data:www-data /var/www/html/uploads
sudo chmod -R 755 /var/www/html/uploads
```

---

## 📞 Support & Documentation

### Documentation Files:
1. **SERVER_CONFIGURATION_GUIDE.md** - Complete setup guide
2. **MIGRATION_CHECKLIST.md** - Step-by-step checklist
3. **bluehand_canvas_database.sql** - Database import file

### Key Endpoints:
- Admin Panel: `https://bluehand.ro/admin`
- Settings: `https://bluehand.ro/admin/settings?tab=dbconfig`
- Upload Test: `curl https://your-server.com/upload.php`

### Logs to Check:
- MySQL: `/var/log/mysql/error.log`
- Apache: `/var/log/apache2/error.log`
- Nginx: `/var/log/nginx/error.log`
- PHP: `/var/log/php/error.log`

---

## ✅ Final Steps After Migration

1. **Update DNS** to point to GitHub Pages
2. **Test all functionality** on production domain
3. **Monitor for 24 hours** for any errors
4. **Verify backups** are running
5. **Check Supabase egress** - should drop to near zero
6. **Update documentation** with your server details
7. **Train team** on new backup/restore procedures

---

## 🎉 Success Indicators

After successful migration, you should see:

✅ **Supabase Egress**: < 100MB/month (was: 5GB+/month)  
✅ **Page Load Time**: < 3 seconds  
✅ **Image Load Time**: < 500ms  
✅ **Database Response**: < 100ms  
✅ **Uptime**: 99.9%+  
✅ **Cost**: $10-30/month (was: $50-200/month)  

---

## 📧 Questions?

If you encounter any issues during migration:

1. Check the **MIGRATION_CHECKLIST.md** for troubleshooting
2. Review **SERVER_CONFIGURATION_GUIDE.md** for detailed instructions
3. Check server logs for specific error messages
4. Verify all security settings are correctly configured

**Good luck with your migration! 🚀**
