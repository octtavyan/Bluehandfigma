-- Create Admin User for BlueHand Canvas
-- Run this SQL in your wiseguy_bluehand database

-- Create admin user with password "admin123"
-- Password hash generated with: password_hash('admin123', PASSWORD_DEFAULT)
INSERT INTO users (username, password_hash, email, full_name, role, is_active, created_at)
VALUES (
    'admin',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin@bluehand.ro',
    'Administrator',
    'full-admin',
    1,
    NOW()
)
ON DUPLICATE KEY UPDATE
    password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    is_active = 1;

-- Verify user was created
SELECT id, username, email, full_name, role, is_active FROM users WHERE username = 'admin';

-- DEFAULT CREDENTIALS:
-- Username: admin
-- Password: admin123
-- 
-- ⚠️ IMPORTANT: Change this password immediately after first login!
-- Go to Admin -> Users -> Edit Admin User
