/**
 * Server-side handlers for painting metadata (orientation, dominantColor)
 * These operations require SERVICE_ROLE_KEY to bypass RLS on kv_store table
 */

interface PaintingMetadata {
  dominantColor?: string;
  orientation?: 'portrait' | 'landscape' | 'square';
  printTypes?: ('Print Hartie' | 'Print Canvas')[];
  frameTypesByPrintType?: {
    'Print Hartie': string[];
    'Print Canvas': string[];
  };
}

const getKey = (paintingId: string) => `painting_meta:${paintingId}`;

export const paintingMetadataHandlers = {
  /**
   * GET /make-server-bbc0c500/painting-metadata/:id
   * Get metadata for a single painting
   */
  async get(paintingId: string) {
    try {
      const { createClient } = await import("jsr:@supabase/supabase-js@2");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      const key = getKey(paintingId);
      
      const { data, error } = await supabase
        .from('kv_store_bbc0c500')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data && data.value && typeof data.value === 'object') {
        console.log(`📖 Loaded metadata for painting ${paintingId}:`, data.value);
        return { success: true, data: data.value as PaintingMetadata };
      }
      
      console.log(`⚠️ No metadata found for painting ${paintingId}`);
      return { success: true, data: {} };
    } catch (error) {
      console.error(`❌ Error getting metadata for painting ${paintingId}:`, error);
      return { success: false, error: error.message };
    }
  },

  /**
   * POST /make-server-bbc0c500/painting-metadata/:id
   * Set metadata for a painting (merges with existing)
   */
  async set(paintingId: string, metadata: PaintingMetadata) {
    try {
      const { createClient } = await import("jsr:@supabase/supabase-js@2");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      const key = getKey(paintingId);
      
      // Fetch existing metadata first to merge with new values
      const { data: existingData } = await supabase
        .from('kv_store_bbc0c500')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      
      const existingMetadata = (existingData?.value && typeof existingData.value === 'object') 
        ? existingData.value as PaintingMetadata 
        : {};
      
      // Merge existing with new metadata (only update provided fields)
      const mergedMetadata: PaintingMetadata = {
        ...existingMetadata,
        ...metadata
      };
      
      const { error } = await supabase
        .from('kv_store_bbc0c500')
        .upsert({ 
          key, 
          value: mergedMetadata 
        });
      
      if (error) throw error;
      
      return { success: true, data: mergedMetadata };
    } catch (error) {
      console.error(`❌ Error setting metadata for painting ${paintingId}:`, error);
      return { success: false, error: error.message };
    }
  },

  /**
   * DELETE /make-server-bbc0c500/painting-metadata/:id
   * Delete metadata for a painting
   */
  async delete(paintingId: string) {
    try {
      const { createClient } = await import("jsr:@supabase/supabase-js@2");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      const key = getKey(paintingId);
      
      const { error } = await supabase
        .from('kv_store_bbc0c500')
        .delete()
        .eq('key', key);
      
      if (error) throw error;
      
      console.log(`🗑️ Deleted metadata for painting ${paintingId}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Error deleting metadata for painting ${paintingId}:`, error);
      return { success: false, error: error.message };
    }
  },

  /**
   * POST /make-server-bbc0c500/painting-metadata-many
   * Get metadata for multiple paintings at once
   */
  async getMany(paintingIds: string[]) {
    try {
      // If no painting IDs, return empty result
      if (!paintingIds || paintingIds.length === 0) {
        return { success: true, data: {} };
      }

      const { createClient } = await import("jsr:@supabase/supabase-js@2");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      const keys = paintingIds.map(id => getKey(id));
      
      // Batch keys into smaller chunks to avoid timeout (max 100 at a time)
      const BATCH_SIZE = 100;
      const result: Record<string, PaintingMetadata> = {};
      
      for (let i = 0; i < keys.length; i += BATCH_SIZE) {
        const batchKeys = keys.slice(i, i + BATCH_SIZE);
        
        const { data, error } = await supabase
          .from('kv_store_bbc0c500')
          .select('key, value')
          .in('key', batchKeys)
          .limit(BATCH_SIZE); // Add explicit limit
        
        if (error) throw error;
        
        data?.forEach((item) => {
          // Extract painting ID from key "painting_meta:id"
          const paintingId = item.key.replace('painting_meta:', '');
          if (item.value && typeof item.value === 'object') {
            result[paintingId] = item.value as PaintingMetadata;
          }
        });
      }
      
      console.log(`✅ Loaded metadata for ${Object.keys(result).length}/${paintingIds.length} paintings`);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Error getting metadata for multiple paintings:', error);
      return { success: false, error: error.message };
    }
  }
};