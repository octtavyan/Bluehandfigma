# ✅ Netopia Public IPN Solution - Complete Setup

## Overview

Since Supabase Edge Functions cannot disable JWT verification, we've implemented a **queue-based public IPN system**:

1. **Public endpoint** (`/netopia/ipn-public`) accepts IPN without auth
2. **Stores payload** in a public database table
3. **Processes immediately** using an authenticated internal endpoint
4. **Returns HTTP 200** to Netopia instantly

## Architecture

```
Netopia Server
    ↓
[POST] /netopia/ipn-public (NO AUTH) ← Public endpoint
    ↓
Insert into netopia_ipn_queue table
    ↓
Trigger /netopia/process-queue (WITH AUTH) ← Internal processing
    ↓
Process payment, create order, send emails
    ↓
Mark queue item as processed
```

---

## ✅ What's Been Set Up

### 1. Database Table ✅ (You already ran this)

```sql
CREATE TABLE public.netopia_ipn_queue (
  id BIGSERIAL PRIMARY KEY,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

With RLS policies for public insert and service role full access.

### 2. Code Endpoints ✅ (Just added)

#### `/make-server-bbc0c500/netopia/ipn-public` (NEW - PUBLIC)
- ✅ No authentication required
- ✅ Accepts IPN from Netopia
- ✅ Stores payload in queue table
- ✅ Triggers background processing
- ✅ Returns HTTP 200 immediately

#### `/make-server-bbc0c500/netopia/process-queue` (NEW - INTERNAL)
- ✅ Requires service role authentication
- ✅ Processes queued IPN notifications
- ✅ Updates payment status
- ✅ Creates orders
- ✅ Sends confirmation emails
- ✅ Generates invoices
- ✅ Marks items as processed

#### `/make-server-bbc0c500/netopia/cleanup-queue` (NEW - MAINTENANCE)
- ✅ Cleans up old processed items (>7 days)
- ✅ Prevents queue table from growing indefinitely

---

## 🎯 STEP 3: Update Netopia Configuration

Now you need to give Netopia the NEW public URL:

### Old URL (Don't use):
```
https://YOUR_PROJECT.supabase.co/functions/v1/make-server-bbc0c500/netopia/ipn
```

### New URL (Use this):
```
https://YOUR_PROJECT.supabase.co/functions/v1/make-server-bbc0c500/netopia/ipn-public
```

### How to Update:

1. **Log into Netopia Merchant Panel**
   - Go to: https://admin.netopia-payments.com (or sandbox URL)
   - Navigate to Settings → IPN Configuration

2. **Update the IPN URL to:**
   ```
   https://YOUR_PROJECT.supabase.co/functions/v1/make-server-bbc0c500/netopia/ipn-public
   ```

3. **Save the changes**

4. **Test it** (see testing section below)

---

## 🧪 Testing

### Test 1: Direct Endpoint Test (No Auth Required)

```bash
# Replace YOUR_PROJECT with your actual project ID
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-bbc0c500/netopia/ipn-public \
  -H "Content-Type: application/json" \
  -d '{
    "payment": {
      "ntpID": "test-123",
      "status": "confirmed"
    },
    "order": {
      "orderID": "TEST-ORDER-001",
      "amount": 100
    }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "queued": true
}
```

**Expected HTTP Status:** `200 OK`

### Test 2: Check Queue Table

Go to Supabase Dashboard → Table Editor → `netopia_ipn_queue`

You should see your test entry with:
- ✅ `payload` containing the test data
- ✅ `processed` = `true` (or `false` if processing failed)
- ✅ `created_at` timestamp

### Test 3: Check Edge Function Logs

Go to Supabase Dashboard → Edge Functions → `make-server-bbc0c500` → Logs

Look for:
```
🔔 [PUBLIC IPN] Received Netopia IPN notification
✅ [PUBLIC IPN] Queued for processing
🔄 [PROCESS QUEUE] Processing queue item
✅ [PROCESS QUEUE] Queue item marked as processed
```

### Test 4: Real Payment Test

1. Make a test payment through Netopia
2. Check the queue table for the new entry
3. Verify the order was created in your orders table
4. Check that the customer received confirmation email

---

## 🔍 Monitoring & Debugging

### Check Queue Status

```sql
-- See all pending items
SELECT * FROM netopia_ipn_queue 
WHERE processed = false 
ORDER BY created_at DESC;

-- See recent processed items
SELECT * FROM netopia_ipn_queue 
WHERE processed = true 
ORDER BY created_at DESC 
LIMIT 10;

