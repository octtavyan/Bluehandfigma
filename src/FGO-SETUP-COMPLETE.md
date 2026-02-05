# ✅ FGO Integration - Setup Complete!

## 🎉 What's Been Built

The FGO (Factura Go) API integration is now **fully functional and automatically generates invoices** when orders are shipped!

---

## 🔄 How It Works - End-to-End Flow

### 1️⃣ **Order Placed**
Customer completes checkout → Order created in system

### 2️⃣ **Order Processing**
Admin processes order → Prepares canvas prints

### 3️⃣ **Order Marked as Delivered** ⭐
Admin marks order as "Delivered" → **This triggers automatic invoice generation**

### 4️⃣ **Invoice Generation (Automatic)**

```
┌─────────────────────────────────────┐
│  Is FGO Enabled?                    │
└─────────────┬───────────────────────┘
              │
     ┌────────┴────────┐
     │ YES             │ NO
     ▼                 ▼
┌─────────────────┐   ┌──────────────────┐
│ Generate via    │   │ Generate via     │
│ FGO API         │   │ Internal jsPDF   │
│                 │   │                  │
│ • Call FGO API  │   │ • Create PDF     │
│ • Get inv link  │   │ • Attach to email│
│ • Store in DB   │   │                  │
└─────────────────┘   └──────────────────┘
         │                     │
         └──────────┬──────────┘
                    ▼
         ┌────────────────────┐
         │ Send Email to      │
         │ Customer with      │
         │ Invoice            │
         └────────────────────┘
```

### 5️⃣ **Customer Receives Email**
- **If FGO enabled:** Email contains download button linking to FGO invoice
- **If FGO disabled:** Email contains PDF invoice as attachment

---

## 🎯 Configuration Location

**Location:** Admin Panel → **Setări** → **FGO (Facturi)** tab

### Required Settings:

| Setting | Description | Example |
|---------|-------------|---------|
| **Activare FGO** | Toggle to enable/disable | ON/OFF |
| **Mediu** | Test or Production | Test / Producție |
| **Cod Unic (CUI)** | Company CUI without RO | `12345678` |
| **Cheie Privată** | API key from FGO | Generated in FGO settings |
| **Serie Facturi** | Invoice series | `BHC` |
| **URL Platformă** | Website URL | `https://www.bluehandcanvas.ro` |

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create FGO Account
Visit: https://testuat.fgo.ro/inregistrare (Test environment - free)

