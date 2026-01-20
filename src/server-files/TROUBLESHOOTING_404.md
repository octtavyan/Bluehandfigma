# 🔧 Troubleshooting 404 Error - Files Exist But Not Accessible

## Problem
Files exist in `/api/` folder but accessing `https://bluehand.ro/api/paintings` returns 404.

---

## Step 1: Upload test.php

1. **Upload the `test.php` file to your `/api/` folder** (next to index.php)

2. **Access it directly in browser:**
   ```
   https://bluehand.ro/api/test.php
   ```

3. **What you'll see:**
   - ✅ **JSON with "PHP is working!"** → PHP works, routing issue
   - ❌ **404 or blank page** → Wrong web root
   - ❌ **Download prompt** → PHP not configured

---

## Step 2: Check the test.php output

If test.php works, look at these values:

### A. `document_root`
This shows where your web server thinks files are.

**Example outputs:**
- `/var/www/html` → Files should be in `/var/www/html/api/`
- `/home/bluehand/public_html` → Files should be in `/home/bluehand/public_html/api/`

**Your files might be in the WRONG location!**

### B. `mod_rewrite`
- ✅ `ENABLED` → Good
- ❌ `DISABLED` → Need to enable it

### C. `htaccess_exists`
- ✅ `YES` → .htaccess file is there
- ❌ `NO` → File is missing or named wrong

---

## Step 3: Most Common Fixes

### Fix 1: Wrong Web Root (Most Common!)

Your files are in `/` but web root might be `/public_html`

**Solution:** Move api folder to the correct location shown in `document_root`

```bash
# If document_root shows /var/www/html
mv /api /var/www/html/api

# If document_root shows /public_html
mv /api /public_html/api
```

### Fix 2: Enable mod_rewrite

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### Fix 3: Allow .htaccess Overrides

Edit your Apache config:

```bash
sudo nano /etc/apache2/sites-available/bluehand.ro.conf
```

Add this inside `<VirtualHost>`:

```apache
<Directory /var/www/html>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

Save and restart:

```bash
sudo systemctl restart apache2
```

### Fix 4: Check .htaccess filename

Make sure it's named **exactly** `.htaccess` (with the dot!)

Not: `htaccess.txt` or `htaccess` or `.htaccess.txt`

```bash
# Rename if needed
cd /api
mv htaccess.txt .htaccess
```

### Fix 5: Check index.php for errors

```bash
# Test for PHP syntax errors
php -l /path/to/api/index.php
```

---

## Step 4: Direct Access Test

Try accessing index.php DIRECTLY (bypassing .htaccess):

```
https://bluehand.ro/api/index.php/paintings
```

**Results:**
- ✅ **Works** → .htaccess or mod_rewrite issue
- ❌ **Still 404** → Wrong web root or PHP not configured

---

## Step 5: Check Apache Error Logs

```bash
# View error log
tail -f /var/log/apache2/error.log

# Then try accessing the API in browser
# Errors will show in real-time
```

Common errors:
- `File does not exist` → Wrong web root
- `RewriteEngine not allowed` → AllowOverride issue
- `Syntax error` → PHP file has errors

---

## Quick Checklist

- [ ] Uploaded test.php to /api/ folder
- [ ] Accessed https://bluehand.ro/api/test.php in browser
- [ ] Checked what `document_root` shows
- [ ] Files are in the CORRECT web root
- [ ] .htaccess file exists (with dot!)
- [ ] mod_rewrite is enabled
- [ ] AllowOverride All is set in Apache config
- [ ] Restarted Apache after changes
- [ ] Checked error logs

---

## Still Not Working?

**Share the output of:**

1. **test.php output** (the JSON you see)
2. **Apache error log** last 20 lines:
   ```bash
   tail -20 /var/log/apache2/error.log
   ```
3. **File location:**
   ```bash
   pwd  # while in api folder
   ls -la  # list all files
   ```

This will tell us exactly what's wrong!
