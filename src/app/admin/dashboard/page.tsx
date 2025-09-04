"use client";

import { AdminSidebar, DashboardStats } from "@/features/admin/";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Overview of system status and pending tasks</p>
          </div>
          
          <DashboardStats />
        </div>
      </div>
    </div>
  );
}