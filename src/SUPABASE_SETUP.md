# 🚀 Supabase Database Setup Instructions

## ⚠️ IMPORTANT: Required Database Tables

Your app is connected to Supabase, but you need to create the database tables. Follow these steps:

---

## 📝 Step-by-Step Setup

### 1. Open Supabase SQL Editor

1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

---

### 2. Create Blog Posts Table

**Copy and paste this entire SQL code** into the SQL editor and click **"Run"**:

```sql
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON public.blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

-- Auto-update timestamp trigger
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

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view published blog posts"
  ON public.blog_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users have full access"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT SELECT ON public.blog_posts TO anon;
```

---

### 3. Verify the Table Was Created

After running the SQL:

1. Click **"Table Editor"** in the left sidebar
2. You should see **"blog_posts"** in the list of tables
3. Refresh your app - the error should be gone!

---

## ✅ Expected Result

After creating the table:
- ✅ No more "Could not find table" errors
- ✅ Blog posts save to Supabase database
- ✅ Data persists across devices
- ✅ Multi-user support enabled

---

## 🔄 Already Have Other Tables?

If you already created `paintings`, `orders`, or `clients` tables, they will continue working. This just adds the `blog_posts` table.

---

## 💡 Need Help?

If you see any errors when running the SQL:
1. Make sure you're in the correct Supabase project
2. Check that you have admin permissions
3. Try running each section separately (table creation, then indexes, then policies)

---

## 📊 All Required Tables

Your app needs these tables in Supabase:

- ✅ **paintings** - Canvas artworks catalog
- ✅ **orders** - Customer orders
- ✅ **clients** - Customer information
- ⚠️ **blog_posts** - Blog articles (CREATE THIS NOW)

