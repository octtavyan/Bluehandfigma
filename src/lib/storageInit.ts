// Storage bucket initialization utility
import { projectId, publicAnonKey } from '../utils/supabase/info';

/**
 * Initialize storage bucket (server-side)
 * Call this once on app initialization or when needed
 */
export async function initializeStorageBucket(): Promise<boolean> {
  try {
    // Check if Supabase is configured
    if (!projectId || !publicAnonKey) {
      // Silently skip if Supabase is not configured
      return false;
    }

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/storage/init-bucket`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      // Silently fail for network errors - storage init is non-critical
      return false;
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Storage bucket initialized:', result.message);
      return true;
    } else {
      console.error('❌ Storage bucket initialization failed:', result.error);
      return false;
    }
  } catch (error) {
    // Storage init is non-critical - silently fail without warnings
    // Only log in development
    if (import.meta.env.DEV) {
      console.debug('Storage init skipped:', error instanceof Error ? error.message : 'Unknown error');
    }
    return false;
  }
}