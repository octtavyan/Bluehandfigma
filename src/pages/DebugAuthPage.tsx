import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';

export default function DebugAuthPage() {
  const { currentUser, logout } = useAdmin();
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [apiConfig, setApiConfig] = useState<any>({});
  const [apiTest, setApiTest] = useState<{ status: string; message: string } | null>(null);
  const [testingApi, setTestingApi] = useState(false);

  useEffect(() => {
    // Get all localStorage data
    const data: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          data[key] = value ? JSON.parse(value) : value;
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    setLocalStorageData(data);

    // Get API config
    import('../services/api').then(({ config }) => {
      setApiConfig(config);
    });
  }, []);

  const testApiConnection = async () => {
    setTestingApi(true);
    setApiTest(null);
    
    try {
      const response = await fetch('https://bluehand.ro/api/auth/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'test', password: 'test' })
      });
      
      // Get raw response text first
      const responseText = await response.text();
      console.log('Raw API Response:', responseText);
      
      // Try to parse as JSON
      try {
        const data = JSON.parse(responseText);
        setApiTest({
          status: 'success',
          message: `✅ API reachable! Response: ${JSON.stringify(data, null, 2)}`
        });
      } catch (parseError) {
        // If JSON parse fails, show the HTML error
        setApiTest({
          status: 'error',
          message: `❌ PHP Error! Server returned HTML instead of JSON:\n\n${responseText.substring(0, 500)}`
        });
      }
    } catch (error: any) {
      setApiTest({
        status: 'error',
        message: `❌ Network Error: ${error.message}\n\nThis is likely a CORS error. Your PHP backend needs CORS headers!`
      });
    } finally {
      setTestingApi(false);
    }
  };

  const clearLocalStorage = () => {
    if (confirm('Are you sure you want to clear ALL localStorage data? This will log you out.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const clearAuth = () => {
    if (confirm('Clear authentication data and log out?')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_current_user');
      logout();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🔍 Authentication Debug</h1>

          {/* Current User */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">👤 Current User (from AdminContext)</h2>
            {currentUser ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900 font-mono">
                  <strong>Logged in as:</strong> {currentUser.username} ({currentUser.role})
                </p>
                <p className="text-sm text-green-900 font-mono">
                  <strong>Full Name:</strong> {currentUser.fullName}
                </p>
                <p className="text-sm text-green-900 font-mono">
                  <strong>Email:</strong> {currentUser.email}
                </p>
                <p className="text-sm text-green-900 font-mono">
                  <strong>ID:</strong> {currentUser.id}
                </p>
                <button
                  onClick={clearAuth}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  🚪 Clear Auth & Logout
                </button>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">❌ Not logged in</p>
              </div>
            )}
          </div>

          {/* API Configuration */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">🌐 API Configuration</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-mono text-blue-900 mb-2">
                <strong>Base URL:</strong> {apiConfig.baseUrl || 'Loading...'}
              </p>
              <p className="text-sm font-mono text-blue-900">
                <strong>Uploads URL:</strong> {apiConfig.uploadsUrl || 'Loading...'}
              </p>
              {apiConfig.baseUrl && (
                <div className="mt-3">
                  {apiConfig.baseUrl.includes('bluehand.ro') ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      ✅ Using PHP Backend (bluehand.ro)
                    </span>
                  ) : apiConfig.baseUrl.includes('supabase') ? (
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                      ❌ Still using Supabase!
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                      ⚠️ Unknown backend
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* localStorage Data */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">💾 localStorage Data</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <details className="cursor-pointer">
                <summary className="font-semibold text-gray-700 hover:text-gray-900 mb-2">
                  Show all localStorage ({Object.keys(localStorageData).length} items)
                </summary>
                <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-96 border border-gray-200">
                  {JSON.stringify(localStorageData, null, 2)}
                </pre>
              </details>

              <div className="mt-4 space-y-2">
                {localStorageData.admin_token && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                    <p className="text-sm text-yellow-900">
                      <strong>⚠️ admin_token found:</strong> {localStorageData.admin_token.substring(0, 50)}...
                    </p>
                  </div>
                )}
                {localStorageData.admin_current_user && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                    <p className="text-sm text-yellow-900">
                      <strong>⚠️ admin_current_user found</strong>
                    </p>
                    <pre className="mt-1 text-xs text-yellow-800">
                      {JSON.stringify(localStorageData.admin_current_user, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🔄 Refresh Page
            </button>
            <button
              onClick={clearLocalStorage}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              🗑️ Clear ALL localStorage
            </button>
          </div>
        </div>

        {/* Test Login */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔐 Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/login-test"
              className="block px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              🧪 Test Login Form
            </a>
            <a
              href="/api-test"
              className="block px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              🔍 Test All APIs
            </a>
            <a
              href="/admin/login"
              className="block px-4 py-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              🔑 Go to Admin Login
            </a>
          </div>
        </div>

        {/* API Test */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🌐 API Test</h2>
          <div className="space-y-3">
            <button
              onClick={testApiConnection}
              className="block px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              {testingApi ? 'Testing...' : 'Test API Connection'}
            </button>
            {apiTest && (
              <div
                className={`mt-3 p-3 rounded ${
                  apiTest.status === 'success' ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
                }`}
              >
                <p className="text-sm font-mono">
                  {apiTest.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}