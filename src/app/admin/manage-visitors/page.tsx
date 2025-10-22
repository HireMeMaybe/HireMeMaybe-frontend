'use client';

import { AdminSidebar, ManageVisitorsPage } from '@/features/admin';

export default function ManageVisitorsRoute() {
  return (
    <div className="bg-background flex min-h-screen">
      <AdminSidebar />
      <ManageVisitorsPage />
    </div>
  );
}