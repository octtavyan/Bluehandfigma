import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Figma Make Supabase credentials
const FIGMA_MAKE_SUPABASE_URL = `https://${projectId}.supabase.co`;
const FIGMA_MAKE_SUPABASE_KEY = publicAnonKey;

// Types for our database schema
export interface Database {
  public: {
    Tables: {
      paintings: {
        Row: {
          id: string;
          title: string;
          category: string;
          subcategory: string | null;
          description: string | null;
          image: string;
          sizes: any[];
          price: number;
          discount: number;
          is_bestseller: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['paintings']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['paintings']['Insert']>;
      };
      sizes: {
        Row: {
          id: string;
          width: number;
          height: number;
          price: number;
          discount: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sizes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sizes']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      subcategories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subcategories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['subcategories']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          delivery_address: string;
          delivery_city: string | null;
          delivery_county: string | null;
          delivery_postal_code: string | null;
          delivery_option: string;
          payment_method: string;
          payment_status: string | null;
          items: any[];
          subtotal: number;
          delivery_cost: number;
          total: number;
          status: string;
          notes: string | null;
          person_type: string | null;
          company_name: string | null;
          cui: string | null;
          reg_com: string | null;
          company_county: string | null;
          company_city: string | null;
          company_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          address: string | null;
          total_orders: number;
          total_spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          username: string;
          password: string;
          role: string;
          name: string;
          email: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      hero_slides: {
        Row: {
          id: string;
          image: string;
          title: string;
          subtitle: string | null;
          button_text: string | null;
          button_link: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hero_slides']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['hero_slides']['Insert']>;
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          featured_image: string | null;
          author: string;
          category: string | null;
          tags: any[];
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blog_posts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>;
      };
    };
  };
}

// Singleton instance with cache key tracking
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;
let currentConfigKey: string | null = null;

// Helper to create a unique key for the config
const getConfigKey = (url: string, anonKey: string) => {
  return `${url}|${anonKey.substring(0, 20)}`; // Use first 20 chars of key for comparison
};

export const initializeSupabase = (url: string, anonKey: string) => {
  const configKey = getConfigKey(url, anonKey);
  
  // Only create a new instance if the config has changed
  if (supabaseInstance && currentConfigKey === configKey) {
    return supabaseInstance;
  }
  
  // Create new instance with proper configuration to avoid auth warnings
  // and add timeout settings to prevent long-running queries
  supabaseInstance = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false, // Disable auth session persistence since we're not using Supabase Auth
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'bluehand-canvas-app'
      }
    },
    db: {
      schema: 'public'
    },
    // Add connection pooling configuration
    realtime: {
      params: {
        eventsPerSecond: 2 // Limit realtime events to reduce load
      }
    }
  });
  
  currentConfigKey = configKey;
  return supabaseInstance;
};

export const getSupabase = () => {
  if (!supabaseInstance) {
    // First, try to get custom config from localStorage
    const config = localStorage.getItem('supabase_config');
    if (config) {
      const { url, anonKey } = JSON.parse(config);
      return initializeSupabase(url, anonKey);
    }
    
    // If no custom config, use Figma Make's Supabase
    if (FIGMA_MAKE_SUPABASE_URL && FIGMA_MAKE_SUPABASE_KEY) {
      return initializeSupabase(FIGMA_MAKE_SUPABASE_URL, FIGMA_MAKE_SUPABASE_KEY);
    }
    
    console.error('❌ Supabase not initialized - no credentials available!');
    throw new Error('Supabase not initialized. Please configure your Supabase credentials.');
  }
  return supabaseInstance;
};

export const isSupabaseConfigured = () => {
  // Check if custom config exists OR Figma Make credentials are available
  const hasCustomConfig = !!localStorage.getItem('supabase_config');
  const hasFigmaMakeConfig = !!(FIGMA_MAKE_SUPABASE_URL && FIGMA_MAKE_SUPABASE_KEY);
  
  return hasCustomConfig || hasFigmaMakeConfig;
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('supabase_config', JSON.stringify({ url, anonKey }));
  initializeSupabase(url, anonKey);
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('supabase_config');
  supabaseInstance = null;
  currentConfigKey = null;
};