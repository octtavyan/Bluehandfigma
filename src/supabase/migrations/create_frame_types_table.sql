-- Migration: Create frame_types table
-- This SQL should be run in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS frame_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default frame types
INSERT INTO frame_types (id, name, price, discount, is_active, "order") VALUES
  ('frame-1', 'Fara Rama', 0, 0, true, 1),
  ('frame-2', 'Alba', 50.00, 0, true, 2),
  ('frame-3', 'Neagra', 50.00, 0, true, 3),
  ('frame-4', 'Rosie', 60.00, 10, true, 4),
  ('frame-5', 'Lemn Natural', 75.00, 0, true, 5)
ON CONFLICT (id) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_frame_types_active ON frame_types(is_active);
CREATE INDEX IF NOT EXISTS idx_frame_types_order ON frame_types("order");

-- Enable RLS (Row Level Security)
ALTER TABLE frame_types ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your needs)
CREATE POLICY "Allow all operations on frame_types" ON frame_types
  FOR ALL
  USING (true)
  WITH CHECK (true);