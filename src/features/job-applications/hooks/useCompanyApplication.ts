'use client';

import { useCallback, useEffect, useState } from 'react';
import { CompanyService, type CompanyProfileResponse } from '@/lib/services/company.service';

type JobPostEntry = NonNullable<CompanyProfileResponse['job_post']>[number];
type CompanyApplicationEntry = NonNullable<JobPostEntry['applications']>[number];

interface CompanyApplicationData {
  company: CompanyProfileResponse;
  job: JobPostEntry;
  application: CompanyApplicationEntry;
}

interface UseCompanyApplicationReturn {
  data: CompanyApplicationData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCompanyApplication(applicationId: string | number): UseCompanyApplicationReturn {
  const [data, setData] = useState<CompanyApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const normalizedId = String(applicationId);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const profile = await CompanyService.getMyProfile();
      const jobPosts = profile.job_post || [];
      let targetJob: JobPostEntry | null = null;
      let targetApplication: CompanyApplicationEntry | null = null;

      for (const job of jobPosts) {
        if (!job.applications) continue;
        const found = job.applications.find((app) => String(app.id) === normalizedId);
        if (found) {
          targetJob = job;
          targetApplication = found;
          break;
        }
      }

      if (!targetJob || !targetApplication) {
        throw new Error('Application not found');
      }

      setData({
        company: profile,
        job: targetJob,
        application: targetApplication,
      });
    } catch (err) {
      console.error('Failed to load company application:', err);
      setError(err instanceof Error ? err.message : 'Failed to load application');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [normalizedId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
