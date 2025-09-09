export interface JobPostFormData {
  openingPosition: string;
  description: string;
  requirements: string;
  workLocation: string;
  hiringType: string;
  salary?: string;
  experienceLevel: string;
  tags?: string;
  postTime?: string;
  expiringTime?: string;
  includeDefaultForm: boolean;
  includeCustomForm: boolean;
  customFormLink?: string;
}

export interface JobPostResult {
  success: boolean;
  message: string;
  data?: {
    id: string;
    title: string;
  };
  errors?: {
    field: string;
    message: string;
  }[];
}

export const HIRING_TYPES = [
  "Full-time",
  "Part-time", 
  "Contract",
  "Internship",
  "Freelance"
] as const;

export const EXPERIENCE_LEVELS = [
  "Entry Level",
  "Junior",
  "Mid-Level",
  "Senior",
  "Lead",
  "Executive"
] as const;

export type HiringType = typeof HIRING_TYPES[number];
export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number];