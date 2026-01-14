import { Hono } from "npm:hono@4.3.11";
import { cors } from "npm:hono@4.3.11/cors";
import { paintingMetadataHandlers } from './paintingMetadata.ts';
import { dbOptimizationHandlers } from './dbOptimization.ts';
import { getOrderConfirmationEmailHtml } from './email-templates.tsx';

const app = new Hono();

// CORS - Allow all origins
app.use("*", cors({
  origin: "*",
  allowHeaders: ["*"],
  allowMethods: ["*"],
}));

// Storage bucket name
const BUCKET_NAME = 'make-bbc0c500-images';

// Initialize storage bucket on startup
async function initializeStorageBucket() {
  try {
    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket: any) => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
      console.log('📦 Creating storage bucket:', BUCKET_NAME);
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true, // Public bucket for images
        fileSizeLimit: 52428800 // 50MB limit (increased from 10MB)
      });

      if (error) {
        // Ignore "already exists" error (409) - this is actually success
        if (error.statusCode === '409' || error.message?.includes('already exists')) {
          console.log('✅ Storage bucket already exists (409)');
        } else {
          console.error('❌ Failed to create bucket:', error);
        }
      } else {
        console.log('✅ Storage bucket created successfully');
      }
    } else {
      console.log('✅ Storage bucket already exists');
    }
  } catch (error) {
    console.error('⚠️ Bucket initialization failed:', error);
  }
}

// Initialize bucket on startup (async, non-blocking)
initializeStorageBucket();

// Simple health check
app.get("/make-server-bbc0c500/health", (c) => {
  return c.json({ 
    status: "ok", 
    message: "Edge Function is running",
    timestamp: new Date().toISOString() 
  });
});

// Quota check - no database, just return env info
app.get("/make-server-bbc0c500/quota-status", (c) => {
  const url = Deno.env.get("SUPABASE_URL");
  return c.json({
    available: !!url,
    hasUrl: !!url,
    hasServiceKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    timestamp: new Date().toISOString()
  });
});

