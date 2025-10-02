'use client';

import { useState, useEffect, useCallback } from 'react';
import type { JobPostItem } from '@/types/admin';

const initialMockData: JobPostItem[] = [
  {
    id: 1,
    title: 'Software Engineer Intern',
    company: 'Tech Solutions Co.',
    type: 'Internship',
    posted: '2025-09-30',
    reports: 3,
  },
  {
    id: 2,
    title: 'Data Analyst',
    company: 'Digital Marketing Hub',
    type: 'Full-time',
    posted: '2025-09-25',
    reports: 6,
  },
  {
    id: 3,
    title: 'Software Engineer Intern',
    company: 'Tech Solutions Co.',
    type: 'Internship',
    posted: '2025-09-30',
    reports: 1,
  },
  {
    id: 4,
    title: 'Data Analyst',
    company: 'Digital Marketing Hub',
    type: 'Full-time',
    posted: '2025-09-25',
    reports: 4,
  },
  {
    id: 5,
    title: 'Software Engineer Intern',
    company: 'Tech Solutions Co.',
    type: 'Internship',
    posted: '2025-09-30',
    reports: 0,
  },
  {
    id: 6,
    title: 'Data Analyst',
    company: 'Digital Marketing Hub',
    type: 'Full-time',
    posted: '2025-09-25',
    reports: 5,
  },
  {
    id: 7,
    title: 'Software Engineer Intern',
    company: 'Tech Solutions Co.',
    type: 'Internship',
    posted: '2025-09-30',
    reports: 2,
  },
  {
    id: 8,
    title: 'Data Analyst',
    company: 'Digital Marketing Hub',
    type: 'Full-time',
    posted: '2025-09-25',
    reports: 6,
  },
];

export function useJobPosts() {
  const [jobPosts, setJobPosts] = useState<JobPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchJobPosts = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setJobPosts(initialMockData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchJobPosts();
  }, [fetchJobPosts]);

  return {
    jobPosts,
    isLoading,
    refetch: fetchJobPosts,
  } as const;
}
