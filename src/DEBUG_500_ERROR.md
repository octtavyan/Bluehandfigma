# 🚨 DEBUG 500 INTERNAL SERVER ERROR

## 🎯 Current Status

**Good News:** The 401 errors are gone!  
**New Problem:** Now getting 500 Internal Server Error

This means the PHP backend is crashing. We need to see the actual error message.

---

## 🔥 STEP 1: Upload Updated Files

### Files to Upload:

1. **config.php** (Updated - Shows errors)
   - Location: `/server-deploy/api/config.php`
   - Upload to: `89.41.38.220:/bluehand.ro/api/config.php`
   - What's new: `display_errors = 1` (temporarily shows errors)

2. **test-debug.php** (NEW - Debug tool)
   - Location: `/server-deploy/api/test-debug.php`
   - Upload to: `89.41.38.220:/bluehand.ro/api/test-debug.php`
   - What it does: Shows detailed error information

---

## 🔍 STEP 2: Run Debug Tests

### Test 1: View Debug Page
```
1. Open browser
2. Go to: https://bluehand.ro/api/test-debug.php
3. Take screenshot of ENTIRE page
4. Share the screenshot
```

**The debug page will show:**
- ✅ PHP version
- ✅ Database connection status
- ✅ Authorization headers
- ✅ File paths
- ✅ Recent error log entries
- ✅ Test queries

### Test 2: View Error Log Directly (SSH)
```bash
# SSH into server
ssh YOUR_USERNAME@89.41.38.220

# View last 50 lines of error log
tail -50 /path/to/bluehand.ro/api/error.log

# OR view in real-time:
tail -f /path/to/bluehand.ro/api/error.log
```

Then try to create a painting and watch the errors appear!

### Test 3: Check Apache Error Log
```bash
# Common locations:
tail -50 /var/log/apache2/error.log
# OR
tail -50 /var/log/httpd/error_log
# OR
tail -50 /usr/local/apache/logs/error_log
```

---

## 🔎 COMMON 500 ERROR CAUSES

### 1. Database Connection Failed
**Symptoms:** Can't connect to MySQL  
**Fix:** Check credentials in `config.php`

### 2. Syntax Error in PHP
**Symptoms:** Parse error in logs  
**Fix:** Check error log for line number

### 3. Missing Function
**Symptoms:** "Call to undefined function"  
**Fix:** Check PHP extensions

### 4. .htaccess Configuration Error
**Symptoms:** 500 immediately after adding .htaccess  
**Fix:** Comment out problematic lines

### 5. File Permission Error
**Symptoms:** Can't write to uploads/  
**Fix:** `chmod 755 /uploads/`

### 6. Memory Limit Exceeded
**Symptoms:** "Allowed memory size exhausted"  
**Fix:** Increase memory_limit in php.ini

---

## 📋 WHAT TO SHARE

Please share ONE of these:

### Option A: Debug Page Screenshot
```
1. Go to: https://bluehand.ro/api/test-debug.php
2. Take full-page screenshot
3. Share screenshot
```

### Option B: Error Log Contents
```bash
# Via SSH:
tail -100 /path/to/bluehand.ro/api/error.log

# Copy and paste the output
```

### Option C: Network Tab Response
```
1. Open DevTools (F12)
2. Go to Network tab
3. Try to create a painting
4. Click the failed request (500 error)
5. Go to Response tab
6. Screenshot the response
```

---

## 🔧 TEMPORARY FIX - Disable .htaccess

If the 500 error started IMMEDIATELY after adding .htaccess:

```bash
# SSH into server
ssh YOUR_USERNAME@89.41.38.220

# Rename .htaccess temporarily
cd /path/to/bluehand.ro/api/
mv .htaccess .htaccess.disabled

# Test if 500 goes away
# If yes, .htaccess is the problem
# If no, it's something else
```

---

## 🎯 LIKELY CAUSES (Based on Your Setup)

### Most Likely: .htaccess Issues
The .htaccess file might have directives your server doesn't support.

**Test:**
1. Rename .htaccess to .htaccess.disabled
2. Refresh admin panel
3. If it works (back to 401), the .htaccess has syntax errors
4. If still 500, it's a different issue

### Second Most Likely: Header() Already Sent
The error might be "Headers already sent" if there's output before headers.

**Check:**
- No spaces or text before `<?php` tags
- No `echo` statements before `header()` calls
- No UTF-8 BOM in files

### Third Most Likely: Database Error
The paintings table might have an issue.

**Test:**
```sql
-- Via phpMyAdmin or SSH:
SELECT * FROM paintings LIMIT 1;
SELECT * FROM orders LIMIT 1;
SHOW TABLES;
```

---

## 🚀 NEXT STEPS

1. **Upload the 2 updated files** (config.php + test-debug.php)
2. **Access debug page:** https://bluehand.ro/api/test-debug.php
3. **Share the output** (screenshot or text)
4. **I'll analyze the error** and provide exact fix

---

## 💡 QUICK TROUBLESHOOTING

### If Debug Page Shows Database Error:
Problem is database connection or credentials.

### If Debug Page Shows Headers Error:
Problem is CORS or header configuration.

### If Debug Page Shows Parse Error:
Problem is PHP syntax in one of the files.

### If Debug Page Loads Fine:
Problem is only with specific endpoints (paintings, orders).

---

**CRITICAL:** Upload `test-debug.php` and access it immediately!  
URL: `https://bluehand.ro/api/test-debug.php`

This will show us EXACTLY what's wrong! 🔍
