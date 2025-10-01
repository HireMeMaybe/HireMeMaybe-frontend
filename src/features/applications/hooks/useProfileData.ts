import { useState, useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import type { Session } from 'next-auth';
import type { ApplicationFormData } from '@/types/application';

interface ProfileData {
  first_name?: string;
  last_name?: string;
  User?: {
    email?: string;
    tel?: string;
  };
  program?: string;
  year?: string;
  soft_skill?: string[];
  resume_id?: string;
}

interface UseProfileDataProps {
  session: Session | null;
  setValue: UseFormSetValue<ApplicationFormData>;
  setSkills: (skills: string[]) => void;
}

interface UseProfileDataReturn {
  isLoading: boolean;
  error: string | null;
  profileData: ProfileData | null;
}

export function useProfileData({
  session,
  setValue,
  setSkills,
}: UseProfileDataProps): UseProfileDataReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.backendToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/cpsk/profile', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data: ProfileData = await response.json();
        setProfileData(data);

        // Populate form with profile data
        if (data.first_name) setValue('name', data.first_name);
        if (data.last_name) setValue('surname', data.last_name);
        if (data.User?.email) setValue('email', data.User.email);
        if (data.User?.tel) setValue('phone', data.User.tel);
        if (data.program) {
          const allowedMajors = ["", "CPE", "SKE"];
          const majorValue = allowedMajors.includes(data.program) ? data.program as "" | "CPE" | "SKE" : "";
          setValue('major', majorValue);
        }
        if (data.year) setValue('educationLevel', data.year);
        if (data.soft_skill && Array.isArray(data.soft_skill)) {
          setSkills(data.soft_skill);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session, setValue, setSkills]);

  return { isLoading, error, profileData };
}