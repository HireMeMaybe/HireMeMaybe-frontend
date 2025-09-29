import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';

// Extended session type that includes our custom properties
export interface ExtendedSession {
  user?: {
    email?: string;
    name?: string;
  };
  backendToken?: string;
  backendUser?: {
    id?: string | number;
    email?: string;
    firstName?: string;
    lastName?: string;
    program?: string;
    year?: number;
    soft_skill?: string[];
  };
  isRegistered?: boolean;
}

/**
 * Authentication middleware for API routes
 * Validates NextAuth session and extracts backend token
 */
export async function requireAuth(): Promise<
  | {
      session: ExtendedSession;
      token: string;
    }
  | Response
> {
  try {
    const session = (await getServerSession(authOptions)) as ExtendedSession;

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Authorization code not provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract token from session (backend token takes priority)
    const token = session.backendToken;

    if (!token) {
      return new Response(JSON.stringify({ error: 'No valid authentication token found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return { session, token };
  } catch (error) {
    console.error('Authentication error:', error);
    return new Response(JSON.stringify({ error: 'Authentication failed' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Content-Type validation middleware
 */
export function requireJSON(request: NextRequest): Response | null {
  const contentType = request.headers.get('content-type');

  if (!contentType || !contentType.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return null;
}

/**
 * Form-data Content-Type validation middleware
 */
export function requireFormData(request: NextRequest): Response | null {
  const contentType = request.headers.get('content-type');

  if (!contentType || !contentType.includes('multipart/form-data')) {
    return new Response(JSON.stringify({ error: 'Content-Type must be multipart/form-data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return null;
}

/**
 * Method validation middleware
 */
export function requireMethod(request: NextRequest, allowedMethods: string[]): Response | null {
  if (!allowedMethods.includes(request.method)) {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        Allow: allowedMethods.join(', '),
      },
    });
  }

  return null;
}
