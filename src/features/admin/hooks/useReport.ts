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

      // Fetch reporter names and roles for each report
      const reportsWithNames = await Promise.all(
        data.map(async (report) => {
          if (report.reporter_id && !report.reporter) {
            try {
              // Fetch both name and role from the API
              const userInfo = await AdminService.getUserInfo(report.reporter_id);
              return {
                ...report,
                reporter: userInfo.name,
                reporterRole: userInfo.role, // Set the actual user role (cpsk/visitor/company)
              };
            } catch (err) {
              console.error(`Failed to fetch info for reporter ${report.reporter_id}:`, err);
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
