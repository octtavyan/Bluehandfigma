import React, { useState } from 'react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
  time?: number;
}

export default function APITestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const updateResult = (name: string, status: TestResult['status'], message: string, data?: any, time?: number) => {
    setResults(prev => {
      const filtered = prev.filter(r => r.name !== name);
      return [...filtered, { name, status, message, data, time }];
    });
  };

  const runTest = async (name: string, url: string, options?: RequestInit) => {
    const startTime = Date.now();
    updateResult(name, 'pending', 'Testing...');
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options?.headers,
        },
      });
      
      const time = Date.now() - startTime;
      const text = await response.text();
      
      // Check if response is JSON
      let data;
      let isJson = false;
      try {
        data = JSON.parse(text);
        isJson = true;
      } catch {
        data = text;
      }
      
      if (!isJson) {
        updateResult(name, 'error', `❌ Not JSON! Got HTML/text instead (${response.status})`, text.substring(0, 200), time);
        return;
      }
      
      if (response.ok) {
        updateResult(name, 'success', `✅ ${response.status} - Success`, data, time);
      } else {
        updateResult(name, 'error', `⚠️ ${response.status} - ${data.error || 'Error'}`, data, time);
      }
    } catch (error: any) {
      const time = Date.now() - startTime;
      updateResult(name, 'error', `❌ ${error.message}`, null, time);
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);
    
    const tests = [
      {
        name: '1. Health Check',
        url: 'https://bluehand.ro/api/health',
      },
      {
        name: '2. Database Test',
        url: 'https://bluehand.ro/api/test-db',
      },
      {
        name: '3. Paintings List',
        url: 'https://bluehand.ro/api/paintings',
      },
      {
        name: '4. Categories',
        url: 'https://bluehand.ro/api/categories',
      },
      {
        name: '5. Sizes',
        url: 'https://bluehand.ro/api/sizes',
      },
      {
        name: '6. Styles',
        url: 'https://bluehand.ro/api/styles',
      },
      {
        name: '7. Print Types',
        url: 'https://bluehand.ro/api/print-types',
      },
      {
        name: '8. Frame Types',
        url: 'https://bluehand.ro/api/frame-types',
      },
      {
        name: '9. Cart Load',
        url: 'https://bluehand.ro/api/index.php?action=cart_load&sessionId=test-123',
      },
      {
        name: '10. Orders (No Auth)',
        url: 'https://bluehand.ro/api/orders',
      },
    ];
    
    // Run tests sequentially
    for (const test of tests) {
      await runTest(test.name, test.url);
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay between tests
    }
    
    setTesting(false);
  };

  const sortedResults = [...results].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 API Test Suite</h1>
          <p className="text-gray-600 mb-6">
            Testing all BlueHand.ro API endpoints
          </p>
          
          <button
            onClick={runAllTests}
            disabled={testing}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? '⏳ Testing...' : '▶️ Run All Tests'}
          </button>
        </div>

        <div className="space-y-3">
          {sortedResults.map((result) => (
            <div
              key={result.name}
              className={`bg-white rounded-lg shadow-sm p-5 border-l-4 ${
                result.status === 'success'
                  ? 'border-green-500'
                  : result.status === 'error'
                  ? 'border-red-500'
                  : 'border-yellow-500'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    {result.name}
                  </h3>
                  <p className={`text-sm ${
                    result.status === 'success'
                      ? 'text-green-700'
                      : result.status === 'error'
                      ? 'text-red-700'
                      : 'text-yellow-700'
                  }`}>
                    {result.message}
                  </p>
                </div>
                {result.time && (
                  <span className="text-xs text-gray-500 ml-4">
                    {result.time}ms
                  </span>
                )}
              </div>
              
              {result.data && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium">
                    📋 View Response Data
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-64 border border-gray-200">
                    {typeof result.data === 'string' 
                      ? result.data 
                      : JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
          
          {results.length === 0 && !testing && (
            <div className="text-center py-12 text-gray-500">
              Click "Run All Tests" to start testing the API
            </div>
          )}
        </div>

        {results.length > 0 && !testing && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-3">📊 Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {results.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {results.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {results.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}