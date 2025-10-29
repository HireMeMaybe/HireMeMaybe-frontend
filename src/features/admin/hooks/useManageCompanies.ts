// src/features/admin/hooks/useManageCompanies.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService, type Company } from '@/lib/services';
import type { PunishmentStruct } from '@/types/admin';

export function useManageCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all companies for management (all verification statuses)
      const data = await AdminService.getCompanies();
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

  const suspendCompany = async (userId: string, startDate?: string, endDate?: string) => {
    const punishment: PunishmentStruct = {
      type: 'suspend',
      at: startDate, // Optional, defaults to current time on backend
      end: endDate, // Optional, empty means permanent
    };
    await AdminService.punishCompany(userId, punishment);
  };

  const cancelSuspendCompany = async (userId: string) => {
    await AdminService.removePunishmentCompany(userId);
  };

  const banCompany = async (userId: string) => {
    const punishment: PunishmentStruct = {
      type: 'ban',
      // at and end are optional, backend will use defaults
    };
    await AdminService.punishCompany(userId, punishment);
  };

  const unbanCompany = async (userId: string) => {
    await AdminService.removePunishmentCompany(userId);
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
