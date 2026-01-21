// BlueHand Canvas - Supabase Edge Function Server
// Handles email sending with Resend API
// Last updated: 2026-01-20

import { Hono } from "npm:hono@4.3.11";
import { cors } from "npm:hono@4.3.11/cors";
import { logger } from "npm:hono@4.3.11/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// CORS - Allow all origins
app.use("*", cors({
  origin: "*",
  allowHeaders: ["*"],
  allowMethods: ["*"],
}));

// Logger
app.use('*', logger(console.log));

// Health check
app.get("/make-server-bbc0c500/health", (c) => {
  return c.json({ 
    status: "ok",
    message: "BlueHand Canvas API is running",
    timestamp: new Date().toISOString() 
  });
});

// Get email settings
app.get("/make-server-bbc0c500/email/settings", async (c) => {
  try {
    const settings = await kv.get('email_settings');
    return c.json({ 
      success: true, 
      settings: settings || {
        apiKey: '',
        fromEmail: 'hello@bluehand.ro',
        fromName: 'BlueHand Canvas',
        isConfigured: false
      }
    });
  } catch (error) {
    console.error('Error getting email settings:', error);
    return c.json({ success: false, error: 'Failed to get settings' }, 500);
  }
});

// Save email settings
app.post("/make-server-bbc0c500/email/settings", async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set('email_settings', settings);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving email settings:', error);
    return c.json({ success: false, error: 'Failed to save settings' }, 500);
  }
});

// Get Cloudinary settings
app.get("/make-server-bbc0c500/cloudinary/settings", async (c) => {
  try {
    const settings = await kv.get('cloudinary_settings');
    return c.json({ 
      success: true, 
      settings: settings || {
        cloudName: '',
        uploadPreset: '',
        apiKey: '',
        isConfigured: false
      }
    });
  } catch (error) {
    console.error('Error getting Cloudinary settings:', error);
    return c.json({ success: false, error: 'Failed to get settings' }, 500);
  }
});

// Save Cloudinary settings
app.post("/make-server-bbc0c500/cloudinary/settings", async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set('cloudinary_settings', settings);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving Cloudinary settings:', error);
    return c.json({ success: false, error: 'Failed to save settings' }, 500);
  }
});

