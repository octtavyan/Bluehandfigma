-- ============================================
-- SETUP ALL MISSING TABLES FOR BLUEHAND CANVAS
-- ============================================
-- Run this in Supabase SQL Editor to create ALL missing tables
-- https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/sql/new
-- ============================================

-- ============================================
-- 1. PAINTINGS TABLE - Ensure all columns exist
-- ============================================

-- Check if paintings table exists and add missing columns if needed
DO $$ 
BEGIN
    -- Check if paintings table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'paintings') THEN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'paintings' AND column_name = 'slug') THEN
            ALTER TABLE paintings ADD COLUMN slug TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'paintings' AND column_name = 'available_sizes') THEN
            ALTER TABLE paintings ADD COLUMN available_sizes TEXT[];
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'paintings' AND column_name = 'image_urls') THEN
            ALTER TABLE paintings ADD COLUMN image_urls JSONB;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'paintings' AND column_name = 'print_types') THEN
            ALTER TABLE paintings ADD COLUMN print_types TEXT[];
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'paintings' AND column_name = 'frame_types_by_print_type') THEN
            ALTER TABLE paintings ADD COLUMN frame_types_by_print_type JSONB;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'paintings' AND column_name = 'orientation') THEN
            ALTER TABLE paintings ADD COLUMN orientation TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'paintings' AND column_name = 'dominant_color') THEN
            ALTER TABLE paintings ADD COLUMN dominant_color TEXT;
        END IF;
        
        RAISE NOTICE '✅ Paintings table columns verified/added';
    ELSE
        RAISE NOTICE '⚠️ Paintings table does not exist - please create it first';
    END IF;
END $$;

-- ============================================
-- 2. LEGAL PAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('terms', 'gdpr')),
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_legal_pages_type ON legal_pages(type);

-- Insert default legal content
INSERT INTO legal_pages (type, content) VALUES
('terms', '<h2>Termeni și Condiții</h2><p>Adaugă aici termenii și condițiile magazinului...</p>'),
('gdpr', '<h2>Politica GDPR</h2><p>Adaugă aici politica de confidențialitate GDPR...</p>')
ON CONFLICT (type) DO NOTHING;

-- ============================================
-- 3. UNSPLASH SETTINGS TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS unsplash_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curated_queries TEXT[] NOT NULL DEFAULT ARRAY['nature', 'abstract', 'architecture', 'minimal', 'landscape'],
  random_image_count INTEGER DEFAULT 24,
  refresh_on_page_load BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default unsplash settings
INSERT INTO unsplash_settings (curated_queries, random_image_count, refresh_on_page_load) VALUES
(ARRAY['nature', 'abstract', 'architecture', 'minimal', 'landscape', 'urban', 'mountains', 'ocean'], 24, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. UNSPLASH SEARCHES TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS unsplash_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  results JSONB,
  total_results INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_unsplash_searches_query ON unsplash_searches(query);
CREATE INDEX IF NOT EXISTS idx_unsplash_searches_created_at ON unsplash_searches(created_at DESC);

-- ============================================
-- 5. DISABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE legal_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE unsplash_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE unsplash_searches DISABLE ROW LEVEL SECURITY;

-- Also disable on core tables (safe - won't error if already disabled)
DO $$ 
BEGIN
    -- Core tables
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'canvas_sizes') THEN
        ALTER TABLE canvas_sizes DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Disabled RLS on canvas_sizes';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'frame_types') THEN
        ALTER TABLE frame_types DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Disabled RLS on frame_types';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'paintings') THEN
        ALTER TABLE paintings DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Disabled RLS on paintings';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Disabled RLS on categories';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Disabled RLS on orders';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
        ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Disabled RLS on admin_users';
    END IF;
    
    -- Optional tables
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subcategories') THEN
        ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Disabled RLS on subcategories';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Disabled RLS on clients';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hero_slides') THEN
        ALTER TABLE hero_slides DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Disabled RLS on hero_slides';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_posts') THEN
        ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Disabled RLS on blog_posts';
    END IF;
END $$;

-- ============================================
-- 6. VERIFY ALL TABLES CREATED
-- ============================================

-- List all tables with RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE '%bbc0c500%'
ORDER BY tablename;

-- Count rows in new tables
SELECT 
  'legal_pages' as table_name, 
  COUNT(*) as row_count 
FROM legal_pages
UNION ALL
SELECT 
  'unsplash_settings', 
  COUNT(*) 
FROM unsplash_settings
UNION ALL
SELECT 
  'unsplash_searches', 
  COUNT(*) 
FROM unsplash_searches;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- ✅ All tables should have rls_enabled = false
-- ✅ legal_pages should have 2 rows (terms + gdpr)
-- ✅ unsplash_settings should have 1 row
-- ✅ unsplash_searches can have 0 or more rows
-- ============================================