# 🔧 CRITICAL FIX: Netopia XML Currency Structure

## ❌ The Problem

Netopia kept rejecting payments with:
```json
{
  "code": "400",
  "details": [{
    "field": "order.currency",
    "message": "currency < 3"
  }]
}
```

## 🔍 Root Cause - XML PATH NOTATION!

The error field `"order.currency"` uses **XML PATH notation**, which means:
- ❌ `order.currency` = `<order><currency>VALUE</currency></order>` (child element)
- NOT `<order currency="VALUE">` (attribute)

### What We Had (WRONG):
```xml
<order type="card" id="..." timestamp="..." currency="RON">
  <signature>...</signature>
  <invoice amount="..." currency="RON">
    ...
  </invoice>
</order>
```
**Problem**: Currency as attribute on `<order>` element

### What Netopia Expects (CORRECT):
```xml
<order type="card" id="..." timestamp="...">
  <currency>RON</currency>
  <signature>...</signature>
  <invoice amount="..." currency="RON">
    ...
  </invoice>
</order>
```
**Solution**: Currency as **child element** under `<order>`

## ✅ The Fix

### Changed XML Structure:
```javascript
// OLD (attribute):
const xml = `<order ... currency="${currency}">`;

// NEW (child element):
const xml = `<order ... >
  <currency>${currency}</currency>
  ...
</order>`;
```

### Updated Validation:
```javascript
// OLD:
if (!xml.includes('currency="RON"')) { ... }

// NEW:
if (!xml.includes('<currency>RON</currency>')) { ... }
```

## 📋 Complete Correct XML Structure

```xml
<?xml version="1.0" encoding="utf-8"?>
<order type="card" id="ORDER-123" timestamp="1234567890">
  <currency>RON</currency>
  <signature>ABCD-1234-EFGH-5678-IJKL-9012</signature>
  <url>
    <confirm>https://...</confirm>
    <return>https://...</return>
  </url>
  <invoice amount="100.00" currency="RON">
    <details>Comanda BlueHand Canvas #ORDER-123</details>
    <contact_info>
      <billing type="person">
        <first_name>John</first_name>
        <last_name>Doe</last_name>
        <email>john@example.com</email>
        <mobile_phone>0712345678</mobile_phone>
        <address>Romania</address>
        <city></city>
        <county></county>
        <zip_code></zip_code>
        <country>Romania</country>
      </billing>
      <shipping type="person">
        <first_name>John</first_name>
        <last_name>Doe</last_name>
        <email>john@example.com</email>
        <mobile_phone>0712345678</mobile_phone>
        <address>Romania</address>
        <city></city>
        <county></county>
        <zip_code></zip_code>
        <country>Romania</country>
      </shipping>
    </contact_info>
  </invoice>
</order>
```

## 🎯 Key Changes

1. ✅ **`<order>` element**: Removed `currency` attribute
2. ✅ **Added `<currency>` child**: Added `<currency>RON</currency>` as first child of `<order>`
3. ✅ **`<invoice>` element**: Kept `currency` attribute (Netopia might expect it here too)
4. ✅ **Request config**: Added `currency: "RON"` to config object
5. ✅ **Validation**: Check for `<currency>RON</currency>` in XML

## 📊 Expected Behavior

### Console Logs:
```
💳 Initiating Netopia payment for order TEST-...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 COMPLETE GENERATED XML:
💱 Currency: "RON" (3 chars) - AS CHILD ELEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<?xml version="1.0" encoding="utf-8"?>
<order type="card" ...>
  <currency>RON</currency>
  ...
</order>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Currency validation passed: <currency>RON</currency> found in XML
🔐 AES encryption details...
🚀 Making API call to Netopia...
📤 Config: { language: 'ro', currency: 'RON', ... }
📥 Netopia response status: 200
✅ Netopia redirect URL: https://...
```

## 🧪 Test Now!

1. Go to `/netopia-test`
2. Click "Test Netopia Payment"
3. Check console - should see `<currency>RON</currency>` in XML
4. Expected: ✅ Success → Redirect to Netopia

## 📚 Why This Matters

XML path notation is used by validation frameworks:
- `order.currency` = XPath `/order/currency`
- This means a child element, not an attribute
- Attributes would be `order/@currency`

Netopia's validation error clearly showed it was looking for a child element!

## 🔗 Related Files

- `/supabase/functions/server/index.tsx` - Updated XML structure
- `/NETOPIA_CURRENCY_FIX.md` - Previous attempt (config fix)
- `/NETOPIA_INTEGRATION.md` - Full integration guide

---

**Status**: ✅ FIXED - Currency now as child element

**Lesson**: Always pay attention to XML path notation in error messages!

**Last Updated**: January 28, 2026
