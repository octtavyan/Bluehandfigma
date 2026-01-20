-- ============================================
-- DISABLE ROW LEVEL SECURITY (RLS)
-- Quick fix for Figma Make development
-- ============================================
-- 
-- RLS blocks queries from the Figma Make environment.
-- This script disables RLS on all tables so data can load.
--
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/sql/new
-- ============================================

-- Disable RLS on all tables
ALTER TABLE canvas_sizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE frame_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE paintings DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE legal_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE unsplash_searches DISABLE ROW LEVEL SECURITY;
ALTER TABLE unsplash_settings DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'canvas_sizes', 
    'frame_types', 
    'paintings', 
    'categories', 
    'subcategories',
    'orders',
    'admin_users',
    'clients',
    'hero_slides',
    'blog_posts',
    'legal_pages',
    'unsplash_searches',
    'unsplash_settings'
  )
ORDER BY tablename;

-- Expected result: All tables should show "rls_enabled = false"
