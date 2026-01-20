# ✅ PHP CONVERSION STATUS - BlueHand Canvas

## 🎯 **COMPLETED CONVERSIONS (4/15 files)**

### **✅ Priority 1: Critical Customer Features (4 files DONE)**

| File | Old Endpoint | New PHP Endpoint | Status |
|------|-------------|------------------|--------|
| **CheckoutPage.tsx** | `${projectId}.supabase.co/.../netopia/start-payment` | `bluehand.ro/api/index.php?action=netopia_start_payment` | ✅ **DONE** |
| **CheckoutPage.tsx** | `${projectId}.supabase.co/.../send-order-confirmation` | `bluehand.ro/api/index.php?action=send_order_confirmation` | ✅ **DONE** |
| **PaymentSuccessPage.tsx** | `${projectId}.supabase.co/.../netopia/status/${orderId}` | `bluehand.ro/api/index.php?action=netopia_status&orderId=...` | ✅ **DONE** |
| **CartContext.tsx** | `${SERVER_URL}/cart/load/${sessionId}` | `bluehand.ro/api/index.php?action=cart_load&sessionId=...` | ✅ **DONE** |
| **CartContext.tsx** | `${SERVER_URL}/cart/save` | `bluehand.ro/api/index.php?action=cart_save` | ✅ **DONE** |
| **CartContext.tsx** | `${SERVER_URL}/cart/clear/${sessionId}` | `bluehand.ro/api/index.php?action=cart_clear&sessionId=...` | ✅ **DONE** |

**Also Removed:**
- ❌ Removed `import { projectId, publicAnonKey } from '../utils/supabase/info'` from CheckoutPage.tsx
- ❌ Removed `import { projectId, publicAnonKey } from '../utils/supabase/info'` from PaymentSuccessPage.tsx  
- ❌ Removed `import { projectId, publicAnonKey } from '../utils/supabase/info'` from CartContext.tsx

---

## ⏳ **REMAINING CONVERSIONS (11/15 files)**

### **Priority 2: Legal Pages (3 files TODO)**

| File | Supabase Endpoint | PHP Endpoint Needed | Notes |
|------|------------------|---------------------|-------|
| **AdminLegalPagesPage.tsx** | `/kv/legal_pages_terms`<br>`/kv/legal_pages_gdpr`<br>`/kv/legal_pages_privacy` | `?action=legal_get&type=terms`<br>`?action=legal_save&type=terms` | Admin can edit legal pages |
| **TermsPage.tsx** | `/kv/legal_pages_terms` | `?action=legal_get&type=terms` | Display terms page |
| **GDPRPage.tsx** | `/kv/legal_pages_gdpr` | `?action=legal_get&type=gdpr` | Display GDPR page |

---

### **Priority 3: Admin Tools (5 files TODO)**

| File | Supabase Endpoint | PHP Endpoint Needed | Notes |
|------|------------------|---------------------|-------|
| **AdminSettingsPage.tsx** | `/netopia/settings` (GET/POST)<br>`/netopia/test` | `?action=netopia_settings_get`<br>`?action=netopia_settings_save`<br>`?action=netopia_test` | Netopia payment config |
| **EmailConfigTab.tsx** | `/email/settings`<br>`/email/test` | `?action=email_settings_get`<br>`?action=email_settings_save`<br>`?action=email_test` | Resend email config |
| **FanCourierTab.tsx** | `/fancourier/settings`<br>`/fancourier/test` | `?action=fancourier_settings_get`<br>`?action=fancourier_settings_save`<br>`?action=fancourier_test` | FAN Courier AWB config |
| **AdminUsersContent.tsx** | `/send-verification-email` | `?action=send_verification_email` | User verification emails |
| **AdminUsersPage.tsx** | `/send-password-verification` | `?action=send_password_reset` | Password reset emails |

---

### **Priority 4: Content/Optional (3 files TODO)**

