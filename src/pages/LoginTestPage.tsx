import React, { useState } from 'react';
import { authService } from '../lib/supabaseDataService';

export default function LoginTestPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [result, setResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const testLogin = async () => {
    setTesting(true);
    setResult(null);
    
    console.clear();
    console.log('='.repeat(80));
    console.log('🧪 STARTING LOGIN TEST');
    console.log('='.repeat(80));
    
    const loginResult = await authService.login(username, password);
    
    setResult(loginResult);
    setTesting(false);
    
    console.log('='.repeat(80));
    console.log('🧪 LOGIN TEST COMPLETE');
    console.log('='.repeat(80));
  };

  const testDirectFetch = async () => {
    setTesting(true);
    setResult(null);
    
    console.clear();
    console.log('='.repeat(80));
    console.log('🧪 TESTING DIRECT FETCH');
    console.log('='.repeat(80));
    
    try {
      const url = 'https://bluehand.ro/api/auth/login.php';
      console.log('🌐 Fetching:', url);
      console.log('🌐 Body:', JSON.stringify({ username, password }));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      console.log('✅ Response Status:', response.status, response.statusText);
      console.log('✅ Response Headers:');
      response.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });
      
      const text = await response.text();
      console.log('✅ Raw Response Text:', text.substring(0, 500));
      
      try {
        const json = JSON.parse(text);
        console.log('✅ Parsed JSON:', json);
        setResult({ type: 'success', data: json, raw: text });
      } catch (e) {
        console.error('❌ JSON Parse Error:', e);
        setResult({ type: 'html_error', raw: text, error: 'Response is not JSON' });
      }
    } catch (error: any) {
      console.error('❌ Fetch Error:', error);
      setResult({ type: 'network_error', error: error.message });
    }
    
    setTesting(false);
    console.log('='.repeat(80));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🔐 Login Test</h1>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin123"
              />
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={testLogin}
              disabled={testing}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {testing ? '⏳ Testing...' : '🧪 Test Login (via authService)'}
            </button>
            
            <button
              onClick={testDirectFetch}
              disabled={testing}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {testing ? '⏳ Testing...' : '🌐 Test Direct Fetch'}
            </button>
          </div>

          {result && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${
                result.type === 'success' || result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h3 className="font-bold text-lg mb-2">
                  {result.type === 'success' || result.success ? '✅ Success' : '❌ Error'}
                </h3>
                
                {result.type === 'network_error' && (
                  <div>
                    <p className="text-red-800 font-medium mb-2">Network Error (CORS or Server Down)</p>
                    <p className="text-sm text-red-700 mb-3">{result.error}</p>
                    <div className="bg-red-100 p-3 rounded text-sm text-red-900">
                      <strong>💡 Solution:</strong>
                      <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>Add CORS headers to your PHP files</li>
                        <li>Check if server is reachable: <code>https://bluehand.ro/api/auth/login</code></li>
                        <li>Verify Apache is running</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {result.type === 'html_error' && (
                  <div>
                    <p className="text-red-800 font-medium mb-2">PHP Error (returning HTML instead of JSON)</p>
                    <div className="bg-red-100 p-3 rounded text-sm text-red-900 mb-3">
                      <strong>💡 Solution:</strong>
                      <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>Check PHP error logs: <code>tail -f /var/log/apache2/error.log</code></li>
                        <li>Verify database credentials in config.php</li>
                        <li>Make sure auth/login.php file exists</li>
                      </ul>
                    </div>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-red-800 hover:text-red-900 font-medium">
                        Show HTML Error (click to expand)
                      </summary>
                      <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-64 border border-red-200">
                        {result.raw}
                      </pre>
                    </details>
                  </div>
                )}
                
                {(result.type === 'success' || result.success) && (
                  <div>
                    <p className="text-green-800 font-medium mb-2">Login Successful!</p>
                    <div className="bg-green-100 p-3 rounded">
                      <pre className="text-xs text-green-900 overflow-auto">
                        {JSON.stringify(result.data || result, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {result.success === false && !result.type && (
                  <div>
                    <p className="text-red-800 font-medium mb-2">Login Failed</p>
                    <p className="text-sm text-red-700">
                      {result.error || 'Invalid credentials or server error'}
                    </p>
                    <div className="bg-red-100 p-3 rounded mt-3">
                      <pre className="text-xs text-red-900 overflow-auto">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-3">📋 Checklist</h2>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <span className="text-lg">1️⃣</span>
              <div>
                <strong>Create PHP file:</strong> <code className="bg-blue-100 px-2 py-1 rounded">/var/www/html/api/auth/login.php</code>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">2️⃣</span>
              <div>
                <strong>Add CORS headers</strong> at the top of the PHP file
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">3️⃣</span>
              <div>
                <strong>Test in browser:</strong> Visit <a href="https://bluehand.ro/api/health.php" target="_blank" className="underline">https://bluehand.ro/api/health.php</a>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">4️⃣</span>
              <div>
                <strong>Check database:</strong> Make sure admin user exists with password_hash
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href="/admin/login"
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-center transition-colors"
          >
            ← Back to Login
          </a>
          <a
            href="/api-test"
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center transition-colors"
          >
            🧪 Full API Test
          </a>
        </div>
      </div>
    </div>
  );
}