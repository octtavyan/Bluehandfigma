import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export default function NetopiaDebugPage() {
  const [settings, setSettings] = useState<any>(null);
  const [dbDebug, setDbDebug] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load BOTH endpoints - normal settings AND direct database debug
      const [settingsResponse, debugResponse] = await Promise.all([
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/netopia/settings`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }
        ),
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/netopia/debug-db`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }
        )
      ]);

      if (!settingsResponse.ok) {
        throw new Error(`HTTP ${settingsResponse.status}: ${await settingsResponse.text()}`);
      }

      const settingsData = await settingsResponse.json();
      const debugData = debugResponse.ok ? await debugResponse.json() : null;
      
      setSettings(settingsData.settings);
      setDbDebug(debugData);
      
      console.log('📊 Settings API response:', settingsData);
      console.log('🔍 Database debug response:', debugData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      console.error('Settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 max-w-2xl">
          <h2 className="text-xl font-bold text-red-800 mb-2">❌ Error</h2>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={loadSettings}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const expectedApiKey = 'icDO2L_2PqjNJL3F98BLukDRgmmL1z4DPYxu8HYhxVciRdarrVdqzc';
  const apiKeyMatches = settings?.sandboxApiKey === expectedApiKey;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🔍 Netopia Database Debug
          </h1>
          <p className="text-gray-600 mb-4">
            Direct database values - checking if sandboxApiKey is actually saved
          </p>
        </div>

        {/* RAW DATABASE DATA */}
        {dbDebug && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-purple-900 mb-4">
              🗄️ Raw Database Contents
            </h2>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Direct Database Read:</p>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600">sandboxApiKey exists:</p>
                  <p className={`font-bold text-lg ${dbDebug.analysis?.sandboxApiKey?.exists ? 'text-green-700' : 'text-red-700'}`}>
                    {dbDebug.analysis?.sandboxApiKey?.exists ? '✅ YES' : '❌ NO'}
                  </p>
                </div>
                
                {dbDebug.analysis?.sandboxApiKey?.exists && (
                  <>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Length:</p>
                      <p className="font-mono text-sm">{dbDebug.analysis.sandboxApiKey.length} characters</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">First 20 chars:</p>
                      <p className="font-mono text-sm">{dbDebug.analysis.sandboxApiKey.first20}...</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Last 10 chars:</p>
                      <p className="font-mono text-sm">...{dbDebug.analysis.sandboxApiKey.last10}</p>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
                      <p className="text-xs text-gray-600 mb-2">Full Value (for debugging):</p>
                      <p className="font-mono text-xs break-all text-gray-800">
                        {dbDebug.analysis.sandboxApiKey.fullValue}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <details className="bg-white rounded p-3">
              <summary className="cursor-pointer font-semibold text-sm text-gray-700">
                🔍 View Full Raw JSON
              </summary>
              <pre className="mt-3 text-xs bg-gray-900 text-green-400 p-3 rounded overflow-auto max-h-96">
                {JSON.stringify(dbDebug, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Sandbox API Key */}
        <div className={`rounded-lg shadow-lg p-6 mb-6 ${
          apiKeyMatches ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
        }`}>
          <h2 className="text-xl font-bold mb-4">
            {settings?.sandboxApiKey ? (apiKeyMatches ? '✅' : '⚠️') : '❌'} Sandbox API Key
          </h2>
          
          <div className="space-y-3">
            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600">Status:</p>
              <p className="font-bold text-lg">
                {settings?.sandboxApiKey ? '✅ EXISTS' : '❌ NOT SET'}
              </p>
            </div>

            {settings?.sandboxApiKey ? (
              <>
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Length:</p>
                  <p className="font-mono">
                    {settings.sandboxApiKey.length} characters
                    {settings.sandboxApiKey.length === 56 ? ' ✅' : ' ❌ (expected 56)'}
                  </p>
                </div>

                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">First 20 characters:</p>
                  <p className="font-mono text-sm">{settings.sandboxApiKey.substring(0, 20)}...</p>
                </div>

                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Last 10 characters:</p>
                  <p className="font-mono text-sm">...{settings.sandboxApiKey.substring(settings.sandboxApiKey.length - 10)}</p>
                </div>

                <div className={`rounded p-4 ${
                  apiKeyMatches ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'
                }`}>
                  <p className="font-bold text-lg mb-2">
                    {apiKeyMatches ? '✅ MATCH!' : '❌ MISMATCH!'}
                  </p>
                  <p className="text-sm">
                    {apiKeyMatches 
                      ? 'API key matches expected value from Netopia dashboard!'
                      : 'API key does NOT match! Please update it in Admin Settings → Netopia.'}
                  </p>
                  {!apiKeyMatches && (
                    <div className="mt-3 bg-white border border-red-300 rounded p-3">
                      <p className="text-xs font-semibold text-red-800 mb-1">Expected value:</p>
                      <p className="font-mono text-xs break-all text-red-700">{expectedApiKey}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-300 rounded p-4">
                <p className="font-bold text-yellow-800">⚠️ Action Required:</p>
                <p className="text-sm text-yellow-700 mt-2">
                  Sandbox API Key is NOT set in database. Go to Admin Settings → Netopia and save it.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* POS Signature */}
        <div className={`rounded-lg shadow-lg p-6 mb-6 ${
          settings?.posSignature === '38CJ-NTJR-M8VL-QSUQ-OHEA' ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
        }`}>
          <h2 className="text-xl font-bold mb-4">
            {settings?.posSignature ? '✅' : '❌'} POS Signature
          </h2>
          
          <div className="space-y-3">
            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600">Current Value:</p>
              <p className="font-mono text-sm">{settings?.posSignature || 'NOT SET'}</p>
            </div>

            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600">Expected Value:</p>
              <p className="font-mono text-sm">38CJ-NTJR-M8VL-QSUQ-OHEA</p>
            </div>

            <div className={`rounded p-4 ${
              settings?.posSignature === '38CJ-NTJR-M8VL-QSUQ-OHEA' ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'
            }`}>
              <p className="font-bold text-lg">
                {settings?.posSignature === '38CJ-NTJR-M8VL-QSUQ-OHEA' ? '✅ MATCH!' : '❌ MISMATCH!'}
              </p>
            </div>
          </div>
        </div>

        {/* Public Key */}
        <div className={`rounded-lg shadow-lg p-6 mb-6 ${
          settings?.publicKey ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
        }`}>
          <h2 className="text-xl font-bold mb-4">
            {settings?.publicKey ? '✅' : '❌'} Public Key
          </h2>
          
          <div className="space-y-3">
            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600">Status:</p>
              <p className="font-bold text-lg">
                {settings?.publicKey ? '✅ EXISTS' : '❌ NOT SET'}
              </p>
            </div>

            {settings?.publicKey && (
              <>
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Length:</p>
                  <p className="font-mono">{settings.publicKey.length} characters</p>
                </div>

                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Format Check:</p>
                  <p className={`font-bold ${
                    settings.publicKey.includes('BEGIN PUBLIC KEY') || settings.publicKey.includes('BEGIN CERTIFICATE')
                      ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {settings.publicKey.includes('BEGIN PUBLIC KEY') || settings.publicKey.includes('BEGIN CERTIFICATE')
                      ? '✅ Valid format' : '❌ Invalid format'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Environment Mode */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">🌍 Environment</h2>
          <div className="bg-white rounded p-3">
            <p className="text-sm text-gray-600">Mode:</p>
            <p className="font-bold text-lg text-blue-700">
              {settings?.isLive ? '🔴 LIVE (Production)' : '🟢 SANDBOX (Test)'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={loadSettings}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            🔄 Refresh
          </button>
          <a
            href="/admin/settings?tab=netopia"
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-center"
          >
            ⚙️ Go to Settings
          </a>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <p className="font-bold text-yellow-900 mb-2">📝 Next Steps:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
            <li>If Sandbox API Key is ❌ or mismatched → Go to Admin Settings → Netopia</li>
            <li>Paste the correct API key: <code className="bg-yellow-100 px-1 py-0.5 rounded font-mono text-xs">icDO2L_2PqjNJL3F98BLukDRgmmL1z4DPYxu8HYhxVciRdarrVdqzc</code></li>
            <li>Click "Salvează Setări"</li>
            <li>Come back here and click "🔄 Refresh" to verify</li>
            <li>Try a test payment after all fields show ✅</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
