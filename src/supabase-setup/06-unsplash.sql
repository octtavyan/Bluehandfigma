-- Create unsplash_settings table
CREATE TABLE IF NOT EXISTS unsplash_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_key TEXT,
  curated_images JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unsplash_searches table (tracks user searches)
CREATE TABLE IF NOT EXISTS unsplash_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  search_count INTEGER DEFAULT 1,
  last_searched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE unsplash_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE unsplash_searches ENABLE ROW LEVEL SECURITY;

-- Public read for settings
CREATE POLICY "Allow public read unsplash_settings" ON unsplash_settings
  FOR SELECT USING (true);

-- Authenticated full access for settings
CREATE POLICY "Allow authenticated full access unsplash_settings" ON unsplash_settings
  FOR ALL USING (true);

-- Public can insert/read searches
CREATE POLICY "Allow public read unsplash_searches" ON unsplash_searches
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert unsplash_searches" ON unsplash_searches
  FOR INSERT WITH CHECK (true);

-- Authenticated full access for searches
CREATE POLICY "Allow authenticated full access unsplash_searches" ON unsplash_searches
  FOR ALL USING (true);

-- Insert default settings row
INSERT INTO unsplash_settings (id, curated_images)
VALUES (gen_random_uuid(), '[]'::jsonb)
ON CONFLICT DO NOTHING;
