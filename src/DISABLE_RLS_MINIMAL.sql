-- ============================================
-- DISABLE RLS - MINIMAL (Core Tables Only)
-- ============================================
-- Copy and paste this into Supabase SQL Editor
-- ============================================

ALTER TABLE canvas_sizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE frame_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE paintings DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
