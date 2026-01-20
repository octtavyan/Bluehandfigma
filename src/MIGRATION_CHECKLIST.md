# BlueHand Canvas - Migration to Dedicated Server Checklist

## 📋 Pre-Migration Checklist

### Server Preparation
- [ ] Dedicated server is provisioned and accessible
- [ ] Server has SSH access enabled
- [ ] Server OS is updated (`sudo apt update && sudo apt upgrade`)
- [ ] MySQL/MariaDB is installed
- [ ] phpMyAdmin is installed and accessible
- [ ] Web server (Apache/Nginx) is installed and running
- [ ] PHP is installed (version 7.4 or higher)
- [ ] SSL certificate is configured (Let's Encrypt recommended)

### Backup Current Data
- [ ] Export all data from Supabase KV store
- [ ] Download all images from Supabase Storage
- [ ] Save current configuration settings
- [ ] Document current database schema

---

## 🗄️ Database Migration Steps

### 1. Import Database
```bash
# On your local machine, upload the SQL file to server
scp bluehand_canvas_database.sql user@your-server.com:/tmp/

# SSH into server
ssh user@your-server.com

# Import database
mysql -u root -p < /tmp/bluehand_canvas_database.sql
```

**Verification:**
- [ ] Database `wiseguy_bluehand` created
- [ ] All tables created (13 tables total)
- [ ] Default admin user exists
- [ ] Sample data imported (sizes, frame types, categories)

### 2. Configure Database User
```sql
mysql -u root -p

CREATE USER 'wiseguy_bluehand'@'%' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON wiseguy_bluehand.* TO 'wiseguy_bluehand'@'%';
FLUSH PRIVILEGES;
EXIT;
```

**Verification:**
- [ ] User `wiseguy_bluehand` created
- [ ] User has full permissions on database
- [ ] Can connect remotely (test with MySQL client)

### 3. Enable Remote Access
Edit `/etc/mysql/mysql.conf.d/mysqld.cnf`:
```ini
bind-address = 0.0.0.0
```

```bash
sudo systemctl restart mysql
sudo ufw allow 3306/tcp  # Open firewall
```

**Verification:**
- [ ] MySQL listening on 0.0.0.0:3306
- [ ] Firewall allows port 3306
- [ ] Can connect from external IP

---

## 📁 File Storage Migration Steps

### 1. Create Directory Structure
```bash
sudo mkdir -p /var/www/html/uploads/{paintings,orders,sliders,blog}
sudo chown -R www-data:www-data /var/www/html/uploads
sudo chmod -R 755 /var/www/html/uploads
```

**Verification:**
- [ ] All 4 folders created
- [ ] Correct ownership (www-data or apache)
- [ ] Correct permissions (755)

### 2. Create Upload Script
```bash
sudo nano /var/www/html/upload.php
# Paste the PHP upload script from SERVER_CONFIGURATION_GUIDE.md
sudo chmod 644 /var/www/html/upload.php
```

**Verification:**
- [ ] upload.php created
- [ ] API key changed from default
- [ ] Script is executable by web server
- [ ] Test with curl command works

### 3. Configure Web Server

**For Apache:**
```bash
sudo nano /var/www/html/uploads/.htaccess
# Add CORS and caching headers
sudo systemctl reload apache2
```

**For Nginx:**
```bash
sudo nano /etc/nginx/sites-available/default
# Add uploads location block
sudo nginx -t
sudo systemctl reload nginx
```

**Verification:**
- [ ] CORS headers working
- [ ] Images accessible via browser
- [ ] Caching headers present
- [ ] Directory listing disabled

### 4. Migrate Existing Images
```bash
# Download from Supabase Storage
# Use Supabase dashboard or CLI

# Upload to server
scp -r /local/path/to/images/* user@your-server.com:/var/www/html/uploads/paintings/
```

**Verification:**
- [ ] All images copied to server
- [ ] Permissions set correctly
- [ ] Images accessible via URL
- [ ] Image URLs updated in database

---

## ⚙️ BlueHand Canvas Configuration

### 1. Update Admin Settings

Navigate to: **Admin Panel → Settings → Configurare DB & Stocare**

**Database Provider:** Custom Server MySQL
- Host: `your-server-ip.com` or `123.45.67.89`
- Port: `3306`
- Database: `wiseguy_bluehand`
- Username: `wiseguy_bluehand`
- Password: `YOUR_DATABASE_PASSWORD`
- SSL: ✅ Enabled (if supported)

**Storage Mode:** Server Filesystem
- Base URL: `https://your-server.com`
- Upload Endpoint: `/upload.php`
- API Key: `your-secure-api-key-123`

**Verification:**
- [ ] Click "Testează Conexiunea" - should succeed
- [ ] Settings saved successfully
- [ ] No errors in browser console

### 2. Update Image References

Run migration script to update all image URLs in database:
```sql
-- Update painting images
UPDATE paintings 
SET image = REPLACE(image, 'supabase.co/storage', 'your-server.com/uploads')
WHERE image LIKE '%supabase.co/storage%';

-- Update hero slides
UPDATE hero_slides 
SET image_url = REPLACE(image_url, 'supabase.co/storage', 'your-server.com/uploads')
WHERE image_url LIKE '%supabase.co/storage%';

-- Update blog posts
UPDATE blog_posts 
SET featured_image = REPLACE(featured_image, 'supabase.co/storage', 'your-server.com/uploads')
WHERE featured_image LIKE '%supabase.co/storage%';
```

**Verification:**
- [ ] All image URLs updated
- [ ] Images load correctly on frontend
- [ ] No broken image links

---

## 🌐 DNS & Deployment

### 1. Configure DNS
In your DNS provider (Cloudflare, etc.):

```
Type    Name    Value                           TTL
CNAME   @       your-username.github.io         Auto
CNAME   www     your-username.github.io         Auto
A       api     123.45.67.89 (server IP)        Auto
```

**Verification:**
- [ ] DNS propagated (check with `dig bluehand.ro`)
- [ ] Site loads from GitHub Pages
- [ ] Images load from dedicated server

### 2. Update GitHub Pages
In GitHub repository settings:
- [ ] Custom domain set to `bluehand.ro`
- [ ] HTTPS enforced
- [ ] CNAME file created in repository

### 3. Update CORS Settings
On your dedicated server, ensure CORS allows your domain:

```php
// In upload.php
header('Access-Control-Allow-Origin: https://bluehand.ro');
```

**Verification:**
- [ ] No CORS errors in browser console
- [ ] Images load from cross-origin
- [ ] Upload works from admin panel

---

## 🔒 Security Hardening

### Database Security
- [ ] Changed default admin password
- [ ] Strong MySQL password (16+ characters)
- [ ] MySQL user has minimal permissions (only wiseguy_bluehand DB)
- [ ] MySQL root login disabled remotely
- [ ] Consider restricting MySQL to specific IPs only

### File Upload Security
- [ ] Upload API key changed from default
- [ ] File type validation in place
- [ ] File size limits configured (50MB)
- [ ] Directory traversal prevention enabled
- [ ] Upload folder has no execute permissions

### Server Security
- [ ] SSH key authentication enabled
- [ ] SSH password login disabled
- [ ] Fail2ban installed and configured
- [ ] Firewall (ufw/firewalld) active
- [ ] Only necessary ports open (80, 443, 3306, 22)
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Auto-security updates enabled

### Application Security
- [ ] All API keys rotated
- [ ] Supabase service role key kept secret
- [ ] Environment variables secured
- [ ] No sensitive data in client-side code

---

## 🧪 Testing Phase

### Frontend Testing
- [ ] Homepage loads correctly
- [ ] All images display properly
- [ ] Navigation works
- [ ] Search functionality works
- [ ] Shopping cart functions
- [ ] Checkout process completes

### Admin Panel Testing
- [ ] Can log in to admin panel
- [ ] Can add new painting
- [ ] Image upload works
- [ ] Can create new order
- [ ] Can manage users
- [ ] Settings save correctly
- [ ] All tabs accessible

### Database Testing
- [ ] Read operations work
- [ ] Write operations work
- [ ] Transactions complete
- [ ] No timeout errors
- [ ] Query performance acceptable

### Payment Testing
- [ ] Netopia test payment works
- [ ] Payment confirmation received
- [ ] Order created in database
- [ ] Customer email sent

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] Images load quickly
- [ ] No Supabase egress warnings
- [ ] Database queries optimized

