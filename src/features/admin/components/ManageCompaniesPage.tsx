'use client';

import React from 'react';
import { useManageCompanies } from '@/features/admin/hooks/useManageCompanies';
import type { ManagedCompany } from '@/types/admin';

export function ManageCompaniesPage() {
  const { companies, isLoading, refetch, suspendCompany, cancelSuspendCompany, banCompany, unbanCompany } = useManageCompanies();

  const handleView = (company: ManagedCompany) => {
    console.log('View company:', company);
    window.open(`/companies/${company.id}`, '_blank');
  };

  const handleSuspend = async (company: ManagedCompany) => {
    try {
      await suspendCompany(company.id);
      refetch();
    } catch (error) {
      console.error('Failed to suspend company:', error);
    }
  };

  const handleCancelSuspend = async (company: ManagedCompany) => {
    try {
      await cancelSuspendCompany(company.id);
      refetch();
    } catch (error) {
      console.error('Failed to cancel suspension:', error);
    }
  };

  const handleBan = async (company: ManagedCompany) => {
    try {
      await banCompany(company.id);
      refetch();
    } catch (error) {
      console.error('Failed to ban company:', error);
    }
  };

  const handleUnban = async (company: ManagedCompany) => {
    try {
      await unbanCompany(company.id);
      refetch();
    } catch (error) {
      console.error('Failed to unban company:', error);
    }
  };

  const getReportColor = (count: number) => {
    if (count === 0) return 'text-primary-green';
    if (count >= 1 && count < 4) return 'text-yellow-warning';
    return 'text-red-reject';
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

  const renderActions = (company: ManagedCompany) => {
    switch (company.status) {
      case 'Active':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleView(company)}
              className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
            >
              View
            </button>
            <button
              onClick={() => handleSuspend(company)}
              className="bg-bright-yellow cursor-pointer rounded-full px-4 py-2 text-sm text-black hover:bg-bright-yellow/85"
            >
              Suspend
            </button>
            <button
              onClick={() => handleBan(company)}
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
              onClick={() => handleView(company)}
              className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
            >
              View
            </button>
            <button
              onClick={() => handleCancelSuspend(company)}
              className="border border-primary-green cursor-pointer rounded-full px-4 py-2 text-sm text-primary-green hover:bg-background/85"
            >
              Cancel Suspend
            </button>
          </div>
        );
      case 'Banned':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleView(company)}
              className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
            >
              View
            </button>
            <button
              onClick={() => handleUnban(company)}
              className="border border-primary-green cursor-pointer rounded-full px-4 py-2 text-sm text-primary-green hover:bg-background/85"
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
              <thead className="text-primary-green bg-zinc-800">
                <tr>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Industry</th>
                  <th className="px-6 py-3">Verified Date</th>
                  <th className="px-6 py-3">Active Posts</th>
                  <th className="px-6 py-3">Reports</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  if (isLoading) {
                    return (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                          Loading companies...
                        </td>
                      </tr>
                    );
                  }
                  if (companies.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
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
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                            company.status
                          )}`}
                        >
                          {company.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">{renderActions(company)}</td>
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

export default ManageCompaniesPage;