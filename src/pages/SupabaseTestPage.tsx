import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Use centralized client
import { projectId } from '../utils/supabase/info';

export default function SupabaseTestPage() {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [tables, setTables] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [rlsStatus, setRlsStatus] = useState<any>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {

    setStatus('🔍 Testing Supabase connection...');
    setTables([]);
    setErrors([]);

    try {
      // Test 1: Check RLS status first
      setStatus('🔒 Checking Row Level Security (RLS) status...');
      const { data: rlsData, error: rlsError } = await supabase
        .from('pg_tables')
        .select('tablename, rowsecurity')
        .in('tablename', ['canvas_sizes', 'frame_types', 'categories', 'orders', 'admin_users']);
      
      if (!rlsError && rlsData) {
        setRlsStatus(rlsData);
        console.log('🔒 RLS Status:', rlsData);
      }

      // Test 2: Check canvas_sizes table
      setStatus('📊 Querying canvas_sizes table...');
      const { data: sizes, error: sizesError } = await supabase
        .from('canvas_sizes')
        .select('*')
        .limit(100);

      if (sizesError) {
        console.error('❌ canvas_sizes error:', sizesError);
        setErrors(prev => [...prev, { 
          table: 'canvas_sizes', 
          error: sizesError,
          message: sizesError.message,
          hint: sizesError.hint,
          details: sizesError.details
        }]);
      } else {
        console.log('✅ canvas_sizes data:', sizes);
        setTables(prev => [...prev, { 
          name: 'canvas_sizes', 
          count: sizes?.length || 0, 
          data: sizes,
          columns: sizes?.[0] ? Object.keys(sizes[0]) : []
        }]);
      }

      // Test 3: Check frame_types table
      setStatus('📊 Querying frame_types table...');
      const { data: frameTypes, error: frameTypesError } = await supabase
        .from('frame_types')
        .select('*');

      if (frameTypesError) {
        console.error('❌ frame_types error:', frameTypesError);
        setErrors(prev => [...prev, { 
          table: 'frame_types', 
          error: frameTypesError,
          message: frameTypesError.message 
        }]);
      } else {
        console.log('✅ frame_types data:', frameTypes);
        setTables(prev => [...prev, { 
          name: 'frame_types', 
          count: frameTypes?.length || 0, 
          data: frameTypes 
        }]);
      }

      // Test 4: Check categories table
      setStatus('📊 Querying categories table...');
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) {
        console.error('❌ Categories error:', categoriesError);
        setErrors(prev => [...prev, { table: 'categories', error: categoriesError }]);
      } else {
        console.log('✅ Categories data:', categories);
        setTables(prev => [...prev, { name: 'categories', count: categories?.length || 0, data: categories }]);
      }

      // Test 5: Check orders table
      setStatus('📊 Querying orders table...');
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, email, status, total_price, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersError) {
        console.error('❌ Orders error:', ordersError);
        setErrors(prev => [...prev, { table: 'orders', error: ordersError }]);
      } else {
        console.log('✅ Orders data:', orders);
        setTables(prev => [...prev, { name: 'orders', count: orders?.length || 0, data: orders }]);
      }

      // Test 6: Check admin_users table
      setStatus('📊 Querying admin_users table...');
      const { data: users, error: usersError } = await supabase
        .from('admin_users')
        .select('id, username, full_name, role, is_active');

      if (usersError) {
        console.error('❌ Admin users error:', usersError);
        setErrors(prev => [...prev, { table: 'admin_users', error: usersError }]);
      } else {
        console.log('✅ Admin users data:', users);
        setTables(prev => [...prev, { name: 'admin_users', count: users?.length || 0, data: users }]);
      }

      if (errors.length > 0 || sizesError || frameTypesError) {
        setStatus('❌ Errors detected - likely RLS blocking queries');
      } else {
        setStatus('✅ Connection test complete - All tables accessible!');
      }
    } catch (err) {
      console.error('💥 Test failed:', err);
      setErrors(prev => [...prev, { table: 'general', error: err }]);
      setStatus('❌ Test failed - check console');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔧 Supabase Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Info</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><strong>Project ID:</strong> {projectId}</p>
            <p><strong>URL:</strong> https://{projectId}.supabase.co</p>
            <p><strong>Status:</strong> <span className={status.includes('❌') ? 'text-red-600 font-bold' : status.includes('✅') ? 'text-green-600 font-bold' : 'text-blue-600'}>{status}</span></p>
          </div>
        </div>

        {/* RLS Status */}
        {rlsStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">🔒 Row Level Security Status</h2>
            <div className="space-y-2">
              {rlsStatus.map((table: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-mono">{table.tablename}:</span>
                  <span className={table.rowsecurity ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                    {table.rowsecurity ? '🔒 RLS ENABLED (may block queries)' : '✅ RLS DISABLED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors Section */}
        {errors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-red-800 mb-4">❌ ERRORS DETECTED</h2>
            
            {errors.map((err, idx) => (
              <div key={idx} className="mb-4 p-4 bg-red-100 rounded">
                <h3 className="font-bold text-red-900 mb-2">Table: {err.table}</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Message:</strong> {err.message || err.error?.message}</p>
                  {err.hint && <p><strong>Hint:</strong> {err.hint}</p>}
                  {err.details && <p><strong>Details:</strong> {err.details}</p>}
                  <pre className="text-xs overflow-auto bg-red-200 p-2 rounded mt-2">
                    {JSON.stringify(err.error, null, 2)}
                  </pre>
                </div>
              </div>
            ))}

            {/* FIX INSTRUCTIONS */}
            <div className="mt-6 p-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
              <h3 className="text-xl font-bold text-yellow-900 mb-4">🔧 HOW TO FIX TIMEOUT ERRORS:</h3>
              
              <div className="space-y-4">
                <div className="bg-orange-100 border-2 border-orange-400 p-4 rounded">
                  <h4 className="font-bold text-orange-900 mb-2">⚡ FIX TIMEOUT: Add Database Indexes</h4>
                  <p className="text-sm mb-2">Timeouts happen when queries are slow. Add indexes to speed them up:</p>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded text-xs overflow-auto">
{`-- Add indexes to fix timeouts:
CREATE INDEX IF NOT EXISTS idx_paintings_created_at ON paintings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_paintings_active_category ON paintings(is_active, category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, created_at DESC);

-- Verify indexes:
SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;`}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`-- Add indexes to fix timeouts:
CREATE INDEX IF NOT EXISTS idx_paintings_created_at ON paintings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_paintings_active_category ON paintings(is_active, category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, created_at DESC);

-- Verify indexes:
SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;`);
                      alert('✅ Index SQL copied! Paste in Supabase SQL Editor and run.');
                    }}
                    className="mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    📋 Copy Index SQL (FIX TIMEOUTS)
                  </button>
                </div>
              
                <div>
                  <h4 className="font-bold text-yellow-900 mb-2">Option 1: Disable RLS (Quick Fix for Development)</h4>
                  <ol className="list-decimal ml-6 space-y-2 text-sm">
                    <li>
                      <a 
                        href={`https://supabase.com/dashboard/project/${projectId}/editor`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline font-semibold"
                      >
                        Open Supabase Table Editor →
                      </a>
                    </li>
                    <li>Click on <strong>canvas_sizes</strong> table</li>
                    <li>Click the <strong>"..."</strong> menu (top right)</li>
                    <li>Click <strong>"Edit table"</strong></li>
                    <li>Scroll to <strong>"Row Level Security (RLS)"</strong></li>
                    <li>Toggle it <strong>OFF</strong></li>
                    <li>Click <strong>"Save"</strong></li>
                    <li>Repeat for: <strong>frame_types, paintings, categories, orders, admin_users</strong></li>
                  </ol>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-yellow-900 mb-2">Option 2: Run This SQL to Disable RLS (FIXED - No Errors)</h4>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded text-xs overflow-auto">
{`-- Run this in Supabase SQL Editor:
-- CORE TABLES (required)
ALTER TABLE canvas_sizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE frame_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE paintings DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`-- CORE TABLES (required)
ALTER TABLE canvas_sizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE frame_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE paintings DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`);
                      alert('✅ SQL copied to clipboard!');
                    }}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    📋 Copy FIXED SQL to Clipboard
                  </button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-yellow-900 mb-2">Option 3: Enable Public Read Access</h4>
                  <p className="text-sm mb-2">If you want to keep RLS enabled:</p>
                  <ol className="list-decimal ml-6 space-y-2 text-sm">
                    <li>
                      <a 
                        href={`https://supabase.com/dashboard/project/${projectId}/auth/policies`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline font-semibold"
                      >
                        Open Authentication → Policies →
                      </a>
                    </li>
                    <li>For each table, click <strong>"New Policy"</strong></li>
                    <li>Select: <strong>"Enable read access for all users"</strong></li>
                    <li>Click <strong>"Review"</strong> → <strong>"Save Policy"</strong></li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success: Show Tables */}
        <div className="space-y-6">
          {tables.map((table, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6 border-2 border-green-200">
              <h2 className="text-xl font-semibold mb-4">
                ✅ Table: <span className="text-green-600 font-bold">{table.name}</span>
                <span className="ml-4 text-sm text-gray-500">({table.count} rows)</span>
              </h2>
              
              {table.columns && table.columns.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-sm text-gray-700">Columns:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {table.columns.map((col: string) => (
                      <span key={col} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {table.count > 0 ? (
                <div className="overflow-auto max-h-96">
                  <pre className="text-xs bg-gray-50 p-4 rounded border">
                    {JSON.stringify(table.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-gray-500 italic">No data found (table exists but is empty)</p>
              )}
            </div>
          ))}
        </div>

        {tables.length === 0 && errors.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-800">⏳ Running tests... Check console for details</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 flex-wrap">
          <button
            onClick={testConnection}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            🔄 Re-run Tests
          </button>
          <a
            href={`https://supabase.com/dashboard/project/${projectId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold inline-block"
          >
            🌐 Open Supabase Dashboard
          </a>
          <a
            href={`https://supabase.com/dashboard/project/${projectId}/editor`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold inline-block"
          >
            📊 Open Table Editor
          </a>
          <a
            href={`https://supabase.com/dashboard/project/${projectId}/sql/new`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold inline-block"
          >
            💻 Open SQL Editor
          </a>
        </div>
      </div>
    </div>
  );
}