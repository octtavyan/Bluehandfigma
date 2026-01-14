# Supabase Database Migration Guide

## Missing Columns in Orders Table

The application now saves additional delivery information (city, county, postal code) for orders. You need to add these columns to your Supabase `orders` table.

### Required Columns to Add

Run the following SQL commands in your Supabase SQL Editor:

```sql
-- Add delivery city column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_city TEXT;

-- Add delivery county column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_county TEXT;

-- Add delivery postal code column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_postal_code TEXT;
```

### Verification

After running the migration, verify the columns were added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('delivery_city', 'delivery_county', 'delivery_postal_code');
```

### How to Run the Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to the **SQL Editor** in the left sidebar
4. Create a new query
5. Copy and paste the SQL commands above
6. Click **Run** to execute the migration

### Notes

- **Existing Orders**: Orders created before this migration will have these fields set to `NULL`. They will display as `-` in the CMS.
- **New Orders**: All new orders will automatically populate these fields with customer delivery information.
- **Backward Compatible**: The application handles missing data gracefully by showing `-` for empty fields.

### Rollback (if needed)

If you need to remove these columns:

```sql
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_city;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_county;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_postal_code;
```

## Testing

After running the migration:

1. Create a new test order through the checkout flow
2. Fill in all delivery information including city, county, and postal code
3. Complete the order
4. Go to CMS → Orders → View the new order
5. Verify that the delivery information (city, county, postal code) displays correctly in the "Informații Livrare" section

---

**Last Updated**: December 24, 2024
