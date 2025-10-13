// src/features/admin/hooks/useJobPosts.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '@/lib/services';
import type { JobPostItem } from '@/types/admin';

export function useJobPosts() {
  const [jobPosts, setJobPosts] = useState<JobPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AdminService.getAllJobPosts();
      setJobPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job posts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobPosts();
  }, [fetchJobPosts]);

  return {
    jobPosts,
    isLoading,
    error,
    refetch: fetchJobPosts,
  } as const;
}