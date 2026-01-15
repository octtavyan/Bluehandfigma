import { getSupabase, isSupabaseConfigured } from './supabase';
import { paintingMetadataService } from './paintingMetadataService';

// IMPORTANT: This file uses ONLY Supabase for data persistence.
// LocalStorage has been completely removed to ensure data consistency
// across all platforms (desktop, mobile, Figma Make preview).

// ===== PAINTINGS SERVICE =====
export interface Painting {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  description?: string;
  image: string; // Legacy - thumbnail for backwards compatibility
  imageUrls?: { // New optimized images
    original: string;
    medium: string;
    thumbnail: string;
  };
  availableSizes: string[]; // SIMPLIFIED: Just array of size IDs like ['size-30x20', 'size-40x30']
  price: number;
  discount: number;
  isBestseller: boolean;
  isActive: boolean;
  createdAt?: string;
  orientation?: 'portrait' | 'landscape' | 'square';
  dominantColor?: string;
  printTypes?: ('Print Hartie' | 'Print Canvas')[];
  frameTypesByPrintType?: {
    'Print Hartie': string[];
    'Print Canvas': string[];
  };
}

export const paintingsService = {
  async getAll(): Promise<Painting[]> {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured. Using empty paintings array.');
      return [];
    }

    try {
      const supabase = getSupabase();
      
      // Fetch only core columns that definitely exist in the database
      // We use kv_store for metadata (orientation, dominantColor, printTypes, frameTypesByPrintType)
      console.log('💡 Using kv_store for painting metadata (dominant_color, orientation)');
      const { data, error } = await supabase
        .from('paintings')
        .select('id, title, category, subcategory, description, image, sizes, price, discount, is_bestseller, is_active, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching paintings:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Fetch metadata from kv_store for all paintings
      const paintingIds = data.map(p => p.id);
      const metadataMap = await paintingMetadataService.getMany(paintingIds);

      return data.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        subcategory: p.subcategory,
        description: p.description,
        image: p.image,
        availableSizes: Array.isArray(p.sizes) ? p.sizes : [], // NEW: sizes is now just array of IDs
        price: Number(p.price),
        discount: p.discount,
        isBestseller: p.is_bestseller,
        isActive: p.is_active,
        createdAt: p.created_at,
        // Use kv_store metadata if database columns don't exist
        orientation: p.orientation || metadataMap[p.id]?.orientation || 'portrait',
        dominantColor: p.dominant_color || metadataMap[p.id]?.dominantColor,
        imageUrls: p.image_urls, // Map the new optimized images if available
        printTypes: metadataMap[p.id]?.printTypes || [],
        frameTypesByPrintType: metadataMap[p.id]?.frameTypesByPrintType || { 'Print Hartie': [], 'Print Canvas': [] }
      }));
    } catch (error) {
      console.error('Error loading paintings from Supabase:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Painting | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('paintings')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        // Load metadata from kv_store if database columns don't have it
        const metadata = await paintingMetadataService.get(id);
        
        return data ? {
          id: data.id,
          title: data.title,
          category: data.category,
          subcategory: data.subcategory || undefined,
          description: data.description || undefined,
          image: data.image,
          availableSizes: Array.isArray(data.sizes) ? data.sizes : [], // NEW: sizes is now just array of IDs
          price: Number(data.price),
          discount: data.discount,
          isBestseller: data.is_bestseller,
          isActive: data.is_active,
          createdAt: data.created_at,
          orientation: data.orientation || metadata.orientation || 'portrait',
          dominantColor: data.dominant_color || metadata.dominantColor,
          imageUrls: data.image_urls,
          printTypes: metadata.printTypes || [],
          frameTypesByPrintType: metadata.frameTypesByPrintType || { 'Print Hartie': [], 'Print Canvas': [] }
        } : null;
      } catch (error) {
        console.error('Supabase error:', error);
      }
    }
    
    return null;
  },

  async create(painting: Omit<Painting, 'id' | 'createdAt'>): Promise<Painting> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        
        // Insert painting without orientation/dominantColor (will save to kv_store instead)
        const { data, error } = await supabase
          .from('paintings')
          .insert({
            title: painting.title,
            category: painting.category,
            subcategory: painting.subcategory || null,
            description: painting.description || null,
            image: painting.image,
            sizes: painting.availableSizes, // NEW: Just array of size IDs
            price: painting.price,
            discount: painting.discount,
            is_bestseller: painting.isBestseller,
            is_active: painting.isActive
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // ALWAYS save metadata to kv_store after successful insert
        if (data) {
          console.log('💾 Saving new painting metadata to kv_store');
          await paintingMetadataService.set(data.id, {
            orientation: painting.orientation,
            dominantColor: painting.dominantColor,
            printTypes: painting.printTypes,
            frameTypesByPrintType: painting.frameTypesByPrintType
          });
        }
        
        // Fetch metadata from kv_store
        const metadata = await paintingMetadataService.get(data.id);
        
        return {
          id: data.id,
          title: data.title,
          category: data.category,
          subcategory: data.subcategory || undefined,
          description: data.description || undefined,
          image: data.image,
          availableSizes: Array.isArray(data.sizes) ? data.sizes : [], // NEW: Just array of size IDs
          price: Number(data.price),
          discount: data.discount,
          isBestseller: data.is_bestseller,
          isActive: data.is_active,
          createdAt: data.created_at,
          orientation: data.orientation || metadata.orientation || 'portrait',
          dominantColor: data.dominant_color || metadata.dominantColor,
          imageUrls: data.image_urls,
          printTypes: metadata.printTypes || [],
          frameTypesByPrintType: metadata.frameTypesByPrintType || { 'Print Hartie': [], 'Print Canvas': [] }
        };
      } catch (error) {
        console.error('Supabase error:', error);
      }
    }
    
    return {} as Painting;
  },

  async update(id: string, updates: Partial<Painting>): Promise<Painting> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const updateData: any = {};
        
        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.category !== undefined) updateData.category = updates.category;
        if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory || null;
        if (updates.description !== undefined) updateData.description = updates.description || null;
        if (updates.image !== undefined) updateData.image = updates.image;
        if (updates.availableSizes !== undefined) updateData.sizes = updates.availableSizes; // NEW: Just array of size IDs
        if (updates.price !== undefined) updateData.price = updates.price;
        if (updates.discount !== undefined) updateData.discount = updates.discount;
        if (updates.isBestseller !== undefined) updateData.is_bestseller = updates.isBestseller;
        if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
        
        // ALWAYS save orientation, dominantColor, printTypes, and frameTypesByPrintType to kv_store (since we can't add DB columns)
        if (updates.orientation !== undefined || updates.dominantColor !== undefined || updates.printTypes !== undefined || updates.frameTypesByPrintType !== undefined) {
          await paintingMetadataService.set(id, {
            orientation: updates.orientation,
            dominantColor: updates.dominantColor,
            printTypes: updates.printTypes,
            frameTypesByPrintType: updates.frameTypesByPrintType
          });
        }
        
        // Try to update the database (without orientation/dominantColor)
        const { data, error } = await supabase
          .from('paintings')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        // Fetch metadata from kv_store to ensure we have the latest values
        const metadata = await paintingMetadataService.get(id);
        
        const result = {
          id: data.id,
          title: data.title,
          category: data.category,
          subcategory: data.subcategory || undefined,
          description: data.description || undefined,
          image: data.image,
          availableSizes: Array.isArray(data.sizes) ? data.sizes : [], // NEW: Just array of size IDs
          price: Number(data.price),
          discount: data.discount,
          isBestseller: data.is_bestseller,
          isActive: data.is_active,
          createdAt: data.created_at,
          orientation: data.orientation || metadata.orientation || 'portrait',
          dominantColor: data.dominant_color || metadata.dominantColor,
          imageUrls: data.image_urls,
          printTypes: metadata.printTypes || [],
          frameTypesByPrintType: metadata.frameTypesByPrintType || { 'Print Hartie': [], 'Print Canvas': [] }
        };
        
        return result;
      } catch (error) {
        console.error('Supabase error:', error);
      }
    }
    
    return {} as Painting;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('paintings')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Also delete metadata from kv_store
        await paintingMetadataService.delete(id);
        return;
      } catch (error) {
        console.error('Supabase error:', error);
      }
    }
  }
};

