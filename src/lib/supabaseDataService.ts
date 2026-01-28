// Supabase Data Service for BlueHand Canvas
// Development environment - uses Supabase backend

import { supabase } from './supabase';
import { CacheService, CACHE_KEYS } from './cacheService';

// ===== TYPES =====

// REMOVED: Painting interface - using Unsplash only

export interface Category {
  id: string;
  name: string;
  slug?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug?: string;
}

export interface CanvasSize {
  id: string;
  width: number;
  height: number;
  price: number;
  discount: number;
  isActive: boolean;
  supportsPrintCanvas?: boolean;
  supportsPrintHartie?: boolean;
  framePrices?: Record<string, {
    price: number;
    discount: number;
    availableForCanvas?: boolean;
    availableForPrint?: boolean;
  }>;
}

export interface FrameType {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}

export interface Order {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity?: string;
  deliveryCounty?: string;
  deliveryPostalCode?: string;
  deliveryOption: string;
  paymentMethod: string;
  paymentStatus?: string;
  items: any[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  status: string;
  notes?: string;
  createdAt: string;
  personType?: 'fizica' | 'juridica';
  companyName?: string;
  cui?: string;
  regCom?: string;
  companyCounty?: string;
  companyCity?: string;
  companyAddress?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: 'full-admin' | 'account-manager' | 'production';
  isActive: boolean;
}

export interface HeroSlide {
  id: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  imageUrls?: {
    original: string;
    medium: string;
    thumbnail: string;
  };
  order: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  publishDate: string;
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// ===== CATEGORIES SERVICE =====

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  },

  async create(category: Omit<Category, 'id'>): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return null;
    }

    return data;
  },

  async update(id: string, updates: Partial<Category>): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);

    return !error;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    return !error;
  }
};

// ===== SUBCATEGORIES SERVICE =====

export const subcategoriesService = {
  async getAll(): Promise<Subcategory[]> {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }

    return data || [];
  },

  async create(subcategory: Omit<Subcategory, 'id'>): Promise<Subcategory | null> {
    const { data, error } = await supabase
      .from('subcategories')
      .insert([subcategory])
      .select()
      .single();

    if (error) {
      console.error('Error creating subcategory:', error);
      return null;
    }

    return data;
  },

  async update(id: string, updates: Partial<Subcategory>): Promise<boolean> {
    const { error } = await supabase
      .from('subcategories')
      .update(updates)
      .eq('id', id);

    return !error;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id);

    return !error;
  }
};

// ===== CANVAS SIZES SERVICE =====

export const canvasSizesService = {
  async getAll(): Promise<CanvasSize[]> {
    console.log('📏 [Canvas Sizes] Fetching from Supabase...');
    
    const { data, error } = await supabase
      .from('canvas_sizes')
      .select('*')
      .order('width');

    if (error) {
      console.error('❌ [Canvas Sizes] Error fetching sizes:', error);
      console.error('❌ [Canvas Sizes] Error code:', error.code);
      console.error('❌ [Canvas Sizes] Error message:', error.message);
      return [];
    }

    console.log('✅ [Canvas Sizes] Successfully fetched', data?.length || 0, 'sizes');
    if (data && data.length > 0) {
      console.log('✅ [Canvas Sizes] Sample data:', data[0]);
    }

    return (data || []).map((s: any) => ({
      id: s.id,
      width: s.width,
      height: s.height,
      price: s.price,
      discount: s.discount || 0,
      isActive: s.is_active !== false,
      supportsPrintCanvas: s.supports_print_canvas !== false,
      supportsPrintHartie: s.supports_print_hartie !== false,
      framePrices: s.frame_prices || {}
    }));
  },

  async create(size: Omit<CanvasSize, 'id'>): Promise<CanvasSize | null> {
    const { data, error } = await supabase
      .from('canvas_sizes')
      .insert([{
        width: size.width,
        height: size.height,
        price: size.price,
        discount: size.discount || 0,
        supports_print_canvas: size.supportsPrintCanvas !== false,
        supports_print_hartie: size.supportsPrintHartie !== false,
        is_active: size.isActive,
        frame_prices: size.framePrices || {}
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating size:', error);
      return null;
    }

    return data ? {
      id: data.id,
      width: data.width,
      height: data.height,
      price: data.price,
      discount: data.discount || 0,
      isActive: data.is_active,
      supportsPrintCanvas: data.supports_print_canvas !== false,
      supportsPrintHartie: data.supports_print_hartie !== false,
      framePrices: data.frame_prices || {}
    } : null;
  },

  async update(id: string, updates: Partial<CanvasSize>): Promise<CanvasSize | null> {
    const dbUpdates: any = {};
    if (updates.width !== undefined) dbUpdates.width = updates.width;
    if (updates.height !== undefined) dbUpdates.height = updates.height;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.discount !== undefined) dbUpdates.discount = updates.discount;
    if (updates.supportsPrintCanvas !== undefined) dbUpdates.supports_print_canvas = updates.supportsPrintCanvas;
    if (updates.supportsPrintHartie !== undefined) dbUpdates.supports_print_hartie = updates.supportsPrintHartie;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.framePrices !== undefined) dbUpdates.frame_prices = updates.framePrices;

    const { data, error } = await supabase
      .from('canvas_sizes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating size:', error);
      return null;
    }

    return data ? {
      id: data.id,
      width: data.width,
      height: data.height,
      price: data.price,
      discount: data.discount || 0,
      isActive: data.is_active,
      supportsPrintCanvas: data.supports_print_canvas !== false,
      supportsPrintHartie: data.supports_print_hartie !== false,
      framePrices: data.frame_prices || {}
    } : null;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('canvas_sizes')
      .delete()
      .eq('id', id);

    return !error;
  }
};

