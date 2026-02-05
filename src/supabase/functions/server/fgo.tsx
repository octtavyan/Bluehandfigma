/**
 * FGO API Integration Module
 * Handles invoice generation via FGO (Factura Go) Romanian invoicing system
 */

import * as kv from './kv_store.tsx';

interface FgoSettings {
  enabled: boolean;
  environment: 'test' | 'production';
  test: {
    codUnic: string;
    cheiePivata: string;
    serie: string;
  };
  production: {
    codUnic: string;
    cheiePivata: string;
    serie: string;
  };
  platformaUrl: string;
}

interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerCounty: string;
  customerPostalCode: string;
  total: number;
  deliveryPrice: number;
  items: Array<{
    name: string;
    paintingTitle: string;
    size: string;
    orientation: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  billingName?: string;
  billingAddress?: string;
  billingCUI?: string;
  billingRegCom?: string;
  personType?: 'fizica' | 'juridica';
}

interface FgoInvoiceItem {
  Denumire: string;
  CodArticol?: string;
  Descriere?: string;
  PretUnitar?: number;
  PretTotal?: number;
  UM: string;
  NrProduse: number;
  CotaTVA: number;
}

interface FgoEmitereRequest {
  CodUnic: string;
  Hash: string;
  Text?: string;
  Explicatii?: string;
  Valuta: string;
  TipFactura: string;
  DataEmitere?: string;
  DataScadenta?: string;
  Numar?: string;
  Serie: string;
  TvaLaIncasare?: boolean;
  VerificareDuplicat?: boolean;
  ValideazaCodUnicRo?: boolean;
  IdExtern?: string;
  Client: {
    Denumire: string;
    CodUnic?: string;
    NrRegCom?: string;
    Email?: string;
    Telefon?: string;
    Tara: string;
    Judet?: string;
    Localitate?: string;
    Adresa?: string;
    Tip: 'PF' | 'PJ';
    IdExtern?: number;
    Strain?: boolean;
    ContBancar?: string;
    PlatitorTVA?: boolean;
  };
  Continut: FgoInvoiceItem[];
  PlatformaUrl: string;
}

interface FgoResponse {
  Success: boolean;
  Message?: string;
  Factura?: {
    Numar: string;
    Serie: string;
    Link: string;
    LinkPlata?: string;
  };
  InfoStoc?: Array<{
    CodConta: string;
    Nume: string;
    Stoc: number;
  }>;
}

const KV_KEY_SETTINGS = 'fgo_settings';
const VAT_RATE = 21; // Current VAT rate in Romania

/**
 * Calculate SHA-1 hash for FGO authentication
 */
