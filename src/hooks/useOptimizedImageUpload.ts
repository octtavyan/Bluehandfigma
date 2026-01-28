// Hook for uploading optimized images to Supabase Storage
import { useState } from 'react';
import { uploadOptimizedImage } from '../lib/optimizedStorage';
import { toast } from 'sonner';

export interface UploadedImages {
  original: string;
  medium: string;
  thumbnail: string;
}

export const useOptimizedImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Upload an image file with automatic optimization
   * @param file The image file to upload
   * @param folder The storage folder ('paintings', 'orders', 'blog')
   * @returns URLs for all 3 image versions
   */
  const uploadImage = async (
    file: File,
    folder: 'paintings' | 'orders' | 'blog' = 'paintings'
  ): Promise<UploadedImages> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Optimize image (33%)
      setUploadProgress(33);

      // Step 2: Upload all versions (66%)
      setUploadProgress(66);
      
      const urls = await uploadOptimizedImage(
        file,
        folder
      );

      // Step 3: Complete (100%)
      setUploadProgress(100);

      toast.success('Imagine optimizată și încărcată cu succes!');

      return urls;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      toast.error('Eroare la încărcarea imaginii');
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Upload an image from a data URL (base64)
   * Useful for canvas-generated images
   */
  const uploadFromDataURL = async (
    dataURL: string,
    filename: string,
    folder: 'paintings' | 'orders' | 'blog' = 'paintings'
  ): Promise<UploadedImages> => {
    // Convert data URL to blob
    const response = await fetch(dataURL);
    const blob = await response.blob();
    
    // Create file from blob
    const file = new File([blob], filename, { type: 'image/jpeg' });
    
    return uploadImage(file, folder);
  };

  return {
    uploadImage,
    uploadFromDataURL,
    isUploading,
    uploadProgress
  };
};