// ===== ORDERS SERVICE =====
export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity?: string;
  deliveryCounty?: string;
  deliveryPostalCode?: string;
  deliveryOption: string;
  paymentMethod: string;
  paymentStatus?: 'paid' | 'unpaid'; // Temporarily commented until column is added
  items: any[];
  itemsCount?: number; // Count of items without loading full JSONB
  subtotal: number;
  deliveryCost: number;
  total: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  // Company/Invoice fields
  personType?: 'fizica' | 'juridica';
  companyName?: string;
  cui?: string;
  regCom?: string;
  companyCounty?: string;
  companyCity?: string;
  companyAddress?: string;
  // FAN Courier AWB fields
  awbNumber?: string;
  awbGeneratedAt?: string;
  awbStatus?: 'pending' | 'in_transit' | 'delivered' | 'returned' | 'cancelled';
  awbTrackingUrl?: string;
  awbLastUpdate?: string;
  packageWeight?: number;
  packageDimensions?: string; // JSON string
}

export const ordersService = {
  async getAll(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        // OPTIMIZED QUERY: Exclude 'items' to prevent timeout - items loaded separately in getById()
        const { data, error } = await supabase
          .from('orders')
          .select('id, order_number, customer_name, customer_email, customer_phone, delivery_address, delivery_city, delivery_county, delivery_postal_code, delivery_option, payment_method, payment_status, subtotal, delivery_cost, total, status, notes, created_at, updated_at, person_type, company_name, cui, reg_com, company_county, company_city, company_address')
          .order('created_at', { ascending: false })
          .limit(100); // Reasonable limit for list view
        
        if (error) {
          // Log error but don't throw - return empty array to prevent app crash
          console.error('❌ Supabase error fetching orders:', error);
          return [];
        }
        
        // Return full order data with itemsCount but empty items array
        const orders = (data || []).map((o) => ({
          id: o.id,
          orderNumber: o.order_number,
          customerName: o.customer_name,
          customerEmail: o.customer_email,
          customerPhone: o.customer_phone || '',
          deliveryAddress: o.delivery_address || '',
          deliveryCity: o.delivery_city || undefined,
          deliveryCounty: o.delivery_county || undefined,
          deliveryPostalCode: o.delivery_postal_code || undefined,
          deliveryOption: o.delivery_option || '',
          paymentMethod: o.payment_method || '',
          paymentStatus: (o.payment_status as 'paid' | 'unpaid') || 'unpaid',
          items: [], // Empty for list view - loaded separately in getById()
          itemsCount: 0, // Not fetched in list view to prevent timeout
          subtotal: Number(o.subtotal || 0),
          deliveryCost: Number(o.delivery_cost || 0),
          total: Number(o.total),
          status: o.status,
          notes: o.notes || undefined,
          createdAt: o.created_at,
          updatedAt: o.updated_at || undefined,
          personType: (o.person_type as 'fizica' | 'juridica') || undefined,
          companyName: o.company_name || undefined,
          cui: o.cui || undefined,
          regCom: o.reg_com || undefined,
          companyCounty: o.company_county || undefined,
          companyCity: o.company_city || undefined,
          companyAddress: o.company_address || undefined
        }));
        
        return orders;
      } catch (error) {
        console.error('❌ Error fetching orders:', error);
        // Return empty array instead of throwing to prevent app crash
        return [];
      }
    }
    
    return [];
  },

  async getById(id: string): Promise<Order | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (!data) return null;
        
        // Invoice data now comes directly from database columns
        return {
          id: data.id,
          orderNumber: data.order_number,
          customerName: data.customer_name,
          customerEmail: data.customer_email,
          customerPhone: data.customer_phone,
          deliveryAddress: data.delivery_address,
          deliveryCity: data.delivery_city || undefined,
          deliveryCounty: data.delivery_county || undefined,
          deliveryPostalCode: data.delivery_postal_code || undefined,
          deliveryOption: data.delivery_option,
          paymentMethod: data.payment_method,
          paymentStatus: data.payment_status || 'unpaid', // Default to 'unpaid' if null
          items: data.items || [],
          subtotal: Number(data.subtotal),
          deliveryCost: Number(data.delivery_cost),
          total: Number(data.total),
          status: data.status,
          notes: data.notes || undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          personType: data.person_type || undefined,
          companyName: data.company_name || undefined,
          cui: data.cui || undefined,
          regCom: data.reg_com || undefined,
          companyCounty: data.company_county || undefined,
          companyCity: data.company_city || undefined,
          companyAddress: data.company_address || undefined
        };
      } catch (error) {
        console.error('Supabase error:', error);
      }
    }
    
    return null;
  },

  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('orders')
          .insert({
            order_number: order.orderNumber,
            customer_name: order.customerName,
            customer_email: order.customerEmail,
            customer_phone: order.customerPhone,
            delivery_address: order.deliveryAddress,
            delivery_city: order.deliveryCity || null,
            delivery_county: order.deliveryCounty || null,
            delivery_postal_code: order.deliveryPostalCode || null,
            delivery_option: order.deliveryOption,
            payment_method: order.paymentMethod,
            payment_status: order.paymentStatus || null,
            items: order.items,
            subtotal: order.subtotal,
            delivery_cost: order.deliveryCost,
            total: order.total,
            status: order.status,
            notes: order.notes || null,
            // Invoice/company fields - now stored directly in database
            person_type: order.personType || null,
            company_name: order.companyName || null,
            cui: order.cui || null,
            reg_com: order.regCom || null,
            company_county: order.companyCounty || null,
            company_city: order.companyCity || null,
            company_address: order.companyAddress || null
          })
          .select()
          .single();
        
        if (error) {
          console.error('❌ Supabase error creating order:', error);
          throw error;
        }
        
        return {
          id: data.id,
          orderNumber: data.order_number,
          customerName: data.customer_name,
          customerEmail: data.customer_email,
          customerPhone: data.customer_phone,
          deliveryAddress: data.delivery_address,
          deliveryCity: data.delivery_city || undefined,
          deliveryCounty: data.delivery_county || undefined,
          deliveryPostalCode: data.delivery_postal_code || undefined,
          deliveryOption: data.delivery_option,
          paymentMethod: data.payment_method,
          paymentStatus: data.payment_status || 'unpaid', // Default to 'unpaid' if null
          items: data.items,
          subtotal: Number(data.subtotal),
          deliveryCost: Number(data.delivery_cost),
          total: Number(data.total),
          status: data.status,
          notes: data.notes || undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          personType: data.person_type || undefined,
          companyName: data.company_name || undefined,
          cui: data.cui || undefined,
          regCom: data.reg_com || undefined,
          companyCounty: data.company_county || undefined,
          companyCity: data.company_city || undefined,
          companyAddress: data.company_address || undefined
        };
      } catch (error) {
        console.error('❌ Error creating order:', error);
        throw error;
      }
    }
    
    throw new Error('Failed to create order: Supabase not configured');
  },

  async update(id: string, updates: Partial<Order>): Promise<Order> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const updateData: any = {};
        
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.notes !== undefined) updateData.notes = updates.notes || null;
        if (updates.customerName !== undefined) updateData.customer_name = updates.customerName;
        if (updates.customerEmail !== undefined) updateData.customer_email = updates.customerEmail;
        if (updates.customerPhone !== undefined) updateData.customer_phone = updates.customerPhone;
        if (updates.deliveryAddress !== undefined) updateData.delivery_address = updates.deliveryAddress;
        if (updates.deliveryCity !== undefined) updateData.delivery_city = updates.deliveryCity || null;
        if (updates.deliveryCounty !== undefined) updateData.delivery_county = updates.deliveryCounty || null;
        if (updates.deliveryPostalCode !== undefined) updateData.delivery_postal_code = updates.deliveryPostalCode || null;
        if (updates.deliveryOption !== undefined) updateData.delivery_option = updates.deliveryOption;
        if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;
        if (updates.paymentStatus !== undefined) updateData.payment_status = updates.paymentStatus || null;
        if (updates.items !== undefined) updateData.items = updates.items;
        if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal;
        if (updates.deliveryCost !== undefined) updateData.delivery_cost = updates.deliveryCost;
        if (updates.total !== undefined) updateData.total = updates.total;
        
        // Invoice/company fields - now stored directly in database
        if (updates.personType !== undefined) updateData.person_type = updates.personType || null;
        if (updates.companyName !== undefined) updateData.company_name = updates.companyName || null;
        if (updates.cui !== undefined) updateData.cui = updates.cui || null;
        if (updates.regCom !== undefined) updateData.reg_com = updates.regCom || null;
        if (updates.companyCounty !== undefined) updateData.company_county = updates.companyCounty || null;
        if (updates.companyCity !== undefined) updateData.company_city = updates.companyCity || null;
        if (updates.companyAddress !== undefined) updateData.company_address = updates.companyAddress || null;
        
        console.log(`📝 Updating order ${id.slice(-8)} with:`, Object.keys(updateData));
        if (updateData.notes) {
          const parsedNotes = JSON.parse(updateData.notes);
          console.log(`  📋 Setting ${parsedNotes.length} notes for order ${id.slice(-8)}`);
        }
        
        const { data, error } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('❌ Supabase error updating order:', error);
          throw error;
        }
        
        console.log(`✅ Database update confirmed for order ${data.id.slice(-8)}`);
        if (data.notes) {
          const parsedNotes = JSON.parse(data.notes);
          console.log(`  ✅ Database now has ${parsedNotes.length} notes for order ${data.id.slice(-8)}`);
        }
        
        return {
          id: data.id,
          orderNumber: data.order_number,
          customerName: data.customer_name,
          customerEmail: data.customer_email,
          customerPhone: data.customer_phone,
          deliveryAddress: data.delivery_address,
          deliveryCity: data.delivery_city || undefined,
          deliveryCounty: data.delivery_county || undefined,
          deliveryPostalCode: data.delivery_postal_code || undefined,
          deliveryOption: data.delivery_option,
          paymentMethod: data.payment_method,
          paymentStatus: data.payment_status || 'unpaid', // Default to 'unpaid' if null
          items: data.items,
          subtotal: Number(data.subtotal),
          deliveryCost: Number(data.delivery_cost),
          total: Number(data.total),
          status: data.status,
          notes: data.notes || undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          personType: data.person_type || undefined,
          companyName: data.company_name || undefined,
          cui: data.cui || undefined,
          regCom: data.reg_com || undefined,
          companyCounty: data.company_county || undefined,
          companyCity: data.company_city || undefined,
          companyAddress: data.company_address || undefined
        };
      } catch (error) {
        console.error('❌ Error updating order:', error);
        throw error;
      }
    }
    
    throw new Error('Failed to update order: Supabase not configured');
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return;
      } catch (error) {
        console.error('Supabase error:', error);
      }
    }
  },

  async deleteMultiple(ids: string[]): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('orders')
          .delete()
          .in('id', ids);
        
        if (error) throw error;
        return;
      } catch (error) {
        console.error('Supabase error:', error);
      }
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
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt?: string;
}

