import React, { useState, useEffect as useReactEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Check, ArrowLeft, ExternalLink, Image, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { getDisplayDimensions, getOrientationLabel } from '../utils/dimensionHelper';
import { unsplashService } from '../services/unsplashService';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { paintings, sizes, getDiscountForSize, frameTypes, getFrameTypeById, getFramePriceForSize } = useAdmin();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedPrintType, setSelectedPrintType] = useState<'Print Canvas' | 'Print Hartie' | null>(null);
  const [selectedFrameType, setSelectedFrameType] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isLoadingUnsplash, setIsLoadingUnsplash] = useState(false);
  const [unsplashPainting, setUnsplashPainting] = useState<any>(null);

  // Check if this is an Unsplash image
  const isUnsplashImage = id?.startsWith('unsplash-');
  const unsplashId = isUnsplashImage ? id.replace('unsplash-', '') : null;
  
  // Get return path for Unsplash images
  const unsplashReturnPath = sessionStorage.getItem('unsplash-return-path') || '/tablouri-canvas';

  // Reset state when ID changes
  useReactEffect(() => {
    // Reset all state when navigating to a new product
    setSelectedSize('');
    setSelectedPrintType(null);
    setSelectedFrameType('');
    setQuantity(1);
    setAddedToCart(false);
    setUnsplashPainting(null);
  }, [id]); // Run when ID changes

  // Load Unsplash image if needed
  useReactEffect(() => {
    if (isUnsplashImage && unsplashId) {
      loadUnsplashImage(unsplashId);
    }
  }, [unsplashId, isUnsplashImage]);

  const loadUnsplashImage = async (imageId: string) => {
    try {
      setIsLoadingUnsplash(true);
      
      // First try to load from sessionStorage
      const cachedData = sessionStorage.getItem(`unsplash-${imageId}`);
      if (cachedData) {
        const unsplashImage = JSON.parse(cachedData);
        const convertedPainting = unsplashService.convertToPainting(unsplashImage);
        
        // Populate with all sizes and frame types from global data
        convertedPainting.availableSizes = sizes.map(s => s.id);
        
        // Populate frame types for all print types
        const allFrameTypeIds = frameTypes.map(ft => ft.id);
        convertedPainting.frameTypesByPrintType = {
          'Print Canvas': allFrameTypeIds,
          'Print Hartie': allFrameTypeIds
        };
        
        setUnsplashPainting(convertedPainting);
        setIsLoadingUnsplash(false);
        return;
      }
      
      // Fallback: search for the image (won't work perfectly but better than nothing)
      const result = await unsplashService.searchPhotos(imageId, 1, 1);
      if (result.results.length > 0) {
        const unsplashImage = result.results[0];
        const convertedPainting = unsplashService.convertToPainting(unsplashImage);
        
        // Populate with all sizes and frame types from global data
        convertedPainting.availableSizes = sizes.map(s => s.id);
        
        // Populate frame types for all print types
        const allFrameTypeIds = frameTypes.map(ft => ft.id);
        convertedPainting.frameTypesByPrintType = {
          'Print Canvas': allFrameTypeIds,
          'Print Hartie': allFrameTypeIds
        };
        
        setUnsplashPainting(convertedPainting);
      }
    } catch (error) {
      console.error('Error loading Unsplash image:', error);
    } finally {
      setIsLoadingUnsplash(false);
    }
  };

  const painting = isUnsplashImage ? unsplashPainting : paintings.find(p => p.id === id);

  // Get available sizes - fetch from sizes table using availableSizes IDs
  const availableSizes = painting?.availableSizes
    ? painting.availableSizes
        .map(sizeId => {
          const sizeData = sizes.find(s => s.id === sizeId);
          if (!sizeData || !sizeData.isActive) return null; // Filter out inactive sizes
          
          // Calculate display dimensions based on orientation
          const isLandscape = painting.orientation === 'landscape';
          const displaySizeName = isLandscape 
            ? `${sizeData.height}×${sizeData.width} cm`
            : `${sizeData.width}×${sizeData.height} cm`;
          
          return {
            id: sizeData.id,
            sizeName: displaySizeName,
            price: sizeData.price,
            discount: sizeData.discount
          };
        })
        .filter((size): size is NonNullable<typeof size> => size !== null)
    : [];

  // Calculate available print types based on selected size
  const selectedSizeFullData = selectedSize ? sizes.find(s => s.id === selectedSize) : null;
  const availablePrintTypes: ('Print Canvas' | 'Print Hartie')[] = [];
  
  if (selectedSizeFullData) {
    if (selectedSizeFullData.supportsPrintCanvas) {
      availablePrintTypes.push('Print Canvas');
    }
    if (selectedSizeFullData.supportsPrintHartie) {
      availablePrintTypes.push('Print Hartie');
    }
  }

  // Auto-select first size on load
  React.useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      const firstSize = availableSizes[0];
      if (firstSize) {
        setSelectedSize(firstSize.id);
      }
    }
  }, [availableSizes]);

  // Auto-select first print type based on available print types for selected size
  React.useEffect(() => {
    if (availablePrintTypes.length > 0 && !selectedPrintType) {
      // Prioritize Print Canvas if available, otherwise use first
      const preferredPrintType = availablePrintTypes.includes('Print Canvas') 
        ? 'Print Canvas' 
        : availablePrintTypes[0];
      setSelectedPrintType(preferredPrintType);
    } else if (availablePrintTypes.length > 0 && selectedPrintType && !availablePrintTypes.includes(selectedPrintType)) {
      // Reset print type if currently selected one is not available for this size
      setSelectedPrintType(availablePrintTypes[0]);
    }
  }, [selectedSize, availablePrintTypes.join(',')]);

  // Auto-select first frame type when size is selected
  React.useEffect(() => {
    if (selectedSize && frameTypes.length > 0) {
      // Find "Fara Rama" frame type
      const faraRamaFrame = frameTypes.find(ft => ft.name === 'Fara Rama');
      if (faraRamaFrame && !selectedFrameType) {
        setSelectedFrameType(faraRamaFrame.id);
      }
    }
  }, [selectedSize, frameTypes, selectedFrameType]);

  // Get available frame types for the selected print type
  // Use ALL frame types - filtering is done by availableForCanvas/availableForPrint system
  const availableFrameTypeIds = frameTypes.map(ft => ft.id);
  
  const availableFrameTypes = availableFrameTypeIds
    .map(id => {
      const frameType = getFrameTypeById(id);
      return frameType && frameType.isActive ? frameType : null;
    })
    .filter((ft): ft is NonNullable<typeof ft> => ft !== null)
    .filter(frameType => {
      if (!selectedSize) return false;
      
      const framePricing = getFramePriceForSize(selectedSize, frameType.id);
      
      // For "Fara Rama", only show if it has a configured price (even if 0)
      // Check if the frame pricing actually exists in the size's framePrices
      const sizeData = sizes.find(s => s.id === selectedSize);
      const hasFramePricing = sizeData?.framePrices && frameType.id in sizeData.framePrices;
      
      if (frameType.name === 'Fara Rama') {
        // Only show if frame pricing is explicitly configured AND available for selected print type
        if (!hasFramePricing) return false;
        
        // Check availability based on print type
        const isPrintCanvas = selectedPrintType === 'Print Canvas';
        const isPrintHartie = selectedPrintType === 'Print Hartie';
        
        // Default to true if flags are not set (backwards compatibility)
        const availableForCanvas = framePricing.availableForCanvas !== false;
        const availableForPrint = framePricing.availableForPrint !== false;
        
        if (isPrintCanvas && !availableForCanvas) return false;
        if (isPrintHartie && !availableForPrint) return false;
        
        return true;
      }
      
      // For other frame types, check availability based on selected print type
      // Must have a price > 0
      if (framePricing.price <= 0) return false;
      
      // Check availability based on print type
      const isPrintCanvas = selectedPrintType === 'Print Canvas';
      const isPrintHartie = selectedPrintType === 'Print Hartie';
      
      // Default to true if flags are not set (backwards compatibility)
      const availableForCanvas = framePricing.availableForCanvas !== false;
      const availableForPrint = framePricing.availableForPrint !== false;
      
      if (isPrintCanvas && !availableForCanvas) return false;
      if (isPrintHartie && !availableForPrint) return false;
      
      return true;
    });

  if (!painting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Produsul nu a fost găsit</p>
          <Link
            to="/tablouri-canvas"
            className="inline-block px-6 py-3 bg-[#6994FF] text-white rounded-lg hover:bg-[#5078E6] transition-colors"
          >
            Înapoi la Tablouri
          </Link>
        </div>
      </div>
    );
  }

  const selectedSizeData = availableSizes.find(s => s.id === selectedSize);
  
  // Calculate price - size price + frame price
  let currentPrice = painting.price;
  if (selectedSizeData) {
    currentPrice = selectedSizeData.price;
  }

  // Apply size discount from the master sizes table
  const sizeDiscount = selectedSizeData ? getDiscountForSize(selectedSizeData.id) : 0;
  let finalPrice = currentPrice * (1 - sizeDiscount / 100);

  // Add frame type price if selected
  if (selectedFrameType && selectedSize) {
    const framePricing = getFramePriceForSize(selectedSize, selectedFrameType);
    const framePrice = framePricing.price * (1 - framePricing.discount / 100);
    finalPrice += framePrice;
  }

  const handleAddToCart = () => {
    if (!selectedSizeData) {
      return;
    }
    
    addToCart(
      painting, // Pass the full painting object
      quantity,
      selectedSize, // Pass the sizeId for later price lookup
      selectedPrintType || undefined, // Pass the print type
      selectedFrameType || undefined, // Pass the frame type
      undefined // No customization for regular paintings
    );
    
    setAddedToCart(true);
    
    // Redirect to cart page after a brief delay to show the success state
    setTimeout(() => {
      navigate('/cos');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-[#6994FF] hover:text-[#5078E6] mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Înapoi
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={painting.imageUrls?.original || painting.imageUrls?.medium || painting.image}
                alt={painting.title}
                loading="eager"
                className="w-full h-full object-cover"
              />
              {painting.isBestseller && (
                <span className="absolute top-4 right-4 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full shadow-md">
                  Bestseller
                </span>
              )}
              {sizeDiscount > 0 && (
                <span className="absolute top-4 left-4 px-4 py-2 bg-red-500 text-white rounded-full shadow-md">
                  -{Math.round(sizeDiscount)}%
                </span>
              )}
            </div>
            
            {/* Unsplash Attribution Widget */}
            {painting.unsplashData && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Credite Fotografie</h4>
                <p className="text-sm text-gray-700">
                  Fotografie de{' '}
                  <a 
                    href={painting.unsplashData.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6994FF] hover:underline font-medium"
                  >
                    {painting.unsplashData.photographer}
                  </a>
                  {' '}pe{' '}
                  <a 
                    href={painting.unsplashData.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6994FF] hover:underline font-medium"
                  >
                    Unsplash
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded">
                {painting.category}
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded">
                {painting.subcategory}
              </span>
            </div>

            <h1 className="text-3xl text-gray-900 mb-4">{painting.title}</h1>
            
            {painting.description && (
              <p className="text-gray-600 mb-6">{painting.description}</p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-4xl text-[#6994FF]">
                {finalPrice.toFixed(2)} lei
              </span>
              {sizeDiscount > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {currentPrice.toFixed(2)} lei
                  </span>
                  <span className="text-lg text-green-600">
                    Economisești {(currentPrice - finalPrice).toFixed(2)} lei
                  </span>
                </>
              )}
            </div>

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-gray-900">
                    Selectează Dimensiunea {selectedSizeData && `(${selectedSizeData.sizeName})`}
                  </label>
                  {painting.orientation && (
                    <span className="text-sm text-gray-600 italic">
                      {getOrientationLabel(painting.orientation)}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableSizes.map((size, index) => {
                    // Get discount from sizes table
                    const discount = getDiscountForSize(size.id);
                    const discountedPrice = size.price * (1 - discount / 100);
                    const isSelected = selectedSize === size.id;
                    
                    return (
                      <button
                        key={`${size.id}-${index}`}
                        onClick={() => setSelectedSize(size.id)}
                        className={`px-3 py-3 border-2 rounded-lg transition-all ${
                          isSelected
                            ? 'border-[#6994FF] bg-[#6994FF]/10 shadow-md'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-sm text-gray-900">
                          {size.sizeName}
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <span className={`text-sm ${isSelected ? 'text-[#6994FF]' : 'text-gray-600'}`}>
                            {discountedPrice.toFixed(2)} lei
                          </span>
                          {discount > 0 && (
                            <span className="text-xs text-red-500">
                              -{discount}%
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Print Type Selection */}
            {availablePrintTypes.length > 0 && (
              <div className="mb-6">
                <label className="block text-gray-900 mb-3">
                  Selectează Tipul de Print
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Sort to always show Print Canvas first */}
                  {[...availablePrintTypes].sort((a, b) => {
                    if (a === 'Print Canvas') return -1;
                    if (b === 'Print Canvas') return 1;
                    return 0;
                  }).map((printType) => {
                    const isSelected = selectedPrintType === printType;
                    const isPrintCanvas = printType === 'Print Canvas';
                    const Icon = isPrintCanvas ? Image : FileText;
                    
                    return (
                      <button
                        key={printType}
                        onClick={() => setSelectedPrintType(printType)}
                        className={`px-4 py-3 border-2 rounded-lg transition-all ${ isSelected
                            ? 'border-[#6994FF] bg-[#6994FF]/10 shadow-md'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-[#6994FF]' : 'text-gray-600'}`} />
                          <div className={`text-sm font-medium ${isSelected ? 'text-[#6994FF]' : 'text-gray-900'}`}>
                            {printType}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Frame Type Selection */}
            {availableFrameTypes.length > 0 && (
              <div className="mb-6">
                <label className="block text-gray-900 mb-3">
                  Selectează Tipul de Ramă
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Sort to always show Fara Rama first */}
                  {[...availableFrameTypes].sort((a, b) => {
                    if (a.name === 'Fara Rama') return -1;
                    if (b.name === 'Fara Rama') return 1;
                    return 0;
                  }).map((frameType) => {
                    const isSelected = selectedFrameType === frameType.id;
                    const framePricing = selectedSize ? getFramePriceForSize(selectedSize, frameType.id) : { price: 0, discount: 0 };
                    const framePrice = framePricing.price * (1 - framePricing.discount / 100);
                    
                    return (
                      <button
                        key={frameType.id}
                        onClick={() => setSelectedFrameType(frameType.id)}
                        className={`px-3 py-3 border-2 rounded-lg transition-all ${
                          isSelected
                            ? 'border-[#6994FF] bg-[#6994FF]/10 shadow-md'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className={`text-sm mb-1 ${isSelected ? 'text-[#6994FF]' : 'text-gray-900'}`}>
                          {frameType.name}
                        </div>
                        <div className={`text-xs ${isSelected ? 'text-[#6994FF]' : 'text-gray-600'}`}>
                          {framePrice > 0 ? (
                            <>
                              {framePricing.discount > 0 && (
                                <div className="line-through opacity-60">
                                  {framePricing.price.toFixed(2)} lei
                                </div>
                              )}
                              <div className={framePricing.discount > 0 ? 'text-red-600' : ''}>
                                +{framePrice.toFixed(2)} lei
                                {framePricing.discount > 0 && ` (-${framePricing.discount}%)`}
                              </div>
                            </>
                          ) : (
                            <div>Inclusă</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-gray-900 mb-3">Cantitate</label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-lg"
                >
                  -
                </button>
                <span className="text-gray-900 text-xl w-16 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSizeData}
              className="w-full px-8 py-4 bg-[#6994FF] text-white rounded-lg hover:bg-[#5078E6] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Adăugat în Coș</span>
                </>
              ) : (
                <span>Adaugă în Coș - {(finalPrice * quantity).toFixed(2)} lei</span>
              )}
            </button>

            {/* Combined Features and Product Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalii Produs</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-[#6994FF] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Calitate premium, canvas 100% poliester</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-[#6994FF] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Rezistent la umiditate și UV</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-[#6994FF] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Gata de montat, include sistem de agățat</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-[#6994FF] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Livrare rapidă în 24-48 ore</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                  <div className="flex">
                    <span className="w-1/2 text-gray-700">Categorie:</span>
                    <span className="w-1/2 text-gray-900">{painting.category}</span>
                  </div>
                  <div className="flex">
                    <span className="w-1/2 text-gray-700">Stil:</span>
                    <span className="w-1/2 text-gray-900">{painting.subcategory}</span>
                  </div>
                  <div className="flex">
                    <span className="w-1/2 text-gray-700">Material:</span>
                    <span className="w-1/2 text-gray-900">Canvas 100% poliester</span>
                  </div>
                  <div className="flex">
                    <span className="w-1/2 text-gray-700">Grosime canvas:</span>
                    <span className="w-1/2 text-gray-900">380 g/m²</span>
                  </div>
                  <div className="flex">
                    <span className="w-1/2 text-gray-700">Ramă:</span>
                    <span className="w-1/2 text-gray-900">Lemn 2 cm grosime</span>
                  </div>
                  <div className="flex">
                    <span className="w-1/2 text-gray-700">Sistem agățare:</span>
                    <span className="w-1/2 text-gray-900">Inclus</span>
                  </div>
                  <div className="flex">
                    <span className="w-1/2 text-gray-700">Livrare:</span>
                    <span className="w-1/2 text-gray-900">24-48 ore</span>
                  </div>
                  <div className="flex">
                    <span className="w-1/2 text-gray-700">Dimensiuni disponibile:</span>
                    <span className="w-1/2 text-gray-900">
                      {availableSizes.map(s => s.sizeName).join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};