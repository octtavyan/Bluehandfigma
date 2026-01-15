import { Hono } from "npm:hono@4.3.11";
import * as kv from './kv_store.tsx';

const app = new Hono();

// Netopia API endpoints
const NETOPIA_SANDBOX_URL = 'https://secure.sandbox.netopia-payments.com';
const NETOPIA_LIVE_URL = 'https://secure.netopia-payments.com';

interface NetopiaSettings {
  merchantId: string;
  apiKey: string;
  isLive: boolean;
  posSignature: string;
  publicKey: string;
}

// Get Netopia settings
app.get('/netopia/settings', async (c) => {
  try {
    const settings = await kv.get('netopia_settings');
    return c.json({ settings: settings || {
      merchantId: '',
      apiKey: '',
      isLive: false,
      posSignature: '',
      publicKey: '',
    }});
  } catch (error) {
    console.error('Error loading Netopia settings:', error);
    return c.json({ error: 'Failed to load settings' }, 500);
  }
});

// Save Netopia settings
app.post('/netopia/settings', async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set('netopia_settings', settings);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving Netopia settings:', error);
    return c.json({ error: 'Failed to save settings' }, 500);
  }
});

// Test Netopia connection
app.post('/netopia/test', async (c) => {
  try {
    const settings = await kv.get('netopia_settings') as NetopiaSettings | null;
    
    if (!settings || !settings.merchantId || !settings.apiKey) {
      return c.json({ error: 'Netopia settings not configured' }, 400);
    }

    // Simple validation that credentials exist
    return c.json({ 
      success: true, 
      message: 'Netopia credentials are configured',
      mode: settings.isLive ? 'LIVE' : 'TEST'
    });
  } catch (error) {
    console.error('Error testing Netopia connection:', error);
    return c.json({ error: 'Connection test failed' }, 500);
  }
});

// Create payment request
app.post('/netopia/start-payment', async (c) => {
  try {
    const body = await c.req.json();
    const { orderId, amount, customerEmail, customerName } = body;

    // Load Netopia settings
    const settings = await kv.get('netopia_settings') as NetopiaSettings | null;
    
    if (!settings || !settings.merchantId || !settings.apiKey) {
      return c.json({ error: 'Netopia not configured' }, 400);
    }

    const baseUrl = settings.isLive ? NETOPIA_LIVE_URL : NETOPIA_SANDBOX_URL;
    
    // Generate payment data
    const paymentData = {
      config: {
        emailTemplate: 'confirm',
        notifyUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-bbc0c500/netopia/notify`,
        redirectUrl: `${body.returnUrl || 'https://bluehand.ro'}/payment-success?orderId=${orderId}`,
        language: 'ro',
      },
      payment: {
        options: {
          installments: 1,
          bonus: 0,
        },
        instrument: {
          type: 'card',
          account: settings.merchantId,
          expMonth: 12,
          expYear: 2025,
          secretKey: settings.apiKey,
        },
        data: {
          // Convert amount to bani (1 leu = 100 bani)
          amount: Math.round(amount * 100),
          currency: 'RON',
          invoiceNumber: orderId,
          orderNumber: orderId,
          details: 'Comanda BlueHand Canvas',
          billing: {
            email: customerEmail,
            phone: '',
            firstName: customerName.split(' ')[0] || '',
            lastName: customerName.split(' ').slice(1).join(' ') || '',
            city: '',
            country: 'RO',
            state: '',
            postalCode: '',
          },
          shipping: {
            email: customerEmail,
            phone: '',
            firstName: customerName.split(' ')[0] || '',
            lastName: customerName.split(' ').slice(1).join(' ') || '',
            city: '',
            country: 'RO',
            state: '',
            postalCode: '',
          },
        },
      },
    };

    // For now, return mock data since we don't have real credentials
    // In production, this would make an actual API call to Netopia
    console.log('📝 Payment request created:', {
      orderId,
      amount,
      baseUrl,
      mode: settings.isLive ? 'LIVE' : 'TEST',
    });

    // Generate a mock payment URL (in production this would come from Netopia API)
    const paymentUrl = `${baseUrl}/payment/card/authorize?orderId=${orderId}`;

    // Store payment session
    await kv.set(`payment_session_${orderId}`, {
      orderId,
      amount,
      customerEmail,
      customerName,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return c.json({
      success: true,
      paymentUrl,
      orderId,
      message: 'Payment initialized. Redirect user to paymentUrl',
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return c.json({ error: 'Failed to create payment' }, 500);
  }
});

// Handle Netopia payment notification (IPN - Instant Payment Notification)
app.post('/netopia/notify', async (c) => {
  try {
    const body = await c.req.json();
    console.log('📨 Netopia IPN received:', body);

    // In production, verify signature and process payment
    // For now, log the notification
    
    const { orderId, status, errorCode, errorMessage } = body;

    if (orderId) {
      await kv.set(`payment_result_${orderId}`, {
        status: status || 'completed',
        errorCode,
        errorMessage,
        receivedAt: new Date().toISOString(),
        rawData: body,
      });
    }

    // Netopia expects an XML response confirming receipt
    return c.text('<?xml version="1.0" encoding="utf-8" ?><crc>ok</crc>', 200, {
      'Content-Type': 'application/xml',
    });
  } catch (error) {
    console.error('Error processing Netopia notification:', error);
    return c.text('<?xml version="1.0" encoding="utf-8" ?><crc>error</crc>', 500, {
      'Content-Type': 'application/xml',
    });
  }
});

// Check payment status
app.get('/netopia/status/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    
    // Check if we have a payment result
    const result = await kv.get(`payment_result_${orderId}`);
    
    if (result) {
      return c.json({
        success: true,
        status: result.status,
        orderId,
      });
    }

    // Check payment session
    const session = await kv.get(`payment_session_${orderId}`);
    
    if (session) {
      return c.json({
        success: true,
        status: session.status || 'pending',
        orderId,
      });
    }

    return c.json({
      success: false,
      status: 'not_found',
      orderId,
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return c.json({ error: 'Failed to check status' }, 500);
  }
});

// Verify payment (called from success page)
app.post('/netopia/verify', async (c) => {
  try {
    const { orderId } = await c.req.json();
    
    // Get payment result
    const result = await kv.get(`payment_result_${orderId}`);
    
    if (!result) {
      // If no IPN received yet, check session
      const session = await kv.get(`payment_session_${orderId}`);
      
      if (session) {
        return c.json({
          verified: false,
          status: 'pending',
          message: 'Payment verification pending',
        });
      }
      
      return c.json({
        verified: false,
        status: 'not_found',
        message: 'Payment not found',
      });
    }

    const isSuccess = result.status === 'completed' || result.status === 'confirmed';

    return c.json({
      verified: isSuccess,
      status: result.status,
      errorMessage: result.errorMessage,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return c.json({ error: 'Verification failed' }, 500);
  }
});

export const netopiaHandlers = app;
