// Frontend Settings Service - Interface with KV Store
import { supabase } from './supabase';

/**
 * Get a setting from the kv_store table
 */
export async function getSetting<T>(key: string): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from('kv_store_bbc0c500')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - setting doesn't exist yet
        return null;
      }
      throw error;
    }

    return data?.value as T;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return null;
  }
}

/**
 * Set a setting in the kv_store table
 */
export async function setSetting<T>(key: string, value: T): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('kv_store_bbc0c500')
      .upsert({
        key,
        value: value as any,
      }, {
        onConflict: 'key'
      });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    return false;
  }
}

/**
 * Delete a setting from the kv_store table
 */
export async function deleteSetting(key: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('kv_store_bbc0c500')
      .delete()
      .eq('key', key);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting setting ${key}:`, error);
    return false;
  }
}