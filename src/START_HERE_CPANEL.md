# 🚀 START HERE - BlueHand Canvas cPanel Migration

## 👋 Welcome!

You're migrating BlueHand Canvas from Supabase Storage to your **cPanel hosting** to eliminate expensive egress costs (~$100-170/month savings!).

---

## 📚 Which Guide Should You Read?

### 🎯 **Start with this one** → `QUICK_SETUP_CPANEL.md`
**Read this FIRST if:**
- ✅ You just need to fill in the admin settings
- ✅ You want to know what values to enter
- ✅ You're looking at the screenshot and don't know what to change
- ⏱️ **Time needed: 5 minutes**

### 🔍 **Can't find values?** → `CPANEL_VALUES_FINDER.md`
**Read this if:**
- ✅ You don't know what to enter for "Host"
- ✅ You can't remember your MySQL password
- ✅ You need to find info in your cPanel
- ⏱️ **Time needed: 10 minutes**

### 🛠️ **Full setup needed** → `CPANEL_SETUP_GUIDE.md`
**Read this if:**
- ✅ You haven't created the database yet
- ✅ You haven't created upload.php yet
- ✅ This is your first time setting up everything
- ⏱️ **Time needed: 30 minutes**

### 📋 **Want a checklist?** → `MIGRATION_CHECKLIST.md`
**Read this if:**
- ✅ You want to track your progress
- ✅ You're doing the complete migration
- ✅ You want to make sure you don't miss anything
- ⏱️ **Time needed: 1-2 hours total**

### 📖 **Want detailed docs?** → `SERVER_CONFIGURATION_GUIDE.md`
**Read this if:**
- ✅ You want to understand everything in depth
- ✅ You're comfortable with technical details
- ✅ You want backup/security information
- ⏱️ **Time needed: 2-3 hours total**

---

## ⚡ Super Quick Start (Already Have Everything Set Up?)

If you've already:
- ✅ Created database in cPanel
- ✅ Imported the SQL file
- ✅ Created upload.php
- ✅ Created upload folders

**Then just do this:**

### 1. Find Your Server Hostname
```
cPanel → Right sidebar → "Server Name"
Example: server123.hostgator.com
```

### 2. Fill in BlueHand Canvas Admin
```
Go to: Settings → Configurare DB & Stocare

Database Provider: Server Dedicat
Host: [your server name from step 1]  ← NOT localhost!
Port: 3306
Database: wiseguy_bluehand
Username: wiseguy_bluehand
Password: [your MySQL password]
☑ SSL: Checked

Storage Mode: Server Filesystem
URL: https://your-domain.com
Endpoint: /upload.php
API Key: [from upload.php line 23]
```

### 3. Test It
```
Click: "Testează Conexiunea"
Should see: ✅ "Conexiune MySQL reușită!"
```

### 4. Done! 🎉
```
Click: "Salvează Setările"
Your site now uses your cPanel server!
```

---

## 🎯 The Main Problem (From Your Screenshot)

Your screenshot shows:
```
Host: localhost  ← ❌ THIS IS THE PROBLEM!
```

**Why this doesn't work:**
- Your app runs on Supabase/GitHub
- Your MySQL runs on your cPanel server
- `localhost` means "this computer"
- Supabase ≠ your cPanel server
- So the connection fails!

**The fix:**
```
Host: server123.hostgator.com  ← ✅ USE YOUR SERVER NAME
```

That's it! Just change `localhost` to your actual server hostname.

---

## 📊 Files You Received

### 📥 Database File
- **`bluehand_canvas_database.sql`**
  - Import this in cPanel → phpMyAdmin
  - Creates 11 tables with sample data
  - Includes default admin user

### 📄 PHP Upload Script
- **Copy from:** `CPANEL_SETUP_GUIDE.md` (Part 3, Step 2)
  - Create as: `/public_html/upload.php`
  - Handles image uploads
  - Change the API key on line 23!

