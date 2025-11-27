/**
 * Base API Client for backend communication
 * Handles authentication, error handling, and request/response interceptors
 * ASVS V3.5.1: CSRF protection for state-changing requests
 */

import { getSession } from 'next-auth/react';
import { handleTokenExpiration } from '@/lib/utils/auth-helpers';
import { AdminAuthService } from './admin-auth.service';

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
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: HeadersInit;
  private csrfToken: string | null = null;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_BACKEND_URL || '';
    this.defaultHeaders = config.headers || {};
  }

  /**
   * Fetch CSRF token for frontend API calls
   * ASVS V3.5.1: Anti-forgery token for state-changing requests
   */
  private async getCsrfToken(): Promise<string | null> {
    // Return cached token if available
    if (this.csrfToken) {
      return this.csrfToken;
    }

    try {
      const response = await fetch('/api/csrf-token');
      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.token;
        return this.csrfToken;
      }
    } catch (error) {
      console.warn('Failed to fetch CSRF token:', error);
    }

    return null;
  }

  /**
   * Clear cached CSRF token (e.g., after logout)
   */
  public clearCsrfToken(): void {
    this.csrfToken = null;
  }

  private async getAuthToken(): Promise<string | null> {
    // First check for admin token (for admin routes)
    const adminToken = AdminAuthService.getToken();
    if (adminToken) {
      return adminToken;
    }

    // Fall back to regular user session token
    const session = await getSession();
    return session?.backendToken || null;
  }
  private async buildHeaders(config: RequestConfig): Promise<HeadersInit> {
    const headers: Record<string, string> = { ...this.defaultHeaders } as Record<string, string>;

    // Add auth token if required
    if (config.requireAuth !== false) {
      const token = await this.getAuthToken();
      if (token) {
        const hasAuthScheme = /^[A-Z]+\s+/i.test(token);
        headers['Authorization'] = hasAuthScheme ? token : `Bearer ${token}`;
      }
    }

    // ASVS V3.5.1: Add CSRF token for state-changing requests (frontend APIs only)
    // Note: Backend APIs don't validate CSRF yet, so we skip it for backend calls
    // Only add CSRF for Next.js API routes (/api/*), not for backend calls
    const method = config.method?.toUpperCase();
    const isBackendCall = !!this.baseUrl; // baseUrl is set for backend API calls
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !isBackendCall) {
      const csrfToken = await this.getCsrfToken();
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
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

  async request<T = unknown>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.buildHeaders(config);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { requireAuth, useFormData, ...fetchConfig } = config;

    const response = await fetch(url, {
      ...fetchConfig,
      headers,
    });

    return this.handleResponse<T>(response);
  }

  async get<T = unknown>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<T> {
    const body = config.useFormData ? (data as BodyInit) : JSON.stringify(data);
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T = unknown>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    const body = config.useFormData ? (data as BodyInit) : JSON.stringify(data);
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<T> {
    const body = config.useFormData ? (data as BodyInit) : JSON.stringify(data);
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  async delete<T = unknown>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export for custom instances
export default ApiClient;
