-- Run this SQL in your Supabase SQL Editor to fix payment_status NULL values
-- This will update all existing orders with NULL payment_status to 'unpaid'

UPDATE orders 
SET payment_status = 'unpaid' 
WHERE payment_status IS NULL;

-- Verify the update worked
SELECT id, order_number, payment_method, payment_status 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
