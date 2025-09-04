"use client";

import { Card } from "@/components/ui/card";
import { useAdminData } from "@/features/admin/hooks/useAdminData";

interface StatCardProps {
  readonly number: string | number;
  readonly label: string;
  readonly subtitle: string;
  readonly color: "orange" | "red" | "green" | "blue";
}

function StatCard({ number, label, subtitle, color }: StatCardProps) {
  const colorClasses = {
    orange: "border-t-yellow-warning",
    red: "border-t-red-reject", 
    green: "border-t-primary-green",
    blue: "border-t-sky-blue"
  };

  const textColors = {
    orange: "text-yellow-warning",
    red: "text-red-reject",
    green: "text-primary-green", 
    blue: "text-sky-blue"
  };

  return (
    <Card className={`bg-very-dark-gray border-zinc-700 border-t-3 ${colorClasses[color]} p-6 h-38`}>
      <div className="flex flex-col justify-between h-full">
        <div>
          <h3 className={`text-4xl font-bold ${textColors[color]} mb-2`}>
            {number}
          </h3>
          <p className="text-white font-semibold text-lg">
            {label}
          </p>
        </div>
        <p className="text-lighter-gray-text text-sm">
          {subtitle}
        </p>
      </div>
    </Card>
  );
}

export function DashboardStats() {
  const { stats, isLoading } = useAdminData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-text">Loading stats...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      <StatCard
        number={stats.pendingVerifications}
        label="Pending Verifications"
        subtitle="Companies awaiting approval"
        color="orange"
      />
      
      <StatCard
        number={stats.openReports}
        label="Open Reports"
        subtitle="Requiring review"
        color="red"
      />
      
      <StatCard
        number={stats.verifiedCompanies}
        label="Verified Companies"
        subtitle="Active on platform"
        color="green"
      />
      
      <StatCard
        number={stats.activeStudents}
        label="Active CPSK"
        subtitle="CPSK members"
        color="blue"
      />
    </div>
  );
}