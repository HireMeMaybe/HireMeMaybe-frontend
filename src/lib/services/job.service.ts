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
  description: string;
  location: string;
  type: string;
  salary?: string;
  requirements?: string[];
  benefits?: string[];
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
   * Get job details by ID
   */
  static async getJobById(jobId: string): Promise<JobPost> {
    try {
      return await apiClient.get<JobPost>(`/jobs/${jobId}`, { requireAuth: false });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch job details: ${error.message}`);
      }
      throw new Error('Failed to fetch job details');
    }
  }

  /**
   * Create a new job post (company only)
   */
  static async createJobPost(data: JobPostCreateData): Promise<JobPost> {
    try {
      return await apiClient.post<JobPost>('/jobs', data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to create job post: ${error.message}`);
      }
      throw new Error('Failed to create job post');
    }
  }

  /**
   * Update a job post
   */
  static async updateJobPost(jobId: string, data: Partial<JobPostCreateData>): Promise<JobPost> {
    try {
      return await apiClient.put<JobPost>(`/jobs/${jobId}`, data);
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
      return await apiClient.delete(`/jobs/${jobId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to delete job post: ${error.message}`);
      }
      throw new Error('Failed to delete job post');
    }
  }

  /**
   * Get applications for a job post (company only)
   */
  static async getJobApplications(jobId: string): Promise<
    Array<{
      id: string;
      applicantName: string;
      email: string;
      status: string;
      submittedAt: string;
      resumeUrl?: string;
    }>
  > {
    try {
      return await apiClient.get(`/jobs/${jobId}/applications`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
      }
      throw new Error('Failed to fetch applications');
    }
  }

  /**
   * Get company's job posts
   */
  static async getCompanyJobs(companyId?: string): Promise<JobPost[]> {
    try {
      const endpoint = companyId ? `/companies/${companyId}/jobs` : '/jobs/my-posts';
      return await apiClient.get<JobPost[]>(endpoint);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch company jobs: ${error.message}`);
      }
      throw new Error('Failed to fetch company jobs');
    }
  }
}
