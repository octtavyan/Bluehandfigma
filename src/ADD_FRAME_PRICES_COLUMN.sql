-- ============================================
-- ADD frame_prices COLUMN TO sizes TABLE
-- ============================================
-- This migration adds the frame_prices JSONB column to the sizes table
-- to store frame-specific pricing for each size

-- Add the frame_prices column to the sizes table
ALTER TABLE sizes ADD COLUMN IF NOT EXISTS frame_prices JSONB DEFAULT '{}';

-- Add a comment to document the column
COMMENT ON COLUMN sizes.frame_prices IS 'Stores frame prices for each frame type as a JSON object with frame_type_id as key and price as value';

-- Optional: Create an index on frame_prices for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_sizes_frame_prices ON sizes USING GIN (frame_prices);
