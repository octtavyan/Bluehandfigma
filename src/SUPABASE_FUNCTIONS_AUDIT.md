# 🔍 SUPABASE FUNCTIONS AUDIT - WHAT DO THEY DO?

## 📊 **All 25+ Supabase Function Calls - Categorized**

---

## 🚨 **CRITICAL - Customer Facing (MUST CONVERT)**

### 1. **CheckoutPage.tsx**
```typescript
// Line 290: Netopia payment processing
fetch(`/netopia/start-payment`)

// Line 332: Order confirmation email to customer
fetch(`/send-order-confirmation`)
```
**Used for:** Processing card payments + sending confirmation emails  
**Status:** ⚠️ **ESSENTIAL - Must work or customers can't checkout!**

---

### 2. **PaymentSuccessPage.tsx**
```typescript
// Payment confirmation page
fetch(`/orders/${orderId}`)
```
**Used for:** Showing order details after payment  
**Status:** ⚠️ **ESSENTIAL - Must work or customers see errors after paying**

---

### 3. **Legal Pages (Terms, GDPR, Privacy)**
```typescript
// AdminLegalPagesPage.tsx - Lines 24, 35, 46
fetch(`/kv/legal_pages_terms`)
fetch(`/kv/legal_pages_gdpr`)
fetch(`/kv/legal_pages_privacy`)

// TermsPage.tsx, GDPRPage.tsx - Load content
fetch(`/kv/legal_pages_terms`)
```
**Used for:** Loading legal page content  
**Status:** ⚠️ **IMPORTANT - Required for legal compliance**

---

### 4. **Cart Persistence**
```typescript
// CartContext.tsx - Line 48
const SERVER_URL = `https://${projectId}.supabase.co/...`
// Lines 67, 86, 115, 139, 177, 214, 249
fetch(`/cart/save`)
fetch(`/cart/load`)
fetch(`/cart/update`)
fetch(`/cart/clear`)
```
**Used for:** Saving cart across sessions/devices  
**Status:** ⚠️ **IMPORTANT - Or cart items disappear on refresh**

---

## 🛠️ **ADMIN TOOLS - Important But Not Customer-Facing**

### 5. **Email Settings & Testing**
```typescript
// EmailConfigTab.tsx
fetch(`/email/settings`)      // Get/save email config
fetch(`/email/test`)          // Test email sending

// ResendTestPanel.tsx
fetch(`/test-resend`)         // Test Resend API
fetch(`/send-test-email`)     // Send test email

// AdminUsersContent.tsx
fetch(`/send-verification-email`) // User verification
```
**Used for:** Admin email configuration and testing  
**Status:** 🔧 **ADMIN TOOL - Convert or keep for testing**

---

### 6. **FAN Courier Settings & Testing**
```typescript
// FanCourierTab.tsx
fetch(`/fancourier/settings`)  // Get/save settings
fetch(`/fancourier/test`)      // Test FAN Courier API
```
**Used for:** Admin FAN Courier configuration  
**Status:** 🔧 **ADMIN TOOL - Convert if you use FAN Courier**

---

### 7. **Netopia Payment Settings**
```typescript
// AdminSettingsPage.tsx
fetch(`/netopia/settings`)     // Get/save Netopia config
fetch(`/netopia/test`)         // Test Netopia API
```
**Used for:** Admin payment gateway configuration  
**Status:** 🔧 **ADMIN TOOL - Convert for admin panel**

---

### 8. **Database Management**
```typescript
// DatabaseManagementTab.tsx
fetch(`/database/test`)        // Test DB connection
fetch(`/database/stats`)       // Get DB statistics
```
**Used for:** Admin database monitoring  
**Status:** 🔧 **ADMIN TOOL - Optional, could delete**

---

### 9. **User Management Emails**
```typescript
// AdminUsersPage.tsx
fetch(`/send-password-verification`)
```
**Used for:** Sending password reset emails to admin users  
**Status:** 🔧 **ADMIN TOOL - Convert if you have admin users**

---

## 📸 **CONTENT - Homepage & Images**

### 10. **Unsplash Integration**
```typescript
// HomePage.tsx
fetch(`/settings/unsplash`)    // Get curated keywords

// TablouriCanvasPage.tsx
// (Similar - loads Unsplash settings)

