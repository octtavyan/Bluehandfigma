import React, { useState, useEffect } from 'react';
import { Database, AlertCircle, CheckCircle, RefreshCw, Copy, ExternalLink, Stethoscope } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';
import { SupabaseDiagnostics } from '../SupabaseDiagnostics';

interface TableCheck {
  name: string;
  exists: boolean;
  rowCount?: number;
  error?: string;
}

export const DatabaseManagementTab: React.FC = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [tables, setTables] = useState<TableCheck[]>([]);
  const [showAdvancedDiagnostics, setShowAdvancedDiagnostics] = useState(false);

  const requiredTables = [
    'hero_slides',
    'blog_posts',
    'admin_users',
    'categories',
    'subcategories',
    'canvas_sizes',
    'frame_types',
    'paintings',
    'orders',
    'clients',
    'unsplash_settings',
    'unsplash_searches',
    'legal_pages',
    'kv_store_bbc0c500'
  ];

  const supabaseUrl = `https://supabase.com/dashboard/project/${projectId}`;
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectId}/sql/new`;

  const checkTables = async () => {
    setChecking(true);
    const results: TableCheck[] = [];

    for (const tableName of requiredTables) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          results.push({
            name: tableName,
            exists: false,
            error: error.message,
          });
        } else {
          results.push({
            name: tableName,
            exists: true,
            rowCount: count || 0,
          });
        }
      } catch (err: any) {
        results.push({
          name: tableName,
          exists: false,
          error: err.message,
        });
      }
    }

    setTables(results);
    setChecking(false);
  };

  useEffect(() => {
    checkTables();
  }, []);

  const handleCopyProjectId = () => {
    navigator.clipboard.writeText(projectId);
    setIsCopied(true);
    toast.success('Project ID copiat!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const missingTables = tables.filter(t => !t.exists);
  const existingTables = tables.filter(t => t.exists);

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <Database className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl text-gray-900">Database Management</h2>
          <p className="text-sm text-gray-600">Administrează baza de date Supabase</p>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Setup inițial necesar</h3>
            <p className="text-sm text-blue-800 mb-3">
              Pentru ca aplicația să funcționeze corect, trebuie să rulezi scriptul SQL de setup în Supabase.
            </p>
            <ol className="text-sm text-blue-800 space-y-2 ml-4 list-decimal">
              <li>Deschide <strong>SQL Editor</strong> în Supabase Dashboard</li>
              <li>Copiază conținutul fișierului <code className="bg-blue-100 px-1 py-0.5 rounded">/SETUP_ALL_MISSING_TABLES.sql</code></li>
              <li>Lipește și rulează scriptul în SQL Editor</li>
              <li>Reîmprospătează aplicația</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supabase Project ID
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={projectId}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
            />
            <button
              onClick={handleCopyProjectId}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center space-x-2 transition-colors"
            >
              {isCopied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Copiat!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiază</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <a
            href={supabaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-gray-900">Supabase Dashboard</div>
                <div className="text-sm text-gray-600">Deschide panoul de administrare</div>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
          </a>

          <a
            href={sqlEditorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">SQL Editor</div>
                <div className="text-sm text-gray-600">Rulează scriptul de setup</div>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
          </a>
        </div>
      </div>

      {/* Tables Info */}
      <div className="mt-6 border-t pt-6">
        <h3 className="font-medium text-gray-900 mb-3">Tabele necesare</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'paintings',
            'orders',
            'clients',
            'canvas_sizes',
            'frame_types',
            'categories',
            'subcategories',
            'blog_posts',
            'hero_slides',
            'admin_users',
            'legal_pages',
            'unsplash_settings',
            'unsplash_searches',
            'kv_store_bbc0c500'
          ].map(table => (
            <div
              key={table}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 font-mono"
            >
              {table}
            </div>
          ))}
        </div>
      </div>

      {/* Table Check */}
      <div className="mt-6 border-t pt-6">
        <h3 className="font-medium text-gray-900 mb-3">Verificare tabele</h3>
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={checkTables}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {checking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verific...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Verifică tabelele</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowAdvancedDiagnostics(!showAdvancedDiagnostics)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {showAdvancedDiagnostics ? (
              <>
                <Stethoscope className="w-4 h-4" />
                <span>Ascunde diagnostic avansat</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4" />
                <span>Afișează diagnostic avansat</span>
              </>
            )}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {tables.map(table => (
            <div
              key={table.name}
              className={`px-3 py-2 bg-gray-50 border rounded text-sm text-gray-700 font-mono ${
                table.exists ? 'border-green-500' : 'border-red-500'
              }`}
            >
              {table.name}
              {table.exists ? (
                <span className="ml-2 text-green-500">({table.rowCount} rânduri)</span>
              ) : (
                <span className="ml-2 text-red-500">({table.error})</span>
              )}
            </div>
          ))}
        </div>
        {showAdvancedDiagnostics && (
          <div className="mt-4">
            <SupabaseDiagnostics />
          </div>
        )}
      </div>
    </div>
  );
};