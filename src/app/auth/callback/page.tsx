'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    function parseRoleFromState(state: string | null): 'Company' | 'CPSK' | 'Visitor' | null {
      if (!state) return null;
      try {
        const stateData = JSON.parse(state);
        return stateData.role;
      } catch (err) {
        console.warn('Could not parse state parameter:', err);
        return null;
      }
    }

    async function exchangeCodeForToken(code: string, selectedRole: string | null) {
      const res = await fetch('/api/auth/forward-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, selectedRole }),
      });

      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error('backend_exchange');
      }

      const data = payload.data;
      const token = data.access_token || data.accessToken || data.token;
      const backendUser = data.user || null;

      if (!token) {
        throw new Error('no_token');
      }

      return { token, backendUser };
    }

    function getRedirectPath(
      isRegistered: boolean,
      selectedRole: string | null,
      backendUser: { id?: string | number; name?: string; verified_status?: string } | null
    ): string {
      // If company is unverified, redirect to unverify page
      if (selectedRole === 'Company' && backendUser) {
        const verifiedStatus = (backendUser as any)?.verified_status;
        const isUnverified = verifiedStatus && String(verifiedStatus).toLowerCase() !== 'verified';
        if (isUnverified) {
          return '/unverify';
        }
      }

      if (isRegistered) {
        return selectedRole === 'Company' || backendUser?.name
          ? `/company/${backendUser?.id ?? ''}`
          : '/profile';
      }
      return selectedRole === 'Company' ? '/company-register' : '/cpsk-register';
    }

    async function run() {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        console.error('Authentication failed:', error);
        router.push('/?error=auth_failed');
        return;
      }

      if (!code) {
        console.error('No authorization code found');
        router.push('/?error=no_code');
        return;
      }

      const selectedRole = parseRoleFromState(state);

      try {
        const { token, backendUser } = await exchangeCodeForToken(code, selectedRole);

        const result = await signIn('credentials', {
          token,
          user: JSON.stringify({ ...backendUser, role: selectedRole || backendUser?.role }),
          redirect: false,
        });

        if (result?.error) {
          console.error('NextAuth sign-in failed:', result.error);
          router.push('/?error=signin_failed');
          return;
        }

        const isRegistered = !!(backendUser?.program || backendUser?.size || backendUser?.name);
        const redirectPath = getRedirectPath(isRegistered, selectedRole, backendUser);
        router.push(redirectPath);
      } catch (err) {
        const errorCode = err instanceof Error ? err.message : 'unexpected';
        console.error('Error in auth callback handler:', err);
        router.push(`/?error=${errorCode}`);
      }
    }

    run();
  }, [searchParams, router]);

  // Always show loading state
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-600 border-t-emerald-500"></div>
          <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-2 border-emerald-500 opacity-20"></div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">Authenticating...</h2>
        <p className="text-gray-400">Please wait while we sign you in</p>
        <div className="mt-4 flex justify-center space-x-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500"></div>
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-emerald-500"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-emerald-500"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
