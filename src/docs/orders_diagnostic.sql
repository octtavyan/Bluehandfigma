-- =====================================================
-- ORDERS TABLE DIAGNOSTIC QUERIES
-- Run these in Supabase SQL Editor to diagnose timeout
-- =====================================================

-- 1. CHECK IF ORDERS TABLE EXISTS
-- =====================================================
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'orders'
) as orders_table_exists;


-- 2. COUNT TOTAL ORDERS
-- =====================================================
-- This might timeout if table is huge or corrupted
SELECT COUNT(*) as total_orders FROM orders;


-- 3. CHECK TABLE SIZE
-- =====================================================
SELECT 
  pg_size_pretty(pg_total_relation_size('orders')) as total_size,
  pg_size_pretty(pg_relation_size('orders')) as table_size,
  pg_size_pretty(pg_indexes_size('orders')) as indexes_size,
  pg_size_pretty(pg_total_relation_size('orders') - pg_relation_size('orders') - pg_indexes_size('orders')) as toast_size;


-- 4. CHECK INDEXES
-- =====================================================
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'orders'
ORDER BY indexname;


-- 5. CHECK LAST VACUUM/ANALYZE
-- =====================================================
SELECT 
  schemaname,
  relname,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE relname = 'orders';


-- 6. CHECK FOR LOCKS
-- =====================================================
SELECT 
  locktype,
  database,
  relation::regclass,
  page,
  tuple,
  virtualxid,
  transactionid,
  mode,
  granted
FROM pg_locks 
WHERE relation = 'orders'::regclass;


-- 7. CHECK ITEMS COLUMN SIZE
-- =====================================================
-- This shows how big the items JSONB column is
-- WARNING: This might also timeout if items are huge
SELECT 
  id,
  order_number,
  created_at,
  pg_column_size(items) as items_bytes,
  pg_size_pretty(pg_column_size(items)) as items_size,
  jsonb_array_length(items) as num_items
FROM orders
ORDER BY pg_column_size(items) DESC
LIMIT 10;


-- 8. CHECK TABLE COLUMNS
-- =====================================================
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;


-- 9. TEST SIMPLE SELECT
-- =====================================================
-- This should be INSTANT (< 100ms)
-- If this times out, database is seriously broken
SELECT id, order_number, created_at 
FROM orders 
LIMIT 1;


-- 10. CHECK RECENT ORDERS
-- =====================================================
-- Try to get 10 most recent orders
-- If this times out, created_at needs an index
SELECT 
  id,
  order_number,
  customer_name,
  total,
  status,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;


-- =====================================================
-- FIXES TO APPLY (if needed)
-- =====================================================

-- FIX 1: Add missing indexes
-- ----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);


-- FIX 2: Analyze table statistics
-- ----------------------------------------------------
ANALYZE orders;


-- FIX 3: Vacuum table
-- ----------------------------------------------------
VACUUM ANALYZE orders;


-- FIX 4: Check for dead tuples
-- ----------------------------------------------------
SELECT 
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples,
  round(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_tuple_percent
FROM pg_stat_user_tables
WHERE relname = 'orders';


-- FIX 5: Full vacuum (if needed)
-- ----------------------------------------------------
-- Only run if dead_tuple_percent > 20%
-- VACUUM FULL orders;


-- =====================================================
-- EMERGENCY: If nothing works
-- =====================================================

-- Option A: Check if table is corrupted
-- ----------------------------------------------------
-- This will error if there's corruption
SELECT * FROM orders LIMIT 1;


-- Option B: Export data and recreate table
-- ----------------------------------------------------
-- Step 1: Backup
-- CREATE TABLE orders_backup AS SELECT * FROM orders;

-- Step 2: Drop and recreate
-- DROP TABLE orders CASCADE;
-- CREATE TABLE orders (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   order_number text NOT NULL,
--   customer_name text NOT NULL,
--   customer_email text NOT NULL,
--   customer_phone text,
--   delivery_address text,
--   delivery_city text,
--   delivery_county text,
--   delivery_postal_code text,
--   delivery_option text NOT NULL,
--   payment_method text NOT NULL,
--   payment_status text DEFAULT 'unpaid',
--   items jsonb DEFAULT '[]'::jsonb,
--   subtotal numeric NOT NULL,
--   delivery_cost numeric NOT NULL,
--   total numeric NOT NULL,
--   status text NOT NULL,
--   notes text,
--   created_at timestamptz DEFAULT now(),
--   updated_at timestamptz,
--   person_type text,
--   company_name text,
--   cui text,
--   reg_com text,
--   company_county text,
--   company_city text,
--   company_address text
-- );

-- Step 3: Add indexes BEFORE importing
-- CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
-- CREATE INDEX idx_orders_status ON orders(status);

-- Step 4: Import (slowly, in batches)
-- INSERT INTO orders SELECT * FROM orders_backup LIMIT 100;

-- Step 5: Analyze
-- ANALYZE orders;


-- =====================================================
-- RESULTS INTERPRETATION
-- =====================================================

-- Query 2 (COUNT): 
--   < 1000 orders = Should be instant
--   1000-10000 orders = Should work with indexes
--   > 10000 orders = Need proper indexing
--   TIMEOUT = Critical issue!

-- Query 3 (SIZE):
--   < 100 MB = Normal
--   100 MB - 1 GB = Need optimization
--   > 1 GB = Need to remove base64 images
--   > 10 GB = CRITICAL - migrate images to storage

-- Query 7 (ITEMS SIZE):
--   < 1 MB per order = Acceptable
--   1-10 MB per order = Large, should optimize
--   > 10 MB per order = TOO LARGE - remove base64

-- Query 10 (ORDER BY):
--   < 100ms = Good
--   100-1000ms = Need index on created_at
--   TIMEOUT = Missing index or table too large
