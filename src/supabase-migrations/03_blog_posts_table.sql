-- =====================================================
-- Blog Posts Table Migration
-- =====================================================
-- This migration creates the blog_posts table for storing
-- blog articles with full content management capabilities.
-- =====================================================

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  publish_date TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON public.blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (published posts only)
CREATE POLICY "Public can view published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (is_published = true);

-- Create policies for authenticated users (full access)
CREATE POLICY "Authenticated users can view all blog posts"
  ON public.blog_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert blog posts"
  ON public.blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog posts"
  ON public.blog_posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blog posts"
  ON public.blog_posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample data (optional - you can remove this if you don't want sample data)
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  image,
  category,
  author,
  publish_date,
  is_published,
  views
) VALUES 
(
  'Cum să Alegi Tabloul Perfect pentru Casa Ta',
  'cum-sa-alegi-tabloul-perfect-pentru-casa-ta',
  'Descoperă factorii cheie de care trebuie să ții cont atunci când selectezi opere de artă pentru spațiul tău de locuit.',
  '<h2>Introducere</h2><p>Alegerea tabloului perfect pentru casa ta poate transforma complet atmosfera unui spațiu. În acest ghid, îți vom arăta cum să selectezi opera de artă ideală care să completeze perfect interiorul tău.</p><h2>1. Consideră Dimensiunea Spațiului</h2><p>Primul și cel mai important factor este dimensiunea peretelui și a camerei. Un tablou prea mic se va pierde pe un perete mare, în timp ce unul prea mare poate copleși spațiul.</p><h2>2. Alege Culorile Potrivite</h2><p>Culorile tabloului ar trebui să se armonizeze cu paleta existentă a camerei. Poți fie să alegi culori complementare, fie să adaugi un accent îndrăzneț cu nuanțe contrastante.</p><h2>3. Stilul Interior</h2><p>Stilul tabloului ar trebui să se potrivească cu designul general al casei tale - modern, clasic, minimalist sau eclectic.</p>',
  'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1920',
  'Design Interior',
  'Maria Popescu',
  '2024-01-15',
  true,
  245
),
(
  'Beneficiile Artei în Spațiul de Lucru',
  'beneficiile-artei-in-spatiul-de-lucru',
  'Explorează cum arta poate îmbunătăți productivitatea și creativitatea în biroul tău.',
  '<h2>De Ce Arte în Birou?</h2><p>Studiile arată că prezența artei în spațiul de lucru poate crește productivitatea cu până la 15% și poate îmbunătăți starea de spirit a angajaților.</p><h2>Tipuri de Artă pentru Birou</h2><p>Pentru mediul profesional, alege opere care inspiră și motivează fără a distrage atenția. Peisajele abstracte și culorile calde sunt alegeri excelente.</p><h2>Amplasarea Corectă</h2><p>Poziționează operele de artă în locuri strategice - în sala de conferințe, zona de recepție sau în spațiile comune pentru a maximiza impactul lor pozitiv.</p>',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920',
  'Artă pentru Birou',
  'Ion Ionescu',
  '2024-01-20',
  true,
  189
)
ON CONFLICT (slug) DO NOTHING;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT SELECT ON public.blog_posts TO anon;
