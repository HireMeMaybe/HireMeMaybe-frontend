'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    async function run() {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

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

      try {
        // Forward the code to our server route which forwards to the backend
        const res = await fetch('/api/auth/forward-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const payload = await res.json();
        if (!res.ok || !payload?.success) {
          console.error('Backend exchange failed:', payload);
          router.push('/?error=backend_exchange');
          return;
        }

        const data = payload.data;
        // data should contain access_token and user
        const token = data.access_token || data.accessToken || data.token;
        const backendUser = data.user || null;

        if (!token) {
          console.error('Backend did not return access token');
          router.push('/?error=no_token');
          return;
        }

        // Sign into NextAuth using credentials provider; this creates a NextAuth session
        const result = await signIn('credentials', {
          redirect: false,
          token,
          user: JSON.stringify(backendUser),
        });

        if (result?.error) {
          console.error('Credentials signIn error:', result);
          router.push('/?error=signin_failed');
          return;
        }

        // Redirect to registration if needed or home
        if (!backendUser?.program) {
          router.push('/cpsk-register');
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error('Error in auth callback handler:', err);
        router.push('/?error=unexpected');
      }
    }

    run();
  }, [searchParams, router]);

  // Always show loading state
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
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
