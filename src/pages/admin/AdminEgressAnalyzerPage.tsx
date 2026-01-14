import React, { useState } from 'react';
import { TrendingUp, Database, AlertCircle, RefreshCw, ArrowDownToLine, FileText, Image as ImageIcon, Zap } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { getSupabase } from '../../lib/supabase';

interface EgressAnalysis {
  totalEgress: number;
  breakdown: {
    category: string;
    bytes: number;
    percentage: number;
    description: string;
  }[];
  recommendations: string[];
}

export const AdminEgressAnalyzerPage: React.FC = () => {
  const [analysis, setAnalysis] = useState<EgressAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeEgress = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const supabase = getSupabase();

      // Get all table sizes
      const { data: orders, count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact' });

      const { data: clients, count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact' });

      const { data: paintings, count: paintingsCount } = await supabase
        .from('paintings')
        .select('*', { count: 'exact' });

      const { data: kvStore, count: kvCount } = await supabase
        .from('kv_store_bbc0c500')
        .select('*', { count: 'exact' });

      // Calculate average sizes
      const ordersSize = orders ? JSON.stringify(orders).length : 0;
      const clientsSize = clients ? JSON.stringify(clients).length : 0;
      const paintingsSize = paintings ? JSON.stringify(paintings).length : 0;
      const kvStoreSize = kvStore ? JSON.stringify(kvStore).length : 0;

      // Estimate egress based on typical usage patterns
      // Each page load typically fetches multiple tables
      const estimatedPageLoads = 1000; // Conservative estimate per month
      const avgPageLoadSize = (ordersSize + clientsSize + paintingsSize) / 3;

      const breakdown = [
        {
          category: 'Orders Table Fetches',
          bytes: ordersSize * estimatedPageLoads * 0.3, // 30% of loads fetch orders
          percentage: 0,
          description: `${ordersCount} orders × ~${estimatedPageLoads * 0.3} fetches/month`
        },
        {
          category: 'Clients Table Fetches',
          bytes: clientsSize * estimatedPageLoads * 0.2, // 20% of loads fetch clients
          percentage: 0,
          description: `${clientsCount} clients × ~${estimatedPageLoads * 0.2} fetches/month`
        },
        {
          category: 'Paintings Table Fetches',
          bytes: paintingsSize * estimatedPageLoads * 0.5, // 50% of loads fetch paintings (public gallery)
          percentage: 0,
          description: `${paintingsCount} paintings × ~${estimatedPageLoads * 0.5} fetches/month`
        },
        {
          category: 'Cart Session Storage',
          bytes: kvStoreSize * 100, // Cart sessions accessed frequently
          percentage: 0,
          description: `${kvCount} cart sessions × ~100 reads/month`
        },
        {
          category: 'Edge Function Responses',
          bytes: 50 * 1024 * 438, // 50KB average response × 438 invocations
          percentage: 0,
          description: '438 Edge Function calls × ~50KB response'
        },
        {
          category: 'Real-time Subscriptions',
          bytes: 10 * 1024 * 1000, // 10KB × 1000 updates
          percentage: 0,
          description: 'Real-time updates and notifications'
        }
      ];

      const totalEgress = breakdown.reduce((sum, item) => sum + item.bytes, 0);

      // Calculate percentages
      breakdown.forEach(item => {
        item.percentage = (item.bytes / totalEgress) * 100;
      });

      // Sort by size
      breakdown.sort((a, b) => b.bytes - a.bytes);

      // Generate recommendations
      const recommendations: string[] = [];

      if (paintingsSize > 100 * 1024) {
        recommendations.push('Paintings table is large. Consider pagination instead of fetching all at once.');
      }

      if (ordersSize > 50 * 1024) {
        recommendations.push('Orders table is growing. Add date filters to only fetch recent orders.');
      }

      if (kvCount && kvCount > 100) {
        recommendations.push(`${kvCount} cart sessions found. Clean up old sessions to reduce storage and egress.`);
      }

      recommendations.push('Use SELECT to fetch only needed columns instead of SELECT *');
      recommendations.push('Implement caching on the frontend to reduce repeated API calls');
      recommendations.push('Consider using localStorage for frequently accessed but rarely changing data');
      recommendations.push('Add pagination to all large data tables (50 items per page)');
      recommendations.push('Use .maybeSingle() or .single() instead of .select() when fetching one record');

      setAnalysis({
        totalEgress,
        breakdown,
        recommendations
      });
    } catch (error) {
      console.error('Error analyzing egress:', error);
      alert('Error analyzing egress. Check console for details.');
    }

    setIsAnalyzing(false);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Egress Bandwidth Analyzer</h1>
          <p className="text-gray-600">
            Analyze what's consuming your Supabase egress bandwidth (data transfer out)
          </p>
        </div>

        {/* Current Status Alert */}
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-900 font-medium mb-2">
                ⚠️ Egress Quota Exceeded!
              </h3>
              <div className="text-sm text-red-800 space-y-2">
                <p>
                  <strong>Current Usage:</strong> 6.062 GB / 5 GB (121%)
                </p>
                <p>
                  You've exceeded your free tier egress limit by <strong>1.062 GB</strong>.
                  This is why your Edge Functions and database queries are failing.
                </p>
                <div className="mt-4 flex gap-3">
                  <a
                    href="https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/settings/billing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                  >
                    View Billing Dashboard
                  </a>
                  <a
                    href="https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/settings/billing/subscription"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Upgrade to Pro ($25/mo)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="mb-6">
          <button
            onClick={analyzeEgress}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-[#86C2FF] text-white rounded-lg hover:bg-[#6BADEF] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                Analyze Egress Usage
              </>
            )}
          </button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Total Egress */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5" />
                Estimated Monthly Egress
              </h2>
              <div className="text-4xl text-gray-900 mb-2">
                {formatBytes(analysis.totalEgress)}
              </div>
              <p className="text-sm text-gray-600">
                Based on current data size and estimated access patterns
              </p>
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Egress Breakdown
              </h2>
              <div className="space-y-3">
                {analysis.breakdown.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {item.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{item.description}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900 ml-4">
                        {formatBytes(item.bytes)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-yellow-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recommendations to Reduce Egress
              </h2>
              <ul className="space-y-2 text-sm text-yellow-800">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* What is Egress? */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-blue-900 mb-3">What is Egress?</h3>
          <div className="text-sm text-blue-800 space-y-3">
            <p>
              <strong>Egress</strong> is data transferred OUT of Supabase to clients (your users' browsers or apps).
            </p>
            <p>
              <strong>Every time you fetch data from Supabase, it counts towards egress:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Database queries (SELECT statements)</li>
              <li>Edge Function responses</li>
              <li>File downloads from Storage</li>
              <li>Real-time subscriptions</li>
              <li>API responses</li>
            </ul>
            <p className="mt-3">
              <strong>Free tier limit:</strong> 5 GB/month
            </p>
            <p>
              <strong>Pro tier limit:</strong> 250 GB/month ($25/mo)
            </p>
          </div>
        </div>

        {/* Quick Fixes */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-green-900 mb-3">Quick Fixes to Reduce Egress NOW</h3>
          <div className="text-sm text-green-800 space-y-2">
            <div className="flex items-start gap-2">
              <span className="shrink-0">1.</span>
              <span>
                <strong>Add pagination:</strong> Don't fetch all paintings/orders at once.
                Limit to 50 items per page with <code className="bg-green-100 px-1 rounded">.range(0, 49)</code>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0">2.</span>
              <span>
                <strong>Use localStorage:</strong> Cache paintings, sizes, and other static data in browser.
                Only fetch once per day instead of every page load.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0">3.</span>
              <span>
                <strong>Clean up cart sessions:</strong> Go to Database Cleanup page and remove old carts.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0">4.</span>
              <span>
                <strong>Optimize queries:</strong> Use <code className="bg-green-100 px-1 rounded">.select('id, name, price')</code>
                instead of <code className="bg-green-100 px-1 rounded">.select('*')</code>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0">5.</span>
              <span>
                <strong>Upgrade to Pro:</strong> $25/month gets you 250 GB egress (50x more)
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
