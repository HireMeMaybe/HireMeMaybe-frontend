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

export interface ApplicationCpskUser {
  id?: string;
  first_name?: string;
  last_name?: string;
  program?: string | null;
  year?: string | null;
  resume_id?: number | null;
  soft_skill?: string[] | null;
  user?: {
    createdAt?: string;
    deletedAt?: { time?: string; valid?: boolean } | null;
    email?: string;
    id?: string;
    profile_picture?: string | null;
    punishment?: { at?: string; end?: string; type?: string } | null;
    role?: string;
    tel?: string;
    updatedAt?: string;
    username?: string;
  };
  User?: {
    CreatedAt?: string;
    DeletedAt?: { time?: string; valid?: boolean } | null;
    UpdatedAt?: string;
    email?: string | null;
    id?: string;
    profile_picture?: string | null;
    punishment?: { at?: string; end?: string; type?: string } | null;
    role?: string | null;
    tel?: string | null;
    username?: string | null;
  };
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
  cpsk_user?: ApplicationCpskUser | null;
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
  user_apply?: boolean | null;
  include_default_form?: boolean;
  include_custom_form?: boolean;
  custom_form_link?: string | null;
  includeDefaultForm?: boolean;
  includeCustomForm?: boolean;
  customFormLink?: string | null;
  default_form?: boolean;
  custom_form?: boolean;
  defaultForm?: boolean;
  customForm?: boolean;
  optional_forms?: string[] | null;
  optionalForms?: string[] | null;
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
  user_apply?: boolean | null;
}

type JobSearchResponse = JobPostSummary[];

interface JobPostCreateData {
  title: string;
  desc: string;
  exp_lvl: string;
  location: string;
  type: string;
  req: string;
  tags: string[];
  expiring?: string;
  salary?: string;
  default_form?: boolean;
  optional_forms?: string[] | null;
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
      const payload = {
        title: data.title,
        desc: data.desc,
        exp_lvl: data.exp_lvl,
        location: data.location,
        type: data.type,
        req: data.req,
        tags: data.tags,
        expiring: data.expiring,
        salary: data.salary,
        default_form: data.default_form,
        optional_forms: data.optional_forms,
      };
      return await apiClient.post<JobPost>('/jobpost', payload);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to create job post: ${error.message}`);
      }
      throw new Error('Failed to create job post');
    }
  }

  /**
   * Update a job post (PATCH)
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
