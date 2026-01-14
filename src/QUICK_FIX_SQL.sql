-- ============================================
-- QUICK FIX: Critical Performance Indexes
-- ============================================
-- Run this NOW in your Supabase SQL Editor
-- to fix all database timeout errors
-- ============================================

-- Most important index - fixes ORDER BY timeout on orders page
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON orders(created_at DESC);

-- Fix status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status);

-- Fix client lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email 
ON orders(customer_email);

CREATE INDEX IF NOT EXISTS idx_clients_email 
ON clients(email);

-- Fix paintings filtering
CREATE INDEX IF NOT EXISTS idx_paintings_category 
ON paintings(category);

CREATE INDEX IF NOT EXISTS idx_paintings_is_active 
ON paintings(is_active);

-- Verify indexes were created
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'clients', 'paintings')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Critical indexes created! Your app should be much faster now.';
END $$;
