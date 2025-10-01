import { useState, useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import type { Session } from 'next-auth';
import type { ApplicationFormData } from '@/types/application';

interface ProfileData {
  id?: string;
  first_name?: string;
  last_name?: string;
  User?: {
    ID?: number;
    CreatedAt?: string;
    UpdatedAt?: string;
    DeletedAt?: string | null;
    tel?: string;
    email?: string;
    id?: string;
    username?: string;
  };
  program?: string | null;
  year?: string | null;
  soft_skill?: string[];
  resume_id?: number;
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
          headers: {
            'Authorization': `Bearer ${session.backendToken}`,
            'Content-Type': 'application/json',
          },
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
        
        // Handle program/major - note that it can be null
        if (data.program) {
          const allowedMajors = ['', 'CPE', 'SKE'];
          const majorValue = allowedMajors.includes(data.program)
            ? (data.program as '' | 'CPE' | 'SKE')
            : '';
          setValue('major', majorValue);
        }
        
        // Handle year/education level - note that it can be null
        if (data.year) {
          setValue('educationLevel', data.year);
        }

        // Handle soft skills
        if (data.soft_skill && Array.isArray(data.soft_skill) && data.soft_skill.length > 0) {
          setSkills(data.soft_skill);
          setValue('soft_skill', data.soft_skill);
        }

        // Handle resume - fetch the actual file if resume_id exists
        if (data.resume_id) {
          try {
            const resumeResponse = await fetch(`/api/file/resume/${data.resume_id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${session.backendToken}`,
              },
            });

            if (resumeResponse.ok) {
              const resumeBlob = await resumeResponse.blob();
              // Try to get a meaningful filename, fallback to a default
              const resumeFile = new File([resumeBlob], `resume_${data.resume_id}.pdf`, {
                type: 'application/pdf',
              });
              setValue('resume', resumeFile);
            } else {
              console.warn('Failed to fetch resume:', resumeResponse.status, resumeResponse.statusText);
            }
          } catch (resumeError) {
            console.warn('Failed to fetch resume file:', resumeError);
          }
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