'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if we're on the login page
    if (pathname === '/admin/login') {
      return;
    }

    // Wait for auth check to complete
    if (isLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-600 border-t-emerald-500"></div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Loading...</h2>
          <p className="text-gray-400">Please wait</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (except on login page)
  if (!isAuthenticated && pathname !== '/admin/login') {
    return null;
  }

  return <>{children}</>;
}