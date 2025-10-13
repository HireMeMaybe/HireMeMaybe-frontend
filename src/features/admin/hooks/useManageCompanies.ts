// src/features/admin/hooks/useManageCompanies.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '@/lib/services';
import type { ManagedCompany } from '@/types/admin';

export function useManageCompanies() {
  const [companies, setCompanies] = useState<ManagedCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AdminService.getManagedCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const deleteCompany = async (companyId: number) => {
    await AdminService.deleteManagedCompany(companyId);
  };

  return {
    companies,
    isLoading,
    error,
    refetch: fetchCompanies,
    deleteCompany,
  } as const;
}