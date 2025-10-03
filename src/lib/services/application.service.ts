/**
 * Application Service
 * Handles job application submissions
 */

import { apiClient, ApiError } from './api-client';
import type { ApplicationFormData } from '@/types/application';

interface ApplicationSubmitResponse {
  message: string;
  applicationId?: string;
}

export class ApplicationService {
  /**
   * Submit a job application
   */
  static async submitApplication(
    jobId: string,
    data: ApplicationFormData
  ): Promise<ApplicationSubmitResponse> {
    try {
      const formData = new FormData();

      // Add basic fields
      formData.append('name', data.name);
      formData.append('surname', data.surname);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('major', data.major);
      formData.append('educationLevel', data.educationLevel);

      // Add resume if provided
      if (data.resume) {
        formData.append('resume', data.resume);
      }

      // Add soft skills
      if (data.soft_skill && data.soft_skill.length > 0) {
        data.soft_skill.forEach((skill) => {
          formData.append('softSkills', skill);
        });
      }

      // Add questions if provided
      if (data.questions && data.questions.length > 0) {
        formData.append('questions', JSON.stringify(data.questions));
      }

      return await apiClient.post<ApplicationSubmitResponse>(`/jobs/${jobId}/apply`, formData, {
        useFormData: true,
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
