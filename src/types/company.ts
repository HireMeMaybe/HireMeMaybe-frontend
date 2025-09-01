// src/types/company.ts
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
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "other", label: "Other" },
] as const;

export const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
] as const;

// Company Profile Types
export interface Company {
  id: string;
  name: string;
  industry: string;
  employeeCount: string;
  location: string;
  email: string;
  phone: string;
  logoUrl?: string;
  bannerUrl?: string;
  about: string;
  website?: string;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  applicationCount?: number;
  imageUrl?: string;
  description?: string;
  requirements?: string[];
  postedDate: string;
}

export interface CompanyProfileProps {
  companyId: string;
  viewType: 'student' | 'company';
}