// ===== FRAME TYPES SERVICE =====

export const frameTypesService = {
  async getAll(): Promise<FrameType[]> {
    const { data, error } = await supabase
      .from('frame_types')
      .select('*')
      .order('order');

    if (error) {
      console.error('Error fetching frame types:', error);
      return [];
    }

    return (data || []).map(f => ({
      id: f.id,
      name: f.name,
      isActive: f.is_active !== false,
      order: f.order || 0
    }));
  },

  async create(frameType: Omit<FrameType, 'id'>): Promise<FrameType | null> {
    const { data, error } = await supabase
      .from('frame_types')
      .insert([{
        name: frameType.name,
        is_active: frameType.isActive,
        order: frameType.order
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating frame type:', error);
      return null;
    }

    return data ? {
      id: data.id,
      name: data.name,
      isActive: data.is_active,
      order: data.order
    } : null;
  },

  async update(id: string, updates: Partial<FrameType>): Promise<boolean> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.order !== undefined) dbUpdates.order = updates.order;

    const { error } = await supabase
      .from('frame_types')
      .update(dbUpdates)
      .eq('id', id);

    return !error;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('frame_types')
      .delete()
      .eq('id', id);

    return !error;
  }
};

// ===== ORDERS SERVICE =====

export const ordersService = {
  // Generate unique order number in format: BHC-YYYYMMDD-XXXX
  async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `BHC-${year}${month}${day}`;
    
    // Get today's orders to determine the next sequence number
    const todayStart = new Date(year, now.getMonth(), now.getDate()).toISOString();
    const { data, error } = await supabase
      .from('orders')
      .select('order_number')
      .gte('created_at', todayStart)
      .like('order_number', `${datePrefix}%`)
      .order('created_at', { ascending: false })
      .limit(1);
    
    let sequence = 1;
    if (data && data.length > 0 && data[0].order_number) {
      // Extract sequence number from last order
      const lastOrderNumber = data[0].order_number;
      const lastSequence = parseInt(lastOrderNumber.split('-')[2] || '0');
      sequence = lastSequence + 1;
    }
    
    return `${datePrefix}-${String(sequence).padStart(4, '0')}`;
  },

  async getAll(): Promise<Order[]> {
    console.log('🔄 Fetching orders from Supabase...');
    
    try {
      // ⚡ OPTIMIZED: Fetch essential fields + items array for list view
      // Items are needed to display canvas count in table listing
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, customer_email, status, total, created_at, notes, person_type, items')
        .order('created_at', { ascending: false });

      if (error) {
        // Check if it's a timeout error
        if (error.code === '57014') {
          console.warn('⚠️ Orders query timeout - trying with limit...');
          
          // Fallback: Try with smaller limit
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('orders')
            .select('id, order_number, customer_name, customer_email, status, total, created_at, person_type, items')
            .order('created_at', { ascending: false })
            .limit(50);
            
          if (fallbackError || !fallbackData) {
            console.error('❌ Fallback query also failed, returning empty array');
            return [];
          }
          
          console.log(`✅ Fetched ${fallbackData.length} orders (fallback mode)`);
          return fallbackData.map(o => ({
            id: o.id,
            orderNumber: o.order_number,
            customerName: o.customer_name,
            customerEmail: o.customer_email,
            customerPhone: '',
            deliveryAddress: '',
            deliveryCity: '',
            deliveryCounty: '',
            deliveryPostalCode: '',
            deliveryOption: '',
            paymentMethod: '',
            paymentStatus: '',
            items: Array.isArray(o.items) ? o.items : [], // Keep items for count in listing
            subtotal: o.total,
            deliveryCost: 0,
            total: o.total,
            status: o.status,
            notes: '',
            createdAt: o.created_at,
            personType: o.person_type,
            companyName: '',
            cui: '',
            regCom: '',
            companyCounty: '',
            companyCity: '',
            companyAddress: ''
          }));
        }
        
        // Check if it's a "table doesn't exist" error
        if (error.message?.includes('relation') || error.message?.includes('does not exist') || error.code === 'PGRST116') {
          console.log('ℹ️ Orders table not found - database setup required');
          return [];
        }
        
        console.error('❌ Error fetching orders:', error);
        return [];
      }

      console.log(`✅ Fetched ${data?.length || 0} orders from Supabase (optimized mode with items array)`);

      // Return optimized version with items array included for count display
      return (data || []).map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        customerPhone: '',
        deliveryAddress: '',
        deliveryCity: '',
        deliveryCounty: '',
        deliveryPostalCode: '',
        deliveryOption: '',
        paymentMethod: '',
        paymentStatus: '',
        items: Array.isArray(o.items) ? o.items : [], // Keep items for count in listing
        subtotal: o.total,
        deliveryCost: 0,
        total: o.total,
        status: o.status,
        notes: o.notes || '',
        createdAt: o.created_at,
        personType: o.person_type,
        companyName: '',
        cui: '',
        regCom: '',
        companyCounty: '',
        companyCity: '',
        companyAddress: ''
      }));
    } catch (error: any) {
      console.error('❌ Exception fetching orders:', error);
      return [];
    }
  },

  async getTotalCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('❌ Error fetching orders count:', error);
        return 0;
      }

      return count || 0;
    } catch (error: any) {
      console.error('❌ Exception fetching orders count:', error);
      return 0;
    }
  },

  async getById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    return data ? {
      id: data.id,
      orderNumber: data.order_number,
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      customerPhone: data.customer_phone,
      deliveryAddress: data.delivery_address,
      deliveryCity: data.delivery_city,
      deliveryCounty: data.delivery_county,
      deliveryPostalCode: data.delivery_postal_code,
      deliveryOption: data.delivery_option,
      paymentMethod: data.payment_method,
      paymentStatus: data.payment_status,
      items: data.items || [],
      subtotal: data.subtotal,
      deliveryCost: data.delivery_cost,
      total: data.total,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at,
      personType: data.person_type,
      companyName: data.company_name,
      cui: data.cui,
      regCom: data.reg_com,
      companyCounty: data.company_county,
      companyCity: data.company_city,
      companyAddress: data.company_address
    } : null;
  },

  async create(order: Partial<Order>): Promise<Order | null> {
    // Generate order number
    const orderNumber = await this.generateOrderNumber();
    
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        delivery_address: order.deliveryAddress,
        delivery_city: order.deliveryCity,
        delivery_county: order.deliveryCounty,
        delivery_postal_code: order.deliveryPostalCode,
        delivery_option: order.deliveryOption,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus || 'unpaid',
        items: order.items,
        subtotal: order.subtotal,
        delivery_cost: order.deliveryCost,
        total: order.total,
        status: 'new',
        notes: order.notes,
        person_type: order.personType,
        company_name: order.companyName,
        cui: order.cui,
        reg_com: order.regCom,
        company_county: order.companyCounty,
        company_city: order.companyCity,
        company_address: order.companyAddress
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return null;
    }

    return data ? this.mapFromDB(data) : null;
  },

  async updateStatus(id: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    return !error;
  },

  async update(id: string, updates: Partial<Order>): Promise<boolean> {
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;

    const { error } = await supabase
      .from('orders')
      .update(dbUpdates)
      .eq('id', id);

    return !error;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    return !error;
  },

  mapFromDB(o: any): Order {
    return {
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      customerPhone: o.customer_phone,
      deliveryAddress: o.delivery_address,
      deliveryCity: o.delivery_city,
      deliveryCounty: o.delivery_county,
      deliveryPostalCode: o.delivery_postal_code,
      deliveryOption: o.delivery_option,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      items: o.items || [],
      subtotal: o.subtotal,
      deliveryCost: o.delivery_cost,
      total: o.total,
      status: o.status,
      notes: o.notes,
      createdAt: o.created_at,
      personType: o.person_type,
      companyName: o.company_name,
      cui: o.cui,
      regCom: o.reg_com,
      companyCounty: o.company_county,
      companyCity: o.company_city,
      companyAddress: o.company_address
    };
  }
};

