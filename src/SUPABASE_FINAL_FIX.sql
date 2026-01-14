-- ============================================
-- SUPABASE FINAL FIX - USING EXISTING TABLE STRUCTURE
-- ============================================
-- This script works with your existing 'users' and 'sizes' tables

-- ============================================
-- 1. UPDATE USERS TABLE
-- ============================================
-- Check what columns exist and add only what's missing
DO $$ 
BEGIN
  -- Add role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='role') THEN
    ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'viewer';
  END IF;
  
  -- Add is_active if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='is_active') THEN
    ALTER TABLE public.users ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  
  -- Add username if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='username') THEN
    ALTER TABLE public.users ADD COLUMN username TEXT;
  END IF;
  
  -- Add password if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='password') THEN
    ALTER TABLE public.users ADD COLUMN password TEXT;
  END IF;
  
  -- Note: We're using 'name' which already exists (not creating 'full_name')
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);

-- Enable RLS if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Allow authenticated read access to users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated insert to users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated update to users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated delete from users" ON public.users;
DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;

-- Create new policies
CREATE POLICY "Allow authenticated read access to users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to users"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete from users"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default admin users if they don't exist
-- Using DO block to handle conflicts gracefully
DO $$
BEGIN
  -- Try to insert admin user
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'admin') THEN
    INSERT INTO public.users (username, password, name, email, role, is_active)
    VALUES ('admin', 'admin123', 'Administrator', 'admin@pepanza.ro', 'full-admin', true);
  END IF;
  
  -- Try to insert account manager
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'account') THEN
    INSERT INTO public.users (username, password, name, email, role, is_active)
    VALUES ('account', 'account123', 'Maria Ionescu', 'account@pepanza.ro', 'account-manager', true);
  END IF;
  
  -- Try to insert production user
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'production') THEN
    INSERT INTO public.users (username, password, name, email, role, is_active)
    VALUES ('production', 'production123', 'Ion Popescu', 'production@pepanza.ro', 'production', true);
  END IF;
END $$;

-- ============================================
-- 2. UPDATE SIZES TABLE
-- ============================================
-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add is_active if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='sizes' AND column_name='is_active') THEN
    ALTER TABLE public.sizes ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  
  -- Add width if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='sizes' AND column_name='width') THEN
    ALTER TABLE public.sizes ADD COLUMN width INTEGER;
  END IF;
  
  -- Add height if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='sizes' AND column_name='height') THEN
    ALTER TABLE public.sizes ADD COLUMN height INTEGER;
  END IF;
  
  -- Add price if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='sizes' AND column_name='price') THEN
    ALTER TABLE public.sizes ADD COLUMN price DECIMAL(10, 2);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_sizes_dimensions ON public.sizes (width, height);
CREATE INDEX IF NOT EXISTS idx_sizes_active ON public.sizes (is_active);

-- Enable RLS if not already enabled
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to sizes" ON public.sizes;
DROP POLICY IF EXISTS "Allow authenticated insert to sizes" ON public.sizes;
DROP POLICY IF EXISTS "Allow authenticated update to sizes" ON public.sizes;
DROP POLICY IF EXISTS "Allow authenticated delete from sizes" ON public.sizes;

-- Create new policies
CREATE POLICY "Allow public read access to sizes"
  ON public.sizes
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to sizes"
  ON public.sizes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to sizes"
  ON public.sizes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete from sizes"
  ON public.sizes
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default canvas sizes if they don't exist
DO $$
BEGIN
  -- Only insert if table is empty or missing these sizes
  IF NOT EXISTS (SELECT 1 FROM public.sizes WHERE width = 30 AND height = 40) THEN
    INSERT INTO public.sizes (width, height, price, is_active) VALUES
      (10, 14, 69.00, true),
      (20, 30, 59.65, true),
      (30, 40, 89.99, true),
      (30, 50, 129.99, true),
      (35, 50, 139.99, true),
      (40, 60, 140.99, true),
      (50, 70, 176.66, true),
      (50, 80, 249.00, true),
      (50, 90, 263.00, true),
      (60, 90, 266.66, true),
      (70, 100, 299.99, true),
      (80, 120, 377.69, true),
      (90, 120, 466.00, true),
      (100, 150, 580.00, true),
      (100, 160, 691.00, true),
      (140, 160, 888.54, true),
      (140, 200, 1190.00, true);
  END IF;
