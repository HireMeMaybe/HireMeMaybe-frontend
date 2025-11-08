/**
 * Job Service
 * Handles job posting and job-related API calls
 */

import { apiClient, ApiError } from './api-client';

interface JobPost {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salary?: string;
  requirements?: string[];
  benefits?: string[];
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobPostApplication {
  id: number;
  post_id: number;
  cpsk_id: string;
  answer_id: number;
  status: string;
  applied_at: string;
  resume_id: number;
  answer: {
    id: number;
    expected_salary: string;
    programming_languages: string[];
    right_to_work: string;
    year_of_experience: number;
  };
}

export interface CompanyUserAccount {
  ID?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: { Time?: string; Valid?: boolean } | null;
  tel?: string;
  email?: string;
  id?: string;
  username?: string;
  role?: string;
  punishment?: unknown;
  profile_picture?: string;
}

export interface CompanyUserDetail {
  id?: string;
  verified_status?: string;
  name?: string;
  overview?: string;
  industry?: string;
  size?: string;
  logo_id?: number | null;
  banner_id?: number | null;
  job_post?: unknown;
  User?: CompanyUserAccount;
  user?: CompanyUserAccount;
}

export interface JobPostDetail {
  id: number;
  company_id: string;
  title: string;
  desc: string;
  exp_lvl: string;
  location: string;
  type: string;
  req: string;
  salary: string;
  tags: string[];
  post_time: string;
  expiring: string;
  applications: JobPostApplication[] | null;
  company_user?: CompanyUserDetail;
}

interface JobSearchParams {
  search?: string;
  query?: string;
  type?: string;
  tag?: string;
  salary?: string;
  exp?: string;
  company?: string;
  industry?: string;
  location?: string;
  desc?: boolean;
}

export interface JobPostSummary {
  id?: number;
  company_id?: string;
  title?: string;
  desc?: string;
  exp_lvl?: string;
  location?: string;
  type?: string;
  req?: string | string[];
  salary?: string;
  tags?: string[];
  post_time?: string;
  expiring?: string;
  company?: {
    id?: string;
    name?: string;
    industry?: string;
    location?: string;
  };
}

interface JobSearchResponse {
  jobs: JobPost[];
  total: number;
  page: number;
  totalPages: number;
}

interface JobPostAnswerPayload {
  expected_salary: string;
  id: number;
  programming_languages: string[];
  right_to_work: string;
  year_of_experience: number;
}

interface JobPostCreateData {
  answer: JobPostAnswerPayload;
  cpsk_id: string;
  post_id: number;
  resume_id: number;
}

interface ApplicationResponse {
  applications: Array<{
    answer: {
      expected_salary: string;
      id: number;
      programming_languages: string[];
      right_to_work: string;
      year_of_experience: number;
    };
    answer_id: number;
    applied_at: string;
    cpsk_id: string;
    id: number;
    post_id: number;
    resume_id: number;
    status: string;
  }>;
  first_name: string;
  id: string;
  last_name: string;
  program: string;
  resume_id: number;
  soft_skill: string[];
  user: {
    createdAt: string;
    deletedAt: {
      time: string;
      valid: boolean;
    };
    email: string;
    id: string;
    profile_picture: string;
    punishment: {
      at: string;
      end: string;
      type: string;
    };
    tel: string;
    updatedAt: string;
    username: string;
  };
  year: string;
}

export class JobService {
  /**
   * Search/filter jobs
   */
  static async searchJobs(params: JobSearchParams = {}): Promise<JobSearchResponse> {
    try {
      const {
        search,
        query: searchAlias,
        type,
        tag,
        salary,
        exp,
        company,
        industry,
        location,
        desc,
      } = params;

      const queryParams = new URLSearchParams();
      const searchValue = search ?? searchAlias;

      if (searchValue) queryParams.set('search', searchValue);
      if (type) queryParams.set('type', type);
      if (tag) queryParams.set('tag', tag);
      if (salary) queryParams.set('salary', salary);
      if (exp) queryParams.set('exp', exp);
      if (company) queryParams.set('company', company);
      if (industry) queryParams.set('industry', industry);
      if (location) queryParams.set('location', location);
      if (desc !== undefined) queryParams.set('desc', desc ? 'true' : 'false');

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/jobpost?${queryString}` : '/jobpost';

      return await apiClient.get<JobSearchResponse>(endpoint, { requireAuth: true });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to search job posts: ${error.message}`);
      }
      throw new Error('Failed to search job posts');
    }
  }

  /**
   * Get job post details by ID with applications (requires authentication)
   */
  static async getJobPostById(jobPostId: string): Promise<JobPostDetail> {
    try {
      return await apiClient.get<JobPostDetail>(`/jobpost/${jobPostId}`, { requireAuth: true });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch job post details: ${error.message}`);
      }
      throw new Error('Failed to fetch job post details');
    }
  }

  /**
   * Create a new job post (company only)
   */
  static async createJobPost(data: JobPostCreateData): Promise<JobPost> {
    try {
      return await apiClient.post<JobPost>('/application', data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to create job post: ${error.message}`);
      }
      throw new Error('Failed to create job post');
    }
  }

  /**
   * Create a new application
   */
  static async createApplication(data: JobPostCreateData): Promise<ApplicationResponse> {
    try {
      return await apiClient.post<ApplicationResponse>('/application', data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to create application: ${error.message}`);
      }
      throw new Error('Failed to create application');
    }
  }

  /**
   * Update a job post
   */
  static async updateJobPost(jobId: string, data: Partial<JobPostCreateData>): Promise<JobPost> {
    try {
      return await apiClient.patch<JobPost>(`/jobpost/${jobId}`, data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to update job post: ${error.message}`);
      }
      throw new Error('Failed to update job post');
    }
  }

  /**
   * Delete a job post
   */
  static async deleteJobPost(jobId: string): Promise<{ message: string }> {
    try {
      return await apiClient.delete(`/jobpost/${jobId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to delete job post: ${error.message}`);
      }
      throw new Error('Failed to delete job post');
    }
  }
}