### 📖 Documentation
1. **`QUICK_SETUP_CPANEL.md`** - Fast guide (5 min)
2. **`CPANEL_VALUES_FINDER.md`** - Find all values (10 min)
3. **`CPANEL_SETUP_GUIDE.md`** - Complete setup (30 min)
4. **`MIGRATION_CHECKLIST.md`** - Track progress (1-2 hrs)
5. **`SERVER_CONFIGURATION_GUIDE.md`** - Deep dive (2-3 hrs)
6. **`README_MIGRATION.md`** - Overview & FAQ

### 🧪 Testing Tool
- **`test-upload.html`**
  - Open in browser to test uploads
  - Visual interface
  - Shows success/error messages

---

## 🏗️ What You're Building

### Current Architecture (Expensive!)
```
User → GitHub Pages → Supabase Database
                    → Supabase Storage  💸 HIGH EGRESS COSTS!
```

### New Architecture (Cost Effective!)
```
User → GitHub Pages → Supabase Functions → Your cPanel MySQL
                                         → Your cPanel Files  💰 ZERO EGRESS!
```

**Result:** Same functionality, **90%+ cost reduction!**

---

## ✅ Pre-Flight Checklist

Before you start, make sure you have:

### Access
- [ ] cPanel login credentials
- [ ] Can access cPanel at https://your-domain.com/cpanel
- [ ] Can log into BlueHand Canvas admin panel

### Files Downloaded
- [ ] Downloaded `bluehand_canvas_database.sql`
- [ ] Have the upload.php code ready to copy

### Information Ready
- [ ] Know your domain name
- [ ] Know your MySQL password (or can reset it)
- [ ] Have 30-60 minutes available

---

## 🎬 Step-by-Step (Absolute Beginner)

### Phase 1: Setup cPanel (15 minutes)

1. **Log into cPanel**
   - Go to https://your-domain.com/cpanel
   - Enter your cPanel credentials

2. **Create Database**
   - Click "MySQL Databases"
   - Create database: `bluehand`
   - Create user: `bluehand`
   - Add user to database with ALL PRIVILEGES

3. **Import Data**
   - Click "phpMyAdmin"
   - Select database `wiseguy_bluehand`
   - Click "Import" tab
   - Choose file `bluehand_canvas_database.sql`
   - Click "Go"
   - Wait for success message

4. **Enable Remote Access**
   - Click "Remote MySQL"
   - Add host: `%`
   - Click "Add Host"

5. **Create Upload Folders**
   - Click "File Manager"
   - Navigate to `public_html`
   - Create folder: `uploads`
   - Inside uploads, create: `paintings`, `orders`, `sliders`, `blog`

6. **Create Upload Script**
   - In File Manager, create file: `upload.php` in `public_html`
   - Copy code from CPANEL_SETUP_GUIDE.md Part 3
   - Change API key on line 23 to something random
   - Save file

✅ **cPanel setup complete!**

### Phase 2: Configure BlueHand Canvas (5 minutes)

1. **Open Admin Settings**
   - Log into BlueHand Canvas admin
   - Go to Settings
   - Click "Configurare DB & Stocare" tab

2. **Fill in Database Settings**
   - Provider: **Server Dedicat**
   - Host: **[Find in cPanel → General Info → Server Name]**
   - Port: **3306**
   - Database: **wiseguy_bluehand**
   - Username: **wiseguy_bluehand**
   - Password: **[Your MySQL password]**
   - Check SSL: **✅**

3. **Fill in Storage Settings**
   - Mode: **Server Filesystem**
   - URL: **https://your-domain.com**
   - Endpoint: **/upload.php**
   - API Key: **[From upload.php line 23]**

4. **Test Connection**
   - Click "Testează Conexiunea"
   - Should see: ✅ Success message

5. **Save Settings**
   - Click "Salvează Setările"
   - Refresh page to verify

✅ **Configuration complete!**

### Phase 3: Test Everything (5 minutes)

1. **Test Database**
   - Connection test should be green ✅

2. **Test Upload**
   - Go to Paintings → Add New
   - Try uploading an image
   - Should work without errors

3. **Test Image Access**
   - Open the uploaded image URL
   - Should display in browser

