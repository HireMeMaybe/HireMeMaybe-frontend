/**
 * Application Service
 * Handles job application submissions
 */

import { apiClient, ApiError } from './api-client';

interface ApplicationSubmitResponse {
  message: string;
  applicationId?: string;
}

interface ApplicationSubmitData {
  answer: {
    expected_salary: string;
    programming_languages: string[];
    right_to_work: string;
    year_of_experience: number;
  };
  cpsk_id: string;
  post_id: number;
  resume_id: number;
  status: string;
}

export class ApplicationService {
  /**
   * Submit a job application
   */
  static async submitApplication(
    jobId: number,
    cpskId: string,
    resumeId: number,
    data: {
      expectedSalary: string;
      programmingLanguages: string[];
      rightToWork: string;
      yearOfExperience: number;
      status?: string;
    }
  ): Promise<ApplicationSubmitResponse> {
    try {
      const payload: ApplicationSubmitData = {
        answer: {
          expected_salary: data.expectedSalary,
          programming_languages: data.programmingLanguages,
          right_to_work: data.rightToWork,
          year_of_experience: data.yearOfExperience,
        },
        cpsk_id: cpskId,
        post_id: jobId,
        resume_id: resumeId,
        status: data.status || 'pending',
      };

      return await apiClient.post<ApplicationSubmitResponse>('/application', payload, {
        requireAuth: true,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to submit application: ${error.message}`);
      }
      throw new Error('Failed to submit application');
    }
  }

  /**
   * Get application details
   */
  static async getApplication(applicationId: string): Promise<{
    id: string;
    jobId: string;
    jobTitle: string;
    status: string;
    submittedAt: string;
  }> {
    try {
      return await apiClient.get(`/applications/${applicationId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch application: ${error.message}`);
      }
      throw new Error('Failed to fetch application');
    }
  }

  /**
   * Get user's application history
   */
  static async getApplicationHistory(): Promise<
    Array<{
      id: string;
      jobId: string;
      jobTitle: string;
      company: string;
      status: string;
      submittedAt: string;
    }>
  > {
    try {
      return await apiClient.get('/applications/history');
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch application history: ${error.message}`);
      }
      throw new Error('Failed to fetch application history');
    }
  }

  /**
   * Withdraw an application
   */
  static async withdrawApplication(applicationId: string): Promise<{ message: string }> {
    try {
      return await apiClient.delete(`/applications/${applicationId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to withdraw application: ${error.message}`);
      }
      throw new Error('Failed to withdraw application');
    }
  }
}
