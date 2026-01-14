// Unsplash API Integration Service
const UNSPLASH_ACCESS_KEY = '1kidMq6f8qIiTUwD2HYoaOncdZWb0RdY7DRSMo1cu0Y';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
    download_location: string;
  };
  width: number;
  height: number;
  color?: string; // Hex color code from Unsplash
  tags?: Array<{ title: string }>; // Tags from Unsplash
}

export interface UnsplashSearchResult {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

class UnsplashService {
  private async fetchWithAuth(url: string): Promise<Response> {
    // Check if API key is configured
    if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
      throw new Error('Unsplash API key not configured. Please add your API key in /services/unsplashService.ts');
    }
    
    return fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });
  }

  async searchPhotos(query: string, page: number = 1, perPage: number = 20): Promise<UnsplashSearchResult> {
    try {
      const url = `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=portrait`;
      const response = await this.fetchWithAuth(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unsplash API response:', errorText);
        throw new Error(`Unsplash API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching Unsplash photos:', error);
      throw error;
    }
  }

  async getCuratedPhotos(page: number = 1, perPage: number = 20): Promise<UnsplashImage[]> {
    try {
      const url = `${UNSPLASH_API_URL}/photos?page=${page}&per_page=${perPage}&order_by=popular`;
      const response = await this.fetchWithAuth(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unsplash API response:', errorText);
        throw new Error(`Unsplash API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching curated Unsplash photos:', error);
      throw error;
    }
  }

  // Get photos from a specific user/photographer
  async getUserPhotos(username: string, page: number = 1, perPage: number = 20): Promise<UnsplashImage[]> {
    try {
      const url = `${UNSPLASH_API_URL}/users/${username}/photos?page=${page}&per_page=${perPage}`;
      const response = await this.fetchWithAuth(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unsplash API response:', errorText);
        throw new Error(`Unsplash API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user photos from Unsplash:', error);
      throw error;
    }
  }

  // Get a single photo by ID (useful for getting full details including collections)
  async getPhoto(photoId: string): Promise<UnsplashImage> {
    try {
      const url = `${UNSPLASH_API_URL}/photos/${photoId}`;
      const response = await this.fetchWithAuth(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unsplash API response:', errorText);
        throw new Error(`Unsplash API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching photo from Unsplash:', error);
      throw error;
    }
  }

  async triggerDownload(downloadLocation: string): Promise<void> {
    try {
      // Unsplash requires us to trigger download endpoint for attribution
      await this.fetchWithAuth(downloadLocation);
    } catch (error) {
      console.error('Error triggering Unsplash download:', error);
    }
  }

  // Download the highest quality image from Unsplash
  async downloadImage(unsplashId: string, filename: string): Promise<void> {
    try {
      // First get the image details to get the download location
      const url = `${UNSPLASH_API_URL}/photos/${unsplashId}`;
      const response = await this.fetchWithAuth(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image details: ${response.status}`);
      }
      
      const imageData = await response.json();
      
      // Trigger the download endpoint (required by Unsplash API)
      await this.triggerDownload(imageData.links.download_location);
      
      // Download the highest quality image (raw)
      const imageUrl = `${imageData.urls.raw}&fm=jpg&q=100`;
      const imageResponse = await fetch(imageUrl);
      const blob = await imageResponse.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || `${unsplashId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading Unsplash image:', error);
      throw error;
    }
  }

  // Get the Unsplash page URL for an image
  getUnsplashPageUrl(unsplashId: string): string {
    return `https://unsplash.com/photos/${unsplashId}`;
  }

  // Convert Unsplash image to our painting format for detail page
  convertToPainting(unsplashImage: UnsplashImage) {
    return {
      id: `unsplash-${unsplashImage.id}`,
      title: unsplashImage.alt_description || unsplashImage.description || 'Imagine Unsplash',
      image: unsplashImage.urls.regular,
      imageUrls: {
        original: unsplashImage.urls.full,
        medium: unsplashImage.urls.regular,
        thumbnail: unsplashImage.urls.thumb,
      },
      price: 0, // Will be calculated based on size
      category: 'Unsplash',
      subcategory: 'Unsplash',
      description: unsplashImage.description || unsplashImage.alt_description || 'Imagine de pe Unsplash',
      orientation: unsplashImage.width > unsplashImage.height ? 'landscape' : 'portrait',
      isBestseller: false,
      isActive: true,
      printTypes: ['Print Canvas', 'Print Hartie'] as ('Print Canvas' | 'Print Hartie')[],
      frameTypesByPrintType: {} as any, // Will be populated from global frame types
      availableSizes: [] as string[], // Will be populated from global sizes
      tags: [],
      dominantColor: null,
      unsplashData: {
        id: unsplashImage.id,
        photographer: unsplashImage.user.name,
        photographerUsername: unsplashImage.user.username,
        photographerUrl: unsplashImage.user.links.html,
        imageUrl: unsplashImage.links.html,
        downloadLocation: unsplashImage.links.download_location,
      }
    };
  }

  // Map Unsplash hex color to our color names
  private mapUnsplashColorToName(hexColor?: string): string | null {
    if (!hexColor) return null;
    
    const hex = hexColor.toLowerCase();
    
    // Map Unsplash colors to Romanian color names
    // This is a rough mapping based on hue ranges
    const colorMappings: { [key: string]: { name: string, minHue: number, maxHue: number, satThreshold?: number, lightThreshold?: number } } = {
      red: { name: 'Roșu', minHue: 0, maxHue: 15 },
      redAlt: { name: 'Roșu', minHue: 345, maxHue: 360 },
      orange: { name: 'Portocaliu', minHue: 15, maxHue: 45 },
      yellow: { name: 'Galben', minHue: 45, maxHue: 65 },
      green: { name: 'Verde', minHue: 65, maxHue: 170 },
      blue: { name: 'Albastru', minHue: 170, maxHue: 260 },
      purple: { name: 'Mov', minHue: 260, maxHue: 300 },
      pink: { name: 'Roz', minHue: 300, maxHue: 345 },
    };
    
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    // Calculate lightness
    const lightness = (max + min) / 2;
    
    // Calculate saturation
    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
    
    // Check for black, white, gray, beige
    if (lightness < 0.15 && saturation < 0.3) return 'Negru';
    if (lightness > 0.85 && saturation < 0.3) return 'Alb';
    if (saturation < 0.15) {
      if (lightness > 0.7) return 'Bej';
      return 'Gri';
    }
    
    // Brown detection (low saturation orange/red with medium lightness)
    if (lightness > 0.2 && lightness < 0.6 && saturation < 0.5) {
      const hue = this.calculateHue(r, g, b, max, delta);
      if (hue >= 15 && hue <= 45) return 'Maro';
    }
    
    // Calculate hue
    const hue = this.calculateHue(r, g, b, max, delta);
    
    // Find matching color
    for (const [_, mapping] of Object.entries(colorMappings)) {
      if (hue >= mapping.minHue && hue <= mapping.maxHue) {
        return mapping.name;
      }
    }
    
    return null;
  }
  
  private calculateHue(r: number, g: number, b: number, max: number, delta: number): number {
    if (delta === 0) return 0;
    
    let hue = 0;
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
    
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
    
    return hue;
  }

  // Filter Unsplash images based on selected filters
  filterImages(
    images: UnsplashImage[],
    filters: {
      category?: string;
      style?: string;
      orientation?: string;
      color?: string;
    }
  ): UnsplashImage[] {
    return images.filter(image => {
      // Filter by orientation
      if (filters.orientation && filters.orientation !== 'all') {
        const imageOrientation = image.width > image.height 
          ? 'landscape' 
          : image.width < image.height 
            ? 'portrait' 
            : 'square';
        
        if (imageOrientation !== filters.orientation) {
          return false;
        }
      }
      
      // Filter by color
      if (filters.color && filters.color !== 'all') {
        const imageColor = this.mapUnsplashColorToName(image.color);
        if (imageColor !== filters.color) {
          return false;
        }
      }
      
      // Category and style filters: Try to match with tags or description
      if (filters.category && filters.category !== 'all') {
        const categoryLower = filters.category.toLowerCase();
        const matchesCategory = 
          image.alt_description?.toLowerCase().includes(categoryLower) ||
          image.description?.toLowerCase().includes(categoryLower) ||
          image.tags?.some(tag => tag.title.toLowerCase().includes(categoryLower));
        
        if (!matchesCategory) {
          return false;
        }
      }
      
      if (filters.style && filters.style !== 'all') {
        const styleLower = filters.style.toLowerCase();
        const matchesStyle = 
          image.alt_description?.toLowerCase().includes(styleLower) ||
          image.description?.toLowerCase().includes(styleLower) ||
          image.tags?.some(tag => tag.title.toLowerCase().includes(styleLower));
        
        if (!matchesStyle) {
          return false;
        }
      }
      
      return true;
    });
  }
}

export const unsplashService = new UnsplashService();