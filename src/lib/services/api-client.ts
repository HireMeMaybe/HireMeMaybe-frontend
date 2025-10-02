/**
 * Base API Client for backend communication
 * Handles authentication, error handling, and request/response interceptors
 */

import { getSession } from 'next-auth/react';
import { handleTokenExpiration } from '@/lib/utils/auth-helpers';

interface ApiClientConfig {
  baseUrl?: string;
  headers?: HeadersInit;
}

interface RequestConfig extends RequestInit {
  requireAuth?: boolean;
  useFormData?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_BACKEND_URL || '';
    this.defaultHeaders = config.headers || {};
  }

  private async getAuthToken(): Promise<string | null> {
    const session = await getSession();
    return session?.backendToken || null;
  }

  private async buildHeaders(config: RequestConfig): Promise<HeadersInit> {
    const headers: Record<string, string> = { ...this.defaultHeaders } as Record<string, string>;

    // Add auth token if required
    if (config.requireAuth !== false) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Add Content-Type for JSON (not for FormData)
    if (!config.useFormData) {
      const customHeaders = config.headers as Record<string, string> | undefined;
      if (!customHeaders?.['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    // Merge with custom headers
    if (config.headers) {
      Object.assign(headers, config.headers);
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      let errorData;

      try {
        errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      // Handle 401 Unauthorized (token expired) - trigger logout
      if (response.status === 401) {
        console.warn('Token expired or unauthorized - logging out');
        handleTokenExpiration();
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Handle no-content responses
    if (response.status === 204) {
      return {} as T;
    }

    try {
      return await response.json();
    } catch {
      return {} as T;
    }
  }

  async request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.buildHeaders(config);

    const { requireAuth, useFormData, ...fetchConfig } = config;

    const response = await fetch(url, {
      ...fetchConfig,
      headers,
    });

    return this.handleResponse<T>(response);
  }

  async get<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    const body = config.useFormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    const body = config.useFormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async patch<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    const body = config.useFormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  async delete<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export for custom instances
export default ApiClient;
