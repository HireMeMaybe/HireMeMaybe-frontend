'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService, type Report, type ReportStatus, type ReportType } from '@/lib/services';

export function useReport() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (status?: ReportStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await AdminService.getReports(status);

      // Fetch reporter names for each report
      const reportsWithNames = await Promise.all(
        data.map(async (report) => {
          if (report.reporter_id && !report.reporter) {
            try {
              // Don't pass reporterRole as it might not be the actual user role
              // Let getUserName search through all user types
              const reporterName = await AdminService.getUserName(report.reporter_id);
              return {
                ...report,
                reporter: reporterName,
              };
            } catch (err) {
              console.error(`Failed to fetch name for reporter ${report.reporter_id}:`, err);
              return {
                ...report,
                reporter: report.reporter_id, // Fallback to ID if fetching fails
              };
            }
          }
          return report;
        })
      );

      setReports(reportsWithNames);
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
    type: ReportType,
    reportId: string,
    status: ReportStatus,
    adminNote?: string
  ) => {
    try {
      await AdminService.updateReportStatus(type, reportId, status, adminNote);
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

export { type Report } from '@/lib/services';
