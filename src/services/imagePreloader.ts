// Image Preloader Service
// Preloads critical images in the background to improve perceived performance

import { unsplashService, UnsplashImage } from './unsplashService';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface PreloadCache {
  images: UnsplashImage[];
  timestamp: number;
  isLoading: boolean;
}

const CACHE_KEY = 'bluehand_unsplash_preload';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

class ImagePreloader {
  private cache: PreloadCache | null = null;
  private preloadPromise: Promise<UnsplashImage[]> | null = null;

  /**
   * Start preloading images in the background
   * This should be called early in the app lifecycle
   */
  async preloadUnsplashImages(): Promise<void> {
    // Check if already loading
    if (this.preloadPromise) {
      return;
    }

    // Check cache first
    const cached = this.getFromCache();
    if (cached) {
      this.cache = cached;
      // Preload image URLs in browser cache
      this.preloadImageUrls(cached.images);
      return;
    }

    // Start loading in background
    this.preloadPromise = this.loadImagesInBackground();
    
    try {
      const images = await this.preloadPromise;
      
      // Save to cache
      this.cache = {
        images,
        timestamp: Date.now(),
        isLoading: false
      };
      this.saveToCache(this.cache);
      
      // Preload image URLs
      this.preloadImageUrls(images);
    } catch (error) {
      console.error('Background image preload failed:', error);
    } finally {
      this.preloadPromise = null;
    }
  }

  /**
   * Get preloaded images (returns immediately if cached)
   */
  async getPreloadedImages(): Promise<UnsplashImage[]> {
    // Return from cache if available
    if (this.cache && !this.isCacheExpired(this.cache)) {
      return this.cache.images;
    }

    // Check sessionStorage cache
    const cached = this.getFromCache();
    if (cached && !this.isCacheExpired(cached)) {
      this.cache = cached;
      return cached.images;
    }

    // If preload is in progress, wait for it
    if (this.preloadPromise) {
      return this.preloadPromise;
    }

    // Otherwise, load now
    return this.loadImagesInBackground();
  }

  /**
   * Clear the cache (useful for forced refresh)
   */
  clearCache(): void {
    this.cache = null;
    sessionStorage.removeItem(CACHE_KEY);
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid(): boolean {
    if (this.cache && !this.isCacheExpired(this.cache)) {
      return true;
    }
    
    const cached = this.getFromCache();
    return cached !== null && !this.isCacheExpired(cached);
  }

  // Private methods

  private async loadImagesInBackground(): Promise<UnsplashImage[]> {
    try {
      // Fetch settings to get curated queries and image count
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
      
      let allImages: UnsplashImage[] = [];
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
      return shuffledImages;
    } catch (error) {
      console.error('Error loading images in background:', error);
      return [];
    }
  }

  private preloadImageUrls(images: UnsplashImage[]): void {
    // Preload images in the browser cache using Image objects
    images.forEach((image) => {
      const img = new Image();
      // Use regular size for preloading (not full quality to save bandwidth)
      img.src = image.urls.regular;
      
      // Optional: Also preload small thumbnails
      const thumbImg = new Image();
      thumbImg.src = image.urls.small;
    });
  }

  private getFromCache(): PreloadCache | null {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }
    return null;
  }

  private saveToCache(cache: PreloadCache): void {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error saving to cache:', error);
      // QuotaExceededError - clear old cache and try again
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        sessionStorage.removeItem(CACHE_KEY);
      }
    }
  }

  private isCacheExpired(cache: PreloadCache): boolean {
    return Date.now() - cache.timestamp > CACHE_DURATION;
  }
}

// Export singleton instance
export const imagePreloader = new ImagePreloader();
