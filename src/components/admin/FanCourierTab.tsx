import React, { useState, useEffect } from 'react';
import { Package, Save, AlertCircle, CheckCircle, Globe, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface FanCourierSettings {
  username: string;
  password: string;
  clientId: string;
  // Sender information
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderCounty: string;
  senderLocality: string;
  senderStreet: string;
  senderStreetNo: string;
  senderZipCode: string;
  // Default shipment settings
  defaultService: string;
  defaultPayment: string;
  defaultPackages: number;
  defaultWeight: number;
  // Options
  enableAutoAWB: boolean;
  enableAutoEmail: boolean;
  isConfigured: boolean;
}

export const FanCourierTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<FanCourierSettings>({
    username: '',
    password: '',
    clientId: '',
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderCounty: '',
    senderLocality: '',
    senderStreet: '',
    senderStreetNo: '',
    senderZipCode: '',
    defaultService: 'Standard',
    defaultPayment: 'sender',
    defaultPackages: 1,
    defaultWeight: 1,
    enableAutoAWB: false,
    enableAutoEmail: false,
    isConfigured: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/fancourier/settings`,
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
      console.error('Error loading FAN Courier settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/fancourier/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            ...settings,
            isConfigured: !!(settings.username && settings.password && settings.clientId),
          }),
        }
      );

      if (response.ok) {
        toast.success('Setări FAN Courier salvate cu succes!');
        await loadSettings(); // Reload to get updated state
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving FAN Courier settings:', error);
      toast.error('Eroare la salvarea setărilor');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!settings.username || !settings.password) {
      toast.error('Introdu username și parola pentru a testa conexiunea');
      return;
    }

    setTesting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/fancourier/test`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Conexiune FAN Courier testată cu succes!');
      } else {
        toast.error(data.error || 'Eroare la testarea conexiunii');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Eroare la testarea conexiunii');
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
        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
          <Package className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-xl text-gray-900">FAN Courier AWB</h2>
          <p className="text-sm text-gray-600">Configurare generare AWB automată și tracking</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status Banner */}
        {settings.isConfigured ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-medium">FAN Courier Configurat</p>
                <p className="text-green-800 mt-1">
                  Sistemul este conectat la API-ul FAN Courier și poate genera AWB-uri automat.
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
                  Completează datele de autentificare FAN Courier pentru a activa generarea automată de AWB-uri.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* API Credentials Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Credențiale API</h3>
          
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username FAN Courier *
              </label>
              <input
                type="text"
                value={settings.username}
                onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                placeholder="Username-ul tău FAN Courier"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parolă FAN Courier *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={settings.password}
                  onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                  placeholder="Parola ta FAN Courier"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Client ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID *
              </label>
              <input
                type="text"
                value={settings.clientId}
                onChange={(e) => setSettings({ ...settings, clientId: e.target.value })}
                placeholder="ID-ul clientului FAN Courier"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Găsești Client ID în contul tău FAN Courier
              </p>
            </div>
          </div>
        </div>

        {/* Sender Information Section */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informații Expeditor</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume Complet / Firmă
              </label>
              <input
                type="text"
                value={settings.senderName}
                onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                placeholder="BlueHand Canvas"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Sender Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={settings.senderPhone}
                onChange={(e) => setSettings({ ...settings, senderPhone: e.target.value })}
                placeholder="07XXXXXXXX"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Sender Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={settings.senderEmail}
                onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                placeholder="hello@bluehand.ro"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Sender County */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Județ
              </label>
              <input
                type="text"
                value={settings.senderCounty}
                onChange={(e) => setSettings({ ...settings, senderCounty: e.target.value })}
                placeholder="București"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Sender Locality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localitate
              </label>
              <input
                type="text"
                value={settings.senderLocality}
                onChange={(e) => setSettings({ ...settings, senderLocality: e.target.value })}
                placeholder="București"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Sender Street */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Strada
              </label>
              <input
                type="text"
                value={settings.senderStreet}
                onChange={(e) => setSettings({ ...settings, senderStreet: e.target.value })}
                placeholder="Str. Exemplu"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Sender Street No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Număr
              </label>
              <input
                type="text"
                value={settings.senderStreetNo}
                onChange={(e) => setSettings({ ...settings, senderStreetNo: e.target.value })}
                placeholder="Nr. 123"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Sender Zip */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cod Poștal
              </label>
              <input
                type="text"
                value={settings.senderZipCode}
                onChange={(e) => setSettings({ ...settings, senderZipCode: e.target.value })}
                placeholder="012345"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Default Shipment Settings */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Setări Implicite Transport</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Default Service */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serviciu Implicit
              </label>
              <select
                value={settings.defaultService}
                onChange={(e) => setSettings({ ...settings, defaultService: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="Standard">Standard</option>
                <option value="Express">Express</option>
                <option value="Cont Colector">Cont Colector</option>
              </select>
            </div>

            {/* Default Payment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plată Transport
              </label>
              <select
                value={settings.defaultPayment}
                onChange={(e) => setSettings({ ...settings, defaultPayment: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="sender">Expeditor (Noi plătim)</option>
                <option value="recipient">Destinatar (Client plătește)</option>
              </select>
            </div>

            {/* Default Packages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Număr Colete Implicit
              </label>
              <input
                type="number"
                min="1"
                value={settings.defaultPackages}
                onChange={(e) => setSettings({ ...settings, defaultPackages: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Default Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Greutate Implicită (kg)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={settings.defaultWeight}
                onChange={(e) => setSettings({ ...settings, defaultWeight: parseFloat(e.target.value) || 1 })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Automation Options */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Opțiuni Automatizare</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableAutoAWB"
                checked={settings.enableAutoAWB}
                onChange={(e) => setSettings({ ...settings, enableAutoAWB: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableAutoAWB" className="text-sm text-gray-700">
                <span className="font-medium">Generare Automată AWB</span>
                <p className="text-xs text-gray-500 mt-0.5">Generează AWB automat când o comandă intră în status "În Producție"</p>
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableAutoEmail"
                checked={settings.enableAutoEmail}
                onChange={(e) => setSettings({ ...settings, enableAutoEmail: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableAutoEmail" className="text-sm text-gray-700">
                <span className="font-medium">Trimitere Automată Email cu AWB</span>
                <p className="text-xs text-gray-500 mt-0.5">Trimite email clientului cu numărul AWB și link de tracking</p>
              </label>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Cum obțin credențialele FAN Courier?</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Creează un cont de client pe <a href="https://www.fancourier.ro" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">fancourier.ro</a></li>
                <li>Contactează reprezentantul FAN pentru activarea accesului API</li>
                <li>Primești credențialele (username, password, client ID)</li>
                <li>Configurează setările în această pagină</li>
                <li>Testează conexiunea înainte de salvare</li>
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
          <button
            onClick={testConnection}
            disabled={!settings.username || !settings.password || testing}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? 'Se testează...' : 'Testează Conexiunea'}
          </button>
        </div>
      </div>
    </div>
  );
};
