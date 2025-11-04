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
      const [data, allReports] = await Promise.all([
        AdminService.getAllJobPosts(filters),
        AdminService.getReports(), // Fetch all reports to count them
      ]);

      // Count reports per job post
      const reportCounts = new Map<number, number>();
      for (const report of allReports) {
        // Check both 'reported' and 'reported_id' fields
        const reportedJobId = (report as { reported?: string }).reported || report.reported_id;

        if (report.type === 'post' && reportedJobId) {
          const jobId =
            typeof reportedJobId === 'string' ? Number.parseInt(reportedJobId, 10) : reportedJobId;

          reportCounts.set(jobId, (reportCounts.get(jobId) || 0) + 1);
        }
      }

      // Transform API response to JobPostItem format and fetch company names
      const transformedData: JobPostItem[] = await Promise.all(
        data.map(async (post) => {
          let companyName = 'Unknown Company';

          // Fetch company name if company_id exists
          if (post.company_id) {
            try {
              companyName = await AdminService.getUserName(post.company_id, 'company');
            } catch (err) {
              console.error(`Failed to fetch company name for ${post.company_id}:`, err);
              companyName = post.company_id; // Fall back to ID
            }
          }

          return {
            id: post.id,
            title: post.title,
            company: companyName,
            type: post.type as JobPostItem['type'],
            posted: new Date(post.post_time).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            reports: reportCounts.get(post.id) || 0, // Get actual report count
          };
        })
      );

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
