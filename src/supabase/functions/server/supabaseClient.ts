/**
 * Singleton Supabase client to avoid connection pool exhaustion
 * This module ensures only ONE Supabase client instance is created and reused
 */

let supabaseClient: any = null;
let supabasePromise: Promise<any> | null = null;

export async function getSupabaseClient() {
  // Return existing client if available
  if (supabaseClient) {
    return supabaseClient;
  }
  
  // If client is being initialized, wait for it
  if (supabasePromise) {
    return supabasePromise;
  }
  
  // Initialize new client
  supabasePromise = (async () => {
    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    supabasePromise = null; // Clear promise after initialization
    console.log('✅ Supabase client initialized (singleton)');
    return supabaseClient;
  })();
  
  return supabasePromise;
}
