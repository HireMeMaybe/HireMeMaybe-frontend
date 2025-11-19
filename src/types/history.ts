export interface Answer {
  id: number;
  expected_salary?: string;
  experience_level?: string;
  year_of_experience?: number;
  right_to_work?: string;
  programming_languages?: string[];
  tags?: string[];
}

export interface JobPost {
  id: number;
  company_id: string;
  title: string;
  desc: string;
  req: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Onsite' | 'Hybrid' | 'Remote';
  salary: string;
  tags: string[];
  post_time: string;
}

export interface Application {
  id: number;
  applied_at: string;
  status: 'pending' | 'in consideration' | 'rejected';
  cpsk_id: string;
  post_id: number;
  answer_id: number;
  answer: Answer;
  resume_id: number;
  // Additional fields we might need to fetch from job post
  jobTitle?: string;
  companyName?: string;
  location?: string;
  jobType?: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Onsite' | 'Hybrid' | 'Remote';
  companyLogo?: string;
}

export interface User {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  tel: string | null;
  email: string;
  id: string;
  username: string;
  profile_picture: string;
}

export interface HistoryProfile {
  id: string;
  User: User;
  first_name: string;
  last_name: string;
  program: string | null;
  year: string | null;
  soft_skill: string | null;
  resume_id: number;
  applications: Application[];
}

export interface JobApplicationHistory {
  id: number;
  jobTitle: string;
  companyName: string;
  location: string;
  status: 'pending' | 'in consideration' | 'rejected';
  appliedDate: string;
  lastUpdated: string;
  jobType?: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Onsite' | 'Hybrid' | 'Remote';
  companyLogo?: string;
  answer?: Answer;
  postId?: number;
}

export interface HistoryFilters {
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  jobType?: string[];
  sortBy?: 'appliedDate' | 'lastUpdated' | 'companyName' | 'jobTitle';
  sortOrder?: 'asc' | 'desc';
}

export interface HistoryPagination {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}
