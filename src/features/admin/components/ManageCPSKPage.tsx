'use client';

import React, { useState } from 'react';
import { useCPSK } from '@/features/admin/hooks/useCPSK';
import type { CPSKAccount } from '@/types/admin';

export function ManageCPSKPage() {
  const { accounts, isLoading, refetch, suspendAccount, reactivateAccount } = useCPSK();

  const handleView = (account: CPSKAccount) => {
    console.log('View account:', account);
    window.open(`/student/${account.id}`, '_blank');
  };

  const handleSuspend = async (account: CPSKAccount) => {
    try {
      await suspendAccount(account.id);
      refetch();
    } catch (error) {
      console.error('Failed to suspend account:', error);
    }
  };

  const handleReactivate = async (account: CPSKAccount) => {
    try {
      await reactivateAccount(account.id);
      refetch();
    } catch (error) {
      console.error('Failed to reactivate account:', error);
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
              <thead className="bg-zinc-800 text-primary-green">
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
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            account.status === 'Active'
                              ? 'bg-primary-green text-white'
                              : 'bg-red-reject text-white'
                          }`}
                        >
                          {account.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(account)}
                            className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
                          >
                            View
                          </button>
                          {account.status === 'Active' ? (
                            <button
                              onClick={() => handleSuspend(account)}
                              className="bg-yellow-warning cursor-pointer rounded-full px-4 py-2 text-sm text-black hover:bg-yellow-600"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(account)}
                              className="bg-sky-blue cursor-pointer rounded-full px-4 py-2 text-sm text-white hover:bg-blue-600"
                            >
                              Reactivate
                            </button>
                          )}
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
    </div>
  );
}

export default ManageCPSKPage;