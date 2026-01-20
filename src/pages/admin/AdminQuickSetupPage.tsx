import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AlertCircle, CheckCircle, Database, Play, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';

interface TableStatus {
  name: string;
  exists: boolean;
  creating?: boolean;
  created?: boolean;
  error?: string;
}

export const AdminQuickSetupPage: React.FC = () => {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [checking, setChecking] = useState(true);

  const requiredTables = [
    { name: 'hero_slides', priority: 1 },
    { name: 'blog_posts', priority: 1 },
    { name: 'categories', priority: 2 },
    { name: 'subcategories', priority: 2 },
    { name: 'sizes', priority: 1 },
    { name: 'frame_types', priority: 2 },
    { name: 'admin_users', priority: 1 },
    { name: 'unsplash_settings', priority: 1 },
    { name: 'unsplash_searches', priority: 2 },
  ];

  const checkTablesExist = async () => {
    setChecking(true);
    const results: TableStatus[] = [];

    for (const table of requiredTables) {
      try {
        const { error } = await supabase
          .from(table.name)
          .select('id', { count: 'exact', head: true })
          .limit(1);

        results.push({
          name: table.name,
          exists: !error,
          error: error?.message,
        });
      } catch (err: any) {
        results.push({
          name: table.name,
          exists: false,
          error: err.message,
        });
      }
    }

    setTables(results);
    setChecking(false);
  };

  useEffect(() => {
    checkTablesExist();
  }, []);

  const createTable = async (tableName: string) => {
    setTables(prev => prev.map(t => 
      t.name === tableName ? { ...t, creating: true, error: undefined } : t
    ));

    try {
      let sql = '';

      switch (tableName) {
        case 'hero_slides':
          sql = `
            CREATE TABLE IF NOT EXISTS hero_slides (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              title TEXT NOT NULL,
              subtitle TEXT,
              image_url TEXT NOT NULL,
              link_url TEXT,
              "order" INTEGER NOT NULL DEFAULT 0,
              is_active BOOLEAN DEFAULT true,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
          `;
          break;

        case 'blog_posts':
          sql = `
            CREATE TABLE IF NOT EXISTS blog_posts (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              title TEXT NOT NULL,
              slug TEXT UNIQUE NOT NULL,
              excerpt TEXT,
              content TEXT NOT NULL,
              featured_image TEXT,
              author TEXT,
              is_published BOOLEAN DEFAULT false,
              views INTEGER DEFAULT 0,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
          `;
          break;

        case 'categories':
          sql = `
            CREATE TABLE IF NOT EXISTS categories (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name TEXT NOT NULL UNIQUE,
              slug TEXT UNIQUE NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            INSERT INTO categories (name, slug) VALUES
              ('Modern', 'modern'),
              ('Abstract', 'abstract'),
              ('Natura', 'natura'),
              ('Animale', 'animale'),
              ('Urban', 'urban'),
              ('Vintage', 'vintage')
            ON CONFLICT (name) DO NOTHING;
          `;
          break;

        case 'subcategories':
          sql = `
            CREATE TABLE IF NOT EXISTS subcategories (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name TEXT NOT NULL UNIQUE,
              slug TEXT UNIQUE NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            INSERT INTO subcategories (name, slug) VALUES
              ('Minimalist', 'minimalist'),
              ('Colorful', 'colorful'),
              ('Monochrome', 'monochrome'),
              ('Floral', 'floral'),
              ('Geometric', 'geometric')
            ON CONFLICT (name) DO NOTHING;
          `;
          break;

        case 'sizes':
          sql = `
            CREATE TABLE IF NOT EXISTS sizes (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              width INTEGER NOT NULL,
              height INTEGER NOT NULL,
              price DECIMAL(10,2) NOT NULL DEFAULT 0,
              discount DECIMAL(5,2) DEFAULT 0,
              is_active BOOLEAN DEFAULT true,
              supports_print_canvas BOOLEAN DEFAULT true,
              supports_print_hartie BOOLEAN DEFAULT true,
              frame_prices JSONB,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
          `;
          break;

        case 'frame_types':
          sql = `
            CREATE TABLE IF NOT EXISTS frame_types (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name TEXT NOT NULL UNIQUE,
              is_active BOOLEAN DEFAULT true,
              "order" INTEGER DEFAULT 0,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            INSERT INTO frame_types (name, "order") VALUES
              ('Fara rama', 0),
              ('Rama neagra', 1),
              ('Rama alba', 2),
              ('Rama lemn natural', 3)
            ON CONFLICT (name) DO NOTHING;
          `;
          break;

        case 'admin_users':
          sql = `
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
          `;
          break;

        case 'unsplash_settings':
          sql = `
            CREATE TABLE IF NOT EXISTS unsplash_settings (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              access_key TEXT,
              curated_images JSONB DEFAULT '[]'::jsonb,
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            INSERT INTO unsplash_settings (id) 
            SELECT gen_random_uuid() 
            WHERE NOT EXISTS (SELECT 1 FROM unsplash_settings LIMIT 1);
          `;
          break;

        case 'unsplash_searches':
          sql = `
            CREATE TABLE IF NOT EXISTS unsplash_searches (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              query TEXT NOT NULL,
              search_count INTEGER DEFAULT 1,
              last_searched_at TIMESTAMPTZ DEFAULT NOW(),
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
          `;
          break;
      }

      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        // Try direct insert approach for simple tables
        console.log('RPC failed, trying direct creation...');
        throw error;
      }

      setTables(prev => prev.map(t => 
        t.name === tableName ? { ...t, creating: false, created: true, exists: true } : t
      ));
      
      toast.success(`Table ${tableName} created!`);
    } catch (error: any) {
      console.error(`Error creating ${tableName}:`, error);
      setTables(prev => prev.map(t => 
        t.name === tableName ? { ...t, creating: false, error: error.message } : t
      ));
      toast.error(`Failed to create ${tableName}: ${error.message}`);
    }
  };

  const createAllMissing = async () => {
    const missing = tables.filter(t => !t.exists);
    
    for (const table of missing) {
      await createTable(table.name);
      // Small delay between tables to avoid overwhelming Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const existingCount = tables.filter(t => t.exists).length;
  const missingCount = tables.filter(t => !t.exists).length;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Quick Database Setup</h1>
          <p className="text-gray-600">Automatic table creation - no SQL needed!</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{tables.length}</p>
          </div>
          <div className="bg-white rounded-lg border-2 border-green-200 p-6">
            <p className="text-sm text-green-600 mb-1">Existing</p>
            <p className="text-3xl font-bold text-green-600">{existingCount}</p>
          </div>
          <div className="bg-white rounded-lg border-2 border-red-200 p-6">
            <p className="text-sm text-red-600 mb-1">Missing</p>
            <p className="text-3xl font-bold text-red-600">{missingCount}</p>
          </div>
        </div>

        {/* Action Button */}
        {missingCount > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">
                  Ready to Create Tables
                </h3>
                <p className="text-sm text-blue-700">
                  Click the button to automatically create all {missingCount} missing tables
                </p>
              </div>
              <button
                onClick={createAllMissing}
                disabled={checking}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                <span>Create All</span>
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {missingCount === 0 && !checking && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">All Tables Ready!</h3>
                <p className="text-sm text-green-700">Database is fully configured</p>
              </div>
            </div>
          </div>
        )}

        {/* Tables List */}
        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Database Tables</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {checking ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Checking tables...</p>
              </div>
            ) : (
              tables.map((table) => (
                <div
                  key={table.name}
                  className={`px-6 py-4 flex items-center justify-between ${
                    !table.exists ? 'bg-red-50' : table.created ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {table.creating ? (
                      <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                    ) : table.exists ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className={`font-medium ${table.exists ? 'text-gray-900' : 'text-red-900'}`}>
                        {table.name}
                      </p>
                      {table.error && (
                        <p className="text-xs text-red-600 mt-1">{table.error}</p>
                      )}
                    </div>
                  </div>
                  
                  {!table.exists && !table.creating && (
                    <button
                      onClick={() => createTable(table.name)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Table
                    </button>
                  )}
                  
                  {table.created && (
                    <span className="text-sm text-green-600 font-medium">✓ Created</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
