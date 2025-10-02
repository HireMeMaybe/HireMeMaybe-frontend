'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CpskService } from '@/lib/services';
import type { ProfileData } from '@/types/cpsk';

interface UseProfileReturn {
  profileData: ProfileData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    if (status !== 'authenticated' || !session?.backendToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await CpskService.getProfile();
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [status, session?.backendToken]);

  useEffect(() => {
    if (status !== 'loading') {
      fetchProfileData();
    }
  }, [status, fetchProfileData]);

  return {
    profileData,
    loading,
    error,
    refetch: fetchProfileData,
  };
}