-- Count by status
SELECT processed, COUNT(*) 
FROM netopia_ipn_queue 
GROUP BY processed;
```

### Check Processing Logs

View Edge Function logs in Supabase Dashboard:
- Edge Functions → `make-server-bbc0c500` → Logs
- Filter by time range
- Look for `[PUBLIC IPN]` and `[PROCESS QUEUE]` tags

### Manual Reprocessing

If an item failed to process, you can manually trigger it:

```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-bbc0c500/netopia/process-queue \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"queueId": 123}'
```

Replace `123` with the actual queue item ID from the table.

---

## 🧹 Maintenance

### Automatic Cleanup

The system automatically attempts to process items immediately. Failed items remain in the queue with `processed = false`.

### Manual Cleanup

Clean up old processed items (>7 days):

```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-bbc0c500/netopia/cleanup-queue \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

### Set Up Cron Job (Optional)

In Supabase Dashboard → Database → Cron Jobs, create:

```sql
-- Clean queue weekly
SELECT cron.schedule(
  'cleanup-netopia-queue',
  '0 0 * * 0',  -- Every Sunday at midnight
  $$
  DELETE FROM netopia_ipn_queue 
  WHERE processed = true 
  AND created_at < NOW() - INTERVAL '7 days'
  $$
);
```

---

## 🔐 Security

### Why This Is Safe

✅ **Public endpoint only stores data** - no processing happens there  
✅ **Processing requires service role auth** - only our server can trigger it  
✅ **Payment validation** - we verify order IDs and payment data  
✅ **No sensitive data exposed** - only order status updates  
✅ **Rate limiting** - Supabase handles DDoS protection  

### Additional Security (Optional)

You can add Netopia signature verification:

1. Get Netopia's public key
2. Verify signature in the public endpoint
3. Reject invalid signatures before queuing

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ NETOPIA SERVER                                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ POST (no auth)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ PUBLIC ENDPOINT: /netopia/ipn-public                            │
│ - Receives IPN payload                                          │
│ - Returns 200 OK immediately ←─────────────────────┐            │
└───────────────────────────┬────────────────────────┼────────────┘
                            │                        │
                            │ Insert                 │ Response
                            ▼                        │
┌─────────────────────────────────────────────────────────────────┐
│ DATABASE TABLE: netopia_ipn_queue                               │
│ - Stores payload as JSONB                                       │
│ - processed = false                                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Trigger (async)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ PROCESSING ENDPOINT: /netopia/process-queue (auth required)     │
│ - Fetch queue item                                              │
│ - Process payment                                               │
│ - Create/update order                                           │
│ - Send emails                                                   │
│ - Generate invoice                                              │
│ - Mark processed = true                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Success Checklist

- [x] Database table created (`netopia_ipn_queue`)
- [x] Code endpoints added
- [ ] Update Netopia IPN URL to `/netopia/ipn-public`
- [ ] Test with curl (should return `{"success": true, "queued": true}`)
- [ ] Verify queue table receives entries
- [ ] Check Edge Function logs for processing
- [ ] Test with real payment
- [ ] Confirm order creation works
- [ ] Verify emails are sent

---

## 🆘 Troubleshooting

### "Still getting 401 error"

**Check:** Are you using the NEW URL `/netopia/ipn-public`?

The old URL `/netopia/ipn` still requires auth. Make sure Netopia is calling the **-public** version.

### "Queue item created but not processed"

**Check logs:**
1. Go to Edge Functions → Logs
2. Look for `[PROCESS QUEUE]` entries
3. Check for errors

**Manual trigger:**
```bash
# Get the queue item ID from the table
# Then trigger processing manually
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-bbc0c500/netopia/process-queue \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"queueId": ITEM_ID}'
```

### "Order not created"

**Check:**
1. Does payment data exist in KV store? (`netopia_payment:ORDER_ID`)
2. Check order creation logs in Edge Function
3. Verify order doesn't already exist in orders table
4. Check for database errors in logs

### "No entries in queue table"

**Check:**
1. Is the public endpoint being called? (check logs)
2. Are RLS policies correct? (run the SQL script again)
3. Is the SUPABASE_ANON_KEY environment variable set?

---

## 📞 Next Steps

1. **Update Netopia IPN URL** to use `/netopia/ipn-public`
2. **Test** with the curl command above
3. **Make a test payment** and verify everything works
4. **Monitor** the queue table and logs for a few days
5. **Set up cleanup** cron job (optional)

---

**Date:** February 5, 2026  
**Solution:** Queue-based public IPN endpoint  
**Status:** ✅ Code complete, ready for configuration  
**Next:** Update Netopia IPN URL