export const clientsService = {
  async getAll(): Promise<Client[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000); // Limit to prevent statement timeout
        
        if (error) throw error;
        
        return (data || []).map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          address: c.address || undefined,
          totalOrders: c.total_orders,
          totalSpent: Number(c.total_spent),
          createdAt: c.created_at,
          updatedAt: c.updated_at
        }));
      } catch (error) {
        console.error('Supabase error:', error);
      }
    }
    
    return [];
  },

  async getById(id: string): Promise<Client | null> {
    const clients = await this.getAll();
    return clients.find(c => c.id === id) || null;
  },

  async getByEmail(email: string): Promise<Client | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('email', email)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
        
        return data ? {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address || undefined,
          totalOrders: data.total_orders,
          totalSpent: Number(data.total_spent),
          createdAt: data.created_at,
          updatedAt: data.updated_at
        } : null;
      } catch (error) {
        console.error('Supabase error:', error);
      }
    }
    
    const clients = await this.getAll();
    return clients.find(c => c.email === email) || null;
  },

  async create(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('clients')
          .insert({
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address || null,
            total_orders: client.totalOrders,
            total_spent: client.totalSpent
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address || undefined,
          totalOrders: data.total_orders,
          totalSpent: Number(data.total_spent),
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      } catch (error) {
        console.error('Supabase error:', error);
      }
    }
    
    return {} as Client;
  },

  async update(id: string, updates: Partial<Client>): Promise<Client> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const updateData: any = {};
        
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.email !== undefined) updateData.email = updates.email;
        if (updates.phone !== undefined) updateData.phone = updates.phone;
        if (updates.address !== undefined) updateData.address = updates.address || null;
        if (updates.totalOrders !== undefined) updateData.total_orders = updates.totalOrders;
        if (updates.totalSpent !== undefined) updateData.total_spent = updates.totalSpent;
        
        const { data, error } = await supabase
          .from('clients')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address || undefined,
          totalOrders: data.total_orders,
          totalSpent: Number(data.total_spent),
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      } catch (error) {
        console.error('Supabase error:', error);
      }
    }
    
    return {} as Client;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return;
      } catch (error) {
        console.error('Supabase error:', error);
      }
    }
  }
};

