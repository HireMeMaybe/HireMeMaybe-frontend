'use client';

import { CPSKRegisterForm } from '@/features/cpsk-register';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '@/app/loading';

export default function CPSKRegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Handle authentication redirect
  useEffect(() => {
    if (status === 'loading') return; // Still loading, don't redirect yet

    if (status === 'unauthenticated' || !session?.backendToken) {
      router.push('/');
      return;
    }

    if (session?.backendUser?.program) {
      router.push('/profile');
    }
  }, [status, session, router]);

  // Show loading while session is being determined
  if (status === 'loading') {
    return <Loading />;
  }

  // Don't render if unauthenticated or already registered
  if (status === 'unauthenticated' || !session?.backendToken || session?.backendUser?.program) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-start justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        <h1 className="text-foreground mb-8 ml-4 text-4xl font-bold">CPSK Register</h1>
        <div className="bg-transparent p-4">
          <CPSKRegisterForm session={session} />
        </div>
      </div>
    </main>
  );
}
