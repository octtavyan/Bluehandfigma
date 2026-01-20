-- Create sizes table (canvas_sizes for consistency with code)
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

-- Create frame_types table
CREATE TABLE IF NOT EXISTS frame_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE canvas_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_types ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Allow public read canvas_sizes" ON canvas_sizes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read frame_types" ON frame_types
  FOR SELECT USING (is_active = true);

-- Authenticated full access
CREATE POLICY "Allow authenticated full access canvas_sizes" ON canvas_sizes
  FOR ALL USING (true);

CREATE POLICY "Allow authenticated full access frame_types" ON frame_types
  FOR ALL USING (true);

-- Insert default frame types
INSERT INTO frame_types (name, "order", is_active) VALUES
  ('Fara rama', 0, true),
  ('Rama neagra', 1, true),
  ('Rama alba', 2, true),
  ('Rama lemn natural', 3, true)
ON CONFLICT (name) DO NOTHING;