'use client';

import { useState, useEffect, useCallback } from 'react';

type Report = {
  reporter: string;
  reporterRole: string;
  reason: string;
  submitted: string; // ISO date string or short date
  link?: string;
};

const initialMock: Report[] = [
  {
    reporter: 'Jane Smith (SKE-2022)',
    reporterRole: 'CPSK',
    reason: 'Unpaid internship — promised payment not received',
    submitted: '2025-09-30',
    link: 'https://www.youtube.com/watch?v=xvFZjo5PgG0',
  },
  {
    reporter: 'Mark Lee (CPE-2023)',
    reporterRole: 'CPSK',
    reason: 'No physical office; fraudulent job offer',
    submitted: '2025-09-28',
    link: 'https://www.youtube.com/watch?v=xvFZjo5PgG0',
  },
  {
    reporter: 'Alvin Tran (SKE-2021)',
    reporterRole: 'Student',
    reason: 'Misleading job description; hours not as advertised',
    submitted: '2025-09-29',
    link: 'https://www.youtube.com/watch?v=xvFZjo5PgG0',
  },
  {
    reporter: 'Maria Gonzales (CPE-2024)',
    reporterRole: 'Company',
    reason: 'Inaccurate company profile reported by user',
    submitted: '2025-09-26',
    link: 'https://www.youtube.com/watch?v=xvFZjo5PgG0',
  },
];

export function useReport() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);

    // simulate network latency
    await new Promise((res) => setTimeout(res, 700));

    // In a real app you'd fetch from your API here
    setReports(initialMock);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    isLoading,
    refetch: fetchReports,
  } as const;
}

export type { Report };
