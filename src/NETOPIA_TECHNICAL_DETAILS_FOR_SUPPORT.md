# 🔧 Netopia Integration Technical Details - For Support Contact

**Company:** BlueHand Canvas  
**Integration Type:** Server-to-Server Payment API  
**Date:** January 29, 2026  
**Environment:** Sandbox (Testing)  

---

## 📋 CURRENT ERROR

**Error Message:**
```json
{
  "code": "400",
  "details": [{
    "attributes": {"min": "3"},
    "code": "strLenMinLength",
    "field": "order.currency",
    "message": "currency < 3"
  }],
  "message": "Validation error"
}
```

**Error Context:**
- Receiving this error when calling the payment initialization endpoint
- Currency is set to "RON" (exactly 3 characters) in multiple locations
- Error suggests currency value is less than 3 characters, but we're sending "RON"

---

## 🌐 API ENDPOINTS USED

### Sandbox Environment (Current)
- **Base URL:** `https://secure.sandbox.netopia-payments.com`
- **Payment Initialization:** `POST https://secure.sandbox.netopia-payments.com/payment/card/start`
- **IPN (Instant Payment Notification):** `POST https://[our-server]/functions/v1/make-server-bbc0c500/netopia/ipn`
- **Return URL:** `https://[our-app]/payment-success?orderId={orderId}`

### Live Environment (Not Yet Used)
- **Base URL:** `https://secure.netopia-payments.com`
- **Payment Initialization:** `POST https://secure.netopia-payments.com/payment/card/start`

---

## 🔑 CREDENTIALS & API KEYS

### Sandbox Credentials
1. **API Key (Authorization Header)**
   - Environment Variable: `NETOPIA_API_KEY`
   - Used in: HTTP Header `Authorization: {API_KEY}`
   - Purpose: Sandbox authentication

2. **POS Signature**
   - Environment Variable: `NETOPIA_POS_SIGNATURE`
   - Format: UUID-like string (e.g., `ABCD-1234-EFGH-5678-IJKL-9012`)
   - Used in: XML `<signature>` element
   - Purpose: Merchant identification

3. **Public Key (RSA)**
   - Stored in: KV Store (`netopia_settings.publicKey`)
   - Format Accepted: PKCS#1 or PKCS#8 PEM format
   - Purpose: Encrypting AES symmetric key
   - Key Type: RSA Public Key (2048-bit or higher)

### Key Format Examples

**PKCS#1 Format (RSA PUBLIC KEY):**
```
-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEA...
-----END RSA PUBLIC KEY-----
```

**PKCS#8 Format (PUBLIC KEY):**
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----
```

**We automatically convert PKCS#1 to PKCS#8** using node-forge library.

---

## 📄 XML PAYLOAD STRUCTURE

### Complete XML Being Sent

```xml
<?xml version="1.0" encoding="utf-8"?>
<order type="card" id="ORDER-{unique-id}" timestamp="{unix-timestamp}">
  <currency>RON</currency>
  <signature>{POS_SIGNATURE}</signature>
  <url>
    <confirm>https://{our-server}/functions/v1/make-server-bbc0c500/netopia/ipn</confirm>
    <return>https://{our-app}/payment-success?orderId={orderId}</return>
  </url>
  <invoice currency="RON" amount="{amount}">
    <details>Comanda BlueHand Canvas #{orderId}</details>
    <contact_info>
      <billing type="person">
        <first_name>{firstName}</first_name>
        <last_name>{lastName}</last_name>
        <email>{email}</email>
        <mobile_phone>{phone}</mobile_phone>
        <address>{address}</address>
        <city></city>
        <county></county>
        <zip_code></zip_code>
        <country>Romania</country>
      </billing>
      <shipping type="person">
        <first_name>{firstName}</first_name>
        <last_name>{lastName}</last_name>
        <email>{email}</email>
        <mobile_phone>{phone}</mobile_phone>
        <address>{address}</address>
        <city></city>
        <county></county>
        <zip_code></zip_code>
        <country>Romania</country>
      </shipping>
    </contact_info>
  </invoice>
