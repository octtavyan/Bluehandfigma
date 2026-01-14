// Client-side image optimization service
// Creates thumbnails and compressed versions before upload to reduce bandwidth

export interface ImageVersions {
  original: Blob;      // Compressed original - for download only
  medium: Blob;        // Detail view (max 1200px)
  thumbnail: Blob;     // List/grid view (max 400px)
}

export interface OptimizationResult {
  versions: ImageVersions;
  stats: {
    originalSize: number;
    mediumSize: number;
    thumbnailSize: number;
    totalSaved: number;
    savedPercentage: number;
  };
}

/**
 * Optimize image by creating multiple versions
 */
export async function optimizeImage(
  file: File,
  options: {
    thumbnailSize?: number;
    mediumSize?: number;
    quality?: number;
  } = {}
): Promise<OptimizationResult> {
  const {
    thumbnailSize = 400,
    mediumSize = 1200,
    quality = 0.85
  } = options;

  const originalSize = file.size;

  // Load image
  const img = await loadImage(file);
  
  // Create versions
  const thumbnail = await resizeImage(img, thumbnailSize, quality);
  const medium = await resizeImage(img, mediumSize, quality);
  const original = await compressImage(img, quality);

  const stats = {
    originalSize,
    mediumSize: medium.size,
    thumbnailSize: thumbnail.size,
    totalSaved: originalSize - (original.size + medium.size + thumbnail.size),
    savedPercentage: Math.round(((originalSize - original.size) / originalSize) * 100)
  };

  console.log('🖼️ Image optimized:', {
    original: `${(originalSize / 1024).toFixed(1)}KB → ${(original.size / 1024).toFixed(1)}KB`,
    medium: `${(medium.size / 1024).toFixed(1)}KB`,
    thumbnail: `${(thumbnail.size / 1024).toFixed(1)}KB`,
    saved: `${stats.savedPercentage}%`
  });

  return {
    versions: { original, medium, thumbnail },
    stats
  };
}

/**
 * Load image from file
 */
function loadImage(file: File): Promise<HTMLImageElement> {
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
function resizeImage(
  img: HTMLImageElement,
  maxSize: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

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

    // Enable high-quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw resized image
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to blob
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
function compressImage(
  img: HTMLImageElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

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
 * Generate unique filenames for different versions
 */
export function generateImageFilenames(originalName: string): {
  original: string;
  medium: string;
  thumbnail: string;
} {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = 'jpg'; // Always use JPG for optimized images
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
  
  return {
    original: `${nameWithoutExt}_original_${timestamp}_${random}.${extension}`,
    medium: `${nameWithoutExt}_medium_${timestamp}_${random}.${extension}`,
    thumbnail: `${nameWithoutExt}_thumb_${timestamp}_${random}.${extension}`
  };
}

/**
 * Convert data URL to blob (useful for canvas images)
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
