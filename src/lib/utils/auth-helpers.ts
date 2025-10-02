/**
 * Authentication helper utilities
 * Handles token expiration and automatic logout
 */

/**
 * Handles automatic logout when token expires
 * Redirects user to landing page
 */
export async function handleTokenExpiration(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const { signOut } = await import('next-auth/react');
    await signOut({ callbackUrl: '/', redirect: true });
  } catch (error) {
    console.error('Error during logout:', error);
    // Fallback: redirect manually if signOut fails
    window.location.href = '/';
  }
}

/**
 * Checks if an error is related to authentication/token expiration
 */
export function isAuthError(error: unknown): boolean {
  if (!error) return false;

  const errorString = String(error).toLowerCase();
  return (
    errorString.includes('401') ||
    errorString.includes('unauthorized') ||
    errorString.includes('token') ||
    errorString.includes('authentication')
  );
}

/**
 * Wraps an async function with automatic token expiration handling
 * If the function throws an auth error, automatically logs out
 */
export async function withAuthErrorHandling<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (isAuthError(error)) {
      console.warn('Auth error detected, logging out:', error);
      await handleTokenExpiration();
      return null;
    }
    throw error;
  }
}