---

## 📊 Monitoring Setup

### Server Monitoring
- [ ] Set up server monitoring (Uptime Robot, Pingdom)
- [ ] Configure email alerts for downtime
- [ ] Monitor disk space usage
- [ ] Monitor bandwidth usage
- [ ] Monitor CPU and memory

### Database Monitoring
- [ ] Enable slow query log
- [ ] Monitor connection count
- [ ] Set up automated backups (daily)
- [ ] Test backup restoration
- [ ] Monitor database size

### Application Monitoring
- [ ] Set up error logging
- [ ] Monitor API response times
- [ ] Track user sessions
- [ ] Monitor order creation rate
- [ ] Track image upload success rate

---

## 🔄 Backup Strategy

### Daily Automated Backups
```bash
# Crontab entry
0 2 * * * /root/backup-bluehand.sh >> /var/log/bluehand-backup.log 2>&1
```

**Backup Includes:**
- [ ] Full database dump
- [ ] All uploaded files
- [ ] Configuration files
- [ ] Server logs

**Backup Verification:**
- [ ] Backups running automatically
- [ ] Backup files created successfully
- [ ] Old backups cleaned up (30+ days)
- [ ] Backup restoration tested monthly

### Off-Site Backups
- [ ] Cloud backup configured (AWS S3, Backblaze)
- [ ] Backups encrypted
- [ ] Retention policy set (90 days)

