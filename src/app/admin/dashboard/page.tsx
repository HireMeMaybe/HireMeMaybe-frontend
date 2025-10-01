'use client';

import { AdminSidebar, DashboardStats } from '@/features/admin';

export default function AdminDashboard() {
  return (
    <div className="bg-background flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="ml-64 flex-1">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Overview of system status and pending tasks</p>
          </div>

          <DashboardStats />
        </div>
      </div>
    </div>
  );
}
