// Cache Service for BlueHand Canvas
// Provides localStorage-based caching with TTL (Time To Live)

// CACHE VERSION: Increment this to invalidate all old caches
const CACHE_VERSION = 'v5_users_reload'; // ✨ INCREMENT THIS TO CLEAR ALL CACHES

export const CACHE_KEYS = {
  PAINTINGS: `paintings_${CACHE_VERSION}`,
  SIZES: `sizes_${CACHE_VERSION}`,
  FRAME_TYPES: `frame_types_${CACHE_VERSION}`,
  ORDERS: `orders_${CACHE_VERSION}`,
  CLIENTS: `clients_${CACHE_VERSION}`,
  USERS: `users_${CACHE_VERSION}`,
  HERO_SLIDES: `hero_slides_${CACHE_VERSION}`,
  BLOG_POSTS: `blog_posts_${CACHE_VERSION}`,
  CATEGORIES: `categories_${CACHE_VERSION}`,
  SUBCATEGORIES: `subcategories_${CACHE_VERSION}`,
} as const;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
}

export class CacheService {
  private static prefix = 'bluehand_cache_';
  private static maxSize = 2 * 1024 * 1024; // 2MB limit - more conservative
  private static disabledKeys = ['orders', 'paintings']; // Keys that should never be cached (too large)

  // Set cache with TTL (time to live in minutes)
  static set<T>(key: string, data: T, ttlMinutes: number = 30): void {
    // Skip caching for disabled keys (silently)
    if (this.disabledKeys.includes(key)) {
      return;
    }

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000, // convert to milliseconds
      };
      
      const serialized = JSON.stringify(entry);
      
      // Check size before attempting to store
      const sizeInBytes = new Blob([serialized]).size;
      const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);
      
      if (sizeInBytes > this.maxSize) {
        // Too large to cache - skip silently
        return;
      }
      
      localStorage.setItem(this.prefix + key, serialized);
      // console.log(`📦 Cache SET: ${key} (TTL: ${ttlMinutes}min, Size: ${sizeInMB}MB)`);
    } catch (error) {
      // Handle QuotaExceededError gracefully
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn(`⚠️ Cache QUOTA EXCEEDED for ${key}. Clearing cache...`);
        // Clear all caches to free up space
        this.clearAll();
        // Add to disabled keys to prevent future attempts
        if (!this.disabledKeys.includes(key)) {
          this.disabledKeys.push(key);
        }
      } else {
        console.warn('Failed to set cache:', error);
      }
    }
  }

  // Get cache if not expired
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) {
        // console.log(`📦 Cache MISS: ${key}`);
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();
      const age = now - entry.timestamp;
      const isExpired = age > entry.ttl;

      if (isExpired) {
        // console.log(`📦 Cache EXPIRED: ${key} (age: ${Math.round(age / 1000 / 60)}min)`);
        this.delete(key);
        return null;
      }

      const remainingMinutes = Math.round((entry.ttl - age) / 1000 / 60);
      // console.log(`📦 Cache HIT: ${key} (expires in ${remainingMinutes}min)`);
      return entry.data;
    } catch (error) {
      console.warn('Failed to get cache:', error);
      return null;
    }
  }

  // Delete specific cache entry
  static delete(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
      // console.log(`📦 Cache DELETE: ${key}`);
    } catch (error) {
      console.warn('Failed to delete cache:', error);
    }
  }

  // Clear all cache entries
  static clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      // console.log('📦 Cache CLEARED: All entries');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  // Invalidate specific cache keys (useful after updates)
  static invalidate(...keys: string[]): void {
    keys.forEach(key => this.delete(key));
  }

  // Get cache age in minutes
  static getAge(key: string): number | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const entry: CacheEntry<any> = JSON.parse(item);
      return Math.round((Date.now() - entry.timestamp) / 1000 / 60);
    } catch (error) {
      return null;
    }
  }

  // Check if cache exists and is valid
  static isValid(key: string): boolean {
    return this.get(key) !== null;
  }

  // Clear expired cache entries
  static clearExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            const entry: CacheEntry<any> = JSON.parse(item);
            const now = Date.now();
            const age = now - entry.timestamp;
            const isExpired = age > entry.ttl;

            if (isExpired) {
              localStorage.removeItem(key);
              // console.log(`📦 Cache EXPIRED: ${key} (age: ${Math.round(age / 1000 / 60)}min)`);
            }
          }
        }
      });
    } catch (error) {
      console.warn('Failed to clear expired cache:', error);
    }
  }
}

// Cache TTL configurations (in minutes)
export const CACHE_TTL = {
  PAINTINGS: 60,        // 1 hour - paintings don't change often
  ORDERS: 2,            // 2 minutes - orders change frequently & can be large
  CLIENTS: 30,          // 30 minutes - moderate changes
  BLOG_POSTS: 120,      // 2 hours - rarely change
  HERO_SLIDES: 120,     // 2 hours - rarely change
  USERS: 60,            // 1 hour - rarely change
  SIZES: 120,           // 2 hours - rarely change
  FRAME_TYPES: 120,     // 2 hours - rarely change
  CATEGORIES: 120,      // 2 hours - rarely change
  SUBCATEGORIES: 120,   // 2 hours - rarely change
};