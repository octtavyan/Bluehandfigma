-- Optional: Add full_name column to users table
-- Run this BEFORE creating the admin user if you want to store full names

-- Check current table structure
DESCRIBE users;

-- Add full_name column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) NULL AFTER email;

-- Verify column was added
DESCRIBE users;

-- Now you can use the original create_admin_user.sql script
-- Or run this:
INSERT INTO users (username, password_hash, email, full_name, role, is_active)
VALUES (
    'admin',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin@bluehand.ro',
    'Administrator',
    'full-admin',
    1
)
ON DUPLICATE KEY UPDATE
    password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    full_name = 'Administrator',
    is_active = 1;

-- Verify
SELECT id, username, email, full_name, role, is_active FROM users WHERE username = 'admin';
