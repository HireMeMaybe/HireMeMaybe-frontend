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

  const suspendCompany = async (companyId: number) => {
    await AdminService.suspendManagedCompany(companyId);
  };

  const cancelSuspendCompany = async (companyId: number) => {
    await AdminService.cancelSuspendManagedCompany(companyId);
  };

  const banCompany = async (companyId: number) => {
    await AdminService.banManagedCompany(companyId);
  };

  const unbanCompany = async (companyId: number) => {
    await AdminService.unbanManagedCompany(companyId);
  };

  return {
    companies,
    isLoading,
    error,
    refetch: fetchCompanies,
    suspendCompany,
    cancelSuspendCompany,
    banCompany,
    unbanCompany,
  } as const;
}