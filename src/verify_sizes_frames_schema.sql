-- ============================================
-- VERIFY & FIX: Supabase Schema for Sizes & Frame Types
-- Run this in Supabase SQL Editor to check/fix your schema
-- ============================================

-- ============================================
-- PART 1: VERIFY EXISTING SCHEMA
-- ============================================

-- Check if canvas_sizes table exists and show structure
DO $$
BEGIN
  RAISE NOTICE '=== CHECKING canvas_sizes TABLE ===';
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'canvas_sizes') THEN
    RAISE NOTICE '✅ canvas_sizes table EXISTS';
  ELSE
    RAISE NOTICE '❌ canvas_sizes table DOES NOT EXIST';
  END IF;
END $$;

-- Show canvas_sizes columns
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'canvas_sizes'
ORDER BY ordinal_position;

-- Check if frame_types table exists
DO $$
BEGIN
  RAISE NOTICE '=== CHECKING frame_types TABLE ===';
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'frame_types') THEN
    RAISE NOTICE '✅ frame_types table EXISTS';
  ELSE
    RAISE NOTICE '❌ frame_types table DOES NOT EXIST';
  END IF;
END $$;

-- Show frame_types columns
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'frame_types'
ORDER BY ordinal_position;

-- ============================================
-- PART 2: CHECK CURRENT DATA
-- ============================================

-- Show all canvas_sizes data
SELECT 
  id,
  width,
  height,
  price,
  discount,
  is_active,
  supports_print_canvas,
  supports_print_hartie,
  jsonb_pretty(frame_prices) as frame_prices
FROM canvas_sizes
ORDER BY width, height;

-- Show all frame_types data
SELECT 
  id,
  name,
  is_active,
  "order"
FROM frame_types
ORDER BY "order";

-- ============================================
-- PART 3: ADD MISSING COLUMNS (IF NEEDED)
-- ============================================

-- Add supports_print_canvas column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'canvas_sizes' 
    AND column_name = 'supports_print_canvas'
  ) THEN
    ALTER TABLE canvas_sizes ADD COLUMN supports_print_canvas BOOLEAN DEFAULT true;
    RAISE NOTICE '✅ Added supports_print_canvas column';
  ELSE
    RAISE NOTICE '✓ supports_print_canvas column already exists';
  END IF;
END $$;

-- Add supports_print_hartie column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'canvas_sizes' 
    AND column_name = 'supports_print_hartie'
  ) THEN
    ALTER TABLE canvas_sizes ADD COLUMN supports_print_hartie BOOLEAN DEFAULT true;
    RAISE NOTICE '✅ Added supports_print_hartie column';
  ELSE
    RAISE NOTICE '✓ supports_print_hartie column already exists';
  END IF;
END $$;

-- Add frame_prices column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'canvas_sizes' 
    AND column_name = 'frame_prices'
  ) THEN
    ALTER TABLE canvas_sizes ADD COLUMN frame_prices JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE '✅ Added frame_prices column';
  ELSE
    RAISE NOTICE '✓ frame_prices column already exists';
  END IF;
END $$;

-- ============================================
-- PART 4: EXPECTED SCHEMA DOCUMENTATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE 'EXPECTED SCHEMA FOR canvas_sizes:';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'id                     | uuid    | PRIMARY KEY';
  RAISE NOTICE 'width                  | integer | NOT NULL';
  RAISE NOTICE 'height                 | integer | NOT NULL';
  RAISE NOTICE 'price                  | numeric | DEFAULT 0';
  RAISE NOTICE 'discount               | numeric | DEFAULT 0';
  RAISE NOTICE 'is_active              | boolean | DEFAULT true';
  RAISE NOTICE 'supports_print_canvas  | boolean | DEFAULT true';
  RAISE NOTICE 'supports_print_hartie  | boolean | DEFAULT true';
  RAISE NOTICE 'frame_prices           | jsonb   | DEFAULT {}';
  RAISE NOTICE '';
  RAISE NOTICE 'frame_prices STRUCTURE:';
  RAISE NOTICE '{';
  RAISE NOTICE '  "Fara Rama": {';
  RAISE NOTICE '    "price": 0,';
  RAISE NOTICE '    "discount": 0,';
  RAISE NOTICE '    "availableForCanvas": true,';
  RAISE NOTICE '    "availableForPrint": true';
  RAISE NOTICE '  },';
  RAISE NOTICE '  "Rama Neagra": {';
  RAISE NOTICE '    "price": 25,';
  RAISE NOTICE '    "discount": 0,';
  RAISE NOTICE '    "availableForCanvas": true,';
  RAISE NOTICE '    "availableForPrint": true';
  RAISE NOTICE '  }';
  RAISE NOTICE '}';
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'EXPECTED SCHEMA FOR frame_types:';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'id        | uuid    | PRIMARY KEY';
  RAISE NOTICE 'name      | text    | NOT NULL';
  RAISE NOTICE 'is_active | boolean | DEFAULT true';
  RAISE NOTICE 'order     | integer | DEFAULT 0';
