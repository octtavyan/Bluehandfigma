-- ============================================
-- FIXED CMS DATA MIGRATION SCRIPT
-- ============================================
-- This script will create the missing tables for CMS data
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. DROP EXISTING TABLES (if they exist from previous attempts)
-- ============================================
DROP TABLE IF EXISTS public.subcategories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.canvas_sizes CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- ============================================
-- 2. ADMIN USERS TABLE
-- ============================================
-- Note: Using 'admin_users' instead of 'users' to avoid conflicts
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer', 'full-admin', 'account-manager', 'production')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_admin_users_username ON public.admin_users (username);
CREATE INDEX idx_admin_users_email ON public.admin_users (email);
CREATE INDEX idx_admin_users_role ON public.admin_users (role);
CREATE INDEX idx_admin_users_active ON public.admin_users (is_active);

-- ============================================
-- 3. CANVAS SIZES TABLE
-- ============================================
CREATE TABLE public.canvas_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(width, height)
);

-- Add indexes
CREATE INDEX idx_canvas_sizes_active ON public.canvas_sizes (is_active);
CREATE INDEX idx_canvas_sizes_dimensions ON public.canvas_sizes (width, height);
CREATE INDEX idx_canvas_sizes_price ON public.canvas_sizes (price);

-- ============================================
-- 4. CATEGORIES TABLE
-- ============================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_categories_slug ON public.categories (slug);
CREATE INDEX idx_categories_active ON public.categories (is_active);
CREATE INDEX idx_categories_name ON public.categories (name);

-- ============================================
-- 5. SUBCATEGORIES TABLE
-- ============================================
CREATE TABLE public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(slug)
);

-- Add indexes
CREATE INDEX idx_subcategories_category_id ON public.subcategories (category_id);
CREATE INDEX idx_subcategories_slug ON public.subcategories (slug);
CREATE INDEX idx_subcategories_active ON public.subcategories (is_active);
CREATE INDEX idx_subcategories_name ON public.subcategories (name);

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS POLICIES - ADMIN USERS
-- ============================================
-- Allow authenticated users to read admin_users
CREATE POLICY "Allow authenticated read access to admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert admin_users
CREATE POLICY "Allow authenticated insert to admin_users"
  ON public.admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update admin_users
CREATE POLICY "Allow authenticated update to admin_users"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete admin_users
CREATE POLICY "Allow authenticated delete from admin_users"
  ON public.admin_users
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 8. RLS POLICIES - CANVAS SIZES (Public Read)
-- ============================================
CREATE POLICY "Allow public read access to canvas_sizes"
  ON public.canvas_sizes
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to canvas_sizes"
  ON public.canvas_sizes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to canvas_sizes"
  ON public.canvas_sizes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete from canvas_sizes"
  ON public.canvas_sizes
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 9. RLS POLICIES - CATEGORIES (Public Read)
-- ============================================
CREATE POLICY "Allow public read access to categories"
  ON public.categories
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to categories"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to categories"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete from categories"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 10. RLS POLICIES - SUBCATEGORIES (Public Read)
-- ============================================
CREATE POLICY "Allow public read access to subcategories"
  ON public.subcategories
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert to subcategories"
  ON public.subcategories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to subcategories"
  ON public.subcategories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete from subcategories"
  ON public.subcategories
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 11. AUTO-UPDATE TRIGGERS
-- ============================================
-- Create or replace the update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_canvas_sizes_updated_at
  BEFORE UPDATE ON public.canvas_sizes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON public.subcategories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 12. INSERT DEFAULT DATA
-- ============================================

-- Insert default admin user
INSERT INTO public.admin_users (username, password, full_name, email, role, is_active)
VALUES 
  ('admin', 'admin123', 'Administrator', 'admin@pepanza.ro', 'full-admin', true),
  ('account', 'account123', 'Maria Ionescu', 'account@pepanza.ro', 'account-manager', true),
  ('production', 'production123', 'Ion Popescu', 'production@pepanza.ro', 'production', true)
ON CONFLICT (username) DO NOTHING;

-- Insert default canvas sizes
INSERT INTO public.canvas_sizes (width, height, price, is_active) VALUES
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
  (140, 200, 1190.00, true)
ON CONFLICT (width, height) DO NOTHING;

-- Insert default categories
INSERT INTO public.categories (name, slug, description, is_active) VALUES
  ('Living', 'living', 'Tablouri pentru living', true),
  ('Dormitor', 'dormitor', 'Tablouri pentru dormitor', true),
  ('Sufragerie', 'sufragerie', 'Tablouri pentru sufragerie', true),
  ('Bucătărie', 'bucatarie', 'Tablouri pentru bucătărie', true),
  ('Birou', 'birou', 'Tablouri pentru birou', true),
  ('Baie', 'baie', 'Tablouri pentru baie', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert default subcategories (need to get category IDs first)
DO $$
DECLARE
  living_id UUID;
BEGIN
  -- Get the living category ID (we'll associate most subcategories with it for now)
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
-- 13. VERIFICATION
-- ============================================
-- Run these queries to verify everything was created correctly

-- Check admin_users
SELECT COUNT(*) as admin_users_count FROM public.admin_users;

-- Check canvas_sizes
SELECT COUNT(*) as canvas_sizes_count FROM public.canvas_sizes;

-- Check categories
SELECT COUNT(*) as categories_count FROM public.categories;

-- Check subcategories
SELECT COUNT(*) as subcategories_count FROM public.subcategories;

-- Display sample data
SELECT 'Admin Users:' as table_name;
SELECT username, full_name, role FROM public.admin_users;

SELECT 'Canvas Sizes:' as table_name;
SELECT width, height, price FROM public.canvas_sizes ORDER BY width, height LIMIT 5;

SELECT 'Categories:' as table_name;
SELECT name, slug FROM public.categories;

SELECT 'Subcategories:' as table_name;
SELECT name, slug FROM public.subcategories LIMIT 10;
