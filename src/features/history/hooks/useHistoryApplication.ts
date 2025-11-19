'use client';

import { useCallback, useEffect, useState } from 'react';
import { CpskService } from '@/lib/services/cpsk.service';
import { JobService, type JobPostDetail } from '@/lib/services/job.service';
import type { ProfileData } from '@/types/cpsk';

type ProfileApplication = NonNullable<ProfileData['applications']>[number];

interface HistoryApplicationPayload {
  profile: ProfileData;
  application: ProfileApplication;
  job: JobPostDetail | null;
}

interface UseHistoryApplicationReturn {
  data: HistoryApplicationPayload | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHistoryApplication(applicationId: string | number): UseHistoryApplicationReturn {
  const [data, setData] = useState<HistoryApplicationPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizedId = String(applicationId);

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const profile = await CpskService.getProfile();
      const applications = profile.applications || [];
      const application = applications.find((app) => String(app.id) === normalizedId);

      if (!application) {
        throw new Error('Application not found');
      }

      let job: JobPostDetail | null = null;
      try {
        job = await JobService.getJobPostById(String(application.post_id));
      } catch (jobError) {
        console.error(`Failed to fetch job post ${application.post_id}:`, jobError);
      }

      setData({
        profile,
        application,
        job,
      });
    } catch (err) {
      console.error('Failed to load history application:', err);
      setError(err instanceof Error ? err.message : 'Failed to load application');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [normalizedId]);

  useEffect(() => {
    void fetchApplication();
  }, [fetchApplication]);

  return {
    data,
    loading,
    error,
    refetch: fetchApplication,
  };
}
