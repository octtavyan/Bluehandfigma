import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save, FileText, Shield, RotateCcw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export const AdminLegalPagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'terms' | 'gdpr'>('terms');
  const [termsContent, setTermsContent] = useState('');
  const [gdprContent, setGdprContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      // Test health endpoint first
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/kv/health`;
      
      try {
        const healthResponse = await fetch(healthUrl, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        const healthData = await healthResponse.json();
      } catch (healthError) {
        console.error('Health check error:', healthError);
      }
      
      // Construct URLs
      const termsUrl = `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/kv/get?key=legal_terms_and_conditions`;
      const gdprUrl = `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/kv/get?key=legal_gdpr_policy`;
      
      // Load from database
      const termsResponse = await fetch(termsUrl, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      const gdprResponse = await fetch(gdprUrl, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (termsResponse.ok) {
        const termsData = await termsResponse.json();
        if (termsData.value) {
          setTermsContent(termsData.value);
        }
      } else {
        const errorText = await termsResponse.text();
        console.error('Error loading terms:', termsResponse.status, errorText);
      }

      if (gdprResponse.ok) {
        const gdprData = await gdprResponse.json();
        if (gdprData.value) {
          setGdprContent(gdprData.value);
        }
      } else {
        const errorText = await gdprResponse.text();
        console.error('Error loading GDPR:', gdprResponse.status, errorText);
      }
    } catch (error) {
      console.error('Error loading legal pages:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      // Don't show error toast on initial load if content is empty
      // This is expected behavior when no content has been saved yet
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTerms = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/kv/set?key=legal_terms_and_conditions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: termsContent }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      toast.success('Termenii și Condițiile au fost salvate!');
    } catch (error) {
      console.error('Error saving terms:', error);
      toast.error('Eroare la salvarea conținutului');
    }
  };

  const handleSaveGdpr = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/kv/set?key=legal_gdpr_policy`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: gdprContent }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      toast.success('Politica GDPR a fost salvată!');
    } catch (error) {
      console.error('Error saving GDPR:', error);
      toast.error('Eroare la salvarea conținutului');
    }
  };

  const handleResetTerms = async () => {
    if (!confirm('Sigur vrei să resetezi conținutul la versiunea implicită? Toate modificările vor fi pierdute.')) {
      return;
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/kv/delete?key=legal_terms_and_conditions`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      setTermsContent('');
      toast.success('Conținutul a fost resetat!');
    } catch (error) {
      console.error('Error resetting terms:', error);
      toast.error('Eroare la resetarea conținutului');
    }
  };

  const handleResetGdpr = async () => {
    if (!confirm('Sigur vrei să resetezi conținutul la versiunea implicită? Toate modificările vor fi pierdute.')) {
      return;
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/kv/delete?key=legal_gdpr_policy`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      setGdprContent('');
      toast.success('Conținutul a fost resetat!');
    } catch (error) {
      console.error('Error resetting GDPR:', error);
      toast.error('Eroare la resetarea conținutului');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">Pagini Juridice</h1>
          <p className="text-sm sm:text-base text-gray-600">Gestionează conținutul paginilor juridice</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'terms'
                  ? 'border-[#6994FF] text-[#6994FF]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Termeni și Condiții</span>
            </button>
            <button
              onClick={() => setActiveTab('gdpr')}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'gdpr'
                  ? 'border-[#6994FF] text-[#6994FF]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>GDPR</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Terms Content */}
      {activeTab === 'terms' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl text-gray-900 mb-2">Termeni și Condiții</h2>
            <p className="text-sm text-gray-600">
              Editează conținutul paginii de Termeni și Condiții. Poți folosi HTML pentru formatare.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-2">
              Conținut (HTML)
            </label>
            <textarea
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
              rows={25}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6994FF] font-mono text-sm"
              placeholder="Adaugă conținutul paginii aici..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Exemplu formatare: &lt;h2&gt;Titlu&lt;/h2&gt; &lt;p&gt;Paragraf&lt;/p&gt; &lt;ul&gt;&lt;li&gt;Element listă&lt;/li&gt;&lt;/ul&gt;
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleResetTerms}
              className="flex items-center space-x-2 px-4 py-2 mr-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Resetează la Implicit</span>
            </button>
            <button
              onClick={handleSaveTerms}
              className="flex items-center space-x-2 px-6 py-3 bg-[#6994FF] text-white rounded-lg hover:bg-[#5078E6] transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>Salvează Modificările</span>
            </button>
          </div>
        </div>
      )}

      {/* GDPR Content */}
      {activeTab === 'gdpr' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl text-gray-900 mb-2">Politica GDPR</h2>
            <p className="text-sm text-gray-600">
              Editează conținutul paginii de Politică de Confidențialitate GDPR. Poți folosi HTML pentru formatare.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-2">
              Conținut (HTML)
            </label>
            <textarea
              value={gdprContent}
              onChange={(e) => setGdprContent(e.target.value)}
              rows={25}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6994FF] font-mono text-sm"
              placeholder="Adaugă conținutul paginii aici..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Exemplu formatare: &lt;h2&gt;Titlu&lt;/h2&gt; &lt;p&gt;Paragraf&lt;/p&gt; &lt;ul&gt;&lt;li&gt;Element listă&lt;/li&gt;&lt;/ul&gt;
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleResetGdpr}
              className="flex items-center space-x-2 px-4 py-2 mr-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Resetează la Implicit</span>
            </button>
            <button
              onClick={handleSaveGdpr}
              className="flex items-center space-x-2 px-6 py-3 bg-[#6994FF] text-white rounded-lg hover:bg-[#5078E6] transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>Salvează Modificările</span>
            </button>
          </div>
        </div>
      )}

      {/* Preview Links */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-3">Link-uri Preview</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="/termeni-si-conditii"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Vezi Termeni și Condiții</span>
          </a>
          <a
            href="/gdpr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm"
          >
            <Shield className="w-4 h-4" />
            <span>Vezi GDPR</span>
          </a>
        </div>
      </div>
    </AdminLayout>
  );
};