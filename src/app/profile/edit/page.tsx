'use client';

import { CPSKRegisterForm } from '@/features/cpsk-register';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProfile } from '@/features/profile/hooks/useProfile';
import Loading from '@/app/loading';

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const { profileData, loading, error } = useProfile();
  const router = useRouter();

  // Handle authentication redirect
  useEffect(() => {
    if (status === 'loading') return; // Still loading, don't redirect yet

    if (status === 'unauthenticated' || !session?.backendToken || !session?.backendUser?.program) {
      router.push('/');
    }
  }, [status, session, router]);

  // Show loading while session is being determined
  if (status === 'loading') {
    return <Loading />;
  }

  // Don't render if unauthenticated (redirect will happen via useEffect)
  if (status === 'unauthenticated' || !session?.backendToken || !session?.backendUser?.program) {
    return null;
  }

  // Show loading while profile data is being fetched
  if (loading) {
    return <Loading />;
  }

  // Handle profile data loading errors
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-500">Error Loading Profile</h1>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-start justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        <h1 className="text-foreground mb-8 ml-4 text-4xl font-bold">Edit Profile</h1>
        <div className="bg-transparent p-4">
          <CPSKRegisterForm
            session={session}
            profileData={profileData}
            redirectTo="/profile"
            immediateRedirect
          />
        </div>
      </div>
    </main>
  );
}
