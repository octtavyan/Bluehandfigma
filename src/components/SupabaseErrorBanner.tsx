import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface SupabaseErrorBannerProps {
  onRetry?: () => void;
  message?: string;
}

export function SupabaseErrorBanner({ 
  onRetry, 
  message = "Serviciul de date este temporar indisponibil din cauza unei supraîncărcări. Vă rugăm să reîncercați în câteva momente." 
}: SupabaseErrorBannerProps) {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Probleme temporare cu serviciul
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reîncearcă
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DatabaseTimeoutErrorProps {
  operation?: string;
}

export function DatabaseTimeoutError({ operation = "operațiunea" }: DatabaseTimeoutErrorProps) {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Timeout la baza de date
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              Nu am putut finaliza {operation} din cauza unei supraîncărcări a serverului. 
              Acest lucru se poate datora utilizării excesive a traficului (egress).
            </p>
            <p className="mt-2">
              <strong>Soluții:</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Așteptați câteva minute și reîncărcați pagina</li>
              <li>Verificați dashboard-ul admin pentru detalii despre utilizarea resurselor</li>
              <li>Considerați migrarea imaginilor către Cloudinary pentru a reduce egress-ul</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
