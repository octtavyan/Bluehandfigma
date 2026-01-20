# ⚡ QUICK FIX - 3 Steps Only

## ❌ **Error**
```
Failed to fetch
```

## ✅ **Fix in 3 Steps**

### **1. Enable mod_headers**

cPanel → **Software** → **Select PHP Version** → **Apache Modules** → Check ☑️ `mod_headers` → Save

---

### **2. Update .htaccess**

**File:** `/public_html/.htaccess`

**Add this at the TOP:**

```apache
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</IfModule>
```

---

### **3. Test**

```bash
curl -I https://bluehand.ro/api/paintings | grep access-control
```

**Expected:** `access-control-allow-origin: *`

---

## ✅ **Done!**

Clear browser cache (Ctrl+Shift+Delete) and reload.

---

**For detailed guide:** See `COMPLETE-FIX-GUIDE.md`
