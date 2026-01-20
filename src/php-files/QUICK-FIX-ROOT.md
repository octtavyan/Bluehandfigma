# 🚀 QUICK FIX - Root .htaccess Update

## 📍 **Location**
**File:** `/public_html/.htaccess` (in ROOT, NOT in /api/ folder!)

---

## ✅ **What to Do**

### **Step 1: Open File**
1. Login to cPanel
2. File Manager → `/public_html/`
3. Find `.htaccess` (enable "Show Hidden Files")
4. Right-click → Edit

### **Step 2: Copy Content**
Copy the content from `/server-deploy/.htaccess` and paste it into `/public_html/.htaccess`

### **Step 3: Save**
Save the file and close editor

### **Step 4: Test**
Visit: `https://bluehand.ro/api/paintings`  
**Expected:** JSON with paintings data

---

## 🎯 **Key Changes**

The root `.htaccess` now includes:

```apache
# Route /api/paintings/* to paintings.php
RewriteRule ^api/paintings(.*)$ /api/paintings.php [L,QSA]

# Route /api/orders/* to orders.php
RewriteRule ^api/orders(.*)$ /api/orders.php [L,QSA]

# Route /api/unsplash/* to unsplash.php
RewriteRule ^api/unsplash(.*)$ /api/unsplash.php [L,QSA]

# ... etc
```

---

## ❌ **What NOT to Do**

**DO NOT:**
- ❌ Create `.htaccess` inside `/public_html/api/`
- ❌ Create multiple `.htaccess` files
- ❌ Forget to save after editing

**DO:**
- ✅ Edit the ROOT `.htaccess` at `/public_html/.htaccess`
- ✅ Include all API routing rules
- ✅ Test after saving

---

## 🧪 **Test URLs**

After updating, these should work:

- `https://bluehand.ro/api/paintings` → JSON
- `https://bluehand.ro/api/orders` → JSON
- `https://bluehand.ro/api/unsplash/settings` → JSON
- `https://bluehand.ro/api/auth/test` → JSON

---

## ✨ **Result**

✅ All API calls work  
✅ No "Failed to fetch" errors  
✅ Admin dashboard loads  
✅ Paintings and orders display  

---

**File location:** `/server-deploy/.htaccess` → Upload to `/public_html/.htaccess`
