-- ============================================
-- BLUEHAND CANVAS - COMPLETE DATABASE SETUP
-- ============================================
-- Run this ENTIRE file in Supabase SQL Editor
-- Now that you've upgraded, this should work without timeout!
-- ============================================

-- 1. HERO SLIDES TABLE
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON hero_slides;
CREATE POLICY "Allow public read access" ON hero_slides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated full access" ON hero_slides;
CREATE POLICY "Allow authenticated full access" ON hero_slides FOR ALL USING (true);

-- 2. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author TEXT,
  is_published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read published posts" ON blog_posts;
CREATE POLICY "Allow public read published posts" ON blog_posts FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Allow authenticated full access" ON blog_posts;
CREATE POLICY "Allow authenticated full access" ON blog_posts FOR ALL USING (true);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read categories" ON categories;
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated full access categories" ON categories;
CREATE POLICY "Allow authenticated full access categories" ON categories FOR ALL USING (true);

INSERT INTO categories (name, slug) VALUES
  ('Modern', 'modern'),
  ('Abstract', 'abstract'),
  ('Natura', 'natura'),
  ('Animale', 'animale'),
  ('Urban', 'urban'),
  ('Vintage', 'vintage'),
  ('Minimalist', 'minimalist'),
  ('Colorful', 'colorful')
ON CONFLICT (name) DO NOTHING;

-- 4. SUBCATEGORIES TABLE
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read subcategories" ON subcategories;
CREATE POLICY "Allow public read subcategories" ON subcategories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated full access subcategories" ON subcategories;
CREATE POLICY "Allow authenticated full access subcategories" ON subcategories FOR ALL USING (true);

INSERT INTO subcategories (name, slug) VALUES
  ('Geometric', 'geometric'),
  ('Floral', 'floral'),
  ('Monochrome', 'monochrome'),
  ('Sunset', 'sunset'),
  ('Ocean', 'ocean'),
  ('Mountains', 'mountains'),
  ('Forest', 'forest'),
  ('Tropical', 'tropical')
ON CONFLICT (name) DO NOTHING;

-- 5. SIZES TABLE
CREATE TABLE IF NOT EXISTS canvas_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  supports_print_canvas BOOLEAN DEFAULT true,
  supports_print_hartie BOOLEAN DEFAULT true,
  frame_prices JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE canvas_sizes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read canvas_sizes" ON canvas_sizes;
CREATE POLICY "Allow public read canvas_sizes" ON canvas_sizes FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated full access canvas_sizes" ON canvas_sizes;
CREATE POLICY "Allow authenticated full access canvas_sizes" ON canvas_sizes FOR ALL USING (true);

-- 6. FRAME TYPES TABLE
CREATE TABLE IF NOT EXISTS frame_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE frame_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read frame_types" ON frame_types;
CREATE POLICY "Allow public read frame_types" ON frame_types FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated full access frame_types" ON frame_types;
CREATE POLICY "Allow authenticated full access frame_types" ON frame_types FOR ALL USING (true);

INSERT INTO frame_types (name, "order", is_active) VALUES
  ('Fara rama', 0, true),
  ('Rama neagra', 1, true),
  ('Rama alba', 2, true),
  ('Rama lemn natural', 3, true)
ON CONFLICT (name) DO NOTHING;

-- 7. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('full-admin', 'account-manager', 'production')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full access admin_users" ON admin_users;
CREATE POLICY "Allow authenticated full access admin_users" ON admin_users FOR ALL USING (true);

-- 8. UNSPLASH SETTINGS TABLE
CREATE TABLE IF NOT EXISTS unsplash_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_key TEXT,
  curated_images JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE unsplash_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read unsplash_settings" ON unsplash_settings;
CREATE POLICY "Allow public read unsplash_settings" ON unsplash_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated full access unsplash_settings" ON unsplash_settings;
CREATE POLICY "Allow authenticated full access unsplash_settings" ON unsplash_settings FOR ALL USING (true);

-- Insert default settings row (only if none exists)
INSERT INTO unsplash_settings (id, curated_images)
SELECT gen_random_uuid(), '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM unsplash_settings LIMIT 1);

-- 9. UNSPLASH SEARCHES TABLE
CREATE TABLE IF NOT EXISTS unsplash_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  search_count INTEGER DEFAULT 1,
  last_searched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE unsplash_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read unsplash_searches" ON unsplash_searches;
CREATE POLICY "Allow public read unsplash_searches" ON unsplash_searches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert unsplash_searches" ON unsplash_searches;
CREATE POLICY "Allow public insert unsplash_searches" ON unsplash_searches FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated full access unsplash_searches" ON unsplash_searches;
CREATE POLICY "Allow authenticated full access unsplash_searches" ON unsplash_searches FOR ALL USING (true);

-- 10. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  county TEXT,
  postal_code TEXT,
  person_type TEXT CHECK (person_type IN ('fizica', 'juridica')),
  company_name TEXT,
  cui TEXT,
  reg_com TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full access clients" ON clients;
CREATE POLICY "Allow authenticated full access clients" ON clients FOR ALL USING (true);

-- 11. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT,
  delivery_county TEXT,
  delivery_postal_code TEXT,
  delivery_option TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'unpaid',
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_cost DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'new',
  notes TEXT,
  person_type TEXT CHECK (person_type IN ('fizica', 'juridica')),
  company_name TEXT,
  cui TEXT,
  reg_com TEXT,
  company_county TEXT,
  company_city TEXT,
  company_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert orders" ON orders;
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated full access orders" ON orders;
CREATE POLICY "Allow authenticated full access orders" ON orders FOR ALL USING (true);

-- 12. PAINTINGS TABLE (optional - for future use)
CREATE TABLE IF NOT EXISTS paintings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  image TEXT NOT NULL,
  image_urls JSONB,
  available_sizes TEXT[],
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_bestseller BOOLEAN DEFAULT false,
  orientation TEXT CHECK (orientation IN ('portrait', 'landscape', 'square')),
  dominant_color TEXT,
  print_types TEXT[],
  frame_types_by_print_type JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE paintings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read active paintings" ON paintings;
CREATE POLICY "Allow public read active paintings" ON paintings FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated full access paintings" ON paintings;
CREATE POLICY "Allow authenticated full access paintings" ON paintings FOR ALL USING (true);

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next step: Create your admin user by running:
-- 
-- INSERT INTO admin_users (username, password, role, full_name, email, is_active)
-- VALUES ('admin', 'admin123', 'full-admin', 'Administrator', 'admin@bluehand.ro', true);
--
-- Then login at /admin/login with username: admin, password: admin123
-- ============================================