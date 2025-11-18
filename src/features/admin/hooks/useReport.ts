'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService, type Report, type ReportStatus, type ReportType } from '@/lib/services';

// Helper function to get reporter info from cached data
function getReporterInfo(
  reporterId: string,
  cpskMap: Map<string, string>,
  visitorMap: Map<string, string>,
  companyMap: Map<string, string>
): { name: string; role?: string } {
  if (cpskMap.has(reporterId)) {
    return { name: cpskMap.get(reporterId)!, role: 'CPSK' };
  }
  if (visitorMap.has(reporterId)) {
    return { name: visitorMap.get(reporterId)!, role: 'Visitor' };
  }
  if (companyMap.has(reporterId)) {
    return { name: companyMap.get(reporterId)!, role: 'Company' };
  }
  return { name: reporterId };
}

// Helper function to get reported entity info from cached data
function getReportedEntityInfo(
  reportedId: string,
  type: 'post' | 'user',
  cpskMap: Map<string, string>,
  visitorMap: Map<string, string>,
  companyMap: Map<string, string>,
  jobPostMap: Map<number, string>
): { name: string; entityType: 'Job' | 'Company' | 'CPSK' } {
  if (type === 'post') {
    const jobId = Number.parseInt(reportedId, 10);
    return {
      name: jobPostMap.get(jobId) || `Job Post #${reportedId}`,
      entityType: 'Job',
    };
  }

  // type === 'user'
  if (cpskMap.has(reportedId)) {
    return { name: cpskMap.get(reportedId)!, entityType: 'CPSK' };
  }
  if (visitorMap.has(reportedId)) {
    return { name: visitorMap.get(reportedId)!, entityType: 'Company' };
  }
  if (companyMap.has(reportedId)) {
    return { name: companyMap.get(reportedId)!, entityType: 'Company' };
  }
  return { name: `User #${reportedId}`, entityType: 'Company' };
}

export function useReport() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (status?: ReportStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await AdminService.getReports(status);

      // Pre-fetch all user accounts once to avoid rate limiting
      const [cpskAccounts, visitorAccounts] = await Promise.all([
        AdminService.getCPSKAccounts().catch(() => []),
        AdminService.getVisitorAccounts().catch(() => []),
      ]);

      // Create lookup maps for faster access
      const cpskMap = new Map(cpskAccounts.map((user) => [user.id, user.name]));
      const visitorMap = new Map(
        visitorAccounts.map((user) => [
          user.id,
          `${user.first_name} ${user.last_name}`.trim() || user.User?.username || 'Unknown',
        ])
      );

      // Collect unique job post IDs to batch fetch
      const jobPostIds = new Set<number>();
      const companyIds = new Set<string>();

      for (const report of data) {
        if (report.type === 'post' && !report.reportedEntity) {
          jobPostIds.add(Number.parseInt(report.reported_id, 10));
        }
        // Check if reported entity is a company (not in CPSK or Visitor maps)
        if (
          report.type === 'user' &&
          !cpskMap.has(report.reported_id) &&
          !visitorMap.has(report.reported_id)
        ) {
          companyIds.add(report.reported_id);
        }
        // Check if reporter is a company
        if (
          report.reporter_id &&
          !cpskMap.has(report.reporter_id) &&
          !visitorMap.has(report.reporter_id)
        ) {
          companyIds.add(report.reporter_id);
        }
      }

      // Batch fetch job posts
      const jobPostMap = new Map<number, string>();
      await Promise.all(
        Array.from(jobPostIds).map(async (id) => {
          try {
            const jobPost = await AdminService.getJobPostById(id);
            jobPostMap.set(id, jobPost.title);
          } catch (err) {
            console.error(`Failed to fetch job post ${id}:`, err);
            jobPostMap.set(id, `Job Post #${id}`);
          }
        })
      );

      // Batch fetch companies
      const companyMap = new Map<string, string>();
      await Promise.all(
        Array.from(companyIds).map(async (id) => {
          try {
            const company = await AdminService.getCompanyById(id);
            companyMap.set(id, company.name);
          } catch (err) {
            console.error(`Failed to fetch company ${id}:`, err);
            companyMap.set(id, id);
          }
        })
      );

      // Process reports with cached data
      const reportsWithNames = data.map((report) => {
        const updatedReport = { ...report };

        // Set reporter info using cached data
        if (report.reporter_id && !report.reporter) {
          const reporterInfo = getReporterInfo(report.reporter_id, cpskMap, visitorMap, companyMap);
          updatedReport.reporter = reporterInfo.name;
          updatedReport.reporterRole = reporterInfo.role;
        }

        // Set reported entity info using cached data
        if (report.reported_id && !report.reportedEntity) {
          const entityInfo = getReportedEntityInfo(
            report.reported_id,
            report.type,
            cpskMap,
            visitorMap,
            companyMap,
            jobPostMap
          );
          updatedReport.reportedEntity = entityInfo.name;
          updatedReport.reportedEntityType = entityInfo.entityType;
        }

        return updatedReport;
      });

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
