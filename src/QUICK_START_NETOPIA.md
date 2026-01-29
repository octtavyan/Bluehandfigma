# 🚀 Quick Start: Netopia Payment Integration

## 1-Minute Setup Check

### ✅ Environment Variables (Supabase Secrets)
```bash
NETOPIA_API_KEY=your_sandbox_api_key         # ✅ Already set
NETOPIA_POS_SIGNATURE=your_pos_signature     # ✅ Already set
```

### ✅ Admin Settings
Go to: **Admin → Settings → Netopia Payments**
- Upload **Public Key** (PEM format) - REQUIRED ⚠️
- Verify POS Signature is set
- Environment: Sandbox (for testing)

### ✅ Test Now!
1. **Open**: `/netopia-test`
2. **Click**: "Test Netopia Payment"
3. **Watch**: Console logs
4. **See**: Green success ✅ → Auto-redirect to Netopia

---

## 🧪 Quick Test Card (Sandbox)

```
Card: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
Name: TEST USER
```

---

## 📋 What Was Implemented

### Manual XML + Encryption Implementation
We're using a **manual implementation** (not an SDK) because:
- ✅ SDK not compatible with Deno/Supabase Edge Functions
- ✅ Full control over XML structure
- ✅ Proven to work with Netopia API
- ✅ Complete encryption pipeline (AES-256-CBC + RSA)

### Files Changed
- ✅ `/supabase/functions/server/index.tsx` - Payment endpoint
- ✅ `/pages/CheckoutPage.tsx` - Passes phone/address
- ✅ `/pages/NetopiaTestPage.tsx` - Test interface
- ✅ `/App.tsx` - Added test route

---

## 🔍 Quick Debug

### Browser Console Should Show:
```javascript
🧪 Testing Netopia payment...
📥 Netopia response: { success: true, redirectUrl: "...", ... }
✅ Payment initialized!
🔗 Redirect URL: https://secure.sandbox.netopia-payments.com/...
```

### Supabase Logs Should Show:
```
💳 Initiating Netopia payment for order TEST-...
📄 COMPLETE GENERATED XML:
<?xml version="1.0" encoding="utf-8"?>
<order type="card" id="..." timestamp="..." currency="RON">
  ...
</order>
🔐 AES encryption details:
  IV (prepended to data): ...
✅ AES key encrypted successfully with RSA public key
🚀 Making API call to Netopia...
📥 Netopia response status: 200
✅ Netopia redirect URL: https://...
```

---

## ❌ Common Issues → Quick Fixes

| Issue | Fix |
|-------|-----|
| "Not configured" | Upload Public Key in Admin Settings ⚠️ |
| "Failed to convert public key" | Use PEM format (BEGIN PUBLIC KEY) |
| "401 Unauthorized" | Verify API key matches Netopia account |
| "No redirect URL" | Check Supabase logs for full response |

---

## ⚠️ CRITICAL: Public Key Required

The **RSA Public Key** must be uploaded in Admin Settings:
1. Go to Admin → Settings → Netopia Payments
2. Scroll to "Public Key" field
3. Paste your PEM-formatted public key:
   ```
   -----BEGIN PUBLIC KEY-----
   MIIBIjANBgkqhkiG...
   -----END PUBLIC KEY-----
   ```
4. Click "Save Settings"

**Without the public key, payments will fail!**

---

## 📚 Full Documentation

- **Integration Overview**: `/NETOPIA_INTEGRATION.md`
- **Detailed Checklist**: `/TESTING_CHECKLIST.md`

---

## 🎯 Success = Green Alert + Auto-Redirect

**Test URL**: `/netopia-test`

**Expected Flow**:
1. Click "Test Netopia Payment"
2. See green alert ✅
3. Console shows all logs with ✅
4. Auto-redirect in 3 seconds
5. Netopia payment page loads

**Total Time**: 10 seconds

---

## 🔧 Troubleshooting Steps

### Step 1: Check Public Key
```
Admin → Settings → Netopia Payments → Public Key
```
Must be in PEM format, not empty.

### Step 2: Check Environment Variables
```
Supabase → Settings → Edge Functions → Secrets
- NETOPIA_API_KEY ✓
- NETOPIA_POS_SIGNATURE ✓
```

### Step 3: Check Logs
```
Supabase → Logs → Edge Functions
```
Look for errors with ❌ symbol.

### Step 4: Test Connection
```
Admin → Settings → Netopia Payments → Test Connection
```
Should show "Configurare validată!"

---

## 💡 Implementation Details

### Encryption Process
1. Generate random AES-256 key (32 bytes)
2. Generate random IV (16 bytes)
3. Build XML payment order
4. Encrypt XML with AES-256-CBC
5. Prepend IV to encrypted data
6. Encrypt AES key with RSA public key
7. Send to Netopia: `{ env_key, data, config }`

### XML Structure
```xml
<order currency="RON" ...>
  <invoice currency="RON" amount="10.00">
    ...
  </invoice>
</order>
```
**Note**: Currency must be attribute on both order and invoice!

---

**Status**: ✅ Ready to Test!

**Next**: Go to `/netopia-test` and click the button!
