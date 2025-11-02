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

      // Transform to VisitorReport format
      const transformedReports: VisitorReport[] = visitorReports.map((report) => {
        // Get reported entity info
        const reportedId = (report as any).reported || report.reported_id;

        return {
          id: typeof report.id === 'string' ? Number.parseInt(report.id, 10) : report.id,
          reportedEntity: `${report.type === 'post' ? 'Job Post' : 'User'} #${reportedId}`,
          reportedEntityType: report.type === 'post' ? 'Job' : 'Company',
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
      });

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
