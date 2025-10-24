import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';

const ALLOWED_PATHS = new Set(['/', '/unverify', '/company-register']);
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

  const redirectPath = evaluateCompanyAccess(token);
  if (redirectPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectPath;
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|_next/data|favicon.ico).*)'],
};
