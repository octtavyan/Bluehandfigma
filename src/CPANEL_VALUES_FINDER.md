# 🔍 cPanel Values Finder - Where to Get Each Setting

## 🎯 Your Screenshot Analysis

Based on your screenshot, here's what's **CORRECT** and what needs **FIXING**:

```
✅ CORRECT:
- Database Name: wiseguy_bluehand
- Username: wiseguy_bluehand
- Port: 3306

❌ NEEDS FIXING:
- Host: localhost → Should be your server address
```

---

## 📍 Where to Find Each Value in cPanel

### 1. HOST (Server Address)

**Location in cPanel:**
```
Dashboard (Home) → Right Sidebar → "General Information" section

Look for one of these:
• "Server Name" 
• "Shared IP Address"
• "Dedicated IP" (if you have one)
```

**Screenshot Guide:**
```
╔═══════════════════════════════════╗
║  General Information              ║
╠═══════════════════════════════════╣
║  Server Name:                     ║
║  server123.hostgator.com  ← USE   ║
║                                   ║
║  Shared IP Address:               ║
║  123.45.67.89  ← OR USE THIS      ║
╚═══════════════════════════════════╝
```

**What to use in BlueHand Canvas:**
```
Option 1: server123.hostgator.com (preferred)
Option 2: 123.45.67.89
Option 3: your-domain.com (if MySQL allows)
```

**❌ DO NOT USE:**
```
localhost ← Only works if app is on same server
127.0.0.1 ← Same as localhost
```

---

### 2. PORT

**Always:**
```
3306 ← Standard MySQL port (never changes)
```

**No need to find this - it's always 3306!**

---

### 3. DATABASE NAME

**Location in cPanel:**
```
cPanel → Databases section → "MySQL Databases"

Scroll down to "Current Databases"
```

**Screenshot Guide:**
```
╔═══════════════════════════════════════════════╗
║  Current Databases                            ║
╠═══════════════════════════════════════════════╣
║  Database                      Actions        ║
║  ───────────────────────────────────────────  ║
║  wiseguy_bluehand  ← USE THIS   Check DB      ║
║  (256 KB - 11 tables)                         ║
╚═══════════════════════════════════════════════╝
```

**Format:**
```
cpanel_username + underscore + database_name
wiseguy         +     _      + bluehand
= wiseguy_bluehand ← USE THE FULL NAME
```

**What to use in BlueHand Canvas:**
```
wiseguy_bluehand ← Exactly as shown in cPanel
```

**❌ DO NOT USE:**
```
bluehand ← Missing the prefix
WISEGUY_BLUEHAND ← Wrong case (MySQL is case-sensitive on some systems)
```

---

### 4. USERNAME

**Location in cPanel:**
```
cPanel → Databases section → "MySQL Databases"

Scroll down to "Current Users"
```

**Screenshot Guide:**
```
╔═══════════════════════════════════════════════╗
║  Current Users                                ║
╠═══════════════════════════════════════════════╣
║  User                          Actions        ║
║  ───────────────────────────────────────────  ║
║  wiseguy_bluehand  ← USE THIS   Change Pass   ║
╚═══════════════════════════════════════════════╝
```

**What to use in BlueHand Canvas:**
```
wiseguy_bluehand ← Same as database name (usually)
```

**How to verify it's correct:**
```
Scroll down to "Add User To Database" section
You should see:
  User: wiseguy_bluehand ← This is your username
```

---

### 5. PASSWORD

**This is the password YOU created!**

**When you created it:**
```
cPanel → MySQL Databases → "Add New User" section

You entered:
  Username: bluehand
  Password: [your chosen password] ← THIS IS WHAT YOU NEED
  Password (Again): [same password]
  [Create User]
```

**If you forgot it:**
```
1. Go to cPanel → MySQL Databases
2. Scroll to "Current Users"
3. Find "wiseguy_bluehand"
4. Click "Change Password"
5. Create a NEW password
6. Use this new password in BlueHand Canvas
```

**What to use in BlueHand Canvas:**
```
The MySQL user password (not your cPanel login password!)
```

**❌ DO NOT USE:**
```
Your cPanel password ← Different password
Your email password ← Different password
Your FTP password ← Different password
```

---

### 6. SSL CHECKBOX

**Should you check it?**
```
✅ Check it if your host supports MySQL over SSL
   (Most modern hosts do)

❌ Uncheck it if you get connection errors with it checked
```

**How to know if your host supports it:**
```
Method 1: Try it! Check the box and test connection
Method 2: Contact support: "Does MySQL support SSL connections?"
Method 3: Check hosting docs
```

---

### 7. REMOTE MYSQL ACCESS

**This is REQUIRED for remote connections!**

**Location in cPanel:**
```
cPanel → Databases section → "Remote MySQL®"
```

**Screenshot Guide:**
```
╔═══════════════════════════════════════════════╗
║  Remote MySQL®                                ║
╠═══════════════════════════════════════════════╣
║  Add Access Host                              ║
║  ┌─────────────────────────────────────────┐  ║
║  │ %                                       │  ║
║  └─────────────────────────────────────────┘  ║
║  [Add Host]                                   ║
║                                               ║
║  Access Hosts:                                ║
║  • % (All hosts) [Delete]                     ║
╚═══════════════════════════════════════════════╝
```

**What to add:**
```
For testing: % (allows all IPs)
⚠️ This is less secure but easier for testing
```

**If Remote MySQL is missing:**
```
Your host might have disabled it.

Contact support:
"Hi, I need to enable Remote MySQL access to connect 
from an external application. Can you please enable 
this feature or provide alternative access method?"
```

---

## 🌐 STORAGE CONFIGURATION VALUES

### 1. URL BAZĂ SERVER

