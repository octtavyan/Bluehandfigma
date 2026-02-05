import React, { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { Save, Eye, EyeOff, FileText, AlertCircle, CheckCircle, RefreshCw, Receipt } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface FgoSettings {
  enabled: boolean;
  environment: 'test' | 'production';
  test: {
    codUnic: string;
    cheiePivata: string;
    serie: string;
  };
  production: {
    codUnic: string;
    cheiePivata: string;
    serie: string;
  };
  platformaUrl: string;
}

export const FgoConfigTab: React.FC = () => {
  const [settings, setSettings] = useState<FgoSettings>({
    enabled: false,
    environment: 'test',
    test: {
      codUnic: '',
      cheiePivata: '',
      serie: '',
    },
    production: {
      codUnic: '',
      cheiePivata: '',
      serie: '',
    },
    platformaUrl: typeof window !== 'undefined' ? window.location.origin : '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/fgo/settings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          const loadedSettings = data.settings;
          
          // Migrate old settings format to new format
          if (loadedSettings.codUnic || loadedSettings.cheiePivata || loadedSettings.serie) {
            // Old format detected, migrate to new format
            const migratedSettings: FgoSettings = {
              enabled: loadedSettings.enabled ?? false,
              environment: loadedSettings.environment ?? 'test',
              test: {
                codUnic: loadedSettings.environment === 'test' ? (loadedSettings.codUnic || '') : '',
                cheiePivata: loadedSettings.environment === 'test' ? (loadedSettings.cheiePivata || '') : '',
                serie: loadedSettings.environment === 'test' ? (loadedSettings.serie || '') : '',
              },
              production: {
                codUnic: loadedSettings.environment === 'production' ? (loadedSettings.codUnic || '') : '',
                cheiePivata: loadedSettings.environment === 'production' ? (loadedSettings.cheiePivata || '') : '',
                serie: loadedSettings.environment === 'production' ? (loadedSettings.serie || '') : '',
              },
              platformaUrl: loadedSettings.platformaUrl || (typeof window !== 'undefined' ? window.location.origin : ''),
            };
            setSettings(migratedSettings);
          } else {
            // New format, use as is
            setSettings(loadedSettings);
          }
        }
      }
    } catch (error) {
      console.error('Error loading FGO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/fgo/settings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Setările FGO au fost salvate cu succes!');
      } else {
        toast.error(data.message || 'Eroare la salvarea setărilor');
      }
    } catch (error) {
      console.error('Error saving FGO settings:', error);
      toast.error('Eroare la salvarea setărilor');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    const currentEnv = settings.environment;
    const envSettings = settings[currentEnv];
    
    if (!envSettings.codUnic || !envSettings.cheiePivata || !envSettings.serie) {
      toast.error('Completează toate câmpurile obligatorii înainte de testare');
      return;
    }

    setTesting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/fgo/test`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(`✅ Conexiunea la FGO API (${currentEnv === 'test' ? 'Test' : 'Producție'}) a fost testată cu succes!`);
      } else {
        toast.error(data.message || 'Eroare la testarea conexiunii');
      }
    } catch (error) {
      console.error('Error testing FGO connection:', error);
      toast.error('Eroare la testarea conexiunii');
    } finally {
      setTesting(false);
    }
  };

  // Get current environment settings for easier access
  const currentEnv = settings.environment;
  const currentEnvSettings = settings[currentEnv];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mb-4"></div>
          <p className="text-gray-600">Se încarcă setările...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <Receipt className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-2">Despre FGO (Factura Go)</p>
            <p className="mb-2">
              FGO este un sistem de facturare fiscală conform normelor ANAF din România.
              Pentru a utiliza această integrare, trebuie să ai un cont FGO activ.
            </p>
            <div className="space-y-1">
              <p>• Test: <a href="https://testuat.fgo.ro" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">testuat.fgo.ro</a></p>
              <p>• Producție: <a href="https://www.fgo.ro" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.fgo.ro</a></p>
              <p>• Documentație: <a href="https://api.fgo.ro/v1/testing.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">api.fgo.ro/v1/testing.html</a></p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Activare FGO</h3>
            <p className="text-sm text-gray-600 mt-1">
              Activează generarea automată de facturi prin FGO
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        {/* Environment Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mediu *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="test"
                checked={settings.environment === 'test'}
                onChange={(e) => setSettings({ ...settings, environment: 'test' })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Test (testuat.fgo.ro)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="production"
                checked={settings.environment === 'production'}
                onChange={(e) => setSettings({ ...settings, environment: 'production' })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Producție (api.fgo.ro)</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Începe cu mediul de test pentru a verifica integrarea înainte de a trece la producție
          </p>
        </div>

        {/* CodUnic (CUI) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cod Unic (CUI) *
          </label>
          <input
            type="text"
            value={currentEnvSettings.codUnic}
            onChange={(e) => setSettings({ ...settings, [currentEnv]: { ...currentEnvSettings, codUnic: e.target.value } })}
            placeholder="ex: 12345678"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            CUI-ul companiei tale (fără RO)
          </p>
        </div>

        {/* Private Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cheie Privată *
          </label>
          <div className="relative">
            <input
              type={showPrivateKey ? 'text' : 'password'}
              value={currentEnvSettings.cheiePivata}
              onChange={(e) => setSettings({ ...settings, [currentEnv]: { ...currentEnvSettings, cheiePivata: e.target.value } })}
              placeholder="Cheie privată generată în FGO"
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPrivateKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Generează un utilizator API în FGO → Setări → Utilizatori
          </p>
        </div>

        {/* Serie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Serie Facturi *
          </label>
          <input
            type="text"
            value={currentEnvSettings.serie}
            onChange={(e) => setSettings({ ...settings, [currentEnv]: { ...currentEnvSettings, serie: e.target.value.toUpperCase() } })}
            placeholder="ex: BHC"
            maxLength={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
          />
          <p className="text-xs text-gray-500 mt-1">
            Seria definită în FGO → Setări → Serii Documente
          </p>
        </div>

        {/* Platform URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Platformă (Opțional)
          </label>
          <input
            type="text"
            value={settings.platformaUrl}
            onChange={(e) => setSettings({ ...settings, platformaUrl: e.target.value })}
            placeholder="https://www.bluehandcanvas.ro"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Important:</strong> Dacă folosești acest câmp, trebuie să înregistrezi URL-ul în FGO:
              <br />→ Accesează FGO → <strong>Setări → eCommerce → Setări API</strong>
              <br />→ Adaugă URL-ul platformei tale
              <br />→ Lasă acest câmp gol dacă nu ai nevoie de integrare eCommerce
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Se salvează...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvează Setările
            </>
          )}
        </button>

        <button
          onClick={testConnection}
          disabled={testing || !currentEnvSettings.codUnic || !currentEnvSettings.cheiePivata || !currentEnvSettings.serie}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Se testează...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Testează Conexiunea
            </>
          )}
        </button>
      </div>

      {/* Setup Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          Ghid Rapid de Configurare
        </h3>
        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="font-medium text-blue-600">1.</span>
            <span>Creează cont FGO la <a href="https://testuat.fgo.ro/inregistrare" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">testuat.fgo.ro/inregistrare</a> (pentru test)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-blue-600">2.</span>
            <span>Accesează FGO → Setări → Utilizatori și generează un Utilizator API (vei primi Cheia Privată)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-blue-600">3.</span>
            <span>Definește Registrul în FGO → Setări → Serii Documente (ex: seria "BHC")</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-blue-600">4.</span>
            <span>Completează câmpurile de mai sus cu datele din FGO</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-blue-600">5.</span>
            <span>Testează conexiunea pentru a verifica configurația</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-blue-600">6.</span>
            <span>După testare cu succes, activează integrarea folosind switch-ul de sus</span>
          </li>
        </ol>
      </div>
    </div>
  );
};