---

## ✅ Go-Live Checklist

### Final Pre-Launch
- [ ] All tests passed
- [ ] Backups configured and tested
- [ ] Monitoring active
- [ ] SSL certificate valid
- [ ] DNS propagated
- [ ] Performance optimized
- [ ] Security hardened

### Launch
- [ ] Switch DNS to point to GitHub Pages
- [ ] Monitor for errors (first 24 hours)
- [ ] Check analytics
- [ ] Verify all functionality
- [ ] Send test order

### Post-Launch (First Week)
- [ ] Monitor error logs daily
- [ ] Check backup success
- [ ] Review performance metrics
- [ ] Gather user feedback
- [ ] Fix any reported issues

---

## 📞 Emergency Contacts

**Hosting Provider:** [Provider name and support contact]  
**DNS Provider:** [Provider name and support contact]  
**Database Admin:** [Your contact]  
**Developer:** [Your contact]

---

## 📝 Important URLs

- Admin Panel: `https://bluehand.ro/admin`
- Server phpMyAdmin: `https://your-server.com/phpmyadmin`
- Server Control Panel: `[Your server control panel URL]`
- GitHub Repository: `https://github.com/your-username/bluehand-canvas`

---

## 🚨 Rollback Plan

If migration fails:

1. **Immediate Actions:**
   - Switch DNS back to previous configuration
   - Re-enable Supabase Storage
   - Restore from backup

2. **Communication:**
   - Notify team
   - Update status page
   - Communicate with customers if needed

3. **Investigation:**
   - Review error logs
   - Identify failure point
   - Document issues
   - Plan corrective actions

---

## 📈 Success Metrics

**Egress Reduction:**
- Target: 90%+ reduction in Supabase egress
- Monitor: Supabase dashboard

**Performance:**
- Target: Page load < 3 seconds
- Monitor: Google PageSpeed Insights

**Uptime:**
- Target: 99.9% uptime
- Monitor: Uptime monitoring service

**Cost Savings:**
- Previous: [Supabase costs]
- Current: [New infrastructure costs]
- Savings: [Difference]

---

**Migration Date:** _______________  
**Completed By:** _______________  
**Status:** ☐ In Progress ☐ Completed ☐ Rolled Back
