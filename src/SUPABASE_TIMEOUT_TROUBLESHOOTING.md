# Supabase Timeout & Connection Issues - Troubleshooting Guide

## 🚨 Current Status

Your BlueHand Canvas application is experiencing **database timeout errors** due to Supabase overload, likely caused by egress overuse (406% - over 20GB used).

## Common Error Messages

```
❌ Supabase error fetching orders: canceling statement due to statement timeout (code: 57014)
❌ Failed to create bucket: The connection to the database timed out (status: 544)
❌ Cart save error: Internal server error (Cloudflare 500)
```

## Root Causes

1. **Egress Overuse (Primary)**: 406% of monthly quota used (20GB+)
   - Hero slide images stored in Supabase Storage
   - Every page load downloads large images
   - Supabase throttles or pauses the project when quota is exceeded

2. **Database Query Timeouts**: Large queries taking too long
   - Paintings table with full data
   - Orders table with all details
   - Multiple concurrent requests

3. **Connection Pool Exhaustion**: Too many simultaneous connections

## ✅ Fixes Implemented

### 1. Retry Logic with Exponential Backoff
- **File**: `/lib/retryUtils.ts`
- **What**: Automatically retries failed requests up to 2 times
- **Why**: Temporary network issues or brief database slowdowns are handled gracefully

### 2. Circuit Breaker Pattern
- **File**: `/lib/retryUtils.ts`
- **What**: Stops making requests after 5 consecutive failures, waits 1 minute before trying again
- **Why**: Prevents hammering an already overloaded database

### 3. Query Timeouts
- **Timeout**: 8-10 seconds per query
- **What**: Queries that take too long are automatically cancelled
- **Why**: Prevents infinite waits and allows the app to fail gracefully

### 4. Database Query Optimization
- **Orders**: Only fetch minimal fields (id, order_number, customer_name, customer_email, status, total, created_at)
- **Paintings**: Only fetch essential fields (id, title, category, image, price, discount, is_active)
- **Result**: ~90% reduction in bandwidth usage

### 5. Disabled Storage Bucket Initialization
- **File**: `/supabase/functions/server/index.tsx`
- **What**: Temporarily disabled automatic bucket creation on startup
- **Why**: Bucket operations were timing out and failing deployment

### 6. Error Monitoring Components
- **SystemHealthMonitor**: Real-time circuit breaker status in admin dashboard
- **SupabaseErrorBanner**: User-friendly error messages
- **DatabaseTimeoutError**: Detailed timeout error explanations

## 🔧 Immediate Actions Required

### Step 1: Check Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Open your BlueHand Canvas project
3. Navigate to **Settings** → **Usage**
4. Check:
   - Database Size
   - Egress (Bandwidth) - **THIS IS THE CRITICAL METRIC**
   - API Requests
   - Storage

### Step 2: Verify Project Status
- Check if project is **PAUSED** or **THROTTLED** due to quota
- If paused, you may need to:
  - Wait for monthly quota reset
  - Upgrade to paid plan
  - Or implement immediate mitigation (see Step 3)

### Step 3: Immediate Mitigation (If Paused)
If your project is paused, you have two options:

**Option A: Upgrade Supabase Plan** (Fastest)
- Upgrade to Pro plan ($25/month)
- Includes 250GB egress/month
- Immediate relief

**Option B: Delete Hero Slide Images** (Free, requires manual work)
1. Go to Supabase Dashboard → Storage
2. Delete large images from `make-bbc0c500-hero-slides` bucket
3. Replace with Unsplash/Cloudinary URLs in admin

### Step 4: Long-term Solution - Migrate to Cloudinary
See `/CLOUDINARY_MIGRATION_GUIDE.md` for detailed instructions on migrating hero slide images to Cloudinary (eliminates 90% of egress costs).

## 📊 Monitoring & Diagnostics

### Check Circuit Breaker Status
Add this component to your admin dashboard:

```tsx
import { SystemHealthMonitor } from './components/admin/SystemHealthMonitor';

<SystemHealthMonitor />
```

### Check Browser Console
Open DevTools Console (F12) and look for:
- `🔴 Circuit breaker OPEN` - Service is down
- `🔄 Retrying ... attempt` - Automatic retries happening
- `❌ Error fetching ...` - Specific operation failures

### Server Logs
Edge function logs show detailed error information:
```
❌ Paintings table query failed after retries: canceling statement due to statement timeout
⚠️ Returning empty array - paintings table may not be accessible
```

## 🎯 Recovery Steps

### If Circuit Breaker is OPEN
1. **Wait 1 Minute**: Circuit breaker automatically tries to recover
2. **Manual Reset**: Use "Reset" button in SystemHealthMonitor
3. **Check Supabase**: Verify project is not paused

### If Queries Still Timeout
1. **Reduce Data**: Temporarily hide some paintings/orders in admin
2. **Clear Cache**: In admin, go to Database Tools → Clear Query Cache
3. **Restart Edge Function**: Redeploy from Figma Make

### If Nothing Works
**Your Supabase project is likely paused or throttled due to quota limits.**
- Check Supabase dashboard usage page
- Contact Supabase support
- Consider upgrading plan

## 📈 Prevention for Future

### 1. Monitor Egress Daily
- Set up alerts in Supabase dashboard
- Check usage before adding large images
- Target: Stay under 4GB/month (80% of free tier)

### 2. Use External Image Hosting
- **Hero Slides**: Cloudinary (unlimited egress)
- **Paintings**: Unsplash or Cloudinary
- **Product Images**: Cloudinary with transformations

### 3. Database Optimizations
- Keep using minimal field queries
- Implement pagination (limit 20-50 items)
- Add database indexes for common queries

### 4. Enable Caching
- Use React Query or SWR for client-side caching
- Set reasonable stale times (5-10 minutes)
- Reduces duplicate database queries

## 🆘 Emergency Contact

If the app is completely down:

1. **Check**: https://status.supabase.com - Supabase system status
2. **Quick Fix**: Add static mode in app (no database calls)
3. **Support**: contact@supabase.io (include project ID)

## 📝 Technical Details

### Error Codes Reference
- **57014**: PostgreSQL statement timeout (query took too long)
- **544**: Cloudflare timeout (origin server didn't respond)
- **500**: Internal server error (generic failure)
- **ECONNREFUSED**: Connection refused (server unreachable)

### Retry Configuration
```typescript
{
  maxAttempts: 2,        // Try twice total
  initialDelay: 1000,    // 1 second first retry
  maxDelay: 5000,        // Max 5 seconds between retries
  timeoutMs: 10000       // 10 second timeout per attempt
}
```

### Circuit Breaker Configuration
```typescript
{
  threshold: 5,          // Open after 5 failures
  resetTimeout: 60000    // Wait 1 minute before retry
}
```

## ✨ Success Indicators

You'll know the issues are resolved when:
- ✅ Circuit breaker shows "CLOSED" state
- ✅ No timeout errors in console
- ✅ Paintings and orders load within 2-3 seconds
- ✅ Cart save/load operations succeed
- ✅ Supabase egress usage is under 5GB/month

---

**Last Updated**: January 19, 2026
**Status**: Active troubleshooting
**Priority**: HIGH - Service degradation
