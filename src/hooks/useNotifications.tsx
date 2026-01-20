import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { toast } from 'sonner@2.0.3';
import { Bell, MessageSquare, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router';

export const useNotifications = () => {
  const { orders, currentUser } = useAdmin();
  const navigate = useNavigate();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const lastOrderCountRef = useRef<number>(0);
  const lastNotesCheckRef = useRef<{ [orderId: string]: number }>({});
  const isInitializedRef = useRef(false);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  // Initialize refs after first load
  useEffect(() => {
    if (!isInitializedRef.current && orders.length > 0) {
      lastOrderCountRef.current = orders.length;
      
      // Initialize notes count for each order
      orders.forEach(order => {
        if (order.orderNotes) {
          lastNotesCheckRef.current[order.id] = order.orderNotes.length;
        }
      });
      
      isInitializedRef.current = true;
    }
  }, [orders]);

  // Play notification sound
  const playSound = (type: 'order' | 'comment') => {
    try {
      // Create AudioContext for generating sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'order') {
        // New order sound: cheerful ascending tone
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } else {
        // New comment sound: single bell-like tone
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // Show browser notification
  const showBrowserNotification = (title: string, body: string, icon?: string) => {
    if (notificationPermission === 'granted' && 'Notification' in window) {
      try {
        const notification = new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: `bluehand-${Date.now()}`,
          requireInteraction: false,
        });

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('Error showing browser notification:', error);
      }
    }
  };

  // Monitor for new orders
  useEffect(() => {
    if (!isInitializedRef.current || !currentUser) return;

    const currentOrderCount = orders.length;
    
    if (currentOrderCount > lastOrderCountRef.current) {
      const newOrdersCount = currentOrderCount - lastOrderCountRef.current;
      const latestOrder = orders[0]; // Assuming orders are sorted by date DESC

      // Play sound
      playSound('order');

      // Show toast notification with click handler
      toast.success(
        <div 
          className="flex items-start space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            navigate(`/admin/orders/${latestOrder?.id}`);
          }}
        >
          <ShoppingCart className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Comandă Nouă!</p>
            <p className="text-sm text-gray-600">
              {latestOrder?.clientName} - {latestOrder?.totalPrice.toFixed(2)} lei
            </p>
            <p className="text-xs text-blue-600 mt-1">Click pentru a vedea detalii →</p>
          </div>
        </div>,
        {
          duration: 5000,
          position: 'top-right',
        }
      );

      // Show browser notification
      showBrowserNotification(
        '🛒 Comandă Nouă Primită!',
        `${latestOrder?.clientName} a plasat o comandă de ${latestOrder?.totalPrice.toFixed(2)} lei`,
      );

      lastOrderCountRef.current = currentOrderCount;
    }
  }, [orders, currentUser, notificationPermission]);

  // Monitor for new comments/notes
  useEffect(() => {
    if (!isInitializedRef.current || !currentUser) return;

    orders.forEach(order => {
      if (!order.orderNotes) return;

      const currentNotesCount = order.orderNotes.length;
      const lastNotesCount = lastNotesCheckRef.current[order.id] || 0;

      if (currentNotesCount > lastNotesCount) {
        const newNotesCount = currentNotesCount - lastNotesCount;
        const latestNote = order.orderNotes[order.orderNotes.length - 1];

        // Don't notify if current user created the note
        if (latestNote.author === currentUser.fullName) {
          lastNotesCheckRef.current[order.id] = currentNotesCount;
          return;
        }

        // Play sound
        playSound('comment');

        // Show toast notification with click handler
        toast.info(
          <div 
            className="flex items-start space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              navigate(`/admin/orders/${order.id}`);
            }}
          >
            <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Notă Nouă pe Comanda #{order.id.slice(-8)}</p>
              <p className="text-sm text-gray-600">
                {latestNote.author}: {latestNote.text.slice(0, 50)}{latestNote.text.length > 50 ? '...' : ''}
              </p>
              <p className="text-xs text-blue-600 mt-1">Click pentru a vedea detalii →</p>
            </div>
          </div>,
          {
            duration: 5000,
            position: 'top-right',
          }
        );

        // Show browser notification
        showBrowserNotification(
          `💬 Notă Nouă - Comanda #${order.id.slice(-8)}`,
          `${latestNote.author}: ${latestNote.text.slice(0, 100)}`,
        );

        lastNotesCheckRef.current[order.id] = currentNotesCount;
      }
    });
  }, [orders, currentUser, notificationPermission]);

  return {
    notificationPermission,
    requestPermission: () => {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    },
  };
};