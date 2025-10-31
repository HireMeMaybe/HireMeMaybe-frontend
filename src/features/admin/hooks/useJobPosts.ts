// src/features/admin/hooks/useJobPosts.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '@/lib/services';
import type { JobPostItem } from '@/types/admin';

interface JobPostFilters {
  search?: string;
  type?: string;
  tag?: string;
  salary?: string;
  exp?: string;
  company?: string;
  industry?: string;
  location?: string;
  desc?: boolean;
}

export function useJobPosts(filters?: JobPostFilters) {
  const [jobPosts, setJobPosts] = useState<JobPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AdminService.getAllJobPosts(filters);

      // Transform API response to JobPostItem format
      const transformedData: JobPostItem[] = data.map((post) => ({
        id: post.id,
        title: post.title,
        company: post.company?.name || 'Unknown Company',
        type: post.type as JobPostItem['type'],
        posted: new Date(post.post_time).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        // Report count not provided by API yet, defaulting to 0
        reports: 0,
      }));

      setJobPosts(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job posts');
      console.error('Error fetching job posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const deleteJobPost = useCallback(
    async (jobId: number) => {
      try {
        await AdminService.deleteJobPost(jobId);
        // Refetch to update the list
        await fetchJobPosts();
        return { success: true, message: 'Job post deleted successfully' };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete job post';
        console.error('Error deleting job post:', err);
        return { success: false, message: errorMessage };
      }
    },
    [fetchJobPosts]
  );

  useEffect(() => {
    fetchJobPosts();
  }, [fetchJobPosts]);

  return {
    jobPosts,
    isLoading,
    error,
    refetch: fetchJobPosts,
    deleteJobPost,
  } as const;
}
