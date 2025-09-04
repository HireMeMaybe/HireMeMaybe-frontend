// src/features/admin/components/DashboardStats.tsx
"use client";

import { Card } from "@/components/ui/card";

interface StatCardProps {
  number: string;
  label: string;
  subtitle: string;
  color: "orange" | "red" | "green" | "blue";
}

function StatCard({ number, label, subtitle, color }: StatCardProps) {
  const colorClasses = {
    orange: "border-t-yellow-warning",
    red: "border-t-red-reject", 
    green: "border-t-primary-green",
    blue: "border-t-primary-green"
  };

  const textColors = {
    orange: "text-yellow-warning",
    red: "text-red-reject",
    green: "text-primary-green", 
    blue: "text-primary-green"
  };

  return (
    <Card className={`bg-very-dark-gray border-zinc-700 border-t-4 ${colorClasses[color]} p-6 h-32`}>
      <div className="flex flex-col justify-between h-full">
        <div>
          <h3 className={`text-4xl font-bold ${textColors[color]} mb-1`}>
            {number}
          </h3>
          <p className="text-white font-semibold text-lg">
            {label}
          </p>
        </div>
        <p className="text-gray-400 text-sm">
          {subtitle}
        </p>
      </div>
    </Card>
  );
}

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      <StatCard
        number="12"
        label="Pending Verifications"
        subtitle="Companies awaiting approval"
        color="orange"
      />
      
      <StatCard
        number="5"
        label="Open Reports"
        subtitle="Requiring review"
        color="red"
      />
      
      <StatCard
        number="248"
        label="Verified Companies"
        subtitle="Active on platform"
        color="green"
      />
      
      <StatCard
        number="479"
        label="Active Students"
        subtitle="CPSK members"
        color="blue"
      />
    </div>
  );
}