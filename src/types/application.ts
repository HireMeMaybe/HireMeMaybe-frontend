export interface Application {
  id: number;
  jobId: number;
  candidateName: string;
  university: string;
  program: string; // CPE, SKE
  skills: string[];
  appliedDate: string;
  profilePicture?: string;
  resumeUrl?: string;
  coverLetter?: string;
  gpa?: number;
  year?: string; // 1st year, 2nd year, etc.
}

export interface JobApplicationsProps {
  jobId: number;
  companyId: string;
}

export interface ApplicationFilters {
  status?: string;
  program?: string;
  skills?: string[];
  sortBy?: 'date' | 'name' | 'gpa';
  sortOrder?: 'asc' | 'desc';
}