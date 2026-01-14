# Edge Function "Connection Closed" Error - Fix Guide

## The Issue

You're seeing this error:
```
Http: connection closed before message completed
```

**This means the Edge Function is crashing immediately on startup, before it can even respond to requests.**

## Root Cause

Most likely one of these:
1. ❌ **Supabase Free Plan quota exceeded** (most common!)
2. ❌ Edge Function not deployed
3. ❌ Import error in the code
4. ❌ Environment variables missing

## Step-by-Step Fix

### Step 1: Check Supabase Quota ⚠️

1. Go to https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/settings/billing
2. Check the **Usage** tab
3. Look for any red indicators showing exceeded quotas

**If quota is exceeded:**
- Your free plan limits have been hit
- Edge Functions won't run until you upgrade OR next billing cycle
- **Solution:** Upgrade to Pro ($25/month) OR wait for quota reset

### Step 2: Verify Edge Function is Deployed 📤

1. Go to https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/functions
2. Look for a function called **`make-server-bbc0c500`**
3. Check deployment status

**If not deployed:**
1. You need to deploy the Edge Function manually
2. Copy the contents of `/supabase/functions/server/index.tsx`
3. Paste into Supabase Dashboard → Edge Functions → Create/Edit function
4. Deploy

### Step 3: Check Supabase Edge Function Logs 📋

**This is the most important step!**

1. Go to https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/functions
2. Click on **`make-server-bbc0c500`** (or your function name)
3. Click on **Logs** tab
4. Look for any error messages

**Common log errors:**

| Error Message | Solution |
|--------------|----------|
| "Quota exceeded" | Upgrade plan or wait for reset |
| "Module not found" | Check import statements |
| "Environment variable undefined" | Add missing secrets |
| No logs at all | Function not deployed |

### Step 4: Verify Environment Variables 🔐

1. Go to Supabase Dashboard → Settings → Edge Functions
2. Check these secrets exist:
   - `SUPABASE_URL` (usually auto-set)
   - `SUPABASE_SERVICE_ROLE_KEY` (usually auto-set)
   - `RESEND_API_KEY` (you must add this manually)

### Step 5: Test the Minimal Edge Function 🧪

I've created an ultra-minimal Edge Function that should work. Deploy it:

1. Copy `/supabase/functions/server/index.tsx` from this project
2. Go to Supabase Dashboard → Edge Functions
3. Create/update the `make-server-bbc0c500` function
4. Deploy
5. Wait 30 seconds for deployment
6. Go to `/admin/edge-function-test` in your app
7. Click "Run All Diagnostics"

**Expected Results:**
- ✅ Health Check: Should pass (200 OK)
- ✅ Quota Status: Should pass (200 OK)
- ✅ Cart Save: Should pass (200 OK)
- ✅ Cart Load: Should pass (200 OK)
- ✅ Cart Clear: Should pass (200 OK)

### Step 6: Manual Health Check 🏥

Open this URL in your browser:
```
https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Edge Function is running",
  "timestamp": "2025-12-26T..."
}
```

**If you get:**
- ❌ "Connection closed" → Check quota and logs
- ❌ 404 Not Found → Function not deployed
- ❌ CORS error → Normal from browser, try from Postman
- ✅ JSON response → Function is working!

## What I Fixed in the Code

### Changes Made:

1. **Removed all startup imports** - Supabase client is now lazy-loaded only when needed
2. **Simplified to bare minimum** - Only essential endpoints
3. **Better error handling** - All errors are caught and logged
4. **Explicit Hono version** - Using `npm:hono@4.3.11` to avoid version conflicts
5. **No logger middleware** - Removed to reduce startup overhead

### Current Edge Function Endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check - always works |
| `/quota-status` | GET | Check if database is available |
| `/cart/save` | POST | Save cart to database |
| `/cart/load/:id` | GET | Load cart from database |
| `/cart/clear/:id` | DELETE | Delete cart from database |
| `/send-test-email` | POST | Test Resend email service |

## Quick Diagnosis Commands

### Check if deployed:
```bash
curl https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500/health
```

### Check quota status:
```bash
curl https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500/quota-status \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## If Nothing Works

### Nuclear Option: Recreate Edge Function

1. Delete the existing Edge Function in Supabase Dashboard
2. Create a new one called `make-server-bbc0c500`
3. Copy paste the entire contents of `/supabase/functions/server/index.tsx`
4. Deploy
5. Wait 1 minute
6. Test `/health` endpoint

### Alternative: Use Different Storage

If Edge Functions keep failing:
- **Switch to localStorage** for cart storage (fast, but client-side only)
- **Use Supabase Database directly** from frontend (skip Edge Function)
- **Consider different backend** (Railway, Vercel Functions, etc.)

## Check Your Work

Run through this checklist:

- [ ] Checked Supabase billing/usage page for quota
- [ ] Viewed Edge Function logs in Supabase Dashboard
- [ ] Confirmed function is deployed
- [ ] Environment variables are set
- [ ] `/health` endpoint returns 200 OK
- [ ] Edge Function test page shows all green
- [ ] Cart operations work in the actual app

## Still Stuck?

If the Edge Function still won't start:

1. **Screenshot the Supabase logs** - This will show exactly what's failing
2. **Check billing** - Confirm you're not over quota
3. **Try Pro plan trial** - Supabase offers free trials of Pro plan
4. **Contact Supabase support** - They can check backend issues

## Important URLs

- **Edge Function Dashboard:** https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/functions
- **Edge Function Logs:** Click your function → Logs tab
- **Billing/Usage:** https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/settings/billing
- **Health Check:** https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500/health

---

**Status:** Edge Function code is fixed and minimal. Issue is likely quota or deployment.
**Next Action:** Check Supabase dashboard logs and quota immediately!