// AdminUnsplashPage.tsx
fetch(`/unsplash/stats`)       // Admin stats
```
**Used for:** Loading hero images and canvas gallery images  
**Status:** 🎨 **CONTENT - Convert if you use Unsplash for images**

---

### 11. **Painting Metadata**
```typescript
// paintingMetadataService.ts
fetch(`/api/painting-metadata/${id}`)
```
**Used for:** Loading painting descriptions, artist info, etc.  
**Status:** 🎨 **CONTENT - Convert if you have metadata**

---

## 📋 **COMPLETE LIST BY FILE**

| File | Endpoint(s) | Priority | Action |
|------|------------|----------|--------|
| **CheckoutPage.tsx** | `/netopia/start-payment`<br>`/send-order-confirmation` | 🚨 CRITICAL | **MUST CONVERT** |
| **PaymentSuccessPage.tsx** | `/orders/{id}` | 🚨 CRITICAL | **MUST CONVERT** |
| **AdminLegalPagesPage.tsx** | `/kv/legal_pages_*` | ⚠️ IMPORTANT | **MUST CONVERT** |
| **TermsPage.tsx** | `/kv/legal_pages_terms` | ⚠️ IMPORTANT | **MUST CONVERT** |
| **GDPRPage.tsx** | `/kv/legal_pages_gdpr` | ⚠️ IMPORTANT | **MUST CONVERT** |
| **CartContext.tsx** | `/cart/*` | ⚠️ IMPORTANT | **MUST CONVERT** |
| **EmailConfigTab.tsx** | `/email/settings`, `/email/test` | 🔧 ADMIN | Convert or Delete |
| **ResendTestPanel.tsx** | `/test-resend`, `/send-test-email` | 🔧 ADMIN | Convert or Delete |
| **FanCourierTab.tsx** | `/fancourier/*` | 🔧 ADMIN | Convert if used |
| **AdminSettingsPage.tsx** | `/netopia/*` | 🔧 ADMIN | Convert if used |
| **AdminUsersContent.tsx** | `/send-verification-email` | 🔧 ADMIN | Convert if used |
| **AdminUsersPage.tsx** | `/send-password-verification` | 🔧 ADMIN | Convert if used |
| **DatabaseManagementTab.tsx** | `/database/*` | 🔧 ADMIN | Could DELETE |
| **HomePage.tsx** | `/settings/unsplash` | 🎨 CONTENT | Convert if used |
| **TablouriCanvasPage.tsx** | `/settings/unsplash` | 🎨 CONTENT | Convert if used |
| **AdminUnsplashPage.tsx** | `/unsplash/stats` | 🎨 CONTENT | Could DELETE |
| **paintingMetadataService.ts** | `/api/painting-metadata/*` | 🎨 CONTENT | Convert if used |

---

## 🎯 **RECOMMENDED ACTIONS**

### ✅ **Phase 1: MUST CONVERT (Customer-Facing)**
These will break the customer experience if not converted:

1. **CheckoutPage** - Payment processing + order emails
2. **PaymentSuccessPage** - Order confirmation display
3. **Legal Pages** - Terms, GDPR, Privacy content
4. **CartContext** - Cart persistence

**Estimate:** 4-6 hours of work

---

### 🔧 **Phase 2: ADMIN TOOLS (Optional)**
These are admin-only features:

**Option A - CONVERT:**
- Email settings (if you want admin email testing)
- Payment settings (if you want admin Netopia testing)
- FAN Courier settings (if you use FAN Courier)
- User management emails

**Option B - DELETE:**
- Database management tab (not essential)
- Unsplash admin stats (not essential)
- Test panels (can test manually)

**Estimate:** 2-4 hours if converting

---

### 🎨 **Phase 3: CONTENT (Optional)**
- Unsplash integration (if you use dynamic images)
- Painting metadata (if you have artist info, descriptions)

**Estimate:** 1-2 hours

---

## 💡 **MY RECOMMENDATION**

### **NOW (Critical):**
1. ✅ Convert checkout + payment (customers must be able to buy!)
2. ✅ Convert legal pages (legal requirement)
3. ✅ Convert cart persistence (better UX)

### **LATER (Nice to have):**
4. 🔧 Keep admin tools but convert gradually
5. 🗑️ Delete test panels and stats (not essential)

### **OPTIONAL:**
6. 🎨 Convert Unsplash if you use it for dynamic images
7. 🎨 Convert metadata if you have painting info

---

## 🚀 **NEXT STEPS**

**Tell me which approach you prefer:**

**Option 1: Minimal (2-3 hours)**
- Convert only critical customer-facing features (checkout, legal, cart)
- Delete all admin tools and test panels
- Result: Customers can buy, site is legal, basic functionality works

**Option 2: Full Admin (6-8 hours)**
- Convert everything
- Full admin panel functionality
- Result: Complete feature parity with current system

**Option 3: Hybrid (4-5 hours)**
- Convert critical customer features
- Keep essential admin tools (email, payments, FAN Courier)
- Delete non-essential (stats, test panels)
- Result: Good balance of functionality vs effort

---

**Which option do you want? Or should I show you the specific conversions needed?**
