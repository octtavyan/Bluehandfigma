-- Create paintings table (optional - used if you add admin paintings later)
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

-- Enable RLS
ALTER TABLE paintings ENABLE ROW LEVEL SECURITY;

-- Public read active paintings
CREATE POLICY "Allow public read active paintings" ON paintings
  FOR SELECT USING (is_active = true);

-- Authenticated full access
CREATE POLICY "Allow authenticated full access paintings" ON paintings
  FOR ALL USING (true);
