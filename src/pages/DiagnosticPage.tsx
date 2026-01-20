import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function DiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: any = {};

    // 1. Check localStorage
    results.adminToken = localStorage.getItem('admin_token');
    results.adminUser = localStorage.getItem('admin_user');
    results.hasToken = !!results.adminToken;

    // 2. Check backend configuration
    results.baseUrl = (await import('../services/api')).config.baseUrl;

    // 3. Test basic connectivity with raw fetch (bypass API client)
    console.log('🔍 Testing raw connectivity to bluehand.ro...');
    try {
      const rawResponse = await fetch('https://bluehand.ro/api/paintings', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      results.rawFetchStatus = rawResponse.status;
      results.rawFetchStatusText = rawResponse.statusText;
      results.rawFetchOk = rawResponse.ok;
      
      // Check response headers
      results.rawFetchHeaders = {
        'content-type': rawResponse.headers.get('content-type'),
        'access-control-allow-origin': rawResponse.headers.get('access-control-allow-origin'),
        'server': rawResponse.headers.get('server'),
      };
      
      if (rawResponse.ok) {
        const text = await rawResponse.text();
        results.rawFetchBody = text;
        try {
          results.rawFetchJSON = JSON.parse(text);
        } catch (e) {
          results.rawFetchJSONError = 'Response is not valid JSON';
        }
      } else {
        results.rawFetchError = await rawResponse.text();
      }
    } catch (error: any) {
      console.error('❌ Raw fetch error:', error);
      results.rawFetchError = error.message;
      results.rawFetchErrorType = error.name;
      results.rawFetchErrorStack = error.stack;
    }

    // 4. Test all endpoints via API client
    const endpoints = [
      { name: 'paintings', url: 'paintings' },
      { name: 'categories', url: 'categories' },
      { name: 'sizes', url: 'sizes' },
      { name: 'styles', url: 'styles' },
      { name: 'print-types', url: 'print-types' },
      { name: 'frame-types', url: 'frame-types' },
      { name: 'orders', url: 'orders' },
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Testing ${endpoint.name} endpoint...`);
        const response = await api.get(endpoint.url);
        
        results[`${endpoint.name}Status`] = response.status;
        results[`${endpoint.name}StatusText`] = response.statusText;
        
        if (response.ok) {
          const data = await response.json();
          results[`${endpoint.name}Data`] = data;
          
          // Count items based on endpoint
          const key = Object.keys(data)[0]; // First key in response
          if (Array.isArray(data[key])) {
            results[`${endpoint.name}Count`] = data[key].length;
          }
        } else {
          results[`${endpoint.name}Error`] = await response.text();
        }
      } catch (error: any) {
        console.error(`❌ ${endpoint.name} error:`, error);
        results[`${endpoint.name}Error`] = error.message;
        results[`${endpoint.name}ErrorType`] = error.name;
        results[`${endpoint.name}ErrorStack`] = error.stack;
        
        // Detect CORS error
        if (error.message === 'Failed to fetch') {
          results[`${endpoint.name}IsCORS`] = true;
        }
      }
    }

    // 5. Health check
    try {
      const response = await api.get('health');
      if (response.ok) {
        results.healthCheck = await response.json();
      }
    } catch (error) {
      console.log('Health endpoint not available (optional)');
    }

    setDiagnostics(results);
    setLoading(false);
  };

  const forceLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
  };

  const refreshToken = () => {
    window.location.href = '/admin/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Running diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">🔍 BlueHand API Diagnostics</h1>

          {/* Backend Configuration */}
          <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">⚙️ Backend Configuration</h2>
            <p>
              <strong>Base URL:</strong>{' '}
              <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                {diagnostics.baseUrl}
              </code>
            </p>
          </div>

          {/* Raw Connectivity Test */}
          <div className="mb-6 bg-purple-50 border border-purple-200 p-4 rounded">
            <h2 className="text-lg font-semibold mb-3">
              {diagnostics.rawFetchOk ? '✅' : '❌'} Raw Connectivity Test
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Direct fetch to: <code className="bg-gray-200 px-2 py-1 rounded text-xs">https://bluehand.ro/api/paintings</code>
            </p>
            
            {diagnostics.rawFetchError ? (
              <div className="bg-red-50 border border-red-300 p-3 rounded mb-3">
                <p className="text-red-800 font-bold mb-2">❌ Connection Failed!</p>
                <p className="text-sm text-red-700">
                  <strong>Error:</strong> {diagnostics.rawFetchError}
                </p>
                <p className="text-sm text-red-700 mt-2">
                  <strong>Type:</strong> {diagnostics.rawFetchErrorType}
                </p>
                
                <div className="mt-4 bg-white border border-red-200 p-3 rounded">
                  <p className="font-bold text-red-900 mb-2">💡 Possible Issues:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
                    <li>Server is down or unreachable</li>
                    <li>PHP is not configured correctly</li>
                    <li>The /api/ directory doesn't exist</li>
                    <li>index.php has fatal errors</li>
                    <li>CORS headers are not properly set</li>
                    <li>SSL certificate issue</li>
                  </ul>
                  
                  <p className="mt-3 text-sm font-bold text-purple-900">🔧 Quick Test:</p>
                  <p className="text-sm text-gray-700 mb-2">Open this URL in a new browser tab:</p>
                  <a 
                    href="https://bluehand.ro/api/paintings" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm break-all"
                  >
                    https://bluehand.ro/api/paintings
                  </a>
                  <p className="text-xs text-gray-600 mt-1">
                    If you see JSON data → CORS issue. If you see error → PHP issue.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-2">
                  <strong>Status:</strong>{' '}
                  <span className={diagnostics.rawFetchOk ? 'text-green-600' : 'text-red-600'}>
                    {diagnostics.rawFetchStatus} {diagnostics.rawFetchStatusText}
                  </span>
                </p>
                
                {/* Response Headers */}
                <details className="mb-2">
                  <summary className="cursor-pointer text-sm text-blue-600">📋 Response Headers</summary>
                  <pre className="text-xs bg-white p-2 rounded mt-2 overflow-x-auto">
                    {JSON.stringify(diagnostics.rawFetchHeaders, null, 2)}
                  </pre>
                </details>
                
                {/* Response Body */}
                {diagnostics.rawFetchJSON && (
                  <details>
                    <summary className="cursor-pointer text-sm text-blue-600">📄 Response Body</summary>
                    <pre className="text-xs bg-white p-2 rounded mt-2 overflow-x-auto max-h-48">
                      {JSON.stringify(diagnostics.rawFetchJSON, null, 2)}
                    </pre>
                  </details>
                )}
                
                {diagnostics.rawFetchJSONError && (
                  <div className="bg-yellow-50 border border-yellow-300 p-2 rounded mt-2">
                    <p className="text-sm text-yellow-800">⚠️ {diagnostics.rawFetchJSONError}</p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-yellow-700">View Raw Response</summary>
                      <pre className="text-xs bg-white p-2 rounded mt-2 overflow-x-auto max-h-32">
                        {diagnostics.rawFetchBody}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Authentication Status */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              {diagnostics.hasToken ? '✅' : '❌'} Authentication
            </h2>
            <div className="bg-gray-50 p-4 rounded">
              <p className="mb-2">
                <strong>Logged in:</strong>{' '}
                <span className={diagnostics.hasToken ? 'text-green-600' : 'text-red-600'}>
                  {diagnostics.hasToken ? 'YES' : 'NO'}
                </span>
              </p>
              {diagnostics.adminUser && (
                <p className="mb-2">
                  <strong>User:</strong>{' '}
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {diagnostics.adminUser}
                  </code>
                </p>
              )}
            </div>
          </div>

          {/* Health Check */}
          {diagnostics.healthCheck && (
            <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded">
              <h2 className="text-lg font-semibold mb-2">✅ Health Check</h2>
              <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                {JSON.stringify(diagnostics.healthCheck, null, 2)}
              </pre>
            </div>
          )}

          {/* CORS Error Detection */}
          {(diagnostics.paintingsIsCORS || diagnostics.categoriesIsCORS || diagnostics.sizesIsCORS) && (
            <div className="mb-6 bg-red-50 border-2 border-red-400 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-red-700 mb-4">🚨 CORS Error Detected!</h2>
              <p className="text-red-800 mb-4">
                Your PHP backend is blocking requests from this domain. This is a security feature that needs to be configured.
              </p>
              
              <div className="bg-white p-4 rounded border border-red-200 mb-4">
                <p className="font-bold text-red-900 mb-2">Fix Instructions:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-800">
                  <li>Open your PHP file: <code className="bg-gray-100 px-2 py-1 rounded">/api/index.php</code></li>
                  <li>Add these CORS headers at the very beginning (before any other code):</li>
                </ol>
                
                <pre className="mt-3 bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
{`<?php
// CORS Headers - Add at the very top of index.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Rest of your PHP code below...`}</pre>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 p-3 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Important:</strong> After adding the CORS headers, save the file and click "🔄 Re-run Diagnostics" below to test again.
                </p>
              </div>
            </div>
          )}

          {/* All Endpoints Status */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">📡 API Endpoints</h2>
            <div className="space-y-4">
              {['paintings', 'categories', 'sizes', 'styles', 'print-types', 'frame-types', 'orders'].map(endpoint => {
                const status = diagnostics[`${endpoint}Status`];
                const count = diagnostics[`${endpoint}Count`];
                const error = diagnostics[`${endpoint}Error`];
                const data = diagnostics[`${endpoint}Data`];
                
                return (
                  <div key={endpoint} className="bg-gray-50 p-4 rounded border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold flex items-center">
                        {status === 200 ? '✅' : '❌'} {endpoint.toUpperCase().replace(/-/g, ' ')}
                      </h3>
                      <span className={status === 200 ? 'text-green-600' : 'text-red-600'}>
                        {status} {diagnostics[`${endpoint}StatusText`]}
                      </span>
                    </div>
                    
                    {count !== undefined && (
                      <p className="text-sm mb-2">
                        <strong>Items found:</strong>{' '}
                        <span className="text-blue-600 font-bold">{count}</span>
                      </p>
                    )}
                    
                    {error && (
                      <div className="mt-2 bg-red-50 border border-red-200 p-3 rounded">
                        <strong className="text-red-600 text-sm">Error:</strong>
                        <pre className="text-xs mt-1 text-red-800 overflow-x-auto">
                          {error}
                        </pre>
                      </div>
                    )}
                    
                    {data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600 text-sm">View Data</summary>
                        <pre className="text-xs mt-2 bg-white p-2 rounded overflow-x-auto max-h-64">
                          {JSON.stringify(data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-6 mt-6">
            <h2 className="text-lg font-semibold mb-3">🔧 Actions</h2>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={runDiagnostics}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🔄 Re-run Diagnostics
              </button>
              <button
                onClick={refreshToken}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                🔑 Go to Login
              </button>
              <button
                onClick={forceLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                🚪 Force Logout
              </button>
              <a
                href="/"
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 inline-block"
              >
                🏠 Go Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}