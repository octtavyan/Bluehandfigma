// Optimized storage service for Supabase
// Handles image uploads with automatic thumbnail generation

import { optimizeImage, generateImageFilenames } from './imageOptimizer';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const BUCKET_NAME = 'make-bbc0c500-images';
const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500`;

export interface UploadedImageUrls {
  original: string;      // Full size - download only
  medium: string;        // Detail views
  thumbnail: string;     // List/grid views
}

/**
 * Upload image with automatic optimization
 * Creates 3 versions: original (compressed), medium, thumbnail
 */
export async function uploadOptimizedImage(
  file: File,
  folder: 'paintings' | 'orders' | 'blog' = 'paintings'
): Promise<UploadedImageUrls> {
  // Optimize image
  const { versions, stats } = await optimizeImage(file);
  
  console.log(`💾 Uploading optimized image (saved ${stats.savedPercentage}%)...`);

  // Generate filenames
  const filenames = generateImageFilenames(file.name);

  // Upload all versions
  const [originalUrl, mediumUrl, thumbnailUrl] = await Promise.all([
    uploadFile(`${folder}/${filenames.original}`, versions.original),
    uploadFile(`${folder}/${filenames.medium}`, versions.medium),
    uploadFile(`${folder}/${filenames.thumbnail}`, versions.thumbnail)
  ]);

  console.log('✅ Image uploaded with 3 versions:', {
    original: filenames.original,
    medium: filenames.medium,
    thumbnail: filenames.thumbnail
  });

  return {
    original: originalUrl,
    medium: mediumUrl,
    thumbnail: thumbnailUrl
  };
}

/**
 * Upload a single file to storage
 */
async function uploadFile(
  path: string,
  blob: Blob
): Promise<string> {
  const formData = new FormData();
  formData.append('path', path);
  formData.append('file', blob);

  const response = await fetch(`${SERVER_URL}/storage/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Upload error:', errorData);
    throw new Error(`Failed to upload ${path}: ${errorData.error || errorData.message || 'Unknown error'}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Failed to upload ${path}: ${data.error || 'Unknown error'}`);
  }
  
  return data.url;
}

/**
 * Delete all versions of an image
 */
export async function deleteOptimizedImage(
  urls: UploadedImageUrls
): Promise<void> {
  // Extract paths from URLs
  const paths = [
    extractPathFromUrl(urls.original),
    extractPathFromUrl(urls.medium),
    extractPathFromUrl(urls.thumbnail)
  ].filter(Boolean) as string[];

  if (paths.length === 0) return;

  const response = await fetch(`${SERVER_URL}/storage/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({ paths })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Delete error:', errorData);
  } else {
    console.log('🗑️ Deleted', paths.length, 'image versions');
  }
}

/**
 * Extract storage path from public URL
 */
function extractPathFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}