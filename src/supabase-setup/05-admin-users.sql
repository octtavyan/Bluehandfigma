-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('full-admin', 'account-manager', 'production')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can access admin_users
CREATE POLICY "Allow authenticated full access admin_users" ON admin_users
  FOR ALL USING (true);

-- OPTIONAL: Create your first admin user (change password!)
-- Uncomment the line below and run separately if needed:

-- INSERT INTO admin_users (username, password, role, full_name, email, is_active)
-- VALUES ('admin', 'admin123', 'full-admin', 'Administrator', 'admin@bluehand.ro', true)
-- ON CONFLICT (username) DO NOTHING;
