import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { unsplashService, UnsplashImage } from '../services/unsplashService';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { imagePreloader } from '../services/imagePreloader';

export const TablouriCanvasPage: React.FC = () => {
  const { categories, subcategories, paintings } = useAdmin();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedOrientation, setSelectedOrientation] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Unsplash integration
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const [isLoadingUnsplash, setIsLoadingUnsplash] = useState(false);
  const [showUnsplashResults, setShowUnsplashResults] = useState(false);
  const [unsplashError, setUnsplashError] = useState<string | null>(null);
  const [unsplashPage, setUnsplashPage] = useState(1);
  const [hasMoreUnsplash, setHasMoreUnsplash] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Random curated images for main section
  const [randomUnsplashImages, setRandomUnsplashImages] = useState<UnsplashImage[]>([]);
  const [isLoadingRandom, setIsLoadingRandom] = useState(true);

  // Check if we have a saved search state (when returning from product detail)
  useEffect(() => {
    const savedSearchState = sessionStorage.getItem('unsplash-search-state');
    if (savedSearchState) {
      try {
        const { query, showResults } = JSON.parse(savedSearchState);
        setUnsplashQuery(query);
        if (showResults && query) {
          // Restore search results
          searchUnsplash(query);
        }
        // Clear the state after restoring
        sessionStorage.removeItem('unsplash-search-state');
      } catch (error) {
        console.error('Error restoring search state:', error);
      }
    }
  }, []);

  // Load random curated images on mount based on admin settings
  useEffect(() => {
    loadRandomCuratedImages();
  }, []);

  const loadRandomCuratedImages = async () => {
    try {
      setIsLoadingRandom(true);
      
      // Try to use preloaded images first
      const preloadedImages = await imagePreloader.getPreloadedImages();
      
      if (preloadedImages && preloadedImages.length > 0) {
        // Use preloaded images - instant display!
        setRandomUnsplashImages(preloadedImages);
        setIsLoadingRandom(false);
        return;
      }
      
      // Fallback: If preload failed, fetch normally
      const settingsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/unsplash/settings`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      let curatedQueries = ['nature', 'abstract', 'architecture', 'minimal', 'landscape'];
      let imageCount = 24;
      
      if (settingsResponse.ok) {
        const data = await settingsResponse.json();
        if (data.settings) {
          curatedQueries = data.settings.curatedQueries || curatedQueries;
          imageCount = data.settings.randomImageCount || imageCount;
        }
      }
      
      // Shuffle queries to get variety
      const shuffledQueries = [...curatedQueries].sort(() => Math.random() - 0.5);
      
      let allImages: any[] = [];
      let queryIndex = 0;
      
      // Keep fetching from different queries until we have enough images
      while (allImages.length < imageCount && queryIndex < shuffledQueries.length) {
        const query = shuffledQueries[queryIndex];
        const imagesNeeded = imageCount - allImages.length;
        
        try {
          const result = await unsplashService.searchPhotos(query, 1, imagesNeeded);
          
          // Add new unique images (avoid duplicates by ID)
          const existingIds = new Set(allImages.map(img => img.id));
          const newImages = result.results.filter(img => !existingIds.has(img.id));
          allImages = [...allImages, ...newImages];
        } catch (error) {
          console.error(`Error fetching images for query "${query}":`, error);
        }
        
        queryIndex++;
      }
      
      // If we still don't have enough images after trying all queries, try generic fallbacks
      if (allImages.length < imageCount) {
        const fallbackQueries = ['art', 'wallpaper', 'design', 'color', 'pattern'];
        
        for (const fallbackQuery of fallbackQueries) {
          if (allImages.length >= imageCount) break;
          
          const imagesNeeded = imageCount - allImages.length;
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
      
      // Shuffle the final collection for variety
      const shuffledImages = allImages.sort(() => Math.random() - 0.5);
      setRandomUnsplashImages(shuffledImages);
    } catch (error) {
      console.error('Error loading random curated images:', error);
      // Silent fail - not critical
    } finally {
      setIsLoadingRandom(false);
    }
  };

  const loadCuratedImages = async () => {
    try {
      setIsLoadingUnsplash(true);
      setUnsplashError(null);
      const images = await unsplashService.getCuratedPhotos(1, 20);
      setUnsplashImages(images);
    } catch (error) {
      console.error('Error loading curated Unsplash images:', error);
      setUnsplashError('Eroare la încărcarea imaginilor Unsplash. Vă rugăm încercați din nou mai târziu.');
    } finally {
      setIsLoadingUnsplash(false);
    }
  };

  const searchUnsplash = async (query: string) => {
    if (!query.trim()) {
      loadCuratedImages();
      setShowUnsplashResults(true);
      setUnsplashPage(1);
      setHasMoreUnsplash(true);
      return;
    }

    try {
      setIsLoadingUnsplash(true);
      setUnsplashError(null);
      const result = await unsplashService.searchPhotos(query, 1, 20);
      setUnsplashImages(result.results);
      setShowUnsplashResults(true);
      setUnsplashPage(1);
      setHasMoreUnsplash(result.total_pages > 1);
    } catch (error) {
      console.error('Error searching Unsplash:', error);
      setUnsplashError('Eroare la căutarea imaginilor. Vă rugăm încercați din nou mai târziu.');
    } finally {
      setIsLoadingUnsplash(false);
    }
  };

  const handleUnsplashSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUnsplash(unsplashQuery);
    
    // Track the search
    if (unsplashQuery.trim()) {
      trackUnsplashSearch(unsplashQuery.trim());
    }
  };
  
  const trackUnsplashSearch = async (query: string) => {
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/unsplash/track-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ query })
      });
    } catch (error) {
      // Silent fail - tracking is not critical
      console.log('Search tracking failed (non-critical):', error);
    }
  };

  const loadMoreUnsplash = async () => {
    if (!hasMoreUnsplash || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      
      const nextPage = unsplashPage + 1;
      
      // Load more based on whether we're searching or viewing curated
      let newImages: UnsplashImage[] = [];
      let hasMore = false;
      
      if (unsplashQuery.trim()) {
        // Searching
        const result = await unsplashService.searchPhotos(unsplashQuery, nextPage, 20);
        newImages = result.results;
        hasMore = result.total_pages > nextPage;
      } else {
        // Curated photos
        newImages = await unsplashService.getCuratedPhotos(nextPage, 20);
        hasMore = newImages.length === 20; // Assume more if we got a full page
      }
      
      // Deduplicate images by ID
      setUnsplashImages((prev) => {
        const existingIds = new Set(prev.map(img => img.id));
        const uniqueNewImages = newImages.filter(img => !existingIds.has(img.id));
        return [...prev, ...uniqueNewImages];
      });
      
      setUnsplashPage(nextPage);
      setHasMoreUnsplash(hasMore);
    } catch (error) {
      console.error('Error loading more Unsplash images:', error);
      setUnsplashError('Eroare la încărcarea imaginilor suplimentare. Vă rugăm încercați din nou mai târziu.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Filter paintings
  let filteredPaintings = paintings.filter(p => p.isActive);
  
  if (selectedCategory !== 'all') {
    filteredPaintings = filteredPaintings.filter(p => p.category === selectedCategory);
  }
  
  if (selectedStyle !== 'all') {
    filteredPaintings = filteredPaintings.filter(p => p.subcategory === selectedStyle);
  }

  if (selectedOrientation !== 'all') {
    filteredPaintings = filteredPaintings.filter(p => p.orientation === selectedOrientation);
  }

  if (selectedColor !== 'all') {
    filteredPaintings = filteredPaintings.filter(p => {
      if (!p.dominantColor) return false;
      // Case-insensitive comparison and trim whitespace
      return p.dominantColor.trim().toLowerCase() === selectedColor.trim().toLowerCase();
    });
  }

  // Sort paintings
  const sortedPaintings = [...filteredPaintings].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        // Featured: bestsellers first, then by creation date
        if (a.isBestseller && !b.isBestseller) return -1;
        if (!a.isBestseller && b.isBestseller) return 1;
        return 0;
    }
  });
  
  // Check if any filters are active
  const hasActiveFilters = selectedCategory !== 'all' || selectedStyle !== 'all' || selectedOrientation !== 'all' || selectedColor !== 'all';
  
  // Filter Unsplash images based on current filters
  const filteredRandomUnsplashImages = hasActiveFilters 
    ? unsplashService.filterImages(randomUnsplashImages, {
        category: selectedCategory,
        style: selectedStyle,
        orientation: selectedOrientation,
        color: selectedColor
      })
    : randomUnsplashImages;
  
  const filteredSearchUnsplashImages = hasActiveFilters
    ? unsplashService.filterImages(unsplashImages, {
        category: selectedCategory,
        style: selectedStyle,
        orientation: selectedOrientation,
        color: selectedColor
      })
    : unsplashImages;
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Equal padding top and bottom */}
      <section className="py-6 md:py-12 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <h1 className="text-2xl md:text-3xl text-gray-900">Tablouri Canvas</h1>
        </div>
      </section>

      {/* Main Content - Grid Layout with Filters - Standardized */}
      <section className="py-0 md:py-8">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex gap-8 items-start">
            {/* Filter Panel - Desktop Only */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Sort Dropdown */}
                <div className="mb-6">
                  <label className="block text-gray-900 mb-3">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#86C2FF]/20"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name">Name: A-Z</option>
                  </select>
                </div>

                {/* Clear Filters Button - Only show when filters are active */}
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedStyle('all');
                      setSelectedOrientation('all');
                      setSelectedColor('all');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full px-4 py-2.5 bg-[#7B93FF] text-white rounded-lg hover:bg-[#6A82EE] transition-colors text-sm font-medium shadow-sm"
                  >
                    Clear All Filters
                  </button>
                )}

                <div className="h-px bg-gray-200 mb-6"></div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="text-gray-900 mb-3">Category</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === 'all'}
                        onChange={() => setSelectedCategory('all')}
                        className="w-4 h-4 text-[#86C2FF] focus:ring-[#86C2FF]"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">All Categories</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat.name}
                          onChange={() => setSelectedCategory(cat.name)}
                          className="w-4 h-4 text-[#86C2FF] focus:ring-[#86C2FF]"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-200 mb-6"></div>

                {/* Stil Filter */}
                <div className="mb-6">
                  <h3 className="text-gray-900 mb-3">Stil</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="style"
                        checked={selectedStyle === 'all'}
                        onChange={() => setSelectedStyle('all')}
                        className="w-4 h-4 text-[#86C2FF] focus:ring-[#86C2FF]"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">Toate Stilurile</span>
                    </label>
                    {subcategories.map((sub) => (
                      <label key={sub.id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="style"
                          checked={selectedStyle === sub.name}
                          onChange={() => setSelectedStyle(sub.name)}
                          className="w-4 h-4 text-[#86C2FF] focus:ring-[#86C2FF]"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{sub.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-200 mb-6"></div>

                {/* Orientation Filter */}
                <div className="mb-6">
                  <h3 className="text-gray-900 mb-3">Orientation</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="orientation"
                        checked={selectedOrientation === 'all'}
                        onChange={() => setSelectedOrientation('all')}
                        className="w-4 h-4 text-[#86C2FF] focus:ring-[#86C2FF]"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">All Orientations</span>
                    </label>
                    {['portrait', 'landscape', 'square'].map((orientation) => (
                      <label key={orientation} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="orientation"
                          checked={selectedOrientation === orientation}
                          onChange={() => setSelectedOrientation(orientation)}
                          className="w-4 h-4 text-[#86C2FF] focus:ring-[#86C2FF]"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 capitalize">{orientation}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-200 mb-6"></div>

                {/* Color Filter */}
                <div className="mb-6">
                  <h3 className="text-gray-900 mb-3">Color</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="color"
                        checked={selectedColor === 'all'}
                        onChange={() => setSelectedColor('all')}
                        className="w-4 h-4 text-[#86C2FF] focus:ring-[#86C2FF]"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">All Colors</span>
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        { name: 'Roșu', color: '#EF4444' },
                        { name: 'Portocaliu', color: '#F97316' },
                        { name: 'Galben', color: '#EAB308' },
                        { name: 'Verde', color: '#22C55E' },
                        { name: 'Albastru', color: '#3B82F6' },
                        { name: 'Mov', color: '#A855F7' },
                        { name: 'Roz', color: '#EC4899' },
                        { name: 'Maro', color: '#92400E' },
                        { name: 'Negru', color: '#000000' },
                        { name: 'Alb', color: '#FFFFFF' },
                        { name: 'Gri', color: '#6B7280' },
                        { name: 'Bej', color: '#D4C5B9' },
                      ].map((colorItem) => (
                        <button
                          key={colorItem.name}
                          onClick={() => setSelectedColor(colorItem.name)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            selectedColor === colorItem.name
                              ? 'border-[#86C2FF] ring-2 ring-[#86C2FF] ring-offset-2'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: colorItem.color }}
                          title={colorItem.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-200 mb-6"></div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedStyle('all');
                    setSelectedOrientation('all');
                    setSelectedColor('all');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs"
                >
                  Clear Filters
                </button>
              </div>
            </aside>

            {/* Paintings Grid - Right Side */}
            <div className="flex-1">
              {/* Unsplash Search Bar + Filter - Compact Mobile Design */}
              <div className="mb-6 md:mb-8 bg-gradient-to-r from-gray-50 to-gray-100 p-4 md:p-6 rounded-lg border border-gray-200">
                {/* Mobile: Show items count + Filter button row */}
                <div className="lg:hidden flex items-center justify-between mb-3">
                  <p className="text-gray-600 text-sm">
                    {sortedPaintings.length} {sortedPaintings.length === 1 ? 'tablou găsit' : 'tablouri găsite'}
                  </p>
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filtre</span>
                  </button>
                </div>
                
                <h2 className="text-xl md:text-2xl text-gray-900 mb-3 md:mb-4">Caută Imagini</h2>
                <form onSubmit={handleUnsplashSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={unsplashQuery}
                    onChange={(e) => setUnsplashQuery(e.target.value)}
                    placeholder="Peisaje, abstract, natura"
                    className="flex-1 px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86C2FF] text-sm md:text-base"
                  />
                  {showUnsplashResults && unsplashQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUnsplashResults(false);
                        setUnsplashQuery('');
                        setUnsplashImages([]);
                        setUnsplashPage(1);
                      }}
                      className="px-4 md:px-6 py-2 md:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Șterge</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-4 md:px-6 py-2 md:py-3 bg-[#7B93FF] text-white rounded-lg hover:bg-[#6A82EE] transition-colors flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      <span className="hidden sm:inline">Caută</span>
                    </button>
                  )}
                </form>
              </div>

              {/* Unsplash Results Section */}
              {showUnsplashResults && (
                <div className="mb-8 md:mb-12">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl text-gray-900">
                      {unsplashQuery ? `Rezultate pentru "${unsplashQuery}"` : 'Imagini Populare'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowUnsplashResults(false);
                        setUnsplashQuery('');
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Ascunde
                    </button>
                  </div>
                  
                  {isLoadingUnsplash ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-[#86C2FF] rounded-full"></div>
                    </div>
                  ) : unsplashError ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">{unsplashError}</p>
                    </div>
                  ) : filteredSearchUnsplashImages.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">Nu au fost găsite imagini pentru această căutare</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
                      {filteredSearchUnsplashImages.map((image) => (
                        <Link 
                          key={image.id} 
                          to={`/produs/unsplash-${image.id}`}
                          onClick={() => {
                            // Store the Unsplash image data in sessionStorage for detail page
                            sessionStorage.setItem(`unsplash-${image.id}`, JSON.stringify(image));
                            // Store search state so we can return to search results
                            sessionStorage.setItem('unsplash-search-state', JSON.stringify({
                              query: unsplashQuery,
                              showResults: true
                            }));
                          }}
                          className="group"
                        >
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                            <img
                              src={image.urls.small}
                              alt={image.alt_description || 'Unsplash image'}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          
                          <h3 className="text-gray-900 group-hover:text-[#86C2FF] transition-colors line-clamp-2 mb-1 text-sm sm:text-base">
                            {image.alt_description || image.description || 'Imagine Unsplash'}
                          </h3>

                          <p className="text-xs text-gray-500">
                            de {image.user.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {hasMoreUnsplash && (
                    <div className="text-center mb-8">
                      <button
                        onClick={loadMoreUnsplash}
                        className="px-6 py-2 bg-[#7B93FF] text-white rounded-lg hover:bg-[#6A82EE] transition-colors"
                      >
                        {isLoadingMore ? 'Loading...' : 'Load More'}
                      </button>
                    </div>
                  )}
                  
                  <div className="h-px bg-gray-200 my-8"></div>
                  <h2 className="text-xl text-gray-900 mb-6">Tablouri Canvas din Colecția Noastră</h2>
                </div>
              )}

              {sortedPaintings.length === 0 ? (
                <div className="sticky top-24 bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                  <p className="text-gray-500 text-lg mb-4">Nu există tablouri pentru filtrele selectate</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedStyle('all');
                      setSelectedOrientation('all');
                      setSelectedColor('all');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-2 bg-[#86C2FF] text-white rounded-lg hover:bg-[#6FB0EE] transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Random Unsplash Images Section - show when no filters are active OR when filters match */}
                  {randomUnsplashImages.length > 0 && filteredRandomUnsplashImages.length > 0 && (
                    <div className="mb-8 md:mb-12">
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h2 className="text-xl md:text-2xl text-gray-900">
                          {hasActiveFilters ? 'Imagini Unsplash Potrivite' : 'Imagini Populare'}
                        </h2>
                        <button
                          onClick={loadRandomCuratedImages}
                          className="text-sm text-[#7B93FF] hover:text-[#6A82EE] flex items-center gap-1"
                        >
                          <Search className="w-4 h-4" />
                          Încarcă altele
                        </button>
                      </div>
                      
                      {isLoadingRandom ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-[#86C2FF] rounded-full"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                          {filteredRandomUnsplashImages.map((image) => (
                            <Link 
                              key={image.id} 
                              to={`/produs/unsplash-${image.id}`}
                              onClick={() => {
                                sessionStorage.setItem(`unsplash-${image.id}`, JSON.stringify(image));
                                // Store return path
                                sessionStorage.setItem('unsplash-return-path', '/tablouri-canvas');
                              }}
                              className="group"
                            >
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                                <img
                                  src={image.urls.small}
                                  alt={image.alt_description || 'Unsplash image'}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              
                              <h3 className="text-gray-900 group-hover:text-[#86C2FF] transition-colors line-clamp-2 mb-1 text-sm sm:text-base">
                                {image.alt_description || image.description || 'Imagine Unsplash'}
                              </h3>

                              <p className="text-xs text-gray-500">
                                de {image.user.name}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}
                      
                      <div className="h-px bg-gray-200 my-8"></div>
                    </div>
                  )}
                  
                  <div className="hidden lg:block mb-6 text-gray-600">
                    {sortedPaintings.length} {sortedPaintings.length === 1 ? 'tablou găsit' : 'tablouri găsite'}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {sortedPaintings.map((painting) => {
                      const finalPrice = painting.price * (1 - painting.discount / 100);
                      
                      return (
                        <Link 
                          key={painting.id} 
                          to={`/produs/${painting.id}`}
                          className="group"
                        >
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                            <img
                              src={painting.imageUrls?.medium || painting.image}
                              alt={painting.title}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {painting.isBestseller && (
                              <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs rounded shadow-md">
                                Bestseller
                              </span>
                            )}
                            {painting.discount > 0 && (
                              <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded shadow-md">
                                -{painting.discount}%
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-gray-900 group-hover:text-[#86C2FF] transition-colors line-clamp-2 mb-1 text-sm sm:text-base">
                            {painting.title}
                          </h3>

                          <div className="flex items-baseline gap-2 text-sm sm:text-base">
                            {painting.discount > 0 ? (
                              <>
                                <span className="text-gray-900">
                                  {finalPrice.toFixed(2)} RON
                                </span>
                                <span className="text-xs sm:text-sm text-gray-400 line-through">
                                  {painting.price.toFixed(2)} RON
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-900">
                                {painting.price.toFixed(2)} RON
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/30 z-50 lg:hidden" onClick={() => setShowMobileFilters(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg text-gray-900">Filtre</h3>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filter Content */}
            <div className="overflow-y-auto flex-1 p-4">
              <div className="space-y-6">
                {/* Sort Dropdown */}
                <div>
                  <label className="block text-gray-900 mb-3">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#86C2FF]/20"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name">Name: A-Z</option>
                  </select>
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Category Filter */}
                <div>
                  <h3 className="text-gray-900 mb-3">Category</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="category-mobile"
                        checked={selectedCategory === 'all'}
                        onChange={() => setSelectedCategory('all')}
                        className="w-4 h-4 text-[#86C2FF] focus:ring-[#86C2FF]"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">All Categories</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="category-mobile"
                          checked={selectedCategory === cat.name}
                          onChange={() => setSelectedCategory(cat.name)}
                          className="w-4 h-4 text-[#86C2FF] focus:ring-[#86C2FF]"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Stil Filter */}
                <div>
                  <h3 className="text-gray-900 mb-3">Stil</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="style-mobile"
                        checked={selectedStyle === 'all'}
                        onChange={() => setSelectedStyle('all')}
                        className="w-4 h-4 text-[#86C2FF] focus:ring-[#86C2FF]"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">Toate Stilurile</span>
                    </label>
                    {subcategories.map((sub) => (
                      <label key={sub.id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="style-mobile"
                          checked={selectedStyle === sub.name}
                          onChange={() => setSelectedStyle(sub.name)}
                          className="w-4 h-4 text-[#86C2FF] focus:ring-[#86C2FF]"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{sub.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Orientation Filter */}
                <div>
                  <h3 className="text-gray-900 mb-3">Orientation</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="orientation-mobile"
                        checked={selectedOrientation === 'all'}
                        onChange={() => setSelectedOrientation('all')}
                        className="w-4 h-4 text-[#86C2FF] focus:ring-[#86C2FF]"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">All Orientations</span>
                    </label>
                    {['portrait', 'landscape', 'square'].map((orientation) => (
                      <label key={orientation} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="orientation-mobile"
                          checked={selectedOrientation === orientation}
                          onChange={() => setSelectedOrientation(orientation)}
                          className="w-4 h-4 text-[#86C2FF] focus:ring-[#86C2FF]"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 capitalize">{orientation}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Color Filter */}
                <div>
                  <h3 className="text-gray-900 mb-3">Color</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="color-mobile"
                        checked={selectedColor === 'all'}
                        onChange={() => setSelectedColor('all')}
                        className="w-4 h-4 text-[#86C2FF] focus:ring-[#86C2FF]"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">All Colors</span>
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        { name: 'Roșu', color: '#EF4444' },
                        { name: 'Portocaliu', color: '#F97316' },
                        { name: 'Galben', color: '#EAB308' },
                        { name: 'Verde', color: '#22C55E' },
                        { name: 'Albastru', color: '#3B82F6' },
                        { name: 'Mov', color: '#A855F7' },
                        { name: 'Roz', color: '#EC4899' },
                        { name: 'Maro', color: '#92400E' },
                        { name: 'Negru', color: '#000000' },
                        { name: 'Alb', color: '#FFFFFF' },
                        { name: 'Gri', color: '#6B7280' },
                        { name: 'Bej', color: '#D4C5B9' },
                      ].map((colorItem) => (
                        <button
                          key={colorItem.name}
                          onClick={() => setSelectedColor(colorItem.name)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            selectedColor === colorItem.name
                              ? 'border-[#86C2FF] ring-2 ring-[#86C2FF] ring-offset-2'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: colorItem.color }}
                          title={colorItem.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="border-t border-gray-200 p-4 flex-shrink-0 space-y-2">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedStyle('all');
                  setSelectedOrientation('all');
                  setSelectedColor('all');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full px-4 py-3 bg-[#86C2FF] text-white rounded-lg hover:bg-[#6FB0EE] transition-colors"
              >
                Aplică ({sortedPaintings.length} {sortedPaintings.length === 1 ? 'tablou' : 'tablouri'})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};