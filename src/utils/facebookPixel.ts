// Facebook Pixel Utility
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const initFacebookPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  // Check if already initialized
  if (window.fbq) return;

  // Initialize Facebook Pixel
  (function(f: any, b: Document, e: string, v: string, n?: any, t?: HTMLScriptElement, s?: HTMLScriptElement) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0] as HTMLScriptElement;
    s.parentNode?.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');

  // Add noscript fallback image
  const noscript = document.createElement('noscript');
  const img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
  noscript.appendChild(img);
  document.body.appendChild(noscript);
};

export const trackEvent = (eventName: string, data?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data);
  }
};

// E-commerce specific events
export const trackViewContent = (data: {
  content_name: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency: string;
}) => {
  trackEvent('ViewContent', data);
};

export const trackAddToCart = (data: {
  content_name: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency: string;
}) => {
  trackEvent('AddToCart', data);
};

export const trackInitiateCheckout = (data: {
  content_ids: string[];
  contents: any[];
  value: number;
  currency: string;
  num_items: number;
}) => {
  trackEvent('InitiateCheckout', data);
};

export const trackPurchase = (data: {
  value: number;
  currency: string;
  content_ids: string[];
  content_type: string;
  contents: any[];
}) => {
  trackEvent('Purchase', data);
};

export const trackSearch = (searchString: string) => {
  trackEvent('Search', { search_string: searchString });
};

export const trackContact = () => {
  trackEvent('Contact');
};

// Helper function for cart tracking
export const trackAddToCartFromProduct = (
  product: any,
  quantity: number,
  selectedDimension?: string,
  printType?: string,
  frameType?: string,
  customization?: any
) => {
  const price = customization?.price || product.price || 0;
  const value = price * quantity;

  trackAddToCart({
    content_name: product.title || product.name || 'Product',
    content_ids: [product.id?.toString() || 'unknown'],
    content_type: 'product',
    value: value,
    currency: 'RON'
  });
};