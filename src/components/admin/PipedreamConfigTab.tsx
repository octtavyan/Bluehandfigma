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
  const [expandedIPNs, setExpandedIPNs] = useState<Record<number, boolean>>({});

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
      // Call our server endpoint which has service role access
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/netopia/ipn-queue`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('IPNs loaded:', result);
        if (result.success && result.ipns) {
          setRecentIPNs(result.ipns);
        } else {
          console.error('Unexpected response format:', result);
          toast.error('Format răspuns neașteptat');
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to load IPNs:', response.status, errorText);
        toast.error(`Eroare la încărcarea IPN-urilor: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading recent IPNs:', error);
      toast.error('Eroare la conectarea la Supabase');
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

        {/* Netopia Expected Response */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-green-900 mb-1">Răspuns Netopia (conform documentației)</p>
              <p className="text-green-800 mb-2">
                Netopia așteaptă un răspuns JSON cu <code className="bg-white px-1 py-0.5 rounded">errorCode: 0</code> pentru a confirma primirea IPN-ului.
              </p>
              <div className="bg-white rounded p-2 font-mono text-xs">
                <div className="text-green-700">✅ Răspuns corect (JSON):</div>
                <code className="text-gray-800">{"{ \"errorCode\": 0 }"}</code>
              </div>
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

          {/* Debug Info */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <p className="font-medium text-yellow-900 mb-1">🔍 Debug Info:</p>
            <p className="text-yellow-800">Verifică consola browser-ului (F12) pentru detalii despre erori.</p>
            <p className="text-yellow-800 mt-1">Dacă nu vezi IPN-uri, verifică:</p>
            <ul className="list-disc list-inside text-yellow-800 mt-1">
              <li>Pipedream a primit IPN-ul (Dashboard Pipedream)</li>
              <li>Supabase a procesat IPN-ul (Edge Function Logs)</li>
              <li>Tabelul netopia_ipn_queue există și are date (Table Editor)</li>
            </ul>
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
              {recentIPNs.map((ipn) => {
                const orderData = ipn.payload?.order || {};
                const paymentData = ipn.payload?.payment || {};
                
                return (
                  <div key={ipn.id} className="border border-gray-200 rounded-lg">
                    {/* Compact Header */}
                    <button
                      onClick={() => setExpandedIPNs(prev => ({ ...prev, [ipn.id]: !prev[ipn.id] }))}
                      className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        {ipn.processed ? (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          IPN #{ipn.id}
                        </span>
                        {orderData.orderID && (
                          <span className="text-xs text-gray-600">
                            • {orderData.orderID}
                          </span>
                        )}
                        {paymentData.amount && (
                          <span className="text-xs text-gray-600">
                            • {paymentData.amount} {paymentData.currency || 'RON'}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          ipn.processed 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {ipn.processed ? 'Procesat' : 'În așteptare'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {new Date(ipn.created_at).toLocaleString('ro-RO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <svg
                          className={`w-4 h-4 text-gray-500 transition-transform ${expandedIPNs[ipn.id] ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    
                    {/* Expanded Content */}
                    {expandedIPNs[ipn.id] && (
                      <div className="px-3 pb-3 pt-1 border-t border-gray-100">
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(ipn.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
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