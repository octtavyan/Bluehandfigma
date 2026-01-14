import React, { useState } from 'react';
import { Database, TrendingUp, Trash2, Activity, AlertCircle, RefreshCw, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { QuotaMonitor } from './QuotaMonitor';
import { projectId } from '../../utils/supabase/info';

export const DatabaseManagement: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'quota' | 'cleanup' | 'test'>('quota');

  // Cleanup state
  const [cleanupStats, setCleanupStats] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  // Test state
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const analyzeDatabase = async () => {
    setIsAnalyzing(true);
    setCleanupStats(null);

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

      // Estimate sizes (rough)
      const estimatedSize = {
        kv: (kvCount || 0) * 500, // ~500 bytes per KV entry
        orders: (ordersCount || 0) * 2000, // ~2KB per order
        clients: (clientsCount || 0) * 500, // ~500 bytes per client
        paintings: (paintingsCount || 0) * 3000, // ~3KB per painting
      };

      const totalBytes = Object.values(estimatedSize).reduce((a, b) => a + b, 0);

      setCleanupStats({
        counts: {
          kv: kvCount || 0,
          orders: ordersCount || 0,
          clients: clientsCount || 0,
          paintings: paintingsCount || 0,
        },
        sizes: estimatedSize,
        totalBytes,
      });
    } catch (error) {
      console.error('Error analyzing database:', error);
      alert('Eroare la analiza bazei de date: ' + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const cleanupDatabase = async () => {
    if (!window.confirm('Sigur dorești să ștergi datele vechi? Această acțiune nu poate fi anulată.')) {
      return;
    }

    setIsCleaning(true);

    try {
      const supabase = getSupabase();

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

          if (error) throw error;
        }

        alert(`Șters ${oldCarts.length} sesiuni de coș vechi.`);
      } else {
        alert('Nu s-au găsit sesiuni de coș vechi.');
      }

      // Refresh stats
      analyzeDatabase();
    } catch (error) {
      console.error('Error cleaning database:', error);
      alert('Eroare la curățarea bazei de date: ' + (error as Error).message);
    } finally {
      setIsCleaning(false);
    }
  };

  const testEdgeFunction = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/health`, {
        method: 'GET',
      });

      // Check if response is HTML (Cloudflare error page)
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        setTestResults({
          success: false,
          status: 521,
          data: null,
          message: 'Serverul Supabase este oprit. Vă rugăm să verificați statusul în dashboard.',
        });
        setIsTesting(false);
        return;
      }

      const data = await response.json();

      setTestResults({
        success: response.ok,
        status: response.status,
        data,
        message: response.ok ? 'Edge Function funcționează corect!' : 'Edge Function returnează erori.',
      });
    } catch (error) {
      setTestResults({
        success: false,
        status: 0,
        data: null,
        message: 'Nu s-a putut conecta la Edge Function: ' + (error as Error).message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection('quota')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeSection === 'quota'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Quota & Bandwidth
          </button>
          <button
            onClick={() => setActiveSection('cleanup')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeSection === 'cleanup'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Database Cleanup
          </button>
          <button
            onClick={() => setActiveSection('test')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeSection === 'test'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            Test Edge Function
          </button>
        </div>
      </div>

      {/* Quota Section */}
      {activeSection === 'quota' && (
        <div>
          <QuotaMonitor />
        </div>
      )}

      {/* Cleanup Section */}
      {activeSection === 'cleanup' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 flex items-center gap-2 mb-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Database Cleanup
            </h3>
            <p className="text-sm text-gray-600">
              Șterge datele vechi pentru a reduce utilizarea bazei de date și bandwidth-ul.
            </p>
          </div>

          <div className="space-y-4">
            {/* Analyze Button */}
            <button
              onClick={analyzeDatabase}
              disabled={isAnalyzing}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analizare...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  Analizează Baza de Date
                </>
              )}
            </button>

            {/* Results */}
            {cleanupStats && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Database Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Orders</p>
                      <p className="text-lg text-gray-900">{cleanupStats.counts.orders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Clients</p>
                      <p className="text-lg text-gray-900">{cleanupStats.counts.clients}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Paintings</p>
                      <p className="text-lg text-gray-900">{cleanupStats.counts.paintings}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">KV Store</p>
                      <p className="text-lg text-gray-900">{cleanupStats.counts.kv}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Total Estimated Size</p>
                    <p className="text-lg text-gray-900">
                      {(cleanupStats.totalBytes / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {/* Cleanup Action */}
                <button
                  onClick={cleanupDatabase}
                  disabled={isCleaning}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCleaning ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Curățare în curs...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Șterge Sesiunile de Coș Vechi
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Section */}
      {activeSection === 'test' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-green-600" />
              Test Edge Function
            </h3>
            <p className="text-sm text-gray-600">
              Verifică dacă serverul Edge Function funcționează corect.
            </p>
          </div>

          <div className="space-y-4">
            {/* Test Button */}
            <button
              onClick={testEdgeFunction}
              disabled={isTesting}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Testare...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  Testează Edge Function
                </>
              )}
            </button>

            {/* Test Results */}
            {testResults && (
              <div
                className={`rounded-lg p-4 ${
                  testResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {testResults.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${testResults.success ? 'text-green-900' : 'text-red-900'}`}>
                      {testResults.message}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Status Code: {testResults.status}</p>
                    {testResults.data && (
                      <pre className="mt-2 text-xs bg-white p-2 rounded border border-gray-200 overflow-auto">
                        {JSON.stringify(testResults.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-3">Quick Links</h4>
        <div className="space-y-2">
          <a
            href={`https://supabase.com/dashboard/project/${projectId}/settings/billing`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900"
          >
            <ExternalLink className="w-4 h-4" />
            View Supabase Billing Dashboard
          </a>
          <a
            href={`https://supabase.com/dashboard/project/${projectId}/settings/database`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900"
          >
            <ExternalLink className="w-4 h-4" />
            View Database Settings
          </a>
          <a
            href={`https://supabase.com/dashboard/project/${projectId}/logs/edge-functions`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900"
          >
            <ExternalLink className="w-4 h-4" />
            View Edge Function Logs
          </a>
        </div>
      </div>
    </div>
  );
};