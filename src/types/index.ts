export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  dimensions?: Dimension[];
}

export interface Dimension {
  size: string;
  price: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedDimension?: string;
  printType?: 'Print Canvas' | 'Print Hartie'; // Selected print type
  frameType?: string; // Frame type ID (e.g., 'frame-1', 'frame-2')
  customization?: PersonalizationData;
}

export interface PersonalizationData {
  modelId: string;
  modelTitle: string;
  uploadedImages: string[];
  croppedImage?: string; // The cropped preview that client adjusted
  originalImageUrl?: string; // Supabase Storage URL for original image
  croppedImageUrl?: string; // Supabase Storage URL for cropped image
  selectedSize: string;
  price: number;
  orientation?: 'portrait' | 'landscape';
}

export interface Category {
  id: string;
  name: string;
  image: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  slug: string;
}