// ===== BLOG POSTS SERVICE =====
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

export const blogPostsService = {
  async getAll(): Promise<BlogPost[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500); // Limit to prevent statement timeout
        
        if (error) {
          // Silently fall back to localStorage if table doesn't exist
          if (error.code === 'PGRST205') {
            // Table not found - using localStorage fallback
          } else {
            console.error('Supabase error:', error.message);
          }
          throw error;
        }
        
        return (data || []).map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          content: p.content,
          image: p.image,
          category: p.category,
          author: p.author,
          publishDate: p.publish_date,
          isPublished: p.is_published,
          views: p.views || 0,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));
      } catch (error) {
        // Silently use localStorage fallback
      }
    }
    
    return [];
  },

  async getById(id: string): Promise<BlogPost | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        return data ? {
          id: data.id,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          image: data.image,
          category: data.category,
          author: data.author,
          publishDate: data.publish_date,
          isPublished: data.is_published,
          views: data.views || 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        } : null;
      } catch (error) {
        // Silently use localStorage fallback
      }
    }
    
    const posts = await this.getAll();
    return posts.find(p => p.id === id) || null;
  },

  async create(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<BlogPost> {
    console.log('📝 blogPostsService.create called with:', post);
    console.log('📝 Supabase configured:', isSupabaseConfigured());
    
    if (isSupabaseConfigured()) {
      try {
        console.log('📝 Attempting Supabase insert...');
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('blog_posts')
          .insert({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            image: post.image,
            category: post.category,
            author: post.author,
            publish_date: post.publishDate,
            is_published: post.isPublished,
            views: 0
          })
          .select()
          .single();
        
        if (error) {
          console.log('📝 Supabase error:', error);
          throw error;
        }
        
        console.log('✅ Supabase insert successful:', data);
        return {
          id: data.id,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          image: data.image,
          category: data.category,
          author: data.author,
          publishDate: data.publish_date,
          isPublished: data.is_published,
          views: data.views || 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      } catch (error) {
        console.log('📝 Caught error, falling back to localStorage:', error);
        // Silently use localStorage fallback
      }
    }
    
    return {} as BlogPost;
  },

  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const updateData: any = {};
        
        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.slug !== undefined) updateData.slug = updates.slug;
        if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt;
        if (updates.content !== undefined) updateData.content = updates.content;
        if (updates.image !== undefined) updateData.image = updates.image;
        if (updates.category !== undefined) updateData.category = updates.category;
        if (updates.author !== undefined) updateData.author = updates.author;
        if (updates.publishDate !== undefined) updateData.publish_date = updates.publishDate;
        if (updates.isPublished !== undefined) updateData.is_published = updates.isPublished;
        if (updates.views !== undefined) updateData.views = updates.views;
        
        const { data, error } = await supabase
          .from('blog_posts')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          image: data.image,
          category: data.category,
          author: data.author,
          publishDate: data.publish_date,
          isPublished: data.is_published,
          views: data.views || 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      } catch (error) {
        // Silently use localStorage fallback
      }
    }
    
    return {} as BlogPost;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return;
      } catch (error) {
        // Silently use localStorage fallback
      }
    }
  }
};

