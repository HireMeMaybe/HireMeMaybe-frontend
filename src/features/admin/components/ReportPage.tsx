'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReport, type Report } from '@/features/admin/hooks/useReport';
import ReviewReportModal from '@/components/modals/ReviewReportModal';
import DeleteModal from '@/components/modals/DeleteModal';
import CPSKDetailModal from '@/components/modals/CPSKDetailModal';

export function ReportPage() {
  const router = useRouter();
  const { reports, isLoading, refetch, updateReportStatus } = useReport();
  const [selected, setSelected] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCPSKModalOpen, setIsCPSKModalOpen] = useState(false);
  const [selectedCPSKId, setSelectedCPSKId] = useState<string>('');

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'reviewed':
        return 'bg-blue-500/20 text-blue-500';
      case 'resolved':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const openModal = (r: Report) => {
    setSelected(r);
    setIsModalOpen(true);
  };

  const openDeleteModal = (r: Report) => {
    setSelected(r);
    setIsDeleteOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  const handleReview = async (status: 'reviewed' | 'resolved', adminNote?: string) => {
    if (!selected) return;

    try {
      // Use originalId for API call (the ID before unique transformation)
      const reportId = selected.originalId?.toString() || selected.id;
      await updateReportStatus(selected.type, reportId, status, adminNote);
      console.log(`Report ${status === 'reviewed' ? 'reviewed' : 'resolved'} successfully`);
      closeModal();
      await refetch();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report. Please try again.');
    }
  };

  const handleConfirmReject = async () => {
    if (!selected) return;

    try {
      // Reject = mark as resolved with a note
      // Use originalId for API call (the ID before unique transformation)
      const reportId = selected.originalId?.toString() || selected.id;
      await updateReportStatus(selected.type, reportId, 'resolved', 'Report rejected by admin');
      console.log('Report rejected successfully');
      setIsDeleteOpen(false);
      setSelected(null);
      await refetch();
    } catch (error) {
      console.error('Error rejecting report:', error);
      alert('Failed to reject report. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleViewEntity = (report: Report) => {
    const entityType = report.reportedEntityType;
    const entityId = report.reported_id;

    if (entityType === 'Job' && entityId) {
      // Navigate to job post detail page
      router.push(`/job-post/${entityId}`);
    } else if (entityType === 'Company' && entityId) {
      // Navigate to company profile page
      router.push(`/company/${entityId}`);
    } else if (entityType === 'CPSK' && entityId) {
      // Open CPSK detail modal
      setSelectedCPSKId(entityId);
      setIsCPSKModalOpen(true);
    }
  };

  return (
    <div className="ml-64 flex-1">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">Review Reports</h1>
          <p className="text-gray-400">Handle reports from students and companies</p>
        </div>

        <section className="rounded-lg bg-zinc-900/40 p-4">
          <h2 className="text-primary-green mb-4 text-xl font-semibold">Open Reports</h2>

          <div className="overflow-hidden rounded-md">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-gray-400">
                <tr>
                  <th className="px-6 py-3">Reporter</th>
                  <th className="px-6 py-3">Reported Entity</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      Loading reports...
                    </td>
                  </tr>
                )}
                {!isLoading && reports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      No reports found
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  reports.length > 0 &&
                  reports.map((r) => (
                    <tr key={r.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-white">
                          {r.reporter || r.reporter_id || 'Unknown'}
                        </div>
                        {r.reporterRole && (
                          <div className="mt-1 text-xs text-gray-400">{r.reporterRole}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-white">
                          {r.reportedEntity ||
                            `${r.type === 'post' ? 'Job Post' : 'User'} #${r.reported_id}`}
                        </div>
                        {r.reportedEntityType && (
                          <div className="mt-1 text-xs text-gray-400">{r.reportedEntityType}</div>
                        )}
                      </td>
                      <td className="px-3 py-4 align-top">
                        <span className="rounded-full bg-zinc-700 px-3 py-1 text-xs font-medium text-white">
                          {r.reportedEntityType ||
                            (r.type ? r.type.charAt(0).toUpperCase() + r.type.slice(1) : '')}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-gray-200">{r.reason}</td>
                      <td className="px-6 py-4 align-top text-gray-200">
                        {formatDate(r.submitted)}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(r.status)}`}
                        >
                          {r.status
                            ? r.status.charAt(0).toUpperCase() + r.status.slice(1)
                            : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(r)}
                              className="bg-primary-green cursor-pointer rounded-full px-4 py-2 text-sm text-white hover:bg-green-700"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => openDeleteModal(r)}
                              className="bg-red-reject cursor-pointer rounded-full px-4 py-2 text-sm text-gray-200 hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                          <button
                            onClick={() => handleViewEntity(r)}
                            className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
                          >
                            View Entity
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
        <ReviewReportModal
          isOpen={isModalOpen}
          onClose={closeModal}
          report={selected}
          onReview={handleReview}
          onViewEntity={selected ? () => handleViewEntity(selected) : undefined}
        />
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="Reject Report?"
          message="Are you sure you want to reject this report?"
          description="Rejecting a report will mark it as resolved."
          onConfirm={handleConfirmReject}
        />
        <CPSKDetailModal
          isOpen={isCPSKModalOpen}
          onClose={() => setIsCPSKModalOpen(false)}
          cpskId={selectedCPSKId}
        />
      </div>
    </div>
  );
}

export default ReportPage;
