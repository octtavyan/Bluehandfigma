import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Browser-ul tău nu suportă notificări.');
      return;
    }

    setIsRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const testNotification = () => {
    if (permission === 'granted') {
      new Notification('🎉 Test Notificare', {
        body: 'Notificările funcționează perfect!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Bell className="w-6 h-6 text-gray-700" />
        <div>
          <h3 className="text-lg text-gray-900">Notificări Browser</h3>
          <p className="text-sm text-gray-600">Primește notificări pentru comenzi noi și comentarii</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {permission === 'granted' ? (
              <>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">Notificări Activate</p>
                  <p className="text-xs text-gray-600">Vei primi notificări în browser</p>
                </div>
              </>
            ) : permission === 'denied' ? (
              <>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">Notificări Blocate</p>
                  <p className="text-xs text-gray-600">Activează notificările din setările browser-ului</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <BellOff className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">Notificări Dezactivate</p>
                  <p className="text-xs text-gray-600">Activează pentru a primi notificări</p>
                </div>
              </>
            )}
          </div>

          {permission === 'granted' && (
            <button
              onClick={testNotification}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Test Notificare
            </button>
          )}

          {permission === 'default' && (
            <button
              onClick={requestPermission}
              disabled={isRequesting}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm disabled:opacity-50"
            >
              {isRequesting ? 'Se încarcă...' : 'Activează'}
            </button>
          )}
        </div>

        {/* Notification Types */}
        <div className="space-y-3">
          <h4 className="text-sm text-gray-700 mb-2">Tipuri de Notificări:</h4>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🛒</span>
            </div>
            <div>
              <p className="text-sm text-gray-900">Comenzi Noi</p>
              <p className="text-xs text-gray-600">Sunet + Notificare când primești o comandă nouă</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg">💬</span>
            </div>
            <div>
              <p className="text-sm text-gray-900">Note & Comentarii</p>
              <p className="text-xs text-gray-600">Sunet + Notificare când primești un comentariu pe comandă</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {permission === 'denied' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2">📌 Cum să activezi notificările:</p>
            <ol className="text-xs text-yellow-700 space-y-1 ml-4 list-decimal">
              <li>Click pe iconița de lacăt/informații din bara de adrese</li>
              <li>Caută setarea "Notificări" sau "Notifications"</li>
              <li>Schimbă permisiunea la "Allow" sau "Permite"</li>
              <li>Reîmprospătează pagina</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
