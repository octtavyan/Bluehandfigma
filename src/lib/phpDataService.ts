// PHP Backend Data Service for BlueHand Canvas
// This replaces the complex Supabase dataService with simple PHP API calls

import { api } from '../services/api';

// API Base URL for logging
const API_BASE_URL = 'https://bluehand.ro/api';

// ===== TYPES =====

export interface Painting {
  id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  image: string;
  availableSizes: any[];
  variants: any[];
  price: number;
  discount: number;
  isActive: boolean;
  isBestseller?: boolean;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

export interface CanvasSize {
  id: number;
  name: string;
  width: number;
  height: number;
  price: number;
  is_active: boolean;
}

export interface Style {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface PrintType {
  id: number;
  name: string;
  description?: string;
  price_multiplier: number;
  is_active: boolean;
}

export interface FrameType {
  id: number;
  name: string;
  description?: string;
  price_modifier: number;
  modifier_type: 'percentage' | 'fixed';
  is_active: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city?: string;
  delivery_county?: string;
  delivery_postal_code?: string;
  delivery_option: string;
  payment_method: string;
  payment_status?: string;
  items: any[];
  subtotal: number;
  delivery_cost: number;
  total: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ===== PAINTINGS SERVICE =====

export const paintingsService = {
  async getAll(): Promise<Painting[]> {
    try {
      console.log('🎨 Fetching paintings from:', `${API_BASE_URL}/paintings`);
      const response = await api.get('paintings');
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', {
        contentType: response.headers.get('content-type'),
        cors: response.headers.get('access-control-allow-origin'),
      });
      
      if (!response.ok) {
        console.error('❌ API returned error status:', response.status, response.statusText);
        const text = await response.text();
        console.error('❌ Error response:', text.substring(0, 500));
        return [];
      }
      
      const text = await response.text();
      
      // Try to parse as JSON
      try {
        const data = JSON.parse(text);
        console.log('✅ Paintings loaded:', data.paintings?.length || 0);
        return data.paintings || [];
      } catch (jsonError) {
        // Not JSON - show what we got
        console.error('❌ Paintings API returned HTML instead of JSON:');
        console.error('First 500 chars:', text.substring(0, 500));
        console.error('This means your PHP files have syntax errors!');
        console.error('Go to /php-files page to get clean PHP code.');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching paintings:', error);
      console.error('❌ Error type:', error instanceof TypeError ? 'TypeError (CORS or Network)' : typeof error);
      console.error('❌ Error message:', (error as Error).message);
      
      // Check if it's a CORS error
      if (error instanceof TypeError && (error as Error).message === 'Failed to fetch') {
        console.error('🚨 CORS ERROR DETECTED!');
        console.error('🔧 Possible causes:');
        console.error('   1. mod_headers not enabled in Apache');
        console.error('   2. .htaccess CORS headers not working');
        console.error('   3. Server firewall blocking requests');
        console.error('   4. SSL certificate issue');
        console.error('📋 Test in terminal: curl -I https://bluehand.ro/api/paintings');
        console.error('📋 Should show: access-control-allow-origin: *');
      }
      
      return [];
    }
  },

  async getBySlug(slug: string): Promise<Painting | null> {
    try {
      const response = await api.get(`paintings/${slug}`);
      const data = await response.json();
      return data.painting || null;
    } catch (error) {
      console.error(`Error fetching painting ${slug}:`, error);
      return null;
    }
  },

  async create(painting: Partial<Painting>): Promise<Painting | null> {
    try {
      const response = await api.post('paintings', painting);
      const data = await response.json();
      // Return the full painting object from the backend response
      return data.painting || null;
    } catch (error) {
      console.error('Error creating painting:', error);
      return null;
    }
  },

