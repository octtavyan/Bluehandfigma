import { getSupabase } from './supabase';

export async function runOrdersMigration() {
  const supabase = getSupabase();
  
  console.log('Running migration: Adding delivery fields to orders table...');
  
  try {
    // Add delivery_city column
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_city TEXT;`
    });
    
    if (error1) {
      console.log('Note: RPC method not available, columns may already exist or need manual migration');
    }
    
    // Try alternative approach - just try to read the columns to verify they exist
    const { data, error } = await supabase
      .from('orders')
      .select('delivery_city, delivery_county, delivery_postal_code')
      .limit(1);
    
    if (error) {
      console.error('Migration check failed:', error);
      console.log('Please run the following SQL in your Supabase SQL Editor:');
      console.log(`
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_county TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_postal_code TEXT;
      `);
      return false;
    }
    
    console.log('✅ Migration verified: Delivery columns exist');
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}
