'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CPSKAccount } from '@/types/admin';

const initialMockData: CPSKAccount[] = [
  {
    id: 1,
    name: 'Mike Johnson',
    email: 'mike.j@ku.th',
    major: 'CPE',
    year: 'Year 4',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    email: 'sarah.w@ku.th',
    major: 'SKE',
    year: 'Year 2',
    status: 'Suspended',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.j@ku.th',
    major: 'CPE',
    year: 'Year 4',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.w@ku.th',
    major: 'SKE',
    year: 'Year 2',
    status: 'Suspended',
  },
  {
    id: 5,
    name: 'Mike Johnson',
    email: 'mike.j@ku.th',
    major: 'CPE',
    year: 'Year 4',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Sarah Wilson',
    email: 'sarah.w@ku.th',
    major: 'SKE',
    year: 'Year 2',
    status: 'Suspended',
  },
];

export function useCPSK() {
  const [accounts, setAccounts] = useState<CPSKAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setAccounts(initialMockData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const suspendAccount = async (accountId: number) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('Suspend account:', accountId);
  };

  const reactivateAccount = async (accountId: number) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('Reactivate account:', accountId);
  };

  return {
    accounts,
    isLoading,
    refetch: fetchAccounts,
    suspendAccount,
    reactivateAccount,
  } as const;
}