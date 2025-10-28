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
  status: 'pending' | 'reviewed' | 'resolved';
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

export type UserStatus = 'Active' | 'Suspended' | 'Banned';

export interface CPSKAccount {
  id: string;
  name: string;
  email: string;
  major: string;
  year: string;
  status: UserStatus;
  tel?: string;
  first_name?: string;
  last_name?: string;
  program?: string;
  punishment?: PunishmentInfo;
}

export type PunishmentType = 'ban' | 'suspend';

export interface PunishmentInfo {
  type: PunishmentType;
  at?: string; // ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ
  end?: string; // ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ (empty means permanent)
}

export interface PunishmentStruct {
  type: PunishmentType;
  at?: string;
  end?: string;
}

export interface ManagedCompany {
  id: number;
  name: string;
  location: string;
  industry: string;
  verifiedDate: string;
  activePosts: number;
  reports: number;
  status: UserStatus;
}

export interface VisitorAccount {
  id: number;
  name: string;
  email: string;
  reportCount: number;
  status: UserStatus;
}

export interface VisitorReport {
  id: number;
  reportedEntity: string;
  reportedEntityType: 'Job' | 'Company';
  reason: string;
  submitted: string;
  status: 'Pending' | 'Reviewed' | 'Resolved';
}