</order>
```

### Currency Placement (IMPORTANT)

We are placing currency in **TWO locations** as we believe both are required:

1. **As child element of `<order>`**: `<currency>RON</currency>`
2. **As attribute on `<invoice>`**: `currency="RON"`

**Question for Netopia:** Is this correct? Should currency be in both places, or only one?

### Sample XML Values

**Example Order:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<order type="card" id="ORDER-1738171234567" timestamp="1738171234567">
  <currency>RON</currency>
  <signature>ABCD-1234-EFGH-5678-IJKL-9012</signature>
  <url>
    <confirm>https://abc123.supabase.co/functions/v1/make-server-bbc0c500/netopia/ipn</confirm>
    <return>https://bluehand-canvas.supabase.co/payment-success?orderId=ORDER-1738171234567</return>
  </url>
  <invoice currency="RON" amount="150.00">
    <details>Comanda BlueHand Canvas #ORDER-1738171234567</details>
    <contact_info>
      <billing type="person">
        <first_name>Ion</first_name>
        <last_name>Popescu</last_name>
        <email>ion.popescu@example.com</email>
        <mobile_phone>+40712345678</mobile_phone>
        <address>Strada Exemplu 123</address>
        <city></city>
        <county></county>
        <zip_code></zip_code>
        <country>Romania</country>
      </billing>
      <shipping type="person">
        <first_name>Ion</first_name>
        <last_name>Popescu</last_name>
        <email>ion.popescu@example.com</email>
        <mobile_phone>+40712345678</mobile_phone>
        <address>Strada Exemplu 123</address>
        <city></city>
        <county></county>
        <zip_code></zip_code>
        <country>Romania</country>
      </shipping>
    </contact_info>
  </invoice>
</order>
```

### XML Escaping