// ===== CLIENTS SERVICE =====

export const clientsService = {
  async getAll(): Promise<Client[]> {
    try {
      console.log('🔄 Fetching clients from Supabase...');
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Check if it's a "table doesn't exist" error
        if (error.message?.includes('relation') || error.message?.includes('does not exist') || error.code === 'PGRST116') {
          console.log('ℹ️ Clients table not found - database setup required');
          return [];
        }
        
        // Log detailed error information
        console.error('❌ Error fetching clients:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return [];
      }

      console.log(`✅ Fetched ${data?.length || 0} clients from Supabase`);

      return (data || []).map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        createdAt: c.created_at,
        totalOrders: c.total_orders || 0,
        totalSpent: c.total_spent || 0
      }));
    } catch (error: any) {
      // Catch network errors (CORS, connection issues, etc.)
      console.error('❌ Exception fetching clients:', error);
      console.error('❌ Error type:', error.constructor.name);
      console.error('❌ Error message:', error.message);
      
      if (error.message?.includes('Failed to fetch')) {
        console.error('🚨 Network error - possible causes:');
        console.error('   1. CORS configuration issue');
        console.error('   2. Network connectivity problem');
        console.error('   3. Supabase service unavailable');
      }
      
      return [];
    }
  },

  async getByEmail(email: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      // Check if it's a "no rows returned" error (client doesn't exist)
      if (error.code === 'PGRST116') {
        return null;
      }
      
      // Check if it's a "table doesn't exist" error
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.log('ℹ️ Clients table not found - database setup required');
        return null;
      }
      
      console.error('Error fetching client by email:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      createdAt: data.created_at,
      totalOrders: data.total_orders || 0,
      totalSpent: data.total_spent || 0
    };
  },

  async create(client: Omit<Client, 'id' | 'createdAt'> | Omit<Client, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .insert([{
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        total_orders: 'totalOrders' in client ? client.totalOrders : 0,
        total_spent: 'totalSpent' in client ? client.totalSpent : 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      createdAt: data.created_at,
      totalOrders: data.total_orders || 0,
      totalSpent: data.total_spent || 0
    };
  },

  async update(id: string, updates: Partial<Client>): Promise<Client | null> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.totalOrders !== undefined) dbUpdates.total_orders = updates.totalOrders;
    if (updates.totalSpent !== undefined) dbUpdates.total_spent = updates.totalSpent;

    const { data, error } = await supabase
      .from('clients')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      createdAt: data.created_at,
      totalOrders: data.total_orders || 0,
      totalSpent: data.total_spent || 0
    };
  }
};

