'use client';

import React from 'react';
import { useReport, type Report } from '@/features/admin/hooks/useReport';
import ReviewReportModal from '@/components/modals/ReviewReportModal';
import DeleteModal from '@/components/modals/DeleteModal';
import { useState } from 'react';

export function ReportPage() {
  const { reports, isLoading, refetch } = useReport();
  const [selected, setSelected] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (r: Report) => {
    setSelected(r);
    setIsModalOpen(true);
  };

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openDeleteModal = (r: Report) => {
    setSelected(r);
    setIsDeleteOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  const handleReview = (r: Report) => {
    // implement review logic here (API call etc.)
    // For now just refetch or log
    console.log('Reviewed', r);
    refetch();
  };

  const handleReject = (r: Report) => {
    console.log('Rejected', r);
    refetch();
  };

  const handleConfirmReject = () => {
    if (!selected) return;
    handleReject(selected);
    setIsDeleteOpen(false);
    setSelected(null);
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
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      Loading reports...
                    </td>
                  </tr>
                ) : (
                  reports.map((r, idx) => (
                    <tr key={idx} className="border-b border-zinc-800 hover:bg-zinc-800">
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-white">{r.reporter}</div>
                        <div className="mt-1 text-xs text-gray-400">{r.reporterRole}</div>
                      </td>
                      <td className="px-6 py-4 align-top text-gray-200">{r.reason}</td>
                      <td className="px-6 py-4 align-top text-gray-200">{r.submitted}</td>
                      <td className="px-6 py-4 align-top">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
        <ReviewReportModal
          isOpen={isModalOpen}
          onClose={closeModal}
          report={selected}
          onReview={handleReview}
          onReject={handleReject}
        />
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title="Reject Report?"
          message="Are you sure you want to reject this report?"
          description="Rejecting a report will delete this report."
          onConfirm={handleConfirmReject}
        />
      </div>
    </div>
  );
}

export default ReportPage;
