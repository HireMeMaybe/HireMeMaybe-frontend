'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SearchPage from '@/features/search';
import Loading from '@/app/loading';

// Extend the Session type to include isRegistered
declare module 'next-auth' {
  interface Session {
    isRegistered?: boolean;
  }
}

export default function SearchRoutePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // If user is not authenticated, redirect to home
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    // If authenticated but not registered, redirect to home
    const isRegistered = session?.isRegistered;
    if (status === 'authenticated' && isRegistered === false) {
      router.push('/');
    }
  }, [status, session, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return <Loading />;
  }

  // Don't render the page if not authenticated or not registered
  if (status === 'unauthenticated' || session?.isRegistered === false) {
    return null;
  }

  return <SearchPage />;
}