// ===== ADMIN USERS SERVICE =====

export const adminUsersService = {
  async getAll(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('username');

    if (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }

    return (data || []).map(u => ({
      id: u.id,
      username: u.username,
      password: u.password,
      fullName: u.full_name,
      email: u.email,
      role: u.role,
      isActive: u.is_active !== false
    }));
  },

  async create(user: Omit<AdminUser, 'id'>): Promise<AdminUser | null> {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([{
        username: user.username,
        password: user.password,
        full_name: user.fullName,
        email: user.email,
        role: user.role,
        is_active: user.isActive
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      return null;
    }

    return data ? {
      id: data.id,
      username: data.username,
      password: data.password,
      fullName: data.full_name,
      email: data.email,
      role: data.role,
      isActive: data.is_active
    } : null;
  },

  async update(id: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
    const dbUpdates: any = {};
    if (updates.username !== undefined) dbUpdates.username = updates.username;
    if (updates.password !== undefined) dbUpdates.password = updates.password;
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('admin_users')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin user:', error);
      return null;
    }

    return data ? {
      id: data.id,
      username: data.username,
      password: data.password,
      fullName: data.full_name,
      email: data.email,
      role: data.role,
      isActive: data.is_active
    } : null;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);

    return !error;
  }
};

// ===== HERO SLIDES SERVICE =====

