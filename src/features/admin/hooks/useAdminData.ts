'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '@/lib/services';

interface DashboardStats {
  totalJobPosts: number;
  openReports: number;
  verifiedCompanies: number;
  activeCPSK: number;
  totalVisitors: number;
}

export function useAdminData() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobPosts: 0,
    openReports: 0,
    verifiedCompanies: 0,
    activeCPSK: 0,
    totalVisitors: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [jobPosts, reports, companies, cpskAccounts, visitors] = await Promise.all([
        AdminService.getAllJobPosts(),
        AdminService.getReports('pending'),
        AdminService.getCompanies('verified'),
        AdminService.getCPSKAccounts(),
        AdminService.getVisitorAccounts(),
      ]);

      setStats({
        totalJobPosts: jobPosts.length,
        openReports: reports.length,
        verifiedCompanies: companies.length,
        activeCPSK: cpskAccounts.filter((acc) => acc.status === 'Active').length,
        totalVisitors: visitors.length,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
