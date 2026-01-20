-- BlueHand Canvas - Supabase Database Setup
-- Run this SQL in Supabase Dashboard → SQL Editor

-- =====================================================
-- 1. PAINTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS paintings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  image TEXT NOT NULL,
  image_urls JSONB,
  available_sizes TEXT[] DEFAULT '{}',
  price NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_bestseller BOOLEAN DEFAULT false,
  orientation TEXT,
  dominant_color TEXT,
  print_types TEXT[] DEFAULT ARRAY['Print Canvas', 'Print Hartie'],
  frame_types_by_print_type JSONB DEFAULT '{"Print Hartie": [], "Print Canvas": []}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT
);

-- =====================================================
-- 3. SUBCATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT
);

-- =====================================================
-- 4. CANVAS SIZES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS canvas_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  price NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  supports_print_canvas BOOLEAN DEFAULT true,
  supports_print_hartie BOOLEAN DEFAULT true,
  frame_prices JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- 5. FRAME TYPES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS frame_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0
);

-- =====================================================
-- 6. ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_county TEXT,
  delivery_postal_code TEXT,
  delivery_option TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'unpaid',
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  delivery_cost NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'new',
  notes TEXT,
  person_type TEXT,
  company_name TEXT,
  cui TEXT,
  reg_com TEXT,
  company_county TEXT,
  company_city TEXT,
  company_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. CLIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. ADMIN USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'account-manager',
  is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- 9. HERO SLIDES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  button_text TEXT,
  button_link TEXT,
  background_image TEXT,
  image_urls JSONB,
  "order" INTEGER DEFAULT 0
);

-- =====================================================
-- 10. BLOG POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  image TEXT,
  category TEXT,
  author TEXT,
  publish_date TEXT,
  is_published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DISABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
-- =====================================================
-- This allows public access during development
-- In production, you should enable RLS with proper policies

ALTER TABLE paintings DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_sizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE frame_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Default Admin User
INSERT INTO admin_users (username, password, full_name, email, role, is_active)
VALUES ('admin', 'admin123', 'Administrator', 'admin@bluehand.ro', 'full-admin', true)
ON CONFLICT (username) DO NOTHING;

-- Default Categories
INSERT INTO categories (name, slug) VALUES
  ('Peisaje', 'peisaje'),
  ('Abstract', 'abstract'),
  ('Animale', 'animale'),
  ('Natura', 'natura'),
  ('Urban', 'urban')
ON CONFLICT (name) DO NOTHING;

-- Default Frame Types
INSERT INTO frame_types (name, is_active, "order") VALUES
  ('Fara Rama', true, 1),
  ('Rama Neagra', true, 2),
  ('Rama Alba', true, 3),
  ('Rama Lemn Natural', true, 4),
  ('Rama Aurie', true, 5)
ON CONFLICT DO NOTHING;

-- Default Canvas Sizes
INSERT INTO canvas_sizes (width, height, price, discount, is_active, supports_print_canvas, supports_print_hartie, frame_prices) VALUES
  (30, 40, 150, 0, true, true, true, '{
    "Fara Rama": {"price": 0, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Neagra": {"price": 25, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Alba": {"price": 25, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Lemn Natural": {"price": 35, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Aurie": {"price": 40, "discount": 0, "availableForCanvas": true, "availableForPrint": true}
  }'::jsonb),
  (40, 60, 200, 0, true, true, true, '{
    "Fara Rama": {"price": 0, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Neagra": {"price": 35, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Alba": {"price": 35, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Lemn Natural": {"price": 45, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Aurie": {"price": 50, "discount": 0, "availableForCanvas": true, "availableForPrint": true}
  }'::jsonb),
  (50, 70, 250, 0, true, true, true, '{
    "Fara Rama": {"price": 0, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Neagra": {"price": 45, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Alba": {"price": 45, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Lemn Natural": {"price": 55, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Aurie": {"price": 60, "discount": 0, "availableForCanvas": true, "availableForPrint": true}
  }'::jsonb),
  (60, 90, 350, 0, true, true, true, '{
    "Fara Rama": {"price": 0, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Neagra": {"price": 55, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Alba": {"price": 55, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Lemn Natural": {"price": 65, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
    "Rama Aurie": {"price": 70, "discount": 0, "availableForCanvas": true, "availableForPrint": true}
  }'::jsonb)
ON CONFLICT DO NOTHING;

-- Sample Painting (using a real Unsplash image)
INSERT INTO paintings (
  title, 
  category, 
  subcategory, 
  description, 
  image, 
  available_sizes, 
  price, 
  discount, 
  is_active, 
  is_bestseller,
  orientation,
  print_types,
  frame_types_by_print_type
) VALUES (
  'Peisaj Montan',
  'Peisaje',
  '',
  'Tablou canvas cu peisaj montan spectaculos',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
  ARRAY['30x40', '40x60', '50x70', '60x90'],
  150,
  0,
  true,
  true,
  'landscape',
  ARRAY['Print Canvas', 'Print Hartie'],
  '{"Print Hartie": ["Fara Rama", "Rama Neagra", "Rama Alba"], "Print Canvas": ["Fara Rama", "Rama Neagra", "Rama Alba", "Rama Lemn Natural"]}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '📊 Tables created: paintings, categories, canvas_sizes, frame_types, orders, clients, admin_users, hero_slides, blog_posts';
  RAISE NOTICE '👤 Default admin user: username=admin, password=admin123';
  RAISE NOTICE '🔓 RLS disabled for development (enable in production!)';
END $$;
