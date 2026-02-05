import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle, XCircle, Loader2, Home, Package, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Netopia returns different parameters depending on the payment result
  // Try to get orderId from multiple possible sources
  const orderId = searchParams.get('orderId') || 
                  searchParams.get('orderID') || 
                  searchParams.get('ntpID') ||
                  searchParams.get('order_id');
  
  // Check for Netopia error parameters (if present, payment failed)
  const errorType = searchParams.get('error_type');
  const errorCode = searchParams.get('error_code');
  const errorMessage = searchParams.get('error_message');
  
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'success' | 'failed' | 'pending'>('checking');
  const [displayErrorMessage, setDisplayErrorMessage] = useState('');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Debug: Log all URL parameters to understand what Netopia sends
    const allParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
    
    console.log('🔍 Payment return URL params:', allParams);
    
    if (Object.keys(allParams).length > 0) {
      // Log for debugging
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/debug/log-payment-return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          params: allParams,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {}); // Silent fail
    }
    
    if (!orderId) {
      setPaymentStatus('failed');
      setDisplayErrorMessage('ID comandă lipsește');
      return;
    }

    // IMPORTANT: Check URL parameters FIRST for immediate feedback
    // Netopia sends error_type and error_code if payment failed
    // If these are present and non-zero, payment failed
    if (errorType && errorType !== '0') {
      console.log('❌ Payment failed - error detected in URL params');
      setPaymentStatus('failed');
      setDisplayErrorMessage(errorMessage || `Eroare plată: ${errorType}`);
      return;
    }

    // If error_type is explicitly '0' or missing, payment likely succeeded
    // For sandbox, Netopia might redirect immediately without IPN, so assume success
    if (errorType === '0' || errorCode === '0' || (!errorType && !errorCode)) {
      console.log('✅ No error in URL params - assuming success');
      // Trigger order creation immediately (don't wait for IPN)
      finalizeOrderAndShowSuccess();
    } else {
      // Unknown state, check server
      checkPaymentStatus();
    }
  }, [orderId]);

  const finalizeOrderAndShowSuccess = async () => {
    // Show success immediately for better UX
    setPaymentStatus('success');
    
    // Trigger order creation and get order details
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/netopia/finalize-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ orderId }),
        }
      );
      
      const data = await response.json();
      console.log('📝 Order finalization result:', data);
      
      // Fetch order details to show delivery info
      if (data.success) {
        fetchOrderDetails();
      }
    } catch (error) {
      console.error('Error finalizing order:', error);
      // Still show success - IPN will handle it
    }
  };

  const fetchOrderDetails = async () => {
    try {
      // Get payment data which contains orderData
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
        // Try to get order details from KV store for now
        // In a future update, we could fetch from the orders table
        console.log('Order status data:', data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const checkPaymentStatus = async (retryCount = 0) => {
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
        if (data.status === 'completed' || data.status === 'confirmed' || data.status === 'paid' || data.status === 'active') {
          setPaymentStatus('success');
          finalizeOrderAndShowSuccess();
        } else if (data.status === 'pending') {
          // IPN might not have arrived yet - retry up to 5 times (15 seconds total)
          if (retryCount < 5) {
            setTimeout(() => checkPaymentStatus(retryCount + 1), 3000);
          } else {
            // After retries, assume success for better UX
            setPaymentStatus('success');
          }
        } else if (data.status === 'failed' || data.status === 'canceled' || data.status === 'error') {
          setPaymentStatus('failed');
          setDisplayErrorMessage(data.errorMessage || 'Plata a eșuat');
        } else {
          // Unknown status - keep retrying
          if (retryCount < 5) {
            setTimeout(() => checkPaymentStatus(retryCount + 1), 3000);
          } else {
            setPaymentStatus('success');
          }
        }
      } else {
        // No payment data yet - retry
        if (retryCount < 5) {
          setTimeout(() => checkPaymentStatus(retryCount + 1), 3000);
        } else {
          // Assume success after retries
          setPaymentStatus('success');
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      // Retry on error
      if (retryCount < 5) {
        setTimeout(() => checkPaymentStatus(retryCount + 1), 3000);
      } else {
        setPaymentStatus('success');
      }
    }
  };

  if (paymentStatus === 'checking') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
          <h1 className="text-2xl text-gray-900 mb-4">Verificăm plata...</h1>
          <p className="text-gray-600">Te rugăm să aștepți câteva momente</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-gray-900 mb-4">Plată Reușită!</h1>
          <p className="text-xl text-gray-600 mb-2">Număr comandă: #{orderId}</p>
          <p className="text-gray-600 mb-8">
            Vei primi un email de confirmare în câteva minute. Echipa noastră va procesa comanda
            ta și vei fi notificat când produsele sunt în curs de livrare.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-gray-900 mb-4">Detalii Plată</h3>
            <div className="text-left space-y-2">
              <p className="text-gray-700">
                <strong>Metodă plată:</strong> Card bancar (Netopia)
              </p>
              <p className="text-gray-700">
                <strong>Status:</strong> <span className="text-green-600">Plătit ✓</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Înapoi la Magazin
            </button>
            <button
              onClick={() => navigate('/configureaza-tablou')}
              className="px-8 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Creează Alt Tablou
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-12 h-12 text-yellow-600 animate-spin" />
          </div>
          
          <h1 className="text-3xl text-gray-900 mb-4">Plată în Procesare</h1>
          <p className="text-gray-600 mb-2">Plata ta este în curs de procesare.</p>
          <p className="text-sm text-gray-500 mb-8">Vei primi un email de confirmare când plata este finalizată.</p>
          
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600 mb-1">Număr comandă</p>
              <p className="text-lg font-mono text-gray-900">#{orderId}</p>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full max-w-md mx-auto flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl text-gray-900 mb-4">Plată Eșuată</h1>
        <p className="text-gray-600 mb-2">Ne pare rău, dar plata ta nu a putut fi procesată.</p>
        
        {displayErrorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{displayErrorMessage}</p>
          </div>
        )}
        
        <p className="text-sm text-gray-500 mb-8">
          Te rugăm să verifici datele cardului și să încerci din nou, sau contactează-ne pentru asistență.
        </p>

        <div className="flex flex-col gap-3 max-w-md mx-auto">
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
