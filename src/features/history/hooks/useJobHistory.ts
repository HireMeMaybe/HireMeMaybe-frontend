'use client';

import { useState, useEffect, useCallback } from 'react';
import { JobApplicationHistory, HistoryFilters } from '@/types/history';

interface UseJobHistoryReturn {
  history: JobApplicationHistory[];
  loading: boolean;
  error: string | null;
  filters: HistoryFilters;
  setFilters: (filters: HistoryFilters) => void;
  refetch: () => Promise<void>;
}

// Mock data for demonstration
const mockHistoryData: JobApplicationHistory[] = [
  {
    id: 1,
    jobTitle: 'Full Stack Developer',
    companyName: 'TechCorp Solutions',
    location: 'Bangkok, Thailand',
    status: 'pending',
    appliedDate: '2024-09-15T08:30:00Z',
    lastUpdated: '2024-09-15T08:30:00Z',
    jobType: 'Hybrid',
    answer: {
      id: 1,
      expected_salary: '50,000 - 70,000 THB',
      experience_level: 'Mid-level',
      tags: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    },
    postId: 1,
  },
  {
    id: 2,
    jobTitle: 'Frontend Developer',
    companyName: 'Digital Agency',
    location: 'Bangkok, Thailand',
    status: 'in consideration',
    appliedDate: '2024-09-12T14:20:00Z',
    lastUpdated: '2024-09-14T09:15:00Z',
    jobType: 'Remote',
    answer: {
      id: 2,
      expected_salary: '45,000 - 60,000 THB',
      experience_level: 'Junior',
      tags: ['React', 'Vue.js', 'CSS', 'HTML'],
    },
    postId: 2,
  },
  {
    id: 3,
    jobTitle: 'Backend Developer',
    companyName: 'StartupTech',
    location: 'Chiang Mai, Thailand',
    status: 'rejected',
    appliedDate: '2024-09-10T11:45:00Z',
    lastUpdated: '2024-09-13T16:30:00Z',
    jobType: 'Onsite',
    answer: {
      id: 3,
      expected_salary: '40,000 - 55,000 THB',
      experience_level: 'Junior',
      tags: ['Python', 'Django', 'PostgreSQL'],
    },
    postId: 3,
  },
  {
    id: 4,
    jobTitle: 'UI/UX Designer',
    companyName: 'Creative Studio',
    location: 'Bangkok, Thailand',
    status: 'pending',
    appliedDate: '2024-09-08T16:00:00Z',
    lastUpdated: '2024-09-08T16:00:00Z',
    jobType: 'Onsite',
    answer: {
      id: 4,
      expected_salary: '30,000 - 40,000 THB',
      experience_level: 'Junior',
      tags: ['Figma', 'Adobe XD', 'Sketch', 'UI Design'],
    },
    postId: 4,
  },
  {
    id: 5,
    jobTitle: 'DevOps Engineer',
    companyName: 'CloudTech',
    location: 'Bangkok, Thailand',
    status: 'in consideration',
    appliedDate: '2024-09-05T10:30:00Z',
    lastUpdated: '2024-09-11T14:20:00Z',
    jobType: 'Hybrid',
    answer: {
      id: 5,
      expected_salary: '60,000 - 80,000 THB',
      experience_level: 'Mid-level',
      tags: ['Docker', 'Kubernetes', 'AWS', 'Python'],
    },
    postId: 5,
  },
  {
    id: 6,
    jobTitle: 'Mobile Developer',
    companyName: 'AppWorks',
    location: 'Bangkok, Thailand',
    status: 'pending',
    appliedDate: '2024-09-03T13:15:00Z',
    lastUpdated: '2024-09-03T13:15:00Z',
    jobType: 'Remote',
    answer: {
      id: 6,
      expected_salary: '50,000 - 65,000 THB',
      experience_level: 'Mid-level',
      tags: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
    },
    postId: 6,
  },
  {
    id: 7,
    jobTitle: 'Data Scientist',
    companyName: 'DataCorp',
    location: 'Bangkok, Thailand',
    status: 'rejected',
    appliedDate: '2024-09-01T09:00:00Z',
    lastUpdated: '2024-09-07T11:45:00Z',
    jobType: 'Onsite',
    answer: {
      id: 7,
      expected_salary: '70,000 - 90,000 THB',
      experience_level: 'Senior',
      tags: ['Python', 'R', 'SQL', 'TensorFlow'],
    },
    postId: 7,
  },
  {
    id: 8,
    jobTitle: 'Product Manager',
    companyName: 'InnovateTech',
    location: 'Bangkok, Thailand',
    status: 'in consideration',
    appliedDate: '2024-08-28T15:30:00Z',
    lastUpdated: '2024-09-09T10:20:00Z',
    jobType: 'Hybrid',
    answer: {
      id: 8,
      experience_level: 'Senior',
      tags: ['Product Strategy', 'Agile', 'Scrum', 'Analytics'],
    },
    postId: 8,
  },
];

export function useJobHistory(): UseJobHistoryReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HistoryFilters>({
    sortBy: 'appliedDate',
    sortOrder: 'desc',
  });

  const fetchHistoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data for testing
      console.log('Using mock data for testing...');

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set mock history data directly
      setTransformedHistory(mockHistoryData);
    } catch (err) {
      console.error('Error with mock data:', err);
      setError('Failed to load mock application history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Always fetch mock data regardless of authentication status for testing
    fetchHistoryData();
  }, [fetchHistoryData]);

  // Transform and filter applications - using mock data directly
  const [transformedHistory, setTransformedHistory] = useState<JobApplicationHistory[]>([]);

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
