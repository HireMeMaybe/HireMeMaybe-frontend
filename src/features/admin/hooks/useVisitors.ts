'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '@/lib/services';
import type { VisitorAccount } from '@/types/admin';

export function useVisitors() {
  const [accounts, setAccounts] = useState<VisitorAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AdminService.getVisitorAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch visitor accounts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const suspendAccount = async (visitorId: number) => {
    await AdminService.suspendVisitorAccount(visitorId);
  };

  const reactivateAccount = async (visitorId: number) => {
    await AdminService.reactivateVisitorAccount(visitorId);
  };

  const banAccount = async (visitorId: number) => {
    await AdminService.banVisitorAccount(visitorId);
  };

  const unbanAccount = async (visitorId: number) => {
    await AdminService.unbanVisitorAccount(visitorId);
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