END $$;

-- ============================================
-- PART 5: SAMPLE DATA INSERT (OPTIONAL)
-- ============================================

-- Insert sample frame types if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM frame_types LIMIT 1) THEN
    INSERT INTO frame_types (name, is_active, "order") VALUES
      ('Fara Rama', true, 1),
      ('Rama Neagra', true, 2),
      ('Rama Alba', true, 3),
      ('Rama Lemn Natural', true, 4),
      ('Rama Aurie', true, 5)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✅ Inserted sample frame types';
  ELSE
    RAISE NOTICE '✓ frame_types table already has data';
  END IF;
END $$;

-- Insert sample canvas sizes if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM canvas_sizes LIMIT 1) THEN
    INSERT INTO canvas_sizes (
      width, 
      height, 
      price, 
      discount, 
      is_active, 
      supports_print_canvas, 
      supports_print_hartie, 
      frame_prices
    ) VALUES
      (30, 40, 150, 0, true, true, true, '{
        "Fara Rama": {"price": 0, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Neagra": {"price": 25, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Alba": {"price": 25, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Lemn Natural": {"price": 35, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Aurie": {"price": 40, "discount": 0, "availableForCanvas": true, "availableForPrint": true}
      }'::jsonb),
      (40, 60, 200, 0, true, true, true, '{
        "Fara Rama": {"price": 0, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Neagra": {"price": 35, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Alba": {"price": 35, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Lemn Natural": {"price": 45, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Aurie": {"price": 50, "discount": 0, "availableForCanvas": true, "availableForPrint": true}
      }'::jsonb),
      (50, 70, 250, 0, true, true, true, '{
        "Fara Rama": {"price": 0, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Neagra": {"price": 45, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Alba": {"price": 45, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Lemn Natural": {"price": 55, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Aurie": {"price": 60, "discount": 0, "availableForCanvas": true, "availableForPrint": true}
      }'::jsonb),
      (60, 90, 350, 0, true, true, true, '{
        "Fara Rama": {"price": 0, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Neagra": {"price": 55, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Alba": {"price": 55, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Lemn Natural": {"price": 65, "discount": 0, "availableForCanvas": true, "availableForPrint": true},
        "Rama Aurie": {"price": 70, "discount": 0, "availableForCanvas": true, "availableForPrint": true}
      }'::jsonb)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✅ Inserted sample canvas sizes with frame prices';
  ELSE
    RAISE NOTICE '✓ canvas_sizes table already has data';
  END IF;
END $$;

-- ============================================
-- PART 6: FIX NULL frame_prices (IF ANY EXIST)
-- ============================================

-- Update any rows with NULL frame_prices to empty object
UPDATE canvas_sizes 
SET frame_prices = '{}'::jsonb 
WHERE frame_prices IS NULL;

-- ============================================
-- PART 7: VERIFY RLS STATUS
-- ============================================

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('canvas_sizes', 'frame_types')
  AND schemaname = 'public';

DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE '🔒 RLS STATUS:';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'If RLS is enabled (true), you may need to disable it';
  RAISE NOTICE 'or create public read policies for development.';
  RAISE NOTICE '';
  RAISE NOTICE 'To disable RLS:';
  RAISE NOTICE 'ALTER TABLE canvas_sizes DISABLE ROW LEVEL SECURITY;';
  RAISE NOTICE 'ALTER TABLE frame_types DISABLE ROW LEVEL SECURITY;';
END $$;

-- ============================================
-- FINAL SUMMARY
-- ============================================

DO $$
DECLARE
  size_count INTEGER;
  frame_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO size_count FROM canvas_sizes;
  SELECT COUNT(*) INTO frame_count FROM frame_types;
  
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ VERIFICATION COMPLETE!';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'canvas_sizes records: %', size_count;
  RAISE NOTICE 'frame_types records: %', frame_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Check the query results above';
  RAISE NOTICE '2. Verify frame_prices structure matches expected format';
  RAISE NOTICE '3. Go to /supabase-test in your app to test connection';
  RAISE NOTICE '4. Check browser console for data loading';
END $$;
