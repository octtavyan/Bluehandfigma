# 💻 Netopia Integration - Code Implementation Details

## 🔧 Complete Implementation Code

### 1. XML Generation

```javascript
// Define currency explicitly - MUST be exactly 3 characters
const currency = "RON";

// Escape XML special characters
const escapeXml = (str) => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Build XML structure
const xml = `<?xml version="1.0" encoding="utf-8"?>
<order type="card" id="${escapeXml(orderId)}" timestamp="${timestamp}">
  <currency>${currency}</currency>
  <signature>${escapeXml(posSignature)}</signature>
  <url>
    <confirm>${escapeXml(confirmUrl)}</confirm>
    <return>${escapeXml(returnUrl)}</return>
  </url>
  <invoice currency="${currency}" amount="${escapeXml(amount.toFixed(2))}">
    <details>${escapeXml(`Comanda BlueHand Canvas #${orderId}`)}</details>
    <contact_info>
      <billing type="person">
        <first_name>${escapeXml(firstName)}</first_name>
        <last_name>${escapeXml(lastName)}</last_name>
        <email>${escapeXml(customerEmail)}</email>
        <mobile_phone>${escapeXml(customerPhone || '')}</mobile_phone>
        <address>${escapeXml(customerAddress || 'Romania')}</address>
        <city></city>
        <county></county>
        <zip_code></zip_code>
        <country>Romania</country>
      </billing>
      <shipping type="person">
        <first_name>${escapeXml(firstName)}</first_name>
        <last_name>${escapeXml(lastName)}</last_name>
        <email>${escapeXml(customerEmail)}</email>
        <mobile_phone>${escapeXml(customerPhone || '')}</mobile_phone>
        <address>${escapeXml(customerAddress || 'Romania')}</address>
        <city></city>
        <county></county>
        <zip_code></zip_code>
        <country>Romania</country>
      </shipping>
    </contact_info>
  </invoice>
</order>`;
```

---

### 2. AES Encryption (Symmetric)

```javascript
import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';

// Step 1: Generate random AES key and IV
const aesKey = crypto.randomBytes(32);  // 256-bit key
const iv = crypto.randomBytes(16);      // 128-bit IV

// Step 2: Create AES cipher
const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);

// Step 3: Encrypt the XML
let encryptedXml = cipher.update(xml, 'utf8');
encryptedXml = Buffer.concat([encryptedXml, cipher.final()]);

// Step 4: Prepend IV to encrypted data
const encryptedDataWithIV = Buffer.concat([iv, encryptedXml]);

// Step 5: Base64 encode
const encryptedData = encryptedDataWithIV.toString('base64');

console.log('AES Encryption Details:');
console.log('  Key length:', aesKey.length, 'bytes');      // 32
console.log('  IV length:', iv.length, 'bytes');           // 16
console.log('  IV (hex):', iv.toString('hex'));
console.log('  Encrypted data length:', encryptedDataWithIV.length, 'bytes');
console.log('  Base64 length:', encryptedData.length, 'chars');
```

**Output Example:**
```
AES Encryption Details:
  Key length: 32 bytes
  IV length: 16 bytes
  IV (hex): a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
  Encrypted data length: 896 bytes
  Base64 length: 1195 chars
```

---

### 3. RSA Encryption (Asymmetric)

```javascript
import forge from 'npm:node-forge@1.3.1';

// Load public key
let publicKeyFormatted = netopiaPublicKey;

// Convert PKCS#1 to PKCS#8 if needed
if (publicKeyFormatted.includes('BEGIN RSA PUBLIC KEY')) {
  console.log('Converting PKCS#1 to PKCS#8...');
  const publicKeyForge = forge.pki.publicKeyFromPem(publicKeyFormatted.trim());
  const publicKeyAsn1 = forge.pki.publicKeyToAsn1(publicKeyForge);
  const publicKeyInfo = forge.pki.wrapRsaPublicKey(publicKeyAsn1);
  publicKeyFormatted = forge.pki.publicKeyInfoToPem(publicKeyInfo);
  console.log('✅ Key converted successfully');
}

// Encrypt AES key with RSA
const encryptedKey = crypto.publicEncrypt(
  {
    key: publicKeyFormatted,
    padding: crypto.constants.RSA_PKCS1_PADDING  // PKCS#1 v1.5 padding
  },
  aesKey  // The 32-byte AES key
);

// Base64 encode encrypted key
const envKey = encryptedKey.toString('base64');

console.log('RSA Encryption Details:');
console.log('  Encrypted key length:', encryptedKey.length, 'bytes');
console.log('  Base64 length:', envKey.length, 'chars');
```

**Output Example:**
```
RSA Encryption Details:
  Encrypted key length: 256 bytes
  Base64 length: 344 chars
```

---

### 4. API Request

```javascript
// Prepare request body
const requestBody = {
  env_key: envKey,           // Base64-encoded RSA-encrypted AES key
  data: encryptedData,       // Base64-encoded IV + AES-encrypted XML
  config: {
    language: "ro",
    currency: "RON",
    notifyUrl: `https://${projectUrl}/functions/v1/make-server-bbc0c500/netopia/ipn`,
    redirectUrl: returnUrl || `https://${projectUrl}/payment-success?orderId=${orderId}`
  }
};

// Make API call
const response = await fetch('https://secure.sandbox.netopia-payments.com/payment/card/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': sandboxApiKey  // Only for sandbox
  },
  body: JSON.stringify(requestBody)
});

