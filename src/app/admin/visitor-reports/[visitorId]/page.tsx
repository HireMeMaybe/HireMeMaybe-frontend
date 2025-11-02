'use client';

import { AdminSidebar, VisitorReportsPage } from '@/features/admin';
import { use } from 'react';

export default function VisitorReportsRoute({
  params,
}: {
  params: Promise<{ visitorId: string }>;
}) {
  const { visitorId } = use(params);

  return (
    <div className="bg-background flex min-h-screen">
      <AdminSidebar />
      <VisitorReportsPage visitorId={visitorId} />
    </div>
  );
}
