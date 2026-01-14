// Robust storage utility that works on iOS and handles localStorage issues

/**
 * Test if storage is available and working
 */
function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Set item with fallback chain: localStorage -> sessionStorage -> memory
 */
const memoryStorage: { [key: string]: string } = {};

export function setStorageItem(key: string, value: string): void {
  try {
    // Try localStorage first
    if (isStorageAvailable('localStorage')) {
      localStorage.setItem(key, value);
      console.log('✅ Saved to localStorage:', key);
      return;
    }
  } catch (e) {
    console.warn('⚠️ localStorage failed:', e);
  }

  try {
    // Fallback to sessionStorage
    if (isStorageAvailable('sessionStorage')) {
      sessionStorage.setItem(key, value);
      console.log('✅ Saved to sessionStorage (fallback):', key);
      return;
    }
  } catch (e) {
    console.warn('⚠️ sessionStorage failed:', e);
  }

  // Last resort: memory storage (lost on page refresh)
  memoryStorage[key] = value;
  console.log('⚠️ Saved to memory storage (will be lost on refresh):', key);
}

/**
 * Get item with fallback chain: localStorage -> sessionStorage -> memory
 */
export function getStorageItem(key: string): string | null {
  try {
    // Try localStorage first
    if (isStorageAvailable('localStorage')) {
      const item = localStorage.getItem(key);
      if (item !== null) {
        console.log('📦 Retrieved from localStorage:', key);
        return item;
      }
    }
  } catch (e) {
    console.warn('⚠️ localStorage read failed:', e);
  }

  try {
    // Fallback to sessionStorage
    if (isStorageAvailable('sessionStorage')) {
      const item = sessionStorage.getItem(key);
      if (item !== null) {
        console.log('📦 Retrieved from sessionStorage (fallback):', key);
        return item;
      }
    }
  } catch (e) {
    console.warn('⚠️ sessionStorage read failed:', e);
  }

  // Last resort: memory storage
  if (memoryStorage[key]) {
    console.log('📦 Retrieved from memory storage:', key);
    return memoryStorage[key];
  }

  return null;
}

/**
 * Remove item from all storage locations
 */
export function removeStorageItem(key: string): void {
  try {
    if (isStorageAvailable('localStorage')) {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('⚠️ localStorage remove failed:', e);
  }

  try {
    if (isStorageAvailable('sessionStorage')) {
      sessionStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('⚠️ sessionStorage remove failed:', e);
  }

  delete memoryStorage[key];
  console.log('🗑️ Removed from all storage:', key);
}

/**
 * Check if we're on iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/**
 * Check if browser is in private/incognito mode (best effort)
 */
export async function isPrivateMode(): Promise<boolean> {
  // This is a heuristic and may not work in all cases
  try {
    const fs = (window as any).webkitRequestFileSystem || (window as any).requestFileSystem;
    if (!fs) return false;
    
    return new Promise((resolve) => {
      fs(
        (window as any).TEMPORARY,
        100,
        () => resolve(false),
        () => resolve(true)
      );
    });
  } catch (e) {
    return false;
  }
}
