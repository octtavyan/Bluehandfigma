import React, { useState, useEffect } from 'react';
import { Package, Truck, Download, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Settings } from 'lucide-react';
import { OrderItem } from '../../context/AdminContext';
import { Link } from 'react-router-dom';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase';

interface AWBCardProps {
  order: OrderItem;
  onGenerateAWB: () => Promise<void>;
  onUpdateTracking: () => Promise<void>;
  onDownloadLabel: () => Promise<void>;
}

export const AWBCard: React.FC<AWBCardProps> = ({
  order,
  onGenerateAWB,
  onUpdateTracking,
  onDownloadLabel,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFanConfigured, setIsFanConfigured] = useState(true);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);

  // Check if FAN Courier is configured on mount
  useEffect(() => {
    checkFanConfiguration();
  }, []);

  const checkFanConfiguration = async () => {
    setIsCheckingConfig(true);
    
    try {
      if (!isSupabaseConfigured()) {
        setIsFanConfigured(false);
        setIsCheckingConfig(false);
        return;
      }

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('kv_store_bbc0c500')
        .select('value')
        .eq('key', 'fan_courier_config')
        .single();

      if (error || !data?.value) {
        setIsFanConfigured(false);
        setIsCheckingConfig(false);
        return;
      }

      const config = typeof data.value === 'string' 
        ? JSON.parse(data.value) 
        : data.value;

      // Check if enabled and has all required fields
      const isConfigured = config.isEnabled && 
                          config.username && 
                          config.password && 
                          config.clientId;
      
      setIsFanConfigured(isConfigured);
    } catch (error) {
      console.error('Error checking FAN Courier config:', error);
      setIsFanConfigured(false);
    } finally {
      setIsCheckingConfig(false);
    }
  };

  const handleGenerateAWB = async () => {
    setIsGenerating(true);
    try {
      await onGenerateAWB();
      // Re-check configuration after attempting to generate
      await checkFanConfiguration();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateTracking = async () => {
    setIsUpdating(true);
    try {
      await onUpdateTracking();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadLabel = async () => {
    setIsDownloading(true);
    try {
      await onDownloadLabel();
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'in_transit':
        return 'text-blue-600 bg-blue-50';
      case 'returned':
        return 'text-red-600 bg-red-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_transit':
        return <Truck className="w-4 h-4" />;
      case 'returned':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'delivered':
        return 'Livrat';
      case 'in_transit':
        return 'În tranzit';
      case 'returned':
        return 'Returnat';
      case 'cancelled':
        return 'Anulat';
      default:
        return 'În așteptare';
    }
  };

  // If AWB not generated yet
  if (!order.awbNumber) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AWB FAN Courier</h3>
            <p className="text-sm text-gray-500">Generează AWB pentru transport</p>
          </div>
        </div>

        {/* Configuration Warning */}
        {!isCheckingConfig && !isFanConfigured && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 mb-2">
                  FAN Courier nu este configurat
                </p>
                <p className="text-sm text-amber-700 mb-3">
                  Pentru a genera AWB-uri, trebuie să configurezi credențialele FAN Courier.
                </p>
                <Link
                  to="/admin/settings?tab=fancourier"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Configurează FAN Courier
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Greutate estimată</p>
              <p className="font-medium text-gray-900">
                {order.packageWeight || '0.5'} kg
              </p>
            </div>
            <div>
              <p className="text-gray-500">Metoda de livrare</p>
              <p className="font-medium text-gray-900">
                {order.deliveryMethod === 'express' ? 'Express' : 'Standard'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">COD</p>
              <p className="font-medium text-gray-900">
                {order.paymentMethod === 'cash' ? `${order.totalPrice.toFixed(2)} RON` : 'Nu'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Colete</p>
              <p className="font-medium text-gray-900">{order.canvasItems.length} buc</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerateAWB}
          disabled={isGenerating || (!isCheckingConfig && !isFanConfigured)}
          className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Se generează AWB...
            </>
          ) : (
            <>
              <Package className="w-4 h-4" />
              Generează AWB
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-3">
          {!isCheckingConfig && !isFanConfigured 
            ? 'Configurează FAN Courier pentru a genera AWB'
            : 'AWB-ul va fi generat automat cu datele comenzii'
          }
        </p>
      </div>
    );
  }

  // AWB exists
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AWB: {order.awbNumber}</h3>
            <p className="text-sm text-gray-500">FAN Courier</p>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(order.awbStatus)}`}>
          {getStatusIcon(order.awbStatus)}
          {getStatusText(order.awbStatus)}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Generat la:</span>
          <span className="font-medium text-gray-900">
            {order.awbGeneratedAt
              ? new Date(order.awbGeneratedAt).toLocaleString('ro-RO', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '-'}
          </span>
        </div>

        {order.awbLastUpdate && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Ultima actualizare:</span>
            <span className="font-medium text-gray-900">
              {new Date(order.awbLastUpdate).toLocaleString('ro-RO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}

        {order.awbTrackingUrl && (
          <div className="pt-2 border-t border-gray-200">
            <a
              href={order.awbTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              <Truck className="w-4 h-4" />
              Urmărește coletul
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDownloadLabel}
          disabled={isDownloading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {isDownloading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Se descarcă...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Descarcă etichetă
            </>
          )}
        </button>

        <button
          onClick={handleUpdateTracking}
          disabled={isUpdating}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Se actualizează...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Actualizează status
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-3">
        Tracking-ul se actualizează automat o dată pe zi
      </p>
    </div>
  );
};
