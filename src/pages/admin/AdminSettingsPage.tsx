import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Save, Eye, EyeOff, CreditCard, Shield, Globe, Mail, Users as UsersIcon, Database, Cloud } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useSearchParams } from 'react-router';
import { UserManagementTab } from '../../components/admin/UserManagementTab';
import { EmailConfigTab } from '../../components/admin/EmailConfigTab';
import { CloudinaryConfigTab } from '../../components/admin/CloudinaryConfigTab';
import { DatabaseManagementTab } from '../../components/admin/DatabaseManagementTab';

interface NetopiaSettings {
  merchantId: string;
  apiKey: string;
  isLive: boolean;
  posSignature: string;
  publicKey: string;
}

type TabType = 'email' | 'users' | 'database' | 'netopia' | 'cloudinary';

export const AdminSettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'email';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  
  // Netopia state
  const [loadingNetopia, setLoadingNetopia] = useState(false);
  const [savingNetopia, setSavingNetopia] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [netopiaSettings, setNetopiaSettings] = useState<NetopiaSettings>({
    merchantId: '',
    apiKey: '',
    isLive: false,
    posSignature: '',
    publicKey: '',
  });

  // Cloudinary state
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('');
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState('');

  useEffect(() => {
    if (activeTab === 'netopia') {
      loadNetopiaSettings();
    }
  }, [activeTab]);

  const loadNetopiaSettings = async () => {
    setLoadingNetopia(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/netopia/settings`,
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
          setNetopiaSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Error loading Netopia settings:', error);
    } finally {
      setLoadingNetopia(false);
    }
  };

  const handleSaveNetopia = async () => {
    setSavingNetopia(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/netopia/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(netopiaSettings),
        }
      );

      if (response.ok) {
        toast.success('Setări Netopia salvate cu succes!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving Netopia settings:', error);
      toast.error('Eroare la salvarea setărilor');
    } finally {
      setSavingNetopia(false);
    }
  };

  const testNetopiaConnection = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/netopia/test`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Conexiune Netopia testată cu succes!');
      } else {
        toast.error('Eroare la testarea conexiunii');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Eroare la testarea conexiunii');
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'email' as const, label: 'Configurare Email', icon: Mail },
    { id: 'users' as const, label: 'Utilizatori', icon: UsersIcon },
    { id: 'database' as const, label: 'Database Management', icon: Database },
    { id: 'netopia' as const, label: 'Netopia Payments', icon: CreditCard },
    { id: 'cloudinary' as const, label: 'Cloudinary', icon: Cloud },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl text-gray-900 mb-2">Setări</h1>
        <p className="text-gray-600">Gestionează integrările și configurările</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b-2 border-gray-200 mb-6">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Email Configuration Tab */}
      {activeTab === 'email' && (
        <EmailConfigTab />
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <UserManagementTab />
      )}

      {/* Database Management Tab */}
      {activeTab === 'database' && (
        <DatabaseManagementTab />
      )}

      {/* Netopia Payments Tab */}
      {activeTab === 'netopia' && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          {loadingNetopia ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Se încarcă setările...</div>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl text-gray-900">Netopia Payments</h2>
                  <p className="text-sm text-gray-600">Configurează gateway-ul de plată Netopia (fost Mobilpay)</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Environment Toggle */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Mod de operare</p>
                        <p className="text-xs text-gray-500">
                          {netopiaSettings.isLive ? 'Producție (Live) - Plăți reale' : 'Test (Sandbox) - Plăți de test'}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={netopiaSettings.isLive}
                        onChange={(e) => setNetopiaSettings({ ...netopiaSettings, isLive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {netopiaSettings.isLive ? 'LIVE' : 'TEST'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Merchant ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Merchant ID (Account ID)
                  </label>
                  <input
                    type="text"
                    value={netopiaSettings.merchantId}
                    onChange={(e) => setNetopiaSettings({ ...netopiaSettings, merchantId: e.target.value })}
                    placeholder="ex: XXXX-XXXX-XXXX-XXXX-XXXX"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    ID-ul contului tău de la Netopia Payments
                  </p>
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key (Secret Key)
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={netopiaSettings.apiKey}
                      onChange={(e) => setNetopiaSettings({ ...netopiaSettings, apiKey: e.target.value })}
                      placeholder="Introdu cheia API secretă"
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
                    Cheia secretă API primită de la Netopia
                  </p>
                </div>

                {/* POS Signature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    POS Signature
                  </label>
                  <input
                    type="text"
                    value={netopiaSettings.posSignature}
                    onChange={(e) => setNetopiaSettings({ ...netopiaSettings, posSignature: e.target.value })}
                    placeholder="ex: XXXX-XXXX-XXXX-XXXX-XXXX"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Semnătura POS pentru autentificare
                  </p>
                </div>

                {/* Public Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public Key (Certificate)
                  </label>
                  <textarea
                    value={netopiaSettings.publicKey}
                    onChange={(e) => setNetopiaSettings({ ...netopiaSettings, publicKey: e.target.value })}
                    placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Certificatul public furnizat de Netopia pentru verificarea semnăturilor
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Cum obțin aceste credențiale?</p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-800">
                        <li>Creează un cont pe <a href="https://netopia-payments.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">netopia-payments.com</a></li>
                        <li>Completează procesul de verificare pentru contul tău de merchant</li>
                        <li>Accesează secțiunea "API & Integrare" din dashboard</li>
                        <li>Copiază credențialele de test pentru dezvoltare</li>
                        <li>După testare, treci la credențialele de producție (LIVE)</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveNetopia}
                    disabled={savingNetopia}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    <span>{savingNetopia ? 'Se salvează...' : 'Salvează Setări'}</span>
                  </button>
                  <button
                    onClick={testNetopiaConnection}
                    disabled={!netopiaSettings.merchantId || !netopiaSettings.apiKey}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Testează Conexiunea
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Cloudinary Tab */}
      {activeTab === 'cloudinary' && (
        <CloudinaryConfigTab />
      )}
    </AdminLayout>
  );
};