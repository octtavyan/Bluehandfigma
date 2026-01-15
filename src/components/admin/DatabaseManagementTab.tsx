import React, { useState, useEffect } from 'react';
import { Database, Activity, Trash2, TestTube, AlertCircle, CheckCircle, RefreshCw, BarChart3, Zap } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Link } from 'react-router-dom';

interface DatabaseStats {
  orders: number;
  clients: number;
  paintings: number;
  users: number;
  blogPosts: number;
  totalRecords: number;
}

export const DatabaseManagementTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  useEffect(() => {
    testConnection();
    loadStats();
  }, []);

  const testConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/database/test`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data.success ? 'connected' : 'error');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Error testing database connection:', error);
      setConnectionStatus('error');
    } finally {
      setTesting(false);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/database/stats`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading database stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStats = () => {
    loadStats();
    toast.success('Statistici actualizate!');
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <Database className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl text-gray-900">Database Management</h2>
          <p className="text-sm text-gray-600">Instrumente de gestionare și monitorizare bază de date</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Connection Status */}
        <div className={`border-2 rounded-lg p-4 ${
          connectionStatus === 'connected' 
            ? 'bg-green-50 border-green-200' 
            : connectionStatus === 'error'
            ? 'bg-red-50 border-red-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {connectionStatus === 'connected' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : connectionStatus === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Activity className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              )}
              <div className={`text-sm ${
                connectionStatus === 'connected' 
                  ? 'text-green-900' 
                  : connectionStatus === 'error'
                  ? 'text-red-900'
                  : 'text-gray-900'
              }`}>
                <p className="font-medium">
                  {connectionStatus === 'connected' 
                    ? 'Conexiune Supabase Activă' 
                    : connectionStatus === 'error'
                    ? 'Eroare Conexiune'
                    : 'Verificare Conexiune...'}
                </p>
                <p className={connectionStatus === 'connected' ? 'text-green-800' : connectionStatus === 'error' ? 'text-red-800' : 'text-gray-600'}>
                  {connectionStatus === 'connected' 
                    ? 'Baza de date este accesibilă și funcțională' 
                    : connectionStatus === 'error'
                    ? 'Nu se poate conecta la baza de date'
                    : 'Se testează conexiunea...'}
                </p>
              </div>
            </div>
            <button
              onClick={testConnection}
              disabled={testing}
              className="px-3 py-1.5 text-sm bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {testing ? 'Se testează...' : 'Testează'}
            </button>
          </div>
        </div>

        {/* Database Statistics */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Statistici Bază de Date</h3>
            <button
              onClick={handleRefreshStats}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizează</span>
            </button>
          </div>

          {loading && !stats ? (
            <div className="text-center py-8 text-gray-500">Se încarcă statistici...</div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Comenzi</span>
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-700">{stats.orders.toLocaleString()}</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-900">Clienți</span>
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-700">{stats.clients.toLocaleString()}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900">Tablouri</span>
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-700">{stats.paintings.toLocaleString()}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-900">Utilizatori</span>
                  <BarChart3 className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-yellow-700">{stats.users.toLocaleString()}</p>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-pink-900">Articole Blog</span>
                  <BarChart3 className="w-5 h-5 text-pink-600" />
                </div>
                <p className="text-2xl font-bold text-pink-700">{stats.blogPosts.toLocaleString()}</p>
              </div>

              <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Total Înregistrări</span>
                  <Database className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-2xl font-bold text-gray-700">{stats.totalRecords.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Nu s-au putut încărca statisticile</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Acțiuni Rapide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Database Cleanup */}
            <Link
              to="/admin/database-cleanup"
              className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-red-900">Database Cleanup</h4>
                <p className="text-sm text-red-700 mt-1">
                  Curăță date vechi, duplicate sau nefolosite
                </p>
              </div>
            </Link>

            {/* Egress Analyzer */}
            <Link
              to="/admin/egress-analyzer"
              className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Egress Analyzer</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Analizează traficul și consumul de bandwidth
                </p>
              </div>
            </Link>

            {/* Supabase Admin */}
            <Link
              to="/admin/supabase"
              className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Database className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Supabase Admin</h4>
                <p className="text-sm text-green-700 mt-1">
                  Administrare generală Supabase
                </p>
              </div>
            </Link>

            {/* Edge Function Test */}
            <Link
              to="/admin/edge-function-test"
              className="flex items-start space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <TestTube className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-purple-900">Edge Function Test</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Testează funcțiile server-side
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Database Configuration */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configurare Conexiune</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Project ID</p>
                <p className="text-xs text-gray-600 mt-0.5 font-mono">{projectId}</p>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                Activ
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Anon Key</p>
                <p className="text-xs text-gray-600 mt-0.5 font-mono">
                  {publicAnonKey.substring(0, 20)}...{publicAnonKey.substring(publicAnonKey.length - 10)}
                </p>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                Configurat
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Database URL</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  https://{projectId}.supabase.co
                </p>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                Conectat
              </div>
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <p className="font-medium mb-1">Sfaturi pentru Optimizare</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-800">
                <li>Rulează Database Cleanup regulat pentru a elimina datele nefolosite</li>
                <li>Monitorizează Egress Analyzer pentru a optimiza consumul de bandwidth</li>
                <li>Verifică statisticile săptămânal pentru a detecta probleme timpurii</li>
                <li>Testează Edge Functions după fiecare update major</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
