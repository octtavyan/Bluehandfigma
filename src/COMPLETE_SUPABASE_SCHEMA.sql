-- BlueHand Canvas - Complete Supabase Database Schema
-- This file contains all tables and initial configuration
-- Run this in Supabase SQL Editor to set up the complete database

-- ==============================================
-- 1. PAINTINGS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS paintings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  image TEXT NOT NULL,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(5, 2) NOT NULL DEFAULT 0,
  is_bestseller BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_paintings_category ON paintings(category);
CREATE INDEX IF NOT EXISTS idx_paintings_subcategory ON paintings(subcategory);
CREATE INDEX IF NOT EXISTS idx_paintings_is_bestseller ON paintings(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_paintings_is_active ON paintings(is_active);

-- ==============================================
-- 2. SIZES TABLE (for personalized canvas)
-- ==============================================
CREATE TABLE IF NOT EXISTS sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(5, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_sizes_is_active ON sizes(is_active);

-- ==============================================
-- 3. CATEGORIES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- 4. SUBCATEGORIES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- 5. ORDERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_option TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL,
  delivery_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ==============================================
-- 6. CLIENTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  address TEXT,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- ==============================================
-- 7. USERS TABLE (Admin system)
-- ==============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- ==============================================
-- 8. HERO SLIDES TABLE (Homepage carousel)
-- ==============================================
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  button_text TEXT,
  button_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_hero_slides_is_active ON hero_slides(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_slides_display_order ON hero_slides(display_order);

-- ==============================================
-- 9. BLOG POSTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author TEXT NOT NULL,
  category TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- ==============================================
-- INITIAL DATA - DEFAULT ADMIN USER
-- ==============================================
-- Password is 'admin123' (bcrypt hashed)
INSERT INTO users (username, password, role, name, email, is_active)
VALUES (
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  'Administrator',
  'octavian.dumitrescu@gmail.com',
  true
)
ON CONFLICT (username) DO NOTHING;

-- ==============================================
-- INITIAL DATA - DEFAULT CATEGORIES
-- ==============================================
INSERT INTO categories (name) VALUES
  ('Tablouri Canvas'),
  ('Multicanvas'),
  ('Tablouri Personalizate')
ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- INITIAL DATA - DEFAULT SUBCATEGORIES
-- ==============================================
INSERT INTO subcategories (name) VALUES
  ('Peisaje'),
  ('Abstracte'),
  ('Orase'),
  ('Flori'),
  ('Animale'),
  ('Portrete'),
  ('Moderne'),
  ('Clasice')
ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- INITIAL DATA - DEFAULT SIZES FOR PERSONALIZED CANVAS
-- ==============================================
INSERT INTO sizes (width, height, price, discount, is_active) VALUES
  (30, 30, 99.00, 0, true),
  (40, 40, 129.00, 0, true),
  (50, 50, 159.00, 0, true),
  (60, 60, 189.00, 0, true),
  (70, 70, 219.00, 0, true),
  (80, 80, 249.00, 0, true),
  (30, 40, 109.00, 0, true),
  (40, 60, 149.00, 0, true),
  (50, 70, 179.00, 0, true),
  (60, 80, 209.00, 0, true),
  (60, 90, 239.00, 0, true),
  (70, 100, 269.00, 0, true)
ON CONFLICT DO NOTHING;

-- ==============================================
-- ENABLE ROW LEVEL SECURITY (Optional - for production)
-- ==============================================
-- Note: For development/testing, you may want to skip RLS
-- Uncomment these lines for production security

-- ALTER TABLE paintings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (adjust as needed)
-- CREATE POLICY "Allow public read access to paintings" ON paintings FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access to sizes" ON sizes FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access to subcategories" ON subcategories FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access to hero_slides" ON hero_slides FOR SELECT USING (is_active = true);
-- CREATE POLICY "Allow public read access to blog_posts" ON blog_posts FOR SELECT USING (is_published = true);

-- ==============================================
-- FUNCTIONS & TRIGGERS
-- ==============================================

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at column
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================
-- Run these to verify your setup

-- Check all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check default admin user
-- SELECT username, role, name, email FROM users WHERE role = 'admin';

-- Check categories
-- SELECT * FROM categories;

-- Check subcategories
-- SELECT * FROM subcategories;

-- Check sizes
-- SELECT * FROM sizes ORDER BY width, height;

-- ==============================================
-- COMPLETE! ✅
-- ==============================================
-- Your database is now ready for the BlueHand Canvas application
-- Next steps:
-- 1. Configure RESEND_API_KEY in Supabase Edge Functions
-- 2. Add sample paintings data via admin panel
-- 3. Configure hero slides for homepage
-- 4. Test order placement flow
