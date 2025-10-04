'use client';

import { AdminSidebar } from '@/features/admin';
import CompanyVerificationPage from '@/features/admin/components/CompanyVerificationPage';

export default function AdminCompanyVerificationRoute() {
  return (
    <div className="bg-background flex min-h-screen">
      <AdminSidebar />
      <CompanyVerificationPage />
    </div>
  );
}