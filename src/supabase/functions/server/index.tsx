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

// Get Netopia settings
app.get("/make-server-bbc0c500/netopia/settings", async (c) => {
  try {
    const settings = await kv.get('netopia_settings');
    return c.json({ 
      success: true, 
      settings: settings || {
        merchantId: '',
        apiKey: '',
        posSignature: '',
        publicKey: '',
        isLive: false,
        isConfigured: false
      }
    });
  } catch (error) {
    console.error('Error getting Netopia settings:', error);
    return c.json({ success: false, error: 'Failed to get settings' }, 500);
  }
});

// Save Netopia settings
app.post("/make-server-bbc0c500/netopia/settings", async (c) => {
  try {
    const settings = await c.req.json();
    
    // Add isConfigured flag based on required fields
    // Public Key and POS Signature are required; Private Key (apiKey) is optional
    const isConfigured = !!(settings.posSignature && settings.publicKey);
    
    // Ensure isLive is a boolean (defaults to false for sandbox)
    const settingsToSave = {
      ...settings,
      isLive: settings.isLive === true,
      isConfigured
    };
    
    await kv.set('netopia_settings', settingsToSave);
    
    console.log(`✅ Netopia settings saved. Configured: ${isConfigured}, Mode: ${settingsToSave.isLive ? 'LIVE' : 'TEST'}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving Netopia settings:', error);
    return c.json({ success: false, error: 'Failed to save settings' }, 500);
  }
});

// Test Netopia connection
app.post("/make-server-bbc0c500/netopia/test", async (c) => {
  try {
    const settings = await kv.get<{
      merchantId: string;
      apiKey: string;
      posSignature: string;
      publicKey: string;
      isLive: boolean;
      isConfigured: boolean;
    }>('netopia_settings');

    if (!settings || !settings.posSignature || !settings.publicKey) {
      return c.json({ 
        success: false, 
        error: 'Netopia settings not configured. Please save your POS Signature and Public Key first.' 
      }, 400);
    }

    // For now, just verify that settings exist
    // Netopia doesn't have a simple "test connection" endpoint
    // The real test will happen when initiating an actual payment
    
    const environment = settings.isLive ? 'live' : 'sandbox';
    const baseUrl = settings.isLive 
      ? 'https://secure.netopia-payments.com' 
      : 'https://secure.sandbox.netopia-payments.com';

    console.log(`✅ Netopia settings validated for ${environment} environment`);
    console.log(`🔗 Base URL: ${baseUrl}`);
    console.log(`🔑 API Key configured: ${settings.apiKey ? 'Yes' : 'No'}`);
    console.log(`🔑 POS Signature configured: ${settings.posSignature ? 'Yes' : 'No'}`);
    console.log(`🔑 Public Key configured: ${settings.publicKey ? 'Yes' : 'No'}`);

    return c.json({ 
      success: true, 
      message: `Configurare validată! Environment: ${environment.toUpperCase()}. Pentru a testa plata efectiv, plasează o comandă de test.`,
      environment: environment,
      baseUrl: baseUrl,
      hasApiKey: !!settings.apiKey,
      hasPosSignature: !!settings.posSignature,
      hasPublicKey: !!settings.publicKey
    });

  } catch (error) {
    console.error('Error testing Netopia connection:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, 500);
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
                    <strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">✓ Expediată (În tranzit)</span>
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

// ===== NETOPIA PAYMENTS INTEGRATION =====

// Initiate Netopia payment
app.post("/make-server-bbc0c500/netopia/start-payment", async (c) => {
  try {
    const body = await c.req.json();
    const { orderId, amount, customerEmail, customerName, returnUrl } = body;

    if (!orderId || !amount || !customerEmail || !customerName) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields: orderId, amount, customerEmail, customerName' 
      }, 400);
    }

    // Get Netopia settings from KV store
    const settings = await kv.get<{
      posSignature: string;
      apiKey: string;
      publicKey: string;
      isLive: boolean;
      isConfigured: boolean;
    }>('netopia_settings');

    if (!settings || !settings.posSignature || !settings.publicKey || !settings.isConfigured) {
      console.error('❌ Netopia settings not configured');
      return c.json({ 
        success: false, 
        error: 'Netopia payment gateway not configured. Please contact support.' 
      }, 500);
    }

    // Get API key from environment (sandbox requires API key authentication)
    const netopiaSandboxApiKey = Deno.env.get('NETOPIA_API_KEY');
    
    if (!settings.isLive && !netopiaSandboxApiKey) {
      console.error('❌ Netopia sandbox API key not configured');
      return c.json({ 
        success: false, 
        error: 'Netopia sandbox API key not configured. Please contact support.' 
      }, 500);
    }

    // Determine API endpoint based on environment
    const environment = settings.isLive ? 'live' : 'sandbox';
    const baseUrl = settings.isLive 
      ? 'https://secure.netopia-payments.com'
      : 'https://secure.sandbox.netopia-payments.com';

    console.log(`💳 Initiating Netopia payment for order ${orderId}, amount: ${amount} RON`);
    console.log(`🔗 Using environment: ${environment}`);
    console.log(`🔗 Base URL: ${baseUrl}`);
    console.log(`🔑 POS Signature being used: "${settings.posSignature}"`);
    console.log(`🔑 POS Signature length: ${settings.posSignature.length} characters`);
    if (!settings.isLive && netopiaSandboxApiKey) {
      console.log(`🔑 API Key configured: ${netopiaSandboxApiKey.substring(0, 10)}...`);
    }

    // Parse customer name
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || 'BlueHand';

    // Create timestamp
    const date = new Date();
    const timestamp = date.getTime();

    // Get the base URL for callbacks
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const projectUrl = supabaseUrl.replace('https://', '');

    // Prepare payment data according to Netopia XML structure
    const paymentData = {
      order: {
        $: {
          id: orderId,
          timestamp: timestamp,
          type: "card",
        },
        signature: settings.posSignature,
        url: {
          return: returnUrl || `https://${projectUrl.split('.')[0]}.supabase.co/payment-success?orderId=${orderId}`,
          confirm: `https://${projectUrl}/functions/v1/make-server-bbc0c500/netopia/ipn`,
        },
        invoice: {
          $: {
            currency: "RON",
            amount: amount,
          },
          details: `Comanda BlueHand Canvas #${orderId}`,
          contact_info: {
            billing: {
              $: {
                type: "person",
              },
              first_name: firstName,
              last_name: lastName,
              address: "Romania",
              email: customerEmail,
              mobile_phone: "",
            },
            shipping: {
              $: {
                type: "person",
              },
              first_name: firstName,
              last_name: lastName,
              address: "Romania",
              email: customerEmail,
              mobile_phone: "",
            },
          },
        },
        ipn_cipher: "aes-256-cbc",
      },
    };

    console.log(`📝 Payment data prepared:`, JSON.stringify(paymentData, null, 2));

    // Import required libraries for XML building and encryption
    const { Builder } = await import('npm:xml2js@0.6.2');
    const crypto = await import('node:crypto');
    const forgeModule = await import('npm:node-forge@1.3.1');
    // node-forge may export as default or named, handle both
    const forge = forgeModule.default || forgeModule;
    
    // Build XML from payment data
    const builder = new Builder({ cdata: true });
    const xml = builder.buildObject(paymentData);
    
    console.log(`📄 Generated XML:`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(xml);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📏 XML length: ${xml.length} characters`);
    
    // Encrypt the payment data
    // 1. Generate random AES key and IV
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // 2. Encrypt XML with AES-256-CBC
    const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
    let encryptedData = cipher.update(xml, 'utf8', 'base64');
    encryptedData += cipher.final('base64');

    // 3. Encrypt AES key with RSA public key
    // Handle both PKCS#1 (RSA PUBLIC KEY) and PKCS#8 (PUBLIC KEY) formats
    let publicKeyFormatted = settings.publicKey;
    
    console.log('🔑 Public key format check...');
    console.log('Key length:', publicKeyFormatted.length);
    console.log('Key preview (first 100 chars):', publicKeyFormatted.substring(0, 100));
    console.log('Key preview (last 50 chars):', publicKeyFormatted.substring(publicKeyFormatted.length - 50));
    console.log('Contains "BEGIN RSA PUBLIC KEY":', publicKeyFormatted.includes('BEGIN RSA PUBLIC KEY'));
    console.log('Contains "BEGIN PUBLIC KEY":', publicKeyFormatted.includes('BEGIN PUBLIC KEY'));
    console.log('Contains "BEGIN CERTIFICATE":', publicKeyFormatted.includes('BEGIN CERTIFICATE'));
    
    // Convert PKCS#1 to PKCS#8 if needed using node-forge
    if (publicKeyFormatted.includes('BEGIN RSA PUBLIC KEY')) {
      console.log('🔄 Converting RSA PUBLIC KEY (PKCS#1) to PUBLIC KEY (PKCS#8)...');
      try {
        // Parse PKCS#1 key
        const publicKeyPem = publicKeyFormatted.trim();
        console.log('Attempting to parse with node-forge...');
        const publicKeyForge = forge.pki.publicKeyFromPem(publicKeyPem);
        console.log('✅ Parsed successfully with node-forge');
        
        // Convert to PKCS#8 (SubjectPublicKeyInfo)
        const publicKeyAsn1 = forge.pki.publicKeyToAsn1(publicKeyForge);
        const publicKeyInfo = forge.pki.wrapRsaPublicKey(publicKeyAsn1);
        publicKeyFormatted = forge.pki.publicKeyInfoToPem(publicKeyInfo);
        
        console.log('✅ Key converted successfully');
        console.log('New key preview (first 100 chars):', publicKeyFormatted.substring(0, 100));
      } catch (conversionError) {
        console.error('❌ Key conversion failed:', conversionError);
        return c.json({
          success: false,
          error: `Failed to convert public key format: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}`
        }, 500);
      }
    } else if (publicKeyFormatted.includes('BEGIN CERTIFICATE')) {
      console.log('🔄 Extracting public key from certificate...');
      try {
        // Parse certificate and extract public key
        const cert = forge.pki.certificateFromPem(publicKeyFormatted.trim());
        const publicKeyForge = cert.publicKey;
        
        // Convert public key directly to PEM (PKCS#8 format)
        publicKeyFormatted = forge.pki.publicKeyToPem(publicKeyForge);
        
        console.log('✅ Public key extracted from certificate');
        console.log('New key preview (first 100 chars):', publicKeyFormatted.substring(0, 100));
      } catch (certError) {
        console.error('❌ Certificate parsing failed:', certError);
        return c.json({
          success: false,
          error: `Failed to extract public key from certificate: ${certError instanceof Error ? certError.message : 'Unknown error'}`
        }, 500);
      }
    } else if (!publicKeyFormatted.includes('BEGIN PUBLIC KEY')) {
      console.error('❌ Invalid public key format. Must be PEM format.');
      return c.json({
        success: false,
        error: 'Invalid public key format. Please upload a PEM-formatted public key (BEGIN PUBLIC KEY, BEGIN RSA PUBLIC KEY, or BEGIN CERTIFICATE)'
      }, 500);
    } else {
      console.log('✅ Key is already in PKCS#8 format (BEGIN PUBLIC KEY)');
    }

    let encryptedKey;
    try {
      console.log('🔐 Attempting RSA encryption...');
      encryptedKey = crypto.publicEncrypt(
        {
          key: publicKeyFormatted,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        aesKey
      );
      console.log('✅ AES key encrypted successfully with RSA public key');
    } catch (encryptError) {
      console.error('❌ RSA encryption failed:', encryptError);
      console.error('Key that failed (first 200 chars):', publicKeyFormatted.substring(0, 200));
      return c.json({
        success: false,
        error: `Failed to encrypt payment data: ${encryptError instanceof Error ? encryptError.message : 'RSA encryption error'}. Please verify your public key is correct.`
      }, 500);
    }

    const encryptedPayload = {
      env_key: encryptedKey.toString('base64'),
      data: encryptedData,
      iv: iv.toString('base64'),
      cipher: 'aes-256-cbc'
    };

    console.log(`🔐 Payment data encrypted successfully`);
    
    // Store payment info in KV for tracking
    await kv.set(`netopia_payment:${orderId}`, {
      orderId,
      amount,
      currency: 'RON',
      status: 'pending',
      customerEmail,
      customerName,
      timestamp,
      createdAt: new Date().toISOString(),
    });

    // Make server-to-server API call to Netopia with Authorization header
    const paymentUrl = `${baseUrl}/payment/card/start`;
    
    console.log(`🔗 Payment URL: ${paymentUrl}`);
    console.log(`🚀 Making server-to-server API call to Netopia...`);
    console.log(`🔑 API Key (first 20 chars): ${netopiaSandboxApiKey?.substring(0, 20)}...`);
    
    try {
      // Netopia expects JSON format with merchant identification
      // Try multiple possible field names for POS identification
      const requestBody = {
        env_key: encryptedPayload.env_key,
        data: encryptedPayload.data,
        // Try different possible field names for merchant identification
        posSignature: settings.posSignature,
        signature: settings.posSignature,
        ntpID: settings.posSignature,
        apiKey: settings.posSignature,
        config: {
          language: 'ro',  // Romanian language
          notifyUrl: `https://${projectUrl}/functions/v1/make-server-bbc0c500/netopia/ipn`,
          redirectUrl: returnUrl || `https://${projectUrl.split('.')[0]}.supabase.co/payment-success?orderId=${orderId}`
        }
      };
      
      console.log('📤 Sending request to Netopia:');
      console.log('  env_key length:', encryptedPayload.env_key.length);
      console.log('  data length:', encryptedPayload.data.length);
      console.log('  POS Signature:', settings.posSignature);
      console.log('  POS Signature length:', settings.posSignature.length);
      console.log('  Request format: application/json');
      console.log('  Authorization header:', netopiaSandboxApiKey ? `Present (${netopiaSandboxApiKey.substring(0, 20)}...)` : 'Not present');
      console.log('  Full request body keys:', Object.keys(requestBody));
      console.log('  Full request body:', JSON.stringify(requestBody, null, 2));
      
      // Make POST request to Netopia with Authorization header and JSON body
      const netopiaResponse = await fetch(paymentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Add Authorization header with API key for sandbox
          ...(netopiaSandboxApiKey && !settings.isLive ? {
            'Authorization': netopiaSandboxApiKey
          } : {})
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log(`📥 Netopia response status: ${netopiaResponse.status}`);
      console.log(`📥 Netopia response headers:`);
      netopiaResponse.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });
      
      if (!netopiaResponse.ok) {
        const errorText = await netopiaResponse.text();
        console.error(`❌ Netopia API error (${netopiaResponse.status}):`, errorText);
        
        // Log the full error details
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('FULL ERROR RESPONSE FROM NETOPIA:');
        console.error('Status:', netopiaResponse.status);
        console.error('Status Text:', netopiaResponse.statusText);
        console.error('Response Body:', errorText);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Try to parse JSON error
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Parsed error JSON:', JSON.stringify(errorJson, null, 2));
          
          // Return detailed error to frontend
          return c.json({
            success: false,
            error: `Netopia payment error: ${errorJson.message || errorJson.error || errorText}`,
            details: errorJson
          }, 500);
        } catch {
          // Not JSON, return raw error
          return c.json({
            success: false,
            error: `Netopia payment error (${netopiaResponse.status}): ${errorText}`,
            rawError: errorText
          }, 500);
        }
      }
      
      // Check if response is a redirect (3xx status or Location header)
      const locationHeader = netopiaResponse.headers.get('Location');
      if (locationHeader) {
        console.log(`✅ Netopia redirect URL: ${locationHeader}`);
        return c.json({
          success: true,
          redirectUrl: locationHeader,
          orderId,
          message: 'Payment initialized successfully',
        });
      }
      
      // Check if response is JSON with a payment URL
      const contentType = netopiaResponse.headers.get('Content-Type');
      if (contentType?.includes('application/json')) {
        const responseData = await netopiaResponse.json();
        console.log(`✅ Netopia JSON response:`, JSON.stringify(responseData, null, 2));
        
        if (responseData.paymentUrl || responseData.redirect_url || responseData.url) {
          const redirectUrl = responseData.paymentUrl || responseData.redirect_url || responseData.url;
          return c.json({
            success: true,
            redirectUrl,
            orderId,
            message: 'Payment initialized successfully',
          });
        }
      }
      
      // Otherwise, response body might be HTML with redirect or the payment page itself
      const responseText = await netopiaResponse.text();
      console.log(`📄 Netopia response (first 500 chars):`, responseText.substring(0, 500));
      
      // Check if it's an HTML redirect
      const metaRedirectMatch = responseText.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)["']/i);
      if (metaRedirectMatch) {
        const redirectUrl = metaRedirectMatch[1];
        console.log(`✅ Found meta redirect: ${redirectUrl}`);
        return c.json({
          success: true,
          redirectUrl,
          orderId,
          message: 'Payment initialized successfully',
        });
      }
      
      // If no redirect found, return error
      console.error('❌ No redirect URL found in Netopia response');
      return c.json({
        success: false,
        error: 'Netopia did not return a payment URL. Please check configuration.'
      }, 500);
      
    } catch (fetchError) {
      console.error('❌ Error calling Netopia API:', fetchError);
      return c.json({
        success: false,
        error: `Failed to connect to Netopia: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
      }, 500);
    }

  } catch (error) {
    console.error('❌ Error initiating Netopia payment:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, 500);
  }
});

// Netopia IPN (Instant Payment Notification) endpoint
app.post("/make-server-bbc0c500/netopia/ipn", async (c) => {
  try {
    const body = await c.req.json();
    console.log(`🔔 Received Netopia IPN:`, JSON.stringify(body, null, 2));

    // Extract payment info from IPN
    const { ntpID, status, amount, errorMessage } = body;

    if (!ntpID) {
      console.error('❌ Missing ntpID in IPN');
      return c.json({ success: false, error: 'Missing ntpID' }, 400);
    }

    // Extract orderId from ntpID (format: orderId-timestamp)
    const orderId = ntpID.split('-')[0];

    // Update payment status in KV
    const paymentData = await kv.get(`netopia_payment:${orderId}`);
    
    if (paymentData) {
      await kv.set(`netopia_payment:${orderId}`, {
        ...paymentData,
        status,
        amount,
        errorMessage,
        updatedAt: new Date().toISOString()
      });
    }

    // Import Supabase client to update order payment status
    const { createClient } = await import('npm:@supabase/supabase-js@2.39.7');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update order payment status based on IPN status
    if (status === 'confirmed' || status === 'paid' || status === 'completed') {
      console.log(`✅ Payment confirmed for order ${orderId}`);
      
      // Update order payment status to 'paid'
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('order_number', orderId);

      if (updateError) {
        console.error(`❌ Failed to update order ${orderId}:`, updateError);
      } else {
        console.log(`✅ Order ${orderId} marked as paid`);
      }
    } else if (status === 'failed' || status === 'canceled' || status === 'error') {
      console.log(`❌ Payment failed/canceled for order ${orderId}: ${errorMessage || 'Unknown error'}`);
      
      // Keep payment status as unpaid
      console.log(`📝 Order ${orderId} remains unpaid`);
    }

    // Always return success to Netopia
    return c.json({ success: true });

  } catch (error) {
    console.error('❌ Error processing Netopia IPN:', error);
    // Still return success to prevent Netopia from retrying
    return c.json({ success: true });
  }
});

// Check payment status
app.get("/make-server-bbc0c500/netopia/status/:orderId", async (c) => {
  try {
    const orderId = c.req.param('orderId');
    
    if (!orderId) {
      return c.json({ success: false, error: 'Order ID required' }, 400);
    }

    // Get payment data from KV
    const paymentData = await kv.get<{
      ntpID: string;
      orderId: string;
      amount: number;
      status: string;
      errorMessage?: string;
      createdAt: string;
      updatedAt?: string;
    }>(`netopia_payment:${orderId}`);

    if (!paymentData) {
      return c.json({ 
        success: false, 
        error: 'Payment not found',
        status: 'not_found' 
      }, 404);
    }

    console.log(`📊 Payment status for order ${orderId}:`, paymentData.status);

    return c.json({ 
      success: true, 
      status: paymentData.status,
      amount: paymentData.amount,
      errorMessage: paymentData.errorMessage,
      createdAt: paymentData.createdAt,
      updatedAt: paymentData.updatedAt
    });

  } catch (error) {
    console.error('❌ Error checking payment status:', error);
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

// Generic KV GET endpoint - accepts key as query parameter
app.get("/make-server-bbc0c500/kv/get", async (c) => {
  try {
    const key = c.req.query('key');
    
    if (!key) {
      return c.json({ 
        success: false,
        error: 'Missing key parameter' 
      }, 400);
    }
    
    console.log(`📖 Getting KV value for key: ${key}`);
    const value = await kv.get(key);
    console.log(`✅ KV value retrieved:`, value ? 'Found' : 'Not found');
    
    return c.json({ 
      success: true,
      value: value || null 
    });
  } catch (error) {
    console.error('❌ Error getting KV value:', error);
    return c.json({ 
      success: false,
      value: null,
      error: error instanceof Error ? error.message : 'Failed to get value' 
    }, 500);
  }
});

// Generic KV SET endpoint - accepts key as query parameter and value in body
app.post("/make-server-bbc0c500/kv/set", async (c) => {
  try {
    const key = c.req.query('key');
    
    if (!key) {
      return c.json({ 
        success: false,
        error: 'Missing key parameter' 
      }, 400);
    }
    
    const body = await c.req.json();
    const { value } = body;
    
    if (value === undefined) {
      return c.json({ 
        success: false,
        error: 'Missing value in request body' 
      }, 400);
    }
    
    console.log(`💾 Setting KV value for key: ${key}`);
    await kv.set(key, value);
    console.log(`✅ KV value saved successfully`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error setting KV value:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to set value' 
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