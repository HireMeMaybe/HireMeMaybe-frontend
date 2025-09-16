import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';

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

  const submitForm = async (data: FormData) => {
    startTransition(async () => {
      setStatus(null);
      try {
        // Check if user is authenticated
        if (!session?.backendToken) {
          router.push('/');
          return;
        }

        // Step 1: Submit profile data (PUT /api/cpsk/profile)
        const profileData = {
          first_name: data.first_name,
          last_name: data.last_name,
          User: {
            tel: data.phone,
          },
          soft_skill: Array.isArray(data.soft_skill)
            ? data.soft_skill
            : data.soft_skill
              ? [data.soft_skill]
              : [],
          program: data.program,
          year: data.year,
        };

        const profileRes = await fetch('/api/cpsk/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        });

        if (!profileRes.ok) {
          const profileJson = await profileRes.json();
          throw new Error(profileJson.error || `Profile submission failed (${profileRes.status})`);
        }

        // Step 2: Upload resume if provided (POST /api/cpsk/profile/resume)
        if (data.resume) {
          const resumeFormData = new FormData();
          resumeFormData.append('resume', data.resume);

          const resumeRes = await fetch('/api/cpsk/profile/resume', {
            method: 'POST',
            body: resumeFormData,
          });

          if (!resumeRes.ok) {
            const resumeJson = await resumeRes.json();
            console.warn('Resume upload failed:', resumeJson.error);
            setStatus({
              ok: true,
              message:
                'Profile saved successfully, but resume upload failed. You can try uploading it again later.',
            });
            return;
          }
        }

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
