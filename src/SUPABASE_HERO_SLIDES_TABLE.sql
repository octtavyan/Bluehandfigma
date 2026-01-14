-- ============================================
-- HERO SLIDES TABLE CREATION SCRIPT
-- ============================================
-- Run this SQL in your Supabase SQL Editor to create the hero_slides table

-- Create the hero_slides table
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  button_text TEXT NOT NULL,
  button_link TEXT NOT NULL,
  background_image TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON public.hero_slides ("order");
CREATE INDEX IF NOT EXISTS idx_hero_slides_created_at ON public.hero_slides (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (anyone can view slides)
CREATE POLICY "Allow public read access to hero_slides"
  ON public.hero_slides
  FOR SELECT
  USING (true);

-- Create policies for authenticated insert (only authenticated users can add slides)
CREATE POLICY "Allow authenticated insert to hero_slides"
  ON public.hero_slides
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for authenticated update (only authenticated users can update slides)
CREATE POLICY "Allow authenticated update to hero_slides"
  ON public.hero_slides
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for authenticated delete (only authenticated users can delete slides)
CREATE POLICY "Allow authenticated delete from hero_slides"
  ON public.hero_slides
  FOR DELETE
  TO authenticated
  USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_hero_slides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before each update
DROP TRIGGER IF EXISTS update_hero_slides_updated_at_trigger ON public.hero_slides;
CREATE TRIGGER update_hero_slides_updated_at_trigger
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_hero_slides_updated_at();

-- ============================================
-- OPTIONAL: Insert sample data
-- ============================================
-- Uncomment the following lines if you want to insert sample slides

/*
INSERT INTO public.hero_slides (title, subtitle, button_text, button_link, background_image, "order")
VALUES
  (
    'Creează Tablouri Personalizate',
    'Transformă fotografiile tale preferate în opere de artă pe canvas de calitate premium. Livrare rapidă în toată țara.',
    'Începe Acum',
    '/configureaza-tablou',
    'https://images.unsplash.com/photo-1760720962321-f03e04a03b41?w=1920',
    1
  ),
  (
    'Brighten your interior with bold art prints',
    'Tablouri canvas personalizate și artă murală de calitate premium. Livrare rapidă în toată țara.',
    'Explore 150+ prints',
    '/tablouri-canvas',
    'https://images.unsplash.com/photo-1750326562849-5bd94ed444e1?w=1920',
    2
  );
*/

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify the table was created successfully
-- SELECT * FROM public.hero_slides ORDER BY "order" ASC;
