import React, { useState, useEffect } from 'react';
import { OrderStatus } from '../../context/AdminContext';

interface StatusChangeModalProps {
  isOpen: boolean;
  currentStatus?: OrderStatus;
  newStatus?: OrderStatus;
  onConfirm: (reason: string) => void;
  onClose: () => void;
  isBulk?: boolean;
  bulkCount?: number;
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  currentStatus,
  newStatus,
  onConfirm,
  onClose,
  isBulk = false,
  bulkCount = 0,
}) => {
  const [reason, setReason] = useState('');
  const requiresReason = newStatus === 'queue' || newStatus === 'returned';

  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen || !newStatus) return null;

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'new': return 'Nou';
      case 'queue': return 'În Așteptare';
      case 'in-production': return 'În Producție';
      case 'delivered': return 'Livrat';
      case 'returned': return 'Returnat';
      case 'closed': return 'Închis';
      default: return status;
    }
  };

  const handleConfirm = () => {
    if (requiresReason && !reason.trim()) {
      alert('Te rugăm să introduci un motiv');
      return;
    }
    onConfirm(reason.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleConfirm();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 className="text-xl text-gray-900 mb-6">
          {isBulk ? `Schimbă Status pentru ${bulkCount} ${bulkCount === 1 ? 'Comandă' : 'Comenzi'}` : 'Schimbă Status Comandă'}
        </h2>
        
        {isBulk && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-gray-700">
              Ești pe cale să schimbi statusul pentru <strong>{bulkCount}</strong> {bulkCount === 1 ? 'comandă' : 'comenzi'}.
            </p>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-2">
            Status Nou
          </label>
          <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900">
            {getStatusLabel(newStatus)}
          </div>
        </div>

        {requiresReason && (
          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-2">
              Motiv <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Introduceți motivul schimbării statusului..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-gray-900"
              rows={4}
              autoFocus
            />
          </div>
        )}

        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Anulează
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Confirmă
          </button>
        </div>
      </div>
    </div>
  );
};