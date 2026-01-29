import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export default function NetopiaApiKeyCheck() {
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDiagnostic();
  }, []);

  const loadDiagnostic = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/netopia/diagnostic`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setDiagnostic(data.diagnostic);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load diagnostic');
      console.error('Diagnostic error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading diagnostic...</p>
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
            onClick={loadDiagnostic}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const apiKey = diagnostic?.environmentVariables?.NETOPIA_API_KEY;
  const posSignature = diagnostic?.environmentVariables?.NETOPIA_POS_SIGNATURE;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🔍 Netopia API Key Diagnostic
          </h1>
          <p className="text-gray-600 mb-4">
            Generated at: {new Date(diagnostic?.timestamp).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            Environment: <span className="font-bold">{diagnostic?.environment}</span>
          </p>
        </div>

        {/* API Key Check */}
        <div className={`rounded-lg shadow-lg p-6 mb-6 ${
          apiKey?.matches ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
        }`}>
          <h2 className="text-xl font-bold mb-4">
            {apiKey?.matches ? '✅' : '❌'} NETOPIA_API_KEY
          </h2>
          
          <div className="space-y-3">
            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600">Status:</p>
              <p className="font-bold text-lg">
                {apiKey?.isSet ? '✅ SET' : '❌ NOT SET'}
              </p>
            </div>

            {apiKey?.isSet && (
              <>
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Current Value (first 20 chars):</p>
                  <p className="font-mono text-sm">{apiKey.preview}</p>
                </div>

                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Current Value (last 10 chars):</p>
                  <p className="font-mono text-sm">{apiKey.last10}</p>
                </div>

                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Length:</p>
                  <p className="font-mono">
                    {apiKey.length} chars 
                    {apiKey.length === apiKey.expectedLength ? ' ✅' : ` ❌ (expected ${apiKey.expectedLength})`}
                  </p>
                </div>

                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Expected to start with:</p>
                  <p className="font-mono text-sm">{apiKey.expectedStart}</p>
                </div>

                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Expected to end with:</p>
                  <p className="font-mono text-sm">{apiKey.expectedEnd}</p>
                </div>

                <div className={`rounded p-4 ${
                  apiKey.matches ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'
                }`}>
                  <p className="font-bold text-lg mb-2">
                    {apiKey.matches ? '✅ MATCH!' : '❌ MISMATCH!'}
                  </p>
                  <p className="text-sm">
                    {apiKey.matches 
                      ? 'API key matches the expected value from Netopia dashboard.'
                      : 'API key does NOT match! Please update it in Supabase environment variables.'}
                  </p>
                </div>
              </>
            )}

            {!apiKey?.isSet && (
              <div className="bg-yellow-50 border border-yellow-300 rounded p-4">
                <p className="font-bold text-yellow-800">⚠️ Action Required:</p>
                <p className="text-sm text-yellow-700 mt-2">
                  You need to set the NETOPIA_API_KEY environment variable in Supabase.
                </p>
                <p className="text-sm text-yellow-700 mt-2 font-mono">
                  Expected value: icDO2L_2PqjNJL3F98BLukDRgmmL1z4DPYxu8HYhxVciRdarrVdqzc
                </p>
              </div>
            )}
          </div>
        </div>

        {/* POS Signature Check */}
        <div className={`rounded-lg shadow-lg p-6 mb-6 ${
          posSignature?.matches ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
        }`}>
          <h2 className="text-xl font-bold mb-4">
            {posSignature?.matches ? '✅' : '❌'} NETOPIA_POS_SIGNATURE
          </h2>
          
          <div className="space-y-3">
            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600">Status:</p>
              <p className="font-bold text-lg">
                {posSignature?.isSet ? '✅ SET' : '❌ NOT SET'}
              </p>
            </div>

            {posSignature?.isSet && (
              <>
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Current Value:</p>
                  <p className="font-mono text-sm">{posSignature.fullValue}</p>
                </div>

                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Expected Value:</p>
                  <p className="font-mono text-sm">{posSignature.expectedValue}</p>
                </div>

                <div className={`rounded p-4 ${
                  posSignature.matches ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'
                }`}>
                  <p className="font-bold text-lg mb-2">
                    {posSignature.matches ? '✅ MATCH!' : '❌ MISMATCH!'}
                  </p>
                  <p className="text-sm">
                    {posSignature.matches 
                      ? 'POS signature matches the expected value.'
                      : 'POS signature does NOT match! Please update it in Supabase environment variables.'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {diagnostic?.recommendations && diagnostic.recommendations.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">💡 Recommendations</h2>
            <ul className="space-y-2">
              {diagnostic.recommendations.map((rec: string, index: number) => (
                <li key={index} className="text-blue-800">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 text-center">
          <button 
            onClick={loadDiagnostic}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            🔄 Refresh Diagnostic
          </button>
        </div>
      </div>
    </div>
  );
}
