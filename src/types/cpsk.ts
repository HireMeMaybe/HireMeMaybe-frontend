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

export interface CPSKUserResponse {
  id: string;
  first_name: string;
  last_name: string;
  program: string | null;
  year: string | null;
  resume_id: number | null;
  soft_skill: string[];
  User: {
    id: string;
    email: string;
    tel: string;
    username: string;
    profile_picture: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: {
      time: string;
      valid: boolean;
    } | null;
    punishment?: {
      type: 'ban' | 'suspend';
      at?: string;
      end?: string;
    };
  };
  applications?: Array<{
    id: number;
    cpsk_id: string;
    post_id: number;
    answer_id: number;
    resume_id: number;
    status: string;
    applied_at: string;
    answer: {
      id: number;
      programming_languages: string[];
      year_of_experience: number;
      expected_salary: string;
      right_to_work: string;
    };
  }>;
}