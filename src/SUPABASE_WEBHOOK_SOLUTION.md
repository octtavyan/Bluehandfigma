# 🎯 REAL SOLUTION: Bypass Edge Functions Completely

## The Problem
Supabase Edge Functions CANNOT be made public - they always require JWT auth in the Authorization header. Since Netopia sends THEIR JWT, not yours, it fails at the platform level before your code runs.

## ✅ The Solution: Use Supabase Database Webhooks

Database webhooks are TRULY public - no JWT required!

### Architecture:

```
Netopia IPN → Supabase Database Webhook (PUBLIC)
                        ↓
              Insert into ipn_queue table
                        ↓
              Database trigger fires
                        ↓
              Calls Edge Function internally
                        ↓
              Processes order
```

---

## 📝 Implementation Steps

### Step 1: Enable Database Webhooks

Go to Supabase Dashboard:
1. **Project Settings** → **API** → **Database Webhooks**
2. Click **Enable Webhooks**

### Step 2: Create the Webhook

**Webhook Configuration:**
- **Name:** `netopia-ipn-webhook`
- **Table:** `netopia_ipn_queue`
- **Events:** `INSERT`
- **Type:** `HTTP Request`
- **URL:** Your Edge Function URL (for processing)
- **Method:** `POST`
- **Headers:** 
  - `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`
  - `Content-Type: application/json`

### Step 3: Get the Public Webhook URL

After creating, you'll get a PUBLIC URL like:
```
https://PROJECT.supabase.co/database/webhooks/v1/netopia-ipn-webhook
```

This URL is **completely public** - no JWT required!

### Step 4: Update Netopia Configuration

Use THIS URL in all 7 payment initialization functions:

**Change from:**
```typescript
notifyUrl: `https://${projectUrl}/functions/v1/make-server-bbc0c500/netopia/ipn-public?apikey=${anonKey}`
```

**To:**
```typescript
notifyUrl: `https://${projectUrl}/database/webhooks/v1/netopia-ipn-webhook`
```

---

## 🔧 Alternative: Use Supabase REST API with Public Insert

Even simpler - let Netopia POST directly to your database table!

### Step 1: Make Table Publicly Insertable

Create a policy on `netopia_ipn_queue`:

```sql
CREATE POLICY "Allow public insert for IPN"
ON netopia_ipn_queue
FOR INSERT
WITH CHECK (true);  -- Allow anyone to insert
```

### Step 2: Update IPN URL

**Use Supabase's REST API directly:**

```typescript
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const projectUrl = supabaseUrl.replace('https://', '');
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

notifyUrl: `https://${projectUrl}/rest/v1/netopia_ipn_queue?apikey=${anonKey}`
```

Netopia will POST JSON directly to your table!

**This works because:**
- ✅ REST API accepts `?apikey=` query parameter
- ✅ RLS policy allows public inserts
- ✅ No Edge Function = No JWT validation!

### Step 3: Add Headers to Request Body

Netopia needs to send data in this format:

```json
{
  "payload": { /* their IPN data */ },
  "processed": false
}
```

But they'll just send their raw JSON. So we need to wrap it...

**Actually, this won't work** because Netopia sends their own format.

---

## 🎯 BEST SOLUTION: Webhook Proxy Service

Use a webhook proxy that:
1. Accepts Netopia's IPN (truly public)
2. Forwards to your Edge Function with YOUR anon key

### Option A: Use webhook.site Pro

1. Create a webhook at webhook.site
2. Set up forwarding rule:
   - **To:** `https://PROJECT.supabase.co/functions/v1/make-server-bbc0c500/netopia/ipn-public`
   - **Headers:** `Authorization: Bearer YOUR_ANON_KEY`
3. Use webhook.site URL as notifyUrl

### Option B: Use Zapier / Make / n8n

Same concept - free webhook that forwards with auth.

---

## 🚀 SIMPLEST SOLUTION: Deploy a Separate Public Endpoint

Create a SECOND Supabase project just for webhooks:

1. Create new Supabase project: `yourproject-webhooks`
2. Deploy single Edge Function without JWT required
3. That function forwards to main project

**This works because** you control the second project's Edge Function deployment settings!

---

## 🎯 IMMEDIATE FIX: Contact Supabase Support

Ask them: **"How do I create a public webhook endpoint in Edge Functions?"**

They might have a configuration option we don't know about!

---

## 📊 Summary

**Current state:**
- ❌ Edge Functions require JWT in Authorization header
- ❌ Netopia sends THEIR JWT, not yours
- ❌ Platform blocks before code runs

**Options:**
1. ✅ **Database Webhooks** (if available in your plan)
2. ✅ **Webhook proxy service** (webhook.site, Zapier)
3. ✅ **Second Supabase project** (dedicated webhooks)
4. ✅ **Contact Supabase support** (might have solution)
5. ❌ Edge Functions with query param (doesn't work)

**Recommended:**
Start with **Database Webhooks** or **webhook.site** as they're the quickest!

---

Date: February 5, 2026
Status: Edge Functions cannot be made public
Next: Try database webhooks or proxy service
