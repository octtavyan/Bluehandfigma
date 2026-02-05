# 🧪 Test IPN Endpoint

## ✅ Config File Created

Created `/supabase/config.toml` with:
```toml
[functions.make-server-bbc0c500]
verify_jwt = false
```

This **should** disable JWT verification for the function.

---

## 🧪 Test 1: Direct cURL Test (No Auth)

Run this command to test if the endpoint accepts requests without JWT:

```bash
curl -X POST \
  "https://iwfbqtvgrrzlxotaqauu.supabase.co/functions/v1/make-server-bbc0c500/netopia/ipn-public" \
  -H "Content-Type: application/json" \
  -d '{
    "order": {
      "ntpID": "TEST123",
      "status": 1
    },
    "payment": {
      "amount": 100.00,
      "currency": "RON"
    }
  }'
```

### Expected Results:

**✅ If config works:**
```json
{"success": true, "queued": true}
```

And you'll see in logs:
```
🔔 [PUBLIC IPN] Received Netopia IPN notification
⚠️ [PUBLIC IPN] No Netopia JWT provided in request
📦 [PUBLIC IPN] Payload: {...}
✅ [PUBLIC IPN] Queued for processing
```

**❌ If config doesn't work:**
```json
{"msg": "Missing authorization header"}
```

Status: 401

---

## 🧪 Test 2: With Netopia-Style JWT

Test with a JWT in the Authorization header (like Netopia sends):

```bash
curl -X POST \
  "https://iwfbqtvgrrzlxotaqauu.supabase.co/functions/v1/make-server-bbc0c500/netopia/ipn-public" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake.netopia.jwt.token" \
  -d '{
    "order": {
      "ntpID": "TEST456",
      "status": 1
    }
  }'
```

### Expected Results:

**✅ If config works:**
- Should accept the request
- JWT validation in our code will fail (expected)
- But the IPN will still be queued

Logs should show:
```
🔔 [PUBLIC IPN] Received Netopia IPN notification
🔐 [PUBLIC IPN] Netopia JWT present: YES
❌ [PUBLIC IPN] Netopia JWT validation FAILED
⚠️ [PUBLIC IPN] Continuing despite JWT validation failure
✅ [PUBLIC IPN] Queued for processing
```

---

## 🧪 Test 3: Real Netopia Payment

If the above tests work, try a real payment:

1. Go to your site
2. Add product to cart
3. Proceed to checkout
4. Complete payment
5. Check logs immediately

---

## 📊 Check the Logs

Go to Supabase Dashboard:
1. **Edge Functions** → `make-server-bbc0c500`
2. **Logs** tab
3. Look for `[PUBLIC IPN]` messages

---

## ⚠️ If Config Doesn't Work

The `config.toml` file might not be deployed by Figma Make. In that case:

### Option 1: Deploy Manually via Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref iwfbqtvgrrzlxotaqauu

# Deploy function with config
supabase functions deploy make-server-bbc0c500
```

### Option 2: Use Webhook Proxy

If the config approach doesn't work, we'll switch to webhook.site proxy.

---

## 🎯 Next Steps

1. **Wait 1-2 minutes** for config to deploy (if Figma Make deploys it)
2. **Run Test 1** (cURL without auth)
3. **Check logs** for `[PUBLIC IPN]` messages
4. **Report results** so we know if config worked!

---

Date: February 5, 2026
Status: Config file created, awaiting test
Expected: Either works or we use webhook proxy
