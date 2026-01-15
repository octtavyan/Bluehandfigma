import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Home, Package } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'success' | 'failed' | 'pending'>('checking');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!orderId) {
      setPaymentStatus('failed');
      setErrorMessage('ID comandă lipsește');
      return;
    }

    checkPaymentStatus();
  }, [orderId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/netopia/status/${orderId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        if (data.status === 'completed' || data.status === 'confirmed') {
          setPaymentStatus('success');
        } else if (data.status === 'pending') {
          setPaymentStatus('pending');
        } else {
          setPaymentStatus('failed');
          setErrorMessage(data.errorMessage || 'Plata a eșuat');
        }
      } else {
        setPaymentStatus('pending');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('pending');
    }
  };

  if (paymentStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
          <h1 className="text-2xl text-gray-900 mb-4">Verificăm plata...</h1>
          <p className="text-gray-600">Te rugăm să aștepți câteva momente</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl text-gray-900 mb-4">Plată Reușită!</h1>
          <p className="text-gray-600 mb-2">Comanda ta a fost plasată cu succes.</p>
          <p className="text-sm text-gray-500 mb-8">Vei primi un email de confirmare în curând.</p>
          
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600 mb-1">Număr comandă</p>
              <p className="text-lg font-mono text-gray-900">#{orderId.slice(-8)}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Acasă</span>
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Package className="w-5 h-5" />
              <span>Continuă Cumpărăturile</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-12 h-12 text-yellow-600 animate-spin" />
          </div>
          
          <h1 className="text-3xl text-gray-900 mb-4">Plată în Procesare</h1>
          <p className="text-gray-600 mb-2">Plata ta este în curs de procesare.</p>
          <p className="text-sm text-gray-500 mb-8">Vei primi un email de confirmare când plata este finalizată.</p>
          
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600 mb-1">Număr comandă</p>
              <p className="text-lg font-mono text-gray-900">#{orderId.slice(-8)}</p>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Înapoi la Pagina Principală</span>
          </button>
        </div>
      </div>
    );
  }

  // Failed state
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl text-gray-900 mb-4">Plată Eșuată</h1>
        <p className="text-gray-600 mb-2">Ne pare rău, dar plata ta nu a putut fi procesată.</p>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}
        
        <p className="text-sm text-gray-500 mb-8">
          Te rugăm să verifici datele cardului și să încerci din nou, sau contactează-ne pentru asistență.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/cart')}
            className="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Încearcă Din Nou
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Înapoi la Pagina Principală
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Ai nevoie de ajutor?</p>
          <a 
            href="mailto:hello@bluehand.ro" 
            className="text-blue-600 hover:text-blue-700 underline"
          >
            hello@bluehand.ro
          </a>
        </div>
      </div>
    </div>
  );
};