// ===== HERO SLIDES SERVICE =====
export interface HeroSlide {
  id: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string; // Legacy - thumbnail or full URL
  imageUrls?: {            // Optimized versions
    original: string;
    medium: string;
    thumbnail: string;
  };
  order: number;
}

export const heroSlidesService = {
  async getAll(): Promise<HeroSlide[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const supabase = getSupabase();
      
      // Just select without ordering by display_order since that column doesn't exist
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100); // Limit to prevent statement timeout (hero slides are small dataset)
      
      if (error) {
        console.error('Error fetching hero slides:', error);
        return [];
      }
      
      return (data || []).map((slide, index) => ({
        id: slide.id,
        // Map subtitle to title since we renamed it
        title: slide.subtitle || slide.title || '',
        buttonText: slide.button_text || '',
        buttonLink: slide.button_link || '',
        // Handle different possible column names for the image
        backgroundImage: slide.image || slide.image_url || slide.background_image || '',
        order: slide.display_order ?? index + 1
      }));
    } catch (error) {
      console.error('Error fetching hero slides:', error);
      return [];
    }
  },

  async create(slide: Omit<HeroSlide, 'id'>): Promise<HeroSlide> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    try {
      const supabase = getSupabase();
      
      // Try different possible column combinations
      let insertData: any = {
        title: slide.title,
        subtitle: slide.title,
        button_text: slide.buttonText,
        button_link: slide.buttonLink,
      };
      
      let { data, error } = await supabase
        .from('hero_slides')
        .insert({
          ...insertData,
          image: slide.backgroundImage,
          display_order: slide.order || 1
        })
        .select()
        .single();
      
      // If image column doesn't exist, try background_image
      if (error && error.message.includes('image')) {
        console.log('image column not found, trying background_image');
        const result = await supabase
          .from('hero_slides')
          .insert({
            ...insertData,
            background_image: slide.backgroundImage,
            display_order: slide.order || 1
          })
          .select()
          .single();
        data = result.data;
        error = result.error;
      }
      
      // If display_order column doesn't exist, retry without it
      if (error && error.message.includes('display_order')) {
        console.log('display_order column not found, retrying without it');
        const result = await supabase
          .from('hero_slides')
          .insert({
            ...insertData,
            background_image: slide.backgroundImage
          })
          .select()
          .single();
        data = result.data;
        error = result.error;
      }
      
      // If still error and it's about image_url, try that
      if (error && error.message.includes('background_image')) {
        console.log('background_image column not found, trying image_url');
        const result = await supabase
          .from('hero_slides')
          .insert({
            ...insertData,
            image_url: slide.backgroundImage
          })
          .select()
          .single();
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title || data.subtitle || '',
        buttonText: data.button_text || '',
        buttonLink: data.button_link || '',
        backgroundImage: data.background_image || data.image || data.image_url || '',
        order: data.display_order || 0
      };
    } catch (error) {
      console.error('Error creating hero slide:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<HeroSlide>): Promise<HeroSlide> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    try {
      const supabase = getSupabase();
      
      console.log('🔍 HeroSlide Update - Incoming updates:', updates);
      
      // First, get the current slide data to preserve fields we're not updating
      const { data: currentSlide, error: fetchError } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      console.log('🔍 Current slide in database:', currentSlide);
      
      const updateData: any = {};
      
      if (updates.title !== undefined) {
        updateData.title = updates.title;
        updateData.subtitle = updates.title;
      }
      if (updates.buttonText !== undefined) updateData.button_text = updates.buttonText;
      if (updates.buttonLink !== undefined) updateData.button_link = updates.buttonLink;
      if (updates.order !== undefined) {
        // Try to update order if the column exists
        // We'll handle the error gracefully if it doesn't
        updateData.display_order = updates.order;
      }

      console.log('🔍 Update data being sent to Supabase:', updateData);

      let { data, error } = await supabase
        .from('hero_slides')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      // If display_order column doesn't exist, retry without it
      if (error && error.message.includes('display_order')) {
        console.log('display_order column not found, retrying without it');
        delete updateData.display_order;
        const result = await supabase
          .from('hero_slides')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      
      console.log('🔍 Updated slide from database:', data);
      
      // Merge the updated data with the preserved current slide data
      const result = {
        id: data.id,
        title: data.title || data.subtitle || currentSlide.title || currentSlide.subtitle || '',
        buttonText: data.button_text || currentSlide.button_text || '',
        buttonLink: data.button_link || currentSlide.button_link || '',
        backgroundImage: data.image_url || data.background_image || data.image || 
                        currentSlide.image_url || currentSlide.background_image || currentSlide.image || '',
        order: data.display_order ?? currentSlide.display_order ?? updates.order ?? 0
      };
      
      console.log('🔍 Returning merged slide:', result);
      
      return result;
    } catch (error) {
      console.error('Error updating hero slide:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('Hero slide deleted successfully');
    } catch (error) {
      console.error('Error deleting hero slide:', error);
      throw error;
    }
  }
};

// ===== ADMIN USERS SERVICE =====
export interface AdminUser {
  id: string;
  username: string;
  password: string; // NOTE: In production, this should be hashed!
  fullName: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  isActive: boolean;
}

export const adminUsersService = {
  async getAll(): Promise<AdminUser[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200); // Limit to prevent statement timeout
        
        if (error) throw error;
        
        return (data || []).map(u => ({
          id: u.id,
          username: u.username,
          password: u.password,
          fullName: u.name || u.full_name,
          email: u.email,
          role: u.role,
          isActive: u.is_active
        }));
      } catch (error) {
        console.error('Supabase error for users, falling back to localStorage:', error);
      }
    }
    
    return [];
  },

  async create(user: Omit<AdminUser, 'id'>): Promise<AdminUser> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('users')
          .insert({
            username: user.username,
            password: user.password,
            name: user.fullName,
            email: user.email,
            role: user.role,
            is_active: user.isActive
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          username: data.username,
          password: data.password,
          fullName: data.name || data.full_name,
          email: data.email,
          role: data.role,
          isActive: data.is_active
        };
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
      }
    }
    
    return {} as AdminUser;
  },

  async update(id: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const updateData: any = {};
        
        if (updates.username !== undefined) updateData.username = updates.username;
        if (updates.password !== undefined) updateData.password = updates.password;
        if (updates.fullName !== undefined) updateData.name = updates.fullName;
        if (updates.email !== undefined) updateData.email = updates.email;
        if (updates.role !== undefined) updateData.role = updates.role;
        if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

        const { data, error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          username: data.username,
          password: data.password,
          fullName: data.name || data.full_name,
          email: data.email,
          role: data.role,
          isActive: data.is_active
        };
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
      }
    }
    
    return {} as AdminUser;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return;
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
      }
    }
  }
};

