# FGO API Integration - BlueHand Canvas

## 📋 Overview

This document describes the FGO (Factura Go) API integration for automatic fiscal invoice generation in the BlueHand Canvas e-commerce platform.

**FGO** is a Romanian invoicing SaaS platform that generates fiscal invoices compliant with ANAF (Romanian tax authority) regulations, including e-Factura support.

### ✨ Automatic Invoice Generation

Once configured and enabled, FGO will **automatically generate fiscal invoices** when orders are marked as "Delivered" (Shipped). The system:
1. ✅ Checks if FGO is enabled
2. ✅ Generates invoice via FGO API
3. ✅ Stores invoice link in database
4. ✅ Emails invoice link to customer
5. ✅ Falls back to internal jsPDF system if FGO fails

---

## 🏗️ Architecture

The FGO integration follows a **modular, plug-and-play architecture** that can coexist with or replace the existing jsPDF invoice system.

### Key Components

```
/components/admin/FgoConfigTab.tsx      # FGO settings tab component (inside Admin Settings)
/supabase/functions/server/fgo.tsx      # FGO API service module
/supabase/functions/server/index.tsx    # Server routes for FGO endpoints
```

### Data Flow

```
Order Placed → Check FGO Enabled → Generate Invoice via FGO API → Store Invoice Link → Email to Customer
                    ↓ (if disabled)
               Fallback to jsPDF invoice generation
```

---

## ⚙️ Configuration

### 1. Access FGO Settings

Navigate to: **Admin Panel → Setări → FGO Config Tab**

### 2. Required Settings

| Setting | Description | Example |
|---------|-------------|---------|
| **Activare FGO** | Enable/disable automatic invoice generation | Toggle ON/OFF |
| **Mediu** | Test or Production environment | Test / Producție |
| **Cod Unic (CUI)** | Company tax identification number | `12345678` |
| **Cheie Privată** | Private API key from FGO | Generated in FGO |
| **Serie Facturi** | Invoice series defined in FGO | `BHC` |
| **URL Platformă** | Root URL of your website | `https://www.bluehandcanvas.ro` |

---

## 🚀 Setup Guide

### Step 1: Create FGO Account

**Test Environment:**
- URL: https://testuat.fgo.ro/inregistrare
- No paid plan required for testing

**Production Environment:**
- URL: https://www.fgo.ro/inregistrare
- Requires PRO or PREMIUM plan

### Step 2: Generate API Credentials

1. Login to FGO
2. Go to **Setări → Utilizatori**
3. Click **"Generează Utilizator API"**
4. Copy the **Cheie Privată** (Private Key) - you won't see it again!

### Step 3: Define Invoice Series

1. In FGO, go to **Setări → Serii Documente**
2. Create or verify your invoice series (e.g., "BHC")
3. Note the series code for configuration

### Step 4: Configure in BlueHand Canvas

1. Navigate to **Admin → Setări → FGO Config**
2. Fill in all required fields:
   - **Cod Unic**: Your company CUI (without "RO")
   - **Cheie Privată**: The private key from Step 2
   - **Serie**: The invoice series from Step 3
   - **URL Platformă**: Your website URL
3. Select **Test** environment
4. Click **"Testează Conexiunea"** to verify
5. If successful, click **"Salvează Setările"**
6. Toggle **"Activare FGO"** to ON

---

## 🔌 API Integration Details

### Authentication

FGO uses **SHA-1 hash-based authentication**:

```
Hash = SHA-1(CodUnic + CheiePivata + ClientName)
```

All requests include this hash for authentication.

### API Endpoints

**Production:** `https://api.fgo.ro/v1`
**Test:** `https://api-testuat.fgo.ro/v1`

### Invoice Generation Request

```typescript
POST /factura/emitere

{
  CodUnic: "12345678",
  Hash: "CALCULATED_SHA1_HASH",
  Serie: "BHC",
  TipFactura: "Factura",
  Valuta: "RON",
  Client: {
    Denumire: "Client Name",
    Email: "client@email.com",
    Telefon: "+40123456789",
    Tara: "ROMANIA",
    Judet: "Bucuresti",
    Adresa: "Street Address",
    Tip: "PF" // or "PJ" for companies
  },
  Continut: [
    {
      Denumire: "Canvas Print",
      PretUnitar: 100.00,
      UM: "BUC",
      NrProduse: 1,
      CotaTVA: 21
    }
  ],
  PlatformaUrl: "https://www.bluehandcanvas.ro"
}
```

### Response

```json
{
  "Success": true,
  "Factura": {
    "Numar": "001",
    "Serie": "BHC",
    "Link": "https://fgo.ro/factura/view/..."
  }
}
```

---

## 💻 Usage in Code

### Server-Side (Edge Function)

```typescript
import * as fgoModule from './fgo.tsx';

// Generate invoice
const result = await fgoModule.generateInvoice({
  orderNumber: 'BHC-12345',
  orderDate: '2025-02-01',
  customerName: 'Ion Popescu',
  customerEmail: 'ion@email.com',
  total: 350.00,
  items: [...],
  // ... other order data
});

if (result.success) {
  console.log('Invoice generated:', result.invoiceLink);
  // Store invoiceLink in database
}
```

### Check if FGO is Enabled

