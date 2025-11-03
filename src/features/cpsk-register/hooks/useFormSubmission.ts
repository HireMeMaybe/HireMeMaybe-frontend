import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CpskService } from '@/lib/services';
import type { Session } from 'next-auth';
import type { SessionContextValue } from 'next-auth/react';
import type { ProfileData } from '@/types/cpsk';

interface UseFormSubmissionProps {
  session?: Session | null;
  updateSession?: SessionContextValue['update'];
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

export function useFormSubmission({ session, updateSession }: UseFormSubmissionProps): UseFormSubmissionReturn {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);
  const router = useRouter();

  const syncSessionWithProfile = async (
    profile: ProfileData,
    formData: FormData
  ): Promise<void> => {
    if (!updateSession) return;

    const existingBackendUser = session?.backendUser ?? {};
    const normalizedSoftSkills = Array.isArray(profile.soft_skill)
      ? profile.soft_skill
      : Array.isArray(formData.soft_skill)
        ? formData.soft_skill
        : formData.soft_skill
          ? [formData.soft_skill]
          : existingBackendUser.soft_skill ?? [];

    const telFromProfile = profile.User?.tel ?? existingBackendUser.User?.tel ?? formData.phone;

    try {
      await updateSession({
        backendUser: {
          ...existingBackendUser,
          first_name: profile.first_name ?? formData.first_name ?? existingBackendUser.first_name,
          last_name: profile.last_name ?? formData.last_name ?? existingBackendUser.last_name,
          program: profile.program ?? formData.program ?? existingBackendUser.program,
          year: profile.year ?? formData.year ?? existingBackendUser.year,
          soft_skill: normalizedSoftSkills,
          resume_id: profile.resume_id ?? existingBackendUser.resume_id ?? null,
          User: {
            ...(existingBackendUser.User ?? {}),
            ...(profile.User ?? {}),
            tel: telFromProfile,
          },
        },
        isRegistered: true,
      });
    } catch (error) {
      console.error('Failed to sync session after CPSK profile update:', error);
    }
  };

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

        // Update profile using service and capture the latest profile details
        const updatedProfile = await CpskService.updateProfile(profileData);
        let latestProfile: ProfileData = updatedProfile;

        // Upload resume if provided
        if (data.resume) {
          try {
            await CpskService.uploadResume(data.resume);
            const refreshedProfile = await CpskService.getProfile();
            latestProfile = refreshedProfile ?? updatedProfile;
          } catch (error) {
            console.warn('Resume upload failed:', error);
            await syncSessionWithProfile(updatedProfile, data);
            setStatus({
              ok: true,
              message:
                'Profile saved successfully, but resume upload failed. You can try uploading it again later.',
            });
            return;
          }
        }

        await syncSessionWithProfile(latestProfile, data);

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