// Send test email using Resend
app.post("/make-server-bbc0c500/email/test", async (c) => {
  try {
    const { to } = await c.req.json();
    
    if (!to) {
      return c.json({ success: false, error: 'Email address is required' }, 400);
    }

    // Get email settings
    const settings = await kv.get<{
      apiKey: string;
      fromEmail: string;
      fromName: string;
      isConfigured: boolean;
    }>('email_settings');

    if (!settings || !settings.apiKey) {
      return c.json({ 
        success: false, 
        error: 'Email settings not configured. Please save your Resend API key first.' 
      }, 400);
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${settings.fromName} <${settings.fromEmail}>`,
        to: [to],
        subject: 'Test Email - BlueHand Canvas',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7B93FF; margin-bottom: 20px;">Test Email</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              Acesta este un email de test de la sistemul BlueHand Canvas.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              Dacă ai primit acest email, înseamnă că configurarea Resend funcționează corect!
            </p>
            <div style="margin-top: 30px; padding: 15px; background-color: #f0f4ff; border-left: 4px solid #7B93FF; border-radius: 4px;">
              <p style="margin: 0; color: #555; font-size: 14px;">
                <strong>Detalii configurare:</strong><br>
                From: ${settings.fromName} &lt;${settings.fromEmail}&gt;<br>
                To: ${to}<br>
                Timestamp: ${new Date().toISOString()}
              </p>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              BlueHand Canvas - Romanian Canvas Art E-commerce
            </p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return c.json({ 
        success: false, 
        error: data.message || 'Failed to send email via Resend' 
      }, response.status);
    }

    console.log('✅ Test email sent successfully:', data);
    return c.json({ 
      success: true, 
      message: 'Email sent successfully',
      emailId: data.id 
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, 500);
  }
});

// Send order confirmation email
app.post("/make-server-bbc0c500/email/send-order-confirmation", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      orderNumber, 
      customerName, 
      customerEmail, 
      total, 
      items, 
      deliveryMethod, 
      paymentMethod,
      address,
      city,
      county,
      postalCode,
      deliveryPrice
    } = body;
    
    if (!customerEmail || !orderNumber) {
      return c.json({ success: false, error: 'Email and order number are required' }, 400);
    }

    // Use RESEND_API_KEY from environment
    const apiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      return c.json({ 
        success: false, 
        error: 'Email service not configured' 
      }, 500);
    }

    // Get email settings for from address
    const settings = await kv.get<{
      apiKey: string;
      fromEmail: string;
      fromName: string;
      isConfigured: boolean;
    }>('email_settings');

    // Use configured email settings or fallback to Resend's testing domain
    const fromEmail = settings?.fromEmail || 'onboarding@resend.dev';
    const fromName = settings?.fromName || 'BlueHand Canvas';

    console.log(`📧 Sending order confirmation email from: ${fromName} <${fromEmail}>`);

    // Format items for email with images and dimensions
    const itemsHtml = items.map((item: any, index: number) => {
      const itemTitle = item.paintingTitle || item.title || 'Tablou Personalizat';
      const itemSize = item.size || 'N/A';
      const itemImage = item.croppedImage || item.image || '';
      const itemQuantity = item.quantity || 1;
      const itemPrice = item.price ? item.price.toFixed(2) : '0.00';
      
      return `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #eee;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 80px; padding-right: 15px;">
                  ${itemImage ? `
                    <img src="${itemImage}" alt="${itemTitle}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;" />
                  ` : `
                    <div style="width: 80px; height: 80px; background-color: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd;">
                      <span style="color: #999; font-size: 12px;">Imagine</span>
                    </div>
                  `}
                </td>
                <td>
                  <strong style="color: #333; font-size: 14px;">${itemTitle}</strong><br>
                  <span style="color: #666; font-size: 13px;">📏 Dimensiune: ${itemSize}</span>
                  ${item.orientation ? `<br><span style="color: #666; font-size: 13px;">↔️ Orientare: ${item.orientation === 'portrait' ? 'Portrait' : 'Landscape'}</span>` : ''}
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center; vertical-align: middle;">
            <strong>${itemQuantity}</strong> buc
          </td>
          <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right; vertical-align: middle;">
            <strong style="color: #7B93FF;">${itemPrice} RON</strong>
          </td>
        </tr>
      `;
    }).join('');

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [customerEmail],
        subject: `Confirmare comandă #${orderNumber} - BlueHand Canvas`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <div style="background-color: #7B93FF; padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">BlueHand Canvas</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 20px;">
                <h2 style="color: #333; margin-bottom: 10px;">Mulțumim pentru comandă!</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                  Bună ${customerName},
                </p>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                  Comanda ta a fost înregistrată cu succes. Iată detaliile comenzii:
                </p>
                
                <!-- Order Number -->
                <div style="background-color: #f0f4ff; border-left: 4px solid #7B93FF; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #333;">
                    <strong>Număr comandă:</strong> #${orderNumber}
                  </p>
                </div>
                
                <!-- Order Items -->
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Produse comandate:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #f9f9f9;">
                      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Produs</th>
                      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Cantitate</th>
                      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Preț</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="padding: 10px; text-align: right; border-top: 2px solid #ddd;">
                        <strong>Subtotal:</strong>
                      </td>
                      <td style="padding: 10px; text-align: right; border-top: 2px solid #ddd;">
                        <strong>${(total - deliveryPrice).toFixed(2)} RON</strong>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding: 10px; text-align: right;">
                        Transport:
                      </td>
                      <td style="padding: 10px; text-align: right;">
                        ${deliveryPrice.toFixed(2)} RON
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding: 10px; text-align: right; border-top: 2px solid #7B93FF;">
                        <strong style="font-size: 18px;">TOTAL:</strong>
                      </td>
                      <td style="padding: 10px; text-align: right; border-top: 2px solid #7B93FF;">
                        <strong style="font-size: 18px; color: #7B93FF;">${total.toFixed(2)} RON</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
                
                <!-- Delivery Details -->
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Detalii livrare:</h3>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px;">
                  <p style="margin: 5px 0; color: #666;"><strong>Adresă:</strong> ${address}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Oraș:</strong> ${city}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Județ:</strong> ${county}</p>
                  ${postalCode ? `<p style="margin: 5px 0; color: #666;"><strong>Cod poștal:</strong> ${postalCode}</p>` : ''}
                  <p style="margin: 5px 0; color: #666;"><strong>Metodă livrare:</strong> ${
                    deliveryMethod === 'express' ? 'Curier Express (1-4 ore)' :
                    deliveryMethod === 'economic' ? 'Curier Economic (3-4 zile)' :
                    'Curier Standard (24-48 ore)'
                  }</p>
                  <p style="margin: 5px 0; color: #666;"><strong>Metodă plată:</strong> ${paymentMethod === 'card' ? 'Card online' : 'Ramburs (cash la livrare)'}</p>
                </div>
                
                <!-- Next Steps -->
                <div style="background-color: #fffbeb; border-left: 4px solid #fbbf24; padding: 15px; margin: 30px 0;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>Următorii pași:</strong><br>
                    Vei primi un email de confirmare când comanda ta va fi pregătită pentru livrare. 
                    De obicei, procesăm comenzile în 2-3 zile lucrătoare.
                  </p>
                </div>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6; margin-top: 30px;">
                  Dacă ai întrebări despre comanda ta, nu ezita să ne contactezi.
                </p>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                  Cu stimă,<br>
                  <strong>Echipa BlueHand Canvas</strong>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                <p style="margin: 0; color: #999; font-size: 12px;">
                  BlueHand Canvas - Canvas Art din România<br>
                  Email: hello@bluehand.ro | Website: bluehand.ro
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Resend API error:', data);
      return c.json({ 
        success: false, 
        error: data.message || 'Failed to send email via Resend' 
      }, response.status);
    }

    console.log('✅ Order confirmation email sent successfully:', data);
    return c.json({ 
      success: true, 
      message: 'Order confirmation email sent',
      emailId: data.id 
    });

  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, 500);
  }
});