// Handle response
const status = response.status;
const responseData = await response.json();

console.log('Netopia Response:');
console.log('  Status:', status);
console.log('  Data:', JSON.stringify(responseData, null, 2));
```

---

### 5. Current Error Response

```javascript
// Status: 400
// Response Body:
{
  "code": "400",
  "details": [
    {
      "attributes": { "min": "3" },
      "code": "strLenMinLength",
      "field": "order.currency",
      "message": "currency < 3"
    }
  ],
  "message": "Validation error"
}
```

---

## 🔍 Debugging Code

### Verify Currency in XML

```javascript
// Before encryption, verify currency
console.log('Currency Verification:');
console.log('  Value:', currency);
console.log('  Length:', currency.length);
console.log('  Type:', typeof currency);

// Check if currency appears in XML
const hasCurrencyElement = xml.includes('<currency>RON</currency>');
const hasCurrencyAttribute = xml.includes('currency="RON"');

console.log('  As element:', hasCurrencyElement ? '✅' : '❌');
console.log('  As attribute:', hasCurrencyAttribute ? '✅' : '❌');

// Output the complete XML for review
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('COMPLETE XML:');
console.log(xml);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
```

**Console Output:**
```
Currency Verification:
  Value: RON
  Length: 3
  Type: string
  As element: ✅
  As attribute: ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE XML:
<?xml version="1.0" encoding="utf-8"?>
<order type="card" id="ORDER-123" timestamp="1738171234567">
  <currency>RON</currency>
  <signature>ABCD-1234-EFGH-5678</signature>
  ...
</order>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🧪 Test Decryption (For Netopia Support)

If Netopia support wants to verify our encryption, they can use this process:

### Decryption Steps (Netopia's Side)

```javascript
// 1. Decode base64 env_key
const encryptedAesKey = Buffer.from(envKey, 'base64');

// 2. Decrypt AES key using their RSA private key
const aesKey = crypto.privateDecrypt(
  {
    key: netopiaPrivateKey,
    padding: crypto.constants.RSA_PKCS1_PADDING
  },
  encryptedAesKey
);

// 3. Decode base64 data
const encryptedDataWithIV = Buffer.from(data, 'base64');

// 4. Extract IV (first 16 bytes)
const iv = encryptedDataWithIV.slice(0, 16);
const encryptedXml = encryptedDataWithIV.slice(16);

// 5. Decrypt XML using AES
const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
let xml = decipher.update(encryptedXml, null, 'utf8');
xml += decipher.final('utf8');

// 6. Parse XML
console.log('Decrypted XML:', xml);
```

---

## 📋 Sample Data for Testing

### Test Order Details

```javascript
const testOrder = {
  orderId: "ORDER-1738171234567",
  amount: 150.00,
  currency: "RON",
  customerName: "Ion Popescu",
  customerEmail: "ion.popescu@example.com",
  customerPhone: "+40712345678",
  customerAddress: "Strada Exemplu 123, București",
  posSignature: "ABCD-1234-EFGH-5678-IJKL-9012",
  timestamp: 1738171234567
};
```

### Expected XML Output

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
        <address>Strada Exemplu 123, București</address>
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
        <address>Strada Exemplu 123, București</address>
        <city></city>
        <county></county>
        <zip_code></zip_code>
        <country>Romania</country>
      </shipping>
    </contact_info>
  </invoice>
</order>
```

---

## 🔧 Libraries Used

```json
{
  "dependencies": {
    "node:crypto": "Built-in Node.js crypto module",
    "node:buffer": "Built-in Node.js buffer module",
    "node-forge": "1.3.1"
  }
}
```

### Import Statements

```javascript
import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import forge from 'npm:node-forge@1.3.1';
```

---

## ✅ What We've Verified

| Item | Status | Notes |
|------|--------|-------|
| XML is well-formed | ✅ | Valid UTF-8 XML syntax |
| Currency in element | ✅ | `<currency>RON</currency>` |
| Currency in attribute | ✅ | `currency="RON"` |
| Currency length | ✅ | Exactly 3 characters |
| XML escaping | ✅ | All special chars escaped |
| AES encryption | ✅ | No errors, 256-bit key |
| IV prepending | ✅ | First 16 bytes of data |
| RSA encryption | ✅ | No errors, PKCS#1 padding |
| Base64 encoding | ✅ | Both env_key and data |
| Config currency | ✅ | "RON" in config object |
| Request headers | ✅ | Correct Content-Type |
| API endpoint | ✅ | Sandbox URL correct |

---

## ❌ Current Issue

**Error:** `"order.currency < 3"`  
**Status:** Despite all verifications showing currency = "RON" (3 chars), Netopia's API is returning a validation error.

**Possible Causes:**
1. Currency might need to be in a different location in the XML
2. XML might not be decrypting correctly on Netopia's side
3. Character encoding issue during encryption/decryption
4. Config currency conflicting with XML currency
5. XML structure doesn't match Netopia's expected schema

**Next Steps:**
- Contact Netopia support with this documentation
- Request XML schema/example from Netopia
- Verify public key is correct
- Test with Netopia's sandbox credentials

---

**Last Updated:** January 29, 2026  
**File:** `/supabase/functions/server/index.tsx`  
**Endpoints:** `/make-server-bbc0c500/netopia/init` and `/make-server-bbc0c500/netopia/initiate-payment`
