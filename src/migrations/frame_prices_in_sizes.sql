-- Migration: Move frame prices from frame_types to sizes table
-- This allows each size to have different frame prices

-- Step 1: Remove price and discount columns from frame_types
ALTER TABLE frame_types DROP COLUMN IF EXISTS price;
ALTER TABLE frame_types DROP COLUMN IF EXISTS discount;

-- Step 2: Add frame_prices JSONB column to sizes table
ALTER TABLE sizes ADD COLUMN IF NOT EXISTS frame_prices JSONB DEFAULT '{}'::jsonb;

-- Step 3: Set default frame prices for existing sizes
-- Format: { "frame-1": { "price": 0, "discount": 0 }, "frame-2": { "price": 50, "discount": 0 }, ... }
UPDATE sizes
SET frame_prices = jsonb_build_object(
  'frame-1', jsonb_build_object('price', 0, 'discount', 0),
  'frame-2', jsonb_build_object('price', 50, 'discount', 0),
  'frame-3', jsonb_build_object('price', 50, 'discount', 0),
  'frame-4', jsonb_build_object('price', 60, 'discount', 10),
  'frame-5', jsonb_build_object('price', 75, 'discount', 0)
)
WHERE frame_prices = '{}'::jsonb OR frame_prices IS NULL;

-- Step 4: Create index for better performance on frame_prices queries
CREATE INDEX IF NOT EXISTS idx_sizes_frame_prices ON sizes USING gin(frame_prices);
