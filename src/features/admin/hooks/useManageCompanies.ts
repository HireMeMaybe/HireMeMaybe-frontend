'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ManagedCompany } from '@/types/admin';

const initialMockData: ManagedCompany[] = [
  {
    id: 1,
    name: 'Tech Solutions Co.',
    location: 'Bangkok, Thailand',
    industry: 'Software Development',
    verifiedDate: '2024-01-15',
    activePosts: 5,
    reports: 0,
  },
  {
    id: 2,
    name: 'Digital Marketing Hub',
    location: 'Chiang Mai, Thailand',
    industry: 'Marketing',
    verifiedDate: '2024-01-15',
    activePosts: 4,
    reports: 5,
  },
  {
    id: 3,
    name: 'Tech Solutions Co.',
    location: 'Bangkok, Thailand',
    industry: 'Software Development',
    verifiedDate: '2024-01-15',
    activePosts: 5,
    reports: 0,
  },
  {
    id: 4,
    name: 'Digital Marketing Hub',
    location: 'Chiang Mai, Thailand',
    industry: 'Marketing',
    verifiedDate: '2024-01-15',
    activePosts: 4,
    reports: 5,
  },
  {
    id: 5,
    name: 'Tech Solutions Co.',
    location: 'Bangkok, Thailand',
    industry: 'Software Development',
    verifiedDate: '2024-01-15',
    activePosts: 5,
    reports: 0,
  },
  {
    id: 6,
    name: 'Digital Marketing Hub',
    location: 'Chiang Mai, Thailand',
    industry: 'Marketing',
    verifiedDate: '2024-01-15',
    activePosts: 4,
    reports: 5,
  },
  {
    id: 7,
    name: 'Tech Solutions Co.',
    location: 'Bangkok, Thailand',
    industry: 'Software Development',
    verifiedDate: '2024-01-15',
    activePosts: 5,
    reports: 0,
  },
  {
    id: 8,
    name: 'Digital Marketing Hub',
    location: 'Chiang Mai, Thailand',
    industry: 'Marketing',
    verifiedDate: '2024-01-15',
    activePosts: 4,
    reports: 5,
  },
];

export function useManageCompanies() {
  const [companies, setCompanies] = useState<ManagedCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setCompanies(initialMockData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const deleteCompany = async (companyId: number) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('Delete company:', companyId);
  };

  return {
    companies,
    isLoading,
    refetch: fetchCompanies,
    deleteCompany,
  } as const;
}