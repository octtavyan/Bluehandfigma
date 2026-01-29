import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function NetopiaVersionCheck() {
  const [version, setVersion] = useState<any>(null);
  const [xmlTest, setXmlTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkVersion = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/health`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setVersion(data);
      
      console.log('📊 Server health check:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const testXml = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/netopia/test-xml`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: 'TEST-' + Date.now(),
            amount: 100,
            customerEmail: 'test@test.com',
            customerName: 'Test User'
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setXmlTest(data);
      
      console.log('🧪 XML Test Results:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ XML test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-lg mb-2">🔍 Server Version Check</h3>
      
      <div className="space-y-2 mb-3">
        <button
          onClick={checkVersion}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Server Version'}
        </button>
        
        <button
          onClick={testXml}
          disabled={loading}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test XML Structure'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2 text-sm">
          ❌ Error: {error}
        </div>
      )}
      
      {version && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-3 py-2 rounded text-sm">
          <div className="font-bold mb-1">✅ Server Status:</div>
          <div className="space-y-1">
            <div><strong>Status:</strong> {version.status}</div>
            <div><strong>Version:</strong> {version.version || 'Unknown'}</div>
            <div><strong>Last Update:</strong> {version.lastUpdate || 'Unknown'}</div>
            <div className="text-xs mt-2 opacity-70">{version.timestamp}</div>
          </div>
          
          {version.version === '2.1.5' ? (
            <div className="mt-2 p-2 bg-green-200 rounded text-center font-bold">
              🎉 VERSION 2.1.5 - POS Signature Updated!
            </div>
          ) : version.version === '2.1.4' ? (
            <div className="mt-2 p-2 bg-yellow-200 rounded text-center font-bold">
              ⏳ Updating to 2.1.5 (POS signature fix)...
            </div>
          ) : version.version === '2.1.3' ? (
            <div className="mt-2 p-2 bg-yellow-200 rounded text-center font-bold">
              ⏳ Updating to 2.1.5...
            </div>
          ) : version.version === '2.1.2' ? (
            <div className="mt-2 p-2 bg-yellow-200 rounded text-center font-bold">
              ⏳ Updating to 2.1.5...
            </div>
          ) : (
            <div className="mt-2 p-2 bg-red-200 rounded text-center font-bold">
              ❌ Old version - waiting for update...
            </div>
          )}
        </div>
      )}
      
      {xmlTest && (
        <div className={`${xmlTest.validation?.allPresent ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border px-3 py-2 rounded text-sm mt-3`}>
          <div className="font-bold mb-1">🧪 XML Test Results:</div>
          <div className="space-y-1 text-xs">
            <div><strong>Order Attribute:</strong> {xmlTest.validation?.orderAttribute}</div>
            <div><strong>Currency Element:</strong> {xmlTest.validation?.currencyElement}</div>
            <div><strong>Invoice Attribute:</strong> {xmlTest.validation?.invoiceAttribute}</div>
            <div className="mt-2 pt-2 border-t border-current">
              <strong>Status:</strong> {xmlTest.message}
            </div>
          </div>
          {xmlTest.xml && (
            <details className="mt-2">
              <summary className="cursor-pointer font-bold">View XML</summary>
              <pre className="text-xs mt-1 p-2 bg-white rounded overflow-x-auto max-h-40">
                {xmlTest.xml}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}