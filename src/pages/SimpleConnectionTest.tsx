import { useState } from 'react';

export default function SimpleConnectionTest() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const log = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const testConnection = async () => {
    setResults([]);
    setTesting(true);

    // Test 1: Can we reach the domain?
    log('🔍 Test 1: Checking https://bluehand.ro...');
    try {
      const response = await fetch('https://bluehand.ro/', { 
        method: 'GET',
        mode: 'no-cors' // This bypasses CORS to just check if server is reachable
      });
      log('✅ bluehand.ro domain is reachable (no-cors mode)');
    } catch (error: any) {
      log(`❌ Cannot reach bluehand.ro domain: ${error.message}`);
    }

    // Test 2: Try HTTPS API
    log('🔍 Test 2: Testing HTTPS API (https://bluehand.ro/api/paintings)...');
    try {
      const response = await fetch('https://bluehand.ro/api/paintings', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      log(`✅ HTTPS API responded with status: ${response.status}`);
      
      // Check headers
      const corsHeader = response.headers.get('access-control-allow-origin');
      if (corsHeader) {
        log(`✅ CORS header present: ${corsHeader}`);
      } else {
        log(`❌ CORS header MISSING!`);
      }

      const text = await response.text();
      log(`📄 Response length: ${text.length} bytes`);
      try {
        const json = JSON.parse(text);
        log(`✅ Valid JSON response received`);
        log(`📊 Data: ${JSON.stringify(json).substring(0, 200)}...`);
      } catch (e) {
        log(`⚠️ Response is not JSON: ${text.substring(0, 200)}`);
      }
    } catch (error: any) {
      log(`❌ HTTPS API failed: ${error.name} - ${error.message}`);
      
      if (error.message === 'Failed to fetch') {
        log('💡 This usually means:');
        log('   1. Server is not responding at all');
        log('   2. SSL certificate issue');
        log('   3. CORS preflight blocked');
        log('   4. Server returns error before headers');
      }
    }

    // Test 3: Try HTTP API (in case HTTPS is broken)
    log('🔍 Test 3: Testing HTTP API (http://bluehand.ro/api/paintings)...');
    try {
      const response = await fetch('http://bluehand.ro/api/paintings', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      log(`✅ HTTP API responded with status: ${response.status}`);
    } catch (error: any) {
      log(`❌ HTTP API failed: ${error.message}`);
      log('   (This is expected if server only accepts HTTPS)');
    }

    // Test 4: Check if file exists by trying direct URL
    log('🔍 Test 4: Checking if index.php exists...');
    try {
      const response = await fetch('https://bluehand.ro/api/index.php', {
        method: 'GET',
      });
      log(`📄 Direct index.php access: ${response.status}`);
    } catch (error: any) {
      log(`❌ Cannot access index.php directly: ${error.message}`);
    }

    // Test 4b: Try test.php (if uploaded)
    log('🔍 Test 4b: Checking for test.php...');
    try {
      const response = await fetch('https://bluehand.ro/api/test.php', {
        method: 'GET',
      });
      log(`📄 test.php status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        log(`✅ test.php data: ${JSON.stringify(data, null, 2)}`);
        log(`📁 Document Root: ${data.document_root}`);
        log(`📁 Script Location: ${data.script_filename}`);
        log(`🔧 mod_rewrite: ${data.mod_rewrite}`);
        log(`📄 .htaccess exists: ${data.htaccess_exists}`);
      }
    } catch (error: any) {
      log(`⚠️ test.php not found (upload it to diagnose): ${error.message}`);
    }

    // Test 5: Try with index.php in URL (bypass .htaccess)
    log('🔍 Test 5: Try accessing via index.php/paintings...');
    try {
      const response = await fetch('https://bluehand.ro/api/index.php/paintings', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      log(`📄 index.php/paintings: ${response.status}`);
      if (response.ok) {
        log(`✅ Direct routing works! Problem is .htaccess or mod_rewrite`);
      }
    } catch (error: any) {
      log(`❌ index.php/paintings failed: ${error.message}`);
    }

    // Test 6: Get current environment info
    log('🔍 Test 6: Environment info...');
    log(`   Current URL: ${window.location.href}`);
    log(`   Origin: ${window.location.origin}`);
    log(`   Protocol: ${window.location.protocol}`);
    log(`   User Agent: ${navigator.userAgent.substring(0, 100)}...`);

    setTesting(false);
    log('✅ All tests complete!');
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono text-sm">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl mb-2 text-white">⚡ Simple Connection Test</h1>
        <p className="text-gray-400 mb-4">Raw connectivity test to bluehand.ro API</p>

        <div className="mb-4">
          <button
            onClick={testConnection}
            disabled={testing}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {testing ? '⏳ Testing...' : '▶️ Run Connection Test'}
          </button>
        </div>

        {/* Console Output */}
        <div className="bg-gray-900 border border-green-500 rounded p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
          <div className="text-xs">
            {results.length === 0 ? (
              <div className="text-gray-500">Click "Run Connection Test" to start...</div>
            ) : (
              results.map((result, i) => (
                <div key={i} className="mb-1 leading-relaxed">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 p-4 bg-gray-900 border border-yellow-500 rounded">
          <h2 className="text-yellow-400 font-bold mb-3">🔧 Quick Fixes</h2>
          
          <div className="space-y-4 text-xs">
            <div>
              <p className="text-white font-bold mb-1">1. Check if API responds in browser:</p>
              <a 
                href="https://bluehand.ro/api/paintings" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                https://bluehand.ro/api/paintings
              </a>
              <p className="text-gray-400 mt-1">
                • If you see JSON → API works, CORS issue<br />
                • If you see error page → PHP error<br />
                • If page doesn't load → Server/routing issue
              </p>
            </div>

            <div>
              <p className="text-white font-bold mb-1">2. Verify your /api/index.php starts with this:</p>
              <pre className="bg-black p-2 rounded text-green-400 overflow-x-auto text-xs">
{`<?php
// MUST BE FIRST - CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Rest of your code...`}
              </pre>
            </div>

            <div>
              <p className="text-white font-bold mb-1">3. Create /api/.htaccess if missing:</p>
              <pre className="bg-black p-2 rounded text-green-400 overflow-x-auto text-xs">
{`RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [L,QSA]`}
              </pre>
            </div>

            <div>
              <p className="text-white font-bold mb-1">4. Test with curl on your server:</p>
              <pre className="bg-black p-2 rounded text-green-400 overflow-x-auto text-xs">
{`curl -v https://bluehand.ro/api/paintings`}
              </pre>
              <p className="text-gray-400 mt-1">This will show if PHP is responding at all</p>
            </div>

            <div>
              <p className="text-white font-bold mb-1">5. Check PHP error log:</p>
              <pre className="bg-black p-2 rounded text-green-400 overflow-x-auto text-xs">
{`tail -f /var/log/apache2/error.log
# or
tail -f /var/log/nginx/error.log`}
              </pre>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          <a href="/" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
            ← Home
          </a>
          <a href="/server-test" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded">
            Full Server Test
          </a>
          <a href="/diagnostic" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
            Diagnostic Page
          </a>
        </div>
      </div>
    </div>
  );
}