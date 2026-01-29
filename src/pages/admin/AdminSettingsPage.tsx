import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Save, Eye, EyeOff, CreditCard, Shield, Globe, Mail, Users as UsersIcon, Database, Cloud, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useSearchParams } from 'react-router';
import { UserManagementTab } from '../../components/admin/UserManagementTab';
import { EmailConfigTab } from '../../components/admin/EmailConfigTab';
import { CloudinaryConfigTab } from '../../components/admin/CloudinaryConfigTab';
import { DatabaseManagementTab } from '../../components/admin/DatabaseManagementTab';

interface NetopiaSettings {
  merchantId: string;
  apiKey: string; // RSA Private Key (optional for IPN)
  sandboxApiKey: string; // Netopia Sandbox API Key (required for sandbox payments)
  isLive: boolean;
  posSignature: string;
  publicKey: string;
}

interface RevolutSettings {
  apiKey: string; // Revolut Business API Key
  merchantId: string; // Revolut Merchant Account ID
  isLive: boolean; // true = production, false = sandbox
  webhookSecret: string; // For validating webhooks
}

interface PaymentGatewaySettings {
  activeGateway: 'netopia' | 'revolut'; // Which gateway is currently active
}

type TabType = 'email' | 'users' | 'database' | 'payment-gateways' | 'netopia' | 'revolut' | 'cloudinary';

