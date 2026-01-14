import React, { useState } from 'react';
import { Database, Check, X, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { isSupabaseConfigured, getSupabase } from '../../lib/supabase';
import { blogPostsService } from '../../lib/dataService';

export const AdminSupabaseTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    configured: boolean;
    connectionTest?: { success: boolean; message: string };
    tablesTest?: { success: boolean; message: string; tables?: string[] };
    blogPostsTest?: { success: boolean; message: string; count?: number };
    writeTest?: { success: boolean; message: string };
  }>({
    configured: isSupabaseConfigured()
  });
  const [isTesting, setIsTesting] = useState(false);

  const runFullTest = async () => {
    setIsTesting(true);
    const results: typeof testResults = {
      configured: isSupabaseConfigured()
    };

    // Test 1: Check if Supabase is configured
    if (!results.configured) {
      results.connectionTest = {
        success: false,
        message: 'Supabase nu este configurat. Mergi la pagina de configurare pentru a adăuga credențialele.'
      };
      setTestResults(results);
      setIsTesting(false);
      return;
    }

    try {
      const supabase = getSupabase();

      // Test 2: Basic connection test
      try {
        const { error } = await supabase.from('paintings').select('count').limit(1);
        results.connectionTest = {
          success: !error,
          message: error ? `Eroare conexiune: ${error.message}` : 'Conexiune Supabase OK'
        };
      } catch (error: any) {
        results.connectionTest = {
          success: false,
          message: `Eroare conexiune: ${error.message}`
        };
      }

      // Test 3: Check which tables exist
      const tablesToCheck = ['paintings', 'orders', 'clients', 'users', 'sizes', 'blog_posts'];
      const existingTables: string[] = [];
      
      for (const table of tablesToCheck) {
        try {
          const { error } = await supabase.from(table).select('count').limit(1);
          if (!error) {
            existingTables.push(table);
          }
        } catch (error) {
          // Table doesn't exist
        }
      }

      results.tablesTest = {
        success: existingTables.length > 0,
        message: `Tabele găsite: ${existingTables.length}/${tablesToCheck.length}`,
        tables: existingTables
      };

      // Test 4: Check blog_posts table specifically
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          if (error.code === '42P01' || error.code === 'PGRST204') {
            results.blogPostsTest = {
              success: false,
              message: 'Tabelul blog_posts nu există. Rulează SQL-ul din /CREATE_BLOG_TABLE.sql'
            };
          } else {
            results.blogPostsTest = {
              success: false,
              message: `Eroare: ${error.message}`
            };
          }
        } else {
          results.blogPostsTest = {
            success: true,
            message: `Tabelul blog_posts există și conține ${data?.length || 0} articole`,
            count: data?.length || 0
          };
        }
      } catch (error: any) {
        results.blogPostsTest = {
          success: false,
          message: `Eroare la verificarea tabelului: ${error.message}`
        };
      }

      // Test 5: Try to create a test blog post
      try {
        const testPost = {
          title: 'Test Article - ' + new Date().toISOString(),
          slug: 'test-article-' + Date.now(),
          excerpt: 'This is a test article to verify blog posts are saving correctly',
          content: 'Test content',
          image: 'https://images.unsplash.com/photo-1750326562849-5bd94ed444e1?w=1920',
          category: 'Test',
          author: 'System Test',
          publishDate: new Date().toISOString(),
          isPublished: false
        };

        const created = await blogPostsService.create(testPost);
        
        if (created.id) {
          // Try to delete the test post
          await blogPostsService.delete(created.id);
          
          results.writeTest = {
            success: true,
            message: 'Test de scriere/citire/ștergere: SUCCESS'
          };
        } else {
          results.writeTest = {
            success: false,
            message: 'Articolul test a fost creat dar nu are ID'
          };
        }
      } catch (error: any) {
        results.writeTest = {
          success: false,
          message: `Eroare la testul de scriere: ${error.message}`
        };
      }

    } catch (error: any) {
      results.connectionTest = {
        success: false,
        message: `Eroare generală: ${error.message}`
      };
    }

    setTestResults(results);
    setIsTesting(false);
  };

  const getStatusIcon = (success?: boolean) => {
    if (success === undefined) return <AlertCircle className="w-5 h-5 text-gray-400" />;
    return success 
      ? <Check className="w-5 h-5 text-green-600" /> 
      : <X className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (success?: boolean) => {
    if (success === undefined) return 'bg-gray-50 border-gray-200';
    return success 
      ? 'bg-green-50 border-green-200' 
      : 'bg-red-50 border-red-200';
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Test Supabase & Blog Posts</h1>
          <p className="text-gray-600">
            Verifică conexiunea Supabase și funcționalitatea salvării articolelor de blog
          </p>
        </div>

        {/* Main Status */}
        <div className={`mb-6 p-6 rounded-lg border-2 ${
          testResults.configured 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-4">
            <Database className={`w-8 h-8 ${testResults.configured ? 'text-green-600' : 'text-yellow-600'}`} />
            <div className="flex-1">
              <h3 className={`mb-1 ${testResults.configured ? 'text-green-900' : 'text-yellow-900'}`}>
                {testResults.configured ? 'Supabase Configurat' : 'Supabase Neconfigurat'}
              </h3>
              <p className={`text-sm ${testResults.configured ? 'text-green-700' : 'text-yellow-700'}`}>
                {testResults.configured 
                  ? 'Credențialele Supabase sunt salvate în localStorage'
                  : 'Supabase nu este configurat. Mergi la pagina de configurare.'}
              </p>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="mb-6">
          <button
            onClick={runFullTest}
            disabled={isTesting || !testResults.configured}
            className="w-full px-6 py-3 bg-[#86C2FF] text-white rounded-lg hover:bg-[#6BADEF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Testare în curs...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                Rulează Test Complet
              </>
            )}
          </button>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {/* Connection Test */}
          {testResults.connectionTest && (
            <div className={`p-4 rounded-lg border ${getStatusColor(testResults.connectionTest.success)}`}>
              <div className="flex items-start gap-3">
                {getStatusIcon(testResults.connectionTest.success)}
                <div className="flex-1">
                  <h3 className="font-medium mb-1">1. Test Conexiune Supabase</h3>
                  <p className="text-sm">{testResults.connectionTest.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tables Test */}
          {testResults.tablesTest && (
            <div className={`p-4 rounded-lg border ${getStatusColor(testResults.tablesTest.success)}`}>
              <div className="flex items-start gap-3">
                {getStatusIcon(testResults.tablesTest.success)}
                <div className="flex-1">
                  <h3 className="font-medium mb-1">2. Verificare Tabele</h3>
                  <p className="text-sm mb-2">{testResults.tablesTest.message}</p>
                  {testResults.tablesTest.tables && testResults.tablesTest.tables.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {testResults.tablesTest.tables.map(table => (
                        <span 
                          key={table}
                          className="px-2 py-1 bg-white rounded text-xs font-mono border"
                        >
                          {table}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Blog Posts Test */}
          {testResults.blogPostsTest && (
            <div className={`p-4 rounded-lg border ${getStatusColor(testResults.blogPostsTest.success)}`}>
              <div className="flex items-start gap-3">
                {getStatusIcon(testResults.blogPostsTest.success)}
                <div className="flex-1">
                  <h3 className="font-medium mb-1">3. Verificare Tabel Blog Posts</h3>
                  <p className="text-sm">{testResults.blogPostsTest.message}</p>
                  {!testResults.blogPostsTest.success && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <p className="text-xs font-medium mb-2">Pentru a crea tabelul:</p>
                      <ol className="text-xs space-y-1 list-decimal list-inside">
                        <li>Deschide fișierul <code className="bg-gray-100 px-1 rounded">/CREATE_BLOG_TABLE.sql</code></li>
                        <li>Copiază conținutul</li>
                        <li>Mergi în Supabase → SQL Editor</li>
                        <li>Lipește și rulează scriptul</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Write Test */}
          {testResults.writeTest && (
            <div className={`p-4 rounded-lg border ${getStatusColor(testResults.writeTest.success)}`}>
              <div className="flex items-start gap-3">
                {getStatusIcon(testResults.writeTest.success)}
                <div className="flex-1">
                  <h3 className="font-medium mb-1">4. Test Scriere/Citire Blog Posts</h3>
                  <p className="text-sm">{testResults.writeTest.message}</p>
                  {testResults.writeTest.success && (
                    <p className="text-xs mt-2 text-green-700">
                      ✓ Articolele de blog se salvează corect în Supabase
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Database Optimization Section */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-purple-900 mb-3 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Optimizare Bază de Date (Performance Fix)
          </h3>
          <div className="text-sm text-purple-800 space-y-3">
            <p>
              <strong>⚠️ Important:</strong> Dacă întâmpini erori de tip \"statement timeout\", 
              trebuie să adaugi index-uri în baza de date pentru performanță optimă.
            </p>
            
            <div className="bg-white rounded border border-purple-300 p-4 mt-3">
              <p className="font-medium mb-2">Rulează acest SQL în Supabase → SQL Editor:</p>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto font-mono">
{`-- Create index on key column for faster lookups
CREATE INDEX IF NOT EXISTS idx_kv_store_key 
ON kv_store_bbc0c500(key);

-- Create index on key prefix for pattern matching
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix 
ON kv_store_bbc0c500(key text_pattern_ops);

-- Analyze table for query planner optimization
ANALYZE kv_store_bbc0c500;`} 
              </pre>
            </div>

            <div className="flex items-start gap-2 mt-3">
              <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs">
                Aceste index-uri vor îmbunătăți dramatic performanța query-urilor și 
                vor preveni erorile de timeout atunci când se încarcă metadatele tablourilor.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-blue-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Cum funcționează sistemul
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>Fallback automat:</strong> Dacă tabelul blog_posts nu există în Supabase, 
              aplicația va folosi automat localStorage pentru a salva articolele.
            </p>
            <p>
              <strong>După crearea tabelului:</strong> Odată ce rulezi scriptul SQL și creezi tabelul, 
              toate articolele noi vor fi salvate în Supabase automat.
            </p>
            <p>
              <strong>Migrare date:</strong> Articolele din localStorage nu vor fi mutate automat în Supabase. 
              Trebuie să le reintroduci manual sau să rulezi un script de migrare.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};