import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';

export const FanCourierSetupGuide: React.FC = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-2">
            FAN Courier nu este configurat
          </h3>
          <p className="text-sm text-yellow-800 mb-4">
            Pentru a genera AWB-uri automat, trebuie să configurați credențialele FAN Courier în setările aplicației.
          </p>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Pași de configurare:</p>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Contactați FAN Courier pentru a obține acces la API SelfAWB</li>
              <li>Primiți credențialele: username, password, și client ID</li>
              <li>Adăugați următoarele variabile de mediu în platforma de deployment:</li>
            </ol>
            
            <div className="mt-3 bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
              <div>VITE_FAN_COURIER_USERNAME=your_username</div>
              <div>VITE_FAN_COURIER_PASSWORD=your_password</div>
              <div>VITE_FAN_COURIER_CLIENT_ID=your_client_id</div>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href="https://www.fancourier.ro/servicii/self-awb/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Documentație FAN Courier
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/FAN_COURIER_INTEGRATION.md"
              target="_blank"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ghid de integrare
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