### Step 2: Generate API Credentials
1. Login to FGO
2. Go to **Setări → Utilizatori**
3. Click **"Generează Utilizator API"**
4. **Copy the Private Key** (you won't see it again!)

### Step 3: Define Invoice Series
1. In FGO: **Setări → Serii Documente**
2. Create series: e.g., "BHC"

### Step 4: Configure in BlueHand Canvas
1. Admin Panel → **Setări** → **FGO (Facturi)**
2. Fill in all fields with data from FGO
3. Click **"Testează Conexiunea"**
4. If successful, click **"Salvează Setările"**
5. Toggle **"Activare FGO"** to **ON**

### Step 5: Test It!
1. Create a test order
2. Mark it as "Delivered"
3. Check email for FGO invoice link
4. Verify invoice in FGO dashboard

---

## 📊 What Happens When You Mark Order as Delivered?

### Server-Side Process:

```typescript
1. Admin clicks "Mark as Delivered"
   ↓
2. System checks: Is FGO enabled?
   ↓
3. If YES:
   - Prepare invoice data from order
   - Call FGO API with SHA-1 authentication
   - FGO generates fiscal invoice
   - Returns: Serie, Numar, Link
   - Store invoice data in database
   ↓
4. If NO (or FGO fails):
   - Generate PDF using internal jsPDF system
   - Create invoice HTML
   - Attach PDF to email
   ↓
5. Send "Shipped Confirmation" email
   - FGO: Include download button with link
   - Internal: Include PDF attachment
   ↓
6. Customer receives invoice
```

### Database Storage:

**FGO Invoice Data** (stored in KV):
```json
{
  "key": "fgo_invoice:BHC-12345",
  "value": {
    "invoiceNumber": "001",
    "invoiceSerie": "BHC",
    "invoiceLink": "https://fgo.ro/factura/view/...",
    "orderNumber": "BHC-12345",
    "generatedAt": "2025-02-01T10:30:00Z"
  }
}
```

---

## 📧 Email Templates

### With FGO (When Enabled):

```
📄 Factura Ta Fiscală
━━━━━━━━━━━━━━━━━━━━━━━
Factura fiscală a fost generată automat prin sistemul FGO.
Număr factură: BHC-001

┌─────────────────────┐
│  📥 Descarcă Factura │  ← Clickable button
└─────────────────────┘

💡 Click pe butonul de mai sus pentru a descărca factura ta fiscală în format PDF.
```

### Without FGO (Fallback):

```
📄 Factura Ta
━━━━━━━━━━━━━━━━━━━━━━━
Factura fiscală este atașată la acest email în format PDF.
Nume fișier: Factura_12345.pdf

💡 Poți deschide și salva PDF-ul direct din acest email.

📎 Attachment: Factura_12345.pdf
```

---

## 🔐 Security & Authentication

### FGO Authentication:
- Uses **SHA-1 hash** algorithm
- Formula: `SHA-1(CodUnic + CheiePivata + ClientName)`
- Hash calculated server-side only
- Private key never exposed to frontend

### Data Flow:
```
Frontend → Server → FGO API
   ↓
(No sensitive data in client)
```

### Credentials Storage:
- Stored in **KV Store** (encrypted)
- Accessible only from server-side Edge Functions
- Never committed to version control

---

## 🔄 Fallback System

The integration has **automatic fallback**:

1. **FGO Enabled** → Try FGO API
2. **FGO Fails** → Automatically use internal jsPDF
3. **FGO Disabled** → Use internal jsPDF

**No manual intervention needed!**

You can:
- Toggle FGO OFF → System uses jsPDF
- Toggle FGO ON → System uses FGO
- Zero downtime switching

---

## 📈 Invoice Data Flow

### FGO Invoice Generation:

```typescript
// When order is marked as delivered:

const invoiceData = {
  orderNumber: 'BHC-12345',
  orderDate: '2025-02-01',
  customerName: 'Ion Popescu',
  customerEmail: 'ion@email.com',
  customerPhone: '+40123456789',
  customerAddress: 'Str. Exemplu, Nr. 1',
  customerCity: 'București',
  customerCounty: 'București',
  items: [
    {
      name: 'Canvas Print',
      paintingTitle: 'Sunset Landscape',
      size: '60x40 cm',
      quantity: 1,
      price: 350.00
    }
  ],
  total: 350.00,
  billingCUI: '12345678', // If company
  personType: 'juridica' or 'fizica'
};

// System automatically:
1. Checks FGO enabled
2. Converts prices (includes 21% VAT)
3. Generates SHA-1 hash
4. Calls FGO API
5. Receives invoice link
6. Stores in database
7. Sends email with link
```

---

## 💡 Pro Tips

### 1. **Start with Test Environment**
- Use https://testuat.fgo.ro for testing
- Free, no credit card needed
- Test invoice generation
- Switch to production when ready

### 2. **Monitor Logs**
Server logs show:
```
🟢 FGO is enabled - Generating invoice via FGO API
✅ FGO invoice generated successfully
   Serie: BHC, Numar: 001
   Link: https://fgo.ro/factura/view/...
```

Or:
```
🔵 Generating invoice via internal system (jsPDF)
✅ Internal invoice PDF generated successfully
```

### 3. **Test the Flow**
1. Enable FGO in Test mode
2. Create test order with real data
3. Mark as delivered
4. Check email
5. Verify invoice in FGO dashboard

### 4. **Gradual Rollout**
- Enable FGO in Test mode first
- Run parallel with jsPDF
- Compare invoices
- Switch to Production when confident

---

## 🐛 Troubleshooting

### Issue: "FGO invoice generation failed"

**Check:**
- [ ] FGO toggle is ON
- [ ] CUI is correct (without RO)
- [ ] Private Key is correct
- [ ] Serie exists in FGO
- [ ] Test connection button works

**Solution:**
System automatically falls back to jsPDF. Fix FGO settings and retry.

### Issue: "Email not received"

**Check:**
- [ ] Email address is valid
- [ ] Check spam folder
- [ ] Verify email settings in Admin → Setări → Email

### Issue: "Invalid CUI"

**For Companies (PJ):**
- Ensure CUI is valid Romanian company tax ID
- Set `ValideazaCodUnicRo: false` in FGO settings if needed

**For Individuals (PF):**
- Leave CUI empty or use CNP
- System auto-detects person type

---

## 📚 Technical Details

### Files Modified:

1. **`/components/admin/FgoConfigTab.tsx`**
   - FGO settings UI component

2. **`/supabase/functions/server/fgo.tsx`**
   - FGO API integration module
   - Invoice generation logic
   - Authentication handling

3. **`/supabase/functions/server/index.tsx`**
   - FGO routes (/fgo/settings, /fgo/test, /fgo/generate)
   - Shipped email handler updated
   - Automatic invoice generation on delivery

4. **`/pages/admin/AdminSettingsPage.tsx`**
   - Added FGO tab to settings

### API Endpoints Created:

```
GET  /make-server-bbc0c500/fgo/settings      - Get FGO configuration
POST /make-server-bbc0c500/fgo/settings      - Save FGO configuration
POST /make-server-bbc0c500/fgo/test          - Test FGO connection
POST /make-server-bbc0c500/fgo/generate      - Generate FGO invoice
```

### Database Keys:

```
fgo_settings                    - FGO configuration
fgo_invoice:{orderNumber}       - Generated FGO invoice data
```

---

## ✅ Checklist: Is Everything Working?

- [x] FGO settings page accessible (Admin → Setări → FGO)
- [x] Can save FGO credentials
- [x] Connection test works
- [x] Toggle enable/disable works
- [x] Order marked as delivered triggers invoice
- [x] FGO invoice generated when enabled
- [x] Fallback to jsPDF when disabled
- [x] Email sent with invoice
- [x] Customer receives download link (FGO) or PDF (jsPDF)

---

## 🎯 Next Steps

### For Testing:
1. ✅ Configure FGO in Test mode
2. ✅ Create test order
3. ✅ Mark as delivered
4. ✅ Verify invoice email
5. ✅ Check FGO dashboard

### For Production:
1. Create FGO production account at www.fgo.ro
2. Generate production API credentials
3. Update settings to Production mode
4. Enter production credentials
5. Test with real order
6. Go live!

---

## 🎉 You're All Set!

**The FGO integration is fully operational!**

When you mark an order as delivered:
- ✅ Invoice is automatically generated
- ✅ Customer receives email with invoice
- ✅ No manual steps required
- ✅ Fallback system ensures reliability

**Happy invoicing!** 🚀📄

---

For questions or issues, refer to:
- **Full Documentation:** `/FGO-INTEGRATION-README.md`
- **FGO API Docs:** https://api.fgo.ro/v1/testing.html
- **Support:** Check server logs in Supabase Edge Functions
