# ⚡ Quick Setup for cPanel - 5 Minutes

## 🎯 What You Need to Fill In (Based on Your Screenshot)

Your screenshot shows you're trying to connect to `localhost` - **this won't work** because:
- ❌ `localhost` = same server as the application
- ✅ Your app runs on Supabase/GitHub, MySQL runs on your cPanel server
- ✅ You need to use your **server's hostname or IP**

---

## 📝 Step-by-Step Fill In Guide

### 1️⃣ Provider Bază de Date
```
Select: ● Server Dedicat (custom server MySQL)
```

### 2️⃣ Configurare Server MySQL

#### Where to find each value:

**HOST:**
```
❌ WRONG: localhost
✅ CORRECT: 
   - your-domain.com
   - OR server123.yourhostingprovider.com
   - OR 123.45.67.89 (server IP)

👉 Find in cPanel:
   - Right sidebar → "General Information" → "Shared IP Address"
   - Or ask your hosting provider: "What is my MySQL remote hostname?"
```

**PORT:**
```
✅ 3306 (always this for MySQL)
```

**NUME BAZĂ DE DATE:**
```
Your screenshot shows: wiseguy_bluehand ✅ CORRECT

👉 This is from cPanel → MySQL Databases → "Current Databases"
   - Usually: cpanel_username_database_name
   - Example: wiseguy_bluehand
```

**USERNAME:**
```
Your screenshot shows: wiseguy_bluehand ✅ CORRECT

👉 Same as database name usually
   - Check in cPanel → MySQL Databases → "Privileged Users"
```

**PASSWORD:**
```
👉 The password YOU created in cPanel when you made the MySQL user
   - Not your cPanel password
   - Not your website password
   - The MySQL database user password
```

**FOLOSEȘTE SSL:**
```
✅ Check this box (recommended if your host supports it)
```

---

### 3️⃣ Mod Stocare Fișiere
```
Select: ● Server Filesystem
```

### 4️⃣ Configurare Stocare pe Server

**URL BAZĂ SERVER:**
```
✅ https://your-domain.com
   - Use YOUR actual domain name
   - Example: https://bluehand.ro
```

**ENDPOINT UPLOAD:**
```
✅ /upload.php
   - This is the file you created in cPanel File Manager
```

**API KEY:**
```
✅ The key you set in upload.php line 23
   - Example: bhc_2026_xK9mP2vN8qL5wR3tY7uI0oP4
   - This should be random and secure
```

---

## 🔍 Real Example (Filled In)

Here's what it looks like with real values:

```
╔════════════════════════════════════════════════════════╗
║  CONFIGURARE SERVER MYSQL                              ║
╠════════════════════════════════════════════════════════╣
║  Host:     server123.hostgator.com                     ║
║  Port:     3306                                        ║
║  Nume Bază de Date: wiseguy_bluehand                   ║
║  Username: wiseguy_bluehand                            ║
║  Password: ••••••••••••••••                            ║
║  ✅ Folosește SSL pentru conexiune                     ║
╚════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════╗
║  CONFIGURARE STOCARE PE SERVER                         ║
╠════════════════════════════════════════════════════════╣
║  URL Bază Server: https://bluehand.ro                  ║
║  Endpoint Upload: /upload.php                          ║
║  API Key: bhc_2026_xK9mP2vN8qL5wR3tY7uI0oP4            ║
╚════════════════════════════════════════════════════════╝
```

---

## 🎯 How to Find Your Server Hostname

### Method 1: cPanel Dashboard
```
1. Log into cPanel
2. Look at the right sidebar
3. Under "General Information"
4. Find "Server Name" or "Shared IP Address"

Example:
  Server Name: server123.hostgator.com
  OR
  Shared IP: 192.168.1.100
```

### Method 2: Ask Your Hosting Provider
```
Send this message to support:

"Hi, I need to connect to my MySQL database remotely 
from an external application. What hostname or IP 
should I use for remote MySQL connections?"

They will respond with something like:
- server123.yourhostingprovider.com
- mysql.yourdomainORip .com
- 123.45.67.89
```

