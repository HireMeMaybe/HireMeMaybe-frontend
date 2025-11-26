import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';

const CSP_BACKEND_ORIGIN = (() => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) return null;
  try {
    return new URL(backendUrl).origin;
  } catch {
    return null;
  }
})();

const ALLOWED_PATHS = new Set(['/', '/unverify', '/company-register', '/auth/callback']);
const SKIP_PREFIXES = ['/_next', '/favicon', '/assets', '/images', '/static', '/public'];
const FETCH_METADATA_ALLOWED_SITES = new Set(['same-origin', 'same-site', 'none']);
const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const rateLimitStore = new Map<string, { count: number; expiresAt: number }>();

function buildCspHeader(nonce: string): string {
  const scriptSrc = ["'self'", `'nonce-${nonce}'`, 'https://accounts.google.com'];
  if (process.env.NODE_ENV !== 'production') {
    scriptSrc.push("'unsafe-eval'");
  }

  const connectSrc = ["'self'", 'https://accounts.google.com', 'https://www.googleapis.com'];
  if (CSP_BACKEND_ORIGIN) {
    connectSrc.push(CSP_BACKEND_ORIGIN);
  }

  return [
    "default-src 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    `style-src 'self' 'unsafe-inline' 'nonce-${nonce}'`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(' ')}`,
    "form-action 'self'",
    "frame-src 'self' blob: https://accounts.google.com",
    'upgrade-insecure-requests',
  ].join('; ');
}

function applySecurityHeaders(response: NextResponse, nonce: string): NextResponse {
  response.headers.set('Content-Security-Policy', buildCspHeader(nonce));
  return response;
}

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function shouldSkip(pathname: string): boolean {
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  return pathname.includes('.');
}

function isApiRequest(pathname: string): boolean {
  return pathname.startsWith('/api');
}

function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  const cfIp = request.headers.get('cf-connecting-ip')?.trim();
  const authHeader = request.headers.get('authorization');
  const tokenTail = authHeader?.split(' ')[1]?.slice(-16);
  const authId = tokenTail ? `auth:${tokenTail}` : null;
  return authId || forwardedFor || realIp || cfIp || 'unknown';
}

function checkRateLimit(identifier: string): { blocked: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || existing.expiresAt <= now) {
    rateLimitStore.set(identifier, {
      count: 1,
      expiresAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { blocked: false, retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) };
  }

  existing.count += 1;
  if (existing.count > RATE_LIMIT_MAX_REQUESTS) {
    return {
      blocked: true,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.expiresAt - now) / 1000)),
    };
  }

  return { blocked: false, retryAfterSeconds: Math.max(1, Math.ceil((existing.expiresAt - now) / 1000)) };
}

function enforceRateLimiting(request: NextRequest): NextResponse | null {
  const { blocked, retryAfterSeconds } = checkRateLimit(getClientIdentifier(request));
  if (!blocked) {
    return null;
  }

  return NextResponse.json(
    {
      error: 'rate_limit_exceeded',
      message: 'Too many requests from this client. Please slow down.',
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfterSeconds.toString(),
        'Content-Type': 'application/json',
      },
    }
  );
}

function validateFetchMetadata(request: NextRequest): NextResponse | null {
  const method = request.method.toUpperCase();
  const site = request.headers.get('sec-fetch-site')?.toLowerCase() || null;
  const mode = request.headers.get('sec-fetch-mode')?.toLowerCase() || null;
  const dest = request.headers.get('sec-fetch-dest')?.toLowerCase() || null;

  // Allow normal navigations to continue without blocking
  if (mode === 'navigate' || dest === 'document') {
    return null;
  }

  // Require fetch metadata for state changing calls to reduce CSRF/drive-by attacks
  if (!site && STATE_CHANGING_METHODS.has(method)) {
    return NextResponse.json(
      { error: 'missing_fetch_metadata', message: 'Fetch metadata headers are required.' },
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (site && !FETCH_METADATA_ALLOWED_SITES.has(site)) {
    return NextResponse.json(
      { error: 'blocked_cross_site', message: 'Cross-site requests are blocked.' },
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (STATE_CHANGING_METHODS.has(method) && mode && mode !== 'same-origin' && mode !== 'cors') {
    return NextResponse.json(
      { error: 'invalid_fetch_mode', message: 'Unsupported fetch mode for this endpoint.' },
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return null;
}

type CompanyAccessRedirect = '/company-register' | '/unverify' | null;

function evaluateCompanyAccess(token: JWT): CompanyAccessRedirect {
  const backendUser = (token as Record<string, unknown>)['backendUser'] as
    | Record<string, unknown>
    | undefined;
  const isRegistered =
    typeof (token as Record<string, unknown>)['isRegistered'] === 'boolean'
      ? ((token as Record<string, unknown>)['isRegistered'] as boolean)
      : false;

  if (!backendUser) return null;

  const role = (backendUser['role'] as string | undefined)?.toLowerCase();
  if (role !== 'company') return null;

  const directStatus = backendUser['verified_status'] as string | undefined | null;
  const nestedStatus = (backendUser['company'] as Record<string, unknown> | undefined)?.[
    'verified_status'
  ] as string | undefined | null;

  const rawStatus = directStatus ?? nestedStatus ?? null;
  const normalizedStatus = typeof rawStatus === 'string' ? rawStatus.toLowerCase() : null;

  // Trust isRegistered flag first - if explicitly set, use it
  // Otherwise fall back to checking if company profile data exists
  const hasCompanyProfile = isRegistered
    ? true
    : Boolean(backendUser['name']) ||
      Boolean((backendUser['company'] as Record<string, unknown> | undefined)?.['name']);

  if (!hasCompanyProfile) {
    return '/company-register';
  }

  if (!normalizedStatus || normalizedStatus === 'pending' || normalizedStatus === 'unverified') {
    return '/unverify';
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  const method = request.method.toUpperCase();

  if (shouldSkip(pathname)) {
    return applySecurityHeaders(
      NextResponse.next({
        request: { headers: requestHeaders },
      }),
      nonce
    );
  }

  if (isApiRequest(pathname)) {
    const fetchMetadataViolation = validateFetchMetadata(request);
    if (fetchMetadataViolation) {
      return applySecurityHeaders(fetchMetadataViolation, nonce);
    }

    if (STATE_CHANGING_METHODS.has(method) || method === 'GET') {
      const rateLimitResponse = enforceRateLimiting(request);
      if (rateLimitResponse) {
        return applySecurityHeaders(rateLimitResponse, nonce);
      }
    }

    return applySecurityHeaders(
      NextResponse.next({
        request: { headers: requestHeaders },
      }),
      nonce
    );
  }

  const normalizedPath = normalizePathname(pathname);
  if (ALLOWED_PATHS.has(normalizedPath)) {
    return applySecurityHeaders(
      NextResponse.next({
        request: { headers: requestHeaders },
      }),
      nonce
    );
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return applySecurityHeaders(
      NextResponse.next({
        request: { headers: requestHeaders },
      }),
      nonce
    );
  }

  const redirectPath = evaluateCompanyAccess(token);
  if (redirectPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectPath;
    redirectUrl.search = '';
    return applySecurityHeaders(NextResponse.redirect(redirectUrl), nonce);
  }

  return applySecurityHeaders(
    NextResponse.next({
      request: { headers: requestHeaders },
    }),
    nonce
  );
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|_next/data|favicon.ico).*)'],
};
