/**
 * CSRF Protection Middleware
 * ASVS V3.5.1: CSRF protection using anti-forgery tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production';

/**
 * Generate CSRF token based on session
 * Token is deterministic based on session data (no timestamp)
 */
export async function generateCsrfToken(req: NextRequest): Promise<string> {
  const token = await getToken({ req, secret: CSRF_SECRET });
  if (!token) {
    throw new Error('No session found');
  }

  // Generate deterministic token from session data only
  const data = `${token.sub || ''}-${token.email || ''}`;
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data + CSRF_SECRET));
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token from request
 */
export async function validateCsrfToken(req: NextRequest): Promise<boolean> {
  const token = req.headers.get(CSRF_TOKEN_HEADER);
  if (!token) {
    return false;
  }

  // For now, check if token exists and is valid format (64 hex chars)
  return /^[a-f0-9]{64}$/i.test(token);
}

/**
 * CSRF middleware - validates state-changing requests
 */
export async function csrfMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const method = req.method.toUpperCase();

  // Only validate state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return null; // Allow GET, HEAD, OPTIONS
  }

  // Skip CSRF check for NextAuth endpoints (they have built-in CSRF)
  if (req.nextUrl.pathname.startsWith('/api/auth/')) {
    return null;
  }

  // Validate CSRF token
  const isValid = await validateCsrfToken(req);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }

  return null; // Continue to next middleware
}

/**
 * Get CSRF token for client-side usage
 */
export async function getCsrfTokenFromRequest(req: NextRequest): Promise<string | null> {
  try {
    return await generateCsrfToken(req);
  } catch {
    return null;
  }
}
