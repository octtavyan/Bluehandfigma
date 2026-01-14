# Edge Function Debugging Guide

## What Was Done

I've created a comprehensive diagnostics page to help debug the "Http: connection closed before message completed" errors in your Supabase Edge Function.

### New Files Created

1. **`/pages/admin/AdminEdgeFunctionTestPage.tsx`** - A complete diagnostic dashboard that tests all Edge Function endpoints
2. **Route added** - Accessible at `/admin/edge-function-test`
3. **Navigation link** - Added to admin sidebar (visible only to full-admin users)

## How to Use the Diagnostics Page

### Access the Page

1. Log into the admin panel as a full-admin user
2. Navigate to `/admin/edge-function-test` OR click "Test Server" in the sidebar
3. Click "Run All Diagnostics" button

### What It Tests

The page runs 6 comprehensive tests:

1. **Health Check** - Tests if the Edge Function is running at all
2. **Database Connection** - Verifies the KV store and database connectivity
3. **Resend API Configuration** - Checks if email API is properly configured
4. **KV Store Get** - Tests reading from the key-value store
5. **KV Store Set** - Tests writing to the key-value store
6. **Cart System** - Tests the cart load endpoint

### Understanding Results

Each test shows:
- ✅ **Green** = Test passed
- ❌ **Red** = Test failed
- **Response time** in milliseconds
- **Detailed error messages** if the test fails
- **Expandable details** showing the full response

### Client-Side Logs

The right panel shows real-time client-side logs:
- When each test starts
- Success/failure status
- Response times
- Error messages

## Debugging Workflow

### If Health Check Fails

This means the Edge Function is not running or crashed during startup.

**Next Steps:**
1. Go to Supabase Dashboard → Edge Functions → server → Logs
2. Look for startup logs:
   ```
   🚀 Server starting - Step 1: Imports successful
   🚀 Server starting - Step 2: All imports completed
   🚀 Server starting - Step 3: Hono app created
   ✅ Server initialization complete - ready to serve requests
   ```
3. If you don't see all 4 log messages, the server crashed during initialization
4. The logs will show exactly where it crashed

**Common Causes:**
- Missing environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- Syntax error in server code
- Import error in dependencies

### If Database Connection Fails

**Next Steps:**
1. Verify environment variables are set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
2. Check the kv_store table exists
3. Verify RLS policies allow service role access

### If Resend API Configuration Fails

**Next Steps:**
1. Add `RESEND_API_KEY` to Supabase environment variables
2. Get your API key from https://resend.com/api-keys
3. Ensure the key starts with `re_`

## Current Server Configuration

Your Edge Function has **5 layers of error handling**:

### Layer 1: Environment Variable Validation
```typescript
console.log('🔍 Environment Variables Check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasServiceRoleKey: !!supabaseServiceKey,
  // etc...
});
```

### Layer 2: Import Logging
```typescript
console.log('🚀 Server starting - Step 1: Imports successful');
console.log('🚀 Server starting - Step 2: All imports completed');
```

### Layer 3: Global Error Handler
```typescript
app.onError((err, c) => {
  console.error('🔥 Server Error:', err);
  console.error('Stack trace:', err.stack);
  return c.json({ error: err.message }, 500);
});
```

### Layer 4: Route-Level Try-Catch
Each route has its own try-catch block with detailed error logging.

### Layer 5: Wrapper Error Handler
```typescript
const handler = async (request: Request) => {
  try {
    return await app.fetch(request);
  } catch (error) {
    console.error('🔥 Unhandled error in server:', error);
    return new Response(...);
  }
};
```

## Viewing Supabase Logs

To see what's happening server-side:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Edge Functions** in the left sidebar
4. Click on **server** function
5. Click **Logs** tab
6. Look for the startup sequence and any error messages

## Expected Startup Logs

A healthy server startup should show:

```
🚀 Server starting - Step 1: Imports successful
🔍 Environment Variables Check: {
  hasSupabaseUrl: true,
  supabaseUrlLength: 35,
  hasServiceRoleKey: true,
  serviceRoleKeyLength: 200+,
  hasAnonKey: true,
  anonKeyLength: 200+,
  hasResendKey: true,
  resendKeyLength: 40+
}
🚀 Server starting - Step 2: All imports completed
🚀 Server starting - Step 3: Hono app created
✅ Server initialization complete - ready to serve requests
📡 Registered routes: [number]
```

## SQL Commands Reference

You mentioned running:
```sql
UPDATE orders SET payment_status = 'unpaid' WHERE payment_status IS NULL;
```

This was successful and cleaned up NULL values. ✅

## Next Steps After Running Diagnostics

1. **Run the diagnostics page** to see which specific endpoints are failing
2. **Check Supabase Edge Function logs** to see server-side errors
3. **Verify all environment variables** are set correctly
4. **Check database tables** exist and have proper permissions
5. **Review the detailed error messages** in the diagnostics results

## Environment Variables Checklist

Make sure these are set in Supabase Dashboard → Edge Functions → Settings → Secrets:

- ✅ `SUPABASE_URL` - Already provided
- ✅ `SUPABASE_ANON_KEY` - Already provided
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Already provided
- ✅ `RESEND_API_KEY` - Already provided
- ❓ Check they all have valid values (no placeholders)

## Common "Connection Closed" Causes

1. **Server crashes during import** - Check import statements
2. **Environment variable missing** - Check all required vars are set
3. **Database connection fails** - Verify credentials
4. **Timeout during startup** - Server takes too long to initialize
5. **Memory/resource limits** - Edge Function runs out of resources

## Tips

- The diagnostics page can be run multiple times
- Compare successful vs failed test results
- Export test results for debugging
- Share the detailed error messages when asking for help

---

Created: December 26, 2024
Status: Ready to use
Access: `/admin/edge-function-test` (full-admin only)
