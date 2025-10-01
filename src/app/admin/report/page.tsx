'use client';

import { AdminSidebar } from '@/features/admin';
import ReportPage from '@/features/admin/components/ReportPage';

export default function AdminReportRoute() {
  return (
    <div className="bg-background flex min-h-screen">
      <AdminSidebar />
      <ReportPage />
    </div>
  );
}
