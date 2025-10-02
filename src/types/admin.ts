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

export type JobPostItem = {
  id: number;
  title: string;
  company: string;
  type: 'Internship' | 'Full-time' | 'Part-time' | 'Contract';
  posted: string;
  reports: number;
};