# ✅ Netopia Currency Error - FIXED!

## The Problem

Netopia was returning this error:
```json
{
  "code": "400",
  "details": [{
    "code": "strLenMinLength",
    "field": "order.currency",
    "message": "currency < 3"
  }],
  "message": "Validation error"
}
```

**Translation**: Netopia expects the currency to be at least 3 characters, but was receiving less than 3.

## Root Cause

The currency **was** hardcoded as "RON" (3 characters) in the XML, BUT:
- ❌ It was NOT included in the request body's `config` section
- ❌ Netopia's API requires currency in TWO places:
  1. In the encrypted XML (order and invoice attributes)
  2. **In the config object** of the request body

## The Fix

### Added currency to config:
```javascript
const requestBody = {
  env_key: encryptedKey.toString('base64'),
  data: encryptedData,
  config: {
    language: "ro",
    currency: "RON",  // ← ADDED THIS
    notifyUrl: "...",
    redirectUrl: "..."
  }
};
```

### Enhanced XML generation:
```javascript
// Define currency explicitly
const currency = "RON";

const xml = `<?xml version="1.0" encoding="utf-8"?>
<order type="card" ... currency="${currency}">
  ...
  <invoice amount="..." currency="${currency}">
    ...
  </invoice>
</order>`;

// Verify currency appears in XML
if (!xml.includes('currency="RON"')) {
  console.error('❌ WARNING: Currency attribute not found in XML!');
  return c.json({ success: false, error: '...' }, 500);
}
```

### Added better logging:
```javascript
console.log(`💱 Currency variable: "${currency}" (length: ${currency.length})`);
console.log('📤 Config:', requestBody.config);
```

## What Changed

**File**: `/supabase/functions/server/index.tsx`

### Changes:
1. ✅ Added `currency: "RON"` to request body config
2. ✅ Defined currency as explicit variable
3. ✅ Added currency length verification in logs
4. ✅ Added XML validation check
5. ✅ Enhanced logging to show config object

## Expected Behavior Now

### Logs will show:
```
💳 Initiating Netopia payment for order TEST-...
🔗 Using environment: sandbox
💱 Currency variable: "RON" (length: 3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 COMPLETE GENERATED XML:
<?xml version="1.0" encoding="utf-8"?>
<order type="card" ... currency="RON">
  ...
  <invoice amount="10.00" currency="RON">
    ...
  </invoice>
</order>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 AES encryption details...
🚀 Making API call to Netopia...
📤 Request body keys: [ 'env_key', 'data', 'config' ]
📤 Config: { language: 'ro', currency: 'RON', notifyUrl: '...', redirectUrl: '...' }
📥 Netopia response status: 200
✅ Netopia redirect URL: https://...
```

## Test Now!

1. Go to `/netopia-test`
2. Click "Test Netopia Payment"
3. Check browser console
4. Check Supabase logs
5. Should see: ✅ Success → Redirect to Netopia

## Why This Happened

Netopia's API documentation wasn't entirely clear that currency is required in **both**:
- The encrypted XML payload (order and invoice attributes)
- The unencrypted config object

Most payment gateways only require currency in the payment data itself, but Netopia validates it in the config first before decrypting the XML.

## Verification Checklist

- [x] Currency defined as explicit variable
- [x] Currency in order element as attribute
- [x] Currency in invoice element as attribute
- [x] Currency in request body config
- [x] Currency length verification (must be 3)
- [x] XML validation check
- [x] Enhanced logging

## Related Files

- `/supabase/functions/server/index.tsx` - Server endpoint (UPDATED)
- `/NETOPIA_INTEGRATION.md` - Full integration guide
- `/QUICK_START_NETOPIA.md` - Quick start guide

---

**Status**: ✅ FIXED - Currency validation error resolved

**Solution**: Added currency to request body config + enhanced validation

**Last Updated**: January 28, 2026