// ===== CANVAS SIZES SERVICE =====
export interface CanvasSize {
  id: string;
  width: number;
  height: number;
  price: number;
  discount: number;
  isActive: boolean;
  framePrices?: Record<string, { 
    price: number; 
    discount: number;
    availableForCanvas?: boolean;
    availableForPrint?: boolean;
  }>; // Frame prices per size
}

export const canvasSizesService = {
  async getAll(): Promise<CanvasSize[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('sizes')
          .select('*')
          .order('width', { ascending: true })
          .limit(100); // Limit to prevent statement timeout
        
        if (error) throw error;
        
        console.log('📥 [dataService.getAll] Loaded sizes from database:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('📥 [dataService.getAll] Sample size:', JSON.stringify(data[0], null, 2));
          console.log('📥 [dataService.getAll] Sample frame_prices:', JSON.stringify(data[0].frame_prices, null, 2));
        }
        
        return (data || []).map(s => ({
          id: s.id,
          width: s.width,
          height: s.height,
          price: Number(s.price),
          discount: s.discount || 0,
          isActive: s.is_active,
          supportsPrintCanvas: s.supports_print_canvas ?? true, // Default to true for backwards compatibility
          supportsPrintHartie: s.supports_print_hartie ?? true, // Default to true for backwards compatibility
          framePrices: s.frame_prices || {}
        }));
      } catch (error) {
        console.error('Supabase error for sizes, falling back to localStorage:', error);
      }
    }
    
    return [];
  },

  async create(size: Omit<CanvasSize, 'id'>): Promise<CanvasSize> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const insertData = {
          width: size.width,
          height: size.height,
          price: size.price,
          discount: size.discount || 0,
          is_active: size.isActive,
          supports_print_canvas: size.supportsPrintCanvas !== false,
          supports_print_hartie: size.supportsPrintHartie !== false,
          frame_prices: size.framePrices || {}
        };
        
        console.log('🟢 [dataService.create] Creating size with data:', JSON.stringify(insertData, null, 2));
        
        const { data, error } = await supabase
          .from('sizes')
          .insert(insertData)
          .select()
          .single();
        
        if (error) throw error;
        
        console.log('✅ [dataService.create] Response from database:', JSON.stringify(data, null, 2));
        
        return {
          id: data.id,
          width: data.width,
          height: data.height,
          price: Number(data.price),
          discount: data.discount || 0,
          isActive: data.is_active,
          supportsPrintCanvas: data.supports_print_canvas !== false,
          supportsPrintHartie: data.supports_print_hartie !== false,
          framePrices: data.frame_prices || {}
        };
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
      }
    }
    
    return {} as CanvasSize;
  },

  async update(id: string, updates: Partial<CanvasSize>): Promise<CanvasSize> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const updateData: any = {};
        
        if (updates.width !== undefined) updateData.width = updates.width;
        if (updates.height !== undefined) updateData.height = updates.height;
        if (updates.price !== undefined) updateData.price = updates.price;
        if (updates.discount !== undefined) updateData.discount = updates.discount;
        if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
        if (updates.supportsPrintCanvas !== undefined) updateData.supports_print_canvas = updates.supportsPrintCanvas;
        if (updates.supportsPrintHartie !== undefined) updateData.supports_print_hartie = updates.supportsPrintHartie;
        if (updates.framePrices !== undefined) updateData.frame_prices = updates.framePrices;

        console.log('🔵 [dataService.update] Updating size:', id);
        console.log('🔵 [dataService.update] Update data being sent:', JSON.stringify(updateData, null, 2));

        const { data, error } = await supabase
          .from('sizes')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('❌ Supabase update error:', error);
          throw error;
        }
        
        console.log('✅ [dataService.update] Response from database:', JSON.stringify(data, null, 2));
        
        return {
          id: data.id,
          width: data.width,
          height: data.height,
          price: Number(data.price),
          discount: data.discount || 0,
          isActive: data.is_active,
          supportsPrintCanvas: data.supports_print_canvas ?? true,
          supportsPrintHartie: data.supports_print_hartie ?? true,
          framePrices: data.frame_prices || {}
        };
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
        throw error;
      }
    }
    
    return {} as CanvasSize;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('sizes')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return;
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
      }
    }
  }
};

