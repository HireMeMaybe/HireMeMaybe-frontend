'use client';

import React, { useState } from 'react';
import { useCPSK } from '@/features/admin/hooks/useCPSK';
import type { CPSKAccount } from '@/types/admin';
import { SuspendModal, BanModal, CancelSuspendModal, UnbanModal } from '@/components/modals';

export function ManageCPSKPage() {
  const {
    accounts,
    isLoading,
    refetch,
    suspendAccount,
    reactivateAccount,
    banAccount,
    unbanAccount,
  } = useCPSK();

  const [suspendModal, setSuspendModal] = useState<{
    isOpen: boolean;
    account: CPSKAccount | null;
  }>({
    isOpen: false,
    account: null,
  });
  const [banModal, setBanModal] = useState<{ isOpen: boolean; account: CPSKAccount | null }>({
    isOpen: false,
    account: null,
  });
  const [cancelSuspendModal, setCancelSuspendModal] = useState<{
    isOpen: boolean;
    account: CPSKAccount | null;
  }>({
    isOpen: false,
    account: null,
  });
  const [unbanModal, setUnbanModal] = useState<{ isOpen: boolean; account: CPSKAccount | null }>({
    isOpen: false,
    account: null,
  });

  const handleView = (account: CPSKAccount) => {
    console.log('View account:', account);
    window.open(`/student/${account.id}`, '_blank');
  };

  const handleSuspend = async (startDate: string, endDate: string) => {
    if (!suspendModal.account) return;
    try {
      // Note: API call will be updated to include startDate and endDate when backend is ready
      console.log('Suspending with dates:', { startDate, endDate });
      await suspendAccount(suspendModal.account.id);
      refetch();
    } catch (error) {
      console.error('Failed to suspend account:', error);
    }
  };

  const handleCancelSuspend = async () => {
    if (!cancelSuspendModal.account) return;
    try {
      await reactivateAccount(cancelSuspendModal.account.id);
      refetch();
    } catch (error) {
      console.error('Failed to cancel suspension:', error);
    }
  };

  const handleBan = async () => {
    if (!banModal.account) return;
    try {
      await banAccount(banModal.account.id);
      refetch();
    } catch (error) {
      console.error('Failed to ban account:', error);
    }
  };

  const handleUnban = async () => {
    if (!unbanModal.account) return;
    try {
      await unbanAccount(unbanModal.account.id);
      refetch();
    } catch (error) {
      console.error('Failed to unban account:', error);
    }
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

  const renderActions = (account: CPSKAccount) => {
    switch (account.status) {
      case 'Active':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleView(account)}
              className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
            >
              View
            </button>
            <button
              onClick={() => setSuspendModal({ isOpen: true, account })}
              className="bg-bright-yellow hover:bg-bright-yellow/85 cursor-pointer rounded-full px-4 py-2 text-sm text-black"
            >
              Suspend
            </button>
            <button
              onClick={() => setBanModal({ isOpen: true, account })}
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
              onClick={() => handleView(account)}
              className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
            >
              View
            </button>
            <button
              onClick={() => setCancelSuspendModal({ isOpen: true, account })}
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
              onClick={() => handleView(account)}
              className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
            >
              View
            </button>
            <button
              onClick={() => setUnbanModal({ isOpen: true, account })}
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
          <h1 className="mb-2 text-3xl font-bold text-white">Manage CPSK</h1>
          <p className="text-gray-400">View and manage CPSK accounts</p>
        </div>

        <section className="rounded-lg bg-zinc-900/40 p-4">
          <h2 className="text-primary-green mb-4 text-xl font-semibold">CPSK Accounts</h2>

          <div className="overflow-hidden rounded-md">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400 bg-zinc-800">
                <tr>
                  <th className="px-6 py-3">CPSK</th>
                  <th className="px-6 py-3">Major</th>
                  <th className="px-6 py-3">Year</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  if (isLoading) {
                    return (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          Loading CPSK accounts...
                        </td>
                      </tr>
                    );
                  }
                  if (accounts.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          No CPSK accounts found
                        </td>
                      </tr>
                    );
                  }
                  return accounts.map((account) => (
                    <tr key={account.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-white">{account.name}</div>
                        <div className="mt-1 text-xs text-gray-400">{account.email}</div>
                      </td>
                      <td className="px-6 py-4 align-top text-gray-200">{account.major}</td>
                      <td className="px-6 py-4 align-top text-gray-200">{account.year}</td>
                      <td className="px-6 py-4 align-top">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                            account.status
                          )}`}
                        >
                          {account.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">{renderActions(account)}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modals */}
      <SuspendModal
        isOpen={suspendModal.isOpen}
        onClose={() => setSuspendModal({ isOpen: false, account: null })}
        onConfirm={handleSuspend}
        entityName={suspendModal.account?.name}
        entityType="CPSK"
      />

      <BanModal
        isOpen={banModal.isOpen}
        onClose={() => setBanModal({ isOpen: false, account: null })}
        onConfirm={handleBan}
        entityName={banModal.account?.name}
        entityType="CPSK"
      />

      <CancelSuspendModal
        isOpen={cancelSuspendModal.isOpen}
        onClose={() => setCancelSuspendModal({ isOpen: false, account: null })}
        onConfirm={handleCancelSuspend}
        entityName={cancelSuspendModal.account?.name}
        entityType="CPSK"
      />

      <UnbanModal
        isOpen={unbanModal.isOpen}
        onClose={() => setUnbanModal({ isOpen: false, account: null })}
        onConfirm={handleUnban}
        entityName={unbanModal.account?.name}
        entityType="CPSK"
      />
    </div>
  );
}

export default ManageCPSKPage;
