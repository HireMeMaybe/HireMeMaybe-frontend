'use client';

import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { AdminAuthGuard } from '@/features/admin/components/AdminAuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </AdminAuthProvider>
  );
}