async function calculateHash(codUnic: string, cheiePivata: string, clientName: string): Promise<string> {
  const text = `${codUnic}${cheiePivata}${clientName}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.toUpperCase();
}

/**
 * Get FGO API base URL based on environment
 */
function getFgoApiUrl(environment: 'test' | 'production'): string {
  return environment === 'production' 
    ? 'https://api.fgo.ro/v1' 
    : 'https://api-testuat.fgo.ro/v1';
}

/**
 * Get FGO settings from KV store
 */
export async function getSettings(): Promise<FgoSettings | null> {
  try {
    const settings = await kv.get(KV_KEY_SETTINGS);
    return settings as FgoSettings | null;
  } catch (error) {
    console.error('❌ Error getting FGO settings:', error);
    return null;
  }
}

/**
 * Save FGO settings to KV store
 */
export async function saveSettings(settings: FgoSettings): Promise<boolean> {
  try {
    await kv.set(KV_KEY_SETTINGS, settings);
    console.log('✅ FGO settings saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving FGO settings:', error);
    return false;
  }
}

/**
 * Test FGO connection by fetching nomenclators
 */
export async function testConnection(settings: FgoSettings): Promise<{ success: boolean; message: string }> {
  try {
    const apiUrl = getFgoApiUrl(settings.environment);
    
    // Test by fetching nomenclator (doesn't require authentication)
    const response = await fetch(`${apiUrl}/nomenclator/tipfactura`);
    
    if (!response.ok) {
      return {
        success: false,
        message: `Eroare la conectarea la FGO API: ${response.status} ${response.statusText}`
      };
    }

    const data = await response.json();
    
    if (data.Success) {
      return {
        success: true,
        message: 'Conexiunea la FGO API a fost testată cu succes!'
      };
    } else {
      return {
        success: false,
        message: 'FGO API nu a returnat un răspuns valid'
      };
    }
  } catch (error) {
    console.error('❌ Error testing FGO connection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Eroare necunoscută'
    };
  }
}

/**
 * Convert invoice data to FGO format
 */
function convertToFgoFormat(invoiceData: InvoiceData, settings: FgoSettings): FgoEmitereRequest {
  const VAT_RATE_DECIMAL = VAT_RATE / 100;
  
  // Get environment-specific credentials
  const envSettings = settings[settings.environment];
  
  // Calculate prices excluding VAT
  const items: FgoInvoiceItem[] = invoiceData.items.map(item => {
    // Price includes VAT, calculate base price
    const priceWithVat = item.price;
    const priceWithoutVat = priceWithVat / (1 + VAT_RATE_DECIMAL);
    
    // Determine item name based on type
    let itemName = '';
    if (item.paintingTitle) {
      // Regular painting
      itemName = item.paintingTitle;
    } else if (item.name) {
      // Fallback to name field
      itemName = item.name;
    } else {
      // Personalized canvas (no title)
      itemName = `Tablou Personalizat ${item.size}${item.orientation ? ` (${item.orientation})` : ''}`;
    }
    
    return {
      Denumire: itemName,
      CodArticol: `CANVAS-${item.size.replace(/[^0-9x]/gi, '')}`,
      Descriere: `${itemName} - ${item.size}${item.orientation ? ` (${item.orientation})` : ''}`,
      PretUnitar: parseFloat(priceWithoutVat.toFixed(2)),
      UM: 'BUC',
      NrProduse: item.quantity || 1,
      CotaTVA: VAT_RATE,
    };
  });

  const clientType = invoiceData.personType === 'juridica' ? 'PJ' : 'PF';
  const clientName = invoiceData.billingName || invoiceData.customerName;
  
  const request: FgoEmitereRequest = {
    CodUnic: envSettings.codUnic,
    Hash: '', // Will be calculated below
    Text: `Comandă #${invoiceData.orderNumber}`,
    Valuta: 'RON',
    TipFactura: 'Factura',
    DataEmitere: new Date(invoiceData.orderDate).toISOString().split('T')[0], // Format: yyyy-mm-dd
    Serie: envSettings.serie,
    VerificareDuplicat: true,
    ValideazaCodUnicRo: clientType === 'PJ',
    IdExtern: invoiceData.orderNumber,
    Client: {
      Denumire: clientName,
      CodUnic: invoiceData.billingCUI || undefined,
      NrRegCom: invoiceData.billingRegCom || undefined,
      Email: invoiceData.customerEmail,
      Telefon: invoiceData.customerPhone,
      Tara: 'ROMANIA',
      Judet: invoiceData.customerCounty || undefined,
      Localitate: invoiceData.customerCity || undefined,
      Adresa: invoiceData.billingAddress || invoiceData.customerAddress || undefined,
      Tip: clientType,
      PlatitorTVA: clientType === 'PJ' && !!invoiceData.billingCUI,
    },
    Continut: items,
    PlatformaUrl: settings.platformaUrl || 'https://www.bluehandcanvas.ro',
  };
  
  return request;
}

/**
 * Generate invoice via FGO API
 */
