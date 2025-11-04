'use client';

import React, { useState } from 'react';
import { useCompanyVerification } from '@/features/admin/hooks/useCompanyVerification';
import type { Company } from '@/lib/services';
import { ReconsiderModal, SuccessModal, UnsuccessModal } from '@/components/modals';

export function CompanyVerificationPage() {
  // Initialize with 'unverified' filter to show only unverified companies
  const { companies, isLoading, verifyCompany } = useCompanyVerification('unverified');
  const [selected, setSelected] = useState<Company | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const openConfirmModal = (company: Company) => {
    setSelected(company);
    setIsConfirmOpen(true);
  };

  const closeModal = () => {
    setIsConfirmOpen(false);
    setSelected(null);
  };

  const handleView = (company: Company) => {
    console.log('View company:', company);
    // Navigate to company details page
    window.open(`/company/${company.id}`, '_blank');
  };

  const handleReconsider = async () => {
    if (!selected) return;

    try {
      await verifyCompany(selected.id, 'verified');
      setIsSuccessOpen(true);
    } catch (error) {
      console.error('Failed to verify company:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to verify company');
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
          <p className="text-gray-400">Review and reconsider unverified company registrations</p>
        </div>

        <section className="rounded-lg bg-zinc-900/40 p-4">
          <h2 className="text-primary-green mb-4 text-xl font-semibold">Unverified Companies</h2>

          <div className="overflow-hidden rounded-md">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800 text-gray-400">
                <tr>
                  <th className="px-6 py-3">Company Name</th>
                  <th className="px-6 py-3">Industry</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  if (isLoading) {
                    return (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          Loading companies...
                        </td>
                      </tr>
                    );
                  }
                  if (companies.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          No unverified companies found
                        </td>
                      </tr>
                    );
                  }
                  return companies.map((company) => (
                    <tr key={company.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                      <td className="px-6 py-4 align-top">
                        <div className="font-medium text-white">{company.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 align-top text-gray-200">
                        {company.industry
                          ? company.industry.charAt(0).toUpperCase() + company.industry.slice(1)
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="text-gray-200">{company.User?.email ?? 'N/A'}</div>
                        <div className="mt-1 text-xs text-gray-400">
                          {company.User?.tel ?? 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-gray-200">
                        {formatDate(
                          (company.User as { CreatedAt?: string } | undefined)?.CreatedAt ?? 'N/A'
                        )}
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
                            onClick={() => openConfirmModal(company)}
                            className="bg-primary-green cursor-pointer rounded-full px-4 py-2 text-sm text-white hover:bg-green-700"
                          >
                            Reconsider
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

        {/* Reconsider Modal */}
        <ReconsiderModal
          isOpen={isConfirmOpen}
          onClose={closeModal}
          onConfirm={handleReconsider}
          companyName={selected?.name}
        />

        {/* Success Modal */}
        <SuccessModal
          isOpen={isSuccessOpen}
          onClose={closeSuccessModal}
          message="Company verified successfully"
        />

        {/* Error Modal */}
        <UnsuccessModal
          isOpen={isErrorOpen}
          onClose={closeErrorModal}
          message={errorMessage || 'An error occurred while verifying the company'}
        />
      </div>
    </div>
  );
}

export default CompanyVerificationPage;
