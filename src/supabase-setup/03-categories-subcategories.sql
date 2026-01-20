-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Allow public read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow public read subcategories" ON subcategories
  FOR SELECT USING (true);

-- Authenticated full access
CREATE POLICY "Allow authenticated full access categories" ON categories
  FOR ALL USING (true);

CREATE POLICY "Allow authenticated full access subcategories" ON subcategories
  FOR ALL USING (true);

-- Insert default categories
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

-- Insert default subcategories
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
