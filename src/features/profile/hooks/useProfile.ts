'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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

  const fetchProfileData = async () => {
    if (status !== 'authenticated' || !session?.backendToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/cpsk/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== 'loading') {
      fetchProfileData();
    }
  }, [status, session]);

  return {
    profileData,
    loading,
    error,
    refetch: fetchProfileData,
  };
}
