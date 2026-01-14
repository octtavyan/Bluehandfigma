import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, RefreshCw, Eye, EyeOff, Save, TestTube } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase';

interface FanCourierConfig {
  username: string;
  password: string;
  clientId: string;
  isEnabled: boolean;
  lastTested?: string;
  testStatus?: 'success' | 'failed' | 'untested';
}

export const FanCourierSettings: React.FC = () => {
  const [config, setConfig] = useState<FanCourierConfig>({
    username: '',
    password: '',
    clientId: '',
    isEnabled: false,
    testStatus: 'untested',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load configuration from database
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();
      
      // Try to get settings from kv_store
      const { data, error } = await supabase
        .from('kv_store_bbc0c500')
        .select('value')
        .eq('key', 'fan_courier_config')
        .single();

      if (error) {
        console.log('No FAN Courier config found, using defaults');
        setIsLoading(false);
        return;
      }

      if (data?.value) {
        const savedConfig = typeof data.value === 'string' 
          ? JSON.parse(data.value) 
          : data.value;
        
        setConfig({
          username: savedConfig.username || '',
          password: savedConfig.password || '',
          clientId: savedConfig.clientId || '',
          isEnabled: savedConfig.isEnabled || false,
          lastTested: savedConfig.lastTested,
          testStatus: savedConfig.testStatus || 'untested',
        });
      }
    } catch (error) {
      console.error('Error loading FAN Courier config:', error);
      toast.error('Eroare la încărcarea configurației');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config.username || !config.password || !config.clientId) {
      toast.error('Toate câmpurile sunt obligatorii');
      return;
    }

    setIsSaving(true);

    try {
      if (!isSupabaseConfigured()) {
        toast.error('Supabase nu este configurat');
        return;
      }

      const supabase = getSupabase();
      
      const configToSave = {
        username: config.username.trim(),
        password: config.password.trim(),
        clientId: config.clientId.trim(),
        isEnabled: config.isEnabled,
        lastTested: config.lastTested,
        testStatus: config.testStatus,
      };

      // Save to kv_store
      const { error } = await supabase
        .from('kv_store_bbc0c500')
        .upsert({
          key: 'fan_courier_config',
          value: JSON.stringify(configToSave),
        });

      if (error) {
        throw error;
      }

      toast.success('Configurația a fost salvată cu succes!');
    } catch (error) {
      console.error('Error saving FAN Courier config:', error);
      toast.error('Eroare la salvarea configurației');
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    if (!config.username || !config.password) {
      toast.error('Introduceți username și password pentru testare');
      return;
    }

    setIsTesting(true);

    try {
      // Test authentication with FAN Courier API
      const response = await fetch('https://api.fancourier.ro/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: config.username,
          password: config.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const now = new Date().toISOString();
        setConfig(prev => ({
          ...prev,
          lastTested: now,
          testStatus: 'success',
        }));

        toast.success('Conexiunea a fost testată cu succes! ✅');
        
        // Auto-save after successful test
        setTimeout(() => {
          saveConfig();
        }, 500);
      } else {
        setConfig(prev => ({
          ...prev,
          lastTested: new Date().toISOString(),
          testStatus: 'failed',
        }));
        
        toast.error(`Autentificare eșuată: ${data.message || 'Verificați credențialele'}`);
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      setConfig(prev => ({
        ...prev,
        lastTested: new Date().toISOString(),
        testStatus: 'failed',
      }));
      
      toast.error('Eroare la testarea conexiunii. Verificați conexiunea la internet.');
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Configurare FAN Courier AWB
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Configurați credențialele FAN Courier pentru generarea automată a etichetelor de transport (AWB).
              După configurare, veți putea genera AWB-uri direct din paginile de comenzi.
            </p>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              {config.testStatus === 'success' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Configurat și testat
                </span>
              ) : config.testStatus === 'failed' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                  <XCircle className="w-4 h-4" />
                  Test eșuat
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  <RefreshCw className="w-4 h-4" />
                  Neconfigurat
                </span>
              )}
            </div>

            {config.lastTested && (
              <p className="text-xs text-gray-500 mt-2">
                Ultima testare: {new Date(config.lastTested).toLocaleString('ro-RO', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>

          {/* Enable Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-sm font-medium text-gray-700">Activat</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={config.isEnabled}
                onChange={(e) => setConfig(prev => ({ ...prev, isEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Credențiale API</h3>
        
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.username}
              onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
              placeholder="ex: utilizator@companie.ro"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Username-ul primit de la FAN Courier pentru accesul la API
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={config.password}
                onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Parola asociată contului FAN Courier API
            </p>
          </div>

          {/* Client ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.clientId}
              onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
              placeholder="ex: 7032158"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              ID-ul unic al clientului FAN Courier (cod numeric primit la înregistrare)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={testConnection}
            disabled={isTesting || !config.username || !config.password}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Se testează conexiunea...
              </>
            ) : (
              <>
                <TestTube className="w-5 h-5" />
                Testează Conexiunea
              </>
            )}
          </button>

          <button
            onClick={saveConfig}
            disabled={isSaving || !config.username || !config.password || !config.clientId}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Se salvează...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvează Configurația
              </>
            )}
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Cum obțin credențialele FAN Courier?
        </h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex gap-3">
            <span className="font-semibold flex-shrink-0">1.</span>
            <p>Contactați echipa FAN Courier și solicitați acces la <strong>API SelfAWB</strong></p>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold flex-shrink-0">2.</span>
            <p>Veți primi prin email credențialele: <strong>Username</strong>, <strong>Password</strong> și <strong>Client ID</strong></p>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold flex-shrink-0">3.</span>
            <p>Introduceți credențialele în formular și testați conexiunea</p>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold flex-shrink-0">4.</span>
            <p>După testare reușită, salvați configurația și activați funcționalitatea</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-300">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Informații de contact FAN Courier:</strong>
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Website: <a href="https://www.fancourier.ro" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">www.fancourier.ro</a></li>
            <li>• API SelfAWB: <a href="https://www.fancourier.ro/servicii/self-awb/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">www.fancourier.ro/servicii/self-awb/</a></li>
            <li>• Suport tehnic: Contactați-vă reprezentantul FAN Courier</li>
          </ul>
        </div>
      </div>

      {/* Features Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ce veți putea face după configurare?
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Generare automată AWB</p>
              <p className="text-sm text-gray-600">Creați etichete de transport cu un singur click din pagina comenzii</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Tracking în timp real</p>
              <p className="text-sm text-gray-600">Urmăriți statusul coletelor direct din platformă</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Descărcare etichete PDF</p>
              <p className="text-sm text-gray-600">Imprimați etichetele AWB pentru aplicare pe colete</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Calcul automat dimensiuni</p>
              <p className="text-sm text-gray-600">Greutatea și dimensiunile sunt calculate automat din produse</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
