export interface DashboardStats {
  pendingVerifications: number;
  openReports: number;
  verifiedCompanies: number;
  activeStudents: number;
}

export interface PendingCompany {
  id: string;
  name: string;
  email: string;
  submittedAt: Date;
  industry: string;
}

export interface Report {
  id: string;
  reportedBy: string;
  reportedEntity: string;
  reason: string;
  submittedAt: Date;
  status: "pending" | "reviewed" | "resolved";
}

export interface AdminNavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  isActive: boolean;
}