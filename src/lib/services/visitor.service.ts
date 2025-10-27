/**
 * Visitor Service
 * Handles all Visitor-related API calls (authentication, profile)
 */

interface VisitorUser {
  id: string;
  first_name: string;
  last_name: string;
  user: {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: {
      time: string;
      valid: boolean;
    } | null;
    email: string;
    tel: string;
    username: string;
    profile_picture?: string;
    punishment?: {
      type: string;
      at: string;
      end: string;
    };
  };
}

interface VisitorAuthResponse {
  access_token: string;
  user: VisitorUser;
}

interface GoogleAuthRequest {
  code: string;
}

export class VisitorService {
  /**
   * Authenticate visitor with Google OAuth code
   * @param code - The authorization code from Google OAuth
   */
  static async authenticateWithGoogle(code: string): Promise<VisitorAuthResponse> {
    try {
      const payload: GoogleAuthRequest = { code };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google/visitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Authentication failed: ${response.status}`
        );
      }

      const data: VisitorAuthResponse = await response.json();

      // Validate response structure
      if (!data.access_token || !data.user) {
        throw new Error('Invalid response from authentication server');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to authenticate with Google');
    }
  }
}