export const heroSlidesService = {
  async getAll(): Promise<HeroSlide[]> {
    console.log('🔍 [Hero Slides] Fetching from Supabase...');
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('order');

      if (error) {
        console.error('❌ [Hero Slides] Error fetching hero slides:', error);
        console.error('❌ [Hero Slides] Error details:', JSON.stringify(error, null, 2));
        console.error('❌ [Hero Slides] Error code:', error.code);
        console.error('❌ [Hero Slides] Error message:', error.message);
        return [];
      }

      console.log('✅ [Hero Slides] Raw data from Supabase:', data);
      console.log('✅ [Hero Slides] Found', data?.length || 0, 'slides');

      if (!data || data.length === 0) {
        console.warn('⚠️ [Hero Slides] No slides found in database!');
        return [];
      }

      const mapped = (data || []).map(s => {
        console.log('🔄 [Hero Slides] Mapping slide:', s);
        return {
          id: s.id,
          title: s.title,
          buttonText: s.button_text,
          buttonLink: s.button_link,
          backgroundImage: s.background_image,
          imageUrls: s.image_urls,
          order: s.order
        };
      });
      
      console.log('✅ [Hero Slides] Mapped data:', mapped);
      return mapped;
    } catch (err) {
      console.error('❌ [Hero Slides] Unexpected error:', err);
      return [];
    }
  },

  async create(slide: Omit<HeroSlide, 'id'>): Promise<HeroSlide | null> {
    const { data, error } = await supabase
      .from('hero_slides')
      .insert([{
        title: slide.title,
        button_text: slide.buttonText,
        button_link: slide.buttonLink,
        background_image: slide.backgroundImage,
        image_urls: slide.imageUrls,
        order: slide.order
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating hero slide:', error);
      return null;
    }

    return data ? {
      id: data.id,
      title: data.title,
      buttonText: data.button_text,
      buttonLink: data.button_link,
      backgroundImage: data.background_image,
      imageUrls: data.image_urls,
      order: data.order
    } : null;
  },

  async update(id: string, updates: Partial<HeroSlide>): Promise<HeroSlide | null> {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.buttonText !== undefined) dbUpdates.button_text = updates.buttonText;
    if (updates.buttonLink !== undefined) dbUpdates.button_link = updates.buttonLink;
    if (updates.backgroundImage !== undefined) dbUpdates.background_image = updates.backgroundImage;
    if (updates.imageUrls !== undefined) dbUpdates.image_urls = updates.imageUrls;
    if (updates.order !== undefined) dbUpdates.order = updates.order;

    console.log('🔄 [Hero Slides] Updating slide:', id, 'with:', dbUpdates);

    const { data, error } = await supabase
      .from('hero_slides')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [Hero Slides] Error updating:', error);
      throw error;
    }

    console.log('✅ [Hero Slides] Updated successfully:', data);
    
    // Invalidate cache after update
    CacheService.delete(CACHE_KEYS.HERO_SLIDES);
    
    return data ? {
      id: data.id,
      title: data.title,
      buttonText: data.button_text,
      buttonLink: data.button_link,
      backgroundImage: data.background_image,
      imageUrls: data.image_urls,
      order: data.order
    } : null;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id);

    return !error;
  }
};

// ===== BLOG POSTS SERVICE =====

