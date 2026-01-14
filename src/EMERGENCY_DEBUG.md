# 🚨 EMERGENCY DEBUG GUIDE

## The Problem
The error "Http: connection closed before message completed" is a **low-level Deno runtime error**. This means the Edge Function is crashing **BEFORE** it can even process a request.

## Most Likely Causes

### 1. **Environment Variables Missing** ❌
The edge function REQUIRES these environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `RESEND_API_KEY`

### 2. **Edge Function Not Deployed** ❌
The code changes need to be deployed to Supabase

## ✅ STEP-BY-STEP FIX

### Step 1: Check Edge Function Logs
1. Go to: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/functions`
2. Click on `make-server-bbc0c500` function
3. Click on **"Logs"** tab
4. Look for the console.log messages:
   - "🚀 Server starting - Step 1: Imports successful"
   - "🔍 Environment Variables Check"
   - "🚀 Server starting - Step 2: All imports completed"
   - "🚀 Server starting - Step 3: Hono app created"

### Step 2: Verify Environment Variables
1. Go to: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/functions`
2. Check that ALL these variables exist:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`

### Step 3: Redeploy the Edge Function
The changes we just made need to be deployed. In Figma Make, the deployment should be automatic, but you may need to:
1. Refresh the page
2. Click "Deploy" if there's a deploy button
3. Wait for the deployment to complete

### Step 4: Test the Endpoints

Once deployed, test these URLs in your browser:

**Health Check:**
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-bbc0c500/health
```

**Environment Check:**
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-bbc0c500/test-db
```

## 🔍 What the Logs Will Tell You

### If you see "Step 1":
✅ Basic imports work
❌ Problem is with kv_store or email-templates import

### If you see "Step 2":
✅ All imports work
❌ Problem is with creating the Hono app

### If you see "Step 3":
✅ Server initialized successfully
❌ Problem is with a specific route or request

### If you see NOTHING:
❌ Edge Function didn't deploy
❌ OR Environment variables are completely missing
❌ OR There's a syntax error preventing execution

## 🎯 Quick Test SQL

Run this in your Supabase SQL Editor to fix any NULL payment_status values:

```sql
-- Fix NULL payment_status
UPDATE orders 
SET payment_status = 'unpaid' 
WHERE payment_status IS NULL;

-- Verify fix
SELECT 
  COUNT(*) as total_orders,
  COUNT(payment_status) as orders_with_payment_status,
  COUNT(*) - COUNT(payment_status) as null_payment_statuses
FROM orders;
```

The result should show:
- `null_payment_statuses = 0` ✅

## 🆘 If Nothing Works

If you still see the error after all these steps:

1. **Check Browser Console (F12)**
   - Look for network errors
   - Check what URL is being called
   - See if it's a 404, 500, or connection error

2. **Check Edge Function Deployment Status**
   - Go to Supabase Dashboard → Functions
   - Look for any error messages
   - Check deployment history

3. **Simplify the Edge Function**
   - Comment out ALL routes except `/health`
   - See if `/health` works
   - Add back routes one by one to find the problematic one

## 📊 Current Changes Made

1. ✅ Added detailed startup logging
2. ✅ Added environment variable validation in kv_store
3. ✅ Wrapped entire server in error handler
4. ✅ Added individual try-catch to all routes
5. ✅ Updated Database types with all missing columns
6. ✅ Added default values for payment_status

## 🎬 Next Steps

Once you check the logs, you'll know EXACTLY where the issue is:
- If logs show nothing → Deployment issue
- If logs stop at Step 1 → Import issue  
- If logs stop at Step 2 → kv_store issue
- If logs show Step 3 → Request handling issue

Share the log output and we can fix it immediately! 🚀
