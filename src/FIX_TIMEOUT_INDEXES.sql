-- ============================================
-- FIX TIMEOUT ERRORS - ADD INDEXES
-- ============================================
-- Run this in Supabase SQL Editor to fix timeout issues
-- https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/sql/new
-- ============================================

-- PAINTINGS TABLE INDEXES
-- Add index on id for faster lookups
CREATE INDEX IF NOT EXISTS idx_paintings_id ON paintings(id);

-- Add index on created_at for faster ordering/sorting
CREATE INDEX IF NOT EXISTS idx_paintings_created_at ON paintings(created_at DESC);

-- Add index on category_id for filtering
CREATE INDEX IF NOT EXISTS idx_paintings_category_id ON paintings(category_id);

-- Add index on is_featured for homepage queries
CREATE INDEX IF NOT EXISTS idx_paintings_is_featured ON paintings(is_featured) WHERE is_featured = true;

-- Add index on is_active for filtering active paintings
CREATE INDEX IF NOT EXISTS idx_paintings_is_active ON paintings(is_active) WHERE is_active = true;

-- Composite index for common queries (active + category)
CREATE INDEX IF NOT EXISTS idx_paintings_active_category ON paintings(is_active, category_id, created_at DESC);

-- ============================================
-- ORDERS TABLE INDEXES
-- ============================================

-- Add index on id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_id ON orders(id);

-- Add index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Add index on status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Add index on email for customer lookups
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);

-- Composite index for admin panel queries (status + date)
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, created_at DESC);

-- ============================================
-- CATEGORIES TABLE INDEXES
-- ============================================

-- Add index on slug for URL lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Add index on is_active
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- ============================================
-- UNSPLASH SEARCHES TABLE INDEXES
-- ============================================

-- Add index on created_at for recent searches
CREATE INDEX IF NOT EXISTS idx_unsplash_searches_created_at ON unsplash_searches(created_at DESC);

-- Add index on query for search analytics
CREATE INDEX IF NOT EXISTS idx_unsplash_searches_query ON unsplash_searches(query);

-- ============================================
-- VERIFY INDEXES CREATED
-- ============================================

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('paintings', 'orders', 'categories', 'unsplash_searches')
ORDER BY tablename, indexname;

-- Expected: You should see all the new indexes listed above