export const blogPostsService = {
  async getAll(): Promise<BlogPost[]> {
    // ⚡ OPTIMIZED: Fetch only lightweight fields (exclude full content to prevent timeout)
    // Full content is loaded on-demand when viewing individual blog post
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, image, category, author, publish_date, is_published, views, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(100); // Limit to 100 most recent posts

    if (error) {
      console.error('❌ Error fetching blog posts:', error);
      throw error; // Throw to trigger retry logic
    }

    // Map snake_case database fields to camelCase JavaScript fields
    return (data || []).map(p => ({
      id: p.id,
      title: p.title || '',
      slug: p.slug || '',
      excerpt: p.excerpt || '',
      content: '', // Empty content in listing - loaded on-demand
      image: p.image || '',
      category: p.category || '',
      author: p.author || '',
      publishDate: p.publish_date || p.publishDate || '',
      isPublished: p.is_published !== undefined ? p.is_published : (p.isPublished || false),
      views: p.views || 0,
      createdAt: p.created_at || p.createdAt || '',
      updatedAt: p.updated_at || p.updatedAt || ''
    }));
  },

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }

    if (!data) return null;

    // Map snake_case database fields to camelCase JavaScript fields
    return {
      id: data.id,
      title: data.title || '',
      slug: data.slug || '',
      excerpt: data.excerpt || '',
      content: data.content || '',
      image: data.image || '',
      category: data.category || '',
      author: data.author || '',
      publishDate: data.publish_date || data.publishDate || '',
      isPublished: data.is_published !== undefined ? data.is_published : (data.isPublished || false),
      views: data.views || 0,
      createdAt: data.created_at || data.createdAt || '',
      updatedAt: data.updated_at || data.updatedAt || ''
    };
  },

  async getById(id: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching blog post by ID:', error);
      return null;
    }

    if (!data) return null;

    // Map snake_case database fields to camelCase JavaScript fields
    return {
      id: data.id,
      title: data.title || '',
      slug: data.slug || '',
      excerpt: data.excerpt || '',
      content: data.content || '',
      image: data.image || '',
      category: data.category || '',
      author: data.author || '',
      publishDate: data.publish_date || data.publishDate || '',
      isPublished: data.is_published !== undefined ? data.is_published : (data.isPublished || false),
      views: data.views || 0,
      createdAt: data.created_at || data.createdAt || '',
      updatedAt: data.updated_at || data.updatedAt || ''
    };
  },

  async create(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image,
        category: post.category,
        author: post.author,
        publish_date: post.publishDate,
        is_published: post.isPublished,
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return null;
    }

    if (!data) return null;

    // Map snake_case database fields to camelCase JavaScript fields
    return {
      id: data.id,
      title: data.title || '',
      slug: data.slug || '',
      excerpt: data.excerpt || '',
      content: data.content || '',
      image: data.image || '',
      category: data.category || '',
      author: data.author || '',
      publishDate: data.publish_date || data.publishDate || '',
      isPublished: data.is_published !== undefined ? data.is_published : (data.isPublished || false),
      views: data.views || 0,
      createdAt: data.created_at || data.createdAt || '',
      updatedAt: data.updated_at || data.updatedAt || ''
    };
  },

  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    // Map camelCase fields to snake_case for database
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
    if (updates.excerpt !== undefined) dbUpdates.excerpt = updates.excerpt;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.author !== undefined) dbUpdates.author = updates.author;
    if (updates.publishDate !== undefined) dbUpdates.publish_date = updates.publishDate;
    if (updates.views !== undefined) dbUpdates.views = updates.views;
    
    console.log('🔄 Updating blog post:', id, 'with:', dbUpdates);
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating blog post:', error);
      return null;
    }

    if (!data) return null;

    console.log('✅ Blog post updated successfully');

    // Map snake_case database fields back to camelCase JavaScript fields
    return {
      id: data.id,
      title: data.title || '',
      slug: data.slug || '',
      excerpt: data.excerpt || '',
      content: data.content || '',
      image: data.image || '',
      category: data.category || '',
      author: data.author || '',
      publishDate: data.publish_date || data.publishDate || '',
      isPublished: data.is_published !== undefined ? data.is_published : (data.isPublished || false),
      views: data.views || 0,
      createdAt: data.created_at || data.createdAt || '',
      updatedAt: data.updated_at || data.updatedAt || ''
    };
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    return !error;
  }
};

// ===== AUTH SERVICE =====

