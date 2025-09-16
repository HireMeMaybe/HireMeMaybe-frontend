import { useEffect, useCallback } from 'react';
import { UseFormSetValue, Path, PathValue } from 'react-hook-form';
import type { Session } from 'next-auth';
import type { ProfileData } from '@/types/cpsk';

// Concrete form values so setValue('key', value) accepts the literal keys we use
interface FormValues {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  program?: string;
  year?: string;
  soft_skill?: string | string[];
  resume?: File | undefined;
  [key: string]: unknown;
}

// Backend user shape (partial) coming from our API/session
interface BackendUser {
  first_name?: string;
  last_name?: string;
  User?: { email?: string; tel?: string };
  program?: string;
  year?: number | string;
  soft_skill?: string[];
}

// Basic user shape from NextAuth session.user
interface BasicUser {
  name?: string;
  email?: string;
}

interface UseFormPopulationProps<T extends FormValues = FormValues> {
  setValue: UseFormSetValue<T>;
  session?: Session | null;
  initialProfile?: ProfileData | null;
  setSkills: (skills: string[]) => void;
}

export function useFormPopulation<T extends FormValues = FormValues>({
  setValue,
  session,
  initialProfile,
  setSkills,
}: UseFormPopulationProps<T>) {
  // Helper functions to reduce cognitive complexity
  const populateFromBackendUser = useCallback(
    (authData: BackendUser | ProfileData) => {
      if (authData.first_name)
        setValue('first_name' as Path<T>, authData.first_name as unknown as PathValue<T, Path<T>>);
      if (authData.last_name)
        setValue('last_name' as Path<T>, authData.last_name as unknown as PathValue<T, Path<T>>);
      if (authData.User?.email || session?.user?.email) {
        setValue(
          'email' as Path<T>,
          (authData.User?.email || session?.user?.email || '') as unknown as PathValue<T, Path<T>>
        );
      }
      if (authData.User?.tel)
        setValue('phone' as Path<T>, authData.User.tel as unknown as PathValue<T, Path<T>>);
      if (authData.program)
        setValue('program' as Path<T>, authData.program as unknown as PathValue<T, Path<T>>);
      if ('year' in authData && authData.year != null) {
        // authData may be BackendUser or ProfileData; convert to string safely
        const yearVal = (authData as BackendUser).year ?? (authData as ProfileData).year;
        if (yearVal != null)
          setValue('year' as Path<T>, String(yearVal) as unknown as PathValue<T, Path<T>>);
      }

      if ('soft_skill' in authData) {
        const skills = (authData as BackendUser).soft_skill ?? (authData as ProfileData).soft_skill;
        if (Array.isArray(skills)) setSkills(skills as string[]);
      }
    },
    [setValue, setSkills, session]
  );

  const populateFromBasicUser = useCallback(
    (user: BasicUser) => {
      if (user.name) {
        const nameParts = user.name.split(' ');
        setValue('first_name' as Path<T>, (nameParts[0] || '') as unknown as PathValue<T, Path<T>>);
        setValue(
          'last_name' as Path<T>,
          (nameParts.slice(1).join(' ') || '') as unknown as PathValue<T, Path<T>>
        );
      }
      if (user.email) setValue('email' as Path<T>, user.email as unknown as PathValue<T, Path<T>>);
    },
    [setValue]
  );

  // Type guard for app-extended session
  function hasBackendUser(obj: unknown): obj is { backendUser?: BackendUser } {
    return typeof obj === 'object' && obj !== null && 'backendUser' in obj;
  }

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

    if (session && hasBackendUser(session) && session.backendUser) {
      try {
        const backendUser = session.backendUser as BackendUser;
        console.log('Pre-populating form with NextAuth session data:', backendUser);
        populateFromBackendUser(backendUser);
      } catch (error) {
        console.error('Error processing NextAuth session data:', error);
      }
    } else if (session?.user) {
      console.log('Pre-populating form with basic NextAuth user data:', session.user);
      populateFromBasicUser(session.user as BasicUser);
    }
    // include helpers in deps
  }, [
    setValue,
    session,
    initialProfile,
    setSkills,
    populateFromBackendUser,
    populateFromBasicUser,
  ]);
}
