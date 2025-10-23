'use client';

import React from 'react';
import { useVisitorReports } from '@/features/admin/hooks/useVisitorReports';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VisitorReportsPageProps {
  visitorId: number;
}

export function VisitorReportsPage({ visitorId }: VisitorReportsPageProps) {
  const router = useRouter();
  const { reports, isLoading } = useVisitorReports(visitorId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-bright-yellow text-black';
      case 'Reviewed':
        return 'bg-sky-blue text-white';
      case 'Resolved':
        return 'bg-primary-green text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleViewEntity = (entityType: string, entityName: string) => {
    console.log('View entity:', entityType, entityName);
    // You can implement navigation to the specific job or company here
  };

  return (
    <div className="ml-64 flex-1">
      <div className="p-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 cursor-pointer" />
          <span className="cursor-pointer">Back to manage Visitors</span>
        </button>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">Visitor Reports</h1>
          <p className="text-gray-400">View all reports submitted by this visitor</p>
        </div>

        <section className="rounded-lg bg-zinc-900/40 p-4">
          <h2 className="text-primary-green mb-4 text-xl font-semibold">Submitted Reports</h2>

          <div className="overflow-hidden rounded-md">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-gray-400">
                <tr>
                  <th className="px-6 py-3">Reported Entity</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  if (isLoading) {
                    return (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                          Loading reports...
                        </td>
                      </tr>
                    );
                  }
                  if (reports.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                          No reports found for this visitor
                        </td>
                      </tr>
                    );
                  }
                  return reports.map((report) => (
                    <tr key={report.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-white">{report.reportedEntity}</div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className="rounded-full bg-zinc-700 px-3 py-1 text-xs font-medium text-white">
                          {report.reportedEntityType}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-gray-200">{report.reason}</td>
                      <td className="px-6 py-4 align-top text-gray-200">{report.submitted}</td>
                      <td className="px-6 py-4 align-top">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <button
                          onClick={() =>
                            handleViewEntity(report.reportedEntityType, report.reportedEntity)
                          }
                          className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
                        >
                          View Entity
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default VisitorReportsPage;