We properly escape all XML special characters:
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&apos;`

---

## 🔐 ENCRYPTION DETAILS

### Encryption Method: **Hybrid Encryption (RSA + AES)**

### Step-by-Step Process

#### 1. **AES Encryption (Symmetric)**
- **Algorithm:** AES-256-CBC
- **Key Length:** 32 bytes (256 bits) - randomly generated
- **IV Length:** 16 bytes (128 bits) - randomly generated
- **Padding:** PKCS#7 (automatic with AES-CBC)
- **Process:**
  1. Generate random 32-byte AES key
  2. Generate random 16-byte IV
  3. Encrypt XML with AES-256-CBC using key + IV
  4. **Prepend IV to encrypted data** (IV is first 16 bytes of output)
  5. Base64 encode the result (IV + encrypted XML)

**Code Implementation:**
```javascript
const aesKey = crypto.randomBytes(32);        // 256-bit random key
const iv = crypto.randomBytes(16);            // 128-bit random IV
const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
let encryptedXml = cipher.update(xml, 'utf8');
encryptedXml = Buffer.concat([encryptedXml, cipher.final()]);
const encryptedDataWithIV = Buffer.concat([iv, encryptedXml]);
const encryptedData = encryptedDataWithIV.toString('base64');
```

#### 2. **RSA Encryption (Asymmetric)**
- **Algorithm:** RSA
- **Key Size:** 2048-bit (or higher, depending on Netopia's public key)
- **Padding:** PKCS#1 v1.5 (`RSA_PKCS1_PADDING`)
- **Purpose:** Encrypt the AES symmetric key
- **Public Key Format:** PKCS#8 PEM

**Code Implementation:**
```javascript
const encryptedKey = crypto.publicEncrypt(
  {
    key: publicKeyFormatted,        // Netopia's public key (PKCS#8)
    padding: crypto.constants.RSA_PKCS1_PADDING
  },
  aesKey                            // The 32-byte AES key
);
const envKey = encryptedKey.toString('base64');
```

### Final Encrypted Payload Structure

**JSON Request Body:**
```json
{
  "env_key": "{base64-encoded-encrypted-AES-key}",
  "data": "{base64-encoded-IV-plus-encrypted-XML}",
  "config": {
    "language": "ro",
    "currency": "RON",
    "notifyUrl": "https://{our-server}/functions/v1/make-server-bbc0c500/netopia/ipn",
    "redirectUrl": "https://{our-app}/payment-success?orderId={orderId}"
  }
}
```

### Encryption Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. GENERATE RANDOM KEYS                                          │
│    • AES Key: 32 random bytes                                   │
│    • IV: 16 random bytes                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. ENCRYPT XML WITH AES-256-CBC                                  │
│    • Input: XML string                                           │
│    • Key: 32-byte AES key                                       │
│    • IV: 16-byte IV                                             │
│    • Output: Encrypted bytes                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. PREPEND IV TO ENCRYPTED DATA                                  │
│    • Structure: [16 bytes IV][encrypted XML]                    │
│    • Base64 encode → "data" field                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. ENCRYPT AES KEY WITH RSA                                      │
│    • Input: 32-byte AES key                                     │
│    • Key: Netopia's RSA public key (PKCS#8)                     │
│    • Padding: PKCS#1 v1.5                                       │
│    • Base64 encode → "env_key" field                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. SEND TO NETOPIA                                               │
│    POST /payment/card/start                                      │
│    Body: { env_key, data, config }                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📤 HTTP REQUEST DETAILS

### Request Headers

```http
POST /payment/card/start HTTP/1.1
Host: secure.sandbox.netopia-payments.com
Content-Type: application/json
Accept: application/json
Authorization: {NETOPIA_API_KEY}
```

### Request Body Example

```json
{
  "env_key": "XxYyZz...{base64-RSA-encrypted-AES-key}",
  "data": "AbCdEf...{base64-IV-plus-AES-encrypted-XML}",
  "config": {
    "language": "ro",
    "currency": "RON",
    "notifyUrl": "https://abc123.supabase.co/functions/v1/make-server-bbc0c500/netopia/ipn",
    "redirectUrl": "https://bluehand-canvas.supabase.co/payment-success?orderId=ORDER-123"
  }
}
```

### Field Descriptions

| Field | Description | Format | Required |
|-------|-------------|--------|----------|
| `env_key` | RSA-encrypted AES key | Base64 string | Yes |
| `data` | IV + AES-encrypted XML | Base64 string | Yes |
| `config.language` | Display language | "ro" or "en" | Yes |
| `config.currency` | Payment currency | "RON" (3 chars) | Yes |
| `config.notifyUrl` | IPN callback URL | HTTPS URL | Yes |
| `config.redirectUrl` | Customer return URL | HTTPS URL | Yes |

---

## 🔍 DEBUGGING INFORMATION

### What We've Verified

✅ **Currency Value:**
- Value: `"RON"`
- Length: 3 characters
- Format: Uppercase string
- Encoding: UTF-8

✅ **XML Structure:**
- Well-formed XML (valid syntax)
- Proper UTF-8 encoding declaration
- Currency appears in TWO places:
  - `<currency>RON</currency>` (child element)
  - `<invoice currency="RON" ...>` (attribute)

✅ **Encryption:**
- AES key: 32 bytes (256 bits)
- IV: 16 bytes (128 bits)
- RSA padding: PKCS#1 v1.5
- Base64 encoding applied correctly

✅ **Public Key:**
- Format conversion: PKCS#1 → PKCS#8 (when needed)
- PEM format validation
- Successfully encrypts AES key (no errors)

### Console Logs from Our Server

```
💳 Initiating Netopia payment for order ORDER-1738171234567, amount: 150 RON
🔗 Using environment: sandbox
🔗 Base URL: https://secure.sandbox.netopia-payments.com
🔑 POS Signature being used: "ABCD-1234-EFGH-5678-IJKL-9012"
🔑 POS Signature length: 36 characters
🔑 API Key configured: xyz1234567...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 COMPLETE GENERATED XML (849 chars):
💱 Currency: "RON" (3 chars) - AS CHILD ELEMENT + INVOICE ATTRIBUTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<?xml version="1.0" encoding="utf-8"?>
<order type="card" id="ORDER-1738171234567" timestamp="1738171234567">
  <currency>RON</currency>
  <signature>ABCD-1234-EFGH-5678-IJKL-9012</signature>
  ...
