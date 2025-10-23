import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';

const ALLOWED_PATHS = new Set(['/', '/unverify']);
const SKIP_PREFIXES = ['/_next', '/favicon', '/assets', '/images', '/static', '/public'];

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

function isUnverifiedCompany(token: JWT): boolean {
  const backendUser = (token as Record<string, unknown>)['backendUser'] as
    | Record<string, unknown>
    | undefined;

  if (!backendUser) return false;

  const role = (backendUser['role'] as string | undefined)?.toLowerCase();
  if (role !== 'company') return false;

  const directStatus = backendUser['verified_status'] as string | undefined | null;
  const nestedStatus = (backendUser['company'] as Record<string, unknown> | undefined)?.[
    'verified_status'
  ] as string | undefined | null;

  const status = directStatus ?? nestedStatus ?? null;
  if (!status) return true;

  return status.toLowerCase() !== 'verified';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkip(pathname)) {
    return NextResponse.next();
  }

  const normalizedPath = normalizePathname(pathname);
  if (ALLOWED_PATHS.has(normalizedPath)) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.next();
  }

  if (isUnverifiedCompany(token)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/unverify';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|_next/data|favicon.ico).*)'],
};
