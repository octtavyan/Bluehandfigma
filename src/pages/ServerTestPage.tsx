import { useState } from 'react';

export default function ServerTestPage() {
  const [results, setResults] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const testResults: any = {};

    // Test 1: Can we reach the domain at all?
    console.log('🔍 Test 1: Checking if bluehand.ro is reachable...');
    try {
      const response = await fetch('https://bluehand.ro/', { method: 'HEAD', mode: 'no-cors' });
      testResults.domainReachable = true;
      testResults.domainStatus = 'Domain is reachable';
    } catch (error: any) {
      testResults.domainReachable = false;
      testResults.domainError = error.message;
    }

    // Test 2: Can we reach the API endpoint?
    console.log('🔍 Test 2: Testing API endpoint with full details...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('https://bluehand.ro/api/paintings', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      testResults.apiReachable = true;
      testResults.apiStatus = response.status;
      testResults.apiStatusText = response.statusText;
      testResults.apiHeaders = {
        'content-type': response.headers.get('content-type'),
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
        'server': response.headers.get('server'),
      };

      const text = await response.text();
      testResults.apiResponseLength = text.length;
      
      try {
        const json = JSON.parse(text);
        testResults.apiJSON = json;
        testResults.apiValidJSON = true;
      } catch (e) {
        testResults.apiValidJSON = false;
        testResults.apiRawText = text.substring(0, 500);
      }

    } catch (error: any) {
      testResults.apiReachable = false;
      testResults.apiError = error.message;
      testResults.apiErrorName = error.name;
      
      if (error.name === 'AbortError') {
        testResults.apiErrorReason = 'Request timeout (10 seconds) - server not responding';
      } else if (error.message === 'Failed to fetch') {
        testResults.apiErrorReason = 'CORS blocked or server unreachable';
      }
    }

    // Test 3: Try OPTIONS preflight
    console.log('🔍 Test 3: Testing OPTIONS preflight request...');
    try {
      const response = await fetch('https://bluehand.ro/api/paintings', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'content-type',
          'Origin': window.location.origin,
        },
      });

      testResults.optionsStatus = response.status;
      testResults.optionsHeaders = {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
      };
    } catch (error: any) {
      testResults.optionsError = error.message;
    }

    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🔧 BlueHand Server Connectivity Test</h1>
        <p className="text-gray-400 mb-6">Advanced diagnostics for debugging "Failed to fetch" errors</p>

        <button
          onClick={runTests}
          disabled={testing}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold mb-8 disabled:bg-gray-600"
        >
          {testing ? '⏳ Testing...' : '▶️ Run Tests'}
        </button>

        {Object.keys(results).length > 0 && (
          <div className="space-y-6">
            {/* Test 1: Domain Reachability */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                {results.domainReachable ? '✅' : '❌'} Test 1: Domain Reachability
              </h2>
              {results.domainReachable ? (
                <p className="text-green-400">✅ bluehand.ro is reachable from this browser</p>
              ) : (
                <div className="text-red-400">
                  <p className="font-bold mb-2">❌ Cannot reach bluehand.ro</p>
                  <p className="text-sm">Error: {results.domainError}</p>
                  <div className="mt-4 bg-red-900/30 border border-red-500 p-4 rounded">
                    <p className="font-bold mb-2">Possible causes:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Server is down</li>
                      <li>DNS not configured</li>
                      <li>Firewall blocking requests</li>
                      <li>Network connection issue</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Test 2: API Endpoint */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                {results.apiReachable ? '✅' : '❌'} Test 2: API Endpoint (/api/paintings)
              </h2>
              
              {results.apiReachable ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-green-400 font-bold mb-2">✅ API endpoint responded!</p>
                    <p className="text-sm">
                      Status: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{results.apiStatus} {results.apiStatusText}</span>
                    </p>
                  </div>

                  {/* Response Headers */}
                  <div>
                    <h3 className="font-bold mb-2 text-yellow-400">📋 Response Headers:</h3>
                    <div className="bg-gray-900 p-4 rounded font-mono text-sm space-y-1">
                      {Object.entries(results.apiHeaders).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex gap-2">
                          <span className="text-blue-400">{key}:</span>
                          <span className={value ? 'text-green-400' : 'text-red-400'}>
                            {value || '❌ MISSING'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CORS Check */}
                  <div className={results.apiHeaders['access-control-allow-origin'] ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'} p-4 rounded>
                    {results.apiHeaders['access-control-allow-origin'] ? (
                      <div>
                        <p className="text-green-400 font-bold mb-2">✅ CORS Headers Present!</p>
                        <p className="text-sm">The server is sending CORS headers, so the issue might be elsewhere.</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-red-400 font-bold mb-2">❌ CORS Headers MISSING!</p>
                        <p className="text-sm mb-3">The server is NOT sending Access-Control-Allow-Origin header.</p>
                        <div className="bg-black p-3 rounded text-xs">
                          <p className="text-yellow-400 mb-2">Add to the TOP of /api/index.php:</p>
                          <pre className="text-green-400">{`<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}`}</pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Response Body */}
                  {results.apiValidJSON ? (
                    <div>
                      <h3 className="font-bold mb-2 text-green-400">✅ Valid JSON Response</h3>
                      <details>
                        <summary className="cursor-pointer text-blue-400 hover:text-blue-300">View Response</summary>
                        <pre className="mt-2 bg-gray-900 p-4 rounded text-xs overflow-x-auto max-h-64">
                          {JSON.stringify(results.apiJSON, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <div className="bg-yellow-900/30 border border-yellow-500 p-4 rounded">
                      <p className="text-yellow-400 font-bold mb-2">⚠️ Response is not valid JSON</p>
                      <p className="text-sm mb-2">First 500 characters:</p>
                      <pre className="bg-black p-2 rounded text-xs overflow-x-auto">
                        {results.apiRawText}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-400">
                  <p className="font-bold mb-2">❌ Cannot reach API endpoint</p>
                  <p className="text-sm mb-1">Error: {results.apiError}</p>
                  <p className="text-sm mb-4">Type: {results.apiErrorName}</p>
                  {results.apiErrorReason && (
                    <p className="text-yellow-400 mb-4">→ {results.apiErrorReason}</p>
                  )}
                  
                  <div className="bg-red-900/30 border border-red-500 p-4 rounded">
                    <p className="font-bold mb-3">🔍 Troubleshooting Steps:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>
                        <strong>Test in browser:</strong> Open{' '}
                        <a 
                          href="https://bluehand.ro/api/paintings" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          https://bluehand.ro/api/paintings
                        </a>
                        <br />
                        <span className="text-gray-400 ml-6">→ If you see JSON: CORS issue</span>
                        <br />
                        <span className="text-gray-400 ml-6">→ If you see error: PHP issue</span>
                        <br />
                        <span className="text-gray-400 ml-6">→ If page doesn't load: Server/routing issue</span>
                      </li>
                      
                      <li>
                        <strong>Check .htaccess exists:</strong> Create /api/.htaccess with:
                        <pre className="mt-1 ml-6 bg-black p-2 rounded text-xs text-green-400">
{`RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php/$1 [L]`}
                        </pre>
                      </li>
                      
                      <li>
                        <strong>Verify index.php exists:</strong> Check that /api/index.php file exists on server
                      </li>
                      
                      <li>
                        <strong>Check PHP errors:</strong> Look at server error logs for PHP fatal errors
                      </li>
                      
                      <li>
                        <strong>Test with curl:</strong> Run this command on your server:
                        <pre className="mt-1 ml-6 bg-black p-2 rounded text-xs text-green-400">
                          curl -v https://bluehand.ro/api/paintings
                        </pre>
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Test 3: OPTIONS Preflight */}
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                {results.optionsStatus === 200 ? '✅' : '❌'} Test 3: OPTIONS Preflight Request
              </h2>
              
              {results.optionsError ? (
                <div className="text-red-400">
                  <p className="mb-2">❌ OPTIONS request failed: {results.optionsError}</p>
                  <div className="bg-red-900/30 border border-red-500 p-4 rounded text-sm">
                    <p className="mb-2">Your server must handle OPTIONS requests for CORS to work.</p>
                    <p>Add this to index.php BEFORE any other code:</p>
                    <pre className="mt-2 bg-black p-2 rounded text-xs text-green-400">
{`if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code(200);
    exit();
}`}
                    </pre>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-green-400 mb-3">✅ OPTIONS request succeeded (Status: {results.optionsStatus})</p>
                  <div className="bg-gray-900 p-4 rounded font-mono text-sm space-y-1">
                    {Object.entries(results.optionsHeaders).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-blue-400">{key}:</span>
                        <span className={value ? 'text-green-400' : 'text-red-400'}>
                          {value || '❌ MISSING'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-blue-900/30 border-2 border-blue-500 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">📊 Summary & Next Steps</h2>
              {results.apiReachable && results.apiHeaders['access-control-allow-origin'] ? (
                <div className="space-y-2">
                  <p className="text-green-400 font-bold">✅ Good news! Your server is configured correctly.</p>
                  <p className="text-sm">The app should work. If it doesn't, try:</p>
                  <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                    <li>Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)</li>
                    <li>Clear browser cache</li>
                    <li>Check browser console for other errors</li>
                  </ul>
                </div>
              ) : !results.apiReachable ? (
                <div className="space-y-2">
                  <p className="text-red-400 font-bold">❌ Server is not responding to API requests</p>
                  <p className="text-sm text-yellow-400">Most likely cause: /api/index.php doesn't exist or has errors</p>
                  <p className="text-sm mt-3">Check:</p>
                  <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                    <li>File exists at: /var/www/html/api/index.php (or your web root)</li>
                    <li>PHP syntax errors (check error logs)</li>
                    <li>File permissions (should be readable by web server)</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-yellow-400 font-bold">⚠️ Server responds but CORS headers are missing</p>
                  <p className="text-sm">Add CORS headers to the very top of /api/index.php</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <h3 className="font-bold mb-3">🔗 Quick Links</h3>
          <div className="flex gap-3 flex-wrap">
            <a href="/diagnostic" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded">
              📊 Full Diagnostics
            </a>
            <a href="/admin/login" className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded">
              🔑 Admin Login
            </a>
            <a href="/" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
              🏠 Home
            </a>
            <a 
              href="https://bluehand.ro/api/paintings" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              🌐 Test API in Browser
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
