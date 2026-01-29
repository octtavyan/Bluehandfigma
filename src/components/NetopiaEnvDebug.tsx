import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function NetopiaEnvDebug() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkEnv = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/debug/env`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const result = await response.json();
      setData(result);
      console.log('🔍 Environment Debug:', result);
    } catch (err) {
      console.error('❌ Debug failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white border-2 border-purple-500 rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold text-lg mb-2">🔍 Environment Debug</h3>
      
      <button
        onClick={checkEnv}
        disabled={loading}
        className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 mb-3"
      >
        {loading ? 'Checking...' : 'Check Environment Variables'}
      </button>
      
      {data && (
        <div className="bg-gray-100 p-3 rounded text-sm font-mono space-y-2 max-h-96 overflow-y-auto">
          <div className="font-bold text-purple-700">Environment Variables:</div>
          
          {data.environment.NETOPIA_POS_SIGNATURE.exists ? (
            <div className="bg-green-100 p-2 rounded">
              <div className="font-bold">✅ NETOPIA_POS_SIGNATURE:</div>
              <div>Length: {data.environment.NETOPIA_POS_SIGNATURE.length}</div>
              <div>First 10: {data.environment.NETOPIA_POS_SIGNATURE.first10}</div>
              <div>Last 10: {data.environment.NETOPIA_POS_SIGNATURE.last10}</div>
              <div className="mt-1 p-2 bg-white rounded break-all">
                <strong>Full:</strong> {data.environment.NETOPIA_POS_SIGNATURE.fullValue}
              </div>
            </div>
          ) : (
            <div className="bg-red-100 p-2 rounded">
              ❌ NETOPIA_POS_SIGNATURE not set
            </div>
          )}
          
          {data.environment.NETOPIA_API_KEY.exists ? (
            <div className="bg-green-100 p-2 rounded">
              <div className="font-bold">✅ NETOPIA_API_KEY:</div>
              <div>Length: {data.environment.NETOPIA_API_KEY.length}</div>
              <div>First 10: {data.environment.NETOPIA_API_KEY.first10}</div>
            </div>
          ) : (
            <div className="bg-red-100 p-2 rounded">
              ❌ NETOPIA_API_KEY not set
            </div>
          )}
          
          <div className="font-bold text-purple-700 mt-3">Database Settings:</div>
          {data.database.settings ? (
            <div className="bg-blue-100 p-2 rounded">
              <div>POS Signature: {data.database.settings.posSignature}</div>
              <div>Is Live: {data.database.settings.isLive ? 'Yes' : 'No'}</div>
              <div>Is Configured: {data.database.settings.isConfigured ? 'Yes' : 'No'}</div>
            </div>
          ) : (
            <div className="bg-yellow-100 p-2 rounded">
              No database settings found
            </div>
          )}
          
          <div className="font-bold text-purple-700 mt-3">Will Use:</div>
          <div className="bg-yellow-100 p-2 rounded break-all">
            {data.willUse}
          </div>
          
          {data.effectiveEndpoint && (
            <>
              <div className="font-bold text-purple-700 mt-3">🌐 Actual Endpoint:</div>
              <div className={`p-3 rounded ${data.effectiveEndpoint.isLive ? 'bg-red-100 border-2 border-red-400' : 'bg-green-100 border-2 border-green-400'}`}>
                <div className="font-bold text-lg mb-2">{data.effectiveEndpoint.warning}</div>
                <div><strong>Mode:</strong> {data.effectiveEndpoint.environment}</div>
                <div className="break-all"><strong>URL:</strong> {data.effectiveEndpoint.baseUrl}</div>
                {data.effectiveEndpoint.isLive && (
                  <div className="mt-2 p-2 bg-red-200 rounded font-bold">
                    ⚠️ WARNING: This POS is not set up in LIVE yet!
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}