// ===== FRAME TYPES SERVICE =====
export interface FrameType {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}

export const frameTypesService = {
  async getAll(): Promise<FrameType[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('frame_types')
          .select('*')
          .order('order', { ascending: true })
          .limit(50);
        
        if (error) throw error;
        
        return (data || []).map(f => ({
          id: f.id,
          name: f.name,
          isActive: f.is_active,
          order: f.order || 0
        }));
      } catch (error) {
        console.error('Supabase error for frame types, falling back to localStorage:', error);
      }
    }
    
    return [];
  },

  async create(frameType: Omit<FrameType, 'id'>): Promise<FrameType> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        
        // Generate ID: Find max frame number and increment
        const { data: existingFrames } = await supabase
          .from('frame_types')
          .select('id')
          .order('id', { ascending: false })
          .limit(1);
        
        let nextId = 'frame-1';
        if (existingFrames && existingFrames.length > 0) {
          const lastId = existingFrames[0].id;
          const match = lastId.match(/frame-(\d+)/);
          if (match) {
            const lastNum = parseInt(match[1]);
            nextId = `frame-${lastNum + 1}`;
          }
        }
        
        const { data, error } = await supabase
          .from('frame_types')
          .insert({
            id: nextId,
            name: frameType.name,
            is_active: frameType.isActive,
            order: frameType.order || 0
          })
          .select()
          .single();
        
        if (error) {
          console.error('Supabase error creating frame type:', error);
          throw error;
        }
        
        return {
          id: data.id,
          name: data.name,
          isActive: data.is_active,
          order: data.order || 0
        };
      } catch (error) {
        console.error('Supabase error creating frame type:', error);
        throw error;
      }
    }
    
    throw new Error('Supabase not configured');
  },

  async update(id: string, updates: Partial<FrameType>): Promise<FrameType> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const updateData: any = {};
        
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
        if (updates.order !== undefined) updateData.order = updates.order;

        const { data, error } = await supabase
          .from('frame_types')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('❌ Supabase update error:', error);
          throw error;
        }
        
        return {
          id: data.id,
          name: data.name,
          isActive: data.is_active,
          order: data.order || 0
        };
      } catch (error) {
        console.error('Supabase error updating frame type:', error);
        throw error;
      }
    }
    
    return {} as FrameType;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('frame_types')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return;
      } catch (error) {
        console.error('Supabase error deleting frame type:', error);
      }
    }
  }
};

// ===== CATEGORIES SERVICE =====
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true })
          .limit(100); // Limit to prevent statement timeout
        
        if (error) throw error;
        
        return (data || []).map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || undefined,
          isActive: c.is_active
        }));
      } catch (error) {
        console.error('Supabase error for categories, falling back to localStorage:', error);
      }
    }
    
    return [];
  },

  async create(category: Omit<Category, 'id'>): Promise<Category> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: category.name,
            slug: category.slug,
            description: category.description,
            is_active: category.isActive
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          isActive: data.is_active
        };
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
      }
    }
    
    return {} as Category;
  },

  async update(id: string, updates: Partial<Category>): Promise<Category> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const updateData: any = {};
        
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.slug !== undefined) updateData.slug = updates.slug;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

        const { data, error } = await supabase
          .from('categories')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          isActive: data.is_active
        };
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
      }
    }
    
    return {} as Category;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return;
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
      }
    }
  }
};

// ===== SUBCATEGORIES SERVICE =====
export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export const subcategoriesService = {
  async getAll(): Promise<Subcategory[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('subcategories')
          .select('*')
          .order('name', { ascending: true })
          .limit(200); // Limit to prevent statement timeout
        
        if (error) throw error;
        
        return (data || []).map(s => ({
          id: s.id,
          categoryId: s.category_id,
          name: s.name,
          slug: s.slug,
          description: s.description || undefined,
          isActive: s.is_active
        }));
      } catch (error) {
        console.error('Supabase error for subcategories, falling back to localStorage:', error);
      }
    }
    
    return [];
  },

  async create(subcategory: Omit<Subcategory, 'id'>): Promise<Subcategory> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('subcategories')
          .insert({
            category_id: subcategory.categoryId,
            name: subcategory.name,
            slug: subcategory.slug,
            description: subcategory.description,
            is_active: subcategory.isActive
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          categoryId: data.category_id,
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          isActive: data.is_active
        };
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
      }
    }
    
    return {} as Subcategory;
  },

  async update(id: string, updates: Partial<Subcategory>): Promise<Subcategory> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const updateData: any = {};
        
        if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.slug !== undefined) updateData.slug = updates.slug;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

        const { data, error } = await supabase
          .from('subcategories')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          categoryId: data.category_id,
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          isActive: data.is_active
        };
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
      }
    }
    
    return {} as Subcategory;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('subcategories')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return;
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
      }
    }
  }
};