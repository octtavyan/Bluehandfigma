import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send, Settings } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface DomainCheckResult {
  configured: boolean;
  fromEmail: string;
  fromName: string;
  apiKeyPresent: boolean;
  usingFallback: boolean;
}

export function EmailDomainChecker() {
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<DomainCheckResult | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const checkDomain = async () => {
    setChecking(true);
    try {
      // Get current email settings
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/email/settings`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        const settings = data.settings;
        setResult({
          configured: settings.isConfigured || false,
          fromEmail: settings.fromEmail || 'onboarding@resend.dev',
          fromName: settings.fromName || 'BlueHand Canvas',
          apiKeyPresent: !!settings.apiKey,
          usingFallback: !settings.fromEmail || settings.fromEmail === 'onboarding@resend.dev'
        });
        
        if (settings.fromEmail && settings.fromEmail !== 'onboarding@resend.dev') {
          toast.success('Setări email găsite!');
        } else {
          toast.info('Se folosește domeniul de testare Resend');
        }
      }
    } catch (error) {
      console.error('Error checking domain:', error);
      toast.error('Eroare la verificarea domeniului');
    } finally {
      setChecking(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Introdu o adresă de email');
      return;
    }

    setSending(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/email/test`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ to: testEmail }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(`Email trimis cu succes! ID: ${data.emailId}`);
      } else {
        // Check if it's a domain verification error
        if (data.error && data.error.includes('domain')) {
          toast.error('Domeniul nu este verificat. Folosește onboarding@resend.dev sau verifică domeniul.');
        } else {
          toast.error(data.error || 'Eroare la trimiterea emailului');
        }
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Eroare la trimiterea emailului de test');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Verificare Domeniu Email
        </h3>
        <p className="text-gray-600">
          Verifică starea configurației domeniului pentru email-uri
        </p>
      </div>

      {/* Check Domain Button */}
      <div>
        <button
          onClick={checkDomain}
          disabled={checking}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {checking ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verificare...
            </>
          ) : (
            <>
              <Settings className="w-5 h-5" />
              Verifică Configurația
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Status Card */}
          <div className={`p-6 rounded-lg border-2 ${
            result.usingFallback 
              ? 'bg-yellow-50 border-yellow-300' 
              : 'bg-green-50 border-green-300'
          }`}>
            <div className="flex items-start gap-3">
              {result.usingFallback ? (
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`font-semibold mb-2 ${
                  result.usingFallback ? 'text-yellow-900' : 'text-green-900'
                }`}>
                  {result.usingFallback ? 'Mod Testare (Resend)' : 'Domeniu Configurat'}
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">From Email:</span>{' '}
                    <code className="px-2 py-1 bg-white/50 rounded text-xs">
                      {result.fromEmail}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">From Name:</span>{' '}
                    <span className="text-gray-700">{result.fromName}</span>
                  </div>
                  <div>
                    <span className="font-medium">API Key:</span>{' '}
                    {result.apiKeyPresent ? (
                      <span className="text-green-700">✓ Configurat (RESEND_API_KEY)</span>
                    ) : (
                      <span className="text-red-700">✗ Lipsă</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {result.usingFallback && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Cum să verifici domeniul
              </h5>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Accesează <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline font-medium">Resend Dashboard → Domains</a></li>
                <li>Adaugă domeniul tău (ex: <code className="px-1 bg-white/50 rounded">bluehand.ro</code>)</li>
                <li>Resend îți va da 3 DNS records (SPF, DKIM, DMARC)</li>
                <li>Adaugă aceste DNS records în panoul de hosting/domain</li>
                <li>Așteaptă până când Resend confirmă verificarea (câteva minute - 48h)</li>
                <li>După verificare, configurează email-ul în tab-ul "Setări Email"</li>
              </ol>
            </div>
          )}

          {!result.usingFallback && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Domeniu Configurat
              </h5>
              <p className="text-sm text-green-800">
                Email-urile vor fi trimise de la <strong>{result.fromEmail}</strong>. 
                Asigură-te că domeniul este verificat în Resend pentru a evita erorile de livrare.
              </p>
            </div>
          )}

          {/* Test Email Section */}
          <div className="border-t-2 border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Trimite Email de Test</h4>
            <div className="flex gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="email@exemplu.ro"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={sendTestEmail}
                disabled={sending || !testEmail}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Trimitere...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Trimite
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {result.usingFallback 
                ? 'În modul de testare, email-urile pot fi trimise doar către adresa înregistrată în Resend.'
                : 'Poți trimite email-uri către orice adresă.'}
            </p>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
        <h5 className="font-semibold text-gray-900 mb-3">Link-uri Utile</h5>
        <div className="space-y-2 text-sm">
          <a 
            href="https://resend.com/domains" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-blue-600 hover:text-blue-700 underline"
          >
            → Resend Domains Dashboard
          </a>
          <a 
            href="https://resend.com/docs/dashboard/domains/introduction" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-blue-600 hover:text-blue-700 underline"
          >
            → Ghid Verificare Domeniu Resend
          </a>
          <a 
            href="https://resend.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-blue-600 hover:text-blue-700 underline"
          >
            → Resend API Keys
          </a>
        </div>
      </div>

      {/* Current Status Info */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
        <h5 className="font-semibold text-gray-900 mb-2">ℹ️ Info</h5>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• <strong>RESEND_API_KEY</strong> este configurat din variabilele de mediu</p>
          <p>• Email-urile de confirmare comandă folosesc această configurație</p>
          <p>• Dacă domeniul nu este verificat, se folosește <code className="px-1 bg-white rounded text-xs">onboarding@resend.dev</code></p>
          <p>• Pentru producție, trebuie să verifici domeniul tău în Resend</p>
        </div>
      </div>
    </div>
  );
}
