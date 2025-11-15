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

      // Fetch reporter names, roles, and reported entity names for each report
      const reportsWithNames = await Promise.all(
        data.map(async (report) => {
          const updatedReport = { ...report };

          // Fetch reporter info
          if (report.reporter_id && !report.reporter) {
            try {
              const userInfo = await AdminService.getUserInfo(report.reporter_id);
              updatedReport.reporter = userInfo.name;
              updatedReport.reporterRole = userInfo.role;
            } catch (err) {
              console.error(`Failed to fetch info for reporter ${report.reporter_id}:`, err);
              updatedReport.reporter = report.reporter_id;
            }
          }

          // Fetch reported entity info
          if (report.reported_id && !report.reportedEntity) {
            try {
              const entityInfo = await AdminService.getReportedEntityName(
                report.reported_id,
                report.type
              );
              updatedReport.reportedEntity = entityInfo.name;
              updatedReport.reportedEntityType = entityInfo.entityType;
            } catch (err) {
              console.error(`Failed to fetch info for reported entity ${report.reported_id}:`, err);
              updatedReport.reportedEntity =
                report.type === 'post'
                  ? `Job Post #${report.reported_id}`
                  : `User #${report.reported_id}`;
            }
          }

          return updatedReport;
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
    reported_id: number;
    reportedEntityType: 'post' | 'user';
    reason: string;
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
