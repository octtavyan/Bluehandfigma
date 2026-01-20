import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface LoadingWithRetryProps {
  isRetrying?: boolean;
  retryAttempt?: number;
  maxAttempts?: number;
  message?: string;
}

export function LoadingWithRetry({ 
  isRetrying = false, 
  retryAttempt = 0,
  maxAttempts = 2,
  message = "Se încarcă..."
}: LoadingWithRetryProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`mb-4 ${isRetrying ? 'animate-spin' : 'animate-pulse'}`}>
        {isRetrying ? (
          <RefreshCw className="h-12 w-12 text-blue-500" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-blue-500"></div>
          </div>
        )}
      </div>
      
      <p className="text-lg font-medium text-gray-900 mb-2">
        {message}
      </p>
      
      {isRetrying && retryAttempt > 0 && (
        <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
          <AlertTriangle className="h-4 w-4" />
          <span>
            Reîncerc... ({retryAttempt}/{maxAttempts})
          </span>
        </div>
      )}
      
      {!isRetrying && (
        <p className="text-sm text-gray-500">
          Vă rugăm așteptați
        </p>
      )}
    </div>
  );
}

// Inline version for smaller areas
export function LoadingWithRetryInline({ 
  isRetrying = false,
  retryAttempt = 0 
}: { isRetrying?: boolean; retryAttempt?: number }) {
  return (
    <div className="flex items-center justify-center space-x-3 py-4">
      <RefreshCw className={`h-5 w-5 text-blue-500 ${isRetrying ? 'animate-spin' : 'animate-pulse'}`} />
      <span className="text-sm text-gray-600">
        {isRetrying && retryAttempt > 0 ? `Reîncerc (${retryAttempt})...` : 'Se încarcă...'}
      </span>
    </div>
  );
}
