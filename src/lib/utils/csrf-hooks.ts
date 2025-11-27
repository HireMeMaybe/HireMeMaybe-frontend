/**
 * CSRF Token Hook
 * ASVS V3.5.1: Client-side CSRF token management
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function useCsrfToken() {
  const { data: session } = useSession();
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchCsrfToken();
    }
  }, [session]);

  const fetchCsrfToken = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/csrf-token');
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.token);
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get headers with CSRF token for API requests
   */
  const getCsrfHeaders = (): Record<string, string> => {
    if (!csrfToken) {
      return {};
    }
    return {
      'x-csrf-token': csrfToken,
    };
  };

  return {
    csrfToken,
    isLoading,
    getCsrfHeaders,
    refreshToken: fetchCsrfToken,
  };
}
