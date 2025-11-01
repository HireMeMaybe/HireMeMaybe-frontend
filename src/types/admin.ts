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
  status: UserStatus;
  userId?: string;
}

// Backend API response types for company management
export interface CompanyUser {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  banner_id: number | null;
  id: string;
  industry: string;
  logo_id: number | null;
  name: string;
  overview: string;
  size: string;
  user_id: string;
  verified_status: string;
  User?: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    email: string;
    first_name: string;
    id: string;
    last_name: string;
    password: string;
    profile_picture: string;
    tel: string;
    punishment?: PunishmentInfo;
  };
  job_post?: Array<{
    id: number;
    title: string;
    company_id: string;
    desc: string;
    exp_lvl: string;
    expiring: string;
    location: string;
    post_time: string;
    req: string;
    salary: string;
    tags: string[];
    type: string;
  }>;
}

export interface VisitorAccount {
  id: string;
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
