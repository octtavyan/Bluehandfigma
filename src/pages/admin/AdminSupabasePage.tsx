import React, { useState } from 'react';
import { Database, CheckCircle, HardDrive } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { SQLSchemaViewer } from '../../components/SQLSchemaViewer';
import { SupabaseDebugPanel } from '../../components/SupabaseDebugPanel';
import { projectId } from '../../utils/supabase/info';
import { initializeStorageBucket } from '../../lib/storageInit';
import { toast } from 'sonner';

export const AdminSupabasePage: React.FC = () => {
  const [isInitializingStorage, setIsInitializingStorage] = useState(false);

  const handleInitStorage = async () => {
    setIsInitializingStorage(true);
    try {
      const success = await initializeStorageBucket();
      if (success) {
        toast.success('Storage bucket initialized successfully!');
      } else {
        toast.error('Failed to initialize storage bucket');
      }
    } catch (error) {
      toast.error('Error initializing storage');
      console.error(error);
    } finally {
      setIsInitializingStorage(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2 flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            Configurare Database Supabase
          </h1>
          <p className="text-gray-600">
            Supabase este deja conectat automat de Figma Make. Urmează pașii pentru a finaliza setup-ul bazei de date.
          </p>
        </div>

        {/* Connection Status */}
        <SupabaseDebugPanel />

        {/* Storage Bucket Initialization */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-purple-500" />
            Storage Bucket pentru Imagini
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Bucket-ul de storage pentru imagini optimizate se inițializează automat la pornirea aplicației. 
            Dacă întâmpini probleme cu upload-ul de imagini, poți forța reinițializarea manual.
          </p>
          <button
            onClick={handleInitStorage}
            disabled={isInitializingStorage}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInitializingStorage ? 'Se inițializează...' : 'Inițializează Storage Bucket'}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Bucket name: <code className="bg-gray-100 px-1 rounded">make-bbc0c500-images</code>
          </p>
        </div>

        {/* Setup Steps */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Pași de Configurare
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">Copiază SQL-ul</h3>
                <p className="text-sm text-gray-600">
                  Scroll în jos și click pe butonul "Copy SQL" pentru a copia scriptul complet în clipboard
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">Deschide SQL Editor în Supabase</h3>
                <p className="text-sm text-gray-600">
                  Click pe butonul "Open SQL Editor" pentru a deschide dashboard-ul Supabase într-un tab nou
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">Lipește și Rulează</h3>
                <p className="text-sm text-gray-600">
                  În SQL Editor, lipește scriptul (Ctrl+V sau Cmd+V) și apasă butonul "Run" (▶️)
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                ✓
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">Verifică și Gata!</h3>
                <p className="text-sm text-gray-600">
                  Reîmprospătează această pagină și verifică că statusul de mai sus devine verde "Database Ready"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SQL Viewer */}
        <SQLSchemaViewer />

        {/* What Gets Created */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🗄️ Tabele Care Vor Fi Create
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">paintings</h4>
              <p className="text-sm text-gray-600">Tablouri canvas disponibile în shop</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">sizes</h4>
              <p className="text-sm text-gray-600">Dimensiuni disponibile pentru canvas-uri</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">categories</h4>
              <p className="text-sm text-gray-600">Categorii de produse</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">subcategories</h4>
              <p className="text-sm text-gray-600">Subcategorii de produse</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">orders</h4>
              <p className="text-sm text-gray-600">Comenzi clienți</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">clients</h4>
              <p className="text-sm text-gray-600">Baza de date clienți</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">users</h4>
              <p className="text-sm text-gray-600">Utilizatori admin pentru CMS</p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-1">hero_slides ⭐</h4>
              <p className="text-sm text-blue-700">Slide-uri pentru carousel-ul homepage</p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-1">blog_posts ⭐</h4>
              <p className="text-sm text-blue-700">Articole blog</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Total: 9 tabele</strong> vor fi create cu toate indexurile și politicile de securitate necesare.
            </p>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">❓ Ai nevoie de ajutor?</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Dacă primești erori, verifică că ai copiat ÎNTREGUL script SQL</li>
            <li>• Dacă tabelele există deja, scriptul le va ignora (folosește IF NOT EXISTS)</li>
            <li>• După rulare, poți verifica tabelele în Supabase → Table Editor</li>
            <li>• Pentru debug detaliat, vizitează pagina "Test Supabase" din meniu</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};
