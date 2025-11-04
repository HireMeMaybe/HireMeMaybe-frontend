'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useAdminData } from '@/features/admin/hooks/useAdminData';

interface StatCardProps {
  readonly number: string | number;
  readonly label: string;
  readonly subtitle: string;
  readonly color: 'purple' | 'red' | 'green' | 'blue' | 'cyan';
  readonly href?: string;
}

function StatCard({ number, label, subtitle, color, href }: StatCardProps) {
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

  const cardContent = (
    <Card
      className={`border-t-4 border-zinc-700 ${colorClasses[color]} p-6 transition-all hover:scale-105 hover:shadow-lg ${href ? 'cursor-pointer' : ''}`}
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

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
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

  const totalUsers = stats.activeCPSK + stats.totalVisitors;
  const totalCompanies = stats.verifiedCompanies + stats.unverifiedCompanies;
  const verificationRate =
    totalCompanies > 0 ? ((stats.verifiedCompanies / totalCompanies) * 100).toFixed(1) : '0';
  const avgJobsPerCompany =
    stats.verifiedCompanies > 0 ? (stats.totalJobPosts / stats.verifiedCompanies).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          number={stats.totalJobPosts}
          label="Total Job Posts"
          subtitle="Active job postings"
          color="blue"
          href="/admin/manage-job-posts"
        />

        <StatCard
          number={stats.openReports}
          label="Open Reports"
          subtitle="Pending review"
          color="red"
          href="/admin/report"
        />

        <StatCard
          number={stats.verifiedCompanies}
          label="Verified Companies"
          subtitle="Active on platform"
          color="green"
          href="/admin/manage-company"
        />

        <StatCard
          number={stats.activeCPSK}
          label="Active CPSK"
          subtitle="CPSK members"
          color="cyan"
          href="/admin/manage-cpsk"
        />

        <StatCard
          number={stats.totalVisitors}
          label="Total Visitors"
          subtitle="Registered visitors"
          color="green"
          href="/admin/manage-visitors"
        />

        <StatCard
          number={stats.unverifiedCompanies}
          label="Unverified Companies"
          subtitle="Companies rejected by AI"
          color="purple"
          href="/admin/company-verification"
        />
      </div>

      {/* Summary Section */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-900/40 p-6">
        <h2 className="text-primary-green mb-4 text-xl font-semibold">Platform Analytics</h2>
        <div className="grid grid-cols-1 gap-4 text-gray-300 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col rounded bg-zinc-800/50 p-4">
            <span className="mb-2 text-sm text-gray-400">Total Platform Users</span>
            <span className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</span>
            <span className="mt-1 text-xs text-gray-500">CPSK + Visitors combined</span>
          </div>
          <div className="flex flex-col rounded bg-zinc-800/50 p-4">
            <span className="mb-2 text-sm text-gray-400">Company Verification Rate</span>
            <span className="text-primary-green text-2xl font-bold">{verificationRate}%</span>
            <span className="mt-1 text-xs text-gray-500">
              {stats.verifiedCompanies} of {totalCompanies} companies
            </span>
          </div>
          <div className="flex flex-col rounded bg-zinc-800/50 p-4">
            <span className="mb-2 text-sm text-gray-400">Avg Jobs per Company</span>
            <span className="text-2xl font-bold text-blue-500">{avgJobsPerCompany}</span>
            <span className="mt-1 text-xs text-gray-500">Job posts per verified company</span>
          </div>
          <div className="flex flex-col rounded bg-zinc-800/50 p-4">
            <span className="mb-2 text-sm text-gray-400">Action Required</span>
            <span
              className={`text-2xl font-bold ${stats.openReports > 0 || stats.unverifiedCompanies > 0 ? 'text-yellow-warning' : 'text-primary-green'}`}
            >
              {stats.openReports + stats.unverifiedCompanies}
            </span>
            <span className="mt-1 text-xs text-gray-500">
              {stats.openReports} reports + {stats.unverifiedCompanies} verifications
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
