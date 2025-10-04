'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CompanyVerification {
  id: number;
  name: string;
  location: string;
  industry: string;
  contact: string;
  submitted: string;
  status: 'pending' | 'rejected' | 'approved';
}

// Mock data matching the screenshot
const mockRejectedCompanies: CompanyVerification[] = [
  {
    id: 1,
    name: 'Tech Solutions Co.',
    location: 'Bangkok, Thailand',
    industry: 'Software Development',
    contact: 'contact@techsolutions.com',
    submitted: '2025-09-30',
    status: 'rejected',
  },
  {
    id: 2,
    name: 'Digital Marketing Hub',
    location: 'Chiang Mai, Thailand',
    industry: 'Marketing',
    contact: 'hr@digitalhub.co.th',
    submitted: '2025-09-30',
    status: 'rejected',
  },
  {
    id: 3,
    name: 'Tech Solutions Co.',
    location: 'Bangkok, Thailand',
    industry: 'Software Development',
    contact: 'contact@techsolutions.com',
    submitted: '2025-09-30',
    status: 'rejected',
  },
  {
    id: 4,
    name: 'Digital Marketing Hub',
    location: 'Chiang Mai, Thailand',
    industry: 'Marketing',
    contact: 'hr@digitalhub.co.th',
    submitted: '2025-09-30',
    status: 'rejected',
  },
  {
    id: 5,
    name: 'Tech Solutions Co.',
    location: 'Bangkok, Thailand',
    industry: 'Software Development',
    contact: 'contact@techsolutions.com',
    submitted: '2025-09-30',
    status: 'rejected',
  },
  {
    id: 6,
    name: 'Digital Marketing Hub',
    location: 'Chiang Mai, Thailand',
    industry: 'Marketing',
    contact: 'hr@digitalhub.co.th',
    submitted: '2025-09-30',
    status: 'rejected',
  },
  {
    id: 7,
    name: 'Tech Solutions Co.',
    location: 'Bangkok, Thailand',
    industry: 'Software Development',
    contact: 'contact@techsolutions.com',
    submitted: '2025-09-30',
    status: 'rejected',
  },
];

export function useCompanyVerification() {
  const [companies, setCompanies] = useState<CompanyVerification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async (status?: 'pending' | 'rejected' | 'approved') => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 700));

      // In a real app, you would fetch from API:
      // const response = await fetch(`/api/admin/companies?status=${status}`);
      // const data = await response.json();
      // setCompanies(data);

      // For now, use mock data
      const filtered = status
        ? mockRejectedCompanies.filter((c) => c.status === status)
        : mockRejectedCompanies;

      setCompanies(filtered);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch rejected companies by default
    fetchCompanies('rejected');
  }, [fetchCompanies]);

  const reconsiderCompany = async (companyId: number) => {
    try {
      // In a real app:
      // await fetch(`/api/admin/companies/${companyId}/reconsider`, { method: 'POST' });
      console.log('Reconsidering company:', companyId);
      await fetchCompanies('rejected'); // Refresh list
      return true;
    } catch (err) {
      console.error('Error reconsidering company:', err);
      throw err;
    }
  };

  const approveCompany = async (companyId: number) => {
    try {
      // In a real app:
      // await fetch(`/api/admin/companies/${companyId}/approve`, { method: 'POST' });
      console.log('Approving company:', companyId);
      await fetchCompanies('rejected'); // Refresh list
      return true;
    } catch (err) {
      console.error('Error approving company:', err);
      throw err;
    }
  };

  const rejectCompany = async (companyId: number, reason?: string) => {
    try {
      // In a real app:
      // await fetch(`/api/admin/companies/${companyId}/reject`, {
      //   method: 'POST',
      //   body: JSON.stringify({ reason })
      // });
      console.log('Rejecting company:', companyId, 'Reason:', reason);
      await fetchCompanies('rejected'); // Refresh list
      return true;
    } catch (err) {
      console.error('Error rejecting company:', err);
      throw err;
    }
  };

  return {
    companies,
    isLoading,
    error,
    refetch: fetchCompanies,
    reconsiderCompany,
    approveCompany,
    rejectCompany,
  } as const;
}