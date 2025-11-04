'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService, type Company } from '@/lib/services';

export function useCompanyVerification(initialStatus?: 'pending' | 'verified' | 'unverified') {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    'pending' | 'verified' | 'unverified' | undefined
  >(initialStatus);

  const fetchCompanies = useCallback(async (status?: 'pending' | 'verified' | 'unverified') => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await AdminService.getCompanies(status);
      setCompanies(data);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies(statusFilter);
  }, [fetchCompanies, statusFilter]);

  const verifyCompany = async (
    companyId: string,
    status: 'verified' | 'unverified' = 'verified'
  ) => {
    try {
      await AdminService.verifyCompany(companyId, status);
      await fetchCompanies(statusFilter); // Refresh list with current filter
      return true;
    } catch (err) {
      console.error('Error verifying company:', err);
      throw err;
    }
  };

  return {
    companies,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    refetch: () => fetchCompanies(statusFilter),
    verifyCompany,
  } as const;
}
