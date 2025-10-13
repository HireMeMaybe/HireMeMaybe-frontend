'use client';

import React, { useState } from 'react';
import { useManageCompanies } from '@/features/admin/hooks/useManageCompanies';
import type { ManagedCompany } from '@/types/admin';
import DeleteModal from '@/components/modals/DeleteModal';

export function ManageCompaniesPage() {
  const { companies, isLoading, refetch, deleteCompany } = useManageCompanies();
  const [selectedCompany, setSelectedCompany] = useState<ManagedCompany | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleView = (company: ManagedCompany) => {
    console.log('View company:', company);
    window.open(`/companies/${company.id}`, '_blank');
  };

  const handleDelete = (company: ManagedCompany) => {
    setSelectedCompany(company);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCompany) return;

    try {
      await deleteCompany(selectedCompany.id);
      refetch();
    } catch (error) {
      console.error('Failed to delete company:', error);
    } finally {
      setDeleteModalOpen(false);
      setSelectedCompany(null);
    }
  };

  const getReportColor = (count: number) => {
    if (count === 0) return 'text-primary-green';
    if (count >= 1 && count < 4) return 'text-yellow-warning';
    return 'text-red-reject';
  };

  return (
    <div className="ml-64 flex-1">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">Manage Companies</h1>
          <p className="text-gray-400">Manage all verified companies on the platform</p>
        </div>

        <section className="rounded-lg bg-zinc-900/40 p-4">
          <h2 className="text-primary-green mb-4 text-xl font-semibold">All Companies</h2>

          <div className="overflow-hidden rounded-md">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-primary-green">
                <tr>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Industry</th>
                  <th className="px-6 py-3">Verified Date</th>
                  <th className="px-6 py-3">Active Posts</th>
                  <th className="px-6 py-3">Reports</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  if (isLoading) {
                    return (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                          Loading companies...
                        </td>
                      </tr>
                    );
                  }
                  if (companies.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                          No companies found
                        </td>
                      </tr>
                    );
                  }
                  return companies.map((company) => (
                    <tr key={company.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-white">{company.name}</div>
                        <div className="mt-1 text-xs text-gray-400">{company.location}</div>
                      </td>
                      <td className="px-6 py-4 align-top text-gray-200">{company.industry}</td>
                      <td className="px-6 py-4 align-top text-gray-200">{company.verifiedDate}</td>
                      <td className="px-6 py-4 align-top text-gray-200">{company.activePosts}</td>
                      <td className="px-6 py-4 align-top">
                        <span className={`font-medium ${getReportColor(company.reports)}`}>
                          {company.reports}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(company)}
                            className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(company)}
                            className="bg-red-reject cursor-pointer rounded-full px-4 py-2 text-sm text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Company?"
      />
    </div>
  );
}

export default ManageCompaniesPage;