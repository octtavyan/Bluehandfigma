// Utility to remove all "Status updated" notes from the database

import { getSupabase } from '../lib/supabase';

export async function cleanupAllStatusUpdatedNotes() {
  if (!confirm('This will delete all "Status updated" notes and empty notes from ALL orders in the database. Continue?')) {
    return false;
  }

  try {
    const supabase = getSupabase();
    
    // Get all orders with notes
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, notes')
      .not('notes', 'is', null);

    if (fetchError) {
      console.error('❌ Error fetching orders:', fetchError);
      throw fetchError;
    }

    let totalRemoved = 0;
    const updates = [];

    // Process each order
    for (const order of orders || []) {
      if (!order.notes) continue;

      // Try to parse notes as JSON
      let orderNotes: any[] = [];
      try {
        const parsed = JSON.parse(order.notes);
        if (Array.isArray(parsed)) {
          orderNotes = parsed;
        }
      } catch (e) {
        // If it's not JSON, skip this order
        continue;
      }

      if (orderNotes.length === 0) continue;

      // Filter out "Status updated" notes and empty notes
      const filteredNotes = orderNotes.filter((note: any) => {
        const text = note.text?.trim() || '';
        // Remove notes that are exactly "Status updated" or empty
        return text !== 'Status updated' && text !== '' && text !== 'Status changed to "queue": ';
      });

      if (filteredNotes.length !== orderNotes.length) {
        const removed = orderNotes.length - filteredNotes.length;
        totalRemoved += removed;
        
        updates.push({
          id: order.id,
          notes: JSON.stringify(filteredNotes)
        });
      }
    }

    if (updates.length === 0) {
      alert('✅ No "Status updated" or empty notes found to clean up!');
      return true;
    }

    console.log(`📝 Preparing to clean ${updates.length} orders (removing ${totalRemoved} notes)...`);

    // Update all orders in batch
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ notes: update.notes })
        .eq('id', update.id);

      if (updateError) {
        console.error(`❌ Error updating order ${update.id}:`, updateError);
        throw updateError;
      }
    }

    alert(`✅ Successfully removed ${totalRemoved} "Status updated" and empty notes from ${updates.length} orders!\\n\\nPlease reload the page to see the changes.`);
    
    // Reload the page to refresh the data
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    alert('❌ Error during cleanup. Check console for details.');
    return false;
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).cleanupAllStatusUpdatedNotes = cleanupAllStatusUpdatedNotes;
}