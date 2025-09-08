'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error' | 'done'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function run() {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code found in callback URL');
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
          setStatus('error');
          setMessage('Backend exchange failed');
          console.error('Forward-code response:', payload);
          return;
        }

        const data = payload.data;
        // data should contain access_token and user
        const token = data.access_token || data.accessToken || data.token;
        const backendUser = data.user || null;

        if (!token) {
          setStatus('error');
          setMessage('Backend did not return access token');
          return;
        }

        // Sign into NextAuth using credentials provider; this creates a NextAuth session
        const result = await signIn('credentials', {
          redirect: false,
          token,
          user: JSON.stringify(backendUser),
        });

        if (result?.error) {
          setStatus('error');
          setMessage('Failed to sign in with backend token');
          console.error('Credentials signIn error:', result);
          return;
        }

        setStatus('done');
        // Redirect to registration if needed or home
        if (!backendUser?.program) {
          router.push('/cpsk-register');
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error('Error in auth callback handler:', err);
        setStatus('error');
        setMessage('Unexpected error');
      }
    }

    run();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Authenticating...</h2>
          <p className="mt-2 text-gray-600">Please wait while we finish signing you in.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Authentication Error</h2>
          <p className="mt-2 text-red-600">{message}</p>
        </div>
      </div>
    );
  }

  return <div />;
}
