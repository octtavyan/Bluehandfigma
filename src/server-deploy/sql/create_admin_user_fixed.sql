-- Create Admin User for BlueHand Canvas
-- Run this SQL in your wiseguy_bluehand database

-- First, let's see what columns the users table has
DESCRIBE users;

-- Create admin user with password "admin123"
-- Using only the columns that exist in the table
INSERT INTO users (username, password_hash, email, role, is_active)
VALUES (
    'admin',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin@bluehand.ro',
    'full-admin',
    1
)
ON DUPLICATE KEY UPDATE
    password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    is_active = 1;

-- Verify user was created
SELECT id, username, email, role, is_active FROM users WHERE username = 'admin';

-- DEFAULT CREDENTIALS:
-- Username: admin
-- Password: admin123
-- 
-- ⚠️ IMPORTANT: Change this password immediately after first login!