END $$;

-- ============================================
-- 3. CREATE CATEGORIES TABLE (if it doesn't exist)
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories (is_active);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated insert to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated update to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated delete from categories" ON public.categories;

CREATE POLICY "Allow public read access to categories"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert to categories"
  ON public.categories FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update to categories"
  ON public.categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete from categories"
  ON public.categories FOR DELETE TO authenticated USING (true);

-- Insert default categories
INSERT INTO public.categories (name, slug, description, is_active) VALUES
  ('Living', 'living', 'Tablouri pentru living', true),
  ('Dormitor', 'dormitor', 'Tablouri pentru dormitor', true),
  ('Sufragerie', 'sufragerie', 'Tablouri pentru sufragerie', true),
  ('Bucătărie', 'bucatarie', 'Tablouri pentru bucătărie', true),
  ('Birou', 'birou', 'Tablouri pentru birou', true),
  ('Baie', 'baie', 'Tablouri pentru baie', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 4. CREATE SUBCATEGORIES TABLE (if it doesn't exist)
-- ============================================
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories (category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON public.subcategories (slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_active ON public.subcategories (is_active);

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Allow authenticated insert to subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Allow authenticated update to subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Allow authenticated delete from subcategories" ON public.subcategories;

CREATE POLICY "Allow public read access to subcategories"
  ON public.subcategories FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert to subcategories"
  ON public.subcategories FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update to subcategories"
  ON public.subcategories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete from subcategories"
  ON public.subcategories FOR DELETE TO authenticated USING (true);

-- Insert default subcategories
DO $$
DECLARE
  living_id UUID;
BEGIN
  SELECT id INTO living_id FROM public.categories WHERE slug = 'living' LIMIT 1;
  
  IF living_id IS NOT NULL THEN
    INSERT INTO public.subcategories (category_id, name, slug, description, is_active) VALUES
      (living_id, 'Modern', 'modern', 'Stil modern', true),
      (living_id, 'Clasic', 'clasic', 'Stil clasic', true),
      (living_id, 'Minimalist', 'minimalist', 'Stil minimalist', true),
      (living_id, 'Abstract', 'abstract', 'Stil abstract', true),
      (living_id, 'Romantic', 'romantic', 'Stil romantic', true),
      (living_id, 'Relaxant', 'relaxant', 'Stil relaxant', true),
      (living_id, 'Inspirațional', 'inspirational', 'Stil inspirațional', true),
      (living_id, 'Neutru', 'neutru', 'Stil neutru', true),
      (living_id, 'Elegant', 'elegant', 'Stil elegant', true),
      (living_id, 'Traditional', 'traditional', 'Stil tradițional', true),
      (living_id, 'Contemporan', 'contemporan', 'Stil contemporan', true),
      (living_id, 'Rustic', 'rustic', 'Stil rustic', true),
      (living_id, 'Culinar', 'culinar', 'Stil culinar', true),
      (living_id, 'Fresh', 'fresh', 'Stil fresh', true),
      (living_id, 'Vintage', 'vintage', 'Stil vintage', true),
      (living_id, 'Colorat', 'colorat', 'Stil colorat', true),
      (living_id, 'Motivațional', 'motivational', 'Stil motivațional', true),
      (living_id, 'Professional', 'professional', 'Stil profesional', true),
      (living_id, 'Creativ', 'creativ', 'Stil creativ', true),
      (living_id, 'Minimal', 'minimal', 'Stil minimal', true),
      (living_id, 'Relaxare', 'relaxare', 'Stil relaxare', true),
      (living_id, 'Spa', 'spa', 'Stil spa', true),
      (living_id, 'Marin', 'marin', 'Stil marin', true),
      (living_id, 'Natura', 'natura', 'Stil natură', true)
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 5. VERIFICATION
-- ============================================
SELECT 'Users:' as table_name, COUNT(*) as count FROM public.users;
SELECT 'Sizes:' as table_name, COUNT(*) as count FROM public.sizes;
SELECT 'Categories:' as table_name, COUNT(*) as count FROM public.categories;
SELECT 'Subcategories:' as table_name, COUNT(*) as count FROM public.subcategories;

-- Show sample data
SELECT '=== Admin Users ===' as info;
SELECT username, name, email, role FROM public.users WHERE username IN ('admin', 'account', 'production');

SELECT '✅ Setup complete!' as status;
