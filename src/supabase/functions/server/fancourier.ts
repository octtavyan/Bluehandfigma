import { Hono } from "npm:hono@4.3.11";
import * as kv from './kv_store.tsx';

const app = new Hono();

// FAN Courier API endpoints
const FAN_API_BASE_URL = 'https://api.fancourier.ro';

interface FanCourierSettings {
  username: string;
  password: string;
  clientId: string;
  // Sender information
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderCounty: string;
  senderLocality: string;
  senderStreet: string;
  senderStreetNo: string;
  senderZipCode: string;
  // Default shipment settings
  defaultService: string; // 'Standard', 'Express', 'Cont Colector'
  defaultPayment: string; // 'sender', 'recipient'
  defaultPackages: number;
  defaultWeight: number;
  // Options
  enableAutoAWB: boolean;
  enableAutoEmail: boolean;
  isConfigured: boolean;
}

// Get FAN Courier settings
app.get('/fancourier/settings', async (c) => {
  try {
    const settings = await kv.get('fancourier_settings');
    return c.json({ 
      settings: settings || {
        username: '',
        password: '',
        clientId: '',
        senderName: '',
        senderPhone: '',
        senderEmail: '',
        senderCounty: '',
        senderLocality: '',
        senderStreet: '',
        senderStreetNo: '',
        senderZipCode: '',
        defaultService: 'Standard',
        defaultPayment: 'sender',
        defaultPackages: 1,
        defaultWeight: 1,
        enableAutoAWB: false,
        enableAutoEmail: false,
        isConfigured: false,
      }
    });
  } catch (error) {
    console.error('Error loading FAN Courier settings:', error);
    return c.json({ error: 'Failed to load settings' }, 500);
  }
});

// Save FAN Courier settings
app.post('/fancourier/settings', async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set('fancourier_settings', settings);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving FAN Courier settings:', error);
    return c.json({ error: 'Failed to save settings' }, 500);
  }
});

// Test FAN Courier connection (login)
app.post('/fancourier/test', async (c) => {
  try {
    const settings = await kv.get('fancourier_settings') as FanCourierSettings | null;
    
    if (!settings || !settings.username || !settings.password) {
      return c.json({ error: 'FAN Courier credentials not configured' }, 400);
    }

    // Attempt to login to FAN Courier API
    const loginResponse = await fetch(`${FAN_API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: settings.username,
        password: settings.password,
      }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('FAN Courier login failed:', errorText);
      return c.json({ 
        success: false, 
        error: 'Login failed. Please check your credentials.',
        details: errorText,
      }, 400);
    }

    const loginData = await loginResponse.json();
    
    return c.json({ 
      success: true, 
      message: 'Successfully connected to FAN Courier API',
      token: loginData.token ? 'Token received' : 'No token',
    });
  } catch (error) {
    console.error('Error testing FAN Courier connection:', error);
    return c.json({ 
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Generate AWB for an order
app.post('/fancourier/generate-awb', async (c) => {
  try {
    const orderData = await c.req.json();
    const settings = await kv.get('fancourier_settings') as FanCourierSettings | null;
    
    if (!settings || !settings.username || !settings.password || !settings.clientId) {
      return c.json({ error: 'FAN Courier not configured' }, 400);
    }

    // Step 1: Login to get token
    console.log('🔐 Logging in to FAN Courier...');
    const loginResponse = await fetch(`${FAN_API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: settings.username,
        password: settings.password,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error('FAN Courier login failed');
    }

    const { token } = await loginResponse.json();

    // Step 2: Generate AWB
    console.log('📦 Generating AWB...');
    const awbPayload = {
      clientId: settings.clientId,
      shipments: [
        {
          info: {
            service: orderData.service || settings.defaultService,
            packages: { 
              parcel: orderData.packages || settings.defaultPackages, 
              envelopes: 0 
            },
            weight: orderData.weight || settings.defaultWeight,
            cod: orderData.cod || 0, // Cash on delivery amount
            declaredValue: orderData.declaredValue || 0,
            payment: settings.defaultPayment,
            returnPayment: null,
            observation: orderData.notes || '',
            content: orderData.content || 'Tablou Canvas',
            dimensions: orderData.dimensions || {
              length: 100,
              height: 10,
              width: 70,
            },
            options: orderData.options || ['X'], // X = don't open package
            recipient: {
              name: orderData.recipientName,
              phone: orderData.recipientPhone,
              email: orderData.recipientEmail || '',
              address: {
                county: orderData.county,
                locality: orderData.locality,
                street: orderData.street || '',
                streetNo: orderData.streetNo || '',
                zipCode: orderData.zipCode || '',
              },
            },
          },
        },
      ],
    };

    const awbResponse = await fetch(`${FAN_API_BASE_URL}/intern-awb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(awbPayload),
    });

    if (!awbResponse.ok) {
      const errorText = await awbResponse.text();
      console.error('AWB generation failed:', errorText);
      throw new Error(`AWB generation failed: ${errorText}`);
    }

    const awbData = await awbResponse.json();
    console.log('✅ AWB generated:', awbData);

    return c.json({
      success: true,
      awb: awbData.awb || awbData,
      message: 'AWB generated successfully',
    });
  } catch (error) {
    console.error('Error generating AWB:', error);
    return c.json({ 
      error: 'Failed to generate AWB',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Get AWB label (PDF)
app.get('/fancourier/awb-label/:awb', async (c) => {
  try {
    const awb = c.req.param('awb');
    const settings = await kv.get('fancourier_settings') as FanCourierSettings | null;
    
    if (!settings || !settings.username || !settings.password || !settings.clientId) {
      return c.json({ error: 'FAN Courier not configured' }, 400);
    }

    // Login to get token
    const loginResponse = await fetch(`${FAN_API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: settings.username,
        password: settings.password,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error('FAN Courier login failed');
    }

    const { token } = await loginResponse.json();

    // Get AWB label
    const labelResponse = await fetch(
      `${FAN_API_BASE_URL}/awb/label?clientId=${settings.clientId}&awbs[]=${awb}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!labelResponse.ok) {
      throw new Error('Failed to get AWB label');
    }

    // Return the PDF
    const pdfBuffer = await labelResponse.arrayBuffer();
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="awb-${awb}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error getting AWB label:', error);
    return c.json({ 
      error: 'Failed to get AWB label',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Track AWB
app.get('/fancourier/track/:awb', async (c) => {
  try {
    const awb = c.req.param('awb');
    const settings = await kv.get('fancourier_settings') as FanCourierSettings | null;
    
    if (!settings || !settings.username || !settings.password) {
      return c.json({ error: 'FAN Courier not configured' }, 400);
    }

    // Login to get token
    const loginResponse = await fetch(`${FAN_API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: settings.username,
        password: settings.password,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error('FAN Courier login failed');
    }

    const { token } = await loginResponse.json();

    // Track AWB
    const trackResponse = await fetch(
      `${FAN_API_BASE_URL}/reports/awb/tracking?awb=${awb}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!trackResponse.ok) {
      throw new Error('Failed to track AWB');
    }

    const trackData = await trackResponse.json();

    return c.json({
      success: true,
      tracking: trackData,
    });
  } catch (error) {
    console.error('Error tracking AWB:', error);
    return c.json({ 
      error: 'Failed to track AWB',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

export const fanCourierHandlers = app;