✅ **Everything working!**

---

## 🆘 Common Issues & Quick Fixes

### Issue: "Connection refused"
```
Problem: Remote MySQL not enabled
Fix: cPanel → Remote MySQL → Add host: %
```

### Issue: "Access denied"
```
Problem: Wrong password or username
Fix: Check cPanel → MySQL Databases → Current Users
      Or reset password
```

### Issue: "Unknown database"
```
Problem: Database name is wrong
Fix: Use FULL name: wiseguy_bluehand (not just bluehand)
```

### Issue: "Can't connect to MySQL server"
```
Problem: Using localhost instead of server hostname
Fix: Change to your server name (e.g., server123.hostgator.com)
```

### Issue: "Upload fails"
```
Problem: upload.php has wrong permissions or doesn't exist
Fix: Check cPanel → File Manager → public_html → upload.php
      Permissions should be 644
```

### Issue: "Images don't load"
```
Problem: Wrong URL or folder permissions
Fix: Check URL format: https://your-domain.com/uploads/paintings/...
      Check folder permissions: 755
```

---

## 💡 Pro Tips

1. **Save your settings!** Write down your MySQL password and API key
2. **Test in stages** - Don't fill everything at once, test as you go
3. **Check cPanel logs** - If something fails, check error logs
4. **Backup first** - Before making changes, backup your current Supabase data
5. **Ask for help** - Your hosting provider support can help with cPanel issues

---

## 📞 Getting Help

### From Your Hosting Provider
```
They can help with:
- Finding server hostname
- Enabling remote MySQL
- File permissions
- Upload limits
- SSL configuration
```

### From cPanel Documentation
```
https://docs.cpanel.net/
- MySQL database management
- File Manager usage
- phpMyAdmin guide
```

### Common Support Questions
```
1. "What is my MySQL hostname for remote connections?"
2. "Can you enable remote MySQL access?"
3. "How do I increase PHP upload limits?"
4. "What are the correct folder permissions?"
```

---

## 🎯 Success Metrics

After migration, you should see:

**Cost Savings:**
- ✅ Supabase egress: < 100MB/month (was: 5GB+)
- ✅ Monthly cost: $10-30 (was: $50-200)
- ✅ Savings: ~$100-170/month

**Performance:**
- ✅ Page load: < 3 seconds
- ✅ Image load: < 500ms
- ✅ Database queries: < 100ms

**Functionality:**
- ✅ All features working
- ✅ Admin panel functional
- ✅ Images loading
- ✅ Orders processing

---

## 🎉 You're Ready!

**Recommended path:**

1. Read **QUICK_SETUP_CPANEL.md** (5 min)
2. Use **CPANEL_VALUES_FINDER.md** to find your values (10 min)
3. Follow **Phase 1, 2, 3** above (25 min)
4. Test everything (5 min)
5. **Total time: ~45 minutes**

**Good luck with your migration!** 🚀

---

## 📋 Quick Reference Card

**Print this and keep it handy:**

```
┌──────────────────────────────────────────────┐
│ BlueHand Canvas - cPanel Configuration      │
├──────────────────────────────────────────────┤
│ DATABASE:                                    │
│ Host: ___________________________________    │
│ Port: 3306                                   │
│ Database: wiseguy_bluehand                   │
│ Username: wiseguy_bluehand                   │
│ Password: ________________________________   │
│                                              │
│ STORAGE:                                     │
│ URL: https://__________________________.com  │
│ Endpoint: /upload.php                        │
│ API Key: _________________________________   │
│                                              │
│ IMPORTANT URLS:                              │
│ cPanel: https://______________.com/cpanel    │
│ phpMyAdmin: (in cPanel → phpMyAdmin)         │
│ File Manager: (in cPanel → File Manager)     │
│                                              │
│ SUPPORT:                                     │
│ Hosting: _________________________________   │
│ Phone: ___________________________________   │
│ Email: ___________________________________   │
└──────────────────────────────────────────────┘
```

**NOW GO TO:** `QUICK_SETUP_CPANEL.md` to get started! →
