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

  // Debug: Log accounts data to verify status is being set correctly
  React.useEffect(() => {
    if (accounts.length > 0) {
      console.log('CPSK Accounts:', accounts);
    }
  }, [accounts]);

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

  const handleSuspend = async (startDate: string, endDate: string) => {
    if (!suspendModal.account) return;
    try {
      // Convert dates to ISO 8601 format if needed
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toISOString();
      };

      const at = startDate ? formatDate(startDate) : undefined;
      const end = endDate ? formatDate(endDate) : undefined;

      await suspendAccount(suspendModal.account.id, at, end);
      refetch();
      setSuspendModal({ isOpen: false, account: null });
    } catch (error) {
      console.error('Failed to suspend account:', error);
    }
  };

  const handleCancelSuspend = async () => {
    if (!cancelSuspendModal.account) return;
    try {
      await reactivateAccount(cancelSuspendModal.account.id);
      refetch();
      setCancelSuspendModal({ isOpen: false, account: null });
    } catch (error) {
      console.error('Failed to cancel suspension:', error);
    }
  };

  const handleBan = async () => {
    if (!banModal.account) return;
    try {
      await banAccount(banModal.account.id);
      refetch();
      setBanModal({ isOpen: false, account: null });
    } catch (error) {
      console.error('Failed to ban account:', error);
    }
  };

  const handleUnban = async () => {
    if (!unbanModal.account) return;
    try {
      await unbanAccount(unbanModal.account.id);
      refetch();
      setUnbanModal({ isOpen: false, account: null });
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
          <p className="text-gray-400">Manage CPSK accounts</p>
        </div>

        <section className="rounded-lg bg-zinc-900/40 p-4">
          <h2 className="text-primary-green mb-4 text-xl font-semibold">CPSK Accounts</h2>

          <div className="overflow-hidden rounded-md">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-gray-400">
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