| File | Supabase Endpoint | PHP Endpoint Needed | Notes |
|------|------------------|---------------------|-------|
| **HomePage.tsx** | `/settings/unsplash` | `?action=unsplash_settings_get` | Optional - for dynamic hero images |
| **TablouriCanvasPage.tsx** | `/settings/unsplash` | `?action=unsplash_settings_get` | Optional - for gallery images |
| **AdminUnsplashPage.tsx** | `/unsplash/stats` | `?action=unsplash_stats` | Optional - admin stats |
| **paintingMetadataService.ts** | `/api/painting-metadata/{id}` | `?action=painting_metadata&id=...` | Optional - painting descriptions |

---

## 📋 **WHAT YOU NEED TO DO**

### **Option 1: I Convert Everything (Recommended)**
Tell me: **"Continue converting"**

I'll convert all 11 remaining files to PHP in the next turn (~15 minutes).

---

### **Option 2: You Build PHP Endpoints First**

If you want to build the PHP backend first, here are ALL the endpoints you need to create in `/api/index.php`:

#### **Critical (Already Converted - Build These FIRST):**
```php
// CheckoutPage & PaymentSuccessPage
case 'netopia_start_payment':  // POST - Start Netopia payment
case 'netopia_status':          // GET - Check payment status
case 'send_order_confirmation': // POST - Send order email

// CartContext
case 'cart_load':               // GET - Load cart from session
case 'cart_save':               // POST - Save cart to session
case 'cart_clear':              // DELETE - Clear cart
```

#### **Legal Pages (TODO):**
```php
case 'legal_get':               // GET - Get legal page content (?type=terms|gdpr|privacy)
case 'legal_save':              // POST - Save legal page content (admin only)
```

#### **Admin Tools (TODO):**
```php
// Netopia
case 'netopia_settings_get':    // GET - Get Netopia settings
case 'netopia_settings_save':   // POST - Save Netopia settings
case 'netopia_test':            // POST - Test Netopia connection

// Email (Resend)
case 'email_settings_get':      // GET - Get email settings
case 'email_settings_save':     // POST - Save email settings
case 'email_test':              // POST - Test email sending

// FAN Courier
case 'fancourier_settings_get': // GET - Get FAN Courier settings
case 'fancourier_settings_save':// POST - Save FAN Courier settings
case 'fancourier_test':         // POST - Test FAN Courier API

// User Management
case 'send_verification_email': // POST - Send verification email
case 'send_password_reset':     // POST - Send password reset email
```

#### **Optional/Content (TODO):**
```php
case 'unsplash_settings_get':   // GET - Get Unsplash keywords
case 'unsplash_stats':          // GET - Get Unsplash usage stats
case 'painting_metadata':       // GET - Get painting metadata by ID
```

---

## 🗄️ **DATABASE REQUIREMENTS**

You'll need these tables in MySQL:

### **Settings Table (Key-Value Store)**
```sql
CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Keys you'll need:
-- 'netopia_settings' (JSON)
-- 'email_settings' (JSON)
-- 'fancourier_settings' (JSON)
-- 'legal_pages_terms' (TEXT/HTML)
-- 'legal_pages_gdpr' (TEXT/HTML)
-- 'legal_pages_privacy' (TEXT/HTML)
-- 'unsplash_keywords' (JSON)
```

### **Cart Sessions Table**
```sql
CREATE TABLE cart_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  cart_data TEXT,  -- JSON encoded cart
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🚀 **NEXT STEPS**

### **Tell me what you want:**

**A)** "Continue converting" - I'll convert all 11 remaining files now  
**B)** "Build PHP first" - Build endpoints, then I'll test  
**C)** "Minimal" - Only convert legal pages (3 files), skip admin tools  

---

## 📊 **CURRENT BUILD STATUS**

✅ **Build will succeed!** No import errors.  
⚠️ **Runtime needs PHP backend** for these actions:
- Netopia payments (CRITICAL)
- Order confirmation emails (CRITICAL)
- Cart persistence (IMPORTANT)
- Legal page display (IMPORTANT)
- Admin settings (when admin uses them)

---

## 💡 **RECOMMENDATION**

**Best workflow:**
1. ✅ I convert all 11 remaining files (15 mins)
2. ✅ You build PHP endpoints using the list above
3. ✅ Test critical paths: checkout → payment → email
4. ✅ Test admin tools as needed

**What do you want to do?**
