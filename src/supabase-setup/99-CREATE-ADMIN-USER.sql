-- ============================================
-- CREATE ADMIN USER FOR BLUEHAND CANVAS
-- ============================================
-- Run this AFTER running 00-RUN-ALL-AT-ONCE.sql
-- ============================================

-- Create your first admin user
INSERT INTO admin_users (username, password, role, full_name, email, is_active)
VALUES ('admin', 'admin123', 'full-admin', 'Administrator', 'admin@bluehand.ro', true)
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- LOGIN CREDENTIALS:
-- ============================================
-- URL: /admin/login
-- Username: admin
-- Password: admin123
-- 
-- ⚠️ IMPORTANT: Change the password after first login!
-- ============================================
