# Database Timeout Comprehensive Fix

## Problem Identified

The application was experiencing critical database timeout errors (PostgreSQL error code 57014) when fetching orders, despite having less than 20 records. The root causes were:

### 1. **QuotaMonitor Component** - Inefficient Count Queries
**Location:** `/components/admin/QuotaMonitor.tsx`

**Problem:**
```typescript
// ❌ BAD - Tries to fetch all columns including massive JSONB items
const { data: orders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
```

Even with `head: true`, using `select('*')` attempts to process all columns including the `items` JSONB column which contains base64-encoded images, causing timeouts.

**Fix Applied:**
```typescript
// ✅ GOOD - Only counts rows without fetching data
const { count: ordersCount } = await supabase
  .from('orders')
  .select('id', { count: 'exact', head: true });
```

### 2. **Orders Service** - Emergency Limits Were Too Restrictive
**Location:** `/lib/dataService.ts` - `ordersService.getAll()`

**Problem:**
```typescript
// ❌ BAD - Emergency fix that only fetched 10 orders with minimal columns
const { data } = await supabase
  .from('orders')
  .select('id, order_number, customer_name, customer_email, total, status, created_at')
  .limit(10); // No ordering, missing columns
```

**Fix Applied:**
```typescript
// ✅ GOOD - Excludes items JSONB column but fetches all other needed data
const { data } = await supabase
  .from('orders')
  .select('id, order_number, customer_name, customer_email, customer_phone, delivery_address, delivery_city, delivery_county, delivery_postal_code, delivery_option, payment_method, payment_status, subtotal, delivery_cost, total, status, created_at, updated_at, person_type, company_name, cui, reg_com, company_county, company_city, company_address')
  .order('created_at', { ascending: false })
  .limit(100); // Reasonable limit with all columns except items
```

The key insight: The `items` JSONB column contains base64-encoded images and is extremely large. It's now excluded from list queries and only loaded in `getById()` for detail views.

### 3. **Missing Database Indexes**

The timeout errors suggest missing indexes on frequently queried columns.

## Fixes Applied

### ✅ Fixed Files

1. **`/components/admin/QuotaMonitor.tsx`**
   - Changed count queries from `select('*')` to `select('id')`
   - Added error logging for each table count
   - Maintains functionality while drastically reducing query complexity

2. **`/lib/dataService.ts`**
   - Removed emergency 10-record limit
   - Restored proper column selection (excluding `items`)
   - Restored `ORDER BY created_at DESC`
   - Increased limit to 100 records (reasonable for admin panel)
   - Items are now loaded separately only in `getById()` for detail views

3. **`/lib/supabase.ts`**
   - Added connection pooling configuration
   - Added custom headers for better tracking
   - Added realtime event throttling

## Recommended Database Optimizations

Run these SQL commands in your Supabase SQL Editor to create proper indexes:

```sql
-- ============================================
-- CRITICAL PERFORMANCE INDEXES
-- ============================================

-- Index on orders.created_at for ORDER BY queries
-- This is the most important index for the orders list page
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON orders(created_at DESC);

-- Index on orders.status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status);

-- Composite index for status + date filtering
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at 
ON orders(status, created_at DESC);

-- Index on orders.customer_email for lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email 
ON orders(customer_email);

-- Index on clients.created_at
CREATE INDEX IF NOT EXISTS idx_clients_created_at 
ON clients(created_at DESC);

-- Index on clients.email for lookups
CREATE INDEX IF NOT EXISTS idx_clients_email 
ON clients(email);

-- Index on paintings.created_at
CREATE INDEX IF NOT EXISTS idx_paintings_created_at 
ON paintings(created_at DESC);

-- Index on paintings.category for filtering
CREATE INDEX IF NOT EXISTS idx_paintings_category 
ON paintings(category);

-- Index on paintings.is_active for filtering active paintings
CREATE INDEX IF NOT EXISTS idx_paintings_is_active 
ON paintings(is_active);

-- Composite index for active paintings by category
CREATE INDEX IF NOT EXISTS idx_paintings_active_category 
ON paintings(is_active, category) 
WHERE is_active = true;

-- ============================================
-- VERIFY INDEXES WERE CREATED
-- ============================================
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'clients', 'paintings')
ORDER BY tablename, indexname;
```

