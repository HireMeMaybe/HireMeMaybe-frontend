'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService, type CompanyVerification } from '@/lib/services';

export function useCompanyVerification() {
  const [companies, setCompanies] = useState<CompanyVerification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await AdminService.getRejectedCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Error fetching rejected companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const reconsiderCompany = async (companyId: number) => {
    try {
      await AdminService.reconsiderCompany(companyId);
      await fetchCompanies(); // Refresh list
      return true;
    } catch (err) {
      console.error('Error reconsidering company:', err);
      throw err;
    }
  };

  return {
    companies,
    isLoading,
    error,
    refetch: fetchCompanies,
    reconsiderCompany,
  } as const;
}

export type { CompanyVerification };