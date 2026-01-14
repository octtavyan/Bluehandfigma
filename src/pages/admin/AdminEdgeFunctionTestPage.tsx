import React, { useState, useEffect } from 'react';
import { Server, Check, X, AlertCircle, Loader2, Terminal, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface TestResult {
  name: string;
  success?: boolean;
  message: string;
  duration?: number;
  details?: any;
}

export const AdminEdgeFunctionTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [serverLogs, setServerLogs] = useState<string[]>([]);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500`;

  const addLog = (message: string) => {
    setServerLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runTest = async (
    name: string,
    endpoint: string,
    options?: RequestInit
  ): Promise<TestResult> => {
    const startTime = performance.now();
    addLog(`Starting test: ${name}`);
    
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          ...options?.headers,
        },
      });

      const duration = performance.now() - startTime;
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      const success = response.ok;
      addLog(`${name}: ${success ? 'SUCCESS' : 'FAILED'} (${response.status}) - ${duration.toFixed(0)}ms`);

      return {
        name,
        success,
        message: success 
          ? `Status: ${response.status} - Response time: ${duration.toFixed(0)}ms`
          : `Status: ${response.status} - ${data?.error || data?.message || 'Unknown error'}`,
        duration,
        details: data
      };
    } catch (error: any) {
      const duration = performance.now() - startTime;
      addLog(`${name}: ERROR - ${error.message}`);
      
      return {
        name,
        success: false,
        message: `Error: ${error.message}`,
        duration,
        details: { error: error.message, stack: error.stack }
      };
    }
  };

  const runAllTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    setServerLogs([]);
    
    addLog('=== Starting Edge Function Diagnostics ===');
    addLog(`Base URL: ${baseUrl}`);
    
    const results: TestResult[] = [];

    // Test 1: Health Check
    results.push(await runTest('Health Check', '/health'));
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 2: Quota Status
    results.push(await runTest('Quota Status', '/quota-status'));
    
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 3: Cart Save
    const testSessionId = `test_${Date.now()}`;
    results.push(await runTest(
      'Cart Save',
      '/cart/save',
      {
        method: 'POST',
        body: JSON.stringify({
          sessionId: testSessionId,
          cart: [{ id: '1', name: 'Test Item', quantity: 1 }]
        })
      }
    ));
    
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 4: Cart Load
    results.push(await runTest(
      'Cart Load',
      `/cart/load/${testSessionId}`
    ));
    
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 5: Cart Clear
    results.push(await runTest(
      'Cart Clear',
      `/cart/clear/${testSessionId}`,
      { method: 'DELETE' }
    ));

    addLog('=== All tests completed ===');
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
      <div className="p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Edge Function Diagnostics</h1>
          <p className="text-gray-600">
            Test and debug the Supabase Edge Function server
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Server URL:</strong> <code className="bg-blue-100 px-2 py-1 rounded text-xs">{baseUrl}</code>
            </p>
          </div>
        </div>

        {/* Test Button */}
        <div className="mb-6">
          <button
            onClick={runAllTests}
            disabled={isTesting}
            className="w-full px-6 py-3 bg-[#86C2FF] text-white rounded-lg hover:bg-[#6BADEF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Server className="w-5 h-5" />
                Run All Diagnostics
              </>
            )}
          </button>
        </div>

        {/* Grid Layout for Results and Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Results */}
          <div>
            <h2 className="text-gray-900 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Test Results
            </h2>
            <div className="space-y-3">
              {testResults.length === 0 && !isTesting && (
                <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                  <Server className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Click the button above to run diagnostics</p>
                </div>
              )}
              
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(result.success)}`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.success)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-medium truncate">{result.name}</h3>
                        {result.duration !== undefined && (
                          <span className="text-xs text-gray-500 shrink-0">
                            {result.duration.toFixed(0)}ms
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 break-words">{result.message}</p>
                      
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Server Logs */}
          <div>
            <h2 className="text-gray-900 mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Client-Side Logs
            </h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs h-[600px] overflow-y-auto">
              {serverLogs.length === 0 && (
                <div className="text-gray-500 italic">Waiting for tests to run...</div>
              )}
              {serverLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-yellow-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Common Issues & Solutions
          </h3>
          <div className="text-sm text-yellow-800 space-y-3">
            <div>
              <strong className="block mb-1">"Connection closed before message completed"</strong>
              <p className="text-xs">
                This means the Edge Function crashed during startup. Check the Supabase logs at:
                <br />
                <code className="bg-yellow-100 px-2 py-1 rounded mt-1 inline-block">
                  Supabase Dashboard → Edge Functions → server → Logs
                </code>
              </p>
            </div>
            
            <div>
              <strong className="block mb-1">Health check fails</strong>
              <p className="text-xs">
                The Edge Function is not running or not deployed. Deploy it from:
                <br />
                <code className="bg-yellow-100 px-2 py-1 rounded mt-1 inline-block">
                  Supabase Dashboard → Edge Functions → Deploy
                </code>
              </p>
            </div>

            <div>
              <strong className="block mb-1">Database connection fails</strong>
              <p className="text-xs">
                Check that SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are set in:
                <br />
                <code className="bg-yellow-100 px-2 py-1 rounded mt-1 inline-block">
                  Supabase Dashboard → Edge Functions → Settings → Secrets
                </code>
              </p>
            </div>

            <div>
              <strong className="block mb-1">Resend API configuration fails</strong>
              <p className="text-xs">
                Add your Resend API key (get it from https://resend.com/api-keys) to:
                <br />
                <code className="bg-yellow-100 px-2 py-1 rounded mt-1 inline-block">
                  Supabase Dashboard → Edge Functions → Settings → Secrets → RESEND_API_KEY
                </code>
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {testResults.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-blue-900 mb-3">Next Steps</h3>
            <div className="text-sm text-blue-800 space-y-2">
              {testResults.every(r => r.success) ? (
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <strong>All systems operational!</strong> Your Edge Function server is working correctly.
                </p>
              ) : (
                <>
                  <p>
                    <strong>Some tests failed.</strong> Please review the errors above and check:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Supabase Edge Function logs for server-side errors</li>
                    <li>Environment variables are correctly set</li>
                    <li>Database tables exist and have correct permissions</li>
                  </ol>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};