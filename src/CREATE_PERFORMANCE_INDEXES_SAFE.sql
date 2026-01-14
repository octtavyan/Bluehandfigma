-- ============================================
-- BLUEHAND CANVAS - PERFORMANCE INDEXES (SAFE VERSION)
-- ============================================
-- This version handles missing columns gracefully
-- Run this SQL in your Supabase SQL Editor
--
-- Date: December 27, 2024
-- Purpose: Fix database timeout errors (PostgreSQL error 57014)
-- ============================================

-- ============================================
-- ORDERS TABLE INDEXES
-- ============================================

-- Index on orders.created_at for ORDER BY queries
-- This is the MOST IMPORTANT index for the orders list page
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON orders(created_at DESC);

-- Index on orders.status for filtering by status
CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status);

-- Composite index for status + date filtering
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at 
ON orders(status, created_at DESC);

-- Index on orders.customer_email for client lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email 
ON orders(customer_email);

-- Index on orders.order_number for quick lookup
CREATE INDEX IF NOT EXISTS idx_orders_order_number 
ON orders(order_number);

-- ============================================
-- CLIENTS TABLE INDEXES
-- ============================================

-- Index on clients.created_at for sorting
CREATE INDEX IF NOT EXISTS idx_clients_created_at 
ON clients(created_at DESC);

-- Index on clients.email for lookups
CREATE INDEX IF NOT EXISTS idx_clients_email 
ON clients(email);

-- Index on clients.name for search
CREATE INDEX IF NOT EXISTS idx_clients_name 
ON clients(name);

-- ============================================
-- PAINTINGS TABLE INDEXES
-- ============================================

-- Index on paintings.created_at for sorting
CREATE INDEX IF NOT EXISTS idx_paintings_created_at 
ON paintings(created_at DESC);

-- Index on paintings.category for filtering
CREATE INDEX IF NOT EXISTS idx_paintings_category 
ON paintings(category);

-- Index on paintings.is_active for filtering active paintings
CREATE INDEX IF NOT EXISTS idx_paintings_is_active 
ON paintings(is_active);

-- Composite index for active paintings by category
-- Partial index - only indexes active paintings
CREATE INDEX IF NOT EXISTS idx_paintings_active_category 
ON paintings(is_active, category) 
WHERE is_active = true;

-- Index for bestseller filtering
CREATE INDEX IF NOT EXISTS idx_paintings_is_bestseller 
ON paintings(is_bestseller)
WHERE is_bestseller = true;

-- ============================================
-- USERS TABLE INDEXES
-- ============================================

-- Index on users.username for login
CREATE INDEX IF NOT EXISTS idx_users_username 
ON users(username);

-- Index on users.email for lookups
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- Index on users.is_active for filtering active users
CREATE INDEX IF NOT EXISTS idx_users_is_active 
ON users(is_active);

-- ============================================
-- HERO_SLIDES TABLE INDEXES (with error handling)
-- ============================================

-- Try to create index on display_order if column exists
DO $$
BEGIN
  -- Check if display_order column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'hero_slides' 
    AND column_name = 'display_order'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_hero_slides_display_order 
    ON hero_slides(display_order);
    RAISE NOTICE '✅ Created index on hero_slides.display_order';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'hero_slides' 
    AND column_name = 'order'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_hero_slides_order 
    ON hero_slides("order");
    RAISE NOTICE '✅ Created index on hero_slides.order';
  ELSE
    RAISE NOTICE '⚠️ No order column found in hero_slides table';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Could not create hero_slides order index: %', SQLERRM;
END $$;

-- Index on hero_slides.is_active for filtering
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'hero_slides' 
    AND column_name = 'is_active'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_hero_slides_is_active 
    ON hero_slides(is_active);
    RAISE NOTICE '✅ Created index on hero_slides.is_active';
  ELSE
    RAISE NOTICE '⚠️ No is_active column found in hero_slides table';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Could not create hero_slides is_active index: %', SQLERRM;
END $$;

-- ============================================
-- BLOG_POSTS TABLE INDEXES (with error handling)
-- ============================================

-- Index on blog_posts.created_at for sorting
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_posts'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at 
    ON blog_posts(created_at DESC);
    RAISE NOTICE '✅ Created index on blog_posts.created_at';
  ELSE
    RAISE NOTICE '⚠️ blog_posts table does not exist';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Could not create blog_posts created_at index: %', SQLERRM;
END $$;

-- Index on blog_posts.slug for lookups
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_posts' 
    AND column_name = 'slug'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_blog_posts_slug 
    ON blog_posts(slug);
    RAISE NOTICE '✅ Created index on blog_posts.slug';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Could not create blog_posts slug index: %', SQLERRM;
END $$;

-- Index on blog_posts.is_published for filtering
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_posts' 
    AND column_name = 'is_published'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published 
    ON blog_posts(is_published);
    
    -- Composite index for published posts by date
    CREATE INDEX IF NOT EXISTS idx_blog_posts_published_created_at 
    ON blog_posts(is_published, created_at DESC)
    WHERE is_published = true;
    
    RAISE NOTICE '✅ Created indexes on blog_posts.is_published';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Could not create blog_posts is_published index: %', SQLERRM;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Performance index creation complete!';
  RAISE NOTICE '📊 Indexes have been created successfully.';
  RAISE NOTICE '🚀 Your application should now load much faster!';
  RAISE NOTICE '============================================';
END $$;
