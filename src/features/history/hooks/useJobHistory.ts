'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

// Helper function to map year of experience to experience level text
const mapExperienceLevel = (years?: number): string | undefined => {
  if (years === undefined || years === null) return undefined;
  if (years === 0) return 'No experience';
  if (years === 1) return 'Less than 1 year';
  if (years === 3) return '1-2 years';
  if (years === 5) return '3-5 years';
  return '5+ years';
};

export function useJobHistory(): UseJobHistoryReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HistoryFilters>({
    sortBy: 'appliedDate',
    sortOrder: 'desc',
  });
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // Transform and filter applications
  const [transformedHistory, setTransformedHistory] = useState<JobApplicationHistory[]>([]);

  const fetchHistoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get CPSK profile with applications
      const profile = await CpskService.getProfile();

      if (!profile.applications || profile.applications.length === 0) {
        setTransformedHistory([]);
        return;
      }

      // 2. Fetch job posts for all applications in parallel
      const jobPostPromises = profile.applications.map(async (app) => {
        try {
          const jobPost = await JobService.getJobPostById(String(app.post_id));
          return { app, jobPost };
        } catch (err) {
          console.error(`Failed to fetch job post ${app.post_id}:`, err);
          return { app, jobPost: null };
        }
      });

      const jobResults = await Promise.all(jobPostPromises);

      // 3. Get unique company IDs
      const companyIds = new Set<string>();
      jobResults.forEach(({ jobPost }) => {
        if (jobPost?.company_id) {
          companyIds.add(String(jobPost.company_id));
        }
      });

      // 4. Fetch company profiles and logos in parallel
      const companyMap = new Map<string, { name?: string; logoUrl?: string }>();

      const companyPromises = Array.from(companyIds).map(async (companyId) => {
        try {
          const company = await CompanyService.getCompany(companyId);
          let logoUrl: string | undefined;

          if (company.logo_id != null) {
            try {
              const blob = await CompanyService.fetchLogo(company.logo_id);
              logoUrl = URL.createObjectURL(blob);
              blobUrlsRef.current.add(logoUrl);
            } catch (err) {
              console.error(`Failed to fetch logo for company ${companyId}:`, err);
            }
          }

          return {
            companyId,
            name: company.name || company.user?.username,
            logoUrl,
          };
        } catch (err) {
          console.error(`Failed to fetch company ${companyId}:`, err);
          return {
            companyId,
            name: undefined,
            logoUrl: undefined,
          };
        }
      });

      const companies = await Promise.all(companyPromises);
      companies.forEach(({ companyId, name, logoUrl }) => {
        companyMap.set(companyId, { name, logoUrl });
      });

      // 5. Transform to JobApplicationHistory format
      const history = jobResults
        .map(({ app, jobPost }) => {
          if (!jobPost) return null;

          const companyId = String(jobPost.company_id);
          const company = companyMap.get(companyId);

          // Map answer data to the format expected by HistoryCard
          const mappedAnswer = app.answer
            ? {
                id: app.answer.id,
                expected_salary: app.answer.expected_salary,
                experience_level: mapExperienceLevel(app.answer.year_of_experience),
                year_of_experience: app.answer.year_of_experience,
                right_to_work: app.answer.right_to_work,
                programming_languages: app.answer.programming_languages || [],
                tags: app.answer.programming_languages || [],
              }
            : undefined;

          const historyItem: JobApplicationHistory = {
            id: app.id,
            jobTitle: jobPost.title || 'Untitled Position',
            companyName: company?.name || 'Unknown Company',
            location: jobPost.location || 'Unknown Location',
            status: app.status,
            appliedDate: app.applied_at,
            lastUpdated: app.applied_at,
            jobType: jobPost.type as JobApplicationHistory['jobType'],
            companyLogo: company?.logoUrl,
            answer: mappedAnswer,
            postId: app.post_id,
          };

          return historyItem;
        })
        .filter((item): item is JobApplicationHistory => item !== null);

      setTransformedHistory(history);
    } catch (err) {
      console.error('Error fetching application history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load application history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    const currentBlobUrls = blobUrlsRef.current;
    return () => {
      currentBlobUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      currentBlobUrls.clear();
    };
  }, []);

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
