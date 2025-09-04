import { AuthCallbackData } from '@/types/auth';

export interface GoogleAuthConfig {
  clientId: string;
  redirectUri: string;
  userType: 'CPSK' | 'COMPANY';
}

export interface GoogleAuthResult {
  success: boolean;
  data?: AuthCallbackData;
  error?: string;
}

export class GoogleAuthService {
  private config: GoogleAuthConfig;

  constructor(config: GoogleAuthConfig) {
    this.config = config;
  }

  /**
   * Opens Google OAuth popup and handles the authentication flow
   */
  async authenticate(): Promise<GoogleAuthResult> {
    try {
      const authUrl = this.buildAuthUrl();
      const popup = this.openPopup(authUrl);

      if (!popup) {
        return { success: false, error: 'Popup blocked. Please allow popups for this site.' };
      }

      return await this.handlePopupFlow(popup);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return { success: false, error: 'Authentication failed. Please try again.' };
    }
  }

  private buildAuthUrl(): string {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', this.config.clientId);
    authUrl.searchParams.set('redirect_uri', this.config.redirectUri);
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    return authUrl.toString();
  }

  private openPopup(url: string): Window | null {
    return window.open(url, 'google-oauth', 'width=500,height=600,scrollbars=yes,resizable=yes');
  }

  private async handlePopupFlow(popup: Window): Promise<GoogleAuthResult> {
    return new Promise((resolve) => {
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        this.safeClosePopup(popup);
        window.removeEventListener('message', handleMessage);

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS' && event.data.code) {
          const result = await this.exchangeCodeForTokens(event.data.code);
          resolve(result);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          resolve({ success: false, error: event.data.error || 'Authentication failed' });
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          resolve({ success: false, error: 'Authentication cancelled' });
        }
      }, 1000);
    });
  }

  private safeClosePopup(popup: Window): void {
    try {
      popup.close();
    } catch (error) {
      console.warn('Could not close popup due to browser security policy:', error);
    }
  }

  private async exchangeCodeForTokens(code: string): Promise<GoogleAuthResult> {
    try {
      const endpoint =
        this.config.userType === 'CPSK' ? '/api/auth/cpsk/callback' : '/api/auth/company/callback';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          redirect_uri: this.config.redirectUri,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.message || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      return { success: false, error: 'Failed to connect to server' };
    }
  }
}

/**
 * Creates a GoogleAuth instance for CPSK users
 */
export function createCPSKGoogleAuth(): GoogleAuthService {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_CPSK || '';
  const redirectUri = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/callback`;

  return new GoogleAuthService({
    clientId,
    redirectUri,
    userType: 'CPSK',
  });
}

/**
 * Creates a GoogleAuth instance for Company users
 */
export function createCompanyGoogleAuth(): GoogleAuthService {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_COMPANY || '';
  const redirectUri = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/callback`;

  return new GoogleAuthService({
    clientId,
    redirectUri,
    userType: 'COMPANY',
  });
}
