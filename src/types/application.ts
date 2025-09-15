// src/types/application.ts

export interface ApplicationFormData {
  // Personal Information
  name: string;
  surname: string;
  email: string;
  phone: string;
  
  // Demographics
  major: 'CPE' | 'SKE' | '';
  educationLevel: string;
  
  // Files
  resume: File | null;
  
  // Skills
  softSkills: string;
  
  // Dynamic Questions (from job posting)
  questions: ApplicationQuestion[];
  
  // Programming Languages
  programmingLanguages: ProgrammingLanguage[];
}

export interface ApplicationQuestion {
  id: string;
  question: string;
  answer: string;
  type: 'text' | 'select' | 'multiselect';
  options?: string[];
  required?: boolean;
}

export interface ProgrammingLanguage {
  name: string;
  selected: boolean;
}

export interface JobWithQuestions {
  id: number;
  title: string;
  company: string;
  location: string;
  logoPath: string;
  tags?: string[];
  description?: string;
  postedDate?: string;
  questions?: ApplicationQuestion[];
}

export const EDUCATION_LEVELS = [
  'Year 1',
  'Year 2', 
  'Year 3',
  'Year 4',
  'Not for study',
  'Master Degree',
  'PhD'
] as const;

export const PROGRAMMING_LANGUAGES = [
  'React',
  'C#',
  'HTML/CSS',
  'Java',
  'JavaScript',
  'Vue.js',
  'PHP',
  'Python',
  'Node.js'
] as const;