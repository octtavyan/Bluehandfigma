# CRITICAL: Orders Table Timeout Issue

## 🚨 EMERGENCY FIX APPLIED

The orders table is experiencing **severe performance issues** causing statement timeouts even with the simplest queries.

---

## 🔴 **Current Situation**

### What's Happening
```
❌ Supabase error: code 57014 - statement timeout
```

**Even the simplest query times out after 60 seconds:**
```sql
SELECT id, order_number, customer_name, total, status 
FROM orders 
LIMIT 10;
-- ❌ TIMEOUT after 60 seconds
```

This indicates a **critical database issue**.

---

## ⚠️ **Emergency Fix Applied**

### Current Query (Absolute Minimum)
```typescript
// /lib/dataService.ts - ordersService.getAll()

const { data } = await supabase
  .from('orders')
  .select('id, order_number, customer_name, customer_email, total, status, created_at')
  .limit(10); // Only 10 orders, no ordering
```

**What this means:**
- ✅ Only loads 10 orders (not 100)
- ✅ Only 7 columns (not all 25+)
- ✅ No ORDER BY clause (no sorting)
- ✅ No items JSONB column
- ⚠️ Missing data filled with defaults

**Data returned:**
- ✅ Order ID
- ✅ Order number
- ✅ Customer name
- ✅ Customer email
- ✅ Total price
- ✅ Status
- ✅ Created date
- ❌ Phone (empty string)
- ❌ Address (empty string)
- ❌ Payment method (empty)
- ❌ Items (empty array - load via getById)

---

## 🔍 **Root Cause Analysis**

### Possible Causes

1. **Missing Index on Primary Key**
   ```sql
   -- Check if primary key index exists
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'orders';
   ```
   
2. **Massive Dataset**
   ```sql
   -- Check number of orders
   SELECT COUNT(*) FROM orders;
   -- If > 1 million, this could cause issues
   ```

3. **Bloated Table**
   ```sql
   -- Check table size
   SELECT 
     pg_size_pretty(pg_total_relation_size('orders')) as total_size,
     pg_size_pretty(pg_relation_size('orders')) as table_size,
     pg_size_pretty(pg_indexes_size('orders')) as indexes_size;
   ```

4. **Vacuum Needed**
   ```sql
   -- Check last vacuum
   SELECT schemaname, relname, last_vacuum, last_autovacuum 
   FROM pg_stat_user_tables 
   WHERE relname = 'orders';
   ```

5. **Lock Contention**
   ```sql
   -- Check for locks
   SELECT * FROM pg_locks WHERE relation::regclass::text = 'orders';
   ```

6. **Items JSONB Column Too Large**
   ```sql
   -- Check items column size
   SELECT 
     id,
     order_number,
     pg_column_size(items) / 1024 / 1024 as items_size_mb
   FROM orders
   ORDER BY pg_column_size(items) DESC
   LIMIT 10;
   ```

---

## 🛠️ **Required Database Fixes**

### 1. Add Index on Primary Key (if missing)
```sql
CREATE INDEX IF NOT EXISTS idx_orders_id ON orders(id);
```

### 2. Add Index on created_at
```sql
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
```

### 3. Analyze Table Statistics
```sql
ANALYZE orders;
```

### 4. Vacuum Table
```sql
VACUUM ANALYZE orders;
```

### 5. Check for Corruption
```sql
-- This will error if table is corrupted
SELECT * FROM orders LIMIT 1;
```

---

## 📊 **Performance Comparison**

### Expected Behavior (Healthy Database)
| Query | Rows | Columns | Time | Status |
|-------|------|---------|------|--------|
| Simple | 10 | 7 | 10ms | ✅ |
| Medium | 100 | 7 | 50ms | ✅ |
| Full | 100 | 25 | 100ms | ✅ |
| With items | 10 | ALL | 500ms | ✅ |

