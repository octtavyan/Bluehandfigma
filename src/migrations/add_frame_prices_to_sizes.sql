-- Migration: Add frame_prices column to sizes table
-- This allows each size to have different prices for each frame type

-- Add the frame_prices column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sizes' 
    AND column_name = 'frame_prices'
  ) THEN
    ALTER TABLE sizes 
    ADD COLUMN frame_prices JSONB DEFAULT '{}'::jsonb;
    
    RAISE NOTICE 'Column frame_prices added successfully';
  ELSE
    RAISE NOTICE 'Column frame_prices already exists';
  END IF;
END $$;

-- Create an index for better query performance on the JSONB column
CREATE INDEX IF NOT EXISTS idx_sizes_frame_prices ON sizes USING GIN (frame_prices);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'sizes' AND column_name = 'frame_prices';

-- Show current sizes with frame_prices
SELECT id, width, height, price, discount, is_active, frame_prices
FROM sizes
ORDER BY width, height;
