'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage(`Authentication failed: ${error}`);
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_ERROR',
            error: error,
          },
          window.location.origin
        );
        window.close();
      }
      return;
    }

    if (code) {
      setStatus('success');
      setMessage('Authorization code received successfully!');
      console.log('Authorization code:', code);

      // Send authorization code to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_SUCCESS',
            code: code,
          },
          window.location.origin
        );
        window.close();
      } else {
        // Fallback for direct navigation (not popup)
        sessionStorage.setItem('google_authorization_code', code);
        setTimeout(() => {
          window.location.href = '/cpsk-register';
        }, 2000);
      }
    } else {
      setStatus('error');
      setMessage('No authorization code received');
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_ERROR',
            error: 'No authorization code received',
          },
          window.location.origin
        );
        window.close();
      }
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-lg bg-white p-8 shadow-md">
        {status === 'loading' && (
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Processing authentication...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mb-4 text-4xl text-green-600">✓</div>
            <h1 className="mb-2 text-xl font-semibold text-gray-900">Authentication Successful</h1>
            <p className="text-gray-600">{message}</p>
            <p className="mt-2 text-sm text-gray-500">This window will close automatically...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-4 text-4xl text-red-600">✗</div>
            <h1 className="mb-2 text-xl font-semibold text-gray-900">Authentication Failed</h1>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => {
                if (window.opener) {
                  window.close();
                } else {
                  window.location.href = '/';
                }
              }}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {window.opener ? 'Close' : 'Return to Home'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
