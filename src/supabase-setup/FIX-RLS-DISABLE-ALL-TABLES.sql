-- ============================================
-- FIX: DISABLE RLS ON ALL TABLES
-- ============================================
-- This script disables Row Level Security (RLS) on all application tables
-- so that the application can read/write data without authentication barriers.
-- 
-- Use this for development/prototyping. For production, you should create
-- proper RLS policies instead of disabling RLS entirely.
--
-- HOW TO USE:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Copy this entire file and paste it
-- 3. Click "Run" 
-- 4. Refresh your app - data should now load!
-- ============================================

-- Disable RLS on all application tables
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_sizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE frame_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_store_bbc0c500 DISABLE ROW LEVEL SECURITY;
ALTER TABLE legal_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE paintings DISABLE ROW LEVEL SECURITY;
ALTER TABLE sizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE unsplash_searches DISABLE ROW LEVEL SECURITY;
ALTER TABLE unsplash_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS disabled on all tables! Your app should now load data correctly.' AS status;
