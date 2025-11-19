export interface CompanyRegistrationResult {
  success: boolean;
  message: string;
  data?: {
    id: string;
    companyName: string;
  };
  errors?: {
    field: string;
    message: string;
  }[];
}

export const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'other', label: 'Other' },
] as const;

export const COMPANY_SIZE_OPTIONS = [
  { value: '1-10 employees', label: '1-10 employees' },
  { value: '11-50 employees', label: '11-50 employees' },
  { value: '51-200 employees', label: '51-200 employees' },
  { value: '201-500 employees', label: '201-500 employees' },
  { value: '501-1000 employees', label: '501-1000 employees' },
] as const;

// Company Profile Types
export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  location: string;
  email: string;
  phone: string;
  logoUrl?: string;
  bannerUrl?: string;
  about: string;
  website?: string;
}

export interface JobOpening {
  id: number;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  applicationCount?: number;
  imageUrl?: string;
  description?: string;
  requirements?: string[];
  salary?: string;
  tags?: string[];
  expLevel?: string;
  expiring?: string;
  companyId?: string;
  rawApplications?: unknown[];
  postedDate: string;
}

export interface CompanyProfileProps {
  companyId: string;
  viewType: 'owner' | 'company' | 'cpsk';
}

import type { BackendUser, BackendUserPascal } from './user';

export interface BackendCompanyApplicationUser {
  id?: string;
  first_name?: string;
  last_name?: string;
  program?: string | null;
  year?: string | null;
  resume_id?: number | null;
  soft_skill?: string[] | null;
  user?: BackendUser | BackendUserPascal | null;
}

// Backend response shape for company profile endpoints (documented here for clarity)
export interface BackendCompanyResponse {
  banner_id?: number;
  id?: string | number;
  industry?: string;
  job_post?: Array<{
    applications?: Array<{
      answer?: {
        expected_salary?: string;
        id?: number;
        programming_languages?: string[];
        right_to_work?: string;
        year_of_experience?: number;
      };
      answer_id?: number;
      applied_at?: string;
      cpsk_id?: string;
      cpsk_user?: BackendCompanyApplicationUser | null;
      id?: number;
      post_id?: number;
      resume_id?: number;
      status?: string;
    }>;
    company_id?: string;
    desc?: string;
    exp_lvl?: string;
    expiring?: string;
    id?: number;
    location?: string;
    post_time?: string;
    req?: string | string[];
    salary?: string;
    tags?: string[];
    title?: string;
    type?: string;
  }>;
  logo_id?: number;
  name?: string;
  overview?: string;
  size?: string;
  // account/user info nested under `user` (lowercase) or `User` (Pascal case)
  user?: BackendUser | BackendUserPascal;
  User?: BackendUser | BackendUserPascal;
  verified_status?: string;
  // legacy/alternate top-level contact fields
  email?: string;
  tel?: string;
  phone?: string;
  contact?: string;
  location?: string;
  website?: string;
}
