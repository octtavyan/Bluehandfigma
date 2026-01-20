import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Search, TrendingUp, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { unsplashSearchesService, unsplashSettingsService, UnsplashSearchStat } from '../../lib/supabaseDataService';

interface UnsplashSettings {
  curatedQueries: string[];
}

export const AdminUnsplashPage: React.FC = () => {
  const [searchStats, setSearchStats] = useState<UnsplashSearchStat[]>([]);
  const [totalSearches, setTotalSearches] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<UnsplashSettings>({
    curatedQueries: ['nature', 'abstract', 'architecture', 'minimal', 'landscape'],
  });
  const [newQuery, setNewQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSearchStats();
    loadSettings();
  }, []);

  const loadSearchStats = async () => {
    try {
      setIsLoading(true);
      const data = await unsplashSearchesService.getStats();
      setSearchStats(data.topSearches);
      setTotalSearches(data.totalSearches);
    } catch (error) {
      console.error('Error loading search stats:', error);
      toast.error('Eroare la încărcarea statisticilor de căutare');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await unsplashSettingsService.get();
      if (data) {
        setSettings({
          curatedQueries: data.curatedQueries
        });
      }
    } catch (error) {
      console.log('Error loading settings (using defaults):', error);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const success = await unsplashSettingsService.save(settings);
      
      if (success) {
        toast.success('Setările au fost salvate cu succes');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Eroare la salvarea setărilor');
    } finally {
      setIsSaving(false);
    }
  };

  const addCuratedQuery = () => {
    if (newQuery.trim() && !settings.curatedQueries.includes(newQuery.trim())) {
      setSettings({
        ...settings,
        curatedQueries: [...settings.curatedQueries, newQuery.trim()],
      });
      setNewQuery('');
    }
  };

  const removeCuratedQuery = (query: string) => {
    setSettings({
      ...settings,
      curatedQueries: settings.curatedQueries.filter((q) => q !== query),
    });
  };

  return (
    <AdminLayout title="Unsplash Management">
      <div className="space-y-6">
        {/* Search Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-[#6994FF]" />
              <h2 className="text-xl font-semibold text-gray-900">
                Statistici Căutări Unsplash
              </h2>
            </div>
            <button
              onClick={loadSearchStats}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizează
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-[#6994FF] rounded-full"></div>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Căutări</div>
                <div className="text-3xl font-bold text-gray-900">{totalSearches}</div>
              </div>

              {searchStats.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nu există încă căutări înregistrate
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Top 20 Căutări
                  </h3>
                  {searchStats.map((stat, index) => (
                    <div
                      key={stat.query}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-white rounded-full text-sm font-medium text-gray-600">
                          {index + 1}
                        </span>
                        <div>
                          <div className="text-gray-900">{stat.query}</div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-[#6994FF]">
                        {stat.count}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Unsplash Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-[#6994FF]" />
            <h2 className="text-xl font-semibold text-gray-900">
              Configurare Unsplash
            </h2>
          </div>

          <div className="space-y-6">
            {/* Curated Queries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuvinte cheie pentru imagini aleatorii
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Adaugă termeni de căutare pentru a genera imagini variate din Unsplash
              </p>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCuratedQuery()}
                  placeholder="Ex: nature, abstract, minimal..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6994FF]"
                />
                <button
                  onClick={addCuratedQuery}
                  className="px-4 py-2 bg-[#6994FF] text-white rounded-lg hover:bg-[#5578E0] transition-colors"
                >
                  Adaugă
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {settings.curatedQueries.map((query) => (
                  <span
                    key={query}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {query}
                    <button
                      onClick={() => removeCuratedQuery(query)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={saveSettings}
                disabled={isSaving}
                className="px-6 py-2 bg-[#6994FF] text-white rounded-lg hover:bg-[#5578E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Se salvează...' : 'Salvează Setările'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};