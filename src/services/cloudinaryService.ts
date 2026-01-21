/**
 * Cloudinary Image Upload Service
 * 
 * Automatically loads configuration from database.
 * Configure via Admin → Setări → Cloudinary
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

interface CloudinarySettings {
  cloudName: string;
  uploadPreset: string;
  apiKey: string;
  isConfigured: boolean;
}

class CloudinaryService {
  private cloudName: string | null = null;
  private uploadPreset: string | null = null;
  private apiEndpoint: string = '';
  private configLoaded: boolean = false;
  private configPromise: Promise<void> | null = null;

  constructor() {
    // Don't load config in constructor - let it be lazy loaded
  }

  /**
   * Load configuration from database via Edge Function
   */
  async loadConfig(): Promise<void> {
    // If already loading, return the existing promise
    if (this.configPromise) {
      return this.configPromise;
    }

    // If already loaded, return immediately
    if (this.configLoaded) {
      return;
    }

    // Create a new loading promise
    this.configPromise = (async () => {
      try {
        console.log('🔄 Loading Cloudinary configuration...');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/cloudinary/settings`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('📦 Cloudinary config response:', data);
          if (data.settings && data.settings.isConfigured) {
            this.cloudName = data.settings.cloudName;
            this.uploadPreset = data.settings.uploadPreset;
            this.apiEndpoint = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
            this.configLoaded = true;
            console.log(`✅ Cloudinary configured: ${this.cloudName} / ${this.uploadPreset}`);
            console.log(`📍 API Endpoint: ${this.apiEndpoint}`);
          } else {
            console.warn('⚠️ Cloudinary not configured in database');
          }
        } else {
          console.error('❌ Failed to load Cloudinary config:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error loading Cloudinary config:', error);
      } finally {
        this.configPromise = null;
      }
    })();

    return this.configPromise;
  }

  /**
   * Force reload configuration (useful after saving settings)
   */
  async reloadConfig(): Promise<void> {
    this.configLoaded = false;
    this.configPromise = null;
    await this.loadConfig();
  }

  /**
   * Check if Cloudinary is configured
   */
  async isConfigured(): Promise<boolean> {
    await this.loadConfig();
    return !!(this.cloudName && this.uploadPreset);
  }

  /**
   * Upload an image file to Cloudinary
   * @param file The image file to upload
   * @param folder Optional folder name in Cloudinary
   * @returns The secure URL of the uploaded image
   */
  async uploadImage(file: File, folder: string = 'bluehand-canvas'): Promise<string> {
    await this.loadConfig();

    if (!this.cloudName || !this.uploadPreset) {
      throw new Error('Cloudinary nu este configurată. Configurează în Admin → Setări → Cloudinary.');
    }

    if (!this.apiEndpoint || this.apiEndpoint === '') {
      throw new Error('Cloudinary API endpoint invalid. Cloud name: ' + this.cloudName);
    }

    // Automatically compress image if needed (10MB limit for Cloudinary free tier)
    let fileToUpload = file;
    try {
      fileToUpload = await this.compressImage(file, 9.5); // Target 9.5MB to be safe
    } catch (compressionError) {
      console.error('Image compression failed, trying original file:', compressionError);
      // Fall back to original file if compression fails
      fileToUpload = file;
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', folder);

    try {
      console.log(`📤 Uploading to Cloudinary API...`);
      console.log(`📍 Endpoint: ${this.apiEndpoint}`);
      console.log(`☁️ Cloud Name: ${this.cloudName}`);
      console.log(`📁 Folder: ${folder}`);
      console.log(`🔑 Upload Preset: ${this.uploadPreset}`);
      console.log(`📦 File: ${fileToUpload.name} (${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB)`);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const error = await response.json();
          errorMessage = error.error?.message || error.message || `Upload failed: ${response.statusText}`;
          console.error('❌ Cloudinary API Error Response:', error);
        } catch (parseError) {
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
          const textError = await response.text();
          console.error('❌ Cloudinary API Error (non-JSON):', textError);
        }
        throw new Error(errorMessage);
      }

      const data: CloudinaryUploadResponse = await response.json();
      console.log('✅ Upload successful:', data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      
      // Check for CORS or network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(
          `Eroare de rețea la upload pe Cloudinary. Verifică:\n` +
          `1. Cloud Name: "${this.cloudName}" este corect?\n` +
          `2. Upload Preset: "${this.uploadPreset}" există și este "unsigned"?\n` +
          `3. Verifică setările CORS în Cloudinary Dashboard`
        );
      }
      
      throw error;
    }
  }

  /**
   * Upload multiple images to Cloudinary
   * @param files Array of image files to upload
   * @param folder Optional folder name in Cloudinary
   * @returns Array of secure URLs
   */
  async uploadMultipleImages(files: File[], folder: string = 'bluehand-canvas'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload from a data URL (base64)
   * @param dataUrl The data URL to upload
   * @param folder Optional folder name in Cloudinary
   * @returns The secure URL of the uploaded image
   */
  async uploadFromDataUrl(dataUrl: string, folder: string = 'bluehand-canvas'): Promise<string> {
    await this.loadConfig();

    if (!this.cloudName || !this.uploadPreset) {
      throw new Error('Cloudinary nu este configurată. Configurează în Admin → Setări → Cloudinary.');
    }

    if (!this.apiEndpoint || this.apiEndpoint === '') {
      throw new Error('Cloudinary API endpoint invalid. Cloud name: ' + this.cloudName);
    }

    // Estimate file size from base64 data URL
    const base64Data = dataUrl.split(',')[1] || dataUrl;
    const estimatedSize = (base64Data.length * 3) / 4; // Base64 to bytes estimation
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    
    if (estimatedSize > MAX_FILE_SIZE) {
      const fileSizeMB = (estimatedSize / 1024 / 1024).toFixed(2);
      console.warn(`⚠️ Base64 data URL too large (${fileSizeMB}MB), will attempt upload anyway...`);
    }

    const formData = new FormData();
    formData.append('file', dataUrl);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', folder);

    try {
      console.log(`📤 Uploading base64 data URL to Cloudinary...`);
      console.log(`📍 Endpoint: ${this.apiEndpoint}`);
      console.log(`☁️ Cloud Name: ${this.cloudName}`);
      console.log(`📁 Folder: ${folder}`);
      console.log(`🔑 Upload Preset: ${this.uploadPreset}`);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const error = await response.json();
          errorMessage = error.error?.message || error.message || `Upload failed: ${response.statusText}`;
          console.error('❌ Cloudinary API Error Response:', error);
        } catch (parseError) {
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
          const textError = await response.text();
          console.error('❌ Cloudinary API Error (non-JSON):', textError);
        }
        throw new Error(errorMessage);
      }

      const data: CloudinaryUploadResponse = await response.json();
      console.log('✅ Base64 upload successful:', data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error('❌ Cloudinary base64 upload error:', error);
      
      // Check for CORS or network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(
          `Eroare de rețea la upload pe Cloudinary. Verifică:\n` +
          `1. Cloud Name: "${this.cloudName}" este corect?\n` +
          `2. Upload Preset: "${this.uploadPreset}" există și este "unsigned"?\n` +
          `3. Verifică setările CORS în Cloudinary Dashboard`
        );
      }
      
      throw error;
    }
  }

  /**
   * Get optimized image URL with transformations
   * @param publicId The Cloudinary public ID
   * @param width Optional width
   * @param height Optional height
   * @param quality Optional quality (auto, best, good, eco, low)
   * @returns Optimized image URL
   */
  getOptimizedUrl(
    publicId: string, 
    width?: number, 
    height?: number, 
    quality: string = 'auto'
  ): string {
    if (!this.cloudName) {
      return '';
    }

    let transformations = `q_${quality},f_auto`;
    
    if (width) {
      transformations += `,w_${width}`;
    }
    
    if (height) {
      transformations += `,h_${height}`;
    }

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformations}/${publicId}`;
  }

  /**
   * Compress an image file if it exceeds the maximum size
   * @param file The image file to compress
   * @param maxSizeMB Maximum file size in MB (default 10MB)
   * @param quality Initial quality (0-1, default 0.8)
   * @returns Compressed file or original if under size limit
   */
  private async compressImage(file: File, maxSizeMB: number = 10, quality: number = 0.8): Promise<File> {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    // If file is already under the limit, return it as-is
    if (file.size <= maxSizeBytes) {
      console.log(`✅ File size OK: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return file;
    }

    console.log(`🔄 Compressing image from ${(file.size / 1024 / 1024).toFixed(2)}MB...`);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate scaling to reduce file size while maintaining aspect ratio
          // Target max dimension of 2048px for very large images
          const maxDimension = 2048;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Try different quality levels to get under size limit
          const tryCompress = async (currentQuality: number): Promise<void> => {
            canvas.toBlob(
              async (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'));
                  return;
                }

                // Check if compressed size is acceptable
                if (blob.size <= maxSizeBytes || currentQuality <= 0.3) {
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  
                  const finalSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);
                  console.log(`✅ Image compressed to ${finalSizeMB}MB (quality: ${currentQuality})`);
                  
                  if (compressedFile.size > maxSizeBytes) {
                    console.warn(`⚠️ Could not compress below ${maxSizeMB}MB. Final size: ${finalSizeMB}MB`);
                  }
                  
                  resolve(compressedFile);
                } else {
                  // Try with lower quality
                  console.log(`🔄 Still too large (${(blob.size / 1024 / 1024).toFixed(2)}MB), trying quality ${currentQuality - 0.1}...`);
                  tryCompress(currentQuality - 0.1);
                }
              },
              'image/jpeg',
              currentQuality
            );
          };

          tryCompress(quality);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }
}

export const cloudinaryService = new CloudinaryService();