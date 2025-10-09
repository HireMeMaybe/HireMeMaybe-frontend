import { EventEmitter } from 'events';

/**
 * Admin Authentication Service
 * Handles admin login and session management
 */

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
  private static authEventEmitter = new EventEmitter();

  /**
   * Login admin user
   * Uses native fetch to avoid API client's automatic redirect on 401
   */
  static async login(credentials: AdminLoginCredentials): Promise<AdminLoginResponse> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

      const response = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        // Don't trigger automatic logout/redirect for admin login failures
        throw new Error(errorMessage);
      }

      const data: AdminLoginResponse = await response.json();

      // Store token and user data
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.ADMIN_TOKEN_KEY, data.access_token);
        localStorage.setItem(this.ADMIN_USER_KEY, JSON.stringify(data.user));
      }

      // Notify listeners about authentication state change
      this.authEventEmitter.emit('authChange', true);

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
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

    // Notify listeners about authentication state change
    this.authEventEmitter.emit('authChange', false);
  }

  /**
   * Subscribe to authentication state changes
   */
  static onAuthChange(listener: (isAuthenticated: boolean) => void): void {
    this.authEventEmitter.on('authChange', listener);
  }

  /**
   * Unsubscribe from authentication state changes
   */
  static offAuthChange(listener: (isAuthenticated: boolean) => void): void {
    this.authEventEmitter.off('authChange', listener);
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
