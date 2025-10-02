'use client';

import { AdminSidebar } from '@/features/admin';
import ManageJobPostsPage from '@/features/admin/components/ManageJobPostsPage';

export default function AdminManageJobPostsRoute() {
  return (
    <div className="bg-background flex min-h-screen">
      <AdminSidebar />
      <ManageJobPostsPage />
    </div>
  );
}