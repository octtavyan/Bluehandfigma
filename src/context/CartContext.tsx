import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { CartItem, Product, PersonalizationData } from '../types';
import { toast } from 'sonner@2.0.3';
import { useNavigate } from 'react-router';
import { getStorageItem, setStorageItem, removeStorageItem, isIOS } from '../utils/storage';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { trackAddToCartFromProduct } from '../utils/facebookPixel';

interface SizeData {
  id: string;
  width: number;
  height: number;
  price: number;
  discount: number;
  isActive: boolean;
  framePrices?: Record<string, { 
    price: number; 
    discount: number;
    availableForCanvas?: boolean;
    availableForPrint?: boolean;
  }>;
}

interface FrameTypeData {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number, selectedDimension?: string, printType?: 'Print Canvas' | 'Print Hartie', frameType?: string, customization?: PersonalizationData) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  hasShownReturnToast: boolean;
  markReturnToastShown: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bluehand_cart';
const TOAST_SHOWN_KEY = 'bluehand_cart_toast_shown';
const SESSION_ID_KEY = 'bluehand_session_id';
const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500`;

// Generate or retrieve session ID for cart persistence
function getSessionId(): string {
  let sessionId = getStorageItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setStorageItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

// Validate cart item to ensure proper data structure
function validateCartItem(item: CartItem): boolean {
  // Ensure printType and frameType are strings (not objects)
  if (item.printType && typeof item.printType !== 'string') {
    console.warn('Invalid printType in cart item:', item.id);
    return false;
  }
  if (item.frameType && typeof item.frameType !== 'string') {
    console.warn('Invalid frameType in cart item:', item.id);
    return false;
  }
  return true;
}

export const CartProvider: React.FC<{ children: ReactNode; sizes?: SizeData[]; frameTypes?: FrameTypeData[] }> = ({ children, sizes = [], frameTypes = [] }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hasShownReturnToast, setHasShownReturnToast] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const sessionId = getSessionId();

  // Load cart from server on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        // Try to load from server first
        const response = await fetch(`${SERVER_URL}/cart/load/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.cart && Array.isArray(data.cart)) {
            // Validate and clean cart items
            const cleanedCart = data.cart.filter(validateCartItem);
            setCart(cleanedCart);
            
            // Show return toast if cart has items
            const toastShown = sessionStorage.getItem(TOAST_SHOWN_KEY);
            if (cleanedCart.length > 0 && !toastShown) {
              setHasShownReturnToast(false);
            } else {
              setHasShownReturnToast(true);
            }
            
            console.log('✅ Cart loaded from server:', cleanedCart.length, 'items');
          }
        } else {
          // Fallback to localStorage if server fails
          const savedCart = getStorageItem(CART_STORAGE_KEY);
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            const cleanedCart = parsedCart.filter(validateCartItem);
            setCart(cleanedCart);
          }
        }
      } catch (error) {
        console.error('❌ Error loading cart:', error);
        // Fallback to localStorage
        const savedCart = getStorageItem(CART_STORAGE_KEY);
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            const cleanedCart = parsedCart.filter(validateCartItem);
            setCart(cleanedCart);
          } catch (parseError) {
            console.error('❌ Error parsing localStorage cart:', parseError);
          }
        }
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadCart();
  }, []);

  // Save cart to localStorage and server whenever it changes
  useEffect(() => {
    if (!isInitialized) return;

    const saveCart = async () => {
      try {
        // Prepare cart for storage (reduce size for personalized items)
        const cartToSave = cart.map(item => {
          if (item.customization?.uploadedImages && item.customization.uploadedImages.length > 0) {
            // Keep only essential data, remove large base64 images
            return {
              ...item,
              customization: {
                ...item.customization,
                uploadedImages: [], // Remove original large images to save space
              }
            };
          }
          return item;
        });
        
        // Save to localStorage
        setStorageItem(CART_STORAGE_KEY, JSON.stringify(cartToSave));
        
        // Save to server (async, don't block)
        fetch(`${SERVER_URL}/cart/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ sessionId, cart: cartToSave })
        }).catch(error => {
          console.error('⚠️ Failed to save cart to server:', error);
        });
        
      } catch (error: any) {
        if (error.name === 'QuotaExceededError') {
          console.error('⚠️ localStorage quota exceeded');
          toast.error('Coșul este plin. Te rugăm să finalizezi comanda.');
        } else {
          console.error('❌ Error saving cart:', error);
        }
      }
    };
    
    saveCart();
  }, [cart, isInitialized, sessionId]);

  const markReturnToastShown = () => {
    setHasShownReturnToast(true);
    sessionStorage.setItem(TOAST_SHOWN_KEY, 'true');
  };

  const addToCart = (
    product: any,
    quantity: number = 1,
    selectedDimension?: string,
    printType?: 'Print Canvas' | 'Print Hartie',
    frameType?: string,
    customization?: PersonalizationData
  ) => {
    try {
      // Validate inputs
      if (printType && typeof printType !== 'string') {
        console.error('❌ Invalid printType - must be string:', printType);
        toast.error('Eroare la adăugarea în coș.');
        return;
      }
      if (frameType && typeof frameType !== 'string') {
        console.error('❌ Invalid frameType - must be string:', frameType);
        toast.error('Eroare la adăugarea în coș.');
        return;
      }

      setCart(prevCart => {
        // For personalized items, always add as new (don't merge)
        if (customization) {
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            product,
            quantity,
            selectedDimension,
            printType,
            frameType,
            customization,
          };
          toast.success('Produs adăugat în coș!');
          trackAddToCartFromProduct(product, quantity, selectedDimension, printType, frameType, customization);
          return [...prevCart, newItem];
        }

        // For regular products, check if already exists
        const existingItem = prevCart.find(
          item => 
            item.product.id === product.id && 
            item.selectedDimension === selectedDimension &&
            item.printType === printType &&
            item.frameType === frameType &&
            !item.customization
        );

        if (existingItem) {
          toast.success('Cantitate actualizată în coș!');
          return prevCart.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        toast.success('Produs adăugat în coș!');
        trackAddToCartFromProduct(product, quantity, selectedDimension, printType, frameType, customization);
        return [
          ...prevCart,
          {
            id: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            product,
            quantity,
            selectedDimension,
            printType,
            frameType,
            customization,
          },
        ];
      });
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      toast.error('Eroare la adăugarea în coș. Te rugăm să încerci din nou.');
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
    toast.success('Produs eliminat din coș');
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = async () => {
    setCart([]);
    // Clear from server
    try {
      await fetch(`${SERVER_URL}/cart/clear/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
    } catch (error) {
      console.error('⚠️ Failed to clear cart on server:', error);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      // Personalized canvas items
      if (item.customization) {
        return total + item.customization.price * item.quantity;
      }
      
      // New system: paintings with availableSizes array
      const hasAvailableSizes = item.product.availableSizes && Array.isArray(item.product.availableSizes);
      
      if (hasAvailableSizes && item.selectedDimension) {
        const sizeData = sizes.find(s => s.id === item.selectedDimension);
        let itemPrice = 0;
        
        if (sizeData) {
          // Apply size discount
          itemPrice = sizeData.discount > 0
            ? sizeData.price * (1 - sizeData.discount / 100)
            : sizeData.price;
        } else {
          // Fallback to base price
          itemPrice = item.product.price || 0;
        }
        
        // Add frame price if selected
        if (item.frameType && sizeData?.framePrices && sizeData.framePrices[item.frameType]) {
          const framePricing = sizeData.framePrices[item.frameType];
          const framePrice = framePricing.price * (1 - framePricing.discount / 100);
          itemPrice += framePrice;
        }
        
        return total + itemPrice * item.quantity;
      }
      
      // Old system: paintings with sizes array (deprecated but kept for backward compatibility)
      const hasOldSizes = item.product.sizes && Array.isArray(item.product.sizes);
      if (hasOldSizes) {
        const sizeData = item.product.sizes.find((s: any) => s.sizeId === item.selectedDimension);
        const price = sizeData ? sizeData.price : item.product.sizes[0]?.price || 0;
        return total + price * item.quantity;
      }
      
      // Legacy products with dimensions
      const dimension = item.product.dimensions?.find(d => d.size === item.selectedDimension);
      const price = dimension ? dimension.price : item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        hasShownReturnToast,
        markReturnToastShown,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};