import React, { useState, useEffect } from 'react';
import { Webhook, CheckCircle, XCircle, ExternalLink, Copy, TestTube, Activity, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface IPNQueueItem {
  id: number;
  created_at: string;
  processed: boolean;
  payload: any;
}

export const PipedreamConfigTab: React.FC = () => {
  const [testingConnection, setTestingConnection] = useState(false);
  const [recentIPNs, setRecentIPNs] = useState<IPNQueueItem[]>([]);
  const [loadingIPNs, setLoadingIPNs] = useState(false);

  // Pipedream configuration (hardcoded from setup)
  const config = {
    pipedreamWebhookUrl: 'https://eokrex1e5lzckse.m.pipedream.net',
    supabaseEndpoint: `https://uarntnjpoikeoigyatao.supabase.co/functions/v1/make-server-bbc0c500/netopia/ipn-public`,
    netopiaPublicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy6pUDAFLVul4y499gz1P
gGSvTSc82U3/ih3e5FDUs/F0Jvfzc4cew8TrBDrw7Y+AYZS37D2i+Xi5nYpzQpu7
ryS4W+qvgAA1SEjiU1Sk2a4+A1HeH+vfZo0gDrIYTh2NSAQnDSDxk5T475ukSSwX
L9tYwO6CpdAv3BtpMT5YhyS3ipgPEnGIQKXjh8GMgLSmRFbgoCTRWlCvu7XOg94N
fS8l4it2qrEldU8VEdfPDfFLlxl3lUoLEmCncCjmF1wRVtk4cNu+WtWQ4mBgxpt0
tX2aJkqp4PV3o5kI4bqHq/MS7HVJ7yxtj/p8kawlVYipGsQj3ypgltQ3bnYV/LRq
8QIDAQAB
-----END PUBLIC KEY-----`,
  };

  useEffect(() => {
    loadRecentIPNs();
  }, []);

  const loadRecentIPNs = async () => {
    setLoadingIPNs(true);
    try {
      // Query the IPN queue table to show recent entries
      const response = await fetch(
        `https://${projectId}.supabase.co/rest/v1/netopia_ipn_queue?select=*&order=created_at.desc&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'apikey': publicAnonKey,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecentIPNs(data);
      }
    } catch (error) {
      console.error('Error loading recent IPNs:', error);
    } finally {
      setLoadingIPNs(false);
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      // Send a test IPN to the Pipedream webhook
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        order: {
          ntpID: 'TEST-' + Date.now(),
          status: 1,
        },
        payment: {
          amount: 100.00,
          currency: 'RON',
        },
      };

      const response = await fetch(config.pipedreamWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        toast.success('Test IPN trimis cu succes! Verifică în Pipedream și Supabase logs.');
        // Reload recent IPNs after a short delay
        setTimeout(() => loadRecentIPNs(), 2000);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Eroare la testarea conexiunii');
    } finally {
      setTestingConnection(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiat în clipboard!`);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <Webhook className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl text-gray-900">Pipedream Webhook Proxy</h2>
          <p className="text-sm text-gray-600">Configurație pentru primirea IPN-urilor Netopia prin Pipedream</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Why Pipedream */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">De ce Pipedream?</p>
              <p className="text-blue-800">
                Supabase Edge Functions necesită autentificare JWT, dar Netopia trimite propriul JWT. 
                Pipedream funcționează ca un proxy public care primește IPN-urile de la Netopia 
                și le redirecționează către Supabase cu autentificarea corectă.
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Display */}
        <div className="space-y-4">
          {/* Pipedream Webhook URL */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-900">Pipedream Webhook URL</label>
              <button
                onClick={() => copyToClipboard(config.pipedreamWebhookUrl, 'Webhook URL')}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono text-gray-800 overflow-x-auto">
                {config.pipedreamWebhookUrl}
              </code>
              <a
                href="https://pipedream.com/workflows"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-purple-600 hover:text-purple-700"
                title="Deschide Pipedream"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Acest URL primește IPN-urile de la Netopia (configurează în dashboard-ul Netopia ca notifyURL)
            </p>
          </div>

          {/* Supabase Target Endpoint */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-900">Supabase Target Endpoint</label>
              <button
                onClick={() => copyToClipboard(config.supabaseEndpoint, 'Supabase Endpoint')}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <code className="block px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono text-gray-800 overflow-x-auto">
              {config.supabaseEndpoint}
            </code>
            <p className="text-xs text-gray-500 mt-2">
              Pipedream redirecționează aici cu autentificarea corectă
            </p>
          </div>

          {/* Netopia Public Key */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-900">Netopia Public Key (pentru validare JWT)</label>
              <button
                onClick={() => copyToClipboard(config.netopiaPublicKey, 'Public Key')}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <pre className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs font-mono text-gray-800 overflow-x-auto whitespace-pre-wrap">
{config.netopiaPublicKey}
            </pre>
            <p className="text-xs text-gray-500 mt-2">
              Folosită pentru a valida semnăturile digitale din IPN-urile Netopia
            </p>
          </div>
        </div>

        {/* Flow Diagram */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-900 mb-3">Fluxul IPN:</p>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">1</div>
              <span>Netopia trimite IPN → <code className="text-xs bg-white px-1 py-0.5 rounded">https://eokrex1e5lzckse.m.pipedream.net</code></span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">2</div>
              <span>Pipedream primește și redirecționează cu JWT Supabase</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">3</div>
              <span>Supabase procesează și returnează <code className="text-xs bg-white px-1 py-0.5 rounded">{"{\"errorCode\": 0}"}</code></span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">4</div>
              <span>Netopia primește confirmarea → Plata confirmată! ✅</span>
            </div>
          </div>
        </div>

        {/* Test Connection Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={testConnection}
            disabled={testingConnection}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
          >
            {testingConnection ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Se testează...</span>
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4" />
                <span>Testează Conexiunea</span>
              </>
            )}
          </button>
        </div>

        {/* Recent IPNs */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>IPN-uri Recente</span>
            </h3>
            <button
              onClick={loadRecentIPNs}
              disabled={loadingIPNs}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {loadingIPNs ? 'Se încarcă...' : 'Reîncarcă'}
            </button>
          </div>

          {loadingIPNs ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Se încarcă...</p>
            </div>
          ) : recentIPNs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nu există IPN-uri înregistrate încă</p>
              <p className="text-sm mt-1">Fă un test sau așteaptă o plată reală</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentIPNs.map((ipn) => (
                <div key={ipn.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {ipn.processed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        IPN #{ipn.id}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        ipn.processed 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ipn.processed ? 'Procesat' : 'În așteptare'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(ipn.created_at).toLocaleString('ro-RO')}
                    </span>
                  </div>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(ipn.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-900 mb-2">Link-uri Utile:</p>
          <div className="space-y-2">
            <a
              href="https://pipedream.com/workflows"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Dashboard Pipedream</span>
            </a>
            <a
              href={`https://${projectId}.supabase.co/project/${projectId}/logs/edge-functions`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Supabase Edge Function Logs</span>
            </a>
            <a
              href={`https://${projectId}.supabase.co/project/${projectId}/editor`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Supabase Table Editor (netopia_ipn_queue)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