**This is your website URL!**

```
✅ https://your-domain.com
✅ https://bluehand.ro
✅ https://www.bluehand.ro

❌ http://your-domain.com (no HTTPS)
❌ your-domain.com (missing protocol)
❌ https://your-domain.com/ (no trailing slash)
```

**How to find it:**
```
Just your domain name with https://
```

---

### 2. ENDPOINT UPLOAD

**Always:**
```
/upload.php ← The file you created in File Manager
```

**Don't change this unless you named the file differently**

---

### 3. API KEY

**Location:**
```
cPanel → File Manager → public_html → upload.php → Edit

Look for line ~23:
define('UPLOAD_API_KEY', 'your-secure-api-key-change-this-now-12345');
                          └──────────────────┬────────────────────────┘
                                      USE THIS VALUE
```

**Example:**
```
If upload.php line 23 says:
define('UPLOAD_API_KEY', 'bhc_2026_xK9mP2vN8qL5wR3tY7uI0oP4');

Then in BlueHand Canvas, enter:
bhc_2026_xK9mP2vN8qL5wR3tY7uI0oP4
```

**⚠️ IMPORTANT:**
```
1. Change the default value in upload.php
2. Make it long and random (30+ characters)
3. Use letters, numbers, underscores
4. Save the same value in both places
```

---

## 📊 Complete Example with Real Values

### Example Hosting: HostGator

```
╔════════════════════════════════════════════════════════╗
║  CONFIGURARE SERVER MYSQL                              ║
╠════════════════════════════════════════════════════════╣
║  Host:     gator1234.hostgator.com                     ║
║            (from cPanel → General Information)         ║
║                                                        ║
║  Port:     3306                                        ║
║            (always this)                               ║
║                                                        ║
║  Nume Bază de Date: wiseguy_bluehand                   ║
║            (from cPanel → MySQL Databases → Current)   ║
║                                                        ║
║  Username: wiseguy_bluehand                            ║
║            (from cPanel → MySQL Databases → Users)     ║
║                                                        ║
║  Password: mY$ecu3P@ssw0rd2026!                        ║
║            (the password YOU created)                  ║
║                                                        ║
║  ✅ Folosește SSL pentru conexiune                     ║
╚════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════╗
║  CONFIGURARE STOCARE PE SERVER                         ║
╠════════════════════════════════════════════════════════╣
║  URL Bază Server: https://bluehand.ro                  ║
║                   (your domain)                        ║
║                                                        ║
║  Endpoint Upload: /upload.php                          ║
║                   (always this)                        ║
║                                                        ║
║  API Key: bhc_2026_xK9mP2vN8qL5wR3tY7uI0oP4            ║
║           (from upload.php line 23)                    ║
╚════════════════════════════════════════════════════════╝
```

---

## 🧪 Testing Each Value

### Test 1: Can you log into cPanel?
```
✅ Yes → Good, continue
❌ No → Contact your hosting provider
```

### Test 2: Does the database exist?
```
cPanel → MySQL Databases → Current Databases
✅ See wiseguy_bluehand with 11 tables → Good
❌ Don't see it → Import bluehand_canvas_database.sql first
```

### Test 3: Does the user have permissions?
```
cPanel → MySQL Databases → Privileged Users
✅ See wiseguy_bluehand with database wiseguy_bluehand → Good
❌ Don't see it → Add user to database
```

### Test 4: Is Remote MySQL enabled?
```
cPanel → Remote MySQL®
✅ See "Access Hosts" section → Good
❌ Don't see this option → Contact hosting provider
```

### Test 5: Does upload.php exist?
```
cPanel → File Manager → public_html
✅ See upload.php file → Good
❌ Don't see it → Create it (see CPANEL_SETUP_GUIDE.md)
```

### Test 6: Do upload folders exist?
```
cPanel → File Manager → public_html → uploads
✅ See 4 folders (paintings, orders, sliders, blog) → Good
❌ Don't see them → Create them
```

---

## 🎯 Quick Copy-Paste Template

**Fill this out and save it somewhere safe:**

```
=== BlueHand Canvas cPanel Configuration ===

DATE: _______________

SERVER MYSQL:
Host: ________________________________
Port: 3306
Database: wiseguy_bluehand
Username: wiseguy_bluehand
Password: ________________________________
SSL: [X] Yes  [ ] No

SERVER STORAGE:
URL: https://________________________________
Endpoint: /upload.php
API Key: ________________________________

NOTES:
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## 🆘 Still Can't Find Values?

### Option 1: Check your welcome email
```
When you signed up for hosting, you got an email with:
- cPanel URL
- Server name
- IP address
Search your email for "welcome" or "account created"
```

### Option 2: Contact support template
```
Subject: Need MySQL connection details

Hi,

I need to connect to my MySQL database from an external 
application. Can you please provide:

1. MySQL hostname for remote connections
2. MySQL port (default 3306?)
3. Is remote MySQL access enabled?
4. My database name: wiseguy_bluehand
5. Server IP address

Thank you!
```

### Option 3: Check hosting control panel
```
Most hosts show this info on the main cPanel dashboard
Look for "Server Information" or "Account Information"
```

---

## ✅ Final Verification Before Testing

Before clicking "Testează Conexiunea", verify:

- [ ] Host is NOT "localhost"
- [ ] Host is your server name or IP
- [ ] Port is 3306
- [ ] Database name is FULL name (includes prefix)
- [ ] Username is correct (check in cPanel)
- [ ] Password is MySQL user password (NOT cPanel password)
- [ ] Remote MySQL is enabled in cPanel
- [ ] Database has been imported (11 tables exist)

**Then click "Testează Conexiunea"** and you should see success! ✅

---

**Good luck!** 🚀
