/**
 * Service for storing painting metadata (dominant_color, orientation, printTypes, frameTypesByPrintType) in kv_store
 * This is a workaround for not being able to add columns to the paintings table
 * 
 * Now uses server endpoints to bypass RLS policies
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface PaintingMetadata {
  dominantColor?: string;
  orientation?: 'portrait' | 'landscape' | 'square';
  printTypes?: ('Print Hartie' | 'Print Canvas')[];
  frameTypesByPrintType?: {
    'Print Hartie': string[];
    'Print Canvas': string[];
  };
}

const getServerUrl = (path: string) => 
  `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500${path}`;

export const paintingMetadataService = {
  /**
   * Get metadata for a single painting
   */
  async get(paintingId: string): Promise<PaintingMetadata> {
    try {
      const response = await fetch(getServerUrl(`/painting-metadata/${paintingId}`), {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }
      
      if (result.data && Object.keys(result.data).length > 0) {
        return result.data;
      }
      
      return {};
    } catch (error) {
      console.error(`❌ Error getting metadata for painting ${paintingId}:`, error);
      return {};
    }
  },

  /**
   * Get metadata for multiple paintings at once
   */
  async getMany(paintingIds: string[]): Promise<Record<string, PaintingMetadata>> {
    try {
      const response = await fetch(getServerUrl('/painting-metadata-many'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paintingIds })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }
      
      return result.data || {};
    } catch (error) {
      console.error('❌ Error getting metadata for multiple paintings:', error);
      return {};
    }
  },

  /**
   * Set metadata for a painting
   */
  async set(paintingId: string, metadata: PaintingMetadata): Promise<void> {
    try {
      const response = await fetch(getServerUrl(`/painting-metadata/${paintingId}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error(`❌ Error setting metadata for painting ${paintingId}:`, error);
      throw error;
    }
  },

  /**
   * Delete metadata for a painting
   */
  async delete(paintingId: string): Promise<void> {
    try {
      const response = await fetch(getServerUrl(`/painting-metadata/${paintingId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error(`❌ Error deleting metadata for painting ${paintingId}:`, error);
      throw error;
    }
  }
};
