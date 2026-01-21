import React, { useState, useEffect } from 'react';
import { Mail, Save, AlertCircle, CheckCircle, Eye, EyeOff, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { EmailDomainChecker } from './EmailDomainChecker';

interface ResendSettings {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  isConfigured: boolean;
}

export const EmailConfigTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [useTestDomain, setUseTestDomain] = useState(true);
  const [settings, setSettings] = useState<ResendSettings>({
    apiKey: '',
    fromEmail: 'hello@bluehand.ro',
    fromName: 'BlueHand Canvas',
    isConfigured: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Use Edge Function to get settings (bypasses RLS)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/email/settings`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings.apiKey || !settings.fromEmail || !settings.fromName) {
      toast.error('Completează toate câmpurile obligatorii');
      return;
    }

    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        isConfigured: true,
      };
      
      // Use Edge Function to save settings (bypasses RLS)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/email/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(updatedSettings),
        }
      );

      if (response.ok) {
        setSettings(updatedSettings);
        toast.success('Setări email salvate cu succes!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('Eroare la salvarea setărilor');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error('Introdu o adresă de email pentru test');
      return;
    }

    if (!settings.apiKey) {
      toast.error('Salvează setările înainte de a trimite email de test');
      return;
    }

    setTesting(true);
    try {
      // Call Supabase Edge Function for email testing
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/email/test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            to: testEmail,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Email de test trimis cu succes la ${testEmail}!`);
      } else {
        toast.error(data.error || 'Eroare la trimiterea emailului de test');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Eroare la trimiterea emailului de test');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Se încarcă setările...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl text-gray-900">Configurare Email</h2>
          <p className="text-sm text-gray-600">Setări pentru serviciul de trimitere emailuri</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status Banner */}
        {settings.isConfigured ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-medium">Configurare Email Activă</p>
                <p className="text-green-800 mt-1">
                  Sistemul folosește Resend pentru trimiterea emailurilor. Configurarea este activă și funcțională.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-900">
                <p className="font-medium">Configurare Necesară</p>
                <p className="text-yellow-800 mt-1">
                  Configurează Resend API pentru a putea trimite emailuri automate către clienți.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resend API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resend API Key *
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none pr-12"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Cheia API primită de la Resend
          </p>
        </div>

        {/* From Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Expeditor *
          </label>
          <input
            type="email"
            value={settings.fromEmail}
            onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
            placeholder="hello@bluehand.ro"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Adresa de email de la care se vor trimite emailurile (trebuie verificată în Resend)
          </p>
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-900">
              <strong>ℹ️ Important:</strong> Dacă domeniul nu este verificat în Resend, sistemul va folosi automat <code className="bg-amber-100 px-1 py-0.5 rounded">onboarding@resend.dev</code> (domeniul de test al Resend). Pentru a folosi emailul tău personalizat, verifică domeniul în <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-700">Resend Dashboard → Domains</a>.
            </p>
          </div>
        </div>

        {/* From Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nume Expeditor *
          </label>
          <input
            type="text"
            value={settings.fromName}
            onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
            placeholder="BlueHand Canvas"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Numele care apare ca expeditor în emailuri
          </p>
        </div>

        {/* Test Email Section */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Testează Configurația</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trimite email de test la:
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleTestEmail}
                disabled={testing || !settings.apiKey}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{testing ? 'Se trimite...' : 'Trimite Test'}</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Verifică dacă emailurile se trimit corect înainte de a le folosi în producție
            </p>
          </div>
        </div>

        {/* Domain Verification Checker */}
        <div className="pt-6 border-t border-gray-200">
          <EmailDomainChecker />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Cum obțin cheia API Resend?</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Creează un cont pe <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">resend.com</a></li>
                <li>Verifică domeniul tău (sau folosește domeniul de test Resend)</li>
                <li>Accesează secțiunea "API Keys" din dashboard</li>
                <li>Creează o nouă cheie API</li>
                <li>Copiază cheia și introdu-o mai sus</li>
                <li>Salvează setările și testează configurația</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Se salvează...' : 'Salvează Setări'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};