</order>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Currency validation passed: <currency>RON</currency> found in XML
🔐 AES encryption details:
  IV (prepended to data): a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
  Encrypted data length: 896 bytes
✅ AES key encrypted successfully with RSA public key

🚀 Making API call to Netopia...
📤 Request body keys: [ 'env_key', 'data', 'config' ]
📤 Config: { language: 'ro', currency: 'RON', notifyUrl: '...', redirectUrl: '...' }

📥 Netopia response status: 400
❌ Netopia API error (400): {"code":"400","details":[{"attributes":{"min":"3"},"code":"strLenMinLength","field":"order.currency","message":"currency < 3"}],"message":"Validation error"}
```

---

## ❓ QUESTIONS FOR NETOPIA SUPPORT

### 1. Currency Placement
**Question:** Where should the currency ("RON") be placed in the XML structure?
- Option A: Only as child element: `<order><currency>RON</currency></order>`
- Option B: Only as invoice attribute: `<invoice currency="RON" amount="...">`
- Option C: Both places (our current implementation)
- Option D: As order attribute: `<order currency="RON">`

### 2. Currency Validation Error
**Question:** Why are we receiving "currency < 3" error when we're sending "RON" (exactly 3 characters)?
- Is the currency value not being parsed correctly from the encrypted XML?
- Is there an issue with our XML encoding (UTF-8)?
- Is the currency in the wrong location in the XML structure?

### 3. Config Object Currency
**Question:** We're also sending `"currency": "RON"` in the config object. Is this required or conflicting?
```json
{
  "config": {
    "currency": "RON"
  }
}
```

### 4. XML Decryption
**Question:** Can Netopia confirm they can successfully decrypt our XML payload?
- Are we using the correct encryption method (AES-256-CBC)?
- Is the IV placement correct (prepended to encrypted data)?
- Is the RSA padding correct (PKCS#1 v1.5)?

### 5. Public Key Format
**Question:** What is the correct format for the RSA public key?
- PKCS#1 (`BEGIN RSA PUBLIC KEY`)?
- PKCS#8 (`BEGIN PUBLIC KEY`)?
- Certificate (`BEGIN CERTIFICATE`)?

We're currently converting PKCS#1 to PKCS#8. Is this correct?

---

## 🛠️ TECHNICAL ENVIRONMENT

### Server Platform
- **Runtime:** Deno (Supabase Edge Functions)
- **Node.js Compatibility:** Via `node:` imports
- **Crypto Library:** Node.js `crypto` module
- **XML Processing:** Manual string building (no XML parser)
- **Forge Library:** `node-forge@1.3.1` (for key conversion)

### Dependencies
```javascript
import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import forge from 'npm:node-forge@1.3.1';
```

### Node.js Crypto Methods Used
- `crypto.randomBytes(n)` - Generate random bytes
- `crypto.createCipheriv('aes-256-cbc', key, iv)` - AES encryption
- `crypto.publicEncrypt({ key, padding }, data)` - RSA encryption
- `crypto.constants.RSA_PKCS1_PADDING` - RSA padding constant

---

## 📞 CONTACT INFORMATION

**Project:** BlueHand Canvas E-commerce Platform  
**Developer:** [Your Name]  
**Email:** [Your Email]  
**Testing Environment:** Sandbox  
**Merchant ID:** [If applicable]  
**POS Signature:** [Last 8 chars of signature]  

---

## 📎 ATTACHMENTS

If requested by Netopia support, we can provide:
1. ✅ Complete XML payload (unencrypted)
2. ✅ Base64-encoded encrypted payload
3. ✅ Server logs showing encryption process
4. ✅ Sample request/response with timestamps
5. ✅ Public key being used (PKCS#8 format)

---

**Last Updated:** January 29, 2026  
**Document Version:** 1.0  
**Status:** Awaiting Netopia Support Response