  async update(id: string, painting: Partial<Painting>): Promise<boolean> {
    try {
      const response = await api.put(`paintings/${id}`, painting);
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error(`Error updating painting ${id}:`, error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const response = await api.delete(`paintings/${id}`);
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error(`Error deleting painting ${id}:`, error);
      return false;
    }
  }
};

// ===== CATEGORIES SERVICE =====

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    try {
      const response = await api.get('categories');
      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }
};

// ===== SIZES SERVICE =====

export const canvasSizesService = {
  async getAll(): Promise<CanvasSize[]> {
    try {
      const response = await api.get('sizes');
      const data = await response.json();
      const rawSizes = data.sizes || [];
      
      console.log('🔍 Raw sizes from PHP API:', rawSizes.slice(0, 2)); // Debug: show first 2 sizes
      
      // Transform PHP snake_case data to frontend camelCase
      const transformedSizes = rawSizes.map((s: any) => {
        // Parse width and height from name (e.g., "30x20" -> width: 30, height: 20)
        const [width, height] = s.name ? s.name.split('x').map(Number) : [0, 0];
        
        const transformed = {
          id: s.id.toString(),
          width: width || 0,
          height: height || 0,
          price: parseFloat(s.price) || 0,
          discount: parseFloat(s.discount || 0),
          isActive: s.is_active !== undefined ? s.is_active : true,
          supportsPrintCanvas: s.supports_print_canvas !== undefined ? s.supports_print_canvas : true,
          supportsPrintHartie: s.supports_print_hartie !== undefined ? s.supports_print_hartie : true,
          framePrices: s.frame_prices ? (typeof s.frame_prices === 'string' ? JSON.parse(s.frame_prices) : s.frame_prices) : {}
        };
        
        return transformed;
      });
      
      console.log('✅ Transformed sizes:', transformedSizes.slice(0, 2)); // Debug: show first 2 transformed sizes
      
      return transformedSizes;
    } catch (error) {
      console.error('Error fetching sizes:', error);
      return [];
    }
  },

  async create(size: Partial<CanvasSize>): Promise<CanvasSize | null> {
    try {
      // Transform camelCase to snake_case for PHP API
      const phpData = {
        name: `${size.width}x${size.height} cm`,
        dimensions: `${size.width}x${size.height}`,
        basePrice: size.price,
        supportsPrintCanvas: size.supportsPrintCanvas !== undefined ? size.supportsPrintCanvas : true,
        supportsPrintHartie: size.supportsPrintHartie !== undefined ? size.supportsPrintHartie : true,
        active: size.isActive !== undefined ? size.isActive : true
      };

      const response = await api.post('sizes', phpData);
      const data = await response.json();
      
      if (data.success && data.size) {
        // Transform response back to camelCase
        return {
          id: data.size.id.toString(),
          width: data.size.width || 0,
          height: data.size.height || 0,
          price: parseFloat(data.size.basePrice) || 0,
          discount: 0,
          isActive: data.size.active !== undefined ? data.size.active : true,
          supportsPrintCanvas: data.size.supportsPrintCanvas !== undefined ? data.size.supportsPrintCanvas : true,
          supportsPrintHartie: data.size.supportsPrintHartie !== undefined ? data.size.supportsPrintHartie : true,
          framePrices: {}
        };
      }
      return null;
    } catch (error) {
      console.error('Error creating size:', error);
      throw error;
    }
  },

  async update(id: string, size: Partial<CanvasSize>): Promise<CanvasSize | null> {
    try {
      // Transform camelCase to snake_case for PHP API
      const phpData: any = { id };
      
      if (size.width !== undefined && size.height !== undefined) {
        phpData.name = `${size.width}x${size.height} cm`;
        phpData.dimensions = `${size.width}x${size.height}`;
      }
      if (size.price !== undefined) phpData.basePrice = size.price;
      if (size.isActive !== undefined) phpData.active = size.isActive;
      if (size.supportsPrintCanvas !== undefined) phpData.supportsPrintCanvas = size.supportsPrintCanvas;
      if (size.supportsPrintHartie !== undefined) phpData.supportsPrintHartie = size.supportsPrintHartie;

      const response = await api.put(`sizes`, phpData);
      const data = await response.json();
      
      if (data.success && data.size) {
        // Transform response back to camelCase
        return {
          id: data.size.id.toString(),
          width: data.size.width || 0,
          height: data.size.height || 0,
          price: parseFloat(data.size.basePrice) || 0,
          discount: 0,
          isActive: data.size.active !== undefined ? data.size.active : true,
          supportsPrintCanvas: data.size.supportsPrintCanvas !== undefined ? data.size.supportsPrintCanvas : true,
          supportsPrintHartie: data.size.supportsPrintHartie !== undefined ? data.size.supportsPrintHartie : true,
          framePrices: {}
        };
      }
      return null;
    } catch (error) {
      console.error(`Error updating size ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const response = await api.request('sizes', {
        method: 'DELETE',
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error(`Error deleting size ${id}:`, error);
      return false;
    }
  }
};

// ===== STYLES SERVICE =====

export const stylesService = {
  async getAll(): Promise<Style[]> {
    try {
      const response = await api.get('styles');
      const data = await response.json();
      return data.styles || [];
    } catch (error) {
      console.error('Error fetching styles:', error);
      return [];
    }
  }
};

// ===== PRINT TYPES SERVICE =====

export const printTypesService = {
  async getAll(): Promise<PrintType[]> {
    try {
      const response = await api.get('print-types');
      const data = await response.json();
      return data.print_types || [];
    } catch (error) {
      console.error('Error fetching print types:', error);
      return [];
    }
  }
};

// ===== FRAME TYPES SERVICE =====

export const frameTypesService = {
  async getAll(): Promise<FrameType[]> {
    try {
      const response = await api.get('frame-types');
      const data = await response.json();
      return data.frame_types || [];
    } catch (error) {
      console.error('Error fetching frame types:', error);
      return [];
    }
  }
};

// ===== ORDERS SERVICE =====

export const ordersService = {
  async getAll(): Promise<Order[]> {
    try {
      console.log('📦 Fetching orders from:', `${API_BASE_URL}/orders`);
      const response = await api.get('orders');
      
      console.log('📡 Orders response status:', response.status);
      console.log('📡 Orders response headers:', {
        contentType: response.headers.get('content-type'),
        cors: response.headers.get('access-control-allow-origin'),
      });
      
      if (!response.ok) {
        console.error('❌ Orders API returned error status:', response.status, response.statusText);
        const text = await response.text();
        console.error('❌ Error response:', text.substring(0, 500));
        return [];
      }
      
      const text = await response.text();
      
      // Try to parse as JSON
      try {
        const data = JSON.parse(text);
        console.log('✅ Orders loaded:', data.orders?.length || 0);
        return data.orders || [];
      } catch (jsonError) {
        // Not JSON - show what we got
        console.error('❌ Orders API returned HTML instead of JSON:');
        console.error('First 500 chars:', text.substring(0, 500));
        console.error('This means your PHP files have syntax errors!');
        console.error('Go to /php-files page to get clean PHP code.');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      console.error('❌ Error type:', error instanceof TypeError ? 'TypeError (CORS or Network)' : typeof error);
      console.error('❌ Error message:', (error as Error).message);
      
      // Check if it's a CORS error
      if (error instanceof TypeError && (error as Error).message === 'Failed to fetch') {
        console.error('🚨 CORS ERROR DETECTED!');
        console.error('🔧 Possible causes:');
        console.error('   1. mod_headers not enabled in Apache');
        console.error('   2. .htaccess CORS headers not working');
        console.error('   3. Server firewall blocking requests');
        console.error('   4. SSL certificate issue');
        console.error('📋 Test in terminal: curl -I https://bluehand.ro/api/orders');
        console.error('📋 Should show: access-control-allow-origin: *');
      }
      
      return [];
    }
  },

  async getById(id: string): Promise<Order | null> {
    try {
      const response = await api.get(`orders/${id}`);
      const data = await response.json();
      return data.order || null;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      return null;
    }
  },

  async create(order: Partial<Order>): Promise<Order | null> {
    try {
      const response = await api.post('orders', order);
      const data = await response.json();
      return data.order || null;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  },

  async updateStatus(id: string, status: string): Promise<boolean> {
    try {
      const response = await api.put(`orders/${id}/status`, { status });
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error(`Error updating order status ${id}:`, error);
      return false;
    }
  }
};

// ===== AUTH SERVICE =====

export const authService = {
  async login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: any }> {
    try {
      console.log('🌐 authService.login called:', { username, password: '***' });
      console.log('🌐 POST to:', api.buildUrl('auth/login.php'));
      console.log('🌐 Request body:', JSON.stringify({ username, password: '***' }));
      
      const response = await api.post('auth/login.php', { username, password });
      
      console.log('🌐 Response status:', response.status, response.statusText);
      console.log('🌐 Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Get raw response text first
      const responseText = await response.text();
      console.log('🌐 Raw response:', responseText.substring(0, 500));
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('🌐 Parsed JSON:', data);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('❌ Response was HTML/PHP error:', responseText.substring(0, 300));
        return { success: false };
      }
      
      if (data.success && data.token) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        console.log('✅ Login successful, token saved');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false };
    }
  },

  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  },

  getUser(): any | null {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

// ===== UPLOAD SERVICE =====

export const uploadService = {
  async uploadImage(file: File, category: 'paintings' | 'orders' | 'sliders' | 'blog' = 'paintings'): Promise<string | null> {
    try {
      const result = await api.uploadFile(file, category);
      return result.url || null;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  }
};

// ===== CLIENTS SERVICE =====

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  total_orders?: number;
  total_spent?: number;
}

export const clientsService = {
  async getAll(): Promise<Client[]> {
    // For now, return empty array - will be implemented when needed
    console.log('Clients service not yet implemented in PHP backend');
    return [];
  },

  async getByEmail(email: string): Promise<Client | null> {
    return null;
  },

  async create(client: Partial<Client>): Promise<Client | null> {
    return null;
  },

  async update(id: string, client: Partial<Client>): Promise<boolean> {
    return false;
  }
};

// ===== BLOG POSTS SERVICE =====

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author: string;
  category?: string;
  tags: string[];
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export const blogPostsService = {
  async getAll(): Promise<BlogPost[]> {
    console.log('Blog posts service not yet implemented in PHP backend');
    return [];
  }
};

// ===== HERO SLIDES SERVICE =====

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  button_text?: string;
  button_link?: string;
  is_active: boolean;
  display_order: number;
}

export const heroSlidesService = {
  async getAll(): Promise<HeroSlide[]> {
    console.log('Hero slides service not yet implemented in PHP backend');
    return [];
  }
};

// ===== ADMIN USERS SERVICE =====

export interface AdminUser {
  id: string;
  username: string;
  role: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export const adminUsersService = {
  async getAll(): Promise<AdminUser[]> {
    console.log('Admin users service not yet implemented in PHP backend');
    return [];
  }
};

// ===== SUBCATEGORIES SERVICE =====

export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

export const subcategoriesService = {
  async getAll(): Promise<Subcategory[]> {
    console.log('Subcategories service not yet implemented in PHP backend');
    return [];
  }
};