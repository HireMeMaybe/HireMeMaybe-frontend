'use client';

import { AdminSidebar, ManageCPSKPage } from '@/features/admin';

export default function ManageCPSKRoute() {
  return (
    <div className="bg-background flex min-h-screen">
      <AdminSidebar />
      <ManageCPSKPage />
    </div>
  );
}
