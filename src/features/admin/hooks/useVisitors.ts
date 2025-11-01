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

      // Transform API response to VisitorAccount format
      const transformedData: VisitorAccount[] = data.map((visitor) => {
        let status: 'Active' | 'Suspended' | 'Banned' = 'Active';

        if (visitor.User?.punishment) {
          status = visitor.User.punishment.type === 'ban' ? 'Banned' : 'Suspended';
        }

        return {
          id: visitor.id,
          name:
            `${visitor.first_name} ${visitor.last_name}`.trim() ||
            visitor.User?.username ||
            'Unknown',
          email: visitor.User?.email || '',
          reportCount: 0, // Will be populated later if needed
          status,
        };
      });

      setAccounts(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch visitor accounts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const suspendAccount = async (visitorId: string, endDate?: string) => {
    // Convert date string to ISO 8601 format if provided
    let endDateISO = '';
    if (endDate) {
      // If endDate is in format YYYY-MM-DD, convert to YYYY-MM-DDTHH:mm:ssZ
      const date = new Date(endDate);
      endDateISO = date.toISOString();
    }

    const punishment = {
      type: 'suspend' as const,
      at: new Date().toISOString(),
      end: endDateISO, // Empty means permanent
    };
    await AdminService.punishVisitor(visitorId, punishment);
  };

  const reactivateAccount = async (visitorId: string) => {
    await AdminService.removePunishmentVisitor(visitorId);
  };

  const banAccount = async (visitorId: string) => {
    const punishment = {
      type: 'ban' as const,
      at: new Date().toISOString(),
      end: '', // Permanent ban
    };
    await AdminService.punishVisitor(visitorId, punishment);
  };

  const unbanAccount = async (visitorId: string) => {
    await AdminService.removePunishmentVisitor(visitorId);
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
