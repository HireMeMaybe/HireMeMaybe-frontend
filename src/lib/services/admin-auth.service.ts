/**
 * Admin Authentication Service
 * Handles admin login and session management
 */

import { apiClient, ApiError } from './api-client';

interface AdminUser {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  tel: string | null;
  email: string | null;
  id: string;
  username: string;
  profile_picture: string;
}

interface AdminLoginResponse {
  user: AdminUser;
  access_token: string;
}

interface AdminLoginCredentials {
  username: string;
  password: string;
}

export class AdminAuthService {
  private static readonly ADMIN_TOKEN_KEY = 'admin_access_token';
  private static readonly ADMIN_USER_KEY = 'admin_user';

  /**
   * Login admin user
   */
  static async login(credentials: AdminLoginCredentials): Promise<AdminLoginResponse> {
    try {
      const response = await apiClient.post<AdminLoginResponse>(
        '/auth/login',
        credentials,
        { requireAuth: false }
      );

      // Store token and user data
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.ADMIN_TOKEN_KEY, response.access_token);
        localStorage.setItem(this.ADMIN_USER_KEY, JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed');
    }
  }

  /**
   * Logout admin user
   */
  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ADMIN_TOKEN_KEY);
      localStorage.removeItem(this.ADMIN_USER_KEY);
    }
  }

  /**
   * Get stored admin token
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ADMIN_TOKEN_KEY);
  }

  /**
   * Get stored admin user
   */
  static getUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem(this.ADMIN_USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Check if admin is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Verify token validity (optional - can be enhanced with API call)
   */
  static async verifyToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      // You can add an API call here to verify token with backend
      // For now, we'll just check if token exists
      return true;
    } catch {
      this.logout();
      return false;
    }
  }
}