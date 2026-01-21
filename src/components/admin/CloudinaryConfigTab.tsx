import React, { useState, useEffect } from 'react';
import { Cloud, Save, AlertCircle, CheckCircle, Eye, EyeOff, Upload, ExternalLink } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface CloudinarySettings {
  cloudName: string;
  uploadPreset: string;
  apiKey: string;
  isConfigured: boolean;
}

export const CloudinaryConfigTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState<CloudinarySettings>({
    cloudName: '',
    uploadPreset: '',
    apiKey: '',
    isConfigured: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/cloudinary/settings`,
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
          setSettings({
            cloudName: data.settings.cloudName || '',
            uploadPreset: data.settings.uploadPreset || '',
            apiKey: data.settings.apiKey || '',
            isConfigured: data.settings.isConfigured || false,
          });
        }
      }
    } catch (error) {
      console.error('Error loading Cloudinary settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings.cloudName || !settings.uploadPreset) {
      toast.error('Cloud Name și Upload Preset sunt obligatorii');
      return;
    }

    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        isConfigured: true,
      };
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/cloudinary/settings`,
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
        // Reload Cloudinary service config
        const { cloudinaryService } = await import('../../services/cloudinaryService');
        await cloudinaryService.reloadConfig();
        toast.success('Setări Cloudinary salvate cu succes!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving Cloudinary settings:', error);
      toast.error('Eroare la salvarea setărilor');
    } finally {
      setSaving(false);
    }
  };

  const handleTestUpload = async () => {
    if (!settings.cloudName || !settings.uploadPreset) {
      toast.error('Salvează setările înainte de a testa');
      return;
    }

    setTesting(true);
    try {
      // Create a simple test canvas image
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#7B93FF';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Test', 25, 55);
      }

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      // Create file from blob
      const file = new File([blob], 'test-image.png', { type: 'image/png' });

      // Upload using cloudinary service
      const { cloudinaryService } = await import('../../services/cloudinaryService');
      await cloudinaryService.reloadConfig(); // Ensure latest config
      const uploadedUrl = await cloudinaryService.uploadImage(file, 'test-uploads');

      toast.success('Upload test reușit! Configurarea funcționează corect.', {
        description: 'Imaginea a fost încărcată pe Cloudinary',
        duration: 5000
      });
    } catch (error) {
      console.error('Error testing Cloudinary upload:', error);
      toast.error(error instanceof Error ? error.message : 'Eroare la testarea uploadului');
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
          <Cloud className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl text-gray-900">Configurare Cloudinary</h2>
          <p className="text-sm text-gray-600">CDN pentru stocarea imaginilor</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status Banner */}
        {settings.isConfigured ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-medium">Configurare Cloudinary Activă</p>
                <p className="text-green-800 mt-1">
                  Imaginile se stochează pe Cloudinary CDN. Configurarea este activă și funcțională.
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
                  Configurează Cloudinary pentru a putea stoca și gestiona imaginile pe CDN.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-2">Unde găsesc aceste informații?</p>
              <div className="space-y-3 text-blue-800">
                <div>
                  <p className="font-medium flex items-center space-x-2">
                    <span>1️⃣ Cloud Name</span>
                    <a 
                      href="https://console.cloudinary.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 text-xs"
                    >
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Mergi pe <a href="https://console.cloudinary.com" target="_blank" rel="noopener noreferrer" className="underline">console.cloudinary.com</a></li>
                    <li>Logează-te în cont</li>
                    <li>Dashboard → Poți vedea "Cloud Name" în partea de sus (ex: "dxxxxxxxxxxxx")</li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium">2️⃣ Upload Preset</p>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Dashboard → Settings (roată dințată) → Upload tab</li>
                    <li>Scroll jos la "Upload presets"</li>
                    <li>Click "Add upload preset"</li>
                    <li><strong>IMPORTANT:</strong> Setează "Signing Mode" la <span className="bg-blue-200 px-1 rounded">Unsigned</span></li>
                    <li>Salvează și copiază numele preset-ului (ex: "bluehand_unsigned")</li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium">3️⃣ API Key (opțional)</p>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Dashboard → Settings → Access Keys tab</li>
                    <li>Poți vedea "API Key" (începe cu numere, ex: "123456789012345")</li>
                    <li>Acest câmp este opțional pentru upload-uri unsigned</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cloud Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cloud Name *
          </label>
          <input
            type="text"
            value={settings.cloudName}
            onChange={(e) => setSettings({ ...settings, cloudName: e.target.value })}
            placeholder="dxxxxxxxxxxxx"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Numele cloud-ului tău Cloudinary (vizibil în dashboard)
          </p>
        </div>

        {/* Upload Preset */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Preset *
          </label>
          <input
            type="text"
            value={settings.uploadPreset}
            onChange={(e) => setSettings({ ...settings, uploadPreset: e.target.value })}
            placeholder="bluehand_unsigned"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Preset-ul pentru upload (trebuie să fie <strong>unsigned</strong>)
          </p>
        </div>

        {/* API Key (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key (opțional)
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder="123456789012345"
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
            Opțional - folosit pentru operații avansate
          </p>
        </div>

        {/* Test Upload Section */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Testează Configurația</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-3">
              Verifică dacă upload-ul pe Cloudinary funcționează corect
            </p>
            <button
              onClick={handleTestUpload}
              disabled={testing || !settings.cloudName || !settings.uploadPreset}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              <span>{testing ? 'Se testează...' : 'Testează Upload'}</span>
            </button>
            <p className="mt-2 text-xs text-gray-500">
              Va încărca o imagine de test pe Cloudinary
            </p>
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