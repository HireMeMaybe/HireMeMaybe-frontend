// src/features/admin/hooks/useCPSK.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '@/lib/services';
import type { CPSKAccount, PunishmentStruct } from '@/types/admin';

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

  const suspendAccount = async (accountId: string, startDate?: string, endDate?: string) => {
    const punishment: PunishmentStruct = {
      type: 'suspend',
      at: startDate,
      end: endDate,
    };
    await AdminService.punishCPSK(accountId, punishment);
  };

  const reactivateAccount = async (accountId: string) => {
    await AdminService.removePunishment(accountId);
  };

  const banAccount = async (accountId: string) => {
    const punishment: PunishmentStruct = {
      type: 'ban',
    };
    await AdminService.punishCPSK(accountId, punishment);
  };

  const unbanAccount = async (accountId: string) => {
    await AdminService.removePunishment(accountId);
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