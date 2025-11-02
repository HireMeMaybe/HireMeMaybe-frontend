'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '@/lib/services';
import type { VisitorReport } from '@/types/admin';

export function useVisitorReports(visitorId: number | string) {
  const [reports, setReports] = useState<VisitorReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all reports and filter by reporter (visitor) ID
      const allReports = await AdminService.getReports();

      // Filter reports where reporter matches visitorId
      const visitorReports = allReports.filter((report) => {
        const reporterId = (report as any).reporter || report.reporter_id;
        return reporterId === visitorId.toString();
      });

      // Transform to VisitorReport format with unique keys
      const transformedReports: VisitorReport[] = await Promise.all(
        visitorReports.map(async (report, index) => {
          // Get reported entity info
          const reportedId = (report as any).reported || report.reported_id;

          // Determine the type of reported entity
          let reportedEntityType: 'Job' | 'Company' | 'CPSK' = 'Job';
          if (report.type === 'user') {
            // Check if the reported user is CPSK or Company
            try {
              const userInfo = await AdminService.getUserInfo(reportedId);
              reportedEntityType = userInfo.role === 'CPSK' ? 'CPSK' : 'Company';
            } catch {
              // Default to Company if we can't determine
              reportedEntityType = 'Company';
            }
          }

          // Generate unique ID by combining type prefix with original ID
          const originalId =
            typeof report.id === 'string' ? Number.parseInt(report.id, 10) : report.id;
          const typePrefix = report.type === 'post' ? 1000000 : 2000000;
          const uniqueId = typePrefix + originalId;

          return {
            id: uniqueId,
            reportedEntity: `${report.type === 'post' ? 'Job Post' : reportedEntityType} #${reportedId}`,
            reportedEntityType: report.type === 'post' ? 'Job' : reportedEntityType,
            reason: report.reason,
            submitted: new Date(report.submitted).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            status: (report.status.charAt(0).toUpperCase() + report.status.slice(1)) as
              | 'Pending'
              | 'Reviewed'
              | 'Resolved',
          };
        })
      );

      setReports(transformedReports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch visitor reports');
    } finally {
      setIsLoading(false);
    }
  }, [visitorId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    isLoading,
    error,
    refetch: fetchReports,
  } as const;
}
