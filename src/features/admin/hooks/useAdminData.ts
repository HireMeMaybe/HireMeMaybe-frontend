"use client";

import { useState, useEffect } from "react";
import type { DashboardStats } from "@/types/admin";

export function useAdminData() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingVerifications: 12,
    openReports: 5,
    verifiedCompanies: 248,
    activeStudents: 479
  });

  const [isLoading, setIsLoading] = useState(false);

  // Simulate data fetching
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app:
      // const response = await fetch('/api/admin/stats');
      // const data = await response.json();
      // setStats(data);
      
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    refetch: () => {
      // Implement refetch logic
    }
  };
}