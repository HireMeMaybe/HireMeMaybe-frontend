'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService, type Report } from '@/lib/services';

export function useReport() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (status?: 'pending' | 'reviewed' | 'resolved') => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await AdminService.getReports(status);
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const submitReport = async (data: {
    reportedEntityId: string;
    reportedEntityType: 'job' | 'company';
    reason: string;
    details?: string;
  }) => {
    try {
      await AdminService.submitReport(data);
      await fetchReports(); // Refresh list
      return true;
    } catch (err) {
      console.error('Error submitting report:', err);
      throw err;
    }
  };

  const updateReportStatus = async (
    reportId: string,
    status: 'reviewed' | 'resolved',
    notes?: string
  ) => {
    try {
      await AdminService.updateReportStatus(reportId, status, notes);
      await fetchReports(); // Refresh list
      return true;
    } catch (err) {
      console.error('Error updating report:', err);
      throw err;
    }
  };

  return {
    reports,
    isLoading,
    error,
    refetch: fetchReports,
    submitReport,
    updateReportStatus,
  } as const;
}

export type { Report };
