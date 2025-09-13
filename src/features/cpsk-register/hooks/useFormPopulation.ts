import { useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import type { Session } from 'next-auth';
import type { ProfileData } from '@/types/cpsk';

interface UseFormPopulationProps {
  setValue: UseFormSetValue<any>;
  session?: Session | null;
  initialProfile?: ProfileData | null;
  setSkills: (skills: string[]) => void;
}

export function useFormPopulation({
  setValue,
  session,
  initialProfile,
  setSkills,
}: UseFormPopulationProps) {
  // Helper functions to reduce cognitive complexity
  const populateFromBackendUser = (authData: any) => {
    if (authData.first_name) setValue('first_name', authData.first_name);
    if (authData.last_name) setValue('last_name', authData.last_name);
    if (authData.User?.email || session?.user?.email) {
      setValue('email', authData.User?.email || session?.user?.email || '');
    }
    if (authData.User?.tel) setValue('phone', authData.User.tel);
    if (authData.program) setValue('program', authData.program);
    if (authData.year) setValue('year', authData.year.toString());
    if (authData.soft_skill && Array.isArray(authData.soft_skill)) {
      setSkills(authData.soft_skill as string[]);
    }
  };

  const populateFromBasicUser = (user: any) => {
    if (user.name) {
      const nameParts = user.name.split(' ');
      setValue('first_name', nameParts[0] || '');
      setValue('last_name', nameParts.slice(1).join(' ') || '');
    }
    if (user.email) setValue('email', user.email);
  };

  // Prefill: prefer explicit profileData (from backend), then fall back to session
  useEffect(() => {
    if (initialProfile) {
      try {
        // explicit backend profile (authoritative) - used for edit flows
        populateFromBackendUser(initialProfile);
      } catch (err) {
        console.error('Error populating from provided profileData:', err);
      }
      return;
    }

    if (session?.backendUser) {
      try {
        console.log('Pre-populating form with NextAuth session data:', session.backendUser);
        populateFromBackendUser(session.backendUser);
      } catch (error) {
        console.error('Error processing NextAuth session data:', error);
      }
    } else if (session?.user) {
      console.log('Pre-populating form with basic NextAuth user data:', session.user);
      populateFromBasicUser(session.user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, session, initialProfile]);
}
