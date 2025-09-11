'use client';

import { CPSKRegisterForm } from '@/features/cpsk-register';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'unauthenticated' || !session?.backendToken || !session?.backendUser?.program) {
    router.push('/');
    return null;
  }

  return (
    <main className="flex min-h-screen items-start justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        <h1 className="text-foreground mb-8 ml-4 text-4xl font-bold">Edit Profile</h1>
        <div className="bg-transparent p-4">
          <CPSKRegisterForm session={session} />
        </div>
      </div>
    </main>
  );
}
