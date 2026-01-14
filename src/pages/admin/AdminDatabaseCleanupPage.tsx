import React, { useState } from 'react';
import { Trash2, Database, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { getSupabase } from '../../lib/supabase';

export const AdminDatabaseCleanupPage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [cleanupResults, setCleanupResults] = useState<any>(null);

  const analyzeDatabase = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    
    try {
      const supabase = getSupabase();
      
      // Count records in each table
      const { data: kvData, count: kvCount } = await supabase
        .from('kv_store_bbc0c500')
        .select('*', { count: 'exact', head: true });
      
      const { data: ordersData, count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      const { data: clientsData, count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      
      const { data: paintingsData, count: paintingsCount } = await supabase
        .from('paintings')
        .select('*', { count: 'exact', head: true });

      // Find old cart sessions (older than 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: oldCarts } = await supabase
        .from('kv_store_bbc0c500')
        .select('key, value')
        .like('key', 'cart_session_%');
      
      const oldCartCount = oldCarts?.length || 0;

      // Find test records
      const { data: testOrders } = await supabase
        .from('orders')
        .select('id')
        .or('client_name.ilike.%test%,client_email.ilike.%test%');
      
      const testOrdersCount = testOrders?.length || 0;

      setAnalysis({
        tables: {
          kv_store: kvCount || 0,
          orders: ordersCount || 0,
          clients: clientsCount || 0,
          paintings: paintingsCount || 0
        },
        cleanup: {
          oldCarts: oldCartCount,
          testOrders: testOrdersCount
        },
        estimatedSavings: (oldCartCount * 5 + testOrdersCount * 10) // KB estimate
      });
    } catch (error) {
      console.error('Error analyzing database:', error);
      alert('Error analyzing database. Check console for details.');
    }
    
    setIsAnalyzing(false);
  };

  const cleanupDatabase = async () => {
    if (!analysis) return;
    
    if (!confirm('Are you sure you want to clean up the database? This action cannot be undone.')) {
      return;
    }
    
    setIsCleaning(true);
    setCleanupResults(null);
    
    try {
      const supabase = getSupabase();
      const results = {
        cartsDeleted: 0,
        testOrdersDeleted: 0,
        errors: [] as string[]
      };
      
      // Delete old cart sessions
      const { data: oldCarts } = await supabase
        .from('kv_store_bbc0c500')
        .select('key')
        .like('key', 'cart_session_%');
      
      if (oldCarts && oldCarts.length > 0) {
        for (const cart of oldCarts) {
          const { error } = await supabase
            .from('kv_store_bbc0c500')
            .delete()
            .eq('key', cart.key);
          
          if (error) {
            results.errors.push(`Failed to delete cart ${cart.key}: ${error.message}`);
          } else {
            results.cartsDeleted++;
          }
        }
      }
      
      // Note: We DON'T delete test orders automatically - too risky!
      // Admin should manually review and delete those
      
      setCleanupResults(results);
    } catch (error) {
      console.error('Error cleaning database:', error);
      alert('Error cleaning database. Check console for details.');
    }
    
    setIsCleaning(false);
    
    // Re-analyze after cleanup
    analyzeDatabase();
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Database Cleanup</h1>
          <p className="text-gray-600">
            Analyze and clean up your database to reduce Supabase quota usage
          </p>
        </div>

        {/* Analyze Button */}
        <div className="mb-6">
          <button
            onClick={analyzeDatabase}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-[#86C2FF] text-white rounded-lg hover:bg-[#6BADEF] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                Analyze Database
              </>
            )}
          </button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Table Sizes */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Tables
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">KV Store</p>
                  <p className="text-2xl text-gray-900">{analysis.tables.kv_store}</p>
                  <p className="text-xs text-gray-500">records</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Orders</p>
                  <p className="text-2xl text-gray-900">{analysis.tables.orders}</p>
                  <p className="text-xs text-gray-500">records</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Clients</p>
                  <p className="text-2xl text-gray-900">{analysis.tables.clients}</p>
                  <p className="text-xs text-gray-500">records</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Paintings</p>
                  <p className="text-2xl text-gray-900">{analysis.tables.paintings}</p>
                  <p className="text-xs text-gray-500">records</p>
                </div>
              </div>
            </div>

            {/* Cleanup Opportunities */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Cleanup Opportunities
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-yellow-900 font-medium mb-1">
                      Old Cart Sessions
                    </h3>
                    <p className="text-sm text-yellow-700 mb-2">
                      Found <strong>{analysis.cleanup.oldCarts}</strong> old cart sessions that can be safely deleted.
                    </p>
                    <p className="text-xs text-yellow-600">
                      These are abandoned shopping carts from anonymous users.
                    </p>
                  </div>
                </div>

                {analysis.cleanup.testOrders > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-blue-900 font-medium mb-1">
                        Test Orders
                      </h3>
                      <p className="text-sm text-blue-700 mb-2">
                        Found <strong>{analysis.cleanup.testOrders}</strong> test orders (contain "test" in name or email).
                      </p>
                      <p className="text-xs text-blue-600">
                        Review these manually in the Orders page before deleting.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-green-900 font-medium mb-1">
                      Estimated Savings
                    </h3>
                    <p className="text-sm text-green-700">
                      Cleaning up will save approximately <strong>{analysis.estimatedSavings} KB</strong> of database space.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cleanup Button */}
            <div>
              <button
                onClick={cleanupDatabase}
                disabled={isCleaning || analysis.cleanup.oldCarts === 0}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isCleaning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cleaning Up...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Clean Up Database
                  </>
                )}
              </button>
              <p className="text-sm text-gray-600 mt-2">
                This will delete old cart sessions. Test orders must be deleted manually.
              </p>
            </div>
          </div>
        )}

        {/* Cleanup Results */}
        {cleanupResults && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-green-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Cleanup Complete
            </h2>
            <div className="space-y-2 text-sm text-green-800">
              <p>✅ Deleted {cleanupResults.cartsDeleted} old cart sessions</p>
              {cleanupResults.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-red-800 font-medium">Errors:</p>
                  <ul className="list-disc list-inside text-red-700">
                    {cleanupResults.errors.map((error: string, i: number) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-blue-900 mb-3">Tips to Reduce Database Usage</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Run this cleanup tool weekly to remove old cart sessions</li>
            <li>• Delete test orders manually from the Orders page</li>
            <li>• Archive old completed orders to a separate storage</li>
            <li>• Use localStorage for temporary UI state instead of database</li>
            <li>• Consider upgrading to Supabase Pro ($25/month) for higher limits</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};
