// src/features/admin/hooks/useCPSK.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '@/lib/services';
import type { CPSKAccount } from '@/types/admin';

export function useCPSK() {
  const [accounts, setAccounts] = useState<CPSKAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AdminService.getCPSKAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CPSK accounts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const suspendAccount = async (accountId: number) => {
    await AdminService.suspendCPSKAccount(accountId);
  };

  const reactivateAccount = async (accountId: number) => {
    await AdminService.reactivateCPSKAccount(accountId);
  };

  const banAccount = async (accountId: number) => {
    await AdminService.banCPSKAccount(accountId);
  };

  const unbanAccount = async (accountId: number) => {
    await AdminService.unbanCPSKAccount(accountId);
  };

  return {
    accounts,
    isLoading,
    error,
    refetch: fetchAccounts,
    suspendAccount,
    reactivateAccount,
    banAccount,
    unbanAccount,
  } as const;
}