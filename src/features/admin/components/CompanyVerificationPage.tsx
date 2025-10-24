'use client';

import React, { useState } from 'react';
import { useCompanyVerification } from '@/features/admin/hooks/useCompanyVerification';
import type { CompanyVerification } from '@/lib/services';
import ReconsiderModal from '@/components/modals/ReconsiderModal';
import SuccessModal from '@/components/modals/SuccessModal'; // Import the success modal component
import { capitalize } from '@/lib/utils/string';

export function CompanyVerificationPage() {
  const { companies, isLoading, refetch } = useCompanyVerification();
  const [selected, setSelected] = useState<CompanyVerification | null>(null);
  const [isReconsiderOpen, setIsReconsiderOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false); // State for success modal

  const openReconsiderModal = (company: CompanyVerification) => {
    setSelected(company);
    setIsReconsiderOpen(true);
  };

  const closeModal = () => {
    setIsReconsiderOpen(false);
    setSelected(null);
  };

  const handleView = (company: CompanyVerification) => {
    console.log('View company:', company);
    // In a real app, navigate to company details page
    window.open(`/company/${company.id}`, '_blank');
  };

  const handleReconsider = async () => {
    if (!selected) return;

    try {
      // implement review logic here (API call etc.)
      // For now just refetch or log
      // await reconsiderCompany(selected.id);
      refetch();
      setIsSuccessOpen(true); // Open success modal on success
    } catch (error) {
      console.error('Failed to reconsider company:', error);
    } finally {
      closeModal();
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessOpen(false);
  };

  return (
    <div className="ml-64 flex-1">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">Company Verification</h1>
          <p className="text-gray-400">Review and reconsider company registrations</p>
        </div>

        <section className="rounded-lg bg-zinc-900/40 p-4">
          <h2 className="text-primary-green mb-4 text-xl font-semibold">Rejected Companies</h2>

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
                          No rejected companies found
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
                      <td className="px-6 py-4 align-top text-gray-200">
                        {capitalize(company.industry)}
                      </td>
                      <td className="px-6 py-4 align-top text-gray-200">{company.contact}</td>
                      <td className="px-6 py-4 align-top text-gray-200">{company.submitted}</td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(company)}
                            className="cursor-pointer rounded-full bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openReconsiderModal(company)}
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
          isOpen={isReconsiderOpen}
          onClose={closeModal}
          onConfirm={handleReconsider}
          companyName={selected?.name}
        />

        {/* Success Modal */}
        <SuccessModal
          isOpen={isSuccessOpen}
          onClose={closeSuccessModal}
          message="Company approved successfully"
        />
      </div>
    </div>
  );
}

export default CompanyVerificationPage;
