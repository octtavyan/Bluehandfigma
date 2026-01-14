import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { paintingsService, ordersService, clientsService, blogPostsService, heroSlidesService, adminUsersService, canvasSizesService, frameTypesService, categoriesService, subcategoriesService } from '../lib/dataService';
import { isSupabaseConfigured, getSupabase } from '../lib/supabase';
import { toast } from 'sonner';
import { notificationService } from '../services/notificationService';
import { CacheService, CACHE_KEYS, CACHE_TTL } from '../lib/cacheService';

export type UserRole = 'full-admin' | 'account-manager' | 'production';
export type OrderStatus = 'new' | 'queue' | 'in-production' | 'delivered' | 'returned' | 'closed';

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
  }>; // Frame prices per size with availability flags
}

export interface FrameType {
  id: string;
  name: string;
  isActive: boolean;
  order: number; // Display order
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  email: string;
  isActive: boolean;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  changedBy: string;
  reason: string;
}

export interface OrderNote {
  id: string;
  text: string;
  createdAt: Date;
  createdBy: string;
  createdByRole: UserRole;
  isRead: boolean;
  readBy?: string[];
  status: 'open' | 'closed';
  closedAt?: Date;
  closedBy?: string;
}

export interface CanvasItemBase {
  price: number;
}

export interface PersonalizedCanvasItem extends CanvasItemBase {
  type: 'personalized';
  originalImage: string; // Legacy - thumbnail for backwards compatibility
  croppedImage: string;  // Legacy - thumbnail for backwards compatibility
  imageUrls?: { // New optimized images
    original: string;
    medium: string;
    thumbnail: string;
  };
  croppedImageUrls?: { // New optimized cropped images
    original: string;
    medium: string;
    thumbnail: string;
  };
  size: string;
  orientation: 'portrait' | 'landscape';
}

export interface PaintingCanvasItem extends CanvasItemBase {
  type: 'painting';
  paintingId: string;
  paintingTitle: string;
  image: string;
  size: string;
  quantity: number;
  printType?: 'Print Canvas' | 'Print Hartie'; // Print type selection
  frameType?: string; // Frame type ID
}

export type CanvasItemType = PersonalizedCanvasItem | PaintingCanvasItem;

export interface OrderItem {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  orderDate: Date;
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
  canvasItems: CanvasItemType[];
  totalPrice: number;
  deliveryMethod: 'express' | 'standard' | 'economic';
  paymentMethod: 'card' | 'cash';
  paymentStatus: 'paid' | 'unpaid';
  notes: string; // Legacy - keep for backwards compatibility
  orderNotes?: OrderNote[]; // New structured notes system
  // Company/Invoice fields (optional)
  personType?: 'fizica' | 'juridica';
  companyName?: string;
  cui?: string;
  regCom?: string;
  companyCounty?: string;
  companyCity?: string;
  companyAddress?: string;
  // FAN Courier AWB fields (optional - for shipping integration)
  awbNumber?: string;
  awbGeneratedAt?: string;
  awbStatus?: 'pending' | 'in_transit' | 'delivered' | 'returned' | 'cancelled';
  awbTrackingUrl?: string;
  awbLastUpdate?: string;
  // Shipping details for AWB generation
  packageWeight?: number; // kg
  packageDimensions?: {
    length: number; // cm
    height: number; // cm
    width: number; // cm
  };
}

export interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  registeredDate: Date;
  totalOrders: number;
  totalSpent: number;
}

export interface CategoryData {
  id: string;
  name: string;
}

export interface SubcategoryData {
  id: string;
  name: string;
}

export interface CanvasPainting {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  image: string; // Legacy - thumbnail URL for backwards compatibility
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
  description?: string;
  createdAt?: string;
  orientation?: 'portrait' | 'landscape' | 'square';
  dominantColor?: string;
  printTypes?: ('Print Hartie' | 'Print Canvas')[];
  frameTypesByPrintType?: {
    'Print Hartie': string[];
    'Print Canvas': string[]
  };
}

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

