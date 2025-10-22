'use client';

import React, { useState } from 'react';
import { useCompanyVerification } from '@/features/admin/hooks/useCompanyVerification';
import type { CompanyVerification } from '@/lib/services';
import { ConfirmModal, SuccessModal, UnsuccessModal } from '@/components/modals';

export function CompanyVerificationPage() {
  const { companies, isLoading, statusFilter, setStatusFilter, verifyCompany } =
    useCompanyVerification();
  const [selected, setSelected] = useState<CompanyVerification | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionType, setActionType] = useState<'verify' | 'unverify'>('verify');

  const openConfirmModal = (company: CompanyVerification, action: 'verify' | 'unverify') => {
    setSelected(company);
    setActionType(action);
    setIsConfirmOpen(true);
  };

  const closeModal = () => {
    setIsConfirmOpen(false);
    setSelected(null);
  };

  const handleView = (company: CompanyVerification) => {
    console.log('View company:', company);
    // Navigate to company details page
    window.open(`/company/${company.id}`, '_blank');
  };

  const handleVerifyAction = async () => {
    if (!selected) return;

    try {
      const status = actionType === 'verify' ? 'verified' : 'unverified';
      await verifyCompany(selected.id, status);
      setIsSuccessOpen(true);
    } catch (error) {
      console.error('Failed to update company verification:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update company');
      setIsErrorOpen(true);
    } finally {
      closeModal();
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessOpen(false);
  };

  const closeErrorModal = () => {
    setIsErrorOpen(false);
    setErrorMessage('');
  };

  const getStatusBadge = (status: string | undefined = 'pending') => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      verified: 'bg-green-500/20 text-green-400 border-green-500/50',
      unverified: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return (
      <span
        className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || 'border-gray-500/50 bg-gray-500/20 text-gray-400'}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="ml-64 flex-1">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">Company Verification</h1>
          <p className="text-gray-400">Review and manage company verification status</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setStatusFilter(undefined)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === undefined
                ? 'bg-primary-green text-white'
                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
            }`}
          >
            All Companies
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-primary-green text-white'
                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === 'verified'
                ? 'bg-primary-green text-white'
                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setStatusFilter('unverified')}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === 'unverified'
                ? 'bg-primary-green text-white'
                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
            }`}
          >
            Unverified
          </button>
        </div>

        <section className="rounded-lg bg-zinc-900/40 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-primary-green text-xl font-semibold">
              Companies {statusFilter ? `(${statusFilter})` : ''}
            </h2>
            <span className="text-sm text-gray-400">
              {companies.length} {companies.length === 1 ? 'company' : 'companies'} found
            </span>
          </div>

          <div className="overflow-hidden rounded-md">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-gray-400">
                <tr>
                  <th className="px-6 py-3">Company Name</th>
                  <th className="px-6 py-3">Industry</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Submitted</th>
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
                        <div className="font-medium text-white">{company.name || 'N/A'}</div>
                        <div className="mt-1 text-xs text-gray-400">
                          {company.location || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-gray-200">
                        {company.industry || 'N/A'}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="text-gray-200">{company.email || 'N/A'}</div>
                        <div className="mt-1 text-xs text-gray-400">{company.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        {getStatusBadge(company.verification_status)}
                      </td>
                      <td className="px-6 py-4 align-top text-gray-200">
                        {formatDate(company.created_at)}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleView(company)}
                            className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
                          >
                            View
                          </button>
                          {company.verification_status !== 'verified' && (
                            <button
                              onClick={() => openConfirmModal(company, 'verify')}
                              className="bg-primary-green cursor-pointer rounded-full px-4 py-2 text-sm text-white hover:bg-green-700"
                            >
                              Verify
                            </button>
                          )}
                          {company.verification_status === 'verified' && (
                            <button
                              onClick={() => openConfirmModal(company, 'unverify')}
                              className="cursor-pointer rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                            >
                              Unverify
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

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={closeModal}
          onConfirm={handleVerifyAction}
          title={actionType === 'verify' ? 'Verify Company' : 'Unverify Company'}
          message={actionType === 'verify' ? 'Confirm Verification' : 'Confirm Unverification'}
          description={
            actionType === 'verify'
              ? `Are you sure you want to verify "${selected?.name}"?\n\nThis will mark the company as verified and allow them to post jobs.`
              : `Are you sure you want to unverify "${selected?.name}"?\n\nThis will revoke their verification status and may affect their ability to post jobs.`
          }
        />

        {/* Success Modal */}
        <SuccessModal
          isOpen={isSuccessOpen}
          onClose={closeSuccessModal}
          message={`Company ${actionType === 'verify' ? 'verified' : 'unverified'} successfully`}
        />

        {/* Error Modal */}
        <UnsuccessModal
          isOpen={isErrorOpen}
          onClose={closeErrorModal}
          message={errorMessage || 'An error occurred while updating the company'}
        />
      </div>
    </div>
  );
}

export default CompanyVerificationPage;
