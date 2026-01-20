import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AlertCircle, CheckCircle, Database, RefreshCw, Copy, Stethoscope } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { SupabaseDiagnostics } from '../../components/SupabaseDiagnostics';

interface TableCheck {
  name: string;
  exists: boolean;
  rowCount?: number;
  error?: string;
}

export const AdminDatabaseCheckPage: React.FC = () => {
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
  ];

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

  const copySetupSQL = () => {
    const sqlPath = '/SETUP_ALL_MISSING_TABLES.sql';
    navigator.clipboard.writeText(`Open ${sqlPath} file and run it in Supabase SQL Editor`);
    toast.success('Instructions copied! Open the SQL file from your project.');
  };

  const missingTables = tables.filter(t => !t.exists);
  const existingTables = tables.filter(t => t.exists);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Database Status Check</h1>
          <p className="text-gray-600">Verifică care tabele din Supabase lipsesc sau sunt goale</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tables</p>
                <p className="text-3xl font-bold text-gray-900">{requiredTables.length}</p>
              </div>
              <Database className="w-12 h-12 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border-2 border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Existing</p>
                <p className="text-3xl font-bold text-green-600">{existingTables.length}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border-2 border-red-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Missing</p>
                <p className="text-3xl font-bold text-red-600">{missingTables.length}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        {missingTables.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Database Setup Required
                </h3>
                <p className="text-sm text-red-800 mb-4">
                  {missingTables.length} tabele lipsesc din baza de date. Trebuie să rulezi scriptul SQL de setup.
                </p>

                {/* QUICK OPTION - Run All At Once */}
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-green-900 mb-2">⚡ Opțiune Rapidă (Recomandat după upgrade):</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-green-800">
                    <li>Deschide fișierul <code className="bg-white px-2 py-1 rounded font-mono text-xs">/supabase-setup/00-RUN-ALL-AT-ONCE.sql</code></li>
                    <li>Mergi la <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-green-600 underline hover:text-green-800 font-semibold">Supabase SQL Editor</a></li>
                    <li>Copiază <strong>TOT</strong> conținutul fișierului și lipește-l în SQL Editor</li>
                    <li>Click <strong>"Run"</strong> → Așteaptă ~5 secunde → Done! ✅</li>
                    <li>Apoi rulează <code className="bg-white px-2 py-1 rounded font-mono text-xs">99-CREATE-ADMIN-USER.sql</code> pentru user admin</li>
                  </ol>
                  <div className="mt-3 p-2 bg-white border border-green-200 rounded">
                    <p className="text-xs text-green-900">
                      <strong>Notă:</strong> Acum că ai upgrade la Supabase, poți rula TOT dintr-o dată fără timeout!
                    </p>
                  </div>
                </div>

                {/* ALTERNATIVE - Step by Step */}
                <details className="bg-white border border-red-300 rounded-lg p-4">
                  <summary className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-red-700">
                    📋 Alternativ: Pași individuali (dacă prima opțiune nu funcționează)
                  </summary>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mt-3">
                    <li>Deschide folder-ul <code className="bg-gray-100 px-2 py-1 rounded">/supabase-setup/</code> din proiect</li>
                    <li>Citește fișierul <code className="bg-gray-100 px-2 py-1 rounded">README-SETUP-INSTRUCTIONS.md</code></li>
                    <li>Deschide Supabase Dashboard: <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">supabase.com/dashboard</a></li>
                    <li>Mergi la <strong>SQL Editor</strong> → <strong>New Query</strong></li>
                    <li>Rulează fișierele SQL <strong>UNO CÂTE UNO</strong> în ordinea indicată (01, 02, 03...)</li>
                    <li>Fiecare fișier este mic și va rula rapid (fără timeout)</li>
                    <li>După ce ai rulat toate, creează userul admin (vezi README)</li>
                    <li>Reîncarcă această pagină pentru verificare</li>
                  </ol>
                </details>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {missingTables.length === 0 && tables.length > 0 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  ✓ Database Setup Complete!
                </h3>
                <p className="text-sm text-green-800">
                  Toate tabelele necesare există în baza de date. Aplicația este gata de utilizare!
                </p>
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
            {tables.map((table) => (
              <div
                key={table.name}
                className={`px-6 py-4 flex items-center justify-between ${
                  !table.exists ? 'bg-red-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {table.exists ? (
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
                
                {table.exists && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {table.rowCount === 0 ? (
                        <span className="text-amber-600">Empty (0 rows)</span>
                      ) : (
                        <span className="text-green-600">{table.rowCount} rows</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={checkTables}
            disabled={checking}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Verificare...' : 'Reîmprospătează'}</span>
          </button>
          
          <button
            onClick={() => setShowAdvancedDiagnostics(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Stethoscope className="w-5 h-5" />
            <span>Diagnostic Avansat</span>
          </button>
        </div>
      </div>

      {/* Advanced Diagnostics Modal */}
      {showAdvancedDiagnostics && (
        <div className="fixed inset-0 z-50">
          <SupabaseDiagnostics />
          <button
            onClick={() => setShowAdvancedDiagnostics(false)}
            className="absolute top-4 right-4 z-[60] px-4 py-2 bg-white text-gray-700 rounded-lg shadow-lg hover:bg-gray-100 border-2 border-gray-300"
          >
            ✕ Închide
          </button>
        </div>
      )}
    </AdminLayout>
  );
};