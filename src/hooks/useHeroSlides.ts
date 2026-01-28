import { useState, useEffect } from 'react';
import { HeroSlide } from '../types';
import { CacheService, CACHE_KEYS, CACHE_TTL } from '../lib/cacheService';

/**
 * Lightweight hook for loading hero slides ASAP - bypasses AdminContext
 * This ensures sliders display immediately without waiting for other data
 */
export const useHeroSlides = () => {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHeroSlides = async () => {
      try {
        // Try cache first for instant display
        const cachedSlides = CacheService.get<HeroSlide[]>(CACHE_KEYS.HERO_SLIDES);
        
        if (cachedSlides && cachedSlides.length > 0) {
          setHeroSlides(cachedSlides);
          setIsLoading(false);
          return;
        }

        // If no cache, fetch from Supabase
        const { heroSlidesService } = await import('../lib/supabaseDataService');
        const slides = await heroSlidesService.getAll();
        
        setHeroSlides(slides);
        
        // Cache for next time
        CacheService.set(CACHE_KEYS.HERO_SLIDES, slides, CACHE_TTL.HERO_SLIDES);
      } catch (error) {
        console.error('Error loading hero slides:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHeroSlides();
  }, []);

  return { heroSlides, isLoading };
};
