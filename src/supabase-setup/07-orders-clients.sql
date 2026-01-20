-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  county TEXT,
  postal_code TEXT,
  person_type TEXT CHECK (person_type IN ('fizica', 'juridica')),
  company_name TEXT,
  cui TEXT,
  reg_com TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT,
  delivery_county TEXT,
  delivery_postal_code TEXT,
  delivery_option TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'unpaid',
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_cost DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'new',
  notes TEXT,
  person_type TEXT CHECK (person_type IN ('fizica', 'juridica')),
  company_name TEXT,
  cui TEXT,
  reg_com TEXT,
  company_county TEXT,
  company_city TEXT,
  company_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public can insert orders (for checkout)
CREATE POLICY "Allow public insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Authenticated full access
CREATE POLICY "Allow authenticated full access clients" ON clients
  FOR ALL USING (true);

CREATE POLICY "Allow authenticated full access orders" ON orders
  FOR ALL USING (true);
