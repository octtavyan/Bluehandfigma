# Add Invoice URL Column to Orders Table

## 🎯 Quick Setup

You need to add the `invoice_url` column to your `orders` table in Supabase.

### Option 1: Using Supabase Dashboard SQL Editor (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Paste this SQL:

```sql
-- Add invoice_url column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS invoice_url TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN orders.invoice_url IS 'Cloudinary URL for generated invoice PDF';

-- Create an index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_orders_invoice_url ON orders(invoice_url);
```

6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Option 2: Using Supabase Table Editor

1. Go to your Supabase Dashboard
2. Select your project
3. Go to **Table Editor** (left sidebar)
4. Select the `orders` table
5. Click **"+ New Column"** button
6. Fill in:
   - **Name**: `invoice_url`
   - **Type**: `text`
   - **Default value**: Leave empty
   - **Is nullable**: ✅ Yes (checked)
   - **Is unique**: ❌ No
7. Click **Save**

## ✅ Verify It's Working

After adding the column:

1. Go to any order with status "Livrat" in your admin panel
2. The invoice button should appear if one was previously generated
3. Change the status to something else, then back to "Livrat"
4. A new invoice will be generated and saved
5. The "Descarcă Factură" button should now appear

## 🔄 How the System Works Now

1. **First time status → "Livrat"**: 
   - ✅ Generates invoice
   - ✅ Saves Cloudinary URL to database (`invoice_url` column)
   - ✅ Sends email with invoice

2. **Status changed away from "Livrat" then back**:
   - ✅ Uses existing invoice (no regeneration)
   - ✅ Sends email with same invoice

3. **Click "Regenerează Factură" button**:
   - ✅ Creates new invoice
   - ✅ Updates database with new URL
   - ✅ Replaces old invoice

## 🐛 Troubleshooting

If the invoice still doesn't appear:

1. **Check browser console** for any errors
2. **Verify column was added**: Go to Supabase → Table Editor → orders → Check if `invoice_url` column exists
3. **Check existing orders**: The column will be NULL for old orders - just change their status to "Livrat" to generate invoices
4. **Clear browser cache**: Sometimes React needs a refresh after database schema changes

## 📝 Note

The column will be NULL for all existing orders. The invoice will be automatically generated the next time you:
- Change the order status to "Livrat"
- Click the "Regenerează Factură" button