// Send shipped confirmation email
app.post("/make-server-bbc0c500/email/send-shipped-confirmation", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      orderNumber, 
      customerName, 
      customerEmail
    } = body;
    
    if (!customerEmail || !orderNumber) {
      return c.json({ success: false, error: 'Email and order number are required' }, 400);
    }

    // Use RESEND_API_KEY from environment
    const apiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      return c.json({ 
        success: false, 
        error: 'Email service not configured' 
      }, 500);
    }

    // Get email settings for from address
    const settings = await kv.get<{
      apiKey: string;
      fromEmail: string;
      fromName: string;
      isConfigured: boolean;
    }>('email_settings');

    // Use configured email settings or fallback to Resend's testing domain
    const fromEmail = settings?.fromEmail || 'onboarding@resend.dev';
    const fromName = settings?.fromName || 'BlueHand Canvas';

    console.log(`📧 Sending shipped confirmation email from: ${fromName} <${fromEmail}>`);

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [customerEmail],
        subject: `Comanda ta #${orderNumber} a fost expediată! 📦 - BlueHand Canvas`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <div style="background-color: #10b981; padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">📦 Comanda Ta Este În Drum!</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 20px;">
                <h2 style="color: #333; margin-bottom: 10px;">Bună ${customerName}! 👋</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                  Avem vești excelente! Comanda ta a fost expediată și este în drum spre tine.
                </p>
                
                <!-- Order Number -->
                <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #333;">
                    <strong>Număr comandă:</strong> #${orderNumber}
                  </p>
                  <p style="margin: 10px 0 0 0; color: #333;">
                    <strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">✓ LIVRAT (În tranzit)</span>
                  </p>
                </div>
                
                <!-- Delivery Info -->
                <div style="background-color: #fffbeb; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>🚚 Informații de livrare:</strong><br>
                    Comanda ta va fi livrată în funcție de metoda de livrare selectată. Vei fi contactat de curier înainte de livrare.
                  </p>
                </div>
                
                <!-- Important Info -->
                <div style="background-color: #f0f4ff; border-left: 4px solid #7B93FF; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #333; font-size: 14px;">
                    <strong>💡 Sfaturi importante:</strong><br>
                    • Verifică tabloul imediat la primire<br>
                    • Contactează-ne dacă observi daune în timpul transportului<br>
                    • Păstrează ambalajul original pentru eventuale returnări
                  </p>
                </div>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6; margin-top: 30px;">
                  Mulțumim că ai ales BlueHand Canvas! Ne bucurăm că tabloul tău va ajunge în curând la tine.
                </p>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                  Dacă ai întrebări, nu ezita să ne contactezi la <a href="mailto:hello@bluehand.ro" style="color: #7B93FF; text-decoration: none;">hello@bluehand.ro</a>
                </p>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                  Cu drag,<br>
                  <strong>Echipa BlueHand Canvas</strong>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                <p style="margin: 0; color: #999; font-size: 12px;">
                  BlueHand Canvas - Canvas Art din România<br>
                  Email: hello@bluehand.ro | Website: bluehand.ro
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Resend API error:', data);
      return c.json({ 
        success: false, 
        error: data.message || 'Failed to send email via Resend' 
      }, response.status);
    }

    console.log('✅ Shipped confirmation email sent successfully:', data);
    return c.json({ 
      success: true, 
      message: 'Shipped confirmation email sent',
      emailId: data.id 
    });

  } catch (error) {
    console.error('❌ Error sending shipped confirmation email:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, 500);
  }
});

