-- ============================================
-- DISABLE ROW LEVEL SECURITY (RLS) - SAFE VERSION
-- Only disables RLS on tables that exist
-- ============================================
-- 
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/sql/new
-- ============================================

-- Core tables (these MUST exist)
ALTER TABLE canvas_sizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE frame_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE paintings DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Optional tables (only if they exist - won't error if missing)
DO $$ 
BEGIN
    -- Subcategories
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subcategories') THEN
        ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Clients
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Hero Slides
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hero_slides') THEN
        ALTER TABLE hero_slides DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Blog Posts
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_posts') THEN
        ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Unsplash Searches
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unsplash_searches') THEN
        ALTER TABLE unsplash_searches DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Unsplash Settings
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unsplash_settings') THEN
        ALTER TABLE unsplash_settings DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected result: All tables should show "rls_enabled = false"
