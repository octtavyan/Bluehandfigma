// API Configuration for BlueHand Canvas
// This file centralizes all backend communication with the PHP server

// =============================================================================
// BACKEND CONFIGURATION
// =============================================================================

// PHP Backend Configuration (bluehand.ro)
const PHP_CONFIG = {
  baseUrl: 'https://bluehand.ro/api',
  uploadsUrl: 'https://bluehand.ro/uploads',
};

// =============================================================================
// API CLIENT
// =============================================================================

class APIClient {
  private baseUrl: string;
  private uploadsUrl: string;
  
  constructor() {
    this.baseUrl = PHP_CONFIG.baseUrl;
    this.uploadsUrl = PHP_CONFIG.uploadsUrl;
  }

  // Get the base URL
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Get uploads URL
  getUploadsUrl(): string {
    return this.uploadsUrl;
  }

  // Build full URL for an endpoint
  buildUrl(endpoint: string): string {
    // PHP: https://bluehand.ro/api/endpoint
    return `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
  }

  // Make an API request
  async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = this.buildUrl(endpoint);
    
    // Add authorization header
    const headers: HeadersInit = {
      ...options.headers,
    };

    // PHP Backend: Add admin token if available
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }

    // Content-Type for JSON requests
    if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
      if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }

  // GET request
  async get(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  // Upload file
  async uploadFile(file: File, category: 'paintings' | 'orders' | 'sliders' | 'blog'): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await this.post('upload', formData);
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }
}

// =============================================================================
// EXPORT
// =============================================================================

// Export singleton instance
export const api = new APIClient();

// Export configuration
export const config = {
  baseUrl: PHP_CONFIG.baseUrl,
  uploadsUrl: PHP_CONFIG.uploadsUrl,
};
