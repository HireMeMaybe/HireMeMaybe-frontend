import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CpskService } from '@/lib/services';
import type { Session } from 'next-auth';
import { useSession } from 'next-auth/react';

interface UseFormSubmissionProps {
  session?: Session | null;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  program: string;
  year: string;
  soft_skill?: string | string[];
  resume?: File;
}

interface UseFormSubmissionReturn {
  isPending: boolean;
  status: null | { ok: boolean; message: string };
  submitForm: (data: FormData) => Promise<void>;
}

export function useFormSubmission({ session }: UseFormSubmissionProps): UseFormSubmissionReturn {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);
  const router = useRouter();
  const { update } = useSession();

  const submitForm = async (data: FormData) => {
    startTransition(async () => {
      setStatus(null);
      try {
        // Check if user is authenticated
        if (!session?.backendToken) {
          router.push('/');
          return;
        }

        // Prepare profile data
        const profileData = {
          first_name: data.first_name,
          last_name: data.last_name,
          tel: data.phone,
          soft_skill: Array.isArray(data.soft_skill)
            ? data.soft_skill
            : data.soft_skill
              ? [data.soft_skill]
              : [],
          program: data.program,
          year: data.year,
        };

        // Update profile using service
        await CpskService.updateProfile(profileData);

        // Upload resume if provided
        if (data.resume) {
          try {
            await CpskService.uploadResume(data.resume);
          } catch (error) {
            console.warn('Resume upload failed:', error);
            setStatus({
              ok: true,
              message:
                'Profile saved successfully, but resume upload failed. You can try uploading it again later.',
            });
            // Update session even if resume upload fails
            await update({
              backendUser: {
                ...session.backendUser,
                ...profileData,
              },
              isRegistered: true,
            });
            return;
          }
        }

        // Update the session with new user data
        await update({
          backendUser: {
            ...session.backendUser,
            ...profileData,
          },
          isRegistered: true,
        });

        // Both profile and resume (if provided) were successful
        setStatus({ ok: true, message: 'Registration completed successfully!' });
      } catch (error) {
        console.error('Registration error:', error);

        if (error instanceof Error) {
          setStatus({ ok: false, message: error.message });
        } else {
          setStatus({ ok: false, message: 'Registration failed' });
        }
      }
    });
  };

  return {
    isPending,
    status,
    submitForm,
  };
}
