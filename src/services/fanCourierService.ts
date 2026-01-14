/**
 * FAN Courier SelfAWB API Integration (v2.0, May 2023)
 * 
 * This service handles AWB (Air Waybill) generation, printing, and tracking
 * for FAN Courier shipments. It integrates seamlessly with the existing order system.
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

const FAN_API_BASE_URL = 'https://api.fancourier.ro';

// Helper function to safely get environment variables (fallback)
const getEnvVar = (key: string): string => {
  // Try import.meta.env first (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || '';
  }
  // Fallback to empty string
  return '';
};

// Get FAN Courier credentials from database or environment variables
// Priority: Database > Environment Variables
const getFanCredentials = async () => {
  // First, try to get from database
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('kv_store_bbc0c500')
        .select('value')
        .eq('key', 'fan_courier_config')
        .single();

      if (!error && data?.value) {
        const config = typeof data.value === 'string' 
          ? JSON.parse(data.value) 
          : data.value;
        
        // Only use database config if it's enabled
        if (config.isEnabled) {
          return {
            username: config.username || '',
            password: config.password || '',
            clientId: config.clientId || '',
          };
        }
      }
    } catch (error) {
      console.warn('Could not load FAN Courier config from database, falling back to env vars');
    }
  }

  // Fallback to environment variables
  return {
    username: getEnvVar('VITE_FAN_COURIER_USERNAME'),
    password: getEnvVar('VITE_FAN_COURIER_PASSWORD'),
    clientId: getEnvVar('VITE_FAN_COURIER_CLIENT_ID'),
  };
};

export interface AWBData {
  awbNumber: string;
  generatedAt: string;
  trackingUrl: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'returned' | 'cancelled';
  lastUpdate?: string;
  labelUrl?: string;
}

export interface ShipmentDimensions {
  length: number; // cm
  height: number; // cm
  width: number;  // cm
}

export interface ShipmentInfo {
  service: 'Standard' | 'Express' | 'Collector';
  packages: {
    parcel: number;
    envelopes: number;
  };
  weight: number; // kg
  cod: number; // Cash on Delivery amount in RON
  declaredValue: number; // RON
  payment: 'sender' | 'recipient';
  observation?: string;
  content: string; // Description of shipment contents
  dimensions: ShipmentDimensions;
  options?: string[]; // e.g., ['X'] for special options
  recipient: {
    name: string;
    phone: string;
    email: string;
    address: {
      county: string;
      locality: string; // City
      street: string;
      streetNo: string;
      zipCode: string;
    };
  };
}

export interface AWBGenerationResponse {
  success: boolean;
  awb?: string;
  error?: string;
  details?: any;
}

export interface AWBTrackingResponse {
  success: boolean;
  status?: string;
  events?: Array<{
    date: string;
    status: string;
    location: string;
    description: string;
  }>;
  error?: string;
}

class FanCourierService {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Authenticate with FAN Courier API and get access token
   */
  private async authenticate(): Promise<string> {
    // Return cached token if still valid
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const { username, password } = await getFanCredentials();

    if (!username || !password) {
      throw new Error('FAN Courier credentials not configured. Please configure FAN Courier in Admin Settings → Setări → FAN Courier AWB.');
    }

    try {
      const response = await fetch(`${FAN_API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`FAN Courier authentication failed: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.token) {
        throw new Error('FAN Courier authentication failed: No token received');
      }

      this.token = data.token;
      // Set token expiry to 23 hours (tokens typically valid for 24 hours)
      this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);

      return this.token;
    } catch (error) {
      console.error('FAN Courier authentication error:', error);
      throw error;
    }
  }

  /**
   * Generate AWB for a shipment
   */
  async generateAWB(shipmentInfo: ShipmentInfo): Promise<AWBGenerationResponse> {
    try {
      const token = await this.authenticate();

      const { clientId } = await getFanCredentials();

      if (!clientId) {
        throw new Error('FAN Courier Client ID not configured. Please configure FAN Courier in Admin Settings → Setări → FAN Courier AWB.');
      }

      const requestBody = {
        clientId,
        shipments: [
          {
            info: shipmentInfo,
          },
        ],
      };

      const response = await fetch(`${FAN_API_BASE_URL}/intern-awb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `AWB generation failed: ${response.statusText}`,
          details: data,
        };
      }

      // Extract AWB number from response
      const awbNumber = data.shipments?.[0]?.awb || data.awb;

      if (!awbNumber) {
        return {
          success: false,
          error: 'AWB number not found in response',
          details: data,
        };
      }

      return {
        success: true,
        awb: awbNumber,
        details: data,
      };
    } catch (error: any) {
      console.error('Error generating AWB:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while generating AWB',
      };
    }
  }

  /**
   * Get AWB label (PDF or HTML)
   */
  async getAWBLabel(awbNumber: string, format: 'pdf' | 'html' = 'pdf'): Promise<Blob | null> {
    try {
      const token = await this.authenticate();

      const { clientId } = await getFanCredentials();

      const url = `${FAN_API_BASE_URL}/awb/label?clientId=${clientId}&awbs[]=${awbNumber}&format=${format}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to get AWB label:', response.statusText);
        return null;
      }

      return await response.blob();
    } catch (error) {
      console.error('Error getting AWB label:', error);
      return null;
    }
  }

  /**
   * Track AWB shipment
   */
  async trackAWB(awbNumber: string): Promise<AWBTrackingResponse> {
    try {
      const token = await this.authenticate();

      const url = `${FAN_API_BASE_URL}/reports/awb/tracking?awb=${awbNumber}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to track AWB',
        };
      }

      // Parse tracking events
      const events = Array.isArray(data.events) ? data.events : [];
      const currentStatus = events.length > 0 ? events[0].status : 'pending';

      return {
        success: true,
        status: currentStatus,
        events: events.map((event: any) => ({
          date: event.date,
          status: event.status,
          location: event.location || '',
          description: event.description || event.status,
        })),
      };
    } catch (error: any) {
      console.error('Error tracking AWB:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred while tracking AWB',
      };
    }
  }

  /**
   * Helper: Parse address string into structured format
   * Format: "Street Name, No. 123, City, County, ZIP"
   */
  parseAddress(fullAddress: string, city?: string, county?: string, zipCode?: string): {
    street: string;
    streetNo: string;
    locality: string;
    county: string;
    zipCode: string;
  } {
    // Default values
    let street = '';
    let streetNo = '';
    let locality = city || '';
    let countyValue = county || '';
    let zip = zipCode || '';

    // Try to parse full address
    const parts = fullAddress.split(',').map(p => p.trim());
    
    if (parts.length >= 2) {
      street = parts[0];
      
      // Try to extract street number from second part
      const numberMatch = parts[1].match(/(\d+)/);
      if (numberMatch) {
        streetNo = numberMatch[1];
      }
      
      // If city not provided, use third part
      if (!locality && parts.length >= 3) {
        locality = parts[2];
      }
      
      // If county not provided, use fourth part
      if (!countyValue && parts.length >= 4) {
        countyValue = parts[3];
      }
    } else {
      // If parsing fails, use full address as street
      street = fullAddress;
      streetNo = 'N/A';
    }

    return {
      street,
      streetNo,
      locality,
      county: countyValue,
      zipCode: zip || '000000',
    };
  }

  /**
   * Helper: Calculate default package dimensions based on canvas items
   */
  calculateDimensions(items: any[]): ShipmentDimensions {
    // Default dimensions for canvas package (in cm)
    let maxLength = 50;
    let maxHeight = 10;
    let maxWidth = 50;

    // Try to calculate from canvas items
    items.forEach(item => {
      if (item.size) {
        // Parse size like "30×40 cm" or "30x40"
        const sizeMatch = item.size.match(/(\d+)\s*[×x]\s*(\d+)/);
        if (sizeMatch) {
          const width = parseInt(sizeMatch[1]);
          const height = parseInt(sizeMatch[2]);
          
          maxLength = Math.max(maxLength, Math.max(width, height) + 10); // Add 10cm padding
          maxWidth = Math.max(maxWidth, Math.min(width, height) + 10);
        }
      }
    });

    return {
      length: maxLength,
      height: maxHeight,
      width: maxWidth,
    };
  }

  /**
   * Helper: Calculate package weight based on canvas items
   */
  calculateWeight(items: any[]): number {
    // Base weight per canvas (kg)
    const baseWeightPerCanvas = 0.5;
    
    // Calculate total weight
    const totalWeight = items.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      return sum + (baseWeightPerCanvas * quantity);
    }, 0);

    // Minimum weight 0.5kg, round up to nearest 0.5kg
    return Math.max(0.5, Math.ceil(totalWeight * 2) / 2);
  }
}

// Export singleton instance
export const fanCourierService = new FanCourierService();