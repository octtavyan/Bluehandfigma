// Centralized Supabase Client - Single Instance for Entire App
// This prevents "Multiple GoTrueClient instances" warning

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

console.log('🔧 Supabase Configuration:');
console.log('   URL:', supabaseUrl);
console.log('   Project ID:', projectId);
console.log('   Key (first 20 chars):', publicAnonKey.substring(0, 20) + '...');

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    console.log('✅ Creating Supabase client instance with CORS-friendly settings');
    supabaseInstance = createClient(supabaseUrl, publicAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'implicit'
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'bluehand-canvas-app'
        },
        fetch: (url, options = {}) => {
          // Ensure apikey is ALWAYS included in every request
          const headers = new Headers(options.headers);
          
          // Force add apikey and Authorization if not present
          if (!headers.has('apikey')) {
            headers.set('apikey', publicAnonKey);
          }
          if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${publicAnonKey}`);
          }
          if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
          }
          
          const newOptions = {
            ...options,
            mode: 'cors' as RequestMode,
            credentials: 'omit' as RequestCredentials,
            headers: headers
          };
          
          console.log('🌐 Fetch:', url.toString().substring(0, 80), '| Has apikey:', headers.has('apikey'));
          return fetch(url, newOptions);
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    console.log('✅ Supabase client created successfully');
  }
  return supabaseInstance;
};

// Export the singleton instance
export const supabase = getSupabaseClient();

// Legacy exports for backward compatibility
export const getSupabase = getSupabaseClient;

export const isSupabaseConfigured = (): boolean => {
  // Supabase is always configured in this environment
  return true;
};