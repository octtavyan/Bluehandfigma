import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Heart, Sparkles } from 'lucide-react';
import { useHeroSlides } from '../hooks/useHeroSlides';
import { unsplashService, UnsplashImage } from '../services/unsplashService';

export const HomePage: React.FC = () => {
  // Use lightweight hook for immediate slider loading
  const { heroSlides, isLoading: isSlidesLoading } = useHeroSlides();
  
  const sortedSlides = React.useMemo(() => {
    return [...heroSlides].sort((a, b) => a.order - b.order);
  }, [heroSlides]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const [isLoadingUnsplash, setIsLoadingUnsplash] = useState(true);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Preload slider images as soon as they're available
  useEffect(() => {
    if (sortedSlides.length > 0 && !imagesPreloaded) {
      
      const preloadPromises = sortedSlides.map((slide) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.src = slide.backgroundImage;
          img.onload = () => {
            resolve(img);
          };
          img.onerror = () => {
            reject(new Error(`Failed to preload: ${slide.backgroundImage}`));
          };
        });
      });

      Promise.all(preloadPromises).then(() => {
        setImagesPreloaded(true);
      }).catch((error) => {
        console.error('Error preloading images:', error);
      });
    }
  }, [sortedSlides, imagesPreloaded]);

  // Auto-advance slides
  useEffect(() => {
    if (sortedSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sortedSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sortedSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sortedSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sortedSlides.length) % sortedSlides.length);
  };

  // Fetch Unsplash images for landing page showcase
  // Start loading immediately but don't block slider display
  useEffect(() => {
    // Small delay to let sliders render first
    const timeoutId = setTimeout(() => {
      fetchUnsplashImages();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const fetchUnsplashImages = async () => {
    try {
      setIsLoadingUnsplash(true);
      
      // Fetch Unsplash settings from Supabase
      const { unsplashSettingsService } = await import('../lib/supabaseDataService');
      const settings = await unsplashSettingsService.get();
      
      let curatedQueries = settings?.curatedQueries || ['nature', 'abstract', 'architecture', 'minimal', 'landscape'];
      
      // Shuffle queries to get variety
      const shuffledQueries = [...curatedQueries].sort(() => Math.random() - 0.5);
      
      let allImages: any[] = [];
      const targetImageCount = 8;
      
      // Fetch images from multiple keywords for variety (use up to 3 different keywords)
      const keywordsToUse = Math.min(3, shuffledQueries.length);
      const imagesPerKeyword = Math.ceil(targetImageCount / keywordsToUse);
      
      for (let i = 0; i < keywordsToUse; i++) {
        const query = shuffledQueries[i];
        
        try {
          const result = await unsplashService.searchPhotos(query, 1, imagesPerKeyword);
          
          // Add new unique images (avoid duplicates by ID)
          const existingIds = new Set(allImages.map(img => img.id));
          const newImages = result.results.filter(img => !existingIds.has(img.id));
          allImages = [...allImages, ...newImages];
        } catch (error) {
          console.error(`Error fetching images for query "${query}":`, error);
        }
        
        // Stop if we have enough images
        if (allImages.length >= targetImageCount) break;
      }
      
      // If we still don't have enough images, try fallback queries
      if (allImages.length < targetImageCount) {
        const fallbackQueries = ['art', 'wallpaper', 'design'];
        
        for (const fallbackQuery of fallbackQueries) {
          if (allImages.length >= targetImageCount) break;
          
          const imagesNeeded = targetImageCount - allImages.length;
          try {
            const result = await unsplashService.searchPhotos(fallbackQuery, 1, imagesNeeded);
            const existingIds = new Set(allImages.map(img => img.id));
            const newImages = result.results.filter(img => !existingIds.has(img.id));
            allImages = [...allImages, ...newImages];
          } catch (error) {
            console.error(`Error fetching fallback images for "${fallbackQuery}":`, error);
          }
        }
      }
      
      // Shuffle the final collection for variety and take only 8
      const shuffledImages = allImages.sort(() => Math.random() - 0.5).slice(0, targetImageCount);
      setUnsplashImages(shuffledImages);

      // Preload Unsplash images in the background (don't block UI)
      shuffledImages.forEach((image) => {
        const img = new window.Image();
        img.src = image.urls.small;
      });
    } catch (error) {
      console.error('Error loading Unsplash images:', error);
    } finally {
      setIsLoadingUnsplash(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Slider */}
      <section className="relative h-[500px] sm:h-[600px] lg:h-[780px] overflow-hidden">
        {sortedSlides.length === 0 ? (
          // Fallback hero when no slides are configured
          <div className="absolute inset-0 bg-gradient-to-br from-[#6994FF] to-[#5078E6]">
            <div className="relative h-full flex items-center justify-center">
              <div className="max-w-4xl mx-auto text-center px-6">
                <h1 className="text-white mb-8 drop-shadow-lg text-3xl sm:text-4xl lg:text-[3.2rem] leading-[1.3] font-bold">
                  Tablouri Canvas Personalizate
                </h1>
                <Link
                  to="/tablouri-canvas"
                  className="inline-block px-8 py-4 bg-white text-[#6994FF] rounded-lg hover:bg-gray-50 transition-colors shadow-lg text-lg"
                >
                  Vezi Galeria
                </Link>
              </div>
            </div>
          </div>
        ) : (
          sortedSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.imageUrls?.medium || slide.imageUrls?.thumbnail || slide.backgroundImage})` }}
              >
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
              
              {/* Content */}
              <div className="relative h-full flex items-center justify-center">
                <div className="max-w-4xl mx-auto text-center px-6">
                  <h1 className="text-white mb-8 drop-shadow-lg text-3xl sm:text-4xl lg:text-[3.2rem] leading-[1.3] font-bold">{slide.title}</h1>
                  <Link
                    to={slide.buttonLink}
                    className="inline-block px-8 py-4 bg-white text-[#6994FF] rounded-lg hover:bg-gray-50 transition-colors shadow-lg text-lg"
                  >
                    {slide.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Slider Controls - Only show if there are slides */}
        {sortedSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {sortedSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Features Section - Standardized for Mobile */}
      <section className="py-8 md:py-12 px-6 bg-gray-50">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#6994FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl text-gray-900 mb-2">Calitate Premium</h3>
              <p className="text-sm md:text-base text-gray-600">
                Printare de înaltă calitate pe canvas premium, rezistent în timp
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#6994FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl text-gray-900 mb-2">Personalizare Completă</h3>
              <p className="text-sm md:text-base text-gray-600">
                Alege dimensiunea, orientarea și încadrarea perfectă pentru tine
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#6994FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl text-gray-900 mb-2">Livrare Rapidă</h3>
              <p className="text-sm md:text-base text-gray-600">
                Produsele tale vor ajunge în siguranță în câteva zile
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner - Standardized for Mobile */}
      <section className="py-12 md:py-16 px-6 bg-gradient-to-br from-[#6994FF] to-[#5078E6]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl text-white mb-3 md:mb-4">Descopera colectia noastra completa de tablouri canvas existente!</h2>
          <Link
            to="/tablouri-canvas"
            className="inline-block px-8 py-4 bg-white text-[#6994FF] rounded-lg hover:bg-gray-50 transition-colors shadow-lg text-lg"
          >
            Vezi Galeria
          </Link>
        </div>
      </section>

      {/* Unsplash Showcase Section */}
      {unsplashImages.length > 0 && (
        <section className="py-16 px-6 bg-white">
          <div className="max-w-[1600px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-gray-900 mb-3">Sau Creează Propriul Tău Tablou</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Alege din mii de imagini de înaltă calitate și transformă-le în tablouri canvas personalizate
              </p>
            </div>

            {isLoadingUnsplash ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-[#6994FF] rounded-full"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {unsplashImages.map((image) => (
                    <Link
                      key={image.id}
                      to={`/produs/unsplash-${image.id}`}
                      onClick={() => {
                        sessionStorage.setItem(`unsplash-${image.id}`, JSON.stringify(image));
                      }}
                      className="group aspect-square bg-gray-100 rounded-lg overflow-hidden relative"
                    >
                      <img
                        src={image.urls.small}
                        alt={image.alt_description || 'Unsplash image'}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          <p className="text-xs line-clamp-2">
                            {image.alt_description || image.description || 'Imagine Unsplash'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="text-center">
                  <Link
                    to="/tablouri-canvas"
                    className="inline-block px-8 py-3 bg-[#7B93FF] text-white rounded-lg hover:bg-[#6A82EE] transition-colors text-base"
                  >
                    Explorează Mai Multe Imagini
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Info Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-[#6994FF] rounded-lg flex items-center justify-center text-white text-xl">
                1
              </div>
              <div>
                <h3 className="text-gray-900 mb-2">Materiale de Calitate</h3>
                <p className="text-gray-600">
                  Folosim doar cele mai bune materiale pentru a asigura durabilitatea și calitatea superioară a fiecărui tablou.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-[#6994FF] rounded-lg flex items-center justify-center text-white text-xl">
                2
              </div>
              <div>
                <h3 className="text-gray-900 mb-2">Personalizare Simplă</h3>
                <p className="text-gray-600">
                  Procesul nostru intuitiv îți permite să creezi tabloul perfect în doar câțiva pași simpli.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-[#6994FF] rounded-lg flex items-center justify-center text-white text-xl">
                3
              </div>
              <div>
                <h3 className="text-gray-900 mb-2">Suport Dedicat</h3>
                <p className="text-gray-600">
                  Echipa noastră este mereu aici pentru a te ajuta cu orice întrebare sau cerință specială.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};