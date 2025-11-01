'use client';

import { Card } from '@/components/ui/card';
import { useAdminData } from '@/features/admin/hooks/useAdminData';

interface StatCardProps {
  readonly number: string | number;
  readonly label: string;
  readonly subtitle: string;
  readonly color: 'purple' | 'red' | 'green' | 'blue' | 'cyan';
  readonly icon?: string;
}

function StatCard({ number, label, subtitle, color, icon }: StatCardProps) {
  const colorClasses = {
    purple: 'border-t-purple-500 bg-purple-500/5',
    red: 'border-t-red-reject bg-red-500/5',
    green: 'border-t-primary-green bg-green-500/5',
    blue: 'border-t-blue-500 bg-blue-500/5',
    cyan: 'border-t-cyan-500 bg-cyan-500/5',
  };

  const textColors = {
    purple: 'text-purple-500',
    red: 'text-red-reject',
    green: 'text-primary-green',
    blue: 'text-blue-500',
    cyan: 'text-cyan-500',
  };

  return (
    <Card
      className={`border-t-4 border-zinc-700 ${colorClasses[color]} p-6 transition-all hover:scale-105 hover:shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className={`text-5xl font-bold ${textColors[color]}`}>{number}</h3>
          </div>
          <p className="mb-1 text-lg font-semibold text-white">{label}</p>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      </div>
    </Card>
  );
}

export function DashboardStats() {
  const { stats, isLoading, error } = useAdminData();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-center">
          <div className="border-primary-green inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-red-reject">Failed to load stats: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          number={stats.totalJobPosts}
          label="Total Job Posts"
          subtitle="Active job postings"
          color="purple"
          icon="💼"
        />

        <StatCard
          number={stats.openReports}
          label="Open Reports"
          subtitle="Pending review"
          color="red"
          icon="⚠️"
        />

        <StatCard
          number={stats.verifiedCompanies}
          label="Verified Companies"
          subtitle="Active on platform"
          color="green"
          icon="✓"
        />

        <StatCard
          number={stats.activeCPSK}
          label="Active CPSK"
          subtitle="CPSK members"
          color="blue"
          icon="👨‍🎓"
        />

        <StatCard
          number={stats.totalVisitors}
          label="Total Visitors"
          subtitle="Registered visitors"
          color="cyan"
          icon="👥"
        />
      </div>

      {/* Summary Section */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-900/40 p-6">
        <h2 className="text-primary-green mb-4 text-xl font-semibold">Quick Summary</h2>
        <div className="grid grid-cols-1 gap-4 text-gray-300 md:grid-cols-2">
          <div className="flex items-center justify-between rounded bg-zinc-800/50 p-3">
            <span>Total Users (CPSK + Visitors)</span>
            <span className="font-semibold text-white">
              {stats.activeCPSK + stats.totalVisitors}
            </span>
          </div>
          <div className="flex items-center justify-between rounded bg-zinc-800/50 p-3">
            <span>Total Platform Activity</span>
            <span className="font-semibold text-white">
              {stats.totalJobPosts + stats.verifiedCompanies} items
            </span>
          </div>
          <div className="flex items-center justify-between rounded bg-zinc-800/50 p-3">
            <span>Reports Status</span>
            <span
              className={`font-semibold ${stats.openReports > 0 ? 'text-yellow-warning' : 'text-primary-green'}`}
            >
              {stats.openReports > 0 ? `${stats.openReports} pending` : 'All clear'}
            </span>
          </div>
          <div className="flex items-center justify-between rounded bg-zinc-800/50 p-3">
            <span>Platform Health</span>
            <span className="text-primary-green font-semibold">Operational ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