// Update default users (migration endpoint)
app.post("/make-server-bbc0c500/admin/update-default-users", async (c) => {
  try {
    // Import Supabase client
    const { createClient } = await import('npm:@supabase/supabase-js@2.39.7');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const defaultUsers = [
      {
        username: 'admin',
        fullName: 'Octavian Dumitrescu',
        email: 'octavian.dumitrescu@gmail.com',
        role: 'full-admin'
      },
      {
        username: 'account',
        fullName: 'Sophie Noelle',
        email: 'sophienoelle01@gmail.com',
        role: 'account-manager'
      },
      {
        username: 'production',
        fullName: 'Florin',
        email: 'hello@bluehand.ro',
        role: 'production'
      }
    ];

    const results = [];

    for (const user of defaultUsers) {
      // Update user by username
      const { data, error } = await supabase
        .from('admin_users')
        .update({
          full_name: user.fullName,
          email: user.email,
          role: user.role
        })
        .eq('username', user.username)
        .select()
        .single();

      if (error) {
        console.error(`Error updating user ${user.username}:`, error);
        results.push({ username: user.username, success: false, error: error.message });
      } else {
        console.log(`✅ Updated user: ${user.username} -> ${user.fullName}`);
        results.push({ username: user.username, success: true, data });
      }
    }

    return c.json({ 
      success: true, 
      message: 'Default users updated',
      results 
    });
  } catch (error) {
    console.error('Error updating default users:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, 500);
  }
});

// ===== LEGAL PAGES KV ROUTES =====

// Health check for KV store
app.get("/make-server-bbc0c500/kv/health", async (c) => {
  try {
    // Test basic KV operations
    const testKey = 'kv_health_test';
    await kv.set(testKey, { test: true, timestamp: Date.now() });
    const testValue = await kv.get(testKey);
    await kv.del(testKey);
    
    return c.json({ 
      status: 'ok',
      message: 'KV store is working',
      test: testValue 
    });
  } catch (error) {
    console.error('KV health check failed:', error);
    return c.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'KV store error' 
    }, 500);
  }
});

// Get terms content
app.get("/make-server-bbc0c500/kv/legal_pages_terms", async (c) => {
  try {
    console.log('📖 Getting terms content...');
    const value = await kv.get('legal_pages_terms');
    console.log('✅ Terms value:', value);
    return c.json({ value: value || null });
  } catch (error) {
    console.error('❌ Error getting terms:', error);
    return c.json({ 
      value: null,
      error: error instanceof Error ? error.message : 'Failed to get terms' 
    }, 200); // Return 200 with null value instead of error
  }
});

// Save terms content
app.post("/make-server-bbc0c500/kv/legal_pages_terms", async (c) => {
  try {
    const body = await c.req.json();
    const { value } = body;
    
    console.log('💾 Saving terms content...');
    await kv.set('legal_pages_terms', value);
    console.log('✅ Terms saved successfully');
    
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error saving terms:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save terms' 
    }, 500);
  }
});

// Delete terms content
app.delete("/make-server-bbc0c500/kv/legal_pages_terms", async (c) => {
  try {
    console.log('🗑️ Deleting terms content...');
    await kv.del('legal_pages_terms');
    console.log('✅ Terms deleted successfully');
    
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting terms:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete terms' 
    }, 500);
  }
});

// Get GDPR content
app.get("/make-server-bbc0c500/kv/legal_pages_gdpr", async (c) => {
  try {
    console.log('📖 Getting GDPR content...');
    const value = await kv.get('legal_pages_gdpr');
    console.log('✅ GDPR value:', value);
    return c.json({ value: value || null });
  } catch (error) {
    console.error('❌ Error getting GDPR:', error);
    return c.json({ 
      value: null,
      error: error instanceof Error ? error.message : 'Failed to get GDPR' 
    }, 200); // Return 200 with null value instead of error
  }
});

// Save GDPR content
app.post("/make-server-bbc0c500/kv/legal_pages_gdpr", async (c) => {
  try {
    const body = await c.req.json();
    const { value } = body;
    
    console.log('💾 Saving GDPR content...');
    await kv.set('legal_pages_gdpr', value);
    console.log('✅ GDPR saved successfully');
    
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error saving GDPR:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save GDPR' 
    }, 500);
  }
});

// Delete GDPR content
app.delete("/make-server-bbc0c500/kv/legal_pages_gdpr", async (c) => {
  try {
    console.log('🗑️ Deleting GDPR content...');
    await kv.del('legal_pages_gdpr');
    console.log('✅ GDPR deleted successfully');
    
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting GDPR:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete GDPR' 
    }, 500);
  }
});

// Catch-all route
app.all("*", (c) => {
  return c.json({ 
    error: "Not Found",
    message: "This endpoint does not exist",
    path: c.req.path
  }, 404);
});

// Start server
Deno.serve(app.fetch);