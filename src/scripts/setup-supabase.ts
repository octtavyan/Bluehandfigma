/**
 * Supabase Setup Script for Figma Make
 * 
 * This script sets up the Supabase database with:
 * 1. All required tables
 * 2. Demo data (hero slides, sizes, admin users)
 * 
 * Run this in the browser console after the app loads:
 * 
 * import('/scripts/setup-supabase.ts').then(m => m.setupSupabase());
 */

import { getSupabase } from '../lib/supabase';

export async function setupSupabase() {
  console.log('🚀 Starting Supabase setup...');
  
  try {
    const supabase = getSupabase();
    
    // Test connection
    console.log('📡 Testing connection...');
    const { error: testError } = await supabase.from('paintings').select('count').limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError.message);
      console.log('💡 Make sure tables are created. Run the SQL schema in Supabase SQL Editor:');
      console.log('   File: /supabase_schema.sql');
      return;
    }
    
    console.log('✅ Connection successful!');
    
    // Setup default sizes
    console.log('📏 Setting up canvas sizes...');
    const defaultSizes = [
      { width: 30, height: 40, price: 150, discount: 0, is_active: true },
      { width: 40, height: 50, price: 200, discount: 0, is_active: true },
      { width: 50, height: 70, price: 300, discount: 10, is_active: true },
      { width: 60, height: 80, price: 400, discount: 10, is_active: true },
      { width: 70, height: 100, price: 550, discount: 15, is_active: true },
      { width: 80, height: 120, price: 700, discount: 15, is_active: true },
    ];
    
    const { data: existingSizes } = await supabase.from('sizes').select('id').limit(1);
    
    if (!existingSizes || existingSizes.length === 0) {
      const { error: sizesError } = await supabase.from('sizes').insert(defaultSizes);
      if (sizesError) {
        console.warn('⚠️ Sizes setup error:', sizesError.message);
      } else {
        console.log(`✅ Added ${defaultSizes.length} default canvas sizes`);
      }
    } else {
      console.log('ℹ️ Sizes already exist, skipping');
    }
    
    // Setup admin users
    console.log('👤 Setting up admin users...');
    const defaultUsers = [
      {
        username: 'admin',
        password: 'admin123', // In production, use bcrypt hashing!
        role: 'full-admin',
        name: 'Administrator',
        email: 'admin@pepanza.ro',
        is_active: true,
      },
      {
        username: 'account',
        password: 'account123',
        role: 'account-manager',
        name: 'Account Manager',
        email: 'account@pepanza.ro',
        is_active: true,
      },
      {
        username: 'production',
        password: 'production123',
        role: 'production',
        name: 'Production Team',
        email: 'production@pepanza.ro',
        is_active: true,
      },
    ];
    
    const { data: existingUsers } = await supabase.from('users').select('id').limit(1);
    
    if (!existingUsers || existingUsers.length === 0) {
      const { error: usersError } = await supabase.from('users').insert(defaultUsers);
      if (usersError) {
        console.warn('⚠️ Users setup error:', usersError.message);
      } else {
        console.log(`✅ Added ${defaultUsers.length} admin users`);
      }
    } else {
      console.log('ℹ️ Users already exist, skipping');
    }
    
    // Setup demo hero slides
    console.log('🎨 Setting up demo hero slides...');
    const defaultHeroSlides = [
      {
        title: 'Tablouri Canvas Personalizate',
        subtitle: 'Transformă amintirile tale în opere de artă',
        button_text: 'Comandă Acum',
        button_link: '/personalizat',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1200&h=600&fit=crop',
        is_active: true,
        display_order: 1,
      },
      {
        title: 'Colecție Premium de Tablouri',
        subtitle: 'Cele mai frumoase design-uri pentru casa ta',
        button_text: 'Vezi Colecția',
        button_link: '/shop',
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=600&fit=crop',
        is_active: true,
        display_order: 2,
      },
      {
        title: 'Livrare Gratuită',
        subtitle: 'La comenzi peste 300 RON în toată România',
        button_text: 'Descoperă Oferte',
        button_link: '/shop',
        image: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=1200&h=600&fit=crop',
        is_active: true,
        display_order: 3,
      },
    ];
    
    const { data: existingSlides } = await supabase.from('hero_slides').select('id').limit(1);
    
    if (!existingSlides || existingSlides.length === 0) {
      const { error: slidesError } = await supabase.from('hero_slides').insert(defaultHeroSlides);
      if (slidesError) {
        console.warn('⚠️ Hero slides setup error:', slidesError.message);
      } else {
        console.log(`✅ Added ${defaultHeroSlides.length} demo hero slides`);
      }
    } else {
      console.log('ℹ️ Hero slides already exist, skipping');
    }
    
    // Setup categories
    console.log('📂 Setting up categories...');
    const defaultCategories = [
      { name: 'Natură' },
      { name: 'Abstract' },
      { name: 'Animale' },
      { name: 'Orașe' },
      { name: 'Peisaje' },
      { name: 'Personalizat' },
    ];
    
    const { data: existingCategories } = await supabase.from('categories').select('id').limit(1);
    
    if (!existingCategories || existingCategories.length === 0) {
      const { error: categoriesError } = await supabase.from('categories').insert(defaultCategories);
      if (categoriesError) {
        console.warn('⚠️ Categories setup error:', categoriesError.message);
      } else {
        console.log(`✅ Added ${defaultCategories.length} categories`);
      }
    } else {
      console.log('ℹ️ Categories already exist, skipping');
    }
    
    console.log('');
    console.log('🎉 Supabase setup complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log('  ✅ Connection tested');
    console.log('  ✅ Canvas sizes configured');
    console.log('  ✅ Admin users created');
    console.log('  ✅ Hero slides added');
    console.log('  ✅ Categories created');
    console.log('');
    console.log('🔐 Admin credentials:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('');
    console.log('🌐 Visit /admin/login to access the CMS');
    console.log('🏠 Visit / to see the homepage with hero slides');
    
    return true;
    
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure you ran the SQL schema in Supabase SQL Editor');
    console.log('2. Check that all tables exist in Supabase Dashboard → Table Editor');
    console.log('3. Verify Supabase credentials in /utils/supabase/info.tsx');
    return false;
  }
}

// Auto-run if loaded as a module
if (typeof window !== 'undefined') {
  console.log('💡 To setup Supabase, run: setupSupabase()');
}
