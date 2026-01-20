-- ============================================
-- CREATE LEGAL_PAGES TABLE
-- ============================================
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/sql/new
-- ============================================

-- Create legal_pages table
CREATE TABLE IF NOT EXISTS legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('terms', 'gdpr')),
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on type (only one of each type)
CREATE UNIQUE INDEX IF NOT EXISTS idx_legal_pages_type ON legal_pages(type);

-- Disable RLS (for development)
ALTER TABLE legal_pages DISABLE ROW LEVEL SECURITY;

-- Insert default data
INSERT INTO legal_pages (type, content) VALUES
('terms', '<h2>Termeni și Condiții</h2><p>Conținut implicit pentru Termeni și Condiții...</p>'),
('gdpr', '<h2>Politica GDPR</h2><p>Conținut implicit pentru Politica de Confidențialitate...</p>')
ON CONFLICT (type) DO NOTHING;

-- Verify table was created
SELECT * FROM legal_pages;
