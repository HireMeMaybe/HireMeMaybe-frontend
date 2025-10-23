'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const UnverifyPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  type MaybeCompanyUser = {
    role?: string | null;
    verified_status?: string | null;
    company?: { verified_status?: string | null } | null;
    id?: string | number;
  };

  const backendUser = session?.backendUser as MaybeCompanyUser | undefined;
  const isCompany = backendUser?.role === 'Company';
  const verifiedStatus =
    backendUser?.company?.verified_status ?? backendUser?.verified_status ?? null;
  // Consider company unverified if: it's a company AND (no status OR status is not "Verified")
  const isUnverified =
    isCompany && (!verifiedStatus || String(verifiedStatus).toLowerCase() !== 'verified');

  useEffect(() => {
    // Only redirect if we have a session and the user is definitely NOT an unverified company
    // (i.e., they're verified or not a company at all)
    if (status === 'authenticated' && isCompany && !isUnverified) {
      // Company is verified, redirect to their profile
      router.push(`/company/${backendUser?.id ?? ''}`);
    } else if (status === 'authenticated' && !isCompany) {
      // Not a company user, redirect to home
      router.push('/');
    }
    // If unauthenticated, let the middleware handle it
  }, [status, isUnverified, isCompany, router, backendUser?.id]);

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="bg-very-dark-gray mx-auto max-w-2xl rounded-lg p-8 text-white shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Company Not Verified</h1>
        <p className="mb-6 text-gray-300">
          Your company account is not yet verified. Verification is required before certain features
          (posting jobs, accessing applications) are enabled.
        </p>

        <div className="mb-6">
          <p className="text-gray-300">
            Please wait for an administrator to reconsider your registration information. In the
            meantime you won&apos;t be able to access certain company features until your account is
            verified.
          </p>
          <div className="mt-4 flex gap-3">
            <Button
              onClick={() => signOut({ callbackUrl: '/' })}
              variant="outline"
              className="cursor-pointer hover:bg-white hover:text-black"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnverifyPage;
