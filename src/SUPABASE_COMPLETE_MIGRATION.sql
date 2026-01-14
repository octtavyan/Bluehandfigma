-- ============================================
-- COMPLETE CMS DATA MIGRATION SCRIPT
-- ============================================
-- Run this SQL in your Supabase SQL Editor to create all remaining tables
-- This includes: admin_users, canvas_sizes, categories, subcategories

-- ============================================
-- 1. ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- NOTE: In production, this should be hashed!
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users (username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users (email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users (role);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policies for admin_users
CREATE POLICY "Allow authenticated read access to admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to admin_users"
  ON public.admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to admin_users"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete from admin_users"
  ON public.admin_users
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 2. CANVAS SIZES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.canvas_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_canvas_sizes_active ON public.canvas_sizes (is_active);
CREATE INDEX IF NOT EXISTS idx_canvas_sizes_dimensions ON public.canvas_sizes (width, height);

-- Enable RLS
ALTER TABLE public.canvas_sizes ENABLE ROW LEVEL SECURITY;

-- Policies (public read, authenticated write)
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
-- 3. CATEGORIES TABLE
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories (is_active);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies (public read, authenticated write)
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
-- 4. SUBCATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories (category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON public.subcategories (slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_active ON public.subcategories (is_active);

-- Enable RLS
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Policies (public read, authenticated write)
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
-- AUTO-UPDATE TRIGGERS
-- ============================================
-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_canvas_sizes_updated_at ON public.canvas_sizes;
CREATE TRIGGER update_canvas_sizes_updated_at
  BEFORE UPDATE ON public.canvas_sizes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subcategories_updated_at ON public.subcategories;
CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON public.subcategories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- OPTIONAL: Insert default admin user
-- ============================================
-- Uncomment to create a default admin user
-- IMPORTANT: Change the password before using in production!

/*
INSERT INTO public.admin_users (username, password, full_name, email, role, is_active)
VALUES ('admin', 'admin123', 'Administrator', 'admin@pepanza.ro', 'admin', true)
ON CONFLICT (username) DO NOTHING;
*/

-- ============================================
-- OPTIONAL: Insert sample categories
-- ============================================
/*
INSERT INTO public.categories (name, slug, description, is_active)
VALUES 
  ('Tablouri Canvas', 'tablouri-canvas', 'Tablouri canvas personalizate', true),
  ('Multicanvas', 'multicanvas', 'Tablouri multicanvas', true),
  ('Abstract', 'abstract', 'Tablouri abstracte', true)
ON CONFLICT (slug) DO NOTHING;
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify tables were created successfully

-- SELECT * FROM public.admin_users;
-- SELECT * FROM public.canvas_sizes;
-- SELECT * FROM public.categories;
-- SELECT * FROM public.subcategories;
