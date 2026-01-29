# 🚀 Netopia Integration - Quick Reference

## 📊 Summary Table

| Category | Detail | Value/Description |
|----------|--------|-------------------|
| **CURRENT ERROR** | Error Code | `400` |
| | Error Field | `order.currency` |
| | Error Message | `"currency < 3"` |
| | Issue | Currency validation failing despite sending "RON" (3 chars) |
| **ENDPOINTS** | Sandbox Base | `https://secure.sandbox.netopia-payments.com` |
| | Payment Init | `POST /payment/card/start` |
| | Live Base | `https://secure.netopia-payments.com` |
| **API KEYS** | API Key | Environment variable `NETOPIA_API_KEY` |
| | POS Signature | Environment variable `NETOPIA_POS_SIGNATURE` (UUID format) |
| | Public Key | Stored in KV Store (RSA PKCS#8 PEM format) |
| **ENCRYPTION** | Method | Hybrid (RSA + AES) |
| | AES Algorithm | AES-256-CBC |
| | AES Key Size | 32 bytes (256 bits) - random |
| | AES IV Size | 16 bytes (128 bits) - random |
| | IV Position | Prepended to encrypted data |
| | RSA Algorithm | RSA with PKCS#1 v1.5 padding |
| | RSA Purpose | Encrypt AES symmetric key |
| **XML STRUCTURE** | Currency (child) | `<order><currency>RON</currency></order>` |
| | Currency (attribute) | `<invoice currency="RON" amount="...">` |
| | Encoding | UTF-8 |
| | Escaping | XML entities (`&`, `<`, `>`, `"`, `'`) |
| **REQUEST FORMAT** | Content-Type | `application/json` |
| | Authorization | `{NETOPIA_API_KEY}` (sandbox only) |
| | Body Fields | `env_key`, `data`, `config` |
| | config.language | `"ro"` |
| | config.currency | `"RON"` |

---

## 🎯 Key Technical Points

### 1. **Currency is sent in 3 places:**
   - ✅ XML child element: `<currency>RON</currency>`
   - ✅ XML invoice attribute: `currency="RON"`
   - ✅ Config object: `"currency": "RON"`

### 2. **Encryption Flow:**
   ```
   XML → AES-256-CBC Encrypt → Prepend IV → Base64 → "data" field
   AES Key → RSA Encrypt → Base64 → "env_key" field
   ```

### 3. **Request Body Structure:**
   ```json
   {
     "env_key": "{RSA-encrypted-AES-key-in-base64}",
     "data": "{IV-plus-AES-encrypted-XML-in-base64}",
     "config": {
       "language": "ro",
       "currency": "RON",
       "notifyUrl": "https://...",
       "redirectUrl": "https://..."
     }
   }
   ```

### 4. **Public Key Formats Supported:**
   - PKCS#1 → Auto-converted to PKCS#8
   - PKCS#8 → Used directly
   - Certificate → Public key extracted

---

## 🔍 Current Investigation Status

| Item | Status | Notes |
|------|--------|-------|
| Currency in XML | ✅ Verified | "RON" (3 chars) in 2 locations |
| Config currency | ✅ Verified | "RON" in config object |
| XML well-formed | ✅ Verified | Valid UTF-8 XML |
| Encryption | ✅ Working | No errors during encryption |
| Public Key | ✅ Working | Successfully encrypts AES key |
| API Response | ❌ Error 400 | "currency < 3" validation error |

---

## 📝 Sample XML (Unencrypted)

```xml
<?xml version="1.0" encoding="utf-8"?>
<order type="card" id="ORDER-123" timestamp="1738171234567">
  <currency>RON</currency>
  <signature>ABCD-1234-EFGH-5678</signature>
  <url>
    <confirm>https://example.supabase.co/functions/v1/make-server-bbc0c500/netopia/ipn</confirm>
    <return>https://example.com/payment-success?orderId=ORDER-123</return>
  </url>
  <invoice currency="RON" amount="150.00">
    <details>Comanda BlueHand Canvas #ORDER-123</details>
    <contact_info>
      <billing type="person">
        <first_name>Ion</first_name>
        <last_name>Popescu</last_name>
        <email>customer@example.com</email>
        <mobile_phone>+40712345678</mobile_phone>
        <address>Strada Exemplu 123</address>
        <city></city>
        <county></county>
        <zip_code></zip_code>
        <country>Romania</country>
      </billing>
      <shipping type="person">
        <!-- Same as billing -->
      </shipping>
    </contact_info>
  </invoice>
</order>
```

---

## ❓ Questions for Netopia

1. **Currency Location**: Should currency be in `<order>` child element, `<invoice>` attribute, or both?
2. **Error Root Cause**: Why "currency < 3" when we're sending "RON" (exactly 3 characters)?
3. **Config Currency**: Is the currency in config object required/conflicting?
4. **XML Decryption**: Can Netopia successfully decrypt our payload?
5. **Public Key Format**: What's the correct RSA public key format (PKCS#1 or PKCS#8)?

---

## 📧 Contact Netopia Support

**What to include:**
- ✅ Error message and HTTP status code
- ✅ Sample unencrypted XML
- ✅ Encryption method details
- ✅ Environment (sandbox/live)
- ✅ POS Signature being used
- ✅ Request/response logs

**Reference Document:**  
See `/NETOPIA_TECHNICAL_DETAILS_FOR_SUPPORT.md` for complete technical specifications.

---

**Last Updated:** January 29, 2026
