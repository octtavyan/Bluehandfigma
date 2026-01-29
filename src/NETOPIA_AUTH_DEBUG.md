# Netopia Authentication Debugging Guide

## 🔴 Current Issue
Getting 400/500 errors when trying to initiate payments - likely **authentication/encryption** errors, NOT currency errors.

## 🔍 Root Cause Analysis

The error message `"currency < 3"` is a **symptom**, not the cause. When Netopia can't:
1. Authenticate our request properly
2. Decrypt the encrypted XML data with the public key

...it receives corrupted/invalid XML, which fails validation on the currency field.

## ✅ What We Know Works

Netopia support confirmed on **Jan 29, 2026**:
> "Folosind apikey-ul si semnatura dvs. am obtinut payment URL si am fost redirectionati in pagina de plata."

**Translation**: Using your API key and signature, we obtained a payment URL and were redirected to the payment page.

**Important**: They tested in THEIR environment (likely Postman/curl), not through our application code.

## 🔐 Authentication Requirements

### Sandbox Mode (Testing)
- **Required**: API Key (from NETOPIA_API_KEY environment variable)
- **Required**: POS Signature
- **Required**: Public Key (for encryption)
- **Header Format**: `Authorization: <api-key>` (raw key, no "Bearer")

### Live Mode (Production)
- **Not Required**: API Key
- **Required**: POS Signature  
- **Required**: Public Key (for encryption)

## 📋 Checklist for Debugging

### 1. Verify Credentials Are Saved
```bash
# Go to: /admin/settings?tab=netopia
# Check that these fields are filled and SAVED:
- POS Signature: XXXX-XXXX-XXXX-XXXX-XXXX
- Public Key: -----BEGIN PUBLIC KEY-----...
- Environment: Should be "TEST" (not LIVE) for sandbox
```

### 2. Verify Environment Variables
```bash
# These should be set in Supabase:
NETOPIA_API_KEY=<your-sandbox-api-key>
NETOPIA_POS_SIGNATURE=<your-pos-signature>
```

### 3. Check Supabase Edge Function Logs

Look for these log lines:
```
🔐 Using API Key authentication (sandbox mode)
🔑 API Key preview: <first-20-chars>...
📤 Making POST request to: https://secure.sandbox.netopia-payments.com/payment/card/start
📥 Netopia response status: <status>
```

**Authentication Success**: Status 200 or 302
**Authentication Failure**: Status 401, 403, or 400 with authentication-related error

### 4. Common Error Patterns

| Status | Message | Likely Cause | Solution |
|--------|---------|--------------|----------|
| 401 | Unauthorized | Wrong API Key | Check NETOPIA_API_KEY env var |
| 403 | Forbidden | Wrong POS Signature | Check POS Signature in admin |
| 400 | currency < 3 | Decryption failed (wrong public key) | Verify Public Key in admin |
| 400 | Invalid signature | Wrong POS Signature in XML | Check POS Signature matches |
| 500 | Internal error | Server-side encryption failed | Check public key format |

## 🛠️ Step-by-Step Fix Process

### Step 1: Get Fresh Credentials from Netopia Dashboard

1. Log into https://admin.sandbox.netopia-payments.com
2. Go to "Security & API" or "Integration" section
3. Copy these EXACTLY:
   - **API Key** (for sandbox authentication)
   - **POS Signature** (XXXX-XXXX-XXXX-XXXX-XXXX format)
   - **Public Key** - Click "DOWNLOAD" button, open file, copy ONLY the part that starts with `-----BEGIN PUBLIC KEY-----` (NOT the certificate)

### Step 2: Save to Admin Panel

1. Go to `/admin/settings?tab=netopia`
2. Paste the credentials
3. Make sure **TEST mode** is enabled (toggle should show "TEST")
4. Click **"Save Settings"** button
5. Click **"Test Connection"** button - should show success

### Step 3: Verify Environment Variables

The API Key MUST be in Supabase environment:
1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Verify `NETOPIA_API_KEY` is set
3. Verify `NETOPIA_POS_SIGNATURE` is set

### Step 4: Test Payment Flow

1. Go to `/netopia-test` page
2. Use pre-filled test data
3. Click "Initialize Payment"
4. Check browser console AND Supabase logs
5. Look for authentication-related errors

## 🔬 Enhanced Debugging (Current Version)

The latest code now logs:
- ✅ API Key being used (first 20 chars)
- ✅ Request headers sent to Netopia
- ✅ Response headers from Netopia
- ✅ Detailed error messages with authentication hints
- ✅ Full error JSON parsing

## 🚨 If Still Failing

### Possibility 1: Wrong Public Key Format
The public key might be:
- A certificate instead of a public key
- Missing header/footer
- Has extra whitespace

**Solution**: Re-download from Netopia, make sure it says `BEGIN PUBLIC KEY` not `BEGIN CERTIFICATE`

### Possibility 2: API Key Not Set
The environment variable might not be loaded.

**Solution**: Verify in Supabase dashboard, redeploy edge functions if needed

### Possibility 3: Sandbox Environment Changed
Netopia might have changed sandbox API requirements.

**Solution**: Contact Netopia support to confirm current authentication method

## 📞 Contact Netopia Support

If authentication continues to fail, ask them:
1. "What is the exact format for the Authorization header in sandbox mode?"
2. "Do we send the API key as `Authorization: <key>` or `Authorization: Bearer <key>`?"
3. "Can you test our encrypted payload again and show us the decrypted XML you receive?"

## ✅ Success Indicators

You know authentication is working when:
- Status code is 200 or 302 (redirect)
- Response contains `paymentUrl` or `redirect_url`
- No 401/403 errors
- Error messages (if any) are about payment details, not authentication

## 📊 Current Code Changes

Latest updates (in this session):
1. ✅ Added comprehensive authentication logging
2. ✅ Added response header logging
3. ✅ Added specific 401/403 error handling
4. ✅ Increased error message length (500 chars vs 200)
5. ✅ Added JSON error parsing for better details

Try a payment now and check the Supabase logs for the new debug output!