export const authService = {
  async login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: any }> {
    // For Supabase, we use simple username/password lookup
    // In production with MySQL, you'd use proper password hashing
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { success: false };
    }

    // Generate a simple token (in production, use JWT)
    const token = `supabase_${data.id}_${Date.now()}`;

    return {
      success: true,
      token,
      user: {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        email: data.email,
        role: data.role
      }
    };
  },

  async logout(): Promise<{ success: boolean }> {
    // Clear local storage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    return { success: true };
  }
};

// ===== UNSPLASH SETTINGS SERVICE =====

export interface UnsplashSettings {
  id?: string;
  curatedQueries: string[];
}

export const unsplashSettingsService = {
  async get(): Promise<UnsplashSettings | null> {
    const { data, error } = await supabase
      .from('unsplash_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching Unsplash settings:', error);
      // Return default settings if not found
      return {
        curatedQueries: ['nature', 'abstract', 'architecture', 'minimal', 'landscape', 'urban', 'mountains', 'ocean']
      };
    }

    return data ? {
      id: data.id,
      curatedQueries: data.curated_queries || []
    } : null;
  },

  async save(settings: UnsplashSettings): Promise<boolean> {
    try {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('unsplash_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('unsplash_settings')
          .update({
            curated_queries: settings.curatedQueries
          })
          .eq('id', existing.id);

        return !error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('unsplash_settings')
          .insert([{
            curated_queries: settings.curatedQueries
          }]);

        return !error;
      }
    } catch (error) {
      console.error('Error saving Unsplash settings:', error);
      return false;
    }
  }
};

// ===== UNSPLASH SEARCHES SERVICE =====

export interface UnsplashSearchStat {
  query: string;
  count: number;
}

export const unsplashSearchesService = {
  async getStats(): Promise<{ topSearches: UnsplashSearchStat[]; totalSearches: number }> {
    try {
      // Get all searches
      const { data, error } = await supabase
        .from('unsplash_searches')
        .select('query');

      if (error) {
        console.error('❌ Error fetching search stats:', error);
        return { topSearches: [], totalSearches: 0 };
      }

      if (!data || data.length === 0) {
        return { topSearches: [], totalSearches: 0 };
      }

      // Count occurrences of each query
      const queryCount: { [key: string]: number } = {};
      data.forEach(item => {
        queryCount[item.query] = (queryCount[item.query] || 0) + 1;
      });

      // Convert to array and sort by count
      const topSearches = Object.entries(queryCount)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20

      return {
        topSearches,
        totalSearches: data.length
      };
    } catch (error) {
      console.error('❌ Error calculating search stats:', error);
      return { topSearches: [], totalSearches: 0 };
    }
  },

  async record(query: string, results: any[], totalResults: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('unsplash_searches')
        .insert([{
          query,
          results,
          total_results: totalResults
        }]);

      if (error) {
        console.error('❌ Error recording search:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error in record search:', error);
      return false;
    }
  }
};

// ===== LEGAL PAGES SERVICE =====

export interface LegalPage {
  id?: string;
  type: 'terms' | 'gdpr';
  content: string;
  updatedAt?: string;
}

export const legalPagesService = {
  async get(type: 'terms' | 'gdpr'): Promise<string> {
    const { data, error } = await supabase
      .from('legal_pages')
      .select('content')
      .eq('type', type)
      .limit(1)
      .single();

    if (error) {
      console.error(`Error fetching ${type} legal page:`, error);
      return '';
    }

    return data?.content || '';
  },

  async save(type: 'terms' | 'gdpr', content: string): Promise<boolean> {
    try {
      // Check if page exists
      const { data: existing } = await supabase
        .from('legal_pages')
        .select('id')
        .eq('type', type)
        .limit(1)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('legal_pages')
          .update({
            content,
            updated_at: new Date().toISOString()
          })
          .eq('type', type);

        if (error) {
          console.error(`Error updating ${type}:`, error);
          return false;
        }
      } else {
        // Insert new
        const { error } = await supabase
          .from('legal_pages')
          .insert([{
            type,
            content,
            updated_at: new Date().toISOString()
          }]);

        if (error) {
          console.error(`Error inserting ${type}:`, error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error(`Error saving ${type} legal page:`, error);
      return false;
    }
  }
};