// Ensure storage bucket exists
app.post("/make-server-bbc0c500/storage/init-bucket", async (c) => {
  try {
    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket: any) => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
      console.log('📦 Creating storage bucket:', BUCKET_NAME);
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 52428800
      });

      if (error) {
        // Ignore "already exists" error (409) - this is actually success
        if (error.statusCode === '409' || error.message?.includes('already exists')) {
          return c.json({ 
            success: true, 
            message: 'Bucket already exists',
            bucket: BUCKET_NAME 
          });
        }
        
        console.error('❌ Bucket creation error:', error);
        return c.json({ 
          success: false, 
          error: error.message,
          bucket: BUCKET_NAME 
        }, 500);
      }
      
      return c.json({ 
        success: true, 
        message: 'Bucket created',
        bucket: BUCKET_NAME 
      });
    }

    return c.json({ 
      success: true, 
      message: 'Bucket already exists',
      bucket: BUCKET_NAME 
    });
  } catch (error) {
    console.error('❌ Init bucket exception:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Upload image to storage (server-side with service role key)
app.post("/make-server-bbc0c500/storage/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file || !path) {
      return c.json({ 
        success: false, 
        error: 'File and path are required' 
      }, 400);
    }

    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Convert file to array buffer then blob
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    // Upload to storage
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(path, blob, {
        contentType: file.type,
        cacheControl: '31536000', // 1 year cache
        upsert: true
      });

    if (error) {
      console.error('❌ Storage upload error:', error);
      return c.json({ 
        success: false, 
        error: error.message 
      }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    console.log('✅ File uploaded:', path);

    return c.json({ 
      success: true, 
      url: publicUrl,
      path: data.path
    });
  } catch (error) {
    console.error('❌ Upload exception:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Delete images from storage (server-side with service role key)
app.post("/make-server-bbc0c500/storage/delete", async (c) => {
  try {
    const body = await c.req.json();
    const { paths } = body;

    if (!paths || !Array.isArray(paths)) {
      return c.json({ 
        success: false, 
        error: 'Paths array is required' 
      }, 400);
    }

    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Delete files from storage
    const { error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .remove(paths);

    if (error) {
      console.error('❌ Storage delete error:', error);
      return c.json({ 
        success: false, 
        error: error.message 
      }, 500);
    }

    console.log('✅ Files deleted:', paths.length);

    return c.json({ 
      success: true,
      deletedCount: paths.length
    });
  } catch (error) {
    console.error('❌ Delete exception:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Cart operations - lazy load Supabase only when needed
app.post("/make-server-bbc0c500/cart/save", async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, cart } = body;
    
    if (!sessionId) {
      return c.json({ success: false, error: "Session ID required" }, 400);
    }

    // Lazy import Supabase
    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { error } = await supabase
      .from("kv_store_bbc0c500")
      .upsert({ 
        key: `cart_session_${sessionId}`, 
        value: JSON.stringify(cart) 
      });
    
    if (error) {
      console.error("Cart save error:", error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Cart save exception:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

app.get("/make-server-bbc0c500/cart/load/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    
    // Lazy import Supabase
    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { data, error } = await supabase
      .from("kv_store_bbc0c500")
      .select("value")
      .eq("key", `cart_session_${sessionId}`)
      .maybeSingle();
    
    if (error) {
      console.error("Cart load error:", error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    return c.json({ 
      success: true, 
      cart: data ? JSON.parse(data.value) : [] 
    });
  } catch (error) {
    console.error("Cart load exception:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

app.delete("/make-server-bbc0c500/cart/clear/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    
    // Lazy import Supabase
    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { error } = await supabase
      .from("kv_store_bbc0c500")
      .delete()
      .eq("key", `cart_session_${sessionId}`);
    
    if (error) {
      console.error("Cart clear error:", error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Cart clear exception:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Check Resend configuration endpoint
app.get("/make-server-bbc0c500/test-resend", async (c) => {
  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendKey) {
      return c.json({ 
        configured: false,
        message: "RESEND_API_KEY is not set in environment variables"
      });
    }

    // Just verify the format, don't actually test
    const hasValidFormat = resendKey.startsWith('re_');
    
    return c.json({ 
      configured: true,
      hasValidFormat,
      keyLength: resendKey.length,
      message: hasValidFormat 
        ? "Resend API key is configured and has valid format" 
        : "Resend API key is configured but format looks incorrect"
    });
  } catch (error) {
    console.error("Resend check error:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Track Unsplash searches
app.post("/make-server-bbc0c500/unsplash/track-search", async (c) => {
  try {
    const body = await c.req.json();
    const { query } = body;
    
    if (!query || !query.trim()) {
      return c.json({ success: true, message: "Empty query, not tracked" });
    }

    // Lazy import Supabase
    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const timestamp = new Date().toISOString();
    const searchKey = `unsplash_search_${timestamp}_${Math.random().toString(36).substring(7)}`;
    
    const { error } = await supabase
      .from("kv_store_bbc0c500")
      .insert({ 
        key: searchKey, 
        value: JSON.stringify({ 
          query: query.trim(),
          timestamp 
        }) 
      });
    
    if (error) {
      console.error("Search tracking error:", error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Search tracking exception:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Get Unsplash search stats
app.get("/make-server-bbc0c500/unsplash/search-stats", async (c) => {
  try {
    // Lazy import Supabase
    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { data, error } = await supabase
      .from("kv_store_bbc0c500")
      .select("value")
      .like("key", "unsplash_search_%");
    
    if (error) {
      console.error("Search stats error:", error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    const searches = data?.map(row => JSON.parse(row.value)) || [];
    
    // Count query frequency
    const queryCount: Record<string, number> = {};
    searches.forEach(search => {
      const query = search.query.toLowerCase();
      queryCount[query] = (queryCount[query] || 0) + 1;
    });
    
    // Sort by frequency
    const topSearches = Object.entries(queryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([query, count]) => ({ query, count }));
    
    return c.json({ 
      success: true, 
      totalSearches: searches.length,
      topSearches 
    });
  } catch (error) {
    console.error("Search stats exception:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Get Unsplash settings
app.get("/make-server-bbc0c500/unsplash/settings", async (c) => {
  try {
    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { data, error } = await supabase
      .from("kv_store_bbc0c500")
      .select("value")
      .eq("key", "unsplash_settings")
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Settings load error:", error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    return c.json({ 
      success: true, 
      settings: data ? JSON.parse(data.value) : null 
    });
  } catch (error) {
    console.error("Settings load exception:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Save Unsplash settings
app.post("/make-server-bbc0c500/unsplash/settings", async (c) => {
  try {
    const body = await c.req.json();
    const { settings } = body;
    
    if (!settings) {
      return c.json({ success: false, error: "Settings required" }, 400);
    }

    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { error } = await supabase
      .from("kv_store_bbc0c500")
      .upsert({ 
        key: "unsplash_settings", 
        value: JSON.stringify(settings) 
      });
    
    if (error) {
      console.error("Settings save error:", error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Settings save exception:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Test email endpoint
app.post("/make-server-bbc0c500/send-test-email", async (c) => {
  try {
    const body = await c.req.json();
    const { to, subject, message } = body;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!resendKey || !resendKey.startsWith("re_")) {
      return c.json({ 
        success: false, 
        error: "RESEND_API_KEY not configured" 
      }, 500);
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "BlueHand Canvas <onboarding@resend.dev>",
        to: [to || "octavian.dumitrescu@gmail.com"],
        subject: subject || "Test Email from BlueHand Canvas",
        html: message || "<h1>Test Successful</h1><p>Your email service is working correctly!</p>",
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "Failed to send email");
    }
    
    return c.json({ success: true, emailId: result.id });
  } catch (error) {
    console.error("Email send exception:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Send order confirmation email
app.post("/make-server-bbc0c500/send-order-confirmation", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      orderNumber, 
      customerName, 
      customerEmail, 
      total, 
      items = [],
      deliveryMethod,
      paymentMethod,
      address,
      city,
      county,
      postalCode
    } = body;

    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!resendKey || !resendKey.startsWith("re_")) {
      console.error("❌ RESEND_API_KEY not configured");
      return c.json({ 
        success: false, 
        error: "RESEND_API_KEY not configured" 
      }, 500);
    }

    console.log(`📧 Sending order confirmation for #${orderNumber} to ${customerEmail} and admin`);

    // Calculate delivery price
    const deliveryPrice = deliveryMethod === 'express' ? 25 : 
                          deliveryMethod === 'standard' ? 15 : 10;
    const subtotal = total - deliveryPrice;

    // Delivery label
    const deliveryLabel = deliveryMethod === 'express' ? 'Express (1-4 ore)' :
                          deliveryMethod === 'standard' ? 'Standard (24-48 ore)' : 
                          'Economic (3-4 zile)';

    // Payment label
    const paymentLabel = paymentMethod === 'card' ? 'Card Bancar' : 'Ramburs (Numerar la Livrare)';

    // Build items HTML
    let itemsHtml = '';
    items.forEach((item: any, index: number) => {
      if (item.type === 'personalized') {
        itemsHtml += `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 15px 12px;">
              <strong>Tablou Personalizat</strong><br>
              <span style="color: #6b7280; font-size: 14px;">Dimensiune: ${item.size || 'N/A'}</span>
            </td>
            <td style="padding: 15px 12px; text-align: right;">${item.price.toFixed(2)} lei</td>
          </tr>
        `;
      } else {
        itemsHtml += `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 15px 12px;">
              <strong>${item.paintingTitle}</strong><br>
              <span style="color: #6b7280; font-size: 14px;">
                Dimensiune: ${item.size || 'N/A'}${item.printType ? ` • ${item.printType}` : ''}${item.frameType ? ` • ${item.frameType}` : ''}
              </span>
            </td>
            <td style="padding: 15px 12px; text-align: right;">${item.price.toFixed(2)} lei</td>
          </tr>
        `;
      }
    });

    // Generate email HTML using the template
    const emailHtml = getOrderConfirmationEmailHtml({
      orderNumber,
      customerName,
      customerEmail,
      total,
      itemsHtml,
      subtotal,
      deliveryLabel,
      deliveryPrice,
      paymentLabel,
      address: address || 'N/A',
      city: city || 'N/A',
      county: county || 'N/A',
      postalCode: postalCode || 'N/A'
    });

    // In testing mode, Resend can only send to the verified email (octavian.dumitrescu@gmail.com)
    // So we only send to the admin email and include customer info in the email content
    const adminEmail = "octavian.dumitrescu@gmail.com";
    const isTestingMode = true; // Set to false when domain is verified
    const recipients = isTestingMode ? [adminEmail] : [customerEmail, adminEmail];
    
    // Add a note at the top if in testing mode
    const finalEmailHtml = isTestingMode 
      ? `<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 20px;">
           <strong>⚠️ Mod Testare</strong><br>
           <span style="font-size: 14px;">
             Acest email ar fi trebuit trimis la: <strong>${customerEmail}</strong><br>
             Pentru a trimite emailuri către clienți, verifică un domeniu la 
             <a href="https://resend.com/domains" style="color: #2563eb;">resend.com/domains</a>
           </span>
         </div>${emailHtml}`
      : emailHtml;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "BlueHand Canvas <onboarding@resend.dev>",
        to: recipients,
        subject: `✅ Comandă Confirmată #${orderNumber} - BlueHand Canvas${isTestingMode ? ' [Mod Testare]' : ''}`,
        html: finalEmailHtml,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("❌ Resend API error:", result);
      throw new Error(result.message || "Failed to send email");
    }
    
    console.log(`✅ Order confirmation email sent successfully (ID: ${result.id})`);
    return c.json({ success: true, emailId: result.id });
  } catch (error) {
    console.error("❌ Order confirmation email exception:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// ============ PAINTING METADATA ROUTES ============

// Get metadata for a single painting
app.get("/make-server-bbc0c500/painting-metadata/:id", async (c) => {
  const paintingId = c.req.param("id");
  const result = await paintingMetadataHandlers.get(paintingId);
  return c.json(result);
});

// Set/update metadata for a painting
app.post("/make-server-bbc0c500/painting-metadata/:id", async (c) => {
  const paintingId = c.req.param("id");
  const metadata = await c.req.json();
  const result = await paintingMetadataHandlers.set(paintingId, metadata);
  return c.json(result);
});

// Delete metadata for a painting
app.delete("/make-server-bbc0c500/painting-metadata/:id", async (c) => {
  const paintingId = c.req.param("id");
  const result = await paintingMetadataHandlers.delete(paintingId);
  return c.json(result);
});

// Get metadata for multiple paintings
app.post("/make-server-bbc0c500/painting-metadata-many", async (c) => {
  const { paintingIds } = await c.req.json();
  const result = await paintingMetadataHandlers.getMany(paintingIds);
  return c.json(result);
});

// ============ DB OPTIMIZATION ROUTES ============

// Optimize database
app.post("/make-server-bbc0c500/db/optimize", async (c) => {
  const result = await dbOptimizationHandlers.optimize();
  return c.json(result);
});

// KV Store endpoints for legal pages
// Get a key from kv_store
app.get("/make-server-bbc0c500/kv/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const kv = await import('./kv_store.tsx');
    const value = await kv.get(key);
    
    if (value === null) {
      return c.json({ key, value: null }, 404);
    }
    
    return c.json({ key, value });
  } catch (error) {
    console.error('❌ KV get error:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Set a key in kv_store
app.post("/make-server-bbc0c500/kv/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const body = await c.req.json();
    const { value } = body;
    
    if (value === undefined) {
      return c.json({ error: 'Value is required' }, 400);
    }
    
    const kv = await import('./kv_store.tsx');
    await kv.set(key, value);
    
    return c.json({ success: true, key, value });
  } catch (error) {
    console.error('❌ KV set error:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Delete a key from kv_store
app.delete("/make-server-bbc0c500/kv/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const kv = await import('./kv_store.tsx');
    await kv.del(key);
    
    return c.json({ success: true, key });
  } catch (error) {
    console.error('❌ KV delete error:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, 500);
  }
});

// Catch all 404
app.all("*", (c) => {
  return c.json({ 
    error: "Not found", 
    path: c.req.path,
    method: c.req.method 
  }, 404);
});

// Start server
Deno.serve(app.fetch);