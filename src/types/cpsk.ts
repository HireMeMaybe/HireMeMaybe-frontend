export interface CpskRegistrationResult {
  success: boolean;
  message: string;
  id?: string;
  errors?: {
    field: string;
    message: string;
  }[];
}

import type { BackendUserPascal } from '../types/user';

export interface ProfileData {
  id?: string;
  User?: BackendUserPascal;
  first_name?: string;
  last_name?: string;
  program?: string | null;
  year?: string | number | null;
  profile_picture?: string | null;
  soft_skill?: string[];
  resume_id?: number | null;
}

export const MAJOR_OPTIONS = [
  { value: 'CPE', label: 'CPE' },
  { value: 'SKE', label: 'SKE' },
] as const;

export const EDUCATION_OPTIONS = [
  { value: 'Year 1', label: 'Year 1' },
  { value: 'Year 2', label: 'Year 2' },
  { value: 'Year 3', label: 'Year 3' },
  { value: 'Year 4', label: 'Year 4' },
  { value: 'Year 5 or above', label: 'Year 5 or above' },
  { value: "Master's Degree", label: "Master's Degree" },
  { value: 'PhD', label: 'PhD' },
  { value: 'Graduate (Alumni)', label: 'Graduate (Alumni)' },
] as const;