## Query Performance Best Practices

### ❌ Avoid These Patterns

```typescript
// DON'T: Fetch all columns when you only need count
const { data } = await supabase.from('orders').select('*', { count: 'exact', head: true });

// DON'T: Fetch massive JSONB columns in list views
const { data } = await supabase.from('orders').select('*'); // Includes items with base64 images

// DON'T: Query without limits
const { data } = await supabase.from('orders').select('*'); // Could return thousands of records
```

### ✅ Use These Patterns

```typescript
// DO: Use specific columns for count queries
const { count } = await supabase
  .from('orders')
  .select('id', { count: 'exact', head: true });

// DO: Exclude large JSONB columns from list views
const { data } = await supabase
  .from('orders')
  .select('id, order_number, customer_name, total, status, created_at')
  .order('created_at', { ascending: false })
  .limit(100);

// DO: Load heavy columns separately for detail views
const { data } = await supabase
  .from('orders')
  .select('*') // Include all columns including items
  .eq('id', orderId)
  .single();

// DO: Use pagination for large datasets
const { data } = await supabase
  .from('orders')
  .select('*')
  .range(0, 19) // First 20 records
  .order('created_at', { ascending: false });
```

## Connection Best Practices

### Singleton Pattern ✅
The application correctly uses a singleton Supabase client:

```typescript
// ✅ GOOD - Reuses the same client instance
const supabase = getSupabase();
```

### Avoid Multiple Clients ❌
```typescript
// ❌ BAD - Creates a new client on every call
const supabase = createClient(url, key);
```

## Testing the Fix

1. **Clear Browser Cache** and reload the application
2. **Navigate to Admin Orders page** - should load without timeout
3. **Check Browser Console** for any errors
4. **Verify QuotaMonitor** loads in Admin Settings
5. **Test order detail view** - items should load correctly

## Monitoring

### Check Query Performance
Run this in Supabase SQL Editor to see slow queries:

```sql
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%orders%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Check Index Usage
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'clients', 'paintings')
ORDER BY idx_scan DESC;
```

## Expected Results

After applying these fixes:
- ✅ Orders page loads successfully with all order data (except items)
- ✅ Order detail pages load items correctly
- ✅ QuotaMonitor works without timeouts
- ✅ No more 57014 timeout errors
- ✅ Queries execute in < 100ms (with indexes)
- ✅ Application can handle 100+ orders without issues

## Rollback Plan

If issues persist, you can temporarily reduce the limit:

```typescript
// Temporary emergency fix
const { data } = await supabase
  .from('orders')
  .select('id, order_number, customer_name, customer_email, total, status, created_at')
  .limit(20); // Reduced limit
```

## Summary of Changes

| File | Change | Status |
|------|--------|--------|
| `/components/admin/QuotaMonitor.tsx` | Fixed count queries to use `select('id')` | ✅ Fixed |
| `/lib/dataService.ts` - `ordersService.getAll()` | Exclude items JSONB column, restore ordering | ✅ Fixed |
| `/lib/supabase.ts` | Added connection pooling config | ✅ Fixed |
| Database Indexes | Create indexes on created_at, status, email | ⚠️ Manual SQL required |

## Next Steps

1. ✅ **Code fixes applied** - All TypeScript changes are complete
2. ⚠️ **Run SQL commands** - Create the recommended indexes in Supabase
3. ✅ **Test the application** - Verify orders load correctly
4. ✅ **Monitor performance** - Check query execution times

---

**Date:** December 27, 2024  
**Status:** Complete - Awaiting index creation  
**Impact:** Critical - Fixes database timeouts
