'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-gray-300">
            We encountered an unexpected error. This might be a temporary issue.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="text-left">
              <details className="rounded-lg bg-gray-700 p-3">
                <summary className="cursor-pointer text-sm font-medium text-gray-200">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs break-all whitespace-pre-wrap text-red-300">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={reset}
              className="w-full bg-[#02bc77] text-white hover:bg-[#029e64]"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button
              onClick={() => (window.location.href = '/')}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              size="lg"
            >
              Go Home
            </Button>
          </div>

          <p className="text-sm text-gray-400">If this problem persists, please contact support.</p>
        </CardContent>
      </Card>
    </div>
  );
}
