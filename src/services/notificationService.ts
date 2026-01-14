// Browser notification service for admin users

export class NotificationService {
  private static instance: NotificationService;
  private isPermissionGranted = false;

  private constructor() {
    this.checkPermission();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkPermission() {
    if ('Notification' in window) {
      this.isPermissionGranted = Notification.permission === 'granted';
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.isPermissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.isPermissionGranted = permission === 'granted';
      return this.isPermissionGranted;
    }

    return false;
  }

  showNotification(title: string, options?: NotificationOptions) {
    if (!this.isPermissionGranted) {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      // Auto-close notification after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  showOrderNotification(orderNumber: string, customerName: string, total: number) {
    this.showNotification('🎨 Comandă Nouă Primită!', {
      body: `Comandă #${orderNumber}\nClient: ${customerName}\nTotal: ${total.toFixed(2)} lei`,
      tag: `order-${orderNumber}`,
      requireInteraction: true,
      vibrate: [200, 100, 200],
    });
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  hasPermission(): boolean {
    return this.isPermissionGranted;
  }

  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }
}

export const notificationService = NotificationService.getInstance();
