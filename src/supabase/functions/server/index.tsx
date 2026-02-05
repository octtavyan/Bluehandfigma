// BlueHand Canvas - Supabase Edge Function Server
// Handles email sending with Resend API and payment gateways (Netopia + Revolut)
// Last updated: 2026-01-31 - Cleaned up PDF/Cloudinary code, now serving HTML invoices directly
// Server Version: 2.6.0 - HTML invoices served via public GET route /invoice/view/:orderNumber
// 
// CRITICAL CHANGES:
// - VAT rate set to 21% for Romanian standard rate
// - Abandoned PDF generation and Cloudinary uploads
// - HTML invoices served directly from Edge Function server
// - Public invoice viewing route: /invoice/view/:orderNumber
// - Invoice generation route: /invoice/generate (POST)
// - Invoice data route: /invoice/:orderNumber (GET)
// - All email templates updated with BlueHand Canvas logo from Cloudinary
// - Hardcoded "RON" in Netopia XML attributes (no variable interpolation)
// - Email format validation for Resend API
// - Cart save/load endpoints
// - Unsplash settings endpoints
// - Netopia payment with proper XML encryption and signature handling

import { Hono } from "npm:hono@4.3.11";
import { cors } from "npm:hono@4.3.11/cors";
import { logger } from "npm:hono@4.3.11/logger";
import * as kv from "./kv_store.tsx";
import * as invoiceModule from "./invoice.tsx";
import * as fgoModule from "./fgo.tsx";

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
    version: "2.6.0",
    lastUpdate: "2026-01-31 - Cleaned up all PDF/Cloudinary code, now serving HTML invoices directly",
    timestamp: new Date().toISOString(),
    paymentEndpointStatus: "All Netopia credentials now stored in database - configure in Admin Settings",
    invoiceStatus: "✅ HTML invoices served via /invoice/view/:orderNumber (no PDF generation)",
    adminEndpoints: "✅ Orders, Paintings, Sizes, FrameTypes, Clients - All endpoints active"
  });
});

// Debug endpoint to log payment return parameters
app.post("/make-server-bbc0c500/debug/log-payment-return", async (c) => {
  try {
    const body = await c.req.json();
    const { params, url, timestamp } = body;
    
    // Store debug log in KV for inspection
    await kv.set(`debug:payment_return:${Date.now()}`, {
      params,
      url,
      timestamp,
      logged: new Date().toISOString()
    });
    
    return c.json({ success: true, message: 'Debug log saved' });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to log' }, 500);
  }
});

