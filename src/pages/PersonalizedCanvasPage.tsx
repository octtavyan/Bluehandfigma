import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Upload, X, ShoppingCart, Check, ZoomIn, ZoomOut, Move, Loader2, Star, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSizes } from '../hooks/useSizes';
import { PersonalizationData } from '../types';
import { toast } from 'sonner@2.0.3';
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
  const { addToCart } = useCart();
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
  
  // State for configuration tooltip - show every time user reaches step 2
  const [showConfigTooltip, setShowConfigTooltip] = useState(true);
  
  const { sizeOptions: managedSizes } = useSizes();
  
  const availableSizes = managedSizes.map(size => ({
    size: `${size.width}×${size.height} cm`,
    price: size.finalPrice,
    aspectRatio: size.width / size.height,
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
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageUrl;
    });
  };

  const createOptimizedOriginal = (imageUrl: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 4096;
        let width = img.width;
        let height = img.height;

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
        
        let quality = 0.92;
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            
            const sizeMB = blob.size / (1024 * 1024);
            
            if (sizeMB < 10) {
              resolve(blob);
            } else if (quality > 0.5) {
              quality -= 0.1;
              tryCompress();
            } else {
              reject(new Error('Image too large even after compression'));
            }
          }, 'image/jpeg', quality);
        };
        
        tryCompress();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    setIsUploading(true);
    
    try {
      const isConfigured = await cloudinaryService.isConfigured();
      
      if (!isConfigured) {
        toast.error('Cloudinary nu este configurat. Contactează administratorul.');
        setIsUploading(false);
        return;
      }

      const uploadPromises: Promise<void>[] = [];
      const errors: string[] = [];
      let successCount = 0;
      
      for (const file of Array.from(files)) {
        const uploadPromise = (async () => {
          try {
            const reader = new FileReader();
            const dataUrlPromise = new Promise<string>((resolve) => {
              reader.onload = (e) => {
                if (e.target?.result) {
                  resolve(e.target.result as string);
                }
              };
              reader.readAsDataURL(file);
            });
            
            const dataUrl = await dataUrlPromise;
            const optimizedBlob = await createOptimizedOriginal(dataUrl);
            const optimizedFile = new File([optimizedBlob], file.name, { type: 'image/jpeg' });
            const cloudinaryUrl = await cloudinaryService.uploadImage(optimizedFile, 'personalized-orders');
            const previewImage = await createPreviewImage(dataUrl);
            
            setUploadedImages(prev => [...prev, cloudinaryUrl]);
            setPreviewImages(prev => [...prev, previewImage]);
            successCount++;
          } catch (error) {
            console.error('Upload error:', error);
            errors.push(file.name);
          }
        })();
        
        uploadPromises.push(uploadPromise);
      }
      
      await Promise.all(uploadPromises);
      
      // Show combined toast message
      if (errors.length > 0 && successCount > 0) {
        toast.warning('Încărcare Parțială', {
          description: `${successCount} ${successCount === 1 ? 'fotografie încărcată' : 'fotografii încărcate'} cu succes. ${errors.length} ${errors.length === 1 ? 'eșuată' : 'eșuate'}: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`,
          duration: 4000,
        });
      } else if (errors.length > 0) {
        toast.error('Eroare la Încărcare', {
          description: `Fotografii eșuate: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? ` și încă ${errors.length - 3}` : ''}`,
          duration: 4000,
        });
      } else {
        toast.success('Calitate Verificată!', {
          description: `${successCount} ${successCount === 1 ? 'fotografie încărcată' : 'fotografii încărcate'} cu succes pe Cloudinary.`,
          duration: 3000,
        });
      }
      
      if (successCount > 0) {
        setTimeout(() => {
          setCurrentStep('configure');
          setCurrentImageIndex(0);
        }, 1000);
      }
      
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
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        const canvas = document.createElement('canvas');
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, cropWidth, cropHeight);

        const scaleX = imgWidth / imgDisplayWidth;
        const scaleY = imgHeight / imgDisplayHeight;

        const sourceWidth = cropWidth * scaleX / imageScale;
        const sourceHeight = cropHeight * scaleY / imageScale;

        const sourceX = (imgWidth - sourceWidth) / 2 - (imagePosition.x * scaleX / imageScale);
        const sourceY = (imgHeight - sourceHeight) / 2 - (imagePosition.y * scaleY / imageScale);

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    });
  };

  const generateCroppedImage = async (): Promise<string> => {
    if (!uploadedImages[currentImageIndex] || !cropFrameRef.current || !imageRef.current) return '';

    const frameRect = cropFrameRef.current.getBoundingClientRect();
    const cropWidth = frameRect.width;
    const cropHeight = frameRect.height;
    
    const imgDisplayWidth = imageRef.current.offsetWidth;
    const imgDisplayHeight = imageRef.current.offsetHeight;

    return await cropImageFromFrame(
      uploadedImages[currentImageIndex],
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        await handleAddToCart(newConfigs);
      }
    } catch (error) {
      console.error('Error saving image:', error);
      setIsAddingToCart(false);
    }
  };

  const handleAddToCart = async (configs: ImageConfig[]) => {
    try {
      setIsAddingToCart(true);

      const loadingToast = toast.loading('Se procesează imaginile...', {
        description: 'Pregătim tablourile personalizate'
      });

      const uploadPromises = configs.map(async (config, index) => {
        try {
          const response = await fetch(config.croppedImage);
          const blob = await response.blob();
          
          const file = new File([blob], `cropped-image-${index}.jpg`, { type: 'image/jpeg' });
          const croppedUrl = await cloudinaryService.uploadImage(file, 'personalized-orders');
          
          return { 
            config, 
            originalUrl: uploadedImages[index],
            croppedUrl
          };
        } catch (error) {
          console.error(`Error uploading cropped image ${index}:`, error);
          throw error;
        }
      });

      const uploadedData = await Promise.all(uploadPromises);
      toast.dismiss(loadingToast);

      uploadedData.forEach(({ config, originalUrl, croppedUrl }, index) => {
        const customization: PersonalizationData = {
          modelId: 'custom-canvas',
          modelTitle: 'Tablou Personalizat',
          uploadedImages: [],
          croppedImage: '',
          originalImageUrl: originalUrl,
          croppedImageUrl: croppedUrl,
          selectedSize: config.selectedSize,
          price: availableSizes.find(size => size.size === config.selectedSize)?.price || 0,
          orientation: config.orientation,
        };

        addToCart(
          { id: `custom-${Date.now()}-${index}`, title: 'Tablou Personalizat', price: 0, image: croppedUrl, category: 'personalized' },
          1,
          config.selectedSize,
          undefined,
          undefined,
          customization,
          true // silent mode - don't show individual toasts
        );
      });

      toast.success('Succes!', {
        description: `${uploadedData.length} ${uploadedData.length === 1 ? 'tablou personalizat adăugat' : 'tablouri personalizate adăugate'} în coș`
      });

      setIsAddingToCart(false);
      navigate('/cart');
    } catch (error) {
      console.error('Failed to process images:', error);
      toast.error('Eroare la procesarea imaginilor', {
        description: 'Te rugăm să încerci din nou'
      });
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content with Sidebar */}
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Vertical Steps Sidebar - Desktop */}
          <div className="hidden lg:block w-64 border-r border-gray-200 bg-white min-h-[calc(100vh-120px)] p-6">
            <div className="sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-8">Tablou Personalizat</h2>
              <div className="space-y-2">
                {[
                  { id: 'upload-photo', label: 'Încarcă Fotografiile', number: 1 },
                  { id: 'configure', label: 'Configurare', number: 2 },
                ].map((step) => {
                  const stepOrder: Step[] = ['upload-photo', 'configure'];
                  const currentIndex = stepOrder.indexOf(currentStep);
                  const stepIndex = stepOrder.indexOf(step.id as Step);
                  const isActive = currentIndex === stepIndex;
                  const isCompleted = currentIndex > stepIndex;

                  return (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 py-3"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isActive
                            ? 'bg-[#6994FF] text-white'
                            : isCompleted
                            ? 'bg-[#6994FF] text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {step.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm transition-all ${
                            isActive || isCompleted ? 'text-gray-900 font-medium' : 'text-gray-500'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Steps - Horizontal */}
          <div className="lg:hidden border-b border-gray-200 bg-gray-50 px-4 py-4">
            <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
              {[
                { id: 'upload-photo', label: 'Încarcă Foto', number: 1 },
                { id: 'configure', label: 'Configurare', number: 2 },
              ].map((step, index) => {
                const stepOrder: Step[] = ['upload-photo', 'configure'];
                const currentIndex = stepOrder.indexOf(currentStep);
                const stepIndex = stepOrder.indexOf(step.id as Step);
                const isActive = currentIndex === stepIndex;
                const isCompleted = currentIndex > stepIndex;

                return (
                  <React.Fragment key={step.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isActive
                            ? 'bg-[#6994FF] text-white'
                            : isCompleted
                            ? 'bg-[#6994FF] text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {step.number}
                      </div>
                      <p
                        className={`text-sm transition-all whitespace-nowrap ${
                          isActive || isCompleted ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                    {index < 1 && (
                      <div
                        className={`h-0.5 w-8 rounded-full transition-all ${
                          isCompleted ? 'bg-[#6994FF]' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            {currentStep === 'upload-photo' && (
              <div>
                <div className="max-w-4xl">
                  {uploadedImages.length === 0 && (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-4 border-dashed rounded-lg p-16 sm:p-20 text-center transition-colors relative ${
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
                      <Upload className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                      <h3 className="text-2xl text-gray-900 mb-3 hidden sm:block">Trage aici Fotografia</h3>
                      <p className="text-lg text-gray-600 mb-6 hidden sm:block">sau</p>
                      <label className="inline-block px-8 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer text-lg font-medium">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                          disabled={isUploading}
                        />
                        Încarcă o Imagine
                      </label>
                      <p className="text-base text-gray-500 mt-6">
                        Format acceptat: JPG, PNG, HEIC. Mărime maximă: 10MB per fișier
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
              <div className="-mx-4 sm:-mx-6 lg:-mx-8">
                {/* Cropper Card */}
                <div className="mb-4">
                  <div className="relative flex flex-col items-center justify-start bg-gray-800 overflow-hidden" style={{ minHeight: window.innerWidth < 640 ? '350px' : '500px' }}>
                    {/* Top Controls Row */}
                    <div className="w-full flex items-start justify-between px-4 pt-4 pb-4 z-10">
                      {/* Left: Size & Orientation */}
                      <div className="space-y-2.5 relative">
                        {/* Size Dropdown */}
                        <select
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-600/50 border border-gray-500/30 rounded-md text-sm font-medium text-white/90 backdrop-blur-sm hover:bg-gray-600/70 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6994FF]/50"
                        >
                          {availableSizes.map((size) => (
                            <option key={size.size} value={size.size} className="bg-gray-700 text-white">
                              {size.size} - {size.price} lei
                            </option>
                          ))}
                        </select>

                        {/* Orientation Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setOrientation('portrait')}
                            className={`flex-1 p-2.5 rounded-md transition-all flex items-center justify-center ${
                              orientation === 'portrait'
                                ? 'bg-[#6994FF] text-white'
                                : 'text-white/60 hover:bg-gray-600/50 bg-gray-600/30 border border-gray-500/30'
                            }`}
                            title="Portrait"
                          >
                            <div className={`w-4 h-6 border-2 rounded-sm ${orientation === 'portrait' ? 'border-white' : 'border-current'}`} />
                          </button>
                          <button
                            onClick={() => setOrientation('landscape')}
                            className={`flex-1 p-2.5 rounded-md transition-all flex items-center justify-center ${
                              orientation === 'landscape'
                                ? 'bg-[#6994FF] text-white'
                                : 'text-white/60 hover:bg-gray-600/50 bg-gray-600/30 border border-gray-500/30'
                            }`}
                            title="Landscape"
                          >
                            <div className={`w-6 h-4 border-2 rounded-sm ${orientation === 'landscape' ? 'border-white' : 'border-current'}`} />
                          </button>
                        </div>

                        {/* Configuration Tooltip - Below Controls */}
                        {showConfigTooltip && (
                          <>
                            {/* Invisible Overlay - Click to Close */}
                            <div 
                              className="fixed inset-0 z-10"
                              onClick={() => setShowConfigTooltip(false)}
                            />
                            
                            <div className="absolute top-full left-0 mt-2 w-[320px] max-w-[90vw] z-20">
                              {/* Arrow pointing up */}
                              <div className="absolute -top-2 left-6 w-4 h-4 bg-green-100 border-l border-t border-green-300 transform rotate-45"></div>
                              
                              {/* Tooltip Content */}
                              <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 shadow-xl">
                                <div className="flex items-start gap-2">
                                  <Info className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-semibold text-green-900 mb-1">Ghid de Configurare</h4>
                                    <p className="text-xs text-green-800 leading-relaxed">
                                      Pentru a continua, te rugăm să <strong>selectezi dimensiunea</strong> din lista de mai sus și să <strong>alegi orientarea</strong> (portret sau landscape) pentru tabloul tău personalizat.
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setShowConfigTooltip(false)}
                                    className="flex-shrink-0 p-0.5 hover:bg-green-200 rounded transition-colors"
                                    aria-label="Închide"
                                  >
                                    <X className="w-4 h-4 text-green-700" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Right: Zoom Controls */}
                      <div>
                        <div className="flex gap-1.5 mb-2">
                          <button
                            onClick={handleZoomOut}
                            className="p-2.5 rounded-md hover:bg-gray-600/50 transition-colors text-white/70 hover:text-white bg-gray-600/30"
                            title="Zoom Out"
                          >
                            <ZoomOut className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={handleZoomIn}
                            className="p-2.5 rounded-md hover:bg-gray-600/50 transition-colors text-white/70 hover:text-white bg-gray-600/30"
                            title="Zoom In"
                          >
                            <ZoomIn className="w-5 h-5" />
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            setImageScale(1);
                            setImagePosition({ x: 0, y: 0 });
                          }}
                          className="w-full text-xs text-white/60 hover:text-white transition-colors"
                          title="Reset"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Crop Area - Below Controls, Centered with Padding */}
                    <div className="w-full flex items-center justify-center flex-1 px-4 pb-4">
                      <div
                        ref={cropFrameRef}
                        className="relative touch-none w-full"
                        style={{
                          maxWidth: window.innerWidth < 640 
                            ? (orientation === 'portrait' ? '280px' : '420px')
                            : (orientation === 'portrait' ? '400px' : '600px'),
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
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-3 px-4 sm:px-6 lg:px-8">
                    <Move className="w-4 h-4" />
                    <span>Trage imaginea pentru a ajusta poziția</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-4 sm:px-6 lg:px-8">
                  <button
                    onClick={handleSaveCurrentImage}
                    disabled={isAddingToCart}
                    className="w-full px-6 py-4 bg-[#6994FF] text-white rounded-lg hover:bg-[#5578DD] transition-colors flex items-center justify-center space-x-2 shadow-lg text-base disabled:opacity-70 disabled:cursor-not-allowed"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};