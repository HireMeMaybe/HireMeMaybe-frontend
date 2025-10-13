'use client';

import { AdminSidebar, ManageCompaniesPage } from '@/features/admin';

export default function ManageCompanyRoute() {
  return (
    <div className="bg-background flex min-h-screen">
      <AdminSidebar />
      <ManageCompaniesPage />
    </div>
  );
}
