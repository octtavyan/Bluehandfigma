-- Migration: Add Print Type Support to Sizes Table
-- This migration adds columns to control which print types (Canvas/Hartie) each size supports
-- Run this SQL in your Supabase SQL Editor

-- Add columns for print type support (default to true for backwards compatibility)
ALTER TABLE sizes 
ADD COLUMN IF NOT EXISTS supports_print_canvas BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS supports_print_hartie BOOLEAN DEFAULT true;

-- Update existing rows to support both print types (backwards compatibility)
UPDATE sizes 
SET supports_print_canvas = true, 
    supports_print_hartie = true
WHERE supports_print_canvas IS NULL OR supports_print_hartie IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN sizes.supports_print_canvas IS 'Whether this size is available for Print Canvas products';
COMMENT ON COLUMN sizes.supports_print_hartie IS 'Whether this size is available for Print Hartie products';
