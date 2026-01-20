// Supabase Diagnostics Tool
// Tests connectivity, API calls, table access, and network performance

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
  details?: any;
}

export const SupabaseDiagnostics: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setResults([]);
    setIsRunning(true);

    try {
      // Test 1: Basic Connectivity
      await testConnectivity();
      
      // Test 2: API Endpoint Reachability
      await testApiEndpoint();
      
      // Test 3: Authentication
      await testAuth();
      
      // Test 4: Table Access (all tables)
      await testTableAccess();
      
      // Test 5: Query Performance
      await testQueryPerformance();
      
      // Test 6: Network Timeout Detection
      await testNetworkTimeout();

    } catch (error) {
      addResult({
        name: 'Fatal Error',
        status: 'error',
        message: `Diagnostics failed: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testConnectivity = async () => {
    const start = Date.now();
    try {
      const response = await fetch(`https://${projectId}.supabase.co/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': publicAnonKey,
          'Content-Type': 'application/json'
        }
      });
      const duration = Date.now() - start;
      
      addResult({
        name: '1. Basic Connectivity',
        status: response.ok ? 'success' : 'error',
        message: response.ok 
          ? `✅ Supabase is reachable (${duration}ms)` 
          : `❌ Cannot reach Supabase (Status: ${response.status})`,
        duration
      });
    } catch (error) {
      addResult({
        name: '1. Basic Connectivity',
        status: 'error',
        message: `❌ Network error: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - start
      });
    }
  };

  const testApiEndpoint = async () => {
    const start = Date.now();
    try {
      const response = await fetch(`https://${projectId}.supabase.co/rest/v1/`, {
        headers: {
          'apikey': publicAnonKey,
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      const duration = Date.now() - start;
      const text = await response.text();
      
      addResult({
        name: '2. API Endpoint',
        status: response.ok ? 'success' : 'error',
        message: response.ok 
          ? `✅ API endpoint responding (${duration}ms)` 
          : `❌ API error: ${response.status} - ${text}`,
        duration,
        details: { status: response.status, response: text.substring(0, 200) }
      });
    } catch (error) {
      addResult({
        name: '2. API Endpoint',
        status: 'error',
        message: `❌ API call failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - start
      });
    }
  };

  const testAuth = async () => {
    const start = Date.now();
    try {
      const { data, error } = await supabase.auth.getSession();
      const duration = Date.now() - start;
      
      addResult({
        name: '3. Authentication',
        status: error ? 'error' : 'success',
        message: error 
          ? `❌ Auth error: ${error.message}` 
          : `✅ Auth working (${duration}ms)`,
        duration,
        details: { session: data?.session ? 'Active' : 'None' }
      });
    } catch (error) {
      addResult({
        name: '3. Authentication',
        status: 'error',
        message: `❌ Auth failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - start
      });
    }
  };

  const testTableAccess = async () => {
    const tables = [
      'canvas_sizes',
      'frame_types',
      'paintings',
      'orders',
      'clients',
      'admin_users',
      'hero_slides',
      'blog_posts',
      'categories',
      'subcategories',
      'notifications',
      'kv_store_bbc0c500'
    ];

    let rlsErrorCount = 0;

    for (const table of tables) {
      const start = Date.now();
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        const duration = Date.now() - start;

        if (error) {
          // Check if it's an RLS error
          const isRLSError = error.code === '42501' || 
                            error.message?.toLowerCase().includes('policy') ||
                            error.message?.toLowerCase().includes('permission');
          
          if (isRLSError) rlsErrorCount++;

          addResult({
            name: `4. Table: ${table}`,
            status: error.code === 'PGRST116' ? 'warning' : 'error',
            message: error.code === 'PGRST116' 
              ? `⚠️ Table does not exist` 
              : isRLSError
                ? `❌ RLS Policy Error: ${error.message}`
                : `❌ Error: ${error.message}`,
            duration,
            details: { code: error.code, hint: error.hint, message: error.message }
          });
        } else {
          addResult({
            name: `4. Table: ${table}`,
            status: 'success',
            message: `✅ Accessible (${count ?? 0} rows, ${duration}ms)`,
            duration,
            details: { rowCount: count }
          });
        }
      } catch (error) {
        addResult({
          name: `4. Table: ${table}`,
          status: 'error',
          message: `❌ Failed: ${error instanceof Error ? error.message : String(error)}`,
          duration: Date.now() - start
        });
      }
    }

    // If multiple RLS errors detected, add a special warning
    if (rlsErrorCount >= 3) {
      addResult({
        name: '⚠️ RLS POLICY ISSUE DETECTED',
        status: 'error',
        message: `❌ ${rlsErrorCount} tables blocked by Row Level Security (RLS). Tables exist but queries are denied.`,
        details: {
          solution: 'Run /supabase-setup/FIX-RLS-DISABLE-ALL-TABLES.sql in Supabase SQL Editor',
          explanation: 'RLS is enabled but no policies are configured, blocking all access'
        }
      });
    }
  };

  const testQueryPerformance = async () => {
    const start = Date.now();
    try {
      const { data, error } = await supabase
        .from('canvas_sizes')
        .select('*')
        .limit(10);
      
      const duration = Date.now() - start;

      if (error) {
        addResult({
          name: '5. Query Performance',
          status: 'error',
          message: `❌ Query failed: ${error.message}`,
          duration
        });
      } else {
        const status = duration < 500 ? 'success' : duration < 2000 ? 'warning' : 'error';
        addResult({
          name: '5. Query Performance',
          status,
          message: `${status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌'} Query took ${duration}ms (${data?.length ?? 0} rows)`,
          duration,
          details: { rows: data?.length, avgPerRow: data?.length ? duration / data.length : 0 }
        });
      }
    } catch (error) {
      addResult({
        name: '5. Query Performance',
        status: 'error',
        message: `❌ Query failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - start
      });
    }
  };

  const testNetworkTimeout = async () => {
    const start = Date.now();
    try {
      // Set a manual timeout of 5 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 5000ms')), 5000)
      );
      
      const queryPromise = supabase
        .from('canvas_sizes')
        .select('*')
        .limit(100);

      await Promise.race([queryPromise, timeoutPromise]);
      
      const duration = Date.now() - start;
      addResult({
        name: '6. Network Timeout Test',
        status: 'success',
        message: `✅ No timeout detected (${duration}ms)`,
        duration
      });
    } catch (error) {
      const duration = Date.now() - start;
      if (error instanceof Error && error.message.includes('Timeout')) {
        addResult({
          name: '6. Network Timeout Test',
          status: 'error',
          message: `❌ TIMEOUT: Query exceeded 5000ms`,
          duration
        });
      } else {
        addResult({
          name: '6. Network Timeout Test',
          status: 'error',
          message: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
          duration
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">🔧 Supabase Diagnostics</h2>
          <p className="text-sm text-gray-600 mt-1">
            Testing database connectivity, API calls, and network performance
          </p>
          <div className="mt-3 space-y-1 text-xs text-gray-500 font-mono">
            <div>Project: {projectId}</div>
            <div>URL: https://{projectId}.supabase.co</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {results.map((result, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 ${
                result.status === 'success' ? 'bg-green-50 border-green-200' :
                result.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                result.status === 'error' ? 'bg-red-50 border-red-200' :
                'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{result.name}</div>
                  <div className="text-sm mt-1">{result.message}</div>
                  {result.duration !== undefined && (
                    <div className="text-xs text-gray-500 mt-1">Duration: {result.duration}ms</div>
                  )}
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                        Show details
                      </summary>
                      <pre className="text-xs bg-white p-2 rounded border border-gray-200 mt-1 overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <div className={`ml-4 text-2xl ${
                  result.status === 'success' ? 'text-green-600' :
                  result.status === 'warning' ? 'text-yellow-600' :
                  result.status === 'error' ? 'text-red-600' :
                  'text-gray-400'
                }`}>
                  {result.status === 'success' ? '✓' :
                   result.status === 'warning' ? '⚠' :
                   result.status === 'error' ? '✗' : '○'}
                </div>
              </div>
            </div>
          ))}

          {isRunning && results.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <div className="mt-4 text-gray-600">Running diagnostics...</div>
            </div>
          )}

          {!isRunning && results.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Click "Run Diagnostics" to start testing
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between">
          <a
            href="/"
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            ← Back to Home
          </a>
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className={`px-6 py-2 rounded-lg font-semibold ${
              isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRunning ? 'Running...' : results.length > 0 ? 'Run Again' : 'Run Diagnostics'}
          </button>
        </div>
      </div>
    </div>
  );
};