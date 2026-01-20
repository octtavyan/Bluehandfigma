-- Create blog_posts table
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

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access for published posts
CREATE POLICY "Allow public read published posts" ON blog_posts
  FOR SELECT USING (is_published = true);

-- Create policy to allow authenticated users full access
CREATE POLICY "Allow authenticated full access" ON blog_posts
  FOR ALL USING (true);
