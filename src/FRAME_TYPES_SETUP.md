# Frame Types System - Database Setup Guide

## 📋 Overview
This guide will help you set up the `frame_types` table in your Supabase database to enable the Frame Types management system.

## ⚠️ Required Action
You MUST run the SQL migration below in your Supabase SQL Editor before the Frame Types system will work.

## 🔧 Setup Steps

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Copy and Run the Migration SQL
Copy the SQL below and paste it into the SQL Editor, then click **Run**:

```sql
-- ============================================
-- CREATE frame_types TABLE
-- ============================================
-- This migration creates the frame_types table
-- to store frame type definitions with prices and discounts

CREATE TABLE IF NOT EXISTS frame_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_frame_types_active ON frame_types(is_active);
CREATE INDEX IF NOT EXISTS idx_frame_types_order ON frame_types("order");

-- Enable RLS (Row Level Security)
ALTER TABLE frame_types ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on frame_types" ON frame_types
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### Step 3: Verify Success
After running the SQL, you should see:
- ✅ "Success. No rows returned" message in Supabase
- Or a success indicator showing the table was created

### Step 4: Test in the Application
1. Go to your admin panel: `/admin/frame-types`
2. You should see the 5 default frame types listed
3. Try adding, editing, or toggling a frame type
4. Verify changes persist after page refresh

## 📊 What This Creates

### Table Structure
- **id**: Unique identifier (UUID)
- **name**: Frame type name (e.g., "Alba", "Neagra")
- **price**: Base price in RON
- **discount**: Discount percentage (0-100)
- **is_active**: Whether the frame type is available
- **order**: Display order (for sorting)
- **created_at**: Creation timestamp
- **updated_at**: Last update timestamp

### Default Frame Types
1. **Fara Rama** - 0.00 lei (Free, no frame)
2. **Alba** - 50.00 lei (White frame)
3. **Neagra** - 50.00 lei (Black frame)
4. **Rosie** - 60.00 lei with 10% discount = 54.00 lei (Red frame)
5. **Lemn Natural** - 75.00 lei (Natural wood frame)

## 🔍 How It Works

### Admin Interface
- Manage frame types at `/admin/frame-types`
- Add, edit, delete frame types
- Set prices and discounts
- Toggle active/inactive status
- Reorder display order

### Painting Configuration
- When adding/editing paintings, select which frame types are available
- Frame types can be configured per print type (Print Canvas vs Print Hartie)
- Frame types are stored as ID arrays in painting metadata

### Frontend Display
- Active frame types appear in product detail pages
- Users can select their preferred frame type
- Prices are calculated dynamically with discounts applied
- Cart shows frame type selections with pricing

## 🛠️ Troubleshooting

### If the table already exists
The migration uses `IF NOT EXISTS`, so it's safe to run multiple times.

### If you get permission errors
Make sure you're using the SQL Editor with your service role key (automatically handled in Supabase dashboard).

### If frame types don't appear in admin
1. Check browser console for errors
2. Verify the table was created in Supabase Table Editor
3. Clear browser cache and refresh
4. Check that RLS policy is enabled

## 📝 Migration File Location
The SQL migration is also saved at:
`/supabase/migrations/create_frame_types_table.sql`

## ✅ After Setup
Once the table is created, the Frame Types system will:
- ✅ Load frame types from Supabase on admin panel load
- ✅ Cache frame types for 2 hours to reduce database calls
- ✅ Allow full CRUD operations via the admin interface
- ✅ Automatically integrate with painting add/edit flows
- ✅ Display in frontend product pages (when implemented)