```typescript
const isEnabled = await fgoModule.isEnabled();

if (isEnabled) {
  // Use FGO for invoice generation
} else {
  // Fallback to jsPDF
}
```

---

## 📊 Features

### ✅ Implemented

- [x] FGO settings management UI
- [x] Secure credential storage in KV store
- [x] SHA-1 hash authentication
- [x] Test/Production environment support
- [x] Connection testing
- [x] Invoice generation via API
- [x] Automatic VAT calculation (21%)
- [x] Support for both PF (individuals) and PJ (companies)
- [x] Client data validation
- [x] Error handling and logging
- [x] Modular architecture (can be disabled/replaced)

### 🔜 Future Enhancements

- [ ] Invoice status checking (GetStatus endpoint)
- [ ] Invoice cancellation (Anulare endpoint)
- [ ] Invoice deletion (Stergere endpoint)
- [ ] Payment recording (Incasare endpoint)
- [ ] Storno invoices
- [ ] AWB tracking
- [ ] Webhook support for invoice status updates
- [ ] Bulk invoice generation
- [ ] Invoice templates customization

---

## 🔐 Security

### Credentials Storage

- FGO credentials stored in **KV Store** (encrypted)
- Private key never exposed to frontend
- SHA-1 hash calculated server-side only

### Best Practices

1. **Never commit credentials** to version control
2. **Use Test environment** for development
3. **Rotate API keys** periodically
4. **Monitor API usage** in FGO dashboard
5. **Log all transactions** for audit trail

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Conexiunea la FGO API a eșuat"

**Causes:**
- Invalid CUI (CodUnic)
- Incorrect Private Key
- Wrong environment selected
- Network connectivity issues

**Solution:**
- Verify credentials in FGO dashboard
- Check environment (Test vs Production)
- Test connection using the built-in test button

#### 2. "Serie invalidă"

**Cause:** Invoice series not defined in FGO

**Solution:**
- Go to FGO → Setări → Serii Documente
- Create the series you're trying to use

#### 3. "Factura duplicată"

**Cause:** Invoice with same IdExtern already exists

**Solution:**
- FGO prevents duplicate invoices by IdExtern (order number)
- Check if invoice was already generated
- Use unique order numbers

#### 4. "CUI invalid pentru persoană juridică"

**Cause:** Invalid company CUI format or validation failed

**Solution:**
- Ensure CUI is valid for Romanian companies
- Set `ValideazaCodUnicRo: false` to skip validation (use with caution)

---

## 📚 API Documentation

**Official FGO API Documentation:**
- https://api.fgo.ro/v1/testing.html
- https://api.fgo.ro/v1/files/specificatii-api-latest.pdf

**Supported API Methods:**
- `/nomenclator/*` - Get nomenclators (countries, counties, VAT rates, etc.)
- `/factura/emitere` - Generate invoice
- `/factura/print` - Get invoice PDF link
- `/factura/getstatus` - Check invoice status
- `/factura/stergere` - Delete invoice
- `/factura/anulare` - Cancel invoice
- `/factura/stornare` - Storno invoice
- `/factura/incasare` - Add payment
- `/articol/*` - Manage products

---

## 🔄 Migration Path

### From jsPDF to FGO

1. **Test in parallel:**
   - Keep jsPDF enabled
   - Enable FGO in Test mode
   - Generate invoices via both systems
   - Compare results

2. **Gradual rollout:**
   - Enable FGO for new orders only
   - Keep jsPDF for existing invoices
   - Monitor for issues

3. **Full migration:**
   - Switch FGO to Production mode
   - Disable jsPDF generation
   - Archive old invoices

### Rollback Plan

If issues occur with FGO:
1. Toggle **"Activare FGO"** to OFF
2. System automatically falls back to jsPDF
3. No code changes required

---

## 📞 Support

### FGO Support

- Email: support@fgo.ro
- Website: https://www.fgo.ro
- Documentation: https://api.fgo.ro/v1/testing.html

### BlueHand Canvas Support

- For integration issues, contact the development team
- Check logs in Supabase Edge Function dashboard
- Review KV store for FGO settings

---

## 📝 Changelog

### Version 1.0.0 (2025-02-01)

**Initial FGO Integration:**
- FGO settings management page
- API service module with authentication
- Invoice generation endpoint
- Connection testing
- Test/Production environment support
- Secure credential storage
- Modular architecture for easy replacement

---

## ⚖️ License & Compliance

**FGO Terms:**
- Subject to FGO's terms of service
- Requires active FGO subscription for production use
- Compliant with Romanian ANAF regulations
- Supports e-Factura standard

**BlueHand Canvas:**
- Internal use only
- Not for redistribution
- Respects FGO API rate limits (1 request/second)

---

## 🎯 Next Steps

1. **Complete Setup:**
   - Configure FGO settings in Admin panel
   - Test invoice generation in Test environment
   - Verify invoice format and content

2. **Test Thoroughly:**
   - Test with different client types (PF/PJ)
   - Test with various product combinations
   - Verify VAT calculations
   - Check email delivery with FGO invoice links

3. **Go Live:**
   - Switch to Production environment
   - Enable FGO activation toggle
   - Monitor first invoices closely
   - Keep fallback system ready

---

**🎉 The FGO integration is now ready to use!**

For questions or issues, refer to the troubleshooting section or contact support.