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
  softSkills: string[]; // Change from string to string[]
  
  // Dynamic Questions (from job posting)
  questions: ApplicationQuestion[];
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
  // Application form settings
  includeDefaultQuestions?: boolean;
  includeCustomQuestions?: boolean;
  customQuestionsLink?: string;
}

export const DEFAULT_QUESTIONS: ApplicationQuestion[] = [
  {
    id: "default_q1",
    question: "Which of the following statements best describes your right to work in Thailand?",
    answer: "",
    type: "select",
    options: [
      "I am a Thai citizen",
      "I have a valid work permit", 
      "I am authorized to work",
      "I require sponsorship"
    ],
    required: true
  },
  {
    id: "default_q2", 
    question: "What's your expected monthly basic salary?",
    answer: "",
    type: "select",
    options: [
      "Less than 30,000 THB",
      "30,000 - 50,000 THB",
      "50,000 - 80,000 THB", 
      "80,000+ THB"
    ],
    required: true
  },
  {
    id: "default_q3",
    question: "How many years' experience do you have as a Software Engineer?",
    answer: "",
    type: "select",
    options: [
      "No experience",
      "Less than 1 year",
      "1-2 years",
      "3-5 years", 
      "5+ years"
    ],
    required: true
  },
  {
    id: "default_q4",
    question: "Which of the following programming languages are you experienced in?",
    answer: "",
    type: "multiselect",
    options: [
      "C/C++",
      "C#", 
      "HTML/CSS",
      "Java",
      "JavaScript",
      "TypeScript",
      "PHP",
      "Python",
      "Flutter"
    ],
    required: true
  }
];

export const EDUCATION_LEVELS = [
  'Year 1',
  'Year 2', 
  'Year 3',
  'Year 4',
  'Not for study',
  'Master Degree',
  'PhD'
] as const;



