'use client';

import { useState, useEffect, useCallback } from 'react';
import { JobApplicationHistory, HistoryFilters } from '@/types/history';
import { CpskService } from '@/lib/services/cpsk.service';
import { JobService } from '@/lib/services/job.service';
import { CompanyService } from '@/lib/services/company.service';

interface UseJobHistoryReturn {
  history: JobApplicationHistory[];
  loading: boolean;
  error: string | null;
  filters: HistoryFilters;
  setFilters: (filters: HistoryFilters) => void;
  refetch: () => Promise<void>;
}

export function useJobHistory(): UseJobHistoryReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transformedHistory, setTransformedHistory] = useState<JobApplicationHistory[]>([]);
  const [filters, setFilters] = useState<HistoryFilters>({
    sortBy: 'appliedDate',
    sortOrder: 'desc',
  });

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      transformedHistory.forEach((item) => {
        if (item.companyLogo) {
          URL.revokeObjectURL(item.companyLogo);
        }
      });
    };
  }, [transformedHistory]);

  const fetchHistoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching CPSK profile to get application history...');

      // Fetch CPSK profile which contains applications array
      const profile = await CpskService.getProfile();

      console.log('Profile data:', profile);
      console.log('Applications:', profile.applications);

      // Transform applications from profile into JobApplicationHistory format
      const applications = profile.applications || [];

      // Fetch job post details for each application in parallel
      const historyItems: JobApplicationHistory[] = await Promise.all(
        applications.map(async (app) => {
          // Normalize status to match expected types
          const normalizedStatus = (app.status || 'pending').toLowerCase();
          const status: 'pending' | 'in consideration' | 'rejected' =
            normalizedStatus === 'rejected'
              ? 'rejected'
              : normalizedStatus === 'in consideration' || normalizedStatus === 'in_consideration'
                ? 'in consideration'
                : 'pending';

          // Fetch job post details
          let jobTitle = `Job Post #${app.post_id}`;
          let companyName = 'Company';
          let location = 'Location';
          let companyLogo: string | undefined = undefined;
          let jobType:
            | 'Full-time'
            | 'Part-time'
            | 'Internship'
            | 'Contract'
            | 'Onsite'
            | 'Hybrid'
            | 'Remote'
            | undefined = undefined;

          try {
            const jobPost = await JobService.getJobPostById(app.post_id.toString());
            console.log(`Fetched job post ${app.post_id}:`, jobPost);

            // Extract job details from the response
            if (jobPost) {
              jobTitle = jobPost.title || jobTitle;
              companyName = jobPost.company_user?.name || companyName;
              location = jobPost.location || location;

              // Fetch company logo if available
              const logoId = jobPost.company_user?.logo_id;
              if (logoId) {
                try {
                  const logoBlob = await CompanyService.fetchLogo(logoId);
                  companyLogo = URL.createObjectURL(logoBlob);
                  console.log(`Fetched logo for company ${companyName}:`, companyLogo);
                } catch (logoErr) {
                  console.warn(`Failed to fetch logo for company ${companyName}:`, logoErr);
                }
              }

              // Map job type from backend to expected format
              const typeMapping: Record<
                string,
                | 'Full-time'
                | 'Part-time'
                | 'Internship'
                | 'Contract'
                | 'Onsite'
                | 'Hybrid'
                | 'Remote'
              > = {
                'full-time': 'Full-time',
                fulltime: 'Full-time',
                'part-time': 'Part-time',
                parttime: 'Part-time',
                internship: 'Internship',
                contract: 'Contract',
                onsite: 'Onsite',
                hybrid: 'Hybrid',
                remote: 'Remote',
              };

              if (jobPost.type) {
                const normalizedType = jobPost.type.toLowerCase().replace(/\s+/g, '');
                jobType = typeMapping[normalizedType];
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch job post ${app.post_id}:`, err);
            // Continue with placeholder data if job post fetch fails
          }

          return {
            id: app.id,
            jobTitle,
            companyName,
            location,
            companyLogo,
            status,
            appliedDate: app.applied_at,
            lastUpdated: app.applied_at,
            jobType,
            answer: {
              id: app.answer.id,
              expected_salary: app.answer.expected_salary,
              experience_level: `${app.answer.year_of_experience} years`,
              tags: app.answer.programming_languages || [],
            },
            postId: app.post_id,
          };
        })
      );

      console.log('Transformed history items with job details:', historyItems);
      setTransformedHistory(historyItems);
    } catch (err) {
      console.error('Error fetching application history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load application history');
      // Set empty array on error
      setTransformedHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  // Helper function to normalize values for comparison
  const normalizeValue = (value: unknown, sortBy: string): unknown => {
    if (typeof value !== 'string') return value;

    const isDateField = sortBy === 'appliedDate' || sortBy === 'lastUpdated';
    return isDateField ? new Date(value).getTime() : value.toLowerCase();
  };

  // Helper function to compare two values of the same type
  const compareValues = (x: unknown, y: unknown): number => {
    if (x === y) return 0;

    if (typeof x === 'number' && typeof y === 'number') {
      return x > y ? 1 : -1;
    }

    if (typeof x === 'string' && typeof y === 'string') {
      return x > y ? 1 : -1;
    }

    if (x instanceof Date && y instanceof Date) {
      return x.getTime() > y.getTime() ? 1 : -1;
    }

    return 0;
  };

  // Helper function to apply sort order
  const applySortOrder = (comparison: number, order: 'asc' | 'desc'): number => {
    if (comparison === 0) return 0;
    return order === 'desc' ? -comparison : comparison;
  };

  const filteredAndSortedHistory = transformedHistory
    .filter((item) => {
      if (filters.status && filters.status.length > 0) {
        return filters.status.includes(item.status);
      }
      return true;
    })
    .sort((a, b) => {
      const sortBy = filters.sortBy || 'appliedDate';
      const sortOrder = filters.sortOrder || 'desc';

      const aValue = normalizeValue(a[sortBy as keyof JobApplicationHistory], sortBy);
      const bValue = normalizeValue(b[sortBy as keyof JobApplicationHistory], sortBy);

      const comparison = compareValues(aValue, bValue);
      return applySortOrder(comparison, sortOrder);
    });

  return {
    history: filteredAndSortedHistory,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchHistoryData,
  };
}
