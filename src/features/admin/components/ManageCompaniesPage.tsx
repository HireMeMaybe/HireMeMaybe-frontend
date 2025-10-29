'use client';

import React, { useState } from 'react';
import { useManageCompanies } from '@/features/admin/hooks/useManageCompanies';
import type { Company } from '@/lib/services';
import { SuspendModal, BanModal, CancelSuspendModal, UnbanModal } from '@/components/modals';

export function ManageCompaniesPage() {
  const {
    companies,
    isLoading,
    refetch,
    suspendCompany,
    cancelSuspendCompany,
    banCompany,
    unbanCompany,
  } = useManageCompanies();

  const [suspendModal, setSuspendModal] = useState<{
    isOpen: boolean;
    company: Company | null;
  }>({
    isOpen: false,
    company: null,
  });
  const [banModal, setBanModal] = useState<{ isOpen: boolean; company: Company | null }>({
    isOpen: false,
    company: null,
  });
  const [cancelSuspendModal, setCancelSuspendModal] = useState<{
    isOpen: boolean;
    company: Company | null;
  }>({
    isOpen: false,
    company: null,
  });
  const [unbanModal, setUnbanModal] = useState<{ isOpen: boolean; company: Company | null }>({
    isOpen: false,
    company: null,
  });

  const handleView = (company: Company) => {
    console.log('View company:', company);
    window.open(`/company/${company.id}`, '_blank');
  };

  const handleSuspend = async (startDate: string, endDate: string) => {
    const userId = suspendModal.company?.User?.id || suspendModal.company?.id;
    if (!userId) return;
    try {
      // Format dates to ISO 8601 format if provided
      const formattedStartDate = startDate ? new Date(startDate).toISOString() : undefined;
      const formattedEndDate = endDate ? new Date(endDate).toISOString() : undefined;

      console.log('Suspending with dates:', {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
      await suspendCompany(userId, formattedStartDate, formattedEndDate);
      refetch();
    } catch (error) {
      console.error('Failed to suspend company:', error);
    }
  };

  const handleCancelSuspend = async () => {
    const userId = cancelSuspendModal.company?.User?.id || cancelSuspendModal.company?.id;
    if (!userId) return;
    try {
      await cancelSuspendCompany(userId);
      refetch();
    } catch (error) {
      console.error('Failed to cancel suspension:', error);
    }
  };

  const handleBan = async () => {
    const userId = banModal.company?.User?.id || banModal.company?.id;
    if (!userId) return;
    try {
      await banCompany(userId);
      refetch();
    } catch (error) {
      console.error('Failed to ban company:', error);
    }
  };

  const handleUnban = async () => {
    const userId = unbanModal.company?.User?.id || unbanModal.company?.id;
    if (!userId) return;
    try {
      await unbanCompany(userId);
      refetch();
    } catch (error) {
      console.error('Failed to unban company:', error);
    }
  };

  const getCompanyStatus = (company: Company): 'Active' | 'Suspended' | 'Banned' => {
    if (company.User?.punishment) {
      return company.User.punishment.type === 'ban' ? 'Banned' : 'Suspended';
    }
    return 'Active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-primary-green text-white';
      case 'Suspended':
        return 'bg-bright-yellow text-black';
      case 'Banned':
        return 'bg-red-reject text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const renderActions = (company: Company) => {
    const status = getCompanyStatus(company);
    switch (status) {
      case 'Active':
        return (
          <div className="flex gap-2">
            <button
              key="view"
              onClick={() => handleView(company)}
              className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
            >
              View
            </button>
            <button
              key="suspend"
              onClick={() => setSuspendModal({ isOpen: true, company })}
              className="bg-bright-yellow hover:bg-bright-yellow/85 cursor-pointer rounded-full px-4 py-2 text-sm text-black"
            >
              Suspend
            </button>
            <button
              key="ban"
              onClick={() => setBanModal({ isOpen: true, company })}
              className="bg-red-reject cursor-pointer rounded-full px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Ban
            </button>
          </div>
        );
      case 'Suspended':
        return (
          <div className="flex gap-2">
            <button
              key="view"
              onClick={() => handleView(company)}
              className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
            >
              View
            </button>
            <button
              key="cancel-suspend"
              onClick={() => setCancelSuspendModal({ isOpen: true, company })}
              className="border-primary-green text-primary-green hover:bg-background/85 cursor-pointer rounded-full border px-4 py-2 text-sm"
            >
              Cancel Suspend
            </button>
          </div>
        );
      case 'Banned':
        return (
          <div className="flex gap-2">
            <button
              key="view"
              onClick={() => handleView(company)}
              className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
            >
              View
            </button>
            <button
              key="unban"
              onClick={() => setUnbanModal({ isOpen: true, company })}
              className="border-primary-green text-primary-green hover:bg-background/85 cursor-pointer rounded-full border px-4 py-2 text-sm"
            >
              Unban
            </button>
          </div>
        );
      default:
        return null;
    }
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
              <thead className="bg-zinc-800 text-gray-400">
                <tr>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Industry</th>
                  <th className="px-6 py-3">Verified Date</th>
                  <th className="px-6 py-3">Active Posts</th>
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
                  return companies.map((company) => {
                    const status = getCompanyStatus(company);
                    const verifiedDate =
                      company.verification_status === 'verified'
                        ? new Date(company.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A';

                    return (
                      <tr key={company.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                        <td className="px-6 py-4 align-top">
                          <div className="font-medium text-white">{company.name}</div>
                        </td>
                        <td className="px-6 py-4 align-top text-gray-200">{company.industry
                          ? company.industry.charAt(0).toUpperCase() + company.industry.slice(1)
                          : 'N/A'}</td>
                        <td className="px-6 py-4 align-top text-gray-200">{verifiedDate}</td>
                        <td className="px-6 py-4 align-top text-gray-200">0</td>
                        <td className="px-6 py-4 align-top">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-top">{renderActions(company)}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modals */}
      <SuspendModal
        isOpen={suspendModal.isOpen}
        onClose={() => setSuspendModal({ isOpen: false, company: null })}
        onConfirm={handleSuspend}
        entityName={suspendModal.company?.name}
        entityType="Company"
      />

      <BanModal
        isOpen={banModal.isOpen}
        onClose={() => setBanModal({ isOpen: false, company: null })}
        onConfirm={handleBan}
        entityName={banModal.company?.name}
        entityType="Company"
      />

      <CancelSuspendModal
        isOpen={cancelSuspendModal.isOpen}
        onClose={() => setCancelSuspendModal({ isOpen: false, company: null })}
        onConfirm={handleCancelSuspend}
        entityName={cancelSuspendModal.company?.name}
        entityType="Company"
      />

      <UnbanModal
        isOpen={unbanModal.isOpen}
        onClose={() => setUnbanModal({ isOpen: false, company: null })}
        onConfirm={handleUnban}
        entityName={unbanModal.company?.name}
        entityType="Company"
      />
    </div>
  );
}

export default ManageCompaniesPage;
