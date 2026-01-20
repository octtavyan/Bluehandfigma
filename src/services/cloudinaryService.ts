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
  private cloudName: string = '';
  private uploadPreset: string = '';
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
          if (data.settings && data.settings.isConfigured) {
            this.cloudName = data.settings.cloudName;
            this.uploadPreset = data.settings.uploadPreset;
            this.apiEndpoint = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
            this.configLoaded = true;
          }
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

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', folder);

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Upload failed');
      }

      const data: CloudinaryUploadResponse = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
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

    const formData = new FormData();
    formData.append('file', dataUrl);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', folder);

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Upload failed');
      }

      const data: CloudinaryUploadResponse = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
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
}

export const cloudinaryService = new CloudinaryService();