export async function generateInvoice(invoiceData: InvoiceData): Promise<{ 
  success: boolean; 
  invoiceNumber?: string;
  invoiceSerie?: string;
  invoiceLink?: string;
  message?: string;
}> {
  try {
    // Get FGO settings
    const settings = await getSettings();
    
    if (!settings) {
      return {
        success: false,
        message: 'FGO nu este configurat. Accesează Setări → FGO pentru configurare.'
      };
    }

    if (!settings.enabled) {
      return {
        success: false,
        message: 'FGO este dezactivat. Activează-l în Setări → FGO.'
      };
    }

    // Validate settings
    if (!settings[settings.environment].codUnic || !settings[settings.environment].cheiePivata || !settings[settings.environment].serie) {
      return {
        success: false,
        message: 'Setările FGO sunt incomplete. Verifică configurația în Setări → FGO.'
      };
    }

    // Convert invoice data to FGO format
    const fgoRequest = convertToFgoFormat(invoiceData, settings);
    
    // Calculate hash for authentication
    const hash = await calculateHash(
      settings[settings.environment].codUnic, 
      settings[settings.environment].cheiePivata, 
      fgoRequest.Client.Denumire
    );
    
    fgoRequest.Hash = hash;

    // Get API URL
    const apiUrl = getFgoApiUrl(settings.environment);
    
    console.log('📤 Sending invoice to FGO API...');
    console.log('API URL:', `${apiUrl}/factura/emitere`);
    console.log('Request:', JSON.stringify(fgoRequest, null, 2));

    // Send request to FGO API
    const response = await fetch(`${apiUrl}/factura/emitere`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fgoRequest),
    });

    const responseText = await response.text();
    console.log('📥 FGO API Response:', responseText);

    let data: FgoResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse FGO response:', parseError);
      return {
        success: false,
        message: `Răspuns invalid de la FGO API: ${responseText}`
      };
    }

    if (data.Success && data.Factura) {
      console.log('✅ Invoice generated successfully via FGO');
      console.log('Invoice Number:', data.Factura.Numar);
      console.log('Invoice Serie:', data.Factura.Serie);
      console.log('Invoice Link:', data.Factura.Link);
      
      return {
        success: true,
        invoiceNumber: data.Factura.Numar,
        invoiceSerie: data.Factura.Serie,
        invoiceLink: data.Factura.Link,
        message: 'Factura a fost generată cu succes prin FGO'
      };
    } else {
      console.error('❌ FGO API error:', data.Message);
      return {
        success: false,
        message: data.Message || 'Eroare necunoscută la generarea facturii prin FGO'
      };
    }
  } catch (error) {
    console.error('❌ Error generating FGO invoice:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Eroare la generarea facturii prin FGO'
    };
  }
}

/**
 * Get invoice link from FGO
 */
export async function getInvoiceLink(serie: string, numar: string): Promise<string | null> {
  try {
    const settings = await getSettings();
    
    if (!settings || !settings.enabled) {
      return null;
    }

    const apiUrl = getFgoApiUrl(settings.environment);
    const hash = await calculateHash(settings[settings.environment].codUnic, settings[settings.environment].cheiePivata, numar);

    const response = await fetch(`${apiUrl}/factura/print`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        CodUnic: settings[settings.environment].codUnic,
        Hash: hash,
        Serie: serie,
        Numar: numar,
        PlatformaUrl: settings.platformaUrl,
      }),
    });

    const data: FgoResponse = await response.json();

    if (data.Success && data.Factura?.Link) {
      return data.Factura.Link;
    }

    return null;
  } catch (error) {
    console.error('❌ Error getting FGO invoice link:', error);
    return null;
  }
}

/**
 * Check if FGO is enabled and configured
 */
export async function isEnabled(): Promise<boolean> {
  try {
    const settings = await getSettings();
    return !!(settings?.enabled && settings[settings.environment].codUnic && settings[settings.environment].cheiePivata && settings[settings.environment].serie);
  } catch (error) {
    return false;
  }
}