export const AdminSettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'email';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  
  // Payment Gateway Selection state
  const [activeGateway, setActiveGateway] = useState<'netopia' | 'revolut'>('netopia');
  const [loadingGatewaySettings, setLoadingGatewaySettings] = useState(false);
  
  // Netopia state
  const [loadingNetopia, setLoadingNetopia] = useState(false);
  const [savingNetopia, setSavingNetopia] = useState(false);
  const [netopiaSettings, setNetopiaSettings] = useState<NetopiaSettings>({
    merchantId: '',
    apiKey: '',
    sandboxApiKey: '',
    isLive: false,
    posSignature: '',
    publicKey: '',
  });

  // Revolut state
  const [loadingRevolut, setLoadingRevolut] = useState(false);
  const [savingRevolut, setSavingRevolut] = useState(false);
  const [showRevolutApiKey, setShowRevolutApiKey] = useState(false);
  const [revolutSettings, setRevolutSettings] = useState<RevolutSettings>({
    apiKey: '',
    merchantId: '',
    isLive: false,
    webhookSecret: '',
  });

  // Cloudinary state
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('');
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState('');

  useEffect(() => {
    if (activeTab === 'payment-gateways') {
      loadPaymentGatewaySettings();
    } else if (activeTab === 'netopia') {
      loadNetopiaSettings();
    } else if (activeTab === 'revolut') {
      loadRevolutSettings();
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
          // Ensure all fields have string values (never undefined)
          setNetopiaSettings({
            merchantId: data.settings.merchantId || '',
            apiKey: data.settings.apiKey || '',
            sandboxApiKey: data.settings.sandboxApiKey || '',
            isLive: data.settings.isLive || false,
            posSignature: data.settings.posSignature || '',
            publicKey: data.settings.publicKey || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading Netopia settings:', error);
    } finally {
      setLoadingNetopia(false);
    }
  };

  const saveNetopiaSettings = async () => {
    setSavingNetopia(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/netopia/settings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
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

  // Payment Gateway Selection functions
  const loadPaymentGatewaySettings = async () => {
    setLoadingGatewaySettings(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/payment-gateway/settings`,
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
          setActiveGateway(data.settings.activeGateway || 'netopia');
        }
      }
    } catch (error) {
      console.error('Error loading payment gateway settings:', error);
    } finally {
      setLoadingGatewaySettings(false);
    }
  };

  const savePaymentGatewaySettings = async (gateway: 'netopia' | 'revolut') => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/payment-gateway/settings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ activeGateway: gateway }),
        }
      );

      if (response.ok) {
        setActiveGateway(gateway);
        toast.success(`Gateway-ul de plată activ este acum ${gateway === 'netopia' ? 'Netopia' : 'Revolut Business'}!`);
      } else {
        throw new Error('Failed to save gateway settings');
      }
    } catch (error) {
      console.error('Error saving payment gateway settings:', error);
      toast.error('Eroare la salvarea setărilor');
    }
  };

  // Revolut functions
  const loadRevolutSettings = async () => {
    setLoadingRevolut(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/revolut/settings`,
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
          setRevolutSettings({
            apiKey: data.settings.apiKey || '',
            merchantId: data.settings.merchantId || '',
            isLive: data.settings.isLive || false,
            webhookSecret: data.settings.webhookSecret || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading Revolut settings:', error);
    } finally {
      setLoadingRevolut(false);
    }
  };

  const saveRevolutSettings = async () => {
    setSavingRevolut(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/revolut/settings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(revolutSettings),
        }
      );

      if (response.ok) {
        toast.success('Setări Revolut salvate cu succes!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving Revolut settings:', error);
      toast.error('Eroare la salvarea setărilor');
    } finally {
      setSavingRevolut(false);
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
    { id: 'payment-gateways' as const, label: 'Gateway-uri Plată', icon: Shield },
    { id: 'netopia' as const, label: 'Netopia Config', icon: CreditCard },
    { id: 'revolut' as const, label: 'Revolut Config', icon: Globe },
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* POS Signature */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    POS Signature
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={netopiaSettings.posSignature}
                    onChange={(e) => setNetopiaSettings({ ...netopiaSettings, posSignature: e.target.value })}
                    placeholder="ex: 38CJ-NTJR-M8VL-QSUQ-OHEA"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Găsești în dashboard-ul Netopia, secțiunea "Semnătură"
                  </p>
                </div>

                {/* Sandbox API Key - Only shown in test mode */}
                {!netopiaSettings.isLive && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Sandbox API Key
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={netopiaSettings.sandboxApiKey}
                      onChange={(e) => setNetopiaSettings({ ...netopiaSettings, sandboxApiKey: e.target.value })}
                      placeholder="ex: icDO2L_2PqjNJL3F98BLukDRgmmL1z4DPYxu8HYhxVciRdarrVdqzc"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Necesară pentru testarea plăților în modul sandbox
                    </p>
                  </div>
                )}

                {/* Public Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Netopia Public Key
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={netopiaSettings.publicKey}
                    onChange={(e) => setNetopiaSettings({ ...netopiaSettings, publicKey: e.target.value })}
                    placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Descarcă fișierul "Cheie publică" din dashboard-ul Netopia
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Obținere credențiale</p>
                      <p className="text-blue-800">
                        Accesează dashboard-ul Netopia pentru a obține POS Signature, API Key (sandbox), 
                        și Public Key. Asigură-te că ai selectat mediul corect (Sandbox/Live).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={saveNetopiaSettings}
                    disabled={savingNetopia}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {savingNetopia ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Se salvează...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Salvează Setări</span>
                      </span>
                    )}
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

      {/* Payment Gateway Selection Tab */}
      {activeTab === 'payment-gateways' && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          {loadingGatewaySettings ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Se încarcă setările...</div>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl text-gray-900">Gateway-uri de Plată</h2>
                  <p className="text-sm text-gray-600">Selectează gateway-ul de plată activ pentru procesarea tranzacțiilor</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Gateway Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Netopia Card */}
                  <div 
                    onClick={() => savePaymentGatewaySettings('netopia')}
                    className={`cursor-pointer border-2 rounded-lg p-6 transition-all ${
                      activeGateway === 'netopia' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <CreditCard className={`w-8 h-8 ${activeGateway === 'netopia' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <h3 className="text-lg font-semibold text-gray-900">Netopia Payments</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Gateway românesc de plată cu carduri (fost Mobilpay)</p>
                    <div className="flex items-center space-x-2">
                      {activeGateway === 'netopia' ? (
                        <>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-700">Activ</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                          <span className="text-sm text-gray-500">Inactiv</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Revolut Card */}
                  <div 
                    onClick={() => savePaymentGatewaySettings('revolut')}
                    className={`cursor-pointer border-2 rounded-lg p-6 transition-all ${
                      activeGateway === 'revolut' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Globe className={`w-8 h-8 ${activeGateway === 'revolut' ? 'text-purple-600' : 'text-gray-400'}`} />
                      <h3 className="text-lg font-semibold text-gray-900">Revolut Business</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Gateway internațional de plată cu API modern</p>
                    <div className="flex items-center space-x-2">
                      {activeGateway === 'revolut' ? (
                        <>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-700">Activ</span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                          <span className="text-sm text-gray-500">Inactiv</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Notă importantă</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Doar un singur gateway poate fi activ la un moment dat. După selectarea unui gateway, 
                        configurează credențialele în tab-ul corespunzător (Netopia Config sau Revolut Config).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleTabChange('netopia')}
                    className="flex-1 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                  >
                    ⚙️ Configurează Netopia
                  </button>
                  <button
                    onClick={() => handleTabChange('revolut')}
                    className="flex-1 px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                  >
                    ⚙️ Configurează Revolut
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Revolut Configuration Tab */}
      {activeTab === 'revolut' && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          {loadingRevolut ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Se încarcă setările...</div>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl text-gray-900">Revolut Business</h2>
                  <p className="text-sm text-gray-600">Configurează gateway-ul de plată Revolut Business</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Environment Toggle */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Mod de operare</p>
                        <p className="text-xs text-gray-500">
                          {revolutSettings.isLive ? 'Producție (Live) - Plăți reale' : 'Test (Sandbox) - Plăți de test'}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={revolutSettings.isLive}
                        onChange={(e) => setRevolutSettings({ ...revolutSettings, isLive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    API Key {revolutSettings.isLive ? '(Live)' : '(Sandbox)'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRevolutApiKey ? 'text' : 'password'}
                      value={revolutSettings.apiKey}
                      onChange={(e) => setRevolutSettings({ ...revolutSettings, apiKey: e.target.value })}
                      placeholder="sk_prod_... sau sk_sandbox_..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRevolutApiKey(!showRevolutApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showRevolutApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Obține API Key din Revolut Business Dashboard → Settings → API
                  </p>
                </div>

                {/* Merchant ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Merchant Account ID
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={revolutSettings.merchantId}
                    onChange={(e) => setRevolutSettings({ ...revolutSettings, merchantId: e.target.value })}
                    placeholder="ex: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ID-ul contului tău Revolut Merchant
                  </p>
                </div>

                {/* Webhook Secret */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Webhook Secret
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="password"
                    value={revolutSettings.webhookSecret}
                    onChange={(e) => setRevolutSettings({ ...revolutSettings, webhookSecret: e.target.value })}
                    placeholder="whsec_..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Secret pentru validarea webhook-urilor de la Revolut
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div className="text-sm text-purple-900">
                      <p className="font-medium mb-1">URL Webhook</p>
                      <p className="text-purple-800 font-mono text-xs break-all mb-2">
                        {`https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/revolut/webhook`}
                      </p>
                      <p className="text-purple-700 text-xs">
                        Configurează acest URL în Revolut Business Dashboard → Settings → Webhooks
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={saveRevolutSettings}
                    disabled={savingRevolut}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {savingRevolut ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Se salvează...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Salvează Setări</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </AdminLayout>
  );
};
