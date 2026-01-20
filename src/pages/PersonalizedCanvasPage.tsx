import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Upload, X, ChevronLeft, ChevronRight, ShoppingCart, Check, ZoomIn, ZoomOut, RotateCw, Move, Loader2, User, MapPin, Package, CreditCard, ArrowRight, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSizes } from '../hooks/useSizes';
import { useAdmin } from '../context/AdminContext';
import { PersonalizationData } from '../types';
import { toast } from 'sonner';
import { uploadPersonalizedImages } from '../utils/imageUpload';
import { cloudinaryService } from '../services/cloudinaryService';

type Step = 'upload-photo' | 'configure';

interface ImageConfig {
  orientation: 'portrait' | 'landscape';
  selectedSize: string;
  imageScale: number;
  imagePosition: { x: number; y: number };
  croppedImage: string;
}

export const PersonalizedCanvasPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const { addOrder } = useAdmin();
  const [currentStep, setCurrentStep] = useState<Step>('upload-photo');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imageConfigs, setImageConfigs] = useState<ImageConfig[]>([]);
  
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [selectedSize, setSelectedSize] = useState<string>('30×40 cm');
  const [imageScale, setImageScale] = useState<number>(1);
  const [imagePosition, setImagePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cropFrameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const [checkoutData, setCheckoutData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryMethod: 'standard' as 'express' | 'standard' | 'economic',
    paymentMethod: 'card' as 'card' | 'cash',
  });
  
  const { sizeOptions: managedSizes, getPriceForSize } = useSizes();
  
  // Convert managed sizes to the format used by this component
  const availableSizes = managedSizes.map(size => ({
    size: `${size.width}×${size.height} cm`,
    price: size.finalPrice,
    aspectRatio: size.width / size.height,
    discount: size.discount,
  }));

  const createPreviewImage = (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8)); // Optimized preview for fast UI display
      };
      img.src = imageUrl;
    });
  };

  const createOptimizedOriginal = (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 4096; // Max 4K resolution - excellent for printing
        let width = img.width;
        let height = img.height;

        // Only resize if image is too large
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.92)); // High quality compression - excellent for printing
      };
      img.src = imageUrl;
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    setIsUploading(true);
    
    try {
      // Check if Cloudinary is configured
      const isConfigured = await cloudinaryService.isConfigured();
      
      if (!isConfigured) {
        toast.error('Cloudinary nu este configurat. Contactează administratorul.');
        setIsUploading(false);
        return;
      }

      const uploadPromises: Promise<void>[] = [];
      
      for (const file of Array.from(files)) {
        const uploadPromise = (async () => {
          try {
            // Upload directly to Cloudinary
            const cloudinaryUrl = await cloudinaryService.uploadImage(file, 'personalized-orders');
            
            // Create preview for display
            const reader = new FileReader();
            const previewPromise = new Promise<string>((resolve) => {
              reader.onload = async (e) => {
                if (e.target?.result) {
                  const previewImage = await createPreviewImage(e.target.result as string);
                  resolve(previewImage);
                }
              };
              reader.readAsDataURL(file);
            });
            
            const previewImage = await previewPromise;
            
            // Use Cloudinary URL as the main image
            setUploadedImages(prev => [...prev, cloudinaryUrl]);
            setPreviewImages(prev => [...prev, previewImage]);
          } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Eroare la încărcarea imaginii: ${file.name}`);
          }
        })();
        
        uploadPromises.push(uploadPromise);
      }
      
      await Promise.all(uploadPromises);
      
      // Show success toast and move to configure step
      toast.success('Calitate Verificată!', {
        description: 'Fotografiile au fost încărcate cu succes pe Cloudinary și sunt excelente pentru imprimare.',
        duration: 3000,
      });
      
      // Auto-transition to configure step after a short delay
      setTimeout(() => {
        setCurrentStep('configure');
        setCurrentImageIndex(0);
      }, 1000);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Eroare la încărcarea imaginilor');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviewImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleZoomIn = () => {
    setImageScale(prev => Math.min(3, prev + 0.1));
  };

  const handleZoomOut = () => {
    setImageScale(prev => Math.max(0.5, prev - 0.1));
  };

  const handleImageMouseDown = (e: React.MouseEvent) => {
    setIsDraggingImage(true);
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  };

  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (isDraggingImage) {
      setImagePosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleImageMouseUp = () => {
    setIsDraggingImage(false);
  };

  const handleImageTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDraggingImage(true);
    setDragStart({ x: touch.clientX - imagePosition.x, y: touch.clientY - imagePosition.y });
  };

  const handleImageTouchMove = (e: React.TouchEvent) => {
    if (isDraggingImage && e.touches[0]) {
      const touch = e.touches[0];
      setImagePosition({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    }
  };

  const handleImageTouchEnd = () => {
    setIsDraggingImage(false);
  };

  const getCurrentAspectRatio = () => {
    const sizeData = availableSizes.find(s => s.size === selectedSize);
    return sizeData?.aspectRatio || 0.75;
  };

  const getOrientedAspectRatio = () => {
    const baseRatio = getCurrentAspectRatio();
    return orientation === 'portrait' ? 1 / baseRatio : baseRatio;
  };

  useEffect(() => {
    if (currentStep === 'configure' && imageConfigs[currentImageIndex]) {
      const config = imageConfigs[currentImageIndex];
      setOrientation(config.orientation);
      setSelectedSize(config.selectedSize);
      setImageScale(config.imageScale);
      setImagePosition(config.imagePosition);
    } else if (currentStep === 'configure') {
      setOrientation('portrait');
      setSelectedSize('30×40 cm');
      setImageScale(1);
      setImagePosition({ x: 0, y: 0 });
    }
  }, [currentImageIndex, currentStep]);

  const generateCroppedImage = async (): Promise<string> => {
    if (!uploadedImages[currentImageIndex] || !cropFrameRef.current || !imageRef.current) return '';

    const frameRect = cropFrameRef.current.getBoundingClientRect();
    const cropWidth = frameRect.width;
    const cropHeight = frameRect.height;
    
    // Get the natural display size of the image (before transform)
    const imgDisplayWidth = imageRef.current.offsetWidth;
    const imgDisplayHeight = imageRef.current.offsetHeight;

    // Use the ORIGINAL high-quality image for cropping, not the preview
    return await cropImageFromFrame(
      uploadedImages[currentImageIndex], // Changed from previewImages to uploadedImages for max quality
      cropWidth,
      cropHeight,
      imagePosition,
      imageScale,
      imgDisplayWidth,
      imgDisplayHeight
    );
  };

  const handleContinueToConfigure = () => {
    if (uploadedImages.length > 0) {
      setCurrentStep('configure');
      setCurrentImageIndex(0);
    }
  };

  const handleSaveCurrentImage = async () => {
    // If this is the last image, we're adding to cart - show loading
    const isLastImage = currentImageIndex >= uploadedImages.length - 1;
    
    if (isLastImage) {
      setIsAddingToCart(true);
    }
    
    try {
      const croppedImage = await generateCroppedImage();
      
      const config: ImageConfig = {
        orientation,
        selectedSize,
        imageScale,
        imagePosition,
        croppedImage,
      };

      const newConfigs = [...imageConfigs];
      newConfigs[currentImageIndex] = config;
      setImageConfigs(newConfigs);

      if (currentImageIndex < uploadedImages.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
        // Scroll to top on mobile when moving to next image
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // All images configured - add to cart and go to cart page
        await handleAddToCart(newConfigs);
      }
    } catch (error) {
      console.error('❌ Error saving image:', error);
      setIsAddingToCart(false);
    }
  };

  const handleAddToCart = async (configs: ImageConfig[]) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Se încarcă imaginile...', {
        description: 'Salvăm fotografiile tale în siguranță'
      });

      // Upload all images to storage first
      const uploadPromises = configs.map(async (config, index) => {
        const { originalUrl, croppedUrl } = await uploadPersonalizedImages(
          uploadedImages[index],
          config.croppedImage,
          index
        );
        return { config, originalUrl, croppedUrl };
      });

      const uploadedData = await Promise.all(uploadPromises);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Add all configured canvases to cart with storage URLs
      uploadedData.forEach(({ config, originalUrl, croppedUrl }, index) => {
        const customization: PersonalizationData = {
          modelId: 'custom-canvas',
          modelTitle: 'Tablou Personalizat',
          uploadedImages: [], // Remove local base64 images
          croppedImage: '', // Remove local base64 preview
          originalImageUrl: originalUrl, // Use storage URL
          croppedImageUrl: croppedUrl, // Use storage URL
          selectedSize: config.selectedSize,
          price: availableSizes.find(size => size.size === config.selectedSize)?.price || 0,
          orientation: config.orientation,
        };

        addToCart(
          { id: `custom-${Date.now()}-${index}`, title: 'Tablou Personalizat', price: 0, image: croppedUrl, category: 'personalized' },
          1,
          config.selectedSize,
          undefined, // printType
          undefined, // frameType
          customization
        );
      });

      // Success toast
      toast.success('Succes!', {
        description: 'Tablourile personalizate au fost adăugate în coș'
      });

      // Redirect to cart page (not checkout) so users can review their cart
      navigate('/cart');
    } catch (error) {
      console.error('❌ Failed to upload images:', error);
      toast.error('Eroare la încărcarea imaginilor', {
        description: 'Te rugăm să încerci din nou'
      });
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const calculateTotalPrice = () => {
    return imageConfigs.reduce((total, config) => {
      const size = availableSizes.find(s => s.size === config.selectedSize);
      return total + (size?.price || 0);
    }, 0);
  };

  const getDeliveryPrice = () => {
    return checkoutData.deliveryMethod === 'express' ? 25 :
           checkoutData.deliveryMethod === 'standard' ? 15 : 10;
  };

  const handleCheckout = () => {
    // This function is called from the checkout step in the personalized flow
    // It adds items and navigates to checkout page
    imageConfigs.forEach((config, index) => {
      const customization: PersonalizationData = {
        modelId: 'custom-canvas',
        modelTitle: 'Tablou Personalizat',
        uploadedImages: [uploadedImages[index]],
        croppedImage: config.croppedImage,
        selectedSize: config.selectedSize,
        price: availableSizes.find(size => size.size === config.selectedSize)?.price || 0,
        orientation: config.orientation,
      };

      addToCart(
        { id: `custom-${Date.now()}-${index}`, title: 'Tablou Personalizat', price: 0, image: uploadedImages[index], category: 'personalized' },
        1,
        config.selectedSize,
        undefined, // printType
        undefined, // frameType
        customization
      );
    });

    // Navigate to checkout
    navigate('/checkout');
  };

  const resetFlow = () => {
    setCurrentStep('upload-photo');
    setUploadedImages([]);
    setPreviewImages([]);
    setImageConfigs([]);
    setCurrentImageIndex(0);
    clearCart();
  };

  const handleContinue = () => {
    clearCart();
    navigate('/');
  };

  // Finalize layout with gradient background
  if (currentStep === 'finalize') {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-[#6994FF]/10 to-[#6994FF]/5 rounded-2xl p-12">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-gray-900 mb-4">Comanda Ta a Fost Plasată!</h1>
            <p className="text-gray-600 mb-8">
              Mulțumim pentru comandă! Vei primi un email de confirmare în cel mai scurt timp.
            </p>
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Star className="w-5 h-5 text-[#6994FF] fill-[#6994FF]" />
              <span className="text-gray-900">4.9</span>
              <span className="text-gray-600">(1,264 recenzii)</span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-gray-900 mb-4">Detalii Comandă</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Număr Tablouri:</span>
                  <span className="text-gray-900">{imageConfigs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-gray-900">{calculateTotalPrice().toFixed(2)} lei</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Livrare:</span>
                  <span className="text-gray-900">
                    {checkoutData.deliveryMethod === 'express' && 'Express (1-4 ore)'}
                    {checkoutData.deliveryMethod === 'standard' && 'Standard (24-48 ore)'}
                    {checkoutData.deliveryMethod === 'economic' && 'Economic (3-4 zile)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Adresă:</span>
                  <span className="text-gray-900">{checkoutData.address}, {checkoutData.city}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleContinue}
              className="px-8 py-3 bg-[#6994FF] text-white rounded-lg hover:bg-[#5078E6] transition-colors"
            >
              Continuă
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl text-gray-900 mb-3 tracking-tight">Tablou Personalizat</h1>
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-gray-900">4.9</span>
              <span className="text-gray-600">(1,264 recenzii)</span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              {[
                { id: 'upload-photo', label: 'Încarcă' },
                { id: 'configure', label: 'Configurare' },
              ].map((step, index) => {
                const stepOrder: Step[] = ['upload-photo', 'configure'];
                const currentIndex = stepOrder.indexOf(currentStep);
                const stepIndex = stepOrder.indexOf(step.id as Step);
                const isActive = currentIndex === stepIndex;
                const isCompleted = currentIndex > stepIndex;

                return (
                  <React.Fragment key={step.id}>
                    <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all ${
                      isCompleted 
                        ? 'bg-[#6994FF]/20' 
                        : isActive 
                        ? 'bg-[#6994FF] shadow-lg shadow-[#6994FF]/30' 
                        : 'bg-gray-100'
                    }`}>
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                        isCompleted 
                          ? 'bg-[#6994FF] text-white' 
                          : isActive 
                          ? 'bg-white text-[#6994FF]' 
                          : 'bg-white text-gray-400'
                      }`}>
                        {isCompleted ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : index + 1}
                      </div>
                      <span className={`text-xs sm:text-sm transition-all whitespace-nowrap ${
                        isActive ? 'text-white font-medium' : isCompleted ? 'text-[#6994FF]' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {index < 1 && (
                      <div className={`h-0.5 w-4 sm:w-8 rounded-full transition-all ${
                        isCompleted ? 'bg-[#6994FF]' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentStep === 'upload-photo' && (
          <div>
            <h2 className="text-gray-900 mb-8 text-center">Pasul 1: Încarcă Fotografiile</h2>

            <div className="max-w-3xl mx-auto">
              {uploadedImages.length === 0 && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-4 border-dashed rounded-lg p-12 text-center transition-colors relative ${
                    isDragging ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
                  }`}
                >
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-lg z-10">
                      <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
                      <p className="text-gray-900 mb-1">Se încarcă fotografiile...</p>
                      <p className="text-sm text-gray-600">Verificăm calitatea imaginilor</p>
                    </div>
                  )}
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-gray-900 mb-2">Trage și Plasează Fotografiile</h3>
                  <p className="text-gray-600 mb-4">sau</p>
                  <label className="inline-block px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      disabled={isUploading}
                    />
                    Selectează Imaginea
                  </label>
                  <p className="text-sm text-gray-500 mt-4">
                    Format acceptat: JPG, PNG, HEIC. Mărime maximă: 20MB per fișier
                  </p>
                </div>
              )}

              {uploadedImages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900">
                      Fotografii Încărcate ({uploadedImages.length})
                    </h3>
                    <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                      + Adaugă Mai Multe
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                        <img src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                          <Check className="w-4 h-4" />
                        </div>
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 left-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                          title="Șterge fotografia"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-900 mb-1">Calitate Verificată</p>
                        <p className="text-sm text-green-700">
                          Fotografiile tale au fost verificate automat. Calitatea este excelentă pentru imprimare!
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleContinueToConfigure}
                    className="w-full px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Continuă la Configurare
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 'configure' && (
          <div>
            <div className="max-w-7xl mx-auto lg:max-w-4xl">
              {/* Mobile: Dimensions Only */}
              <div className="lg:hidden mb-4">
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                  <label className="block text-base text-gray-700 mb-3">Dimensiune</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  >
                    {availableSizes.map((size) => (
                      <option key={size.size} value={size.size}>
                        {size.size} - {size.price} lei
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Responsive layout: mobile stacked, desktop single column */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">
                {/* Cropper Card */}
                <div className="bg-white rounded-lg p-6 border-2 border-gray-200 lg:mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl text-gray-900">Ajustează Încadrarea</h3>
                    <button
                      onClick={() => {
                        setImageScale(1);
                        setImagePosition({ x: 0, y: 0 });
                      }}
                      className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Dimensions & Orientation Combined - Desktop */}
                  <div className="hidden lg:grid lg:grid-cols-2 gap-4 mb-6">
                    {/* Dimensions */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-3">Dimensiune</label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                      >
                        {availableSizes.map((size) => (
                          <option key={size.size} value={size.size}>
                            {size.size} - {size.price} lei
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Orientation */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-3">Orientare</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setOrientation('portrait')}
                          className={`px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                            orientation === 'portrait'
                              ? 'bg-yellow-500 text-white shadow-lg'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                          }`}
                        >
                          <div className={`w-4 h-6 border-2 rounded-sm ${orientation === 'portrait' ? 'border-white' : 'border-gray-400'}`} />
                          <span>Portrait</span>
                        </button>
                        <button
                          onClick={() => setOrientation('landscape')}
                          className={`px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                            orientation === 'landscape'
                              ? 'bg-yellow-500 text-white shadow-lg'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                          }`}
                        >
                          <div className={`w-6 h-4 border-2 rounded-sm ${orientation === 'landscape' ? 'border-white' : 'border-gray-400'}`} />
                          <span>Landscape</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Orientation Selection - Mobile Only */}
                  <div className="lg:hidden mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Orientare</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setOrientation('portrait')}
                        className={`px-4 py-2 rounded-lg transition-all text-sm flex items-center justify-center space-x-2 ${
                          orientation === 'portrait'
                            ? 'bg-yellow-500 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        <div className={`w-3 h-5 border-2 rounded-sm ${orientation === 'portrait' ? 'border-white' : 'border-gray-400'}`} />
                        <span>Portrait</span>
                      </button>
                      <button
                        onClick={() => setOrientation('landscape')}
                        className={`px-4 py-2 rounded-lg transition-all text-sm flex items-center justify-center space-x-2 ${
                          orientation === 'landscape'
                            ? 'bg-yellow-500 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-3 border-2 rounded-sm ${orientation === 'landscape' ? 'border-white' : 'border-gray-400'}`} />
                        <span>Landscape</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center bg-gray-800 rounded-lg p-6 lg:p-8 mb-4 lg:mb-6 overflow-hidden" style={{ minHeight: '400px', maxHeight: '500px' }}>
                    <div
                      ref={cropFrameRef}
                      className="relative touch-none"
                      style={{
                        width: '100%',
                        maxWidth: orientation === 'portrait' ? '320px' : '480px',
                        aspectRatio: `${1 / getOrientedAspectRatio()}`,
                      }}
                      onMouseMove={handleImageMouseMove}
                      onMouseUp={handleImageMouseUp}
                      onMouseLeave={handleImageMouseUp}
                      onTouchStart={handleImageTouchStart}
                      onTouchMove={handleImageTouchMove}
                      onTouchEnd={handleImageTouchEnd}
                    >
                      {previewImages[currentImageIndex] && (
                        <div 
                          className="absolute inset-0"
                          style={{
                            cursor: isDraggingImage ? 'grabbing' : 'grab',
                          }}
                        >
                          <img
                            ref={imageRef}
                            src={previewImages[currentImageIndex]}
                            alt="Canvas Image"
                            className="select-none absolute"
                            style={{
                              transform: `translate(calc(-50% + ${imagePosition.x}px), calc(-50% + ${imagePosition.y}px)) scale(${imageScale})`,
                              transformOrigin: 'center',
                              top: '50%',
                              left: '50%',
                              transition: isDraggingImage ? 'none' : 'transform 0.1s',
                            }}
                            onMouseDown={handleImageMouseDown}
                            draggable={false}
                          />
                        </div>
                      )}

                      <div className="absolute inset-0 border-4 border-[#6994FF] shadow-2xl rounded-sm pointer-events-none" />
                      
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white pointer-events-none" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white pointer-events-none" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white pointer-events-none" />
                    </div>
                  </div>

                  {/* Zoom Controls */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleZoomOut}
                        className="p-2.5 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <ZoomOut className="w-5 h-5 text-gray-700" />
                      </button>
                      
                      <input
                        type="range"
                        min="50"
                        max="300"
                        value={imageScale * 100}
                        onChange={(e) => setImageScale(parseInt(e.target.value) / 100)}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #6994FF 0%, #6994FF ${((imageScale * 100 - 50) / 250) * 100}%, #E5E7EB ${((imageScale * 100 - 50) / 250) * 100}%, #E5E7EB 100%)`
                        }}
                      />
                      
                      <button
                        onClick={handleZoomIn}
                        className="p-2.5 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <ZoomIn className="w-5 h-5 text-gray-700" />
                      </button>
                      
                      <span className="text-base text-gray-700 min-w-[60px] text-right">
                        {Math.round(imageScale * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Move className="w-4 h-4" />
                    <span>Trage imaginea • Zoom cu slider</span>
                  </div>
                </div>

                {/* Action Button - Desktop Only */}
                <div className="hidden lg:block bg-white rounded-lg p-6 border-2 border-gray-200">
                  <button
                    onClick={handleSaveCurrentImage}
                    disabled={isAddingToCart}
                    className="w-full px-6 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2 shadow-lg text-base disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isAddingToCart && currentImageIndex >= uploadedImages.length - 1 ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Se încarcă...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>
                          {currentImageIndex < uploadedImages.length - 1 
                            ? 'Salvează și Continuă' 
                            : 'Adaugă în Coș'}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Action Button - Mobile Only */}
                <div className="lg:hidden">
                  <button
                    onClick={handleSaveCurrentImage}
                    disabled={isAddingToCart}
                    className="w-full px-6 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2 shadow-lg text-base disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isAddingToCart && currentImageIndex >= uploadedImages.length - 1 ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Se încarcă...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>
                          {currentImageIndex < uploadedImages.length - 1 
                            ? 'Salvează și Continuă' 
                            : 'Adaugă în Coș'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'checkout' && (
          <div>
            <h2 className="text-gray-900 mb-8 text-center">Pasul 3: Finalizare Comandă</h2>

            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h3 className="text-gray-900 mb-4 flex items-center space-x-2">
                      <User className="w-5 h-5 text-yellow-600" />
                      <span>Informații Contact</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-700 mb-2">Nume Complet *</label>
                        <input
                          type="text"
                          value={checkoutData.fullName}
                          onChange={(e) => setCheckoutData({ ...checkoutData, fullName: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                          placeholder="Ion Popescu"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          value={checkoutData.email}
                          onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                          placeholder="ion@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Telefon *</label>
                        <input
                          type="tel"
                          value={checkoutData.phone}
                          onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                          placeholder="0752109002"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h3 className="text-gray-900 mb-4 flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-yellow-600" />
                      <span>Adresă de Livrare</span>
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Adresă *</label>
                        <input
                          type="text"
                          value={checkoutData.address}
                          onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                          placeholder="Str. Exemplu, Nr. 123"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Oraș *</label>
                          <input
                            type="text"
                            value={checkoutData.city}
                            onChange={(e) => setCheckoutData({ ...checkoutData, city: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                            placeholder="București"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Cod Poștal</label>
                          <input
                            type="text"
                            value={checkoutData.postalCode}
                            onChange={(e) => setCheckoutData({ ...checkoutData, postalCode: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                            placeholder="010101"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h3 className="text-gray-900 mb-4 flex items-center space-x-2">
                      <Package className="w-5 h-5 text-yellow-600" />
                      <span>Metodă de Livrare</span>
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="delivery"
                          value="express"
                          checked={checkoutData.deliveryMethod === 'express'}
                          onChange={(e) => setCheckoutData({ ...checkoutData, deliveryMethod: e.target.value as any })}
                          className="w-4 h-4 text-yellow-500"
                        />
                        <div className="flex-1">
                          <p className="text-gray-900">Express (1-4 ore)</p>
                          <p className="text-sm text-gray-600">București - 25 lei</p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="delivery"
                          value="standard"
                          checked={checkoutData.deliveryMethod === 'standard'}
                          onChange={(e) => setCheckoutData({ ...checkoutData, deliveryMethod: e.target.value as any })}
                          className="w-4 h-4 text-yellow-500"
                        />
                        <div className="flex-1">
                          <p className="text-gray-900">Standard (24-48 ore)</p>
                          <p className="text-sm text-gray-600">Toată țara - 15 lei</p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="delivery"
                          value="economic"
                          checked={checkoutData.deliveryMethod === 'economic'}
                          onChange={(e) => setCheckoutData({ ...checkoutData, deliveryMethod: e.target.value as any })}
                          className="w-4 h-4 text-yellow-500"
                        />
                        <div className="flex-1">
                          <p className="text-gray-900">Economic (3-4 zile)</p>
                          <p className="text-sm text-gray-600">Toată țara - 10 lei</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h3 className="text-gray-900 mb-4 flex items-center space-x-2">
                      <CreditCard className="w-5 h-5 text-yellow-600" />
                      <span>Metodă de Plată</span>
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={checkoutData.paymentMethod === 'card'}
                          onChange={(e) => setCheckoutData({ ...checkoutData, paymentMethod: e.target.value as any })}
                          className="w-4 h-4 text-yellow-500"
                        />
                        <div className="flex-1">
                          <p className="text-gray-900">Card Bancar</p>
                          <p className="text-sm text-gray-600">Plată online securizată</p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="payment"
                          value="cash"
                          checked={checkoutData.paymentMethod === 'cash'}
                          onChange={(e) => setCheckoutData({ ...checkoutData, paymentMethod: e.target.value as any })}
                          className="w-4 h-4 text-yellow-500"
                        />
                        <div className="flex-1">
                          <p className="text-gray-900">Ramburs</p>
                          <p className="text-sm text-gray-600">Plată la livrare</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6 sticky top-4">
                    <h3 className="text-gray-900 mb-4">Sumar Comandă</h3>
                    
                    <div className="space-y-3 mb-6">
                      {imageConfigs.map((config, index) => (
                        <div key={index} className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                          <img 
                            src={uploadedImages[index]} 
                            alt={`Canvas ${index + 1}`}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 text-sm">
                            <p className="text-gray-900">Tablou {index + 1}</p>
                            <p className="text-gray-600">{config.selectedSize}</p>
                          </div>
                          <p className="text-gray-900">
                            {(availableSizes.find(s => s.size === config.selectedSize)?.price || 0).toFixed(2)} lei
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">{calculateTotalPrice().toFixed(2)} lei</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Livrare:</span>
                        <span className="text-gray-900">
                          {checkoutData.deliveryMethod === 'express' && '25 lei'}
                          {checkoutData.deliveryMethod === 'standard' && '15 lei'}
                          {checkoutData.deliveryMethod === 'economic' && '10 lei'}
                        </span>
                      </div>
                      <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                        <span className="text-lg text-gray-900">Total:</span>
                        <span className="text-2xl text-[#6994FF]">
                          {(calculateTotalPrice() + 
                            (checkoutData.deliveryMethod === 'express' ? 25 : 
                             checkoutData.deliveryMethod === 'standard' ? 15 : 10)).toFixed(2)} lei
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={!checkoutData.fullName || !checkoutData.email || !checkoutData.phone || !checkoutData.address || !checkoutData.city}
                      className="w-full px-6 py-4 bg-[#86C2FF] text-white rounded-lg hover:bg-[#6BADEF] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-lg"
                    >
                      Plasează Comanda
                    </button>

                    <p className="text-xs text-gray-500 mt-4 text-center">
                      Vei primi automat un cont creat pe email-ul furnizat
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const cropImageFromFrame = async (
  imageUrl: string,
  cropWidth: number,
  cropHeight: number,
  imagePosition: { x: number; y: number },
  imageScale: number,
  imgDisplayWidth: number,
  imgDisplayHeight: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Get the actual dimensions of the loaded image
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      // DON'T use outputScale - just use original resolution!
      const canvas = document.createElement('canvas');
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, cropWidth, cropHeight);

      // The image displays at imgDisplayWidth x imgDisplayHeight (before transforms)
      // Then it's scaled by imageScale
      const scaledWidth = imgDisplayWidth * imageScale;
      const scaledHeight = imgDisplayHeight * imageScale;

      // Calculate position: image center is at (cropWidth/2, cropHeight/2) + imagePosition offset
      const imageCenterX = cropWidth / 2 + imagePosition.x;
      const imageCenterY = cropHeight / 2 + imagePosition.y;
      
      // Image top-left corner
      const imageLeft = imageCenterX - scaledWidth / 2;
      const imageTop = imageCenterY - scaledHeight / 2;

      // Calculate what part of the scaled image is visible in the crop frame
      const visibleLeft = Math.max(0, -imageLeft);
      const visibleTop = Math.max(0, -imageTop);
      const visibleRight = Math.min(scaledWidth, cropWidth - imageLeft);
      const visibleBottom = Math.min(scaledHeight, cropHeight - imageTop);

      // Map back to source image coordinates
      const srcLeft = (visibleLeft / scaledWidth) * imgWidth;
      const srcTop = (visibleTop / scaledHeight) * imgHeight;
      const srcWidth = ((visibleRight - visibleLeft) / scaledWidth) * imgWidth;
      const srcHeight = ((visibleBottom - visibleTop) / scaledHeight) * imgHeight;

      // Calculate destination in output canvas
      const destLeft = Math.max(0, imageLeft);
      const destTop = Math.max(0, imageTop);
      const destWidth = visibleRight - visibleLeft;
      const destHeight = visibleBottom - visibleTop;

      // Draw the cropped portion
      ctx.drawImage(
        img,
        srcLeft,
        srcTop,
        srcWidth,
        srcHeight,
        destLeft,
        destTop,
        destWidth,
        destHeight
      );

      // Export as base64 with maximum quality (1.0 = 100%)
      const croppedImage = canvas.toDataURL('image/jpeg', 1.0); // Changed from 0.95 to 1.0 for max quality
      resolve(croppedImage);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
  });
};