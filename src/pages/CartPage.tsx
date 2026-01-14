import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { sizes, getFrameTypeById } = useAdmin();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Simple loading delay without extra dependencies
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-[#6994FF] rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă coșul...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-gray-900 mb-4">Coșul Tău Este Gol</h2>
          <p className="text-gray-600 mb-8">Adaugă produse în coș pentru a continua</p>
          <Link
            to="/tablouri-canvas"
            className="inline-block px-8 py-3 bg-[#6994FF] text-white rounded-lg hover:bg-[#5078E6] transition-colors"
          >
            Explorează Produsele
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <h1 className="text-gray-900 mb-8">Coșul Tău</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              try {
                // Handle both old products and new paintings
                const isPainting = item.product.availableSizes || (item.product.sizes && Array.isArray(item.product.sizes));
                
                let itemPrice;
                let framePrice = 0;
                let basePrice = 0;
                
                if (item.customization) {
                  itemPrice = item.customization.price;
                  basePrice = itemPrice;
                } else if (isPainting && item.selectedDimension) {
                  // For paintings, find price by sizeId in the sizes table
                  const sizeData = sizes?.find(s => s.id === item.selectedDimension);
                  if (sizeData) {
                    // Calculate base price with discount
                    const hasDiscount = sizeData.discount > 0;
                    basePrice = hasDiscount 
                      ? sizeData.price * (1 - sizeData.discount / 100)
                      : sizeData.price;
                    
                    // Add frame price if frame is selected
                    if (item.frameType && sizeData.framePrices) {
                      const framePriceData = sizeData.framePrices[item.frameType];
                      framePrice = framePriceData?.price || 0;
                    }
                    
                    itemPrice = basePrice + framePrice;
                  } else {
                    // Fallback to base price if size not found
                    itemPrice = item.product.price || 0;
                    basePrice = itemPrice;
                  }
                } else {
                  // For old products
                  itemPrice = item.selectedDimension
                    ? item.product.dimensions?.find(d => d.size === item.selectedDimension)?.price || item.product.price
                    : item.product.price;
                  basePrice = itemPrice;
                }

                const productTitle = isPainting ? item.product.title : item.product.title;
                const productImage = isPainting ? item.product.image : item.product.image;
                
                // Get size name for display - show width x height with orientation
                let sizeName = '';
                
                if (item.customization) {
                  // For personalized items, use the selectedSize from customization
                  sizeName = item.customization.selectedSize || item.selectedDimension || '';
                } else if (item.selectedDimension && sizes) {
                  // For regular products, look up the size in global sizes to get width and height
                  const globalSize = sizes.find(s => s.id === item.selectedDimension);
                  if (globalSize) {
                    // Reverse dimensions if landscape orientation
                    const isLandscape = item.product.orientation === 'landscape';
                    sizeName = isLandscape
                      ? `${globalSize.height}×${globalSize.width} cm`
                      : `${globalSize.width}×${globalSize.height} cm`;
                  } else {
                    sizeName = item.selectedDimension || '';
                  }
                } else {
                  sizeName = item.selectedDimension || '';
                }
                
                // Ensure sizeName is always a string
                if (typeof sizeName !== 'string') {
                  sizeName = '';
                }

                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Header with title and total price */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                      <div>
                        <h3 className="text-gray-900">{productTitle}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {item.product.id}
                        </p>
                      </div>
                      <div className="text-right">
                        {framePrice > 0 ? (
                          <div>
                            <span className="text-sm text-gray-600">
                              {basePrice.toFixed(2)} lei (Print) + {framePrice.toFixed(2)} lei (Ramă)
                            </span>
                            <div className="text-gray-900">{(itemPrice * item.quantity).toFixed(2)} lei</div>
                          </div>
                        ) : (
                          <span className="text-gray-900">{(itemPrice * item.quantity).toFixed(2)} lei</span>
                        )}
                      </div>
                    </div>

                    {/* Main content */}
                    <div className="p-4">
                      <div className="flex items-start space-x-4">
                        {/* Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={
                              item.customization?.croppedImageUrl || 
                              item.customization?.croppedImage || 
                              (item.customization?.uploadedImages && item.customization.uploadedImages.length > 0 
                                ? item.customization.uploadedImages[0] 
                                : productImage)
                            }
                            alt={productTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details Grid */}
                        <div className="flex-1">
                          <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                            {/* Column 1: Print Type / Dimension */}
                            {item.customization ? (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Dimensiune:</p>
                                <p className="text-sm text-gray-900">{item.customization.selectedSize || sizeName}</p>
                              </div>
                            ) : (
                              <>
                                {item.printType && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Tip Print</p>
                                    <p className="text-sm text-gray-900">{item.printType}</p>
                                  </div>
                                )}
                                {!item.printType && sizeName && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Dimensiune</p>
                                    <p className="text-sm text-gray-900">{sizeName}</p>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Column 2: Orientation / Frame */}
                            {item.customization && item.customization.orientation ? (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Orientare:</p>
                                <p className="text-sm text-gray-900 capitalize">{item.customization.orientation}</p>
                              </div>
                            ) : (
                              <>
                                {item.frameType && framePrice > 0 && (() => {
                                  const frameTypeData = getFrameTypeById ? getFrameTypeById(item.frameType) : null;
                                  return frameTypeData ? (
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Ramă</p>
                                      <p className="text-sm text-gray-900">{frameTypeData.name}</p>
                                      <p className="text-xs text-orange-600">+{framePrice.toFixed(2)} lei</p>
                                    </div>
                                  ) : null;
                                })()}
                              </>
                            )}

                            {/* Column 3: Quantity */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Cantitate:</p>
                              <p className="text-sm text-gray-900">{item.quantity}</p>
                            </div>
                          </div>

                          {/* Additional row for non-personalized items - show dimension if print type exists */}
                          {!item.customization && item.printType && sizeName && (
                            <div className="grid grid-cols-3 gap-x-8 gap-y-2 mt-2">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Dimensiune</p>
                                <p className="text-sm text-gray-900">{sizeName}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons - Only delete button, no download/preview */}
                      <div className="flex items-center justify-end mt-4">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } catch (error) {
                console.error('Error processing cart item:', error);
                return null;
              }
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h3 className="text-gray-900 mb-6">Sumar Comandă</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>{getCartTotal().toFixed(2)} lei</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Livrare:</span>
                  <span className="text-green-600">Gratuit</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-2xl text-[#6994FF]">{getCartTotal().toFixed(2)} lei</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full px-8 py-3 bg-[#6994FF] text-white rounded-lg hover:bg-[#5078E6] transition-colors mb-4"
              >
                Finalizează Comanda
              </button>

              <Link
                to="/tablouri-canvas"
                className="block text-center text-gray-700 hover:text-gray-900 transition-colors"
              >
                ← Continuă Cumpărăturile
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-gray-900 mb-3">Cod Promoțional</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Introdu codul"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6994FF]"
                  />
                  <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    Aplică
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};