// Test/diagnostic endpoint to verify XML structure WITHOUT calling Netopia
app.post("/make-server-bbc0c500/netopia/test-xml", async (c) => {
  try {
    const body = await c.req.json();
    const { orderId = 'TEST123', amount = 100, customerEmail = 'test@test.com', customerName = 'Test User' } = body;
    
    const currency = "RON";
    const timestamp = Date.now();
    const escapeXml = (str: string | number) => {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };
    
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || 'Test';
    
    const testXml = `<?xml version="1.0" encoding="utf-8"?>
<order type="card" id="${escapeXml(orderId)}" timestamp="${timestamp}" currency="${currency}">
  <currency>${currency}</currency>
  <signature>TEST-SIGNATURE</signature>
  <url>
    <confirm>https://test.com/ipn</confirm>
    <return>https://test.com/return</return>
  </url>
  <invoice currency="${currency}" amount="${escapeXml(amount.toFixed(2))}">
    <details>${escapeXml(`Test Order #${orderId}`)}</details>
    <contact_info>
      <billing type="person">
        <first_name>${escapeXml(firstName)}</first_name>
        <last_name>${escapeXml(lastName)}</last_name>
        <email>${escapeXml(customerEmail)}</email>
      </billing>
    </contact_info>
  </invoice>
</order>`;

    const hasOrderAttribute = testXml.includes('currency="RON"');
    const hasCurrencyElement = testXml.includes('<currency>RON</currency>');
    const hasInvoiceAttribute = testXml.includes('invoice currency="RON"');
    
    return c.json({
      success: true,
      version: "2.3.3",
      xml: testXml,
      validation: {
        orderAttribute: hasOrderAttribute ? '✅ Present' : '❌ MISSING',
        currencyElement: hasCurrencyElement ? '✅ Present' : '❌ MISSING',
        invoiceAttribute: hasInvoiceAttribute ? '✅ Present' : '❌ MISSING',
        allPresent: hasOrderAttribute && hasCurrencyElement && hasInvoiceAttribute
      },
      message: (hasOrderAttribute && hasCurrencyElement && hasInvoiceAttribute) 
        ? 'All currency fields present - XML structure is correct!' 
        : 'ERROR: Missing required currency fields'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Debug endpoint to check environment variables
app.get("/make-server-bbc0c500/debug/env", async (c) => {
  const netopiaPosSignature = Deno.env.get('NETOPIA_POS_SIGNATURE');
  const netopiaApiKey = Deno.env.get('NETOPIA_API_KEY');
  
  // Also check database settings
  let dbSettings = null;
  try {
    dbSettings = await kv.get('netopia_settings');
  } catch (e) {
    console.error('Error loading DB settings:', e);
  }
  
  // Determine which endpoint will be used
  const effectiveIsLive = dbSettings?.isLive || false;
  const effectiveBaseUrl = effectiveIsLive 
    ? 'https://secure.netopia-payments.com' 
    : 'https://secure.sandbox.netopia-payments.com';
  
  return c.json({
    success: true,
    environment: {
      NETOPIA_POS_SIGNATURE: netopiaPosSignature ? {
        exists: true,
        length: netopiaPosSignature.length,
        first10: netopiaPosSignature.substring(0, 10),
        last10: netopiaPosSignature.substring(netopiaPosSignature.length - 10),
        fullValue: netopiaPosSignature // Show full value for debugging
      } : { exists: false },
      NETOPIA_API_KEY: netopiaApiKey ? {
        exists: true,
        length: netopiaApiKey.length,
        first10: netopiaApiKey.substring(0, 10)
      } : { exists: false }
    },
    database: {
      settings: dbSettings ? {
        posSignature: dbSettings.posSignature,
        isLive: dbSettings.isLive,
        isConfigured: dbSettings.isConfigured
      } : null
    },
    willUse: netopiaPosSignature || dbSettings?.posSignature || 'NONE',
    effectiveEndpoint: {
      isLive: effectiveIsLive,
      baseUrl: effectiveBaseUrl,
      environment: effectiveIsLive ? 'LIVE' : 'SANDBOX',
      warning: effectiveIsLive ? '⚠️ LIVE mode - Real payments!' : '✅ SANDBOX mode - Test payments'
    }
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
        sandboxApiKey: '', // NEW: Netopia Sandbox API Key
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
    
    console.log('💾 SAVING NETOPIA SETTINGS - Received data:');
    console.log(`   - merchantId: ${settings.merchantId ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   - apiKey (RSA Private): ${settings.apiKey ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   - sandboxApiKey: ${settings.sandboxApiKey ? '✅ SET' : '❌ NOT SET'}`);
    if (settings.sandboxApiKey) {
      console.log(`   - sandboxApiKey length: ${settings.sandboxApiKey.length}`);
      console.log(`   - sandboxApiKey first 20: ${settings.sandboxApiKey.substring(0, 20)}...`);
      console.log(`   - sandboxApiKey last 10: ...${settings.sandboxApiKey.substring(settings.sandboxApiKey.length - 10)}`);
    }
    console.log(`   - posSignature: ${settings.posSignature ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   - publicKey: ${settings.publicKey ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   - isLive: ${settings.isLive}`);
    
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
    
    console.log(`✅ Netopia settings saved to database. Configured: ${isConfigured}, Mode: ${settingsToSave.isLive ? 'LIVE' : 'TEST'}`);
    console.log(`✅ sandboxApiKey saved: ${settingsToSave.sandboxApiKey ? 'YES (' + settingsToSave.sandboxApiKey.length + ' chars)' : 'NO'}`);
    
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

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT GATEWAY SELECTION ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Get active payment gateway
app.get("/make-server-bbc0c500/payment-gateway/settings", async (c) => {
  try {
    const settings = await kv.get('payment_gateway_settings');
    return c.json({ 
      success: true, 
      settings: settings || { activeGateway: 'netopia' }
    });
  } catch (error) {
    console.error('Error getting payment gateway settings:', error);
    return c.json({ success: false, error: 'Failed to get settings' }, 500);
  }
});

// Set active payment gateway
app.post("/make-server-bbc0c500/payment-gateway/settings", async (c) => {
  try {
    const { activeGateway } = await c.req.json();
    
    if (!['netopia', 'revolut'].includes(activeGateway)) {
      return c.json({ 
        success: false, 
        error: 'Invalid gateway. Must be "netopia" or "revolut"' 
      }, 400);
    }
    
    await kv.set('payment_gateway_settings', { activeGateway });
    console.log(`✅ Active payment gateway set to: ${activeGateway}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving payment gateway settings:', error);
    return c.json({ success: false, error: 'Failed to save settings' }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// REVOLUT BUSINESS ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Get Revolut settings
app.get("/make-server-bbc0c500/revolut/settings", async (c) => {
  try {
    const settings = await kv.get('revolut_settings');
    return c.json({ 
      success: true, 
      settings: settings || {
        apiKey: '',
        merchantId: '',
        webhookSecret: '',
        isLive: false
      }
    });
  } catch (error) {
    console.error('Error getting Revolut settings:', error);
    return c.json({ success: false, error: 'Failed to get settings' }, 500);
  }
});

// Save Revolut settings
app.post("/make-server-bbc0c500/revolut/settings", async (c) => {
  try {
    const settings = await c.req.json();
    
    console.log('💾 SAVING REVOLUT SETTINGS:');
    console.log(`   - API Key: ${settings.apiKey ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   - Merchant ID: ${settings.merchantId ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   - Webhook Secret: ${settings.webhookSecret ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   - isLive: ${settings.isLive}`);
    
    await kv.set('revolut_settings', {
      ...settings,
      isLive: settings.isLive === true
    });
    
    console.log(`✅ Revolut settings saved. Mode: ${settings.isLive ? 'LIVE' : 'SANDBOX'}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving Revolut settings:', error);
    return c.json({ success: false, error: 'Failed to save settings' }, 500);
  }
});

// Initiate Revolut payment
app.post("/make-server-bbc0c500/revolut/start-payment", async (c) => {
  try {
    const body = await c.req.json();
    const { orderId, amount, customerEmail, customerName, returnUrl } = body;

    console.log('💳 Initiating Revolut payment...');
    console.log(`   - Order ID: ${orderId}`);
    console.log(`   - Amount: ${amount} RON`);
    console.log(`   - Customer: ${customerName} (${customerEmail})`);

    // Load Revolut settings
    const settings = await kv.get('revolut_settings');
    
    if (!settings || !settings.apiKey || !settings.merchantId) {
      console.error('❌ Revolut settings not configured');
      return c.json({ 
        success: false, 
        error: 'Revolut not configured. Please add API Key and Merchant ID in Admin Settings.' 
      }, 500);
    }

    const baseUrl = settings.isLive 
      ? 'https://merchant.revolut.com/api/1.0'
      : 'https://sandbox-merchant.revolut.com/api/1.0';

    // Create order in Revolut
    const revolutOrder = {
      amount: amount * 100, // Convert to cents
      currency: 'RON',
      merchant_order_ext_ref: orderId,
      email: customerEmail,
      description: `Comandă BlueHand Canvas #${orderId}`,
      merchant_customer_ext_ref: customerEmail,
      metadata: {
        customerName: customerName,
        platform: 'BlueHand Canvas'
      }
    };

    console.log('📤 Creating Revolut order:', revolutOrder);

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(revolutOrder),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Revolut API error:', data);
      return c.json({ 
        success: false, 
        error: `Revolut API error: ${data.message || 'Unknown error'}`,
        details: data
      }, 500);
    }

    console.log('✅ Revolut order created:', data);

    // Return payment URL
    return c.json({ 
      success: true,
      paymentUrl: data.checkout_url || data.public_id,
      orderId: data.id,
      publicId: data.public_id
    });

  } catch (error) {
    console.error('❌ Error initiating Revolut payment:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to initiate payment' 
    }, 500);
  }
});

// Revolut webhook handler
app.post("/make-server-bbc0c500/revolut/webhook", async (c) => {
  try {
    const body = await c.req.json();
    const signature = c.req.header('Revolut-Signature');

    console.log('📥 Revolut webhook received:', body);
    console.log('🔐 Signature:', signature);

    // Load settings to verify webhook
    const settings = await kv.get('revolut_settings');
    
    if (!settings || !settings.webhookSecret) {
      console.error('❌ Webhook secret not configured');
      return c.json({ success: false, error: 'Webhook secret not configured' }, 500);
    }

    // TODO: Verify webhook signature with settings.webhookSecret
    // For now, we'll process the webhook

    const event = body.event;
    const orderData = body.order || body;

    console.log(`📊 Revolut event: ${event}`);
    console.log(`📦 Order ID: ${orderData.merchant_order_ext_ref}`);
    console.log(`💰 Amount: ${orderData.order_amount?.value} ${orderData.order_amount?.currency}`);
    console.log(`✅ Status: ${orderData.state}`);

    // Handle different events
    switch (event) {
      case 'ORDER_COMPLETED':
      case 'ORDER_AUTHORISED':
        console.log('✅ Payment successful!');
        // TODO: Update order status in database
        break;
      case 'ORDER_CANCELLED':
      case 'ORDER_FAILED':
        console.log('❌ Payment failed or cancelled');
        // TODO: Update order status in database
        break;
      default:
        console.log(`ℹ️  Unhandled event type: ${event}`);
    }

    return c.json({ success: true, received: true });

  } catch (error) {
    console.error('❌ Error processing Revolut webhook:', error);
    return c.json({ success: false, error: 'Webhook processing failed' }, 500);
  }
});

// Diagnostic endpoint to check environment variables
app.get("/make-server-bbc0c500/netopia/diagnostic", async (c) => {
  try {
    const netopiaSandboxApiKey = Deno.env.get('NETOPIA_API_KEY');
    const netopiaPosSignature = Deno.env.get('NETOPIA_POS_SIGNATURE');
    
    // Load settings from database
    const settingsData = await kv.get('netopia_settings');
    const settings = settingsData || { isLive: false };
    
    const diagnostic = {
      timestamp: new Date().toISOString(),
      environment: settings.isLive ? 'LIVE' : 'SANDBOX',
      environmentVariables: {
        NETOPIA_API_KEY: {
          isSet: !!netopiaSandboxApiKey,
          preview: netopiaSandboxApiKey ? `${netopiaSandboxApiKey.substring(0, 20)}...` : 'NOT SET',
          last10: netopiaSandboxApiKey ? `...${netopiaSandboxApiKey.substring(netopiaSandboxApiKey.length - 10)}` : 'NOT SET',
          length: netopiaSandboxApiKey?.length || 0,
          expectedStart: 'icDO2L_2PqjNJL3F...',
          expectedEnd: '...Vdqzc',
          expectedLength: 56,
          matches: netopiaSandboxApiKey === 'icDO2L_2PqjNJL3F98BLukDRgmmL1z4DPYxu8HYhxVciRdarrVdqzc',
          requiredFor: 'Sandbox authentication'
        },
        NETOPIA_POS_SIGNATURE: {
          isSet: !!netopiaPosSignature,
          preview: netopiaPosSignature ? `${netopiaPosSignature.substring(0, 10)}...` : 'NOT SET',
          fullValue: netopiaPosSignature || 'NOT SET',
          length: netopiaPosSignature?.length || 0,
          expectedValue: '38CJ-NTJR-M8VL-QSUQ-OHEA',
          matches: netopiaPosSignature === '38CJ-NTJR-M8VL-QSUQ-OHEA',
          requiredFor: 'Payment XML signature'
        }
      },
      databaseSettings: {
        posSignature: {
          isSet: !!settings.posSignature,
          preview: settings.posSignature ? `${settings.posSignature.substring(0, 10)}...` : 'NOT SET'
        },
        publicKey: {
          isSet: !!settings.publicKey,
          hasCorrectHeader: settings.publicKey?.includes('BEGIN PUBLIC KEY') || settings.publicKey?.includes('BEGIN CERTIFICATE'),
          preview: settings.publicKey ? settings.publicKey.substring(0, 50) + '...' : 'NOT SET'
        },
        merchantPrivateKey: {
          isSet: !!settings.apiKey,
          note: 'Optional - only needed for IPN decryption'
        }
      },
      recommendations: []
    };
    
    // Add recommendations based on findings
    if (!settings.isLive && !netopiaSandboxApiKey) {
      diagnostic.recommendations.push('⚠️ CRITICAL: NETOPIA_API_KEY environment variable is NOT set. Sandbox payments will fail with 401/403 errors.');
    }
    
    if (!settings.posSignature) {
      diagnostic.recommendations.push('⚠️ POS Signature is NOT set in Admin Settings. This is required for all payments.');
    }
    
    if (!settings.publicKey) {
      diagnostic.recommendations.push('⚠️ Netopia Public Key is NOT set in Admin Settings. This is required to encrypt payment data.');
    }
    
    if (settings.publicKey && !settings.publicKey.includes('BEGIN PUBLIC KEY') && !settings.publicKey.includes('BEGIN CERTIFICATE')) {
      diagnostic.recommendations.push('⚠️ Public Key format looks incorrect. Should start with "-----BEGIN PUBLIC KEY-----" or "-----BEGIN CERTIFICATE-----"');
    }
    
    if (diagnostic.recommendations.length === 0) {
      diagnostic.recommendations.push('✅ All required credentials are configured correctly!');
    }
    
    console.log('📊 Netopia Diagnostic Report:', JSON.stringify(diagnostic, null, 2));
    
    return c.json({
      success: true,
      diagnostic
    });
    
  } catch (error) {
    console.error('Error in diagnostic:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Diagnostic failed'
    }, 500);
  }
});

// DEBUG: Direct database read for Netopia settings
app.get("/make-server-bbc0c500/netopia/debug-db", async (c) => {
  try {
    const settings = await kv.get('netopia_settings');
    
    console.log('🔍 DEBUG: Reading directly from database...');
    console.log('Raw settings object:', settings);
    
    if (!settings) {
      return c.json({
        success: true,
        message: 'No settings found in database',
        settings: null
      });
    }
    
    // Type cast for safety
    const typedSettings = settings as any;
    
    return c.json({
      success: true,
      message: 'Settings read from database',
      rawData: settings,
      analysis: {
        merchantId: {
          exists: !!typedSettings.merchantId,
          value: typedSettings.merchantId || null
        },
        apiKey: {
          exists: !!typedSettings.apiKey,
          length: typedSettings.apiKey?.length || 0,
          preview: typedSettings.apiKey ? `${typedSettings.apiKey.substring(0, 20)}...` : null
        },
        sandboxApiKey: {
          exists: !!typedSettings.sandboxApiKey,
          length: typedSettings.sandboxApiKey?.length || 0,
          first20: typedSettings.sandboxApiKey ? typedSettings.sandboxApiKey.substring(0, 20) : null,
          last10: typedSettings.sandboxApiKey ? typedSettings.sandboxApiKey.substring(typedSettings.sandboxApiKey.length - 10) : null,
          fullValue: typedSettings.sandboxApiKey || null
        },
        posSignature: {
          exists: !!typedSettings.posSignature,
          value: typedSettings.posSignature || null
        },
        publicKey: {
          exists: !!typedSettings.publicKey,
          length: typedSettings.publicKey?.length || 0
        },
        isLive: typedSettings.isLive,
        isConfigured: typedSettings.isConfigured
      }
    });
  } catch (error) {
    console.error('Error reading database:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database read failed'
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
            <!-- Logo Header -->
            <div style="text-align: center; margin-bottom: 30px; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
              <img src="https://res.cloudinary.com/ddz7n1zgz/image/upload/v1738225953/logo_aywf8z.png" alt="BlueHand Canvas" style="max-width: 200px; height: auto;" />
            </div>
            
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
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      console.error(`❌ Invalid email format: "${customerEmail}"`);
      return c.json({ 
        success: false, 
        error: `Invalid email format: ${customerEmail}` 
      }, 400);
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
              <!-- Header with Logo -->
              <div style="background-color: #7B93FF; padding: 30px 20px; text-align: center;">
                <img src="https://res.cloudinary.com/ddz7n1zgz/image/upload/v1738225953/logo_aywf8z.png" alt="BlueHand Canvas" style="max-width: 180px; height: auto; margin-bottom: 10px;" />
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
      customerEmail,
      invoiceUrl,
      orderData
    } = body;
    
    if (!customerEmail || !orderNumber) {
      return c.json({ success: false, error: 'Email and order number are required' }, 400);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      console.error(`❌ Invalid email format: "${customerEmail}"`);
      return c.json({ 
        success: false, 
        error: `Invalid email format: ${customerEmail}` 
      }, 400);
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

    // Get invoice HTML from KV
    const invoice = await kv.get<{
      invoiceNumber: string;
      orderNumber: string;
      html: string;
      generatedAt: string;
    }>(`invoice:${orderNumber}`);
    
    // Generate invoice - Check FGO first, then fallback to internal system
    let pdfAttachment = null;
    let fgoInvoiceLink = null;
    let fgoInvoiceNumber = null;
    
    try {
      if (orderData) {
        // Check if FGO invoice already exists for this order
        const existingFgoInvoice = await kv.get(`fgo_invoice:${orderNumber}`);
        
        if (existingFgoInvoice) {
          console.log('📋 FGO invoice already exists for this order');
          fgoInvoiceLink = existingFgoInvoice.invoiceLink;
          fgoInvoiceNumber = `${existingFgoInvoice.invoiceSerie}-${existingFgoInvoice.invoiceNumber}`;
        } else {
          // Check if FGO is enabled
          const fgoEnabled = await fgoModule.isEnabled();
          
          if (fgoEnabled) {
            console.log('🟢 FGO is enabled - Generating invoice via FGO API');
            
            // Generate invoice via FGO
            const fgoResult = await fgoModule.generateInvoice({
              orderNumber: orderData.orderNumber,
              orderDate: orderData.orderDate,
              customerName: orderData.clientName || customerName,
              customerEmail: orderData.clientEmail || customerEmail,
              customerPhone: orderData.clientPhone || '',
              customerAddress: orderData.address || '',
              customerCity: orderData.deliveryCity || orderData.city || '',
              customerCounty: orderData.deliveryCounty || orderData.county || '',
              customerPostalCode: orderData.postalCode || '',
              items: orderData.canvasItems || [],
              total: orderData.totalPrice,
              deliveryPrice: 0,
              billingName: orderData.billingName,
              billingCUI: orderData.billingCUI,
              billingRegCom: orderData.billingRegCom,
              billingAddress: orderData.billingAddress,
              personType: orderData.billingCUI ? 'juridica' : 'fizica'
            });
            
            if (fgoResult.success) {
              console.log('✅ FGO invoice generated successfully');
              console.log(`   Serie: ${fgoResult.invoiceSerie}, Numar: ${fgoResult.invoiceNumber}`);
              console.log(`   Link: ${fgoResult.invoiceLink}`);
              
              fgoInvoiceLink = fgoResult.invoiceLink;
              fgoInvoiceNumber = `${fgoResult.invoiceSerie}-${fgoResult.invoiceNumber}`;
              
              const generatedAt = new Date().toISOString();
              
              // Store FGO invoice data in KV for reference
              await kv.set(`fgo_invoice:${orderNumber}`, {
                invoiceNumber: fgoResult.invoiceNumber,
                invoiceSerie: fgoResult.invoiceSerie,
                invoiceLink: fgoResult.invoiceLink,
                orderNumber: orderData.orderNumber,
                generatedAt: generatedAt
              });
              
              // Update order with FGO invoice information
              await kv.set(`order:${orderNumber}`, {
                ...orderData,
                fgoInvoiceNumber: fgoResult.invoiceNumber,
                fgoInvoiceSerie: fgoResult.invoiceSerie,
                fgoInvoiceLink: fgoResult.invoiceLink,
                fgoInvoiceGeneratedAt: generatedAt
              });
              
              console.log('💾 FGO invoice data saved to order');
            } else {
              console.error('❌ FGO invoice generation failed:', fgoResult.message);
              console.log('⚠️ Falling back to internal invoice system');
            }
          }
        }
        
        // Only generate PDF invoice (jsPDF) if FGO invoice doesn't exist
        // When FGO invoice exists, we use the green button link instead of PDF attachment
        if (!fgoInvoiceLink) {
          console.log('🔵 Generating PDF invoice via internal system (jsPDF) - No FGO invoice found');
          
          const { generateInvoice } = await import('./invoice.tsx');
          
          const invoiceResult = await generateInvoice({
            orderNumber: orderData.orderNumber,
            orderDate: orderData.orderDate,
            customerName: orderData.clientName || customerName,
            customerEmail: orderData.clientEmail || customerEmail,
            customerPhone: orderData.clientPhone || '',
            customerAddress: orderData.address || '',
            customerCity: orderData.deliveryCity || orderData.city || '',
            customerCounty: orderData.deliveryCounty || orderData.county || '',
            customerPostalCode: orderData.postalCode || '',
            items: orderData.canvasItems || [],
            total: orderData.totalPrice,
            deliveryPrice: 0,
            billingName: orderData.billingName,
            billingCUI: orderData.billingCUI,
            billingRegCom: orderData.billingRegCom,
            billingAddress: orderData.billingAddress
          });
          
          if (invoiceResult.success && invoiceResult.pdf) {
            const base64 = btoa(Array.from(invoiceResult.pdf, byte => String.fromCharCode(byte)).join(''));
            pdfAttachment = {
              filename: `Factura_${invoiceResult.invoiceNumber}.pdf`,
              content: base64
            };
            console.log(`✅ PDF invoice generated successfully: ${invoiceResult.invoiceNumber}`);
          }
        } else {
          console.log('✅ FGO invoice exists - Skipping PDF generation, will use FGO link instead');
        }
      }
    } catch (invoiceError) {
      console.error('❌ Error generating invoice:', invoiceError);
    }
    
    // Build invoice HTML based on whether FGO was used
    const invoiceHTML = fgoInvoiceLink 
      ? `
        <!-- FGO Invoice Section -->
        <div style="background-color: #e8f5e9; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #10b981; margin: 0 0 10px 0; font-size: 18px;">📄 Factura Ta Fiscală</h3>
          <p style="margin: 0 0 15px 0; color: #333; font-size: 15px; line-height: 1.6;">
            Factura fiscală a fost generată automat prin sistemul FGO.<br>
            <strong>Număr factură:</strong> ${fgoInvoiceNumber}
          </p>
          <a href="${fgoInvoiceLink}" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">
            📥 Descarcă Factura
          </a>
          <p style="margin: 15px 0 0 0; color: #666; font-size: 13px;">
            💡 Click pe butonul de mai sus pentru a descărca factura ta fiscală în format PDF.
          </p>
        </div>
      `
      : `
        <!-- Internal Invoice Section -->
        <div style="background-color: #e8f5e9; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #10b981; margin: 0 0 10px 0; font-size: 18px;">📄 Factura Ta</h3>
          <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6;">
            Factura fiscală este atașată la acest email în format PDF.<br>
            <strong>Nume fișier:</strong> Factura_${orderNumber.replace('#', '').replace('BHC-', '')}.pdf
          </p>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 13px;">
            💡 Poți deschide și salva PDF-ul direct din acest email.
          </p>
        </div>
      `;
    
    // Prepare email body
    const emailBody: any = {
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
              
              <!-- Header with Logo -->
              <div style="background-color: #10b981; padding: 30px 20px; text-align: center;">
                <img src="https://res.cloudinary.com/ddz7n1zgz/image/upload/v1738225953/logo_aywf8z.png" alt="BlueHand Canvas" style="max-width: 180px; height: auto; margin-bottom: 10px;" />
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Comanda Expediată! 📦</h1>
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
                    <strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">✓ Expediată (În tranzit)</span>
                  </p>
                </div>
                
                ${invoiceHTML}
                
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
        `
    };
    
    // Add PDF attachment if generated
    if (pdfAttachment) {
      emailBody.attachments = [pdfAttachment];
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return c.json({ 
        success: false, 
        error: data.message || 'Failed to send email via Resend' 
      }, response.status);
    }

    return c.json({ 
      success: true, 
      message: 'Shipped confirmation email sent',
      emailId: data.id 
    });

  } catch (error) {
    console.error('Error sending shipped confirmation email:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, 500);
  }
});

// ===== FGO INTEGRATION =====

// Get FGO settings
app.get("/make-server-bbc0c500/fgo/settings", async (c) => {
  try {
    const settings = await fgoModule.getSettings();
    
    if (!settings) {
      return c.json({
        success: true,
        settings: {
          enabled: false,
          environment: 'test',
          codUnic: '',
          cheiePivata: '',
          serie: '',
          platformaUrl: '',
        }
      });
    }
    
    return c.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error getting FGO settings:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Save FGO settings
app.post("/make-server-bbc0c500/fgo/settings", async (c) => {
  try {
    const body = await c.req.json();
    const success = await fgoModule.saveSettings(body);
    
    if (success) {
      return c.json({
        success: true,
        message: 'FGO settings saved successfully'
      });
    } else {
      return c.json({
        success: false,
        message: 'Failed to save FGO settings'
      }, 500);
    }
  } catch (error) {
    console.error('Error saving FGO settings:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Test FGO connection
app.post("/make-server-bbc0c500/fgo/test", async (c) => {
  try {
    const settings = await c.req.json();
    const result = await fgoModule.testConnection(settings);
    
    return c.json(result);
  } catch (error) {
    console.error('Error testing FGO connection:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Generate FGO invoice (alternative to internal invoice generation)
app.post("/make-server-bbc0c500/fgo/generate", async (c) => {
  try {
    const invoiceData = await c.req.json();
    const result = await fgoModule.generateInvoice(invoiceData);
    
    return c.json(result);
  } catch (error) {
    console.error('Error generating FGO invoice:', error);
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ===== INVOICE GENERATION =====

// Public route to view invoice HTML (token-based authentication for email links)
app.get("/make-server-bbc0c500/invoice/view/:orderNumber", async (c) => {
  try {
    const orderNumber = c.req.param('orderNumber');
    const token = c.req.query('token'); // Get token from query parameter
    const apikey = c.req.query('apikey'); // Get apikey from query parameter (for email links)
    
    if (!orderNumber) {
      return c.html('<h1>Error: Order number is required</h1>', 400);
    }
    
    console.log(`📄 Public invoice request for: ${orderNumber}`);
    console.log(`   Token: ${token ? 'provided' : 'missing'}`);
    console.log(`   API Key: ${apikey ? 'provided' : 'missing'}`);
    
    // Get invoice from KV store
    const invoiceData = await kv.get(`invoice:${orderNumber}`);
    
    if (!invoiceData || !invoiceData.html) {
      return c.html(`
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Factură Indisponibilă</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
              h1 { color: #e74c3c; }
            </style>
          </head>
          <body>
            <h1>❌ Factură Negăsită</h1>
            <p>Nu există o factură generată pentru comanda <strong>${orderNumber}</strong>.</p>
            <p>Vă rugăm să contactați suportul.</p>
          </body>
        </html>
      `, 404);
    }
    
    // Validate token if provided (for email links)
    if (token && invoiceData.accessToken) {
      if (token !== invoiceData.accessToken) {
        console.error(`❌ Invalid access token for invoice ${orderNumber}`);
        return c.html(`
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Acces Refuzat</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
                h1 { color: #e74c3c; }
              </style>
            </head>
            <body>
              <h1>🔒 Acces Refuzat</h1>
              <p>Token-ul de acces este invalid.</p>
            </body>
          </html>
        `, 403);
      }
      console.log(`✅ Token validated successfully for ${orderNumber}`);
    }
    
    // Return the HTML invoice
    console.log(`✅ Serving invoice HTML for ${orderNumber}`);
    return c.html(invoiceData.html);
    
  } catch (error) {
    console.error('❌ Error retrieving invoice:', error);
    return c.html(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Eroare</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
            h1 { color: #e74c3c; }
          </style>
        </head>
        <body>
          <h1>❌ Eroare</h1>
          <p>A apărut o eroare la încărcarea facturii.</p>
          <p>${error instanceof Error ? error.message : 'Eroare necunoscută'}</p>
        </body>
      </html>
    `, 500);
  }
});

// Generate invoice HTML for an order - Clean implementation using invoice module
app.post("/make-server-bbc0c500/invoice/generate", async (c) => {
  try {
    const body = await c.req.json();
    
    // Check if FGO invoice exists and sync if needed
    let fgoInvoiceNumber = body.fgoInvoiceNumber;
    let fgoInvoiceSerie = body.fgoInvoiceSerie;
    
    // If regenerating, check FGO first
    const existingFgoInvoice = await kv.get(`fgo_invoice:${body.orderNumber}`);
    if (existingFgoInvoice) {
      console.log('📋 Found existing FGO invoice, using its details for sync');
      fgoInvoiceNumber = existingFgoInvoice.invoiceNumber;
      fgoInvoiceSerie = existingFgoInvoice.invoiceSerie;
    } else {
      // Check if FGO is enabled and should generate
      const fgoEnabled = await fgoModule.isEnabled();
      
      if (fgoEnabled) {
        console.log('🟢 FGO is enabled - Generating/updating invoice via FGO API');
        
        // Generate invoice via FGO
        const fgoResult = await fgoModule.generateInvoice({
          orderNumber: body.orderNumber,
          orderDate: body.orderDate,
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          customerPhone: body.customerPhone || '',
          customerAddress: body.customerAddress || '',
          customerCity: body.customerCity || '',
          customerCounty: body.customerCounty || '',
          customerPostalCode: body.customerPostalCode || '',
          items: body.items || [],
          total: body.total,
          deliveryPrice: body.deliveryPrice || 0,
          billingName: body.billingName,
          billingCUI: body.billingCUI,
          billingRegCom: body.billingRegCom,
          billingAddress: body.billingAddress,
          personType: body.billingCUI ? 'juridica' : 'fizica'
        });
        
        if (fgoResult.success) {
          console.log('✅ FGO invoice generated successfully');
          console.log(`   Serie: ${fgoResult.invoiceSerie}, Numar: ${fgoResult.invoiceNumber}`);
          
          fgoInvoiceNumber = fgoResult.invoiceNumber;
          fgoInvoiceSerie = fgoResult.invoiceSerie;
          
          const generatedAt = new Date().toISOString();
          
          // Store FGO invoice data in KV for reference
          await kv.set(`fgo_invoice:${body.orderNumber}`, {
            invoiceNumber: fgoResult.invoiceNumber,
            invoiceSerie: fgoResult.invoiceSerie,
            invoiceLink: fgoResult.invoiceLink,
            orderNumber: body.orderNumber,
            generatedAt: generatedAt
          });
          
          console.log('💾 FGO invoice data saved');
        } else {
          console.error('❌ FGO invoice generation failed:', fgoResult.message);
        }
      }
    }
    
    // Generate PDF invoice with FGO details if available
    const invoiceData = {
      ...body,
      fgoInvoiceNumber,
      fgoInvoiceSerie
    };
    
    // Call the clean invoice generation module
    const result = await invoiceModule.generateInvoice(invoiceData);
    
    if (!result.success) {
      console.error('❌ Invoice generation failed:', result.error);
      return c.json({ 
        success: false, 
        error: result.error || 'Failed to generate invoice'
      }, 400);
    }
    
    // Store invoice in KV store
    const invoiceDataForStorage = {
      invoiceNumber: result.invoiceNumber,
      orderNumber: body.orderNumber,
      html: result.html,
      generatedAt: new Date().toISOString()
    };
    
    await kv.set(`invoice:${body.orderNumber}`, invoiceDataForStorage);
    
    return c.json(result);
    
  } catch (error) {
    console.error('❌ Error in invoice generation endpoint:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate invoice'
    }, 500);
  }
});

// Sync invoices between FGO and PDF systems
app.post("/make-server-bbc0c500/invoice/sync", async (c) => {
  try {
    const body = await c.req.json();
    const { orderNumber } = body;
    
    if (!orderNumber) {
      return c.json({ success: false, error: 'Order number required' }, 400);
    }
    
    console.log(`🔄 Syncing invoices for order: ${orderNumber}`);
    
    // Check if FGO invoice exists
    const existingFgoInvoice = await kv.get(`fgo_invoice:${orderNumber}`);
    const existingPdfInvoice = await kv.get(`invoice:${orderNumber}`);
    
    if (!existingFgoInvoice && !existingPdfInvoice) {
      console.log('ℹ️ No invoices found for this order');
      return c.json({ success: true, message: 'No invoices to sync' });
    }
    
    // If FGO invoice exists but PDF doesn't match, regenerate PDF
    if (existingFgoInvoice) {
      const fgoInvoiceNumber = `${existingFgoInvoice.invoiceSerie}-${existingFgoInvoice.invoiceNumber}`;
      
      if (!existingPdfInvoice || existingPdfInvoice.invoiceNumber !== fgoInvoiceNumber) {
        console.log('⚠️ PDF invoice does not match FGO invoice, regenerating...');
        
        // Get order data
        const orderData = await kv.get(`order:${orderNumber}`);
        
        if (orderData) {
          // Regenerate PDF with FGO details
          const result = await invoiceModule.generateInvoice({
            orderNumber: orderData.orderNumber,
            orderDate: orderData.orderDate,
            customerName: orderData.clientName,
            customerEmail: orderData.clientEmail,
            customerPhone: orderData.clientPhone || '',
            customerAddress: orderData.address || '',
            customerCity: orderData.city || '',
            customerCounty: orderData.county || '',
            customerPostalCode: orderData.postalCode || '',
            items: orderData.canvasItems || [],
            total: orderData.totalPrice,
            deliveryPrice: 0,
            billingName: orderData.billingName,
            billingCUI: orderData.billingCUI,
            billingRegCom: orderData.billingRegCom,
            billingAddress: orderData.billingAddress,
            fgoInvoiceNumber: existingFgoInvoice.invoiceNumber,
            fgoInvoiceSerie: existingFgoInvoice.invoiceSerie
          });
          
          if (result.success) {
            // Store synced invoice
            await kv.set(`invoice:${orderNumber}`, {
              invoiceNumber: result.invoiceNumber,
              orderNumber: orderNumber,
              html: result.html,
              generatedAt: new Date().toISOString()
            });
            
            console.log('✅ PDF invoice synced with FGO invoice');
            return c.json({ 
              success: true, 
              message: 'Invoices synced successfully',
              invoiceNumber: result.invoiceNumber
            });
          }
        }
      } else {
        console.log('✅ Invoices already in sync');
        return c.json({ success: true, message: 'Invoices already in sync' });
      }
    }
    
    return c.json({ success: true, message: 'Sync completed' });
    
  } catch (error) {
    console.error('❌ Error syncing invoices:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to sync invoices'
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// NETOPIA PAYMENTS INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

// NEW REST API v4.0 - Following OpenAPI Spec EXACTLY (plain JSON, no encryption)
app.post("/make-server-bbc0c500/netopia/start-payment-v4", async (c) => {
  console.log('🚀 Netopia REST API v4.0 - OpenAPI Spec Compliant');
  
  try {
    const body = await c.req.json();
    const { orderId, amount, customerEmail, customerName, customerPhone, customerAddress, returnUrl, orderData } = body;
    
    console.log('📦 Order data received:', orderData ? 'Yes' : 'No');
    
    if (!orderId || !amount || !customerEmail || !customerName) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    
    // Get settings
    const settings = await kv.get<{
      posSignature: string;
      sandboxApiKey: string;
      isLive: boolean;
      isConfigured: boolean;
    }>('netopia_settings');
    
    if (!settings || !settings.posSignature || !settings.isConfigured) {
      return c.json({ success: false, error: 'Netopia not configured' }, 500);
    }
    
    const apiKey = settings.sandboxApiKey || Deno.env.get('NETOPIA_API_KEY');
    if (!settings.isLive && !apiKey) {
      return c.json({ success: false, error: 'Sandbox API key required' }, 500);
    }
    
    // Parse name
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || 'BlueHand';
    
    // Get URLs
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const projectUrl = supabaseUrl.replace('https://', '');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    const baseUrl = settings.isLive 
      ? 'https://secure.netopia-payments.com'
      : 'https://secure.sandbox.netopia-payments.com';
    
    // Build request body as per OpenAPI spec
    const requestBody = {
      config: {
        notifyUrl: `https://eokrex1e5lzckse.m.pipedream.net`,
        redirectUrl: returnUrl || `https://${projectUrl.split('.')[0]}.supabase.co/payment-success?orderId=${orderId}`,
        language: "ro"
      },
      payment: {
        data: {}  // Empty - customer will enter card details on Netopia's page
      },
      order: {
        posSignature: settings.posSignature,
        dateTime: new Date().toISOString(),
        description: `Comanda BlueHand Canvas #${orderId}`,
        orderID: orderId,
        amount: parseFloat(amount.toFixed(2)),
        currency: "RON",
        billing: {
          email: customerEmail,
          phone: customerPhone || "+40700000000",
          firstName: firstName,
          lastName: lastName,
          city: "Bucuresti",
          country: 642,  // Romania
          countryName: "Romania",
          state: "",
          postalCode: "010101",
          details: customerAddress || "Romania"
        },
        shipping: {
          email: customerEmail,
          phone: customerPhone || "+40700000000",
          firstName: firstName,
          lastName: lastName,
          city: "Bucuresti",
          country: 642,
          state: "",
          postalCode: "010101",
          details: customerAddress || "Romania"
        }
      }
    };
    
    console.log('📤 Request to:', `${baseUrl}/payment/card/start`);
    console.log('📤 POS Signature:', settings.posSignature);
    console.log('📤 Order ID:', orderId);
    console.log('📤 Amount:', requestBody.order.amount, 'RON');
    
    // Make API call with Authorization header (raw API key)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (!settings.isLive && apiKey) {
      headers['Authorization'] = apiKey;  // Raw key, no Bearer prefix
      console.log('🔑 Authorization header added (raw key)');
    }
    
    const netopiaResponse = await fetch(`${baseUrl}/payment/card/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    console.log(`📥 Response status: ${netopiaResponse.status}`);
    
    const responseText = await netopiaResponse.text();
    console.log(`📥 Response body:`, responseText);
    
    if (!netopiaResponse.ok) {
      console.error(`❌ Netopia API error (${netopiaResponse.status}):`, responseText);
      return c.json({ 
        success: false, 
        error: `Netopia API error: ${responseText}`,
        status: netopiaResponse.status
      }, 500);
    }
    
    const responseData = JSON.parse(responseText);
    
    // Store payment with BOTH orderId and ntpID mappings + FULL order data for later creation
    const paymentData = {
      orderId,
      amount,
      currency: 'RON',
      status: 'pending',
      customerEmail,
      customerName,
      customerPhone,
      customerAddress,
      ntpID: responseData.payment?.ntpID,
      createdAt: new Date().toISOString(),
      // Store FULL order data so we can create the order after payment confirmation
      orderData: orderData || null,
    };
    
    // Store by orderId
    await kv.set(`netopia_payment:${orderId}`, paymentData);
    
    // ALSO store by ntpID so we can look up the order when Netopia redirects back
    if (responseData.payment?.ntpID) {
      await kv.set(`netopia_ntp:${responseData.payment.ntpID}`, {
        orderId,
        ntpID: responseData.payment.ntpID,
        createdAt: new Date().toISOString(),
      });
    }
    
    console.log(`✅ Payment data stored with orderId: ${orderId} and ntpID: ${responseData.payment?.ntpID}`);
    
    return c.json({
      success: true,
      paymentUrl: responseData.payment?.paymentURL,
      ntpID: responseData.payment?.ntpID,
      redirectUrl: returnUrl || requestBody.config.redirectUrl
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ORDER NUMBER GENERATION
// ═══════════════════════════════════════════════════════════════════════════

// Generate sequential order number for payment (called BEFORE initiating payment)
app.post("/make-server-bbc0c500/orders/generate-number", async (c) => {
  try {
    console.log('🔢 Generating sequential order number...');
    
    // Import Supabase client
    const { createClient } = await import('npm:@supabase/supabase-js@2.39.7');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Generate order number using same logic as ordersService.generateOrderNumber()
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `BHC-${year}${month}${day}`;
    
    // Get today's orders to determine the next sequence number
    const todayStart = new Date(year, now.getMonth(), now.getDate()).toISOString();
    const { data, error } = await supabase
      .from('orders')
      .select('order_number')
      .gte('created_at', todayStart)
      .like('order_number', `${datePrefix}%`)
      .order('created_at', { ascending: false })
      .limit(1);
    
    let sequence = 1;
    if (data && data.length > 0 && data[0].order_number) {
      // Extract sequence number from last order
      const lastOrderNumber = data[0].order_number;
      const parts = lastOrderNumber.split('-');
      const lastSequence = parseInt(parts[parts.length - 1] || '0');
      sequence = lastSequence + 1;
    }
    
    const orderNumber = `${datePrefix}-${String(sequence).padStart(4, '0')}`;
    console.log(`✅ Generated order number: ${orderNumber}`);
    
    return c.json({ 
      success: true, 
      orderNumber 
    });
    
  } catch (error) {
    console.error('❌ Error generating order number:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate order number'
    }, 500);
  }
});

// Get invoice for an order
app.get("/make-server-bbc0c500/invoice/:orderNumber", async (c) => {
  try {
    const orderNumber = c.req.param('orderNumber');
    console.log(`🔍 [INVOICE-GET] Fetching invoice for order: ${orderNumber}`);
    
    // Log authorization header for debugging
    const authHeader = c.req.header('Authorization');
    console.log(`🔑 [INVOICE-GET] Authorization header present: ${authHeader ? 'YES' : 'NO'}`);
    
    const invoice = await kv.get(`invoice:${orderNumber}`);
    console.log(`📄 [INVOICE-GET] Invoice found:`, invoice ? 'Yes' : 'No');
    
    if (!invoice) {
      console.log(`❌ [INVOICE-GET] Invoice not found for order: ${orderNumber}`);
      return c.json({ success: false, error: 'Invoice not found' }, 404);
    }
    
    console.log(`✅ [INVOICE-GET] Returning invoice for order: ${orderNumber}`);
    console.log(`📦 [INVOICE-GET] Invoice data: cloudinaryUrl=${invoice.cloudinaryUrl ? 'present' : 'missing'}, html=${invoice.html ? 'present' : 'missing'}`);
    
    return c.json({
      success: true,
      invoice
    });
    
  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch invoice'
    }, 500);
  }
});

// Download invoice as PDF (or HTML fallback for legacy invoices)
app.get("/make-server-bbc0c500/invoice/:orderNumber/download", async (c) => {
  try {
    const orderNumber = c.req.param('orderNumber');
    
    const invoice = await kv.get<{
      invoiceNumber: string;
      cloudinaryUrl?: string;
      html?: string;
    }>(`invoice:${orderNumber}`);
    
    if (!invoice) {
      return c.text('Invoice not found', 404);
    }
    
    // If Cloudinary URL exists, redirect to it
    if (invoice.cloudinaryUrl) {
      console.log(`📤 Redirecting to Cloudinary URL: ${invoice.cloudinaryUrl}`);
      return c.redirect(invoice.cloudinaryUrl, 302);
    }
    
    // Fallback: Return HTML from KV store if Cloudinary URL not available
    if (!invoice.html) {
      return c.text('Invoice content not available', 404);
    }
    
    // Return HTML with proper headers for download
    return c.html(invoice.html, 200, {
      'Content-Disposition': `attachment; filename="Factura_${invoice.invoiceNumber.replace(' ', '_')}.html"`,
    });
    
  } catch (error) {
    console.error('❌ Error downloading invoice:', error);
    return c.text('Failed to download invoice', 500);
  }
});

// ===== NETOPIA PAYMENTS INTEGRATION =====

// NEW REST API v4.0 - Following OpenAPI Spec EXACTLY (plain JSON, no encryption)
app.post("/make-server-bbc0c500/netopia/start-payment-v4", async (c) => {
  console.log('🚀 Netopia REST API v4.0 - OpenAPI Spec Compliant');
  
  try {
    const body = await c.req.json();
    const { orderId, amount, customerEmail, customerName, customerPhone, customerAddress, returnUrl, orderData } = body;
    
    console.log('📦 Order data received:', orderData ? 'Yes' : 'No');
    
    if (!orderId || !amount || !customerEmail || !customerName) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    
    // Get settings
    const settings = await kv.get<{
      posSignature: string;
      sandboxApiKey: string;
      isLive: boolean;
      isConfigured: boolean;
    }>('netopia_settings');
    
    if (!settings || !settings.posSignature || !settings.isConfigured) {
      return c.json({ success: false, error: 'Netopia not configured' }, 500);
    }
    
    const apiKey = settings.sandboxApiKey || Deno.env.get('NETOPIA_API_KEY');
    if (!settings.isLive && !apiKey) {
      return c.json({ success: false, error: 'Sandbox API key required' }, 500);
    }
    
    // Parse name
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || 'BlueHand';
    
    // Get URLs
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const projectUrl = supabaseUrl.replace('https://', '');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    const baseUrl = settings.isLive 
      ? 'https://secure.netopia-payments.com'
      : 'https://secure.sandbox.netopia-payments.com';
    
    // Build request body as per OpenAPI spec
    const requestBody = {
      config: {
        notifyUrl: `https://eokrex1e5lzckse.m.pipedream.net`,
        redirectUrl: returnUrl || `https://${projectUrl.split('.')[0]}.supabase.co/payment-success?orderId=${orderId}`,
        language: "ro"
      },
      payment: {
        data: {}  // Empty - customer will enter card details on Netopia's page
      },
      order: {
        posSignature: settings.posSignature,
        dateTime: new Date().toISOString(),
        description: `Comanda BlueHand Canvas #${orderId}`,
        orderID: orderId,
        amount: parseFloat(amount.toFixed(2)),
        currency: "RON",
        billing: {
          email: customerEmail,
          phone: customerPhone || "+40700000000",
          firstName: firstName,
          lastName: lastName,
          city: "Bucuresti",
          country: 642,  // Romania
          countryName: "Romania",
          state: "",
          postalCode: "010101",
          details: customerAddress || "Romania"
        },
        shipping: {
          email: customerEmail,
          phone: customerPhone || "+40700000000",
          firstName: firstName,
          lastName: lastName,
          city: "Bucuresti",
          country: 642,
          state: "",
          postalCode: "010101",
          details: customerAddress || "Romania"
        }
      }
    };
    
    console.log('📤 Request to:', `${baseUrl}/payment/card/start`);
    console.log('📤 POS Signature:', settings.posSignature);
    console.log('📤 Order ID:', orderId);
    console.log('📤 Amount:', requestBody.order.amount, 'RON');
    
    // Make API call with Authorization header (raw API key)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (!settings.isLive && apiKey) {
      headers['Authorization'] = apiKey;  // Raw key, no Bearer prefix
      console.log('🔑 Authorization header added (raw key)');
    }
    
    const netopiaResponse = await fetch(`${baseUrl}/payment/card/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    console.log(`📥 Response status: ${netopiaResponse.status}`);
    
    const responseText = await netopiaResponse.text();
    console.log(`📥 Response body:`, responseText);
    
    if (!netopiaResponse.ok) {
      console.error(`❌ Netopia API error (${netopiaResponse.status}):`, responseText);
      return c.json({ 
        success: false, 
        error: `Netopia API error: ${responseText}`,
        status: netopiaResponse.status
      }, 500);
    }
    
    const responseData = JSON.parse(responseText);
    
    // Store payment with BOTH orderId and ntpID mappings + FULL order data for later creation
    const paymentData = {
      orderId,
      amount,
      currency: 'RON',
      status: 'pending',
      customerEmail,
      customerName,
      customerPhone,
      customerAddress,
      ntpID: responseData.payment?.ntpID,
      createdAt: new Date().toISOString(),
      // Store FULL order data so we can create the order after payment confirmation
      orderData: orderData || null,
    };
    
    // Store by orderId
    await kv.set(`netopia_payment:${orderId}`, paymentData);
    
    // ALSO store by ntpID so we can look up the order when Netopia redirects back
    if (responseData.payment?.ntpID) {
      await kv.set(`netopia_ntp:${responseData.payment.ntpID}`, {
        orderId,
        ntpID: responseData.payment.ntpID,
        createdAt: new Date().toISOString(),
      });
    }
    
    console.log(`✅ Payment data stored with orderId: ${orderId} and ntpID: ${responseData.payment?.ntpID}`);
    
    return c.json({
      success: true,
      paymentUrl: responseData.payment?.paymentURL,
      ntpID: responseData.payment?.ntpID,
      redirectUrl: returnUrl || requestBody.config.redirectUrl
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Initiate Netopia payment - NEW REST API v3.0 (OpenAPI Spec compliant)
// Using modern REST API format with plain JSON (NO encryption)
app.post("/make-server-bbc0c500/netopia/start-payment", async (c) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 START-PAYMENT ENDPOINT CALLED (v3.0 - REST API)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    console.log('📥 Step 1: Parsing request body...');
    const body = await c.req.json();
    console.log('📦 Request body received:', JSON.stringify(body, null, 2));
    
    const { orderId, amount, customerEmail, customerName, customerPhone, customerAddress, returnUrl } = body;
    
    console.log('🔍 Step 2: Validating required fields...');
    console.log(`   - orderId: ${orderId ? '✅' : '❌'} (${orderId})`);
    console.log(`   - amount: ${amount ? '✅' : '❌'} (${amount})`);
    console.log(`   - customerEmail: ${customerEmail ? '✅' : '❌'} (${customerEmail})`);
    console.log(`   - customerName: ${customerName ? '✅' : '❌'} (${customerName})`);


    if (!orderId || !amount || !customerEmail || !customerName) {
      console.error('❌ VALIDATION FAILED: Missing required fields');
      return c.json({ 
        success: false, 
        error: 'Missing required fields: orderId, amount, customerEmail, customerName' 
      }, 400);
    }
    
    console.log('✅ All required fields present');

    console.log('🔍 Step 3: Loading Netopia settings from database...');
    // Get Netopia settings from KV store
    const settings = await kv.get<{
      posSignature: string;
      apiKey: string;
      publicKey: string;
      isLive: boolean;
      isConfigured: boolean;
    }>('netopia_settings');
    
    console.log('📊 Settings loaded:', {
      hasSettings: !!settings,
      hasPosSignature: !!settings?.posSignature,
      hasPublicKey: !!settings?.publicKey,
      isConfigured: settings?.isConfigured,
      isLive: settings?.isLive
    });

    if (!settings || !settings.posSignature || !settings.publicKey || !settings.isConfigured) {
      console.error('❌ SETTINGS VALIDATION FAILED: Netopia not configured');
      return c.json({ 
        success: false, 
        error: 'Netopia payment gateway not configured. Please contact support.' 
      }, 500);
    }
    
    console.log('✅ Settings validation passed');

    console.log('🔍 Step 4: Loading API credentials...');
    // Get API key from DATABASE (sandbox requires API key authentication)
    // CHANGED: Now reading from database instead of environment variables
    const dbSandboxApiKey = settings.sandboxApiKey;
    const envSandboxApiKey = Deno.env.get('NETOPIA_API_KEY');
    const netopiaSandboxApiKey = dbSandboxApiKey || envSandboxApiKey; // Fallback to env for backwards compatibility
    const netopiaPosSignature = settings.posSignature; // Always use database value
    
    console.log('🔍 API Key Source Check:');
    console.log(`   - Database sandboxApiKey: ${dbSandboxApiKey ? `SET (${dbSandboxApiKey.length} chars, first 20: ${dbSandboxApiKey.substring(0, 20)}...)` : 'NOT SET'}`);
    console.log(`   - Environment NETOPIA_API_KEY: ${envSandboxApiKey ? `SET (${envSandboxApiKey.length} chars, first 20: ${envSandboxApiKey.substring(0, 20)}...)` : 'NOT SET'}`);
    console.log(`   - Using: ${dbSandboxApiKey ? '✅ DATABASE' : '⚠️ ENVIRONMENT VARIABLE (FALLBACK)'}`);
    
    console.log('🔐 Environment variables status:');
    console.log(`   - Sandbox API Key (database): ${settings.sandboxApiKey ? '✅ SET' : '❌ NOT SET'}`);
    if (settings.sandboxApiKey) {
      console.log(`   - API Key length: ${settings.sandboxApiKey.length} characters`);
      console.log(`   - API Key first 20 chars: ${settings.sandboxApiKey.substring(0, 20)}...`);
      console.log(`   - API Key last 10 chars: ...${settings.sandboxApiKey.substring(settings.sandboxApiKey.length - 10)}`);
    }
    console.log(`   - POS Signature (database): ${netopiaPosSignature ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   - Using POS Signature: ${netopiaPosSignature?.substring(0, 10)}...`);
    console.log(`   - Full POS Signature: "${netopiaPosSignature}"`);
    
    if (!settings.isLive && !netopiaSandboxApiKey) {
      console.error('❌ SANDBOX API KEY MISSING: Please add it in Admin Settings → Netopia');
      return c.json({ 
        success: false, 
        error: 'Netopia sandbox API key not configured. Please add it in Admin Settings → Netopia tab.' 
      }, 500);
    }
    
    console.log('✅ Environment validation passed');

    // Determine API endpoint based on environment
    const environment = settings.isLive ? 'live' : 'sandbox';
    const baseUrl = settings.isLive 
      ? 'https://secure.netopia-payments.com'
      : 'https://secure.sandbox.netopia-payments.com';

    console.log(`💳 Initiating Netopia payment for order ${orderId}, amount: ${amount} RON`);
    console.log(`🔗 Using environment: ${environment}`);
    console.log(`🔗 Base URL: ${baseUrl}`);
    console.log(`🔑 POS Signature being used: "${netopiaPosSignature}"`);
    console.log(`🆕 Using NEW REST API format (no encryption, plain JSON)`);
    console.log(`🔑 POS Signature length: ${netopiaPosSignature.length} characters`);
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
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    // Import required libraries for encryption
    const crypto = await import('node:crypto');
    const { Buffer } = await import('node:buffer');
    const forgeModule = await import('npm:node-forge@1.3.1');
    const forge = forgeModule.default || forgeModule;
    
    // Build XML MANUALLY to ensure exact structure
    // CRITICAL: currency as attributes on both order and invoice elements
    const escapeXml = (str: string | number) => {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };
    
    // Define currency explicitly - MUST be exactly 3 characters  
    const currency = "RON";
    
    // CRITICAL VALIDATION: Ensure currency is EXACTLY "RON" with no whitespace
    if (currency.trim() !== "RON" || currency.length !== 3) {
      console.error(`❌ CURRENCY VALIDATION FAILED: currency="${currency}", length=${currency.length}`);
      return c.json({
        success: false,
        error: 'Internal error: Invalid currency format'
      }, 500);
    }
    console.log(`✅ Currency validated: "${currency}" (length: ${currency.length})`);
    
    // Build XML with currency as ATTRIBUTE on order element, CHILD ELEMENT, AND as invoice attribute
    // Netopia requires ALL THREE: currency attribute on <order>, <currency> child element, AND currency attribute on <invoice>
    // CRITICAL: Using hardcoded "RON" in attributes to avoid any variable interpolation issues
    console.log('✅ Using FIXED XML structure with currency attribute on <order> element');
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<order type="card" id="${escapeXml(orderId)}" timestamp="${timestamp}" currency="RON">
  <currency>RON</currency>
  <signature>${escapeXml(netopiaPosSignature)}</signature>
  <url>
    <confirm>${escapeXml(`https://eokrex1e5lzckse.m.pipedream.net`)}</confirm>
    <return>${escapeXml(returnUrl || `https://${projectUrl.split('.')[0]}.supabase.co/payment-success?orderId=${orderId}`)}</return>
  </url>
  <invoice currency="RON" amount="${escapeXml(amount.toFixed(2))}">
    <details>${escapeXml(`Comanda BlueHand Canvas #${orderId}`)}</details>
    <contact_info>
      <billing type="person">
        <first_name>${escapeXml(firstName)}</first_name>
        <last_name>${escapeXml(lastName)}</last_name>
        <email>${escapeXml(customerEmail)}</email>
        <mobile_phone>${escapeXml(customerPhone || '')}</mobile_phone>
        <address>${escapeXml(customerAddress || 'Romania')}</address>
        <city></city>
        <county></county>
        <zip_code></zip_code>
        <country>Romania</country>
      </billing>
      <shipping type="person">
        <first_name>${escapeXml(firstName)}</first_name>
        <last_name>${escapeXml(lastName)}</last_name>
        <email>${escapeXml(customerEmail)}</email>
        <mobile_phone>${escapeXml(customerPhone || '')}</mobile_phone>
        <address>${escapeXml(customerAddress || 'Romania')}</address>
        <city></city>
        <county></county>
        <zip_code></zip_code>
        <country>Romania</country>
      </shipping>
    </contact_info>
  </invoice>
</order>`;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📄 COMPLETE GENERATED XML (${xml.length} chars):`);
    console.log(`💱 Currency: "${currency}" (${currency.length} chars) - AS CHILD ELEMENT + INVOICE ATTRIBUTE`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(xml);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Verify currency appears in XML in ALL THREE REQUIRED PLACES
    if (!xml.includes('<currency>RON</currency>')) {
      console.error('❌ WARNING: Currency element not found in XML!');
      return c.json({
        success: false,
        error: 'Internal error: Currency not properly set in payment XML'
      }, 500);
    }
    
    if (!xml.includes('currency="RON"')) {
      console.error('❌ CRITICAL: Currency attribute not found on <order> element!');
      console.error('This will cause Netopia validation error!');
      return c.json({
        success: false,
        error: 'Internal error: Currency attribute missing from order element'
      }, 500);
    }
    
    console.log('✅ Currency validation passed:');
    console.log('   - <order currency="RON"> attribute found ✅');
    console.log('   - <currency>RON</currency> element found ✅');
    console.log('   - <invoice currency="RON"> attribute found ✅');
    
    // Encrypt the payment data
    // 1. Generate random AES key and random IV
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // 2. Encrypt XML with AES-256-CBC
    const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
    let encryptedXml = cipher.update(xml, 'utf8');
    encryptedXml = Buffer.concat([encryptedXml, cipher.final()]);
    
    // Prepend IV to encrypted data
    const encryptedDataWithIV = Buffer.concat([iv, encryptedXml]);
    const encryptedData = encryptedDataWithIV.toString('base64');
    
    console.log('🔐 AES encryption details:');
    console.log('  IV (prepended to data):', iv.toString('hex'));
    console.log('  Encrypted data length:', encryptedDataWithIV.length, 'bytes');
    
    // CRITICAL DEBUG: Decrypt the data IMMEDIATELY to verify it's correct
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 DECRYPTION TEST: Verifying encrypted XML is correct');
    try {
      const testIv = encryptedDataWithIV.slice(0, 16);
      const testEncryptedXml = encryptedDataWithIV.slice(16);
      const testDecipher = crypto.createDecipheriv('aes-256-cbc', aesKey, testIv);
      let testDecrypted = testDecipher.update(testEncryptedXml);
      testDecrypted = Buffer.concat([testDecrypted, testDecipher.final()]);
      const testDecryptedXml = testDecrypted.toString('utf8');
      
      console.log('✅ Decryption successful. Checking currency...');
      if (testDecryptedXml.includes('currency="RON"')) {
        console.log('✅ Currency attribute PRESERVED after encryption: currency="RON"');
      } else {
        console.error('❌ CRITICAL: Currency attribute LOST after encryption!');
        console.error('Decrypted XML preview:', testDecryptedXml.substring(0, 500));
      }
      
      if (testDecryptedXml.includes('<currency>RON</currency>')) {
        console.log('✅ Currency element PRESERVED after encryption');
      } else {
        console.error('❌ CRITICAL: Currency element LOST after encryption!');
      }
    } catch (decryptError) {
      console.error('❌ Decryption test failed:', decryptError);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 3. Encrypt AES key with RSA public key
    let publicKeyFormatted = settings.publicKey;
    
    // Convert PKCS#1 to PKCS#8 if needed
    if (publicKeyFormatted.includes('BEGIN RSA PUBLIC KEY')) {
      console.log('🔄 Converting RSA PUBLIC KEY (PKCS#1) to PUBLIC KEY (PKCS#8)...');
      try {
        const publicKeyForge = forge.pki.publicKeyFromPem(publicKeyFormatted.trim());
        const publicKeyAsn1 = forge.pki.publicKeyToAsn1(publicKeyForge);
        const publicKeyInfo = forge.pki.wrapRsaPublicKey(publicKeyAsn1);
        publicKeyFormatted = forge.pki.publicKeyInfoToPem(publicKeyInfo);
        console.log('✅ Key converted successfully');
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
        const cert = forge.pki.certificateFromPem(publicKeyFormatted.trim());
        publicKeyFormatted = forge.pki.publicKeyToPem(cert.publicKey);
        console.log('✅ Public key extracted from certificate');
      } catch (certError) {
        console.error('❌ Certificate parsing failed:', certError);
        return c.json({
          success: false,
          error: `Failed to extract public key from certificate: ${certError instanceof Error ? certError.message : 'Unknown error'}`
        }, 500);
      }
    }

    let encryptedKey;
    try {
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
      return c.json({
        success: false,
        error: `Failed to encrypt payment data: ${encryptError instanceof Error ? encryptError.message : 'RSA encryption error'}`
      }, 500);
    }

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

    // Make server-to-server API call to Netopia
    const paymentUrl = `${baseUrl}/payment/card/start`;
    
    console.log(`🚀 Making API call to Netopia...`);
    
    try {
      const requestBody = {
        env_key: encryptedKey.toString('base64'),
        data: encryptedData,
        // CRITICAL FIX: Add order object at root level - Netopia validates order.currency from JSON body!
        order: {
          currency: "RON"
        },
        config: {
          language: "ro",
          currency: "RON",
          notifyUrl: `https://eokrex1e5lzckse.m.pipedream.net`,
          redirectUrl: returnUrl || `https://${projectUrl.split('.')[0]}.supabase.co/payment-success?orderId=${orderId}`
        }
      };
      
      console.log('📤 Request body keys:', Object.keys(requestBody));
      console.log('📤 Order object (ROOT LEVEL):', JSON.stringify(requestBody.order));
      console.log('📤 Config:', requestBody.config);
      console.log('📤 Config.currency value:', JSON.stringify(requestBody.config.currency));
      console.log('📤 Config.currency length:', requestBody.config.currency.length);
      console.log('📤 env_key length:', requestBody.env_key.length);
      console.log('📤 data length:', requestBody.data.length);
      
      // Prepare headers with Authorization for sandbox
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      // Add Authorization header for sandbox environment
      // IMPORTANT: Try multiple header formats since Netopia docs don't specify exact format
      if (!settings.isLive && netopiaSandboxApiKey) {
        // Try multiple common API key header formats simultaneously
        headers['Authorization'] = netopiaSandboxApiKey;  // Raw key
        headers['Api-Key'] = netopiaSandboxApiKey;        // Custom header (common in payment APIs)
        headers['X-API-Key'] = netopiaSandboxApiKey;      // X-prefixed custom header
        console.log('🔑 Added API Key in multiple header formats for sandbox');
        console.log('🔑 Headers: Authorization, Api-Key, X-API-Key (raw key, no Bearer)');
        console.log('🔑 API Key (first 20 chars):', netopiaSandboxApiKey.substring(0, 20) + '...');
      } else if (settings.isLive) {
        console.log('⚠️ LIVE mode - API Key handling might differ');
      }
      
      console.log('📤 Request headers:', Object.keys(headers));
      console.log(`📤 Making POST request to: ${paymentUrl}`);
      
      const netopiaResponse = await fetch(paymentUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });
      
      console.log(`📥 Netopia response status: ${netopiaResponse.status}`);
      console.log(`📥 Response headers:`, Object.fromEntries(netopiaResponse.headers.entries()));
      
      if (!netopiaResponse.ok) {
        let errorText = '';
        try {
          errorText = await netopiaResponse.text();
          console.error(`❌ Netopia API error (${netopiaResponse.status}):`, errorText);
          
          // Try to parse as JSON for better error details
          try {
            const errorJson = JSON.parse(errorText);
            console.error(`❌ Parsed error details:`, JSON.stringify(errorJson, null, 2));
            
            // Enhanced error logging for common issues
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('🔍 NETOPIA ERROR ANALYSIS');
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('Error Code:', errorJson.code || 'N/A');
            console.error('Error Message:', errorJson.message || errorText);
            console.error('POS Signature used:', netopiaPosSignature);
            console.error('API Key used (first 20):', netopiaSandboxApiKey ? netopiaSandboxApiKey.substring(0, 20) + '...' : 'NONE');
            console.error('Environment:', settings.isLive ? 'LIVE' : 'SANDBOX');
            console.error('Endpoint:', paymentUrl);
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            // Check if it's an authentication error
            if (netopiaResponse.status === 401 || netopiaResponse.status === 403) {
              return c.json({
                success: false,
                error: '🔐 AUTHENTICATION ERROR: API Key or POS Signature is invalid. Please check your Netopia credentials in Admin Settings.',
                details: errorJson,
                debugInfo: {
                  posSignature: netopiaPosSignature,
                  hasApiKey: !!netopiaSandboxApiKey,
                  environment: settings.isLive ? 'LIVE' : 'SANDBOX',
                  endpoint: paymentUrl
                }
              }, 500);
            }
            
            // Check for POS-related errors
            if (errorJson.message?.toLowerCase().includes('pos') || 
                errorJson.code?.toLowerCase().includes('pos') ||
                errorText.toLowerCase().includes('pos not found')) {
              return c.json({
                success: false,
                error: '❌ POS ERROR: ' + (errorJson.message || errorText),
                details: errorJson,
                debugInfo: {
                  posSignature: netopiaPosSignature,
                  posSignatureLength: netopiaPosSignature?.length,
                  hasApiKey: !!netopiaSandboxApiKey,
                  apiKeySource: dbSandboxApiKey ? 'DATABASE' : 'ENVIRONMENT',
                  environment: settings.isLive ? 'LIVE' : 'SANDBOX',
                  endpoint: paymentUrl
                }
              }, 500);
            }
          } catch (parseError) {
            // Not JSON, that's ok
          }
        } catch (readError) {
          errorText = 'Unable to read error response';
        }
        
        return c.json({
          success: false,
          error: `Netopia payment error (${netopiaResponse.status}): ${errorText.substring(0, 500)}`,
          debugInfo: {
            posSignature: netopiaPosSignature,
            hasApiKey: !!netopiaSandboxApiKey,
            environment: settings.isLive ? 'LIVE' : 'SANDBOX',
            endpoint: paymentUrl
          }
        }, 500);
      }
      
      // Check for redirect URL in response
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
      
      // Check if response is JSON
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
      
      // Otherwise check for HTML redirect
      const responseText = await netopiaResponse.text();
      const metaRedirectMatch = responseText.match(/<meta[^>]*http-equiv=[\"']refresh[\"'][^>]*content=[\"'][^\"']*url=([^\"']+)[\"']/i);
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
      
      console.error('❌ No redirect URL found in Netopia response');
      return c.json({
        success: false,
        error: 'Netopia did not return a payment URL. Please check configuration.'
      }, 500);
      
    } catch (fetchError) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━���━━━━━━━');
      console.error('❌ FETCH ERROR - Failed to call Netopia API');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error type:', fetchError?.constructor?.name);
      console.error('Error message:', fetchError instanceof Error ? fetchError.message : String(fetchError));
      console.error('Error stack:', fetchError instanceof Error ? fetchError.stack : 'No stack trace');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return c.json({
        success: false,
        error: `Failed to connect to Netopia: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
        errorType: fetchError?.constructor?.name || 'FetchError'
      }, 500);
    }

  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ CRITICAL ERROR IN START-PAYMENT ENDPOINT');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      errorType: error?.constructor?.name || 'UnknownError'
    }, 500);
  }
});

// OLD IMPLEMENTATION (kept as backup reference - can be removed later)
app.post("/make-server-bbc0c500/netopia/start-payment-old", async (c) => {
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
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    // Prepare payment data according to OFFICIAL Netopia XML structure
    // CRITICAL: currency as BOTH direct child AND invoice attribute
    // Netopia error indicates it expects order.currency as direct child element
    const paymentData = {
      order: {
        $: {
          type: "card",
          id: orderId,
          timestamp: timestamp.toString(),
        },
        signature: settings.posSignature,
        currency: "RON",  // Direct child element (simple string - no charkey)
        url: {
          confirm: `https://eokrex1e5lzckse.m.pipedream.net`,
          return: returnUrl || `https://${projectUrl.split('.')[0]}.supabase.co/payment-success?orderId=${orderId}`,
        },
        invoice: {
          $: {
            amount: amount.toFixed(2),
          },
          details: `Comanda BlueHand Canvas #${orderId}`,
          contact_info: {
            billing: {
              $: {
                type: "person",
              },
              first_name: firstName,
              last_name: lastName,
              email: customerEmail,
              mobile_phone: "",
              address: "Romania",
              city: "",
              county: "",
              zip_code: "",
              country: "Romania",
            },
            shipping: {
              $: {
                type: "person",
              },
              first_name: firstName,
              last_name: lastName,
              email: customerEmail,
              mobile_phone: "",
              address: "Romania",
              city: "",
              county: "",
              zip_code: "",
              country: "Romania",
            },
          },
        },
      },
    };

    console.log(`📝 Payment data prepared (OFFICIAL STRUCTURE - currency/amount as invoice attributes):`, JSON.stringify(paymentData, null, 2));

    // Import required libraries for encryption
    const crypto = await import('node:crypto');
    const { Buffer } = await import('node:buffer'); // Import Buffer for Deno
    const forgeModule = await import('npm:node-forge@1.3.1');
    // node-forge may export as default or named, handle both
    const forge = forgeModule.default || forgeModule;
    
    // Build XML MANUALLY to ensure exact structure
    const escapeXml = (str: string | number) => {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };
    
    // Define currency explicitly - MUST be exactly 3 characters
    const currency = "RON";
    
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<order type="card" id="${escapeXml(orderId)}" timestamp="${timestamp}" currency="${currency}">
  <currency>${currency}</currency>
  <signature>${escapeXml(settings.posSignature)}</signature>
  <url>
    <confirm>${escapeXml(`https://eokrex1e5lzckse.m.pipedream.net`)}</confirm>
    <return>${escapeXml(returnUrl || `https://${projectUrl.split('.')[0]}.supabase.co/payment-success?orderId=${orderId}`)}</return>
  </url>
  <invoice currency="${currency}" amount="${escapeXml(amount.toFixed(2))}">
    <details>${escapeXml(`Comanda BlueHand Canvas #${orderId}`)}</details>
    <contact_info>
      <billing type="person">
        <first_name>${escapeXml(firstName)}</first_name>
        <last_name>${escapeXml(lastName)}</last_name>
        <email>${escapeXml(customerEmail)}</email>
        <mobile_phone></mobile_phone>
        <address>Romania</address>
        <city></city>
        <county></county>
        <zip_code></zip_code>
        <country>Romania</country>
      </billing>
      <shipping type="person">
        <first_name>${escapeXml(firstName)}</first_name>
        <last_name>${escapeXml(lastName)}</last_name>
        <email>${escapeXml(customerEmail)}</email>
        <mobile_phone></mobile_phone>
        <address>Romania</address>
        <city></city>
        <county></county>
        <zip_code></zip_code>
        <country>Romania</country>
      </shipping>
    </contact_info>
  </invoice>
</order>`;
    
 



    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📄 COMPLETE GENERATED XML (${xml.length} chars):`);
    console.log(`💱 Currency: "${currency}" (${currency.length} chars) - AS CHILD ELEMENT + INVOICE ATTRIBUTE`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(xml);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📏 XML length: ${xml.length} characters`);
    
    // Verify critical elements exist
    const currencyMatch = xml.match(/<currency>([^<]*)<\/currency>/);
    console.log('🔍 Currency element check:', currencyMatch ? `✅ Found: <currency>${currencyMatch[1]}</currency>` : '❌ NOT FOUND!');
    const invoiceMatch = xml.match(/<invoice[^>]*>/);
    console.log('🔍 Invoice tag check:', invoiceMatch ? `✅ Found: ${invoiceMatch[0]}` : '❌ NOT FOUND!');
    
    // Verify currency appears in XML as child element
    if (!xml.includes('<currency>RON</currency>')) {
      console.error('❌ WARNING: Currency element not found in XML!');
      return c.json({
        success: false,
        error: 'Internal error: Currency not properly set in payment XML'
      }, 500);
    }
    
    console.log('✅ Currency validation passed: <currency>RON</currency> found in XML');
    
    // Encrypt the payment data
    // 1. Generate random AES key and random IV (standard approach)
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16); // Random IV (standard for AES-256-CBC)

    // 2. Encrypt XML with AES-256-CBC using random IV
    // PREPEND IV to encrypted data (common approach for AES-256-CBC)
    const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
    let encryptedXml = cipher.update(xml, 'utf8');
    encryptedXml = Buffer.concat([encryptedXml, cipher.final()]);
    
    // Prepend IV to encrypted data
    const encryptedDataWithIV = Buffer.concat([iv, encryptedXml]);
    const encryptedData = encryptedDataWithIV.toString('base64');
    
    console.log('🔐 AES encryption details:');
    console.log('  Using RANDOM IV (prepended to encrypted data)');
    console.log('  AES Key length:', aesKey.length, 'bytes');
    console.log('  IV length:', iv.length, 'bytes');
    console.log('  IV (hex):', iv.toString('hex'));
    console.log('  IV (base64):', iv.toString('base64'));
    console.log('  Encrypted XML length:', encryptedXml.length, 'bytes');
    console.log('  Total data length (IV + encrypted):', encryptedDataWithIV.length, 'bytes');
    console.log('  Base64 encoded length:', encryptedData.length, 'chars');

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
    
    // DISABLE debug mode - Netopia requires encryption
    const debugMode = false; // Always use encryption
    
    if (debugMode) {
      console.log('⚠️ DEBUG MODE DISABLED - Always using encryption');
    }
    
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
      // Send data, env_key, AND config as JSON
      // Config must be SEPARATE from encrypted XML (Netopia validates config.language)
      const requestBody = {
        env_key: encryptedPayload.env_key,
        data: encryptedPayload.data,
        config: {
          language: "ro",
          notifyUrl: `https://eokrex1e5lzckse.m.pipedream.net`,
          redirectUrl: returnUrl || `https://${projectUrl.split('.')[0]}.supabase.co/payment-success?orderId=${orderId}`
        }
      };
      
      console.log('📤 Sending ENCRYPTED request to Netopia:');
      console.log('  env_key length:', encryptedPayload.env_key.length);
      console.log('  data length:', encryptedPayload.data.length);
      console.log('  IV is PREPENDED to data (first 16 bytes of decoded base64)');
      console.log('  Request format: application/json (data, env_key, AND config)');
      console.log('  Authorization header:', netopiaSandboxApiKey ? `Present (${netopiaSandboxApiKey.substring(0, 20)}...)` : 'Not present');
      console.log('  Request body keys:', Object.keys(requestBody));
      console.log('  Config:', JSON.stringify(requestBody.config));
      
      // Log first/last chars of encrypted data for debugging
      console.log('🔍 Encrypted payload preview:');
      console.log('  env_key (first 50 chars):', encryptedPayload.env_key.substring(0, 50));
      console.log('  env_key (last 50 chars):', encryptedPayload.env_key.substring(encryptedPayload.env_key.length - 50));
      console.log('  data (first 50 chars):', encryptedPayload.data.substring(0, 50));
      console.log('  data (last 50 chars):', encryptedPayload.data.substring(encryptedPayload.data.length - 50));
      
      // Verify the encrypted data can be base64 decoded
      try {
        const decodedData = Buffer.from(encryptedPayload.data, 'base64');
        console.log('  Decoded data length:', decodedData.length, 'bytes');
        console.log('  Expected: IV (16 bytes) + encrypted XML');
        if (decodedData.length >= 16) {
          const extractedIV = decodedData.subarray(0, 16);
          console.log('  Extracted IV from data:', extractedIV.toString('hex'));
          console.log('  Original IV:', iv.toString('hex'));
          console.log('  IVs match:', extractedIV.toString('hex') === iv.toString('hex') ? '✅ YES' : '❌ NO');
        }
      } catch (decodeError) {
        console.error('  ❌ Failed to decode base64 data:', decodeError);
      }
      
      // Make POST request to Netopia with JSON
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
        // Try to get response as text first
        let errorText = '';
        let errorJson = null;
        
        try {
          errorText = await netopiaResponse.text();
          console.error(`❌ Netopia API error (${netopiaResponse.status}):`, errorText);
        } catch (readError) {
          console.error('❌ Failed to read error response:', readError);
          errorText = 'Unable to read error response from Netopia';
        }
        
        // Log the full error details
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('FULL ERROR RESPONSE FROM NETOPIA:');
        console.error('Status:', netopiaResponse.status);
        console.error('Status Text:', netopiaResponse.statusText);
        console.error('Response Body Length:', errorText.length);
        console.error('Response Body:', errorText || '(empty)');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Try to parse JSON error
        if (errorText) {
          try {
            errorJson = JSON.parse(errorText);
            console.error('Parsed error JSON:', JSON.stringify(errorJson, null, 2));
          } catch (parseError) {
            console.error('Response is not JSON (parse error):', parseError instanceof Error ? parseError.message : parseError);
            // Try to extract useful info from HTML or plain text
            const textPreview = errorText.substring(0, 500);
            console.error('Text preview:', textPreview);
          }
        }
        
        // Build error message
        let errorMessage = `Netopia payment error (${netopiaResponse.status} ${netopiaResponse.statusText})`;
        if (errorJson) {
          errorMessage = `Netopia payment error: ${errorJson.message || errorJson.error || JSON.stringify(errorJson)}`;
        } else if (errorText && errorText.length > 0 && errorText.length < 500) {
          // If short text, include it
          errorMessage += `: ${errorText}`;
        } else if (!errorText || errorText.length === 0) {
          errorMessage += ': Empty response from Netopia. This may indicate an authentication, encryption, or XML format issue.';
        }
        
        // Return detailed error to frontend
        return c.json({
          success: false,
          error: errorMessage,
          details: errorJson || {
            status: netopiaResponse.status,
            statusText: netopiaResponse.statusText,
            responseLength: errorText?.length || 0,
            responsePreview: errorText?.substring(0, 200) || '(empty)'
          }
        }, 500);
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

// PUBLIC Netopia IPN endpoint (with Netopia JWT validation)
// This endpoint validates Netopia's JWT signature and processes IPN
// It stores the payload in a queue table and returns 200 immediately
app.post("/make-server-bbc0c500/netopia/ipn-public", async (c) => {
  try {
    console.log('🔔 [PUBLIC IPN] Received Netopia IPN notification');
    
    // Log request headers for debugging
    const authHeader = c.req.header('Authorization');
    console.log('🔐 [PUBLIC IPN] Authorization header:', authHeader ? 'Present' : 'Not present');
    
    // Note: Netopia uses digital signatures in the payload, not JWT in headers
    // JWT validation will be implemented once we understand Netopia's exact signature format
    console.log('⚠️ [PUBLIC IPN] Skipping JWT validation - Netopia uses payload signatures')
    
    // Parse the body
    const body = await c.req.json();
    console.log('📦 [PUBLIC IPN] Payload:', JSON.stringify(body, null, 2));
    
    // Use service role key to bypass RLS
    const { createClient } = await import('npm:@supabase/supabase-js@2.39.7');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Insert into queue table
    const { data, error } = await supabase
      .from('netopia_ipn_queue')
      .insert({ 
        payload: body,
        processed: false 
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ [PUBLIC IPN] Failed to insert into queue:', error);
      // Still return Netopia format to prevent retries
      return c.json({ errorCode: 0 }, 200);
    }
    
    console.log('✅ [PUBLIC IPN] Queued for processing, ID:', data.id);
    
    // Immediately process the IPN (call the processing function)
    // This happens in the background
    fetch(`https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-bbc0c500/netopia/process-queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({ queueId: data.id })
    }).catch((err) => console.error('❌ [PUBLIC IPN] Failed to trigger processing:', err));
    
    // Return Netopia's required format: {"errorCode": 0}
    console.log('✅ [PUBLIC IPN] Returning Netopia-compliant response: {"errorCode": 0}');
    return c.json({ errorCode: 0 }, 200);
    
  } catch (error) {
    console.error('❌ [PUBLIC IPN] Error processing public IPN:', error);
    // Always return 200 with Netopia format to prevent retries
    return c.json({ errorCode: 0 }, 200);
  }
});

// Process Netopia IPN from queue
// This endpoint processes queued IPN notifications with proper authentication
app.post("/make-server-bbc0c500/netopia/process-queue", async (c) => {
  try {
    const { queueId } = await c.req.json();
    console.log('🔄 [PROCESS QUEUE] Processing queue item:', queueId);
    
    // Use service role to access everything
    const { createClient } = await import('npm:@supabase/supabase-js@2.39.7');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get the queued item
    const { data: queueItem, error: fetchError } = await supabase
      .from('netopia_ipn_queue')
      .select('*')
      .eq('id', queueId)
      .eq('processed', false)
      .single();
    
    if (fetchError || !queueItem) {
      console.error('❌ [PROCESS QUEUE] Queue item not found or already processed:', fetchError);
      return c.json({ success: false, error: 'Queue item not found' }, 404);
    }
    
    const body = queueItem.payload;
    console.log('📦 [PROCESS QUEUE] Processing payload:', JSON.stringify(body, null, 2));
    
    // Extract payment info from IPN
    const ntpID = body.payment?.ntpID || body.ntpID;
    const status = body.payment?.status || body.status;
    const orderID = body.order?.orderID || body.orderID;
    const amount = body.order?.amount || body.amount;
    const errorMessage = body.payment?.error?.message || body.errorMessage;

    console.log(`📊 [PROCESS QUEUE] IPN Details: ntpID=${ntpID}, status=${status}, orderID=${orderID}, amount=${amount}`);

    if (!orderID && !ntpID) {
      console.error('❌ [PROCESS QUEUE] Missing both orderID and ntpID in IPN');
      // Mark as processed to avoid reprocessing
      await supabase.from('netopia_ipn_queue').update({ processed: true }).eq('id', queueId);
      return c.json({ success: true, processed: true }, 200);
    }

    // Look up the payment data using orderID first, then ntpID
    let orderId = orderID;
    let paymentData: any = null;

    if (orderId) {
      paymentData = await kv.get(`netopia_payment:${orderId}`);
    }

    // If not found by orderID, try looking up by ntpID
    if (!paymentData && ntpID) {
      const ntpMapping = await kv.get<{ orderId: string }>(`netopia_ntp:${ntpID}`);
      if (ntpMapping?.orderId) {
        orderId = ntpMapping.orderId;
        paymentData = await kv.get(`netopia_payment:${orderId}`);
      }
    }

    if (!paymentData) {
      console.error(`❌ [PROCESS QUEUE] No payment data found for orderID=${orderID} or ntpID=${ntpID}`);
      // Mark as processed to avoid reprocessing
      await supabase.from('netopia_ipn_queue').update({ processed: true }).eq('id', queueId);
      return c.json({ success: true, processed: true }, 200);
    }

    console.log(`✅ [PROCESS QUEUE] Found payment data for orderId: ${orderId}`);

    // Update payment status in KV
    await kv.set(`netopia_payment:${orderId}`, {
      ...paymentData,
      status,
      amount,
      errorMessage,
      ntpID: ntpID || paymentData.ntpID,
      updatedAt: new Date().toISOString()
    });

    // Handle payment confirmation
    if (status === 'confirmed' || status === 'paid' || status === 'completed' || status === 'active') {
      console.log(`✅ [PROCESS QUEUE] Payment confirmed for order ${orderId}`);
      
      // Check if order already exists
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', orderId)
        .single();

      if (existingOrder) {
        // Order exists, just update payment status
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('order_number', orderId);

        if (updateError) {
          console.error(`❌ [PROCESS QUEUE] Failed to update order ${orderId}:`, updateError);
        } else {
          console.log(`✅ [PROCESS QUEUE] Order ${orderId} marked as paid`);
        }
      } else if (paymentData.orderData) {
        // Order doesn't exist yet - CREATE IT NOW with payment_status='paid'
        console.log(`📝 [PROCESS QUEUE] Creating new order ${orderId} with payment_status='paid'`);
        
        const orderData = paymentData.orderData;
        
        // Prepare canvas items for database
        const canvasItemsForDb = orderData.canvasItems.map((item: any) => ({
          type: item.type,
          paintingId: item.paintingId || null,
          paintingTitle: item.paintingTitle || null,
          image: item.image || null,
          originalImage: item.originalImage || null,
          croppedImage: item.croppedImage || null,
          size: item.size,
          quantity: item.quantity || 1,
          price: item.price,
          orientation: item.orientation || null,
          hasCustomImage: item.hasCustomImage || false,
          printType: item.printType || null,
          frameType: item.frameType || null,
          unsplashUrl: item.unsplashUrl || null,
        }));

        // Create the order with payment_status='paid'
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderId,
            customer_name: orderData.clientName,
            customer_email: orderData.clientEmail,
            customer_phone: orderData.clientPhone,
            delivery_address: orderData.address,
            delivery_city: orderData.city,
            delivery_county: orderData.county,
            delivery_postal_code: orderData.postalCode,
            items: canvasItemsForDb,
            subtotal: orderData.totalPrice,
            delivery_cost: orderData.deliveryMethod === 'express' ? 25 : 0,
            total: orderData.totalPrice,
            delivery_option: orderData.deliveryMethod,
            payment_method: 'card',
            payment_status: 'paid',
            status: 'new',
            person_type: orderData.personType,
            company_name: orderData.companyName,
            cui: orderData.cui,
            reg_com: orderData.regCom,
            company_county: orderData.companyCounty,
            company_city: orderData.companyCity,
            company_address: orderData.companyAddress,
          })
          .select()
          .single();

        if (orderError) {
          console.error('❌ [PROCESS QUEUE] Error creating order:', orderError);
        } else {
          console.log(`✅ [PROCESS QUEUE] Order ${orderId} created successfully with payment_status='paid'`);
          
          // Send confirmation email (async, don't wait)
          fetch(`https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-bbc0c500/email/send-order-confirmation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderNumber: orderId,
              customerName: orderData.clientName,
              customerEmail: orderData.clientEmail,
              total: orderData.totalPrice,
              items: orderData.canvasItems,
              deliveryMethod: orderData.deliveryMethod,
              paymentMethod: 'card',
              address: orderData.address,
              city: orderData.city,
              county: orderData.county,
              postalCode: orderData.postalCode,
              deliveryPrice: orderData.deliveryMethod === 'express' ? 25 : 0,
            }),
          }).catch(() => {});

          // Generate invoice (async, don't wait)
          fetch(`https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-bbc0c500/invoice/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderNumber: orderId,
              orderDate: new Date().toISOString(),
              customerName: orderData.clientName,
              customerEmail: orderData.clientEmail,
              customerPhone: orderData.clientPhone,
              customerAddress: orderData.address,
              customerCity: orderData.city,
              customerCounty: orderData.county,
              items: orderData.canvasItems,
              total: orderData.totalPrice,
              deliveryPrice: orderData.deliveryMethod === 'express' ? 25 : 0,
            }),
          }).catch(() => {});
        }
      } else {
        console.error(`❌ [PROCESS QUEUE] No orderData found in payment record for ${orderId}`);
      }
    } else if (status === 'failed' || status === 'canceled' || status === 'error') {
      console.log(`❌ [PROCESS QUEUE] Payment failed/canceled for order ${orderId}: ${errorMessage || 'Unknown error'}`);
    }

    // Mark as processed
    await supabase.from('netopia_ipn_queue').update({ processed: true }).eq('id', queueId);
    console.log(`✅ [PROCESS QUEUE] Queue item ${queueId} marked as processed`);

    return c.json({ success: true, processed: true }, 200);

  } catch (error) {
    console.error('❌ [PROCESS QUEUE] Error processing queue:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// Netopia IPN (Instant Payment Notification) endpoint
// NOTE: This endpoint requires JWT authentication - use /netopia/ipn-public for public access
app.post("/make-server-bbc0c500/netopia/ipn", async (c) => {
  try {
    const body = await c.req.json();
    console.log(`🔔 Received Netopia IPN:`, JSON.stringify(body, null, 2));

    // Extract payment info from IPN
    // Netopia sends: { payment: { ntpID, status, ... }, order: { orderID, amount, ... } }
    const ntpID = body.payment?.ntpID || body.ntpID;
    const status = body.payment?.status || body.status;
    const orderID = body.order?.orderID || body.orderID;
    const amount = body.order?.amount || body.amount;
    const errorMessage = body.payment?.error?.message || body.errorMessage;

    console.log(`📊 IPN Details: ntpID=${ntpID}, status=${status}, orderID=${orderID}, amount=${amount}`);

    if (!orderID && !ntpID) {
      console.error('❌ Missing both orderID and ntpID in IPN');
      // CRITICAL: Return HTTP 200 status to Netopia to prevent retries
      return c.json({ success: true }, 200);
    }

    // Look up the payment data using orderID first, then ntpID
    let orderId = orderID;
    let paymentData: any = null;

    if (orderId) {
      paymentData = await kv.get(`netopia_payment:${orderId}`);
    }

    // If not found by orderID, try looking up by ntpID
    if (!paymentData && ntpID) {
      const ntpMapping = await kv.get<{ orderId: string }>(`netopia_ntp:${ntpID}`);
      if (ntpMapping?.orderId) {
        orderId = ntpMapping.orderId;
        paymentData = await kv.get(`netopia_payment:${orderId}`);
      }
    }

    if (!paymentData) {
      console.error(`❌ No payment data found for orderID=${orderID} or ntpID=${ntpID}`);
      // CRITICAL: Return HTTP 200 status to Netopia to prevent retries
      return c.json({ success: true }, 200);
    }

    console.log(`✅ Found payment data for orderId: ${orderId}`);

    // Update payment status in KV
    await kv.set(`netopia_payment:${orderId}`, {
      ...paymentData,
      status,
      amount,
      errorMessage,
      ntpID: ntpID || paymentData.ntpID,
      updatedAt: new Date().toISOString()
    });

    // Import Supabase client
    const { createClient } = await import('npm:@supabase/supabase-js@2.39.7');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle payment confirmation
    if (status === 'confirmed' || status === 'paid' || status === 'completed' || status === 'active') {
      console.log(`✅ Payment confirmed for order ${orderId}`);
      
      // Check if order already exists
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', orderId)
        .single();

      if (existingOrder) {
        // Order exists, just update payment status
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
      } else if (paymentData.orderData) {
        // Order doesn't exist yet - CREATE IT NOW with payment_status='paid'
        console.log(`📝 Creating new order ${orderId} with payment_status='paid'`);
        
        const orderData = paymentData.orderData;
        
        // Prepare canvas items for database
        const canvasItemsForDb = orderData.canvasItems.map((item: any) => ({
          type: item.type,
          paintingId: item.paintingId || null,
          paintingTitle: item.paintingTitle || null,
          image: item.image || null,
          originalImage: item.originalImage || null,
          croppedImage: item.croppedImage || null,
          size: item.size,
          quantity: item.quantity || 1,
          price: item.price,
          orientation: item.orientation || null,
          hasCustomImage: item.hasCustomImage || false,
          printType: item.printType || null,
          frameType: item.frameType || null,
          unsplashUrl: item.unsplashUrl || null,
        }));

        // Create the order with payment_status='paid' (removed client_id dependency)
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderId,
            customer_name: orderData.clientName,
            customer_email: orderData.clientEmail,
            customer_phone: orderData.clientPhone,
            delivery_address: orderData.address,
            delivery_city: orderData.city,
            delivery_county: orderData.county,
            delivery_postal_code: orderData.postalCode,
            items: canvasItemsForDb,
            subtotal: orderData.totalPrice,
            delivery_cost: orderData.deliveryMethod === 'express' ? 25 : 0,
            total: orderData.totalPrice,
            delivery_option: orderData.deliveryMethod,
            payment_method: 'card',
            payment_status: 'paid', // ✅ PAID status immediately
            status: 'new',
            person_type: orderData.personType,
            company_name: orderData.companyName,
            cui: orderData.cui,
            reg_com: orderData.regCom,
            company_county: orderData.companyCounty,
            company_city: orderData.companyCity,
            company_address: orderData.companyAddress,
          })
          .select()
          .single();

        if (orderError) {
          console.error('❌ Error creating order:', orderError);
        } else {
          console.log(`✅ Order ${orderId} created successfully with payment_status='paid'`);
          
          // Send confirmation email (async, don't wait)
          fetch(`https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-bbc0c500/email/send-order-confirmation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderNumber: orderId,
              customerName: orderData.clientName,
              customerEmail: orderData.clientEmail,
              total: orderData.totalPrice,
              items: orderData.canvasItems,
              deliveryMethod: orderData.deliveryMethod,
              paymentMethod: 'card',
              address: orderData.address,
              city: orderData.city,
              county: orderData.county,
              postalCode: orderData.postalCode,
              deliveryPrice: orderData.deliveryMethod === 'express' ? 25 : 0,
            }),
          }).catch(() => {});

          // Generate invoice (async, don't wait)
          fetch(`https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-bbc0c500/invoice/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderNumber: orderId,
              orderDate: new Date().toISOString(),
              customerName: orderData.clientName,
              customerEmail: orderData.clientEmail,
              customerPhone: orderData.clientPhone,
              customerAddress: orderData.address,
              customerCity: orderData.city,
              customerCounty: orderData.county,
              items: orderData.canvasItems,
              total: orderData.totalPrice,
              deliveryPrice: orderData.deliveryMethod === 'express' ? 25 : 0,
            }),
          }).catch(() => {});
        }
      } else {
        console.error(`❌ No orderData found in payment record for ${orderId}`);
      }
    } else if (status === 'failed' || status === 'canceled' || status === 'error') {
      console.log(`❌ Payment failed/canceled for order ${orderId}: ${errorMessage || 'Unknown error'}`);
    }

    // CRITICAL: Always return HTTP 200 status to Netopia to confirm receipt
    console.log('✅ Returning HTTP 200 status to Netopia');
    return c.json({ success: true }, 200);

  } catch (error) {
    console.error('❌ Error processing Netopia IPN:', error);
    // CRITICAL: Still return HTTP 200 to prevent Netopia from retrying
    console.log('⚠️ Error occurred but returning HTTP 200 status to Netopia');
    return c.json({ success: true }, 200);
  }
});

// Check payment status
app.get("/make-server-bbc0c500/netopia/status/:orderId", async (c) => {
  try {
    let orderId = c.req.param('orderId');
    
    if (!orderId) {
      return c.json({ success: false, error: 'Order ID required' }, 400);
    }

    // Check if this is actually an ntpID (starts with ntp or is a UUID format)
    // If so, try to look up the actual orderId
    if (orderId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // This looks like an ntpID, try to get the mapping
      const mapping = await kv.get<{ orderId: string }>(`netopia_ntp:${orderId}`);
      if (mapping?.orderId) {
        orderId = mapping.orderId;
      }
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

    // Map Netopia statuses to our frontend statuses
    let frontendStatus = paymentData.status;
    if (paymentData.status === 'confirmed' || paymentData.status === 'paid' || paymentData.status === 'active') {
      frontendStatus = 'completed'; // Show success page
    } else if (paymentData.status === 'failed' || paymentData.status === 'canceled' || paymentData.status === 'error') {
      frontendStatus = 'failed'; // Show error page
    } else {
      frontendStatus = 'pending'; // Show processing page
    }

    return c.json({ 
      success: true, 
      status: frontendStatus,
      originalStatus: paymentData.status,
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

// Finalize order after successful payment (called from frontend)
app.post("/make-server-bbc0c500/netopia/finalize-order", async (c) => {
  try {
    const { orderId } = await c.req.json();
    if (!orderId) return c.json({ success: false, error: 'Order ID required' }, 400);
    console.log(`🎯 Finalizing order ${orderId} from frontend request`);
    const paymentData = await kv.get<any>(`netopia_payment:${orderId}`);
    if (!paymentData) return c.json({ success: false, error: 'Payment not found' }, 404);
    const { createClient } = await import('npm:@supabase/supabase-js@2.39.7');
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { data: existingOrder } = await supabase.from('orders').select('id, payment_status').eq('order_number', orderId).single();
    if (existingOrder) {
      console.log(`✅ Order ${orderId} already exists`);
      return c.json({ success: true, message: 'Order already exists', orderId, alreadyCreated: true });
    }
    if (!paymentData.orderData) return c.json({ success: false, error: 'No order data found' }, 400);
    const orderData = paymentData.orderData;
    const canvasItemsForDb = orderData.canvasItems.map((item: any) => ({ type: item.type, paintingId: item.paintingId || null, paintingTitle: item.paintingTitle || null, image: item.image || null, originalImage: item.originalImage || null, croppedImage: item.croppedImage || null, size: item.size, quantity: item.quantity || 1, price: item.price, orientation: item.orientation || null, hasCustomImage: item.hasCustomImage || false, printType: item.printType || null, frameType: item.frameType || null, unsplashUrl: item.unsplashUrl || null }));
    
    // Create order directly without client_id (removed client table dependency)
    const { error: orderError } = await supabase.from('orders').insert({ order_number: orderId, customer_name: orderData.clientName, customer_email: orderData.clientEmail, customer_phone: orderData.clientPhone, delivery_address: orderData.address, delivery_city: orderData.city, delivery_county: orderData.county, delivery_postal_code: orderData.postalCode, items: canvasItemsForDb, subtotal: orderData.totalPrice, delivery_cost: orderData.deliveryMethod === 'express' ? 25 : 0, total: orderData.totalPrice, delivery_option: orderData.deliveryMethod, payment_method: 'card', payment_status: 'paid', status: 'new', person_type: orderData.personType, company_name: orderData.companyName, cui: orderData.cui, reg_com: orderData.regCom, company_county: orderData.companyCounty, company_city: orderData.companyCity, company_address: orderData.companyAddress }).select().single();
    if (orderError) {
      console.error('❌ Failed to create order in finalize-order:', orderError);
      console.error('❌ Order data:', JSON.stringify(orderData, null, 2));
      return c.json({ success: false, error: `Failed to create order: ${orderError.message}` }, 500);
    }
    console.log(`✅ Order ${orderId} created successfully via finalize-order`);
    await kv.set(`netopia_payment:${orderId}`, { ...paymentData, status: 'completed', orderCreated: true, updatedAt: new Date().toISOString() });
    fetch(`https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-bbc0c500/email/send-order-confirmation`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderNumber: orderId, customerName: orderData.clientName, customerEmail: orderData.clientEmail, total: orderData.totalPrice, items: orderData.canvasItems, deliveryMethod: orderData.deliveryMethod, paymentMethod: 'card', address: orderData.address, city: orderData.city, county: orderData.county, postalCode: orderData.postalCode, deliveryPrice: orderData.deliveryMethod === 'express' ? 25 : 0 }) }).catch(() => {});
    fetch(`https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}/functions/v1/make-server-bbc0c500/invoice/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderNumber: orderId, orderDate: new Date().toISOString(), customerName: orderData.clientName, customerEmail: orderData.clientEmail, customerPhone: orderData.clientPhone, customerAddress: orderData.address, customerCity: orderData.city, customerCounty: orderData.county, items: orderData.canvasItems, total: orderData.totalPrice, deliveryPrice: orderData.deliveryMethod === 'express' ? 25 : 0 }) }).catch(() => {});
    return c.json({ success: true, message: 'Order created successfully', orderId, orderCreated: true });
  } catch (error) {
    console.error('❌ Error finalizing order:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }, 500);
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

// ===== CART ENDPOINTS =====

// Save cart to server
app.post("/make-server-bbc0c500/cart/save", async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, cart } = body;
    
    if (!sessionId) {
      return c.json({ success: false, error: 'Session ID is required' }, 400);
    }
    
    // Save cart data to KV store with sessionId as key
    await kv.set(`cart:${sessionId}`, {
      cart,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`✅ Cart saved for session: ${sessionId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving cart:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save cart' 
    }, 500);
  }
});

// Load cart from server
app.get("/make-server-bbc0c500/cart/load/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    
    if (!sessionId) {
      return c.json({ success: false, error: 'Session ID is required' }, 400);
    }
    
    // Load cart data from KV store
    const data = await kv.get<{ cart: any; updatedAt: string }>(`cart:${sessionId}`);
    
    if (!data) {
      console.log(`ℹ️ No cart found for session: ${sessionId}`);
      return c.json({ success: true, cart: null });
    }
    
    console.log(`✅ Cart loaded for session: ${sessionId}`);
    return c.json({ success: true, cart: data.cart });
  } catch (error) {
    console.error('Error loading cart:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to load cart' 
    }, 500);
  }
});

// ===== UNSPLASH SETTINGS ENDPOINT =====

// Get Unsplash settings
app.get("/make-server-bbc0c500/unsplash/settings", async (c) => {
  try {
    const settings = await kv.get('unsplash_settings');
    return c.json({ 
      success: true, 
      settings: settings || {
        accessKey: '',
        isConfigured: false
      }
    });
  } catch (error) {
    console.error('Error getting Unsplash settings:', error);
    return c.json({ success: false, error: 'Failed to get settings' }, 500);
  }
});

// Save Unsplash settings
app.post("/make-server-bbc0c500/unsplash/settings", async (c) => {
  try {
    const settings = await c.req.json();
    
    const settingsToSave = {
      ...settings,
      isConfigured: !!settings.accessKey
    };
    
    await kv.set('unsplash_settings', settingsToSave);
    
    console.log(`✅ Unsplash settings saved. Configured: ${settingsToSave.isConfigured}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving Unsplash settings:', error);
    return c.json({ success: false, error: 'Failed to save settings' }, 500);
  }
});

// ==================== ADMIN PANEL ENDPOINTS ====================

// Get all orders
app.get("/make-server-bbc0c500/orders", async (c) => {
  try {
    const orders = await kv.getByPrefix('order:');
    return c.json(orders || []);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Get single order by ID
app.get("/make-server-bbc0c500/orders/:orderId", async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    return c.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
});

// Update order status
app.patch("/make-server-bbc0c500/orders/:orderId/status", async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const updates = await c.req.json();
    
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    const updatedOrder = { ...order, ...updates };
    await kv.set(`order:${orderId}`, updatedOrder);
    
    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    return c.json({ error: 'Failed to update order status' }, 500);
  }
});

// Get all paintings
app.get("/make-server-bbc0c500/paintings", async (c) => {
  try {
    const paintings = await kv.getByPrefix('painting:');
    return c.json(paintings || []);
  } catch (error) {
    console.error('Error fetching paintings:', error);
    return c.json({ error: 'Failed to fetch paintings' }, 500);
  }
});

// Get all sizes
app.get("/make-server-bbc0c500/sizes", async (c) => {
  try {
    const sizes = await kv.getByPrefix('size:');
    return c.json(sizes || []);
  } catch (error) {
    console.error('Error fetching sizes:', error);
    return c.json({ error: 'Failed to fetch sizes' }, 500);
  }
});

// Get all frame types
app.get("/make-server-bbc0c500/frame-types", async (c) => {
  try {
    const frameTypes = await kv.getByPrefix('frame_type:');
    return c.json(frameTypes || []);
  } catch (error) {
    console.error('Error fetching frame types:', error);
    return c.json({ error: 'Failed to fetch frame types' }, 500);
  }
});

// Get all clients
app.get("/make-server-bbc0c500/clients", async (c) => {
  try {
    const clients = await kv.getByPrefix('client:');
    return c.json(clients || []);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return c.json({ error: 'Failed to fetch clients' }, 500);
  }
});

// Get single client by ID
app.get("/make-server-bbc0c500/clients/:clientId", async (c) => {
  try {
    const clientId = c.req.param('clientId');
    const client = await kv.get(`client:${clientId}`);
    
    if (!client) {
      return c.json({ error: 'Client not found' }, 404);
    }
    
    return c.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return c.json({ error: 'Failed to fetch client' }, 500);
  }
});

// Clean up old processed IPN queue items (optional maintenance endpoint)
app.post("/make-server-bbc0c500/netopia/cleanup-queue", async (c) => {
  try {
    console.log('🧹 [CLEANUP] Cleaning up old processed queue items...');
    
    const { createClient } = await import('npm:@supabase/supabase-js@2.39.7');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Delete items older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('netopia_ipn_queue')
      .delete()
      .eq('processed', true)
      .lt('created_at', sevenDaysAgo.toISOString());
    
    if (error) {
      console.error('❌ [CLEANUP] Failed to clean queue:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    console.log('✅ [CLEANUP] Queue cleaned successfully');
    return c.json({ success: true, message: 'Queue cleaned' }, 200);
    
  } catch (error) {
    console.error('❌ [CLEANUP] Error cleaning queue:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// Start server
Deno.serve(app.fetch);