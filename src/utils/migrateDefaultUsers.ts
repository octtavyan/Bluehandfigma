// Migration utility to update default users
// Run this once by calling the function from console or a temporary button

import { projectId, publicAnonKey } from './supabase/info';

export async function migrateDefaultUsers() {
  try {
    console.log('🔄 Starting default users migration...');
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-bbc0c500/admin/update-default-users`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log('✅ Default users migration completed!');
      console.log('Results:', data.results);
      
      // Show results
      data.results.forEach((result: any) => {
        if (result.success) {
          console.log(`✅ ${result.username} -> Updated successfully`);
        } else {
          console.log(`❌ ${result.username} -> Error: ${result.error}`);
        }
      });

      return { success: true, data };
    } else {
      console.error('❌ Migration failed:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('❌ Error running migration:', error);
    return { success: false, error };
  }
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).migrateDefaultUsers = migrateDefaultUsers;
}
