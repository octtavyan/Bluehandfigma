// Image optimization service for creating thumbnails and compressed versions
// Reduces bandwidth and storage by serving appropriately sized images

export interface ImageVersions {
  original: string;      // Full size - only for download
  medium: string;        // Detail view (max 1200px)
  thumbnail: string;     // List view (max 400px)
}

export interface ImageOptimizationOptions {
  thumbnailSize?: number;   // Default: 400px
  mediumSize?: number;      // Default: 1200px
  quality?: number;         // Default: 0.85 (85%)
}

/**
 * Optimizes images by creating multiple versions (thumbnail, medium, original)
 * Uses Canvas API for resizing and compression
 */
export async function optimizeImage(
  imageFile: File,
  options: ImageOptimizationOptions = {}
): Promise<{ thumbnail: Blob; medium: Blob; original: Blob }> {
  const {
    thumbnailSize = 400,
    mediumSize = 1200,
    quality = 0.85
  } = options;

  // Load image
  const img = await loadImage(imageFile);
  
  // Create thumbnail (for list views)
  const thumbnail = await resizeImage(img, thumbnailSize, quality);
  
  // Create medium size (for detail views)
  const medium = await resizeImage(img, mediumSize, quality);
  
  // Convert original to blob with compression
  const original = await compressImage(img, quality);

  return { thumbnail, medium, original };
}

/**
 * Load image from file
 */
async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Resize image maintaining aspect ratio
 */
async function resizeImage(
  img: HTMLImageElement,
  maxSize: number,
  quality: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Calculate new dimensions
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > maxSize) {
      height = Math.round((height * maxSize) / width);
      width = maxSize;
    }
  } else {
    if (height > maxSize) {
      width = Math.round((width * maxSize) / height);
      height = maxSize;
    }
  }

  canvas.width = width;
  canvas.height = height;

  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw resized image
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Compress image without resizing
 */
async function compressImage(
  img: HTMLImageElement,
  quality: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Generate a unique filename with version suffix
 */
export function generateImageFilename(originalName: string, version: 'thumbnail' | 'medium' | 'original'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = originalName.split('.').pop() || 'jpg';
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${safeName}_${version}_${timestamp}_${random}.${extension}`;
}

/**
 * Calculate compression ratio
 */
export function getCompressionStats(originalSize: number, optimizedSize: number): {
  ratio: number;
  savedBytes: number;
  savedPercentage: number;
} {
  const savedBytes = originalSize - optimizedSize;
  const savedPercentage = Math.round((savedBytes / originalSize) * 100);
  const ratio = Math.round((originalSize / optimizedSize) * 100) / 100;

  return { ratio, savedBytes, savedPercentage };
}
