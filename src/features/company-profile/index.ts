// src/features/company-profile/index.ts
export { default as CompanyProfile } from './components/CompanyProfile';
export { default as CompanyHeader } from './components/CompanyHeader';
export { default as CompanyAbout } from './components/CompanyAbout';
export { default as JobOpenings } from './components/JobOpenings';
export { default as JobCard } from './components/JobCard';
export { useCompanyProfile } from './hooks/useCompanyProfile';
export type { Company, JobOpening, CompanyProfileProps } from '@/types/company';