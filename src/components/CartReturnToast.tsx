import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner@2.0.3';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartReturnToast: React.FC = () => {
  const { cart, hasShownReturnToast, markReturnToastShown } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (cart.length > 0 && !hasShownReturnToast) {
      const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      
      toast(
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-[#6994FF] rounded-full flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 mb-1">
              Ai {itemCount} {itemCount === 1 ? 'produs' : 'produse'} în coș!
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Finalizează comanda pentru a nu pierde articolele tale.
            </p>
            <button
              onClick={() => {
                navigate('/checkout');
                toast.dismiss();
              }}
              className="w-full px-4 py-2 bg-[#6994FF] text-white rounded-lg hover:bg-[#5078E6] transition-colors text-sm"
            >
              Mergi la Checkout
            </button>
          </div>
        </div>,
        {
          duration: 10000,
          position: 'top-right',
          className: 'cart-return-toast',
        }
      );
      
      markReturnToastShown();
    }
  }, [cart, hasShownReturnToast, markReturnToastShown, navigate]);

  return null;
};