interface AdminContextType {
  currentUser: AdminUser | null;
  login: (username: string, password: string, rememberMe?: boolean) => boolean;
  logout: () => void;
  orders: OrderItem[];
  clients: Client[];
  users: AdminUser[];
  sizes: CanvasSize[];
  frameTypes: FrameType[];
  categories: CategoryData[];
  subcategories: SubcategoryData[];
  paintings: CanvasPainting[];
  heroSlides: HeroSlide[];
  blogPosts: BlogPost[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  checkForNewOrders: () => Promise<void>;
  loadOrderDetails: (orderId: string) => Promise<void>;
  addCategory: (category: string) => Promise<void>;
  updateCategory: (categoryId: string, newName: string) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addSubcategory: (subcategory: string) => Promise<void>;
  updateSubcategory: (subcategoryId: string, newName: string) => Promise<void>;
  deleteSubcategory: (subcategoryId: string) => Promise<void>;
  addPainting: (painting: Omit<CanvasPainting, 'id'>) => Promise<void>;
  updatePainting: (paintingId: string, updates: Partial<CanvasPainting>) => Promise<void>;
  deletePainting: (paintingId: string) => Promise<void>;
  getPaintingsByCategory: (category: string) => CanvasPainting[];
  getBestsellers: () => CanvasPainting[];
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => Promise<void>;
  updateHeroSlide: (slideId: string, updates: Partial<HeroSlide>) => Promise<void>;
  deleteHeroSlide: (slideId: string) => Promise<void>;
  addBlogPost: (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => Promise<void>;
  updateBlogPost: (postId: string, updates: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (postId: string) => Promise<void>;
  addOrder: (order: Omit<OrderItem, 'id' | 'orderDate' | 'status' | 'statusHistory'>, options?: { skipReload?: boolean }) => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, reason?: string, changedBy?: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  updateClient: (clientId: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
  addUser: (user: Omit<AdminUser, 'id'>) => Promise<void>;
  updateUser: (userId: string, updates: Partial<AdminUser>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  getClientOrders: (clientId: string) => OrderItem[];
  updateOrderNotes: (orderId: string, notes: string) => Promise<void>;
  addOrderNote: (orderId: string, text: string) => Promise<void>;
  markNoteAsRead: (orderId: string, noteId: string) => void;
  closeOrderNote: (orderId: string, noteId: string) => void;
  addSize: (size: Omit<CanvasSize, 'id'>) => Promise<void>;
  updateSize: (sizeId: string, updates: Partial<CanvasSize>) => Promise<void>;
  deleteSize: (sizeId: string) => Promise<void>;
  getSizeByDimensions: (width: number, height: number) => CanvasSize | undefined;
  getSizeById: (sizeId: string) => CanvasSize | undefined;
  getSizesByIds: (sizeIds: string[]) => CanvasSize[];
  getDiscountForSize: (sizeId: string) => number;
  addFrameType: (frameType: Omit<FrameType, 'id'>) => Promise<void>;
  updateFrameType: (frameTypeId: string, updates: Partial<FrameType>) => Promise<void>;
  deleteFrameType: (frameTypeId: string) => Promise<void>;
  getFrameTypeById: (frameTypeId: string) => FrameType | undefined;
  getFrameTypesByIds: (frameTypeIds: string[]) => FrameType[];
  getFramePriceForSize: (sizeId: string, frameTypeId: string) => { 
    price: number; 
    discount: number;
    availableForCanvas?: boolean;
    availableForPrint?: boolean;
  };
  getUnreadNotesCount: (orderId: string) => number;
  getTotalNotesCount: (orderId: string) => number;
  // FAN Courier AWB functions
  generateAWB: (orderId: string) => Promise<{ success: boolean; awb?: string; error?: string }>;
  updateAWBTracking: (orderId: string) => Promise<void>;
  downloadAWBLabel: (orderId: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [paintings, setPaintings] = useState<CanvasPainting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: 'admin-1',
      username: 'admin',
      password: 'admin123',
      role: 'full-admin',
      fullName: 'Administrator',
      email: 'admin@bluehand.ro',
      isActive: true
    },
    {
      id: 'account-1',
      username: 'account',
      password: 'account123',
      role: 'account-manager',
      fullName: 'Maria Ionescu',
      email: 'account@bluehand.ro',
      isActive: true
    },
    {
      id: 'production-1',
      username: 'production',
      password: 'production123',
      role: 'production',
      fullName: 'Ion Popescu',
      email: 'production@bluehand.ro',
      isActive: true
    },
  ]);

  const [sizes, setSizes] = useState<CanvasSize[]>([
    { id: 'size-1', width: 10, height: 14, price: 69.00, discount: 0, isActive: true },
    { id: 'size-2', width: 20, height: 30, price: 59.65, discount: 24, isActive: true },
    { id: 'size-3', width: 30, height: 40, price: 89.99, discount: 26, isActive: true },
    { id: 'size-4', width: 30, height: 50, price: 129.99, discount: 24, isActive: true },
    { id: 'size-5', width: 35, height: 50, price: 139.99, discount: 29, isActive: true },
    { id: 'size-6', width: 40, height: 60, price: 140.99, discount: 30, isActive: true },
    { id: 'size-7', width: 50, height: 70, price: 176.66, discount: 23, isActive: true },
    { id: 'size-8', width: 50, height: 80, price: 249.00, discount: 0, isActive: true },
    { id: 'size-9', width: 50, height: 90, price: 263.00, discount: 0, isActive: true },
    { id: 'size-10', width: 60, height: 90, price: 266.66, discount: 11, isActive: true },
    { id: 'size-11', width: 70, height: 100, price: 299.99, discount: 13, isActive: true },
    { id: 'size-12', width: 80, height: 120, price: 377.69, discount: 17, isActive: true },
    { id: 'size-13', width: 90, height: 120, price: 466.00, discount: 0, isActive: true },
    { id: 'size-14', width: 100, height: 150, price: 580.00, discount: 0, isActive: true },
    { id: 'size-15', width: 100, height: 160, price: 691.00, discount: 0, isActive: true },
    { id: 'size-16', width: 140, height: 160, price: 888.54, discount: 8, isActive: true },
    { id: 'size-17', width: 140, height: 200, price: 1190.00, discount: 0, isActive: true },
  ]);

  const [frameTypes, setFrameTypes] = useState<FrameType[]>([
    { id: 'frame-1', name: 'Fara Rama', price: 0, discount: 0, isActive: true, order: 1 },
    { id: 'frame-2', name: 'Alba', price: 50.00, discount: 0, isActive: true, order: 2 },
    { id: 'frame-3', name: 'Neagra', price: 50.00, discount: 0, isActive: true, order: 3 },
    { id: 'frame-4', name: 'Rosie', price: 60.00, discount: 10, isActive: true, order: 4 },
    { id: 'frame-5', name: 'Lemn Natural', price: 75.00, discount: 0, isActive: true, order: 5 },
  ]);

  const [categories, setCategories] = useState<CategoryData[]>([
    { id: 'category-1', name: 'Living' },
    { id: 'category-2', name: 'Dormitor' },
    { id: 'category-3', name: 'Sufragerie' },
    { id: 'category-4', name: 'Bucătărie' },
    { id: 'category-5', name: 'Birou' },
    { id: 'category-6', name: 'Baie' },
  ]);

  const [subcategories, setSubcategories] = useState<SubcategoryData[]>([
    { id: 'subcategory-1', name: 'Modern' },
    { id: 'subcategory-2', name: 'Clasic' },
    { id: 'subcategory-3', name: 'Minimalist' },
    { id: 'subcategory-4', name: 'Abstract' },
    { id: 'subcategory-5', name: 'Romantic' },
    { id: 'subcategory-6', name: 'Relaxant' },
    { id: 'subcategory-7', name: 'Inspirațional' },
    { id: 'subcategory-8', name: 'Neutru' },
    { id: 'subcategory-9', name: 'Elegant' },
    { id: 'subcategory-10', name: 'Traditional' },
    { id: 'subcategory-11', name: 'Contemporan' },
    { id: 'subcategory-12', name: 'Rustic' },
    { id: 'subcategory-13', name: 'Culinar' },
    { id: 'subcategory-14', name: 'Fresh' },
    { id: 'subcategory-15', name: 'Vintage' },
    { id: 'subcategory-16', name: 'Colorat' },
    { id: 'subcategory-17', name: 'Motivațional' },
    { id: 'subcategory-18', name: 'Professional' },
    { id: 'subcategory-19', name: 'Creativ' },
    { id: 'subcategory-20', name: 'Minimal' },
    { id: 'subcategory-21', name: 'Relaxare' },
    { id: 'subcategory-22', name: 'Spa' },
    { id: 'subcategory-23', name: 'Marin' },
    { id: 'subcategory-24', name: 'Natura' },
  ]);

  // Hero slides - loaded from Supabase or localStorage
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  // Blog posts - loaded from Supabase or localStorage
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // Convert dataService types to AdminContext types
  const convertPaintingFromService = (p: Painting, availableSizes?: CanvasSize[]): CanvasPainting => {
    return {
      id: p.id,
      title: p.title,
      category: p.category,
      subcategory: p.subcategory || '',
      image: p.image,
      imageUrls: p.imageUrls,
      availableSizes: p.availableSizes, // SIMPLIFIED: Just pass through array of size IDs
      price: p.price,
      discount: p.discount,
      isBestseller: p.isBestseller,
      isActive: p.isActive,
      description: p.description,
      createdAt: p.createdAt,
      orientation: p.orientation,
      dominantColor: p.dominantColor,
      printTypes: p.printTypes || [],
      frameTypesByPrintType: p.frameTypesByPrintType || { 'Print Hartie': [], 'Print Canvas': [] }
    };
  };

  const convertPaintingToService = (p: Omit<CanvasPainting, 'id'>): Omit<Painting, 'id' | 'createdAt'> => ({
    title: p.title,
    category: p.category,
    subcategory: p.subcategory,
    description: p.description,
    image: p.image,
    imageUrls: p.imageUrls,
    availableSizes: p.availableSizes, // SIMPLIFIED: Just pass through array of size IDs
    price: p.price,
    discount: p.discount,
    isBestseller: p.isBestseller,
    isActive: p.isActive,
    orientation: p.orientation,
    dominantColor: p.dominantColor,
    printTypes: p.printTypes,
    frameTypesByPrintType: p.frameTypesByPrintType
  });

  // Load all data from services WITH CACHING to reduce bandwidth
  const loadData = async () => {
    setIsLoading(true);
    
    // Initialize storage bucket (async, non-blocking)
    if (isSupabaseConfigured()) {
      import('../lib/storageInit').then(({ initializeStorageBucket }) => {
        initializeStorageBucket().catch(() => {});
      });
    }
    
    try {
      // Try cache first for each resource
      const cachedPaintings = CacheService.get<any[]>(CACHE_KEYS.PAINTINGS);
      const cachedClients = CacheService.get<any[]>(CACHE_KEYS.CLIENTS);
      const cachedOrders = CacheService.get<any[]>(CACHE_KEYS.ORDERS);
      const cachedBlogPosts = CacheService.get<any[]>(CACHE_KEYS.BLOG_POSTS);
      const cachedHeroSlides = CacheService.get<any[]>(CACHE_KEYS.HERO_SLIDES);
      const cachedUsers = CacheService.get<any[]>(CACHE_KEYS.USERS);
      const cachedSizes = CacheService.get<any[]>(CACHE_KEYS.SIZES);
      const cachedCategories = CacheService.get<any[]>(CACHE_KEYS.CATEGORIES);
      const cachedSubcategories = CacheService.get<any[]>(CACHE_KEYS.SUBCATEGORIES);

      // ⚠️ CRITICAL: Load canvas sizes FIRST (paintings need sizes to match sizeId)
      let sizesData;
      if (cachedSizes) {
        sizesData = cachedSizes;
        console.log('✅ Using cached sizes');
      } else {
        console.log('📡 Fetching sizes from Supabase...');
        sizesData = await canvasSizesService.getAll();
        CacheService.set(CACHE_KEYS.SIZES, sizesData, CACHE_TTL.SIZES);
      }
      const convertedSizes = sizesData.length > 0 ? sizesData.map(s => ({
        id: s.id,
        width: s.width,
        height: s.height,
        price: s.price,
        discount: s.discount || 0,
        isActive: s.isActive !== undefined ? s.isActive : true,
        framePrices: s.framePrices || {}
      })) : [];
      console.log('📏 Loaded sizes with discounts:', convertedSizes.map(s => ({ id: s.id, width: s.width, height: s.height, discount: s.discount, framePrices: s.framePrices })));
      
      // DEBUG: Check for duplicate sizes (same width/height but different IDs)
      const sizeMap = new Map();
      convertedSizes.forEach(size => {
        const key = `${size.width}x${size.height}`;
        if (!sizeMap.has(key)) {
          sizeMap.set(key, []);
        }
        sizeMap.get(key).push(size.id);
      });
      
      const duplicates = Array.from(sizeMap.entries()).filter(([key, ids]) => ids.length > 1);
      if (duplicates.length > 0) {
        console.error('🔴 DUPLICATE SIZES FOUND IN DATABASE!', duplicates.map(([key, ids]) => ({ size: key, ids, count: ids.length })));
      }
      
      setSizes(convertedSizes);

      // Load frame types (from cache or Supabase)
      let frameTypesData;
      const cachedFrameTypes = CacheService.get<any[]>(CACHE_KEYS.FRAME_TYPES);
      if (cachedFrameTypes) {
        frameTypesData = cachedFrameTypes;
        console.log('✅ Using cached frame types');
      } else {
        console.log('📡 Fetching frame types from Supabase...');
        frameTypesData = await frameTypesService.getAll();
        CacheService.set(CACHE_KEYS.FRAME_TYPES, frameTypesData, CACHE_TTL.FRAME_TYPES);
      }
      const convertedFrameTypes = frameTypesData.length > 0 ? frameTypesData.map(f => ({
        id: f.id,
        name: f.name,
        price: f.price,
        discount: f.discount || 0,
        isActive: f.isActive !== undefined ? f.isActive : true,
        order: f.order || 0
      })) : [];
      console.log('🖼️ Loaded frame types:', convertedFrameTypes);
      setFrameTypes(convertedFrameTypes);

      // Load paintings (from cache or Supabase) - NOW sizes are available!
      let paintingsData;
      if (cachedPaintings) {
        paintingsData = cachedPaintings;
      } else {
        paintingsData = await paintingsService.getAll();
        CacheService.set(CACHE_KEYS.PAINTINGS, paintingsData, CACHE_TTL.PAINTINGS);
      }
      // Pass sizes to converter so it can match properly
      setPaintings(paintingsData.map(p => convertPaintingFromService(p, convertedSizes)));

      // Load clients (from cache or Supabase)
      let clientsData;
      if (cachedClients) {
        clientsData = cachedClients;
      } else {
        clientsData = await clientsService.getAll();
        CacheService.set(CACHE_KEYS.CLIENTS, clientsData, CACHE_TTL.CLIENTS);
      }
      const convertedClients = clientsData.map(c => ({
        id: c.id,
        fullName: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address || '',
        city: '',
        county: '',
        postalCode: '',
        registeredDate: new Date(c.createdAt),
        totalOrders: c.totalOrders,
        totalSpent: c.totalSpent
      }));
      console.log('✅ Converted clients:', convertedClients.length);
      setClients(convertedClients);

      // Load orders (from cache or Supabase)
      let ordersData;
      if (cachedOrders) {
        ordersData = cachedOrders;
        console.log('✅ Using cached orders');
      } else {
        console.log('📡 Fetching orders from Supabase...');
        ordersData = await ordersService.getAll();
        CacheService.set(CACHE_KEYS.ORDERS, ordersData, CACHE_TTL.ORDERS);
      }
      
      const convertedOrders = ordersData.map(o => {
        // Find the matching client by email to get the correct clientId
        const matchingClient = convertedClients.find(c => c.email === o.customerEmail);
        
        // Parse order notes from JSON if available
        let orderNotes: OrderNote[] = [];
        if (o.notes) {
          try {
            const parsed = JSON.parse(o.notes);
            if (Array.isArray(parsed)) {
              orderNotes = parsed.map(note => ({
                ...note,
                createdAt: new Date(note.createdAt),
                closedAt: note.closedAt ? new Date(note.closedAt) : undefined
              }));
              if (orderNotes.length > 0) {
                console.log(`📋 Order ${o.id.slice(-8)} loaded with ${orderNotes.length} notes from database`);
              }
            }
          } catch (e) {
            // If parsing fails, it's likely legacy text notes - convert to new format
            if (typeof o.notes === 'string' && o.notes.trim()) {
              console.log(`📝 Converting legacy text note for order ${o.id.slice(-8)}: "${o.notes.substring(0, 30)}..."`);
              orderNotes = [{
                id: `legacy-${Date.now()}`,
                text: o.notes,
                createdAt: new Date(o.created_at || Date.now()),
                createdBy: 'System',
                createdByRole: 'full-admin',
                isRead: true, // Mark legacy notes as read
                readBy: [],
                status: 'closed' // Mark legacy notes as closed
              }];
            } else {
              orderNotes = [];
            }
          }
        }
        
        return {
          id: o.id,
          clientId: matchingClient ? matchingClient.id : o.customerEmail, // Use client ID if found, otherwise use email as fallback
          clientName: o.customerName,
          clientEmail: o.customerEmail,
          clientPhone: o.customerPhone,
          address: o.deliveryAddress,
          city: o.deliveryCity || '',
          county: o.deliveryCounty || '',
          postalCode: o.deliveryPostalCode || '',
          orderDate: new Date(o.createdAt),
          status: o.status as OrderStatus,
          statusHistory: [{
            status: o.status as OrderStatus,
            timestamp: new Date(o.createdAt),
            changedBy: 'System',
            reason: 'Order created'
          }],
          canvasItems: o.items && o.items.length > 0 ? o.items : (o.itemsCount ? new Array(o.itemsCount).fill({ type: 'placeholder' }) : []),
          totalPrice: o.total,
          deliveryMethod: o.deliveryOption as any,
          paymentMethod: o.paymentMethod as any,
          paymentStatus: o.paymentStatus as any,
          notes: o.notes || '',
          orderNotes,
          personType: o.personType,
          companyName: o.companyName,
          cui: o.cui,
          regCom: o.regCom,
          companyCounty: o.companyCounty,
          companyCity: o.companyCity,
          companyAddress: o.companyAddress
        };
      });
      
      // Deduplicate orders by ID (keep only the first occurrence)
      const uniqueOrders = convertedOrders.filter((order, index, self) =>
        index === self.findIndex(o => o.id === order.id)
      );
      
      // IMPORTANT: Merge with existing orders to preserve detailed data loaded by loadOrderDetails
      // If an order already exists in state with full items (not placeholders) or has more notes, keep the existing version
      setOrders(prev => {
        return uniqueOrders.map(newOrder => {
          const existingOrder = prev.find(o => o.id === newOrder.id);
          
          if (!existingOrder) {
            // New order, just add it
            return newOrder;
          }
          
          // Check if existing order has full canvas items (not placeholders)
          const hasFullItems = existingOrder.canvasItems && 
                               existingOrder.canvasItems.length > 0 && 
                               existingOrder.canvasItems[0]?.type !== 'placeholder';
          
          // Check if existing order has more notes than the new data (state is more recent)
          const existingNotesCount = existingOrder.orderNotes?.length || 0;
          const newNotesCount = newOrder.orderNotes?.length || 0;
          const hasMoreNotes = existingNotesCount > newNotesCount;
          
          // Preserve existing order if it has detailed items OR more notes
          if (hasFullItems || hasMoreNotes) {
            if (hasFullItems && hasMoreNotes) {
              console.log(`🔄 Preserving detailed order ${newOrder.id.slice(-8)} with ${existingOrder.canvasItems.length} items and ${existingNotesCount} notes`);
            } else if (hasFullItems) {
              console.log(`🔄 Preserving order ${newOrder.id.slice(-8)} with full items`);
            } else {
              console.log(`🔄 Preserving order ${newOrder.id.slice(-8)} with ${existingNotesCount} notes (DB has ${newNotesCount})`);
            }
            return existingOrder; // Keep the detailed version
          }
          
          // Otherwise use the new order from database (it might have been updated)
          if (newNotesCount > 0) {
            console.log(`✅ Updating order ${newOrder.id.slice(-8)} with ${newNotesCount} notes from database`);
          }
          return newOrder;
        });
      });

      // Load blog posts (from cache or Supabase)
      let blogPostsData;
      if (cachedBlogPosts) {
        blogPostsData = cachedBlogPosts;
        console.log('✅ Using cached blog posts');
      } else {
        console.log('📡 Fetching blog posts from Supabase...');
        blogPostsData = await blogPostsService.getAll();
        CacheService.set(CACHE_KEYS.BLOG_POSTS, blogPostsData, CACHE_TTL.BLOG_POSTS);
      }
      setBlogPosts(blogPostsData);

      // Load hero slides (from cache or Supabase)
      let heroSlidesData;
      if (cachedHeroSlides) {
        heroSlidesData = cachedHeroSlides;
        console.log('✅ Using cached hero slides');
      } else {
        console.log('📡 Fetching hero slides from Supabase...');
        heroSlidesData = await heroSlidesService.getAll();
        CacheService.set(CACHE_KEYS.HERO_SLIDES, heroSlidesData, CACHE_TTL.HERO_SLIDES);
      }
      setHeroSlides(heroSlidesData);

      // Load admin users (from cache or Supabase)
      let usersData;
      if (cachedUsers) {
        usersData = cachedUsers;
        console.log('✅ Using cached users');
      } else {
        console.log('📡 Fetching users from Supabase...');
        usersData = await adminUsersService.getAll();
        CacheService.set(CACHE_KEYS.USERS, usersData, CACHE_TTL.USERS);
      }
      if (usersData.length > 0) {
        setUsers(usersData.map(u => ({
          id: u.id,
          username: u.username,
          password: u.password,
          fullName: u.fullName,
          email: u.email,
          role: u.role as UserRole,
          isActive: u.isActive
        })));
      }

      // Sizes already loaded earlier (before paintings) - skip duplicate loading

      // Load categories (from cache or Supabase)
      let categoriesData;
      if (cachedCategories) {
        categoriesData = cachedCategories;
        console.log('✅ Using cached categories');
      } else {
        console.log('📡 Fetching categories from Supabase...');
        categoriesData = await categoriesService.getAll();
        CacheService.set(CACHE_KEYS.CATEGORIES, categoriesData, CACHE_TTL.CATEGORIES);
      }
      if (categoriesData.length > 0) {
        setCategories(categoriesData.map(c => ({
          id: c.id,
          name: c.name
        })));
      }

      // Load subcategories (from cache or Supabase)
      let subcategoriesData;
      if (cachedSubcategories) {
        subcategoriesData = cachedSubcategories;
        console.log('✅ Using cached subcategories');
      } else {
        console.log('📡 Fetching subcategories from Supabase...');
        subcategoriesData = await subcategoriesService.getAll();
        CacheService.set(CACHE_KEYS.SUBCATEGORIES, subcategoriesData, CACHE_TTL.SUBCATEGORIES);
      }
      if (subcategoriesData.length > 0) {
        setSubcategories(subcategoriesData.map(s => ({
          id: s.id,
          name: s.name
        })));
      }

      console.log('✅ Data loaded from', isSupabaseConfigured() ? 'Supabase + Cache' : 'localStorage');
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount and when Supabase is configured
  useEffect(() => {
    loadData();
  }, []);

  // ONE-TIME AUTOMATIC CLEANUP: Remove "Status updated" notes
  useEffect(() => {
    const cleanupStatusNotes = async () => {
      console.log('🔍 Cleanup check starting...');
      
      // Check if cleanup has already been done
      const cleanupDone = localStorage.getItem('status_notes_cleanup_done');
      console.log('📍 Cleanup flag:', cleanupDone);
      
      if (cleanupDone === 'true') {
        console.log('⏭️ Cleanup already done, skipping');
        return;
      }

      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.log('⚠️ Supabase not configured, skipping cleanup');
        return;
      }

      // Check if orders are loaded
      console.log('📊 Orders loaded:', orders.length);
      if (orders.length === 0) {
        console.log('⏳ No orders loaded yet, will retry...');
        return;
      }

      try {
        console.log('🧹 Starting automatic cleanup of "Status updated" notes...');
        const supabase = getSupabase();
        
        const { data: ordersData, error: fetchError } = await supabase
          .from('orders')
          .select('id, notes')
          .not('notes', 'is', null);

        if (fetchError) {
          console.error('❌ Error fetching orders for cleanup:', fetchError);
          return;
        }

        console.log(`📦 Fetched ${ordersData?.length || 0} orders with notes`);

        let totalRemoved = 0;
        const updates = [];

        for (const order of ordersData || []) {
          if (!order.notes) continue;

          let orderNotes: any[] = [];
          
          // Try to parse as JSON array first
          try {
            const parsed = JSON.parse(order.notes);
            if (Array.isArray(parsed)) {
              orderNotes = parsed;
            }
          } catch (e) {
            // If parsing fails, it might be a plain text note (legacy format)
            const trimmedNotes = order.notes.trim();
            if (trimmedNotes === 'Status updated' || trimmedNotes === '') {
              // This is a plain text "Status updated" note - DELETE IT
              console.log(`🔍 Order ${order.id.slice(-8)} has plain text status note to remove: "${trimmedNotes}"`);
              totalRemoved += 1;
              updates.push({
                id: order.id,
                notes: '[]' // Empty array
              });
            } else {
              // It's a plain text note with actual content - keep it but convert to array format
              console.log(`📝 Order ${order.id.slice(-8)} has plain text note to preserve: "${trimmedNotes.slice(0, 30)}..."`);
              orderNotes = [{
                text: trimmedNotes,
                timestamp: new Date().toISOString()
              }];
              updates.push({
                id: order.id,
                notes: JSON.stringify(orderNotes)
              });
            }
            continue;
          }

          if (orderNotes.length === 0) continue;

          // Log before filtering for debugging
          const statusNotes = orderNotes.filter((note: any) => {
            const text = note.text?.trim() || '';
            return text === 'Status updated' || text === '';
          });

          if (statusNotes.length > 0) {
            console.log(`🔍 Order ${order.id.slice(-8)} has ${statusNotes.length} status notes to remove (from array)`);
          }

          const filteredNotes = orderNotes.filter((note: any) => {
            const text = note.text?.trim() || '';
            return text !== 'Status updated' && text !== '';
          });

          if (filteredNotes.length !== orderNotes.length) {
            const removed = orderNotes.length - filteredNotes.length;
            totalRemoved += removed;
            
            updates.push({
              id: order.id,
              notes: JSON.stringify(filteredNotes)
            });
          }
        }

        if (updates.length === 0) {
          console.log('✅ No "Status updated" notes found to clean up');
          localStorage.setItem('status_notes_cleanup_done', 'true');
          return;
        }

        console.log(`🧹 Cleaning ${updates.length} orders (removing ${totalRemoved} notes)...`);
        toast.info(`Curățare automată: Se șterg ${totalRemoved} notițe sistem...`);

        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('orders')
            .update({ notes: update.notes })
            .eq('id', update.id);

          if (updateError) {
            console.error(`❌ Error updating order ${update.id}:`, updateError);
          } else {
            console.log(`✅ Updated order ${update.id.slice(-8)}`);
          }
        }

        console.log(`✅ Automatically removed ${totalRemoved} "Status updated" notes from ${updates.length} orders!`);
        toast.success(`✅ ${totalRemoved} notițe sistem șterse automat!`);
        localStorage.setItem('status_notes_cleanup_done', 'true');
        
        console.log('🔄 Reloading data...');
        await loadData();
      } catch (error) {
        console.error('❌ Error during automatic cleanup:', error);
        toast.error('Eroare la curățare automată');
      }
    };

    // Run cleanup after data loads
    if (currentUser && orders.length > 0) {
      console.log('⏰ Scheduling cleanup in 3 seconds...');
      const timeoutId = setTimeout(() => {
        cleanupStatusNotes();
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [currentUser, orders.length]);

  // Auto-refresh orders every 10 minutes when user is logged in
  // DISABLED to reduce egress bandwidth consumption
  // Re-enable only if upgraded to Supabase Pro plan
  /*
  useEffect(() => {
    if (!currentUser) return;
    
    const AUTO_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
    
    const intervalId = setInterval(async () => {
      try {
        const fetchedOrders = await ordersService.getAll();
        const fetchedClients = await clientsService.getAll();
        
        // Transform orders data
        const transformedOrders: OrderItem[] = fetchedOrders.map(o => {
          const matchingClient = fetchedClients.find(c => c.email === o.customerEmail);
        
          return {
            id: o.id,
            clientId: matchingClient ? matchingClient.id : o.customerEmail,
            clientName: o.customerName,
            clientEmail: o.customerEmail,
            clientPhone: o.customerPhone,
            address: o.deliveryAddress,
            city: o.deliveryCity || '',
            county: o.deliveryCounty || '',
            postalCode: o.deliveryPostalCode || '',
            orderDate: new Date(o.createdAt),
            status: o.status as OrderStatus,
            statusHistory: [{
              status: o.status as OrderStatus,
              timestamp: new Date(o.createdAt),
              changedBy: 'System',
              reason: 'Order placed'
            }],
            canvasItems: o.items || [],
            totalPrice: o.total,
            deliveryMethod: o.deliveryOption as 'express' | 'standard' | 'economic',
            paymentMethod: o.paymentMethod as 'card' | 'cash',
            paymentStatus: o.paymentStatus as 'paid' | 'unpaid',
            notes: o.notes || ''
          };
        });
        
        setOrders(transformedOrders);
      } catch (error) {
        console.error('❌ Error auto-refreshing orders:', error);
      }
    }, AUTO_REFRESH_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [currentUser]);
  */

  // Refresh function to manually reload data
  const refreshData = async () => {
    await loadData();
  };

  // Lightweight refresh: Only check for new orders (admin users only)
  const checkForNewOrders = async () => {
    if (!currentUser) return;
    
    try {
      console.log('🔍 Checking for new orders...');
      
      // Get the timestamp of the most recent order we have
      const mostRecentOrder = orders.length > 0 
        ? orders.reduce((latest, order) => 
            order.orderDate > latest.orderDate ? order : latest
          )
        : null;
      
      const lastCheckTime = mostRecentOrder?.orderDate || new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24h if no orders
      
      // Fetch only orders created after our last check
      const allOrders = await ordersService.getAll();
      const newOrders = allOrders.filter(o => {
        const orderDate = new Date(o.createdAt);
        const isAfterLastCheck = orderDate > lastCheckTime;
        const notAlreadyInList = !orders.some(existingOrder => existingOrder.id === o.id);
        return isAfterLastCheck && notAlreadyInList;
      });
      
      if (newOrders.length > 0) {
        console.log(`✨ Found ${newOrders.length} new order(s)`);
        
        // Get current clients to match with new orders
        const currentClients = clients;
        
        // Convert new orders
        const convertedNewOrders = newOrders.map(o => {
          const matchingClient = currentClients.find(c => c.email === o.customerEmail);
          
          let orderNotes: OrderNote[] = [];
          if (o.notes) {
            try {
              const parsed = JSON.parse(o.notes);
              if (Array.isArray(parsed)) {
                orderNotes = parsed.map(note => ({
                  ...note,
                  createdAt: new Date(note.createdAt),
                  closedAt: note.closedAt ? new Date(note.closedAt) : undefined
                }));
              }
            } catch (e) {
              orderNotes = [];
            }
          }
          
          return {
            id: o.id,
            clientId: matchingClient ? matchingClient.id : o.customerEmail,
            clientName: o.customerName,
            clientEmail: o.customerEmail,
            clientPhone: o.customerPhone,
            address: o.deliveryAddress,
            city: o.deliveryCity || '',
            county: o.deliveryCounty || '',
            postalCode: o.deliveryPostalCode || '',
            orderDate: new Date(o.createdAt),
            status: o.status as OrderStatus,
            statusHistory: [{
              status: o.status as OrderStatus,
              timestamp: new Date(o.createdAt),
              changedBy: 'System',
              reason: 'Order created'
            }],
            canvasItems: o.items || [],
            totalPrice: o.total,
            deliveryMethod: o.deliveryOption as any,
            paymentMethod: o.paymentMethod as any,
            paymentStatus: o.paymentStatus as any,
            notes: o.notes || '',
            orderNotes,
            personType: o.personType,
            companyName: o.companyName,
            cui: o.cui,
            regCom: o.regCom,
            companyCounty: o.companyCounty,
            companyCity: o.companyCity,
            companyAddress: o.companyAddress
          };
        });
        
        // Add new orders to the beginning of the list (only if they don't already exist)
        setOrders(prev => [...convertedNewOrders, ...prev]);
        
        // Update cache with all orders including new ones
        CacheService.set(CACHE_KEYS.ORDERS, allOrders, CACHE_TTL.ORDERS);
        
        // Show notification
        toast.info(`${newOrders.length} comandă(ă) nouă detectată`);
        
        // Send browser notification
        if (notificationService.hasPermission() && convertedNewOrders.length > 0) {
          const firstOrder = convertedNewOrders[0];
          notificationService.showOrderNotification(
            firstOrder.id.slice(0, 8), 
            firstOrder.clientName, 
            firstOrder.totalPrice
          );
        }
      } else {
        console.log('✅ No new orders');
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  };

  // Load full order details including items (called from order detail page)
  const loadOrderDetails = async (orderId: string) => {
    try {
      console.log(`📡 Loading full details for order ${orderId}...`);
      
      // Get the current order from state to preserve any recent updates
      const currentOrder = orders.find(o => o.id === orderId);
      
      // Fetch full order data from database including items
      const fullOrder = await ordersService.getById(orderId);
      
      if (!fullOrder) {
        console.warn(`Order ${orderId} not found`);
        return;
      }
      
      // Find matching client
      const matchingClient = clients.find(c => c.email === fullOrder.customerEmail);
      
      // Parse order notes from database
      let orderNotesFromDB: OrderNote[] = [];
      if (fullOrder.notes) {
        try {
          const parsed = JSON.parse(fullOrder.notes);
          if (Array.isArray(parsed)) {
            orderNotesFromDB = parsed.map(note => ({
              ...note,
              createdAt: new Date(note.createdAt),
              closedAt: note.closedAt ? new Date(note.closedAt) : undefined
            }));
          }
        } catch (e) {
          // If parsing fails, it's likely legacy text notes - convert to new format
          if (typeof fullOrder.notes === 'string' && fullOrder.notes.trim()) {
            console.log(`📝 Converting legacy text note for order ${orderId.slice(-8)}: "${fullOrder.notes.substring(0, 30)}..."`);
            orderNotesFromDB = [{
              id: `legacy-${Date.now()}`,
              text: fullOrder.notes,
              createdAt: new Date(fullOrder.createdAt || Date.now()),
              createdBy: 'System',
              createdByRole: 'full-admin',
              isRead: true, // Mark legacy notes as read
              readBy: [],
              status: 'closed' // Mark legacy notes as closed
            }];
          } else {
            orderNotesFromDB = [];
          }
        }
      }
      
      // IMPORTANT: If the current order in state has more notes than DB, keep the state version
      // This handles race conditions where state was updated but DB write is still in progress
      const orderNotes = (currentOrder?.orderNotes && currentOrder.orderNotes.length > orderNotesFromDB.length)
        ? currentOrder.orderNotes
        : orderNotesFromDB;
      
      console.log(`📝 Notes comparison - State: ${currentOrder?.orderNotes?.length || 0}, DB: ${orderNotesFromDB.length}, Using: ${orderNotes.length}`);
      
      // Convert to OrderItem format
      const convertedOrder: OrderItem = {
        id: fullOrder.id,
        clientId: matchingClient ? matchingClient.id : fullOrder.customerEmail,
        clientName: fullOrder.customerName,
        clientEmail: fullOrder.customerEmail,
        clientPhone: fullOrder.customerPhone,
        address: fullOrder.deliveryAddress,
        city: fullOrder.deliveryCity || '',
        county: fullOrder.deliveryCounty || '',
        postalCode: fullOrder.deliveryPostalCode || '',
        orderDate: new Date(fullOrder.createdAt),
        status: fullOrder.status as OrderStatus,
        statusHistory: currentOrder?.statusHistory || [{ // Preserve status history from state if available
          status: fullOrder.status as OrderStatus,
          timestamp: new Date(fullOrder.createdAt),
          changedBy: 'System',
          reason: 'Order created'
        }],
        canvasItems: fullOrder.items || [], // This is the key part - includes all items!
        totalPrice: fullOrder.total,
        deliveryMethod: fullOrder.deliveryOption as any,
        paymentMethod: fullOrder.paymentMethod as any,
        paymentStatus: fullOrder.paymentStatus as any,
        notes: fullOrder.notes || '',
        orderNotes,
        personType: fullOrder.personType,
        companyName: fullOrder.companyName,
        cui: fullOrder.cui,
        regCom: fullOrder.regCom,
        companyCounty: fullOrder.companyCounty,
        companyCity: fullOrder.companyCity,
        companyAddress: fullOrder.companyAddress
      };
      
      // Update the order in the orders array
      setOrders(prev => prev.map(o => o.id === orderId ? convertedOrder : o));
      
      console.log(`✅ Loaded full details for order ${orderId} with ${fullOrder.items?.length || 0} items and ${orderNotes.length} notes`);
    } catch (error) {
      console.error('Error loading order details:', error);
      toast.error('Eroare la încărcarea detaliilor comenzii');
    }
  };

  // Load current user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('admin_current_user');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  // Save current user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('admin_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('admin_current_user');
      }
    } catch (error: any) {
      if (error.name === 'QuotaExceededError') {
        toast.error('Spațiu de stocare insuficient.');
      }
      console.error('Error saving current user:', error);
    }
  }, [currentUser]);

  // Note: All other data (users, sizes, categories, subcategories, hero slides, blog posts, paintings, orders, clients)
  // are now persisted via dataServices which handle Supabase/localStorage automatically

  const login = (username: string, password: string, rememberMe?: boolean): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addOrder = async (orderData: Omit<OrderItem, 'id' | 'orderDate' | 'status' | 'statusHistory'>, options?: { skipReload?: boolean }) => {
    try {
      // Find or create client
      let client = await clientsService.getByEmail(orderData.clientEmail);
      
      if (client) {
        // Update existing client
        await clientsService.update(client.id, {
          name: orderData.clientName,
          phone: orderData.clientPhone,
          address: orderData.address,
          totalOrders: client.totalOrders + 1,
          totalSpent: client.totalSpent + orderData.totalPrice
        });
      } else {
        // Create new client
        client = await clientsService.create({
          name: orderData.clientName,
          email: orderData.clientEmail,
          phone: orderData.clientPhone,
          address: orderData.address,
          totalOrders: 1,
          totalSpent: orderData.totalPrice
        });
      }

      // Determine payment status based on payment method
      // Card payments will be automatically paid (implemented later)
      // Cash on delivery will be unpaid until delivery
      const paymentStatus: 'paid' | 'unpaid' = orderData.paymentMethod === 'card' ? 'paid' : 'unpaid';

      // Create order
      const orderNumber = `ORD-${Date.now()}`;
      await ordersService.create({
        orderNumber,
        customerName: orderData.clientName,
        customerEmail: orderData.clientEmail,
        customerPhone: orderData.clientPhone,
        deliveryAddress: orderData.address,
        deliveryCity: orderData.city,
        deliveryCounty: orderData.county,
        deliveryPostalCode: orderData.postalCode,
        deliveryOption: orderData.deliveryMethod,
        paymentMethod: orderData.paymentMethod,
        paymentStatus,
        items: orderData.canvasItems,
        subtotal: orderData.totalPrice,
        deliveryCost: 0,
        total: orderData.totalPrice,
        status: 'new',
        notes: orderData.notes,
        personType: orderData.personType,
        companyName: orderData.companyName,
        cui: orderData.cui,
        regCom: orderData.regCom,
        companyCounty: orderData.companyCounty,
        companyCity: orderData.companyCity,
        companyAddress: orderData.companyAddress,
      });

      // Send browser notification if admin is logged in and has permission
      if (currentUser && notificationService.hasPermission()) {
        notificationService.showOrderNotification(orderNumber, orderData.clientName, orderData.totalPrice);
      }

      // Invalidate client cache since we may have created/updated a client
      CacheService.invalidate(CACHE_KEYS.CLIENTS);
      CacheService.invalidate(CACHE_KEYS.ORDERS);

      // Reload data only if not skipped (skip for customer checkouts to improve performance)
      if (!options?.skipReload) {
        await loadData();
      }
      console.log('✅ Order created successfully');
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, reason?: string, changedBy?: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      
      // Preserve existing notes when updating status
      const updateData: any = {
        status: newStatus
      };
      
      // If there's a reason, add it as a status change note to the existing notes
      if (reason && reason.trim() && order) {
        const statusChangeNote: OrderNote = {
          id: `status-${Date.now()}`,
          text: `Status changed to "${newStatus}": ${reason}`,
          createdAt: new Date(),
          createdBy: changedBy || currentUser?.fullName || 'System',
          createdByRole: currentUser?.role || 'full-admin',
          isRead: false,
          readBy: [],
          status: 'closed' // Status change notes are automatically closed
        };
        
        const updatedNotes = [...(order.orderNotes || []), statusChangeNote];
        updateData.notes = JSON.stringify(updatedNotes);
      }
      
      await ordersService.update(orderId, updateData);
      
      // Update local state
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const updates: any = {
            ...o,
            status: newStatus,
            statusHistory: [
              ...o.statusHistory,
              {
                status: newStatus,
                timestamp: new Date(),
                changedBy: changedBy || 'System',
                reason: reason || '',
              }
            ],
          };
          
          // Only add note if user provided a reason
          if (reason && reason.trim() && order) {
            const statusChangeNote: OrderNote = {
              id: `status-${Date.now()}`,
              text: `Status changed to "${newStatus}": ${reason}`,
              createdAt: new Date(),
              createdBy: changedBy || currentUser?.fullName || 'System',
              createdByRole: currentUser?.role || 'full-admin',
              isRead: false,
              readBy: [],
              status: 'closed'
            };
            updates.orderNotes = [...(o.orderNotes || []), statusChangeNote];
          }
          
          return updates;
        }
        return o;
      }));
      
      // Invalidate orders cache to ensure fresh data on next load
      CacheService.invalidate(CACHE_KEYS.ORDERS);
    } catch (error) {
      throw error;
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await ordersService.delete(orderId);
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error) {
      throw error;
    }
  };

  const updateOrderNotes = async (orderId: string, notes: string) => {
    try {
      await ordersService.update(orderId, { notes });
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, notes } : order
      ));
    } catch (error) {
      throw error;
    }
  };

  const addOrderNote = async (orderId: string, text: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const newNote: OrderNote = {
        id: `note-${Date.now()}`,
        text,
        createdAt: new Date(),
        createdBy: currentUser?.fullName || 'System',
        createdByRole: currentUser?.role || 'full-admin',
        isRead: false,
        readBy: [],
        status: 'open'
      };
      
      const updatedNotes = [...(order.orderNotes || []), newNote];
      
      // Store as JSON in the notes field for persistence
      await ordersService.update(orderId, { 
        notes: JSON.stringify(updatedNotes)
      });
      
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          return { ...o, orderNotes: updatedNotes };
        }
        return o;
      }));

      // Invalidate orders cache to ensure fresh data on next load
      CacheService.invalidate(CACHE_KEYS.ORDERS);

      // Send notification to full-admin and account-manager users
      if (currentUser?.role !== 'full-admin') {
        toast.info(`Notă nouă adăugată la comanda ${order.id.slice(0, 8)}`);
      }
    } catch (error) {
      throw error;
    }
  };

  const markNoteAsRead = async (orderId: string, noteId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const updatedNotes = (order.orderNotes || []).map(note => 
        note.id === noteId 
          ? { ...note, isRead: true, readBy: [...(note.readBy || []), currentUser?.fullName || 'System'] } 
          : note
      );
      
      await ordersService.update(orderId, { 
        notes: JSON.stringify(updatedNotes)
      });
      
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, orderNotes: updatedNotes } : o
      ));

      // Invalidate orders cache to ensure fresh data on next load
      CacheService.invalidate(CACHE_KEYS.ORDERS);
    } catch (error) {
      throw error;
    }
  };

  const closeOrderNote = async (orderId: string, noteId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const updatedNotes = (order.orderNotes || []).map(note => 
        note.id === noteId 
          ? { ...note, status: 'closed' as const, closedAt: new Date(), closedBy: currentUser?.fullName || 'System' } 
          : note
      );
      
      await ordersService.update(orderId, { 
        notes: JSON.stringify(updatedNotes)
      });
      
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, orderNotes: updatedNotes } : o
      ));

      // Invalidate orders cache to ensure fresh data on next load
      CacheService.invalidate(CACHE_KEYS.ORDERS);
    } catch (error) {
      console.error('Error closing order note:', error);
      throw error;
    }
  };

  const getUnreadNotesCount = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order?.orderNotes) return 0;
    return order.orderNotes.filter(note => note.status === 'open' && !note.isRead).length;
  };

  const getTotalNotesCount = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order?.orderNotes) return 0;
    return order.orderNotes.length;
  };

  // ===== FAN COURIER AWB FUNCTIONS =====
  
  const generateAWB = async (orderId: string): Promise<{ success: boolean; awb?: string; error?: string }> => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      // Dynamic import to avoid loading if not needed
      const { fanCourierService } = await import('../services/fanCourierService');

      // Parse address
      const addressParsed = fanCourierService.parseAddress(
        order.address,
        order.city,
        order.county,
        order.postalCode
      );

      // Calculate dimensions and weight
      const dimensions = order.packageDimensions || fanCourierService.calculateDimensions(order.canvasItems);
      const weight = order.packageWeight || fanCourierService.calculateWeight(order.canvasItems);

      // Prepare shipment info
      const shipmentInfo = {
        service: order.deliveryMethod === 'express' ? 'Express' as const : 'Standard' as const,
        packages: {
          parcel: 1,
          envelopes: 0,
        },
        weight,
        cod: order.paymentMethod === 'cash' ? order.totalPrice : 0,
        declaredValue: order.totalPrice,
        payment: 'sender' as const,
        observation: order.notes || 'Canvas BlueHand',
        content: `Canvas personalizat - ${order.canvasItems.length} buc`,
        dimensions,
        options: ['X'], // Standard options
        recipient: {
          name: order.clientName,
          phone: order.clientPhone,
          email: order.clientEmail,
          address: addressParsed,
        },
      };

      // Generate AWB
      const result = await fanCourierService.generateAWB(shipmentInfo);

      if (result.success && result.awb) {
        // Update order with AWB data
        const awbData = {
          awbNumber: result.awb,
          awbGeneratedAt: new Date().toISOString(),
          awbStatus: 'pending' as const,
          awbTrackingUrl: `https://www.fancourier.ro/awb-tracking/?tracking=${result.awb}`,
          packageWeight: weight,
          packageDimensions: dimensions,
        };

        // Update in database
        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          await supabase
            .from('orders')
            .update({
              awb_number: awbData.awbNumber,
              awb_generated_at: awbData.awbGeneratedAt,
              awb_status: awbData.awbStatus,
              awb_tracking_url: awbData.awbTrackingUrl,
              package_weight: awbData.packageWeight,
              package_dimensions: JSON.stringify(awbData.packageDimensions),
            })
            .eq('id', orderId);
        }

        // Update local state
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, ...awbData } : o
        ));

        // Add a note
        await addOrderNote(orderId, `AWB generat: ${result.awb}`);

        toast.success(`AWB ${result.awb} generat cu succes!`);
        return { success: true, awb: result.awb };
      }

      return result;
    } catch (error: any) {
      console.error('Error generating AWB:', error);
      
      // Show more helpful error messages
      if (error.message?.includes('credentials not configured') || error.message?.includes('Client ID not configured')) {
        toast.error(
          'FAN Courier nu este configurat. Mergi la Setări → FAN Courier AWB pentru a configura.',
          { duration: 6000 }
        );
        return { success: false, error: 'FAN Courier not configured. Please go to Settings → FAN Courier AWB to configure.' };
      }
      
      toast.error(`Eroare la generarea AWB: ${error.message || 'Eroare necunoscută'}`, { duration: 5000 });
      return { success: false, error: error.message || 'Unknown error' };
    }
  };

  const updateAWBTracking = async (orderId: string): Promise<void> => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order || !order.awbNumber) {
        toast.error('AWB nu a fost generat încă');
        return;
      }

      const { fanCourierService } = await import('../services/fanCourierService');
      const trackingResult = await fanCourierService.trackAWB(order.awbNumber);

      if (trackingResult.success && trackingResult.status) {
        // Map FAN Courier status to our status
        let awbStatus: 'pending' | 'in_transit' | 'delivered' | 'returned' | 'cancelled' = 'pending';
        
        const statusLower = trackingResult.status.toLowerCase();
        if (statusLower.includes('livrat') || statusLower.includes('delivered')) {
          awbStatus = 'delivered';
        } else if (statusLower.includes('retur') || statusLower.includes('return')) {
          awbStatus = 'returned';
        } else if (statusLower.includes('anulat') || statusLower.includes('cancel')) {
          awbStatus = 'cancelled';
        } else if (statusLower.includes('transit') || statusLower.includes('curs')) {
          awbStatus = 'in_transit';
        }

        const updateData = {
          awbStatus,
          awbLastUpdate: new Date().toISOString(),
        };

        // Update in database
        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          await supabase
            .from('orders')
            .update({
              awb_status: updateData.awbStatus,
              awb_last_update: updateData.awbLastUpdate,
            })
            .eq('id', orderId);
        }

        // Update local state
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, ...updateData } : o
        ));

        toast.success(`Status AWB actualizat: ${trackingResult.status}`);
      } else {
        toast.error(trackingResult.error || 'Nu s-a putut actualiza tracking-ul');
      }
    } catch (error) {
      console.error('Error updating AWB tracking:', error);
      toast.error('Eroare la actualizarea tracking-ului');
    }
  };

  const downloadAWBLabel = async (orderId: string): Promise<void> => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order || !order.awbNumber) {
        toast.error('AWB nu a fost generat încă');
        return;
      }

      const { fanCourierService } = await import('../services/fanCourierService');
      const labelBlob = await fanCourierService.getAWBLabel(order.awbNumber, 'pdf');

      if (labelBlob) {
        // Create download link
        const url = window.URL.createObjectURL(labelBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AWB_${order.awbNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('Etichetă AWB descărcată');
      } else {
        toast.error('Nu s-a putut descărca eticheta AWB');
      }
    } catch (error) {
      console.error('Error downloading AWB label:', error);
      toast.error('Eroare la descărcarea etichetei');
    }
  };

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    try {
      await clientsService.update(clientId, {
        name: updates.fullName,
        email: updates.email,
        phone: updates.phone,
        address: updates.address,
        totalOrders: updates.totalOrders,
        totalSpent: updates.totalSpent
      });
      
      setClients(prev => prev.map(client => 
        client.id === clientId ? { ...client, ...updates } : client
      ));
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      await clientsService.delete(clientId);
      setClients(prev => prev.filter(client => client.id !== clientId));
      console.log('✅ Client deleted successfully');
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  const addPainting = async (paintingData: Omit<CanvasPainting, 'id'>) => {
    try {
      const serviceData = convertPaintingToService(paintingData);
      const created = await paintingsService.create(serviceData);
      setPaintings(prev => [convertPaintingFromService(created, sizes), ...prev]);
      CacheService.invalidate(CACHE_KEYS.PAINTINGS); // Invalidate cache
      console.log('✅ Painting added successfully');
    } catch (error) {
      console.error('Error adding painting:', error);
      throw error;
    }
  };

  const updatePainting = async (paintingId: string, updates: Partial<CanvasPainting>) => {
    try {
      // SIMPLIFIED: Just pass through the updates - sizes are now just an array of IDs
      const updateData = convertPaintingToService(updates as Omit<CanvasPainting, 'id'>);
      const updated = await paintingsService.update(paintingId, updateData);
      setPaintings(prev => prev.map(p => 
        p.id === paintingId ? convertPaintingFromService(updated, sizes) : p
      ));
      CacheService.invalidate(CACHE_KEYS.PAINTINGS); // Invalidate cache
      console.log('✅ Painting updated successfully');
    } catch (error) {
      console.error('Error updating painting:', error);
      throw error;
    }
  };

  const deletePainting = async (paintingId: string) => {
    try {
      await paintingsService.delete(paintingId);
      setPaintings(prev => prev.filter(p => p.id !== paintingId));
      CacheService.invalidate(CACHE_KEYS.PAINTINGS); // Invalidate cache
    } catch (error) {
      console.error('Error deleting painting:', error);
      throw error;
    }
  };

  const getPaintingsByCategory = (category: string): CanvasPainting[] => {
    return paintings.filter(painting => painting.category === category && painting.isActive);
  };

  const getBestsellers = (): CanvasPainting[] => {
    return paintings.filter(painting => painting.isBestseller && painting.isActive);
  };

  // User management (still localStorage only)
  const addUser = async (userData: Omit<AdminUser, 'id'>) => {
    try {
      const newUser = await adminUsersService.create(userData);
      if (newUser.id) {
        setUsers(prev => [...prev, newUser]);
        toast.success('Utilizator adăugat cu succes!');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Eroare la adăugarea utilizatorului');
      throw error;
    }
  };

  const updateUser = async (userId: string, updates: Partial<AdminUser>) => {
    try {
      const updatedUser = await adminUsersService.update(userId, updates);
      if (updatedUser.id) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? updatedUser : user
        ));
        toast.success('Utilizator actualizat cu succes!');
        
        // If current user updated their own info, update the currentUser state
        if (currentUser?.id === userId) {
          setCurrentUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Eroare la actualizarea utilizatorului');
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await adminUsersService.delete(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('Utilizator șters cu succes!');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Eroare la ștergerea utilizatorului');
      throw error;
    }
  };

  const getClientOrders = (clientId: string): OrderItem[] => {
    return orders.filter(order => order.clientId === clientId);
  };

  // Size management
  const addSize = async (sizeData: Omit<CanvasSize, 'id'>) => {
    try {
      const newSize = await canvasSizesService.create(sizeData);
      setSizes(prev => [...prev, newSize]);
      
      // Clear cache to force fresh data on next load
      CacheService.delete(CACHE_KEYS.SIZES);
      
      toast.success('Dimensiune adăugată cu succes!');
    } catch (error) {
      console.error('Error adding size:', error);
      toast.error('Eroare la adăugarea dimensiunii');
      throw error;
    }
  };

  const updateSize = async (sizeId: string, updates: Partial<CanvasSize>) => {
    try {
      const updatedSize = await canvasSizesService.update(sizeId, updates);
      setSizes(prev => prev.map(size => 
        size.id === sizeId ? updatedSize : size
      ));
      
      // Clear cache to force fresh data on next load
      CacheService.delete(CACHE_KEYS.SIZES);
      
      toast.success('Dimensiune actualizată cu succes!');
    } catch (error) {
      console.error('Error updating size:', error);
      toast.error('Eroare la actualizarea dimensiunii');
      throw error;
    }
  };

  const deleteSize = async (sizeId: string) => {
    try {
      await canvasSizesService.delete(sizeId);
      setSizes(prev => prev.filter(size => size.id !== sizeId));
      
      // Clear cache to force fresh data on next load
      CacheService.delete(CACHE_KEYS.SIZES);
      
      toast.success('Dimensiune ștearsă cu succes!');
    } catch (error) {
      console.error('Error deleting size:', error);
      toast.error('Eroare la ștergerea dimensiunii');
      throw error;
    }
  };

  const getSizeByDimensions = (width: number, height: number): CanvasSize | undefined => {
    return sizes.find(size => size.width === width && size.height === height);
  };

  const getSizeById = (sizeId: string): CanvasSize | undefined => {
    return sizes.find(size => size.id === sizeId);
  };

  const getSizesByIds = (sizeIds: string[]): CanvasSize[] => {
    return sizeIds.map(id => getSizeById(id)).filter((s): s is CanvasSize => s !== undefined);
  };

  const getDiscountForSize = (sizeId: string): number => {
    const size = sizes.find(s => s.id === sizeId);
    return size?.discount || 0;
  };

  // Frame Type management
  const addFrameType = async (frameTypeData: Omit<FrameType, 'id'>) => {
    try {
      const newFrameType = await frameTypesService.create(frameTypeData);
      setFrameTypes(prev => [...prev, newFrameType]);
      
      // Clear cache to force fresh data on next load
      CacheService.delete(CACHE_KEYS.FRAME_TYPES);
      
      toast.success('Tip ramă adăugat cu succes!');
    } catch (error) {
      console.error('Error adding frame type:', error);
      toast.error('Eroare la adăugarea tipului de ramă');
      throw error;
    }
  };

  const updateFrameType = async (frameTypeId: string, updates: Partial<FrameType>) => {
    try {
      const updatedFrameType = await frameTypesService.update(frameTypeId, updates);
      setFrameTypes(prev => prev.map(frameType => 
        frameType.id === frameTypeId ? updatedFrameType : frameType
      ));
      
      // Clear cache to force fresh data on next load
      CacheService.delete(CACHE_KEYS.FRAME_TYPES);
      
      toast.success('Tip ramă actualizat cu succes!');
    } catch (error) {
      console.error('Error updating frame type:', error);
      toast.error('Eroare la actualizarea tipului de ramă');
      throw error;
    }
  };

  const deleteFrameType = async (frameTypeId: string) => {
    try {
      await frameTypesService.delete(frameTypeId);
      setFrameTypes(prev => prev.filter(frameType => frameType.id !== frameTypeId));
      
      // Clear cache to force fresh data on next load
      CacheService.delete(CACHE_KEYS.FRAME_TYPES);
      
      toast.success('Tip ramă șters cu succes!');
    } catch (error) {
      console.error('Error deleting frame type:', error);
      toast.error('Eroare la ștergerea tipului de ramă');
      throw error;
    }
  };

  const getFrameTypeById = (frameTypeId: string): FrameType | undefined => {
    return frameTypes.find(frameType => frameType.id === frameTypeId);
  };

  const getFrameTypesByIds = (frameTypeIds: string[]): FrameType[] => {
    return frameTypeIds.map(id => getFrameTypeById(id)).filter((f): f is FrameType => f !== undefined);
  };

  const getFramePriceForSize = (sizeId: string, frameTypeId: string): { 
    price: number; 
    discount: number;
    availableForCanvas?: boolean;
    availableForPrint?: boolean;
  } => {
    const size = sizes.find(s => s.id === sizeId);
    if (!size || !size.framePrices || !size.framePrices[frameTypeId]) {
      return { price: 0, discount: 0, availableForCanvas: true, availableForPrint: true };
    }
    return size.framePrices[frameTypeId];
  };

  // Category management (now using Supabase)
  const addCategory = async (category: string) => {
    try {
      const newCategory: CategoryData = {
        id: `category-${Date.now()}`,
        name: category,
      };
      
      // Save to Supabase
      const created = await categoriesService.create(newCategory);
      setCategories(prev => [...prev, created]);
      
      // Clear cache
      CacheService.delete(CACHE_KEYS.CATEGORIES);
      
      toast.success('Categoria a fost adăugată cu succes');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Eroare la adăugarea categoriei');
    }
  };

  const updateCategory = async (categoryId: string, newName: string) => {
    try {
      // Update in Supabase
      const updated = await categoriesService.update(categoryId, { name: newName });
      setCategories(prev => prev.map(category => 
        category.id === categoryId ? updated : category
      ));
      
      // Clear cache
      CacheService.delete(CACHE_KEYS.CATEGORIES);
      
      toast.success('Categoria a fost actualizată cu succes');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Eroare la actualizarea categoriei');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      // Delete from Supabase
      await categoriesService.delete(categoryId);
      setCategories(prev => prev.filter(category => category.id !== categoryId));
      
      // Clear cache
      CacheService.delete(CACHE_KEYS.CATEGORIES);
      
      toast.success('Categoria a fost ștearsă cu succes');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Eroare la ștergerea categoriei');
    }
  };

  // Subcategory management (now using Supabase)
  const addSubcategory = async (subcategory: string) => {
    try {
      const newSubcategory: SubcategoryData = {
        id: `subcategory-${Date.now()}`,
        name: subcategory,
      };
      
      // Save to Supabase
      const created = await subcategoriesService.create(newSubcategory);
      setSubcategories(prev => [...prev, created]);
      
      // Clear cache
      CacheService.delete(CACHE_KEYS.SUBCATEGORIES);
      
      toast.success('Stilul a fost adăugat cu succes');
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast.error('Eroare la adăugarea stilului');
    }
  };

  const updateSubcategory = async (subcategoryId: string, newName: string) => {
    try {
      // Update in Supabase
      const updated = await subcategoriesService.update(subcategoryId, { name: newName });
      setSubcategories(prev => prev.map(subcategory => 
        subcategory.id === subcategoryId ? updated : subcategory
      ));
      
      // Clear cache
      CacheService.delete(CACHE_KEYS.SUBCATEGORIES);
      
      toast.success('Stilul a fost actualizat cu succes');
    } catch (error) {
      console.error('Error updating subcategory:', error);
      toast.error('Eroare la actualizarea stilului');
    }
  };

  const deleteSubcategory = async (subcategoryId: string) => {
    try {
      // Delete from Supabase
      await subcategoriesService.delete(subcategoryId);
      setSubcategories(prev => prev.filter(subcategory => subcategory.id !== subcategoryId));
      
      // Clear cache
      CacheService.delete(CACHE_KEYS.SUBCATEGORIES);
      
      toast.success('Stilul a fost șters cu succes');
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Eroare la ștergerea stilului');
    }
  };

  // Hero slides management (now using dataService with Supabase support)
  const addHeroSlide = async (slideData: Omit<HeroSlide, 'id'>) => {
    try {
      const created = await heroSlidesService.create(slideData);
      setHeroSlides(prev => [...prev, created]);
      toast.success('Slide-ul a fost adăugat cu succes');
    } catch (error) {
      console.error('Error adding hero slide:', error);
      toast.error('Eroare la adăugarea slide-ului');
      throw error;
    }
  };

  const updateHeroSlide = async (slideId: string, updates: Partial<HeroSlide>) => {
    try {
      const updated = await heroSlidesService.update(slideId, updates);
      setHeroSlides(prev => prev.map(slide => 
        slide.id === slideId ? updated : slide
      ));
      toast.success('Slide-ul a fost actualizat cu succes');
    } catch (error) {
      console.error('Error updating hero slide:', error);
      toast.error('Eroare la actualizarea slide-ului');
      throw error;
    }
  };

  const deleteHeroSlide = async (slideId: string) => {
    try {
      await heroSlidesService.delete(slideId);
      setHeroSlides(prev => prev.filter(slide => slide.id !== slideId));
      toast.success('Slide-ul a fost șters cu succes');
    } catch (error) {
      console.error('Error deleting hero slide:', error);
      toast.error('Eroare la ștergerea slide-ului');
      throw error;
    }
  };

  // Blog posts management (now using dataService with Supabase support)
  const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => {
    try {
      const created = await blogPostsService.create(postData);
      setBlogPosts(prev => [created, ...prev]);
      console.log('✅ Blog post added successfully');
      toast.success('Articolul a fost adăugat cu succes');
    } catch (error) {
      console.error('Error adding blog post:', error);
      toast.error('Eroare la adăugarea articolului');
      throw error;
    }
  };

  const updateBlogPost = async (postId: string, updates: Partial<BlogPost>) => {
    try {
      const updated = await blogPostsService.update(postId, updates);
      setBlogPosts(prev => prev.map(post => 
        post.id === postId ? updated : post
      ));
      toast.success('Articolul a fost actualizat cu succes');
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast.error('Eroare la actualizarea articolului');
      throw error;
    }
  };

  const deleteBlogPost = async (postId: string) => {
    try {
      await blogPostsService.delete(postId);
      setBlogPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Articolul a fost șters cu succes');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Eroare la ștergerea articolului');
      throw error;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        login,
        logout,
        orders,
        clients,
        users,
        sizes,
        frameTypes,
        categories,
        subcategories,
        paintings,
        heroSlides,
        blogPosts,
        isLoading,
        refreshData,
        checkForNewOrders,
        loadOrderDetails,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        addPainting,
        updatePainting,
        deletePainting,
        getPaintingsByCategory,
        getBestsellers,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        updateClient,
        deleteClient,
        addUser,
        updateUser,
        deleteUser,
        getClientOrders,
        updateOrderNotes,
        addOrderNote,
        markNoteAsRead,
        closeOrderNote,
        addSize,
        updateSize,
        deleteSize,
        getSizeByDimensions,
        getSizeById,
        getSizesByIds,
        getDiscountForSize,
        addFrameType,
        updateFrameType,
        deleteFrameType,
        getFrameTypeById,
        getFrameTypesByIds,
        getFramePriceForSize,
        getUnreadNotesCount,
        getTotalNotesCount,
        generateAWB,
        updateAWBTracking,
        downloadAWBLabel,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};