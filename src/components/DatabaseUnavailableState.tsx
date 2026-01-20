import React from 'react';
import { Database, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface DatabaseUnavailableStateProps {
  title?: string;
  onRetry?: () => void;
  showSupabaseLink?: boolean;
}

export function DatabaseUnavailableState({ 
  title = "Baza de date este temporar indisponibilă",
  onRetry,
  showSupabaseLink = false
}: DatabaseUnavailableStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-red-50 rounded-full p-6 mb-6">
        <Database className="h-16 w-16 text-red-500" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        {title}
      </h2>
      
      <div className="max-w-md space-y-3 text-gray-600 mb-6">
        <p>
          Nu am putut accesa baza de date din cauza unor probleme de conexiune sau timeout.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-left">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900 mb-2">Cauze posibile:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-800">
                <li>Cota de bandwidth (egress) a fost depășită</li>
                <li>Baza de date este supraîncărcată</li>
                <li>Probleme temporare de rețea</li>
                <li>Proiectul Supabase este în pauză</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
          <p className="font-semibold text-blue-900 mb-2">Ce poți face:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Încearcă din nou peste câteva minute</li>
            <li>Verifică dashboard-ul Supabase pentru starea proiectului</li>
            <li>Consultă documentația de troubleshooting</li>
          </ol>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Încearcă din nou
          </button>
        )}
        
        {showSupabaseLink && (
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            Dashboard Supabase
          </a>
        )}
      </div>
      
      <div className="mt-8 text-xs text-gray-500">
        <p>
          Pentru asistență tehnică, consultă <code className="bg-gray-100 px-2 py-1 rounded">/SUPABASE_TIMEOUT_TROUBLESHOOTING.md</code>
        </p>
      </div>
    </div>
  );
}

// Smaller inline version for cards/sections
export function DatabaseUnavailableInline({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <Database className="h-8 w-8 text-red-500 mx-auto mb-2" />
      <p className="text-sm text-red-800 font-medium mb-2">
        Datele nu pot fi încărcate momentan
      </p>
      <p className="text-xs text-red-600 mb-3">
        Baza de date este temporar indisponibilă
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs inline-flex items-center px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reîncearcă
        </button>
      )}
    </div>
  );
}