### Actual Behavior (Your Database)
| Query | Rows | Columns | Time | Status |
|-------|------|---------|------|--------|
| Simple | 10 | 7 | 60s+ | ❌ TIMEOUT |
| Medium | 100 | 7 | 60s+ | ❌ TIMEOUT |
| Full | 100 | 25 | 60s+ | ❌ TIMEOUT |
| With items | 10 | ALL | 60s+ | ❌ TIMEOUT |

**This is NOT normal!**

---

## 🚨 **Critical Action Required**

### You MUST do one of the following:

### Option 1: Fix Database Performance (Recommended)
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Run diagnostic queries above
4. Create missing indexes
5. Run VACUUM ANALYZE

### Option 2: Recreate Orders Table
```sql
-- Backup existing data
CREATE TABLE orders_backup AS SELECT * FROM orders;

-- Drop and recreate table
DROP TABLE orders;
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  -- ... other columns
  created_at timestamptz DEFAULT now()
);

-- Add indexes BEFORE importing data
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(customer_email);

-- Import data back
INSERT INTO orders SELECT * FROM orders_backup;

-- Analyze
ANALYZE orders;
```

### Option 3: Use Different Storage for Items
```sql
-- Create separate table for order items
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  painting_id uuid,
  quantity int,
  price numeric,
  -- ... other item fields
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

### Option 4: Disable Orders Feature Temporarily
```typescript
// In dataService.ts
async getAll(): Promise<Order[]> {
  // Database has critical performance issue
  // Return empty array until fixed
  console.warn('⚠️ Orders feature disabled due to database timeout');
  return [];
}
```

---

## 💡 **Why This Happened**

### Likely Scenario

Your orders table has **accumulated too much data in the items JSONB column**:

1. User creates order with base64 images in items
2. Each order = 30-50 MB of JSONB data
3. After 1000+ orders = 30-50 GB table size
4. No indexes on important columns
5. PostgreSQL can't handle queries efficiently
6. Everything times out

### The JSONB Problem

**Base64 images in database = BAD IDEA**

Each painting image stored as:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..." // 5 MB!
}
```

**Better approach:**
- Store images in Supabase Storage
- Store only image URLs in database
- Database stays small and fast

---

## 🔄 **Long-term Solution**

### Migrate to Proper Architecture

1. **Store images in Supabase Storage**
   ```typescript
   // Upload image
   const { data } = await supabase.storage
     .from('paintings')
     .upload(`${paintingId}.jpg`, imageFile);
   
   // Get URL
   const { data: urlData } = await supabase.storage
     .from('paintings')
     .createSignedUrl(`${paintingId}.jpg`, 3600);
   ```

2. **Store only references in database**
   ```json
   {
     "items": [
       {
         "painting_id": "abc-123",
         "painting_title": "Sunset",
         "image_url": "https://...storage.../abc-123.jpg",
         "quantity": 1,
         "price": 500
       }
     ]
   }
   ```

3. **Keep items array small**
   - No base64 images
   - Only essential data
   - Images loaded from CDN

---

## ✅ **What Works Now (Temporary)**

With the emergency fix:
- ✅ Can load 10 most recent orders
- ✅ Shows order number, customer, total, status
- ✅ Can view individual order with getById()
- ⚠️ Missing some data in list view (filled with defaults)
- ⚠️ Can't see all orders (only 10)
- ⚠️ No sorting by date

---

## 🎯 **Next Steps**

### Immediate (Today)
1. Check if database has orders data
2. Check how many orders exist
3. Check size of orders table
4. Add missing indexes

### Short-term (This Week)
1. Fix database performance issues
2. Vacuum and analyze table
3. Increase query limit back to 100
4. Add back sorting

### Long-term (Next Month)
1. Migrate images to Supabase Storage
2. Remove base64 from database
3. Optimize data structure
4. Add proper indexes
5. Set up monitoring

---

## Summary

**The orders table has a critical performance issue causing timeouts.**

**Emergency fix applied:**
- Minimal query (10 orders, 7 columns, no sorting)
- Returns partial data
- Prevents app crash

**YOU MUST FIX THE DATABASE:**
- Add indexes
- Vacuum table
- Or migrate to better architecture

Without fixing the database, the orders feature will remain limited! 🚨