### Method 3: Check Welcome Email
```
When you signed up for hosting, you received a welcome email with:
- cPanel URL
- Server hostname
- IP address
Use any of these
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Mistake #1: Using localhost
```
❌ Host: localhost
✅ Host: server123.hostgator.com
```
**Why it fails:** `localhost` means "this computer" - but your app is on Supabase/GitHub, not on your cPanel server!

### ❌ Mistake #2: Wrong database name
```
❌ Database: bluehand
✅ Database: wiseguy_bluehand
```
**Why it fails:** cPanel adds your username as prefix. Always use the FULL name from cPanel.

### ❌ Mistake #3: Using cPanel password
```
❌ Password: [your cPanel login password]
✅ Password: [the MySQL user password you created]
```
**Why it fails:** MySQL user password is separate from cPanel password.

### ❌ Mistake #4: Remote MySQL not enabled
```
If you get "Connection refused" error:
1. Go to cPanel → Remote MySQL
2. Add access host: %
3. Or contact support to enable remote access
```

---

## 📊 Visual Flow

```
┌─────────────────────────────────────────────────────┐
│  BlueHand Canvas Admin Panel                        │
│  (Runs on: GitHub Pages / Supabase Edge Functions)  │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Tries to connect to...
                   │
      ❌ localhost ← WRONG! (no MySQL here)
                   │
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Your cPanel Server                                 │
│  Hostname: server123.hostgator.com                  │
│  IP: 123.45.67.89                                   │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  MySQL Database                               │ │
│  │  Name: wiseguy_bluehand                       │ │
│  │  User: wiseguy_bluehand                       │ │
│  │  Password: [your MySQL password]              │ │
│  │  Port: 3306                                   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  File Storage                                 │ │
│  │  /public_html/uploads/                        │ │
│  │  - paintings/                                 │ │
│  │  - orders/                                    │ │
│  │  - sliders/                                   │ │
│  │  - blog/                                      │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
          ▲
          │ Accessible at:
          │ https://your-domain.com/uploads/paintings/image.jpg
```

---

## 🧪 Quick Test Checklist

After filling in the form, test each part:

### ✅ Test 1: Database Connection
```
1. Fill in all MySQL fields
2. Click "Testează Conexiunea"
3. Should see green checkmark: ✅ "Conexiune MySQL reușită!"
```

### ✅ Test 2: Save Settings
```
1. Click "Salvează Setările"
2. Should see success message
3. Refresh page - settings should still be there
```

### ✅ Test 3: Upload Test
```
1. Go to Paintings → Add New
2. Try uploading an image
3. Should upload without errors
4. Image URL should be: https://your-domain.com/uploads/paintings/...
```

---

## 🆘 Getting Help from Your Host

If you're stuck, send this message to your hosting support:

```
Subject: Need help setting up remote MySQL access

Hi,

I'm setting up a web application that needs to connect 
to my MySQL database remotely. 

My database name is: wiseguy_bluehand
My database user is: wiseguy_bluehand

Questions:
1. What hostname should I use for remote MySQL connections?
2. Is remote MySQL access enabled for my account?
3. If not, can you please enable it?
4. Do I need to whitelist any IP addresses?

The application is hosted on Supabase Edge Functions and 
needs to connect to my cPanel MySQL database.

Thank you!
```

---

## 📋 Summary Checklist

Before clicking "Testează Conexiunea":

- [ ] Changed `localhost` to actual server hostname/IP
- [ ] Port is `3306`
- [ ] Database name is FULL name (e.g., `wiseguy_bluehand`)
- [ ] Username is correct
- [ ] Password is MySQL user password (not cPanel password)
- [ ] Remote MySQL is enabled in cPanel
- [ ] Imported `bluehand_canvas_database.sql` in phpMyAdmin
- [ ] Created `upload.php` in public_html
- [ ] Created uploads folders (paintings, orders, sliders, blog)
- [ ] Changed API key in upload.php
- [ ] Filled in correct domain in "URL Bază Server"

---

## 🎉 When Everything Works

You'll see:
- ✅ Green checkmark on connection test
- ✅ Settings save successfully
- ✅ Can upload images in admin panel
- ✅ Images display on frontend
- ✅ No Supabase egress charges!

**Cost savings: ~$100-170/month** by eliminating Supabase egress fees! 💰

---

**Need more help?** Check the full guide: `CPANEL_SETUP_GUIDE.md`
