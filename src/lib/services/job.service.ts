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
  applications: JobPostApplication[];
}

interface JobSearchParams {
  query?: string;
  location?: string;
  type?: string;
  page?: number;
  limit?: number;
}

interface JobSearchResponse {
  jobs: JobPost[];
  total: number;
  page: number;
  totalPages: number;
}

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
}

export class JobService {
  /**
   * Search/filter jobs
   */
  static async searchJobs(params: JobSearchParams = {}): Promise<JobSearchResponse> {
    try {
      const queryString = new URLSearchParams(
        Object.entries(params)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ).toString();

      const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';
      return await apiClient.get<JobSearchResponse>(endpoint, { requireAuth: false });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to search jobs: ${error.message}`);
      }
      throw new Error('Failed to search jobs');
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
      return await apiClient.post<JobPost>('/jobpost', data);
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
