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
      const [visitors, allReports] = await Promise.all([
        AdminService.getVisitorAccounts(),
        AdminService.getReports(), // Fetch all reports to count by reporter
      ]);

      // Count reports per visitor (by reporter ID)
      const reportCounts = new Map<string, number>();
      for (const report of allReports) {
        const reporterId = (report as any).reporter || report.reporter_id;
        if (reporterId) {
          reportCounts.set(reporterId, (reportCounts.get(reporterId) || 0) + 1);
        }
      }

      // Transform API response to VisitorAccount format
      const transformedData: VisitorAccount[] = visitors.map((visitor) => {
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
          reportCount: reportCounts.get(visitor.id) || 0, // Get actual report count
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
    const punishment: any = {
      type: 'suspend' as const,
      at: new Date().toISOString(),
    };

    if (endDate) {
      // If endDate is in format YYYY-MM-DD, convert to YYYY-MM-DDTHH:mm:ssZ
      const date = new Date(endDate);
      punishment.end = date.toISOString();
    }
    // If no endDate, don't include 'end' field (permanent suspension)

    await AdminService.punishVisitor(visitorId, punishment);
  };

  const reactivateAccount = async (visitorId: string) => {
    await AdminService.removePunishmentVisitor(visitorId);
  };

  const banAccount = async (visitorId: string) => {
    // For permanent ban, don't include 'end' field at all
    const punishment: any = {
      type: 'ban' as const,
      at: new Date().toISOString(),
    };
    // Don't include 'end' field for permanent ban
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
