/**
 * CPSK Service
 * Handles all CPSK-related API calls (profile, registration)
 */

import { apiClient, ApiError } from './api-client';
import type { ProfileData } from '@/types/cpsk';
import { z } from 'zod';

// Validation schemas
const cpskRegistrationSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  program: z.enum(['CPE', 'SKE'], { message: 'Program is required' }),
  year: z.string().min(1, 'Year is required'),
  soft_skill: z.array(z.string()).optional(),
});

export type CpskRegistrationData = z.infer<typeof cpskRegistrationSchema>;

interface CpskProfileUpdateData {
  first_name: string;
  last_name: string;
  User: {
    tel: string;
  };
  soft_skill: string[];
  program: string;
  year: string;
}

export class CpskService {
  /**
   * Get CPSK profile data
   */
  static async getProfile(): Promise<ProfileData> {
    try {
      return await apiClient.get<ProfileData>('/cpsk/myprofile');
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch profile: ${error.message}`);
      }
      throw new Error('Failed to fetch profile');
    }
  }

  /**
   * Update CPSK profile
   */
  static async updateProfile(data: CpskProfileUpdateData): Promise<ProfileData> {
    try {
      return await apiClient.put<ProfileData>('/cpsk/profile', data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Register new CPSK (with optional resume)
   */
  static async register(
    data: CpskRegistrationData,
    resume?: File
  ): Promise<{ message: string; data: any }> {
    try {
      // Validate data
      const validatedData = cpskRegistrationSchema.parse(data);

      // Create FormData if resume is provided
      const formData = new FormData();
      formData.append('first_name', validatedData.first_name);
      formData.append('last_name', validatedData.last_name);
      formData.append('email', validatedData.email);
      formData.append('phone', validatedData.phone);
      formData.append('program', validatedData.program);
      formData.append('year', validatedData.year);

      if (validatedData.soft_skill) {
        validatedData.soft_skill.forEach((skill) => formData.append('soft_skill', skill));
      }

      if (resume) {
        // Validate resume
        if (resume.type !== 'application/pdf') {
          throw new Error('Resume must be a PDF file');
        }
        if (resume.size > 10 * 1024 * 1024) {
          throw new Error('Resume must be 10 MB or smaller');
        }
        formData.append('resume', resume, resume.name);
      }

      return await apiClient.post('/cpsk/register', formData, { useFormData: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        throw new Error(firstError.message);
      }
      if (error instanceof ApiError) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Registration failed');
    }
  }

  /**
   * Upload or update resume
   */
  static async uploadResume(resume: File): Promise<{ message: string }> {
    try {
      // Validate resume
      if (resume.type !== 'application/pdf') {
        throw new Error('Resume must be a PDF file');
      }
      if (resume.size > 10 * 1024 * 1024) {
        throw new Error('Resume must be 10 MB or smaller');
      }

      const formData = new FormData();
      formData.append('resume', resume, resume.name);

      return await apiClient.post('/cpsk/profile/resume', formData, { useFormData: true });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to upload resume: ${error.message}`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to upload resume');
    }
  }

  /**
   * Preview/download resume by file ID
   * @param fileId - The resume file ID to preview/download
   */
  static async previewResume(fileId?: number): Promise<Blob> {
    try {
      // Import getSession dynamically to get auth token
      const { getSession } = await import('next-auth/react');
      const session = await getSession();

      if (!session?.backendToken) {
        throw new Error('No authentication token found. Please sign in again.');
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL is not configured');
      }

      // If no fileId provided, try to get from session/profile
      let resumeFileId = fileId;
      if (!resumeFileId) {
        // Try to get profile data to extract resume_id
        const profileResponse = await fetch(`${backendUrl}/cpsk/myprofile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.backendToken}`,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          resumeFileId = profileData.resume_id;
        }
      }

      if (!resumeFileId) {
        throw new Error('No resume file ID available. Please upload a resume first.');
      }

      console.log('Fetching resume for preview from:', `${backendUrl}/file/${resumeFileId}`);

      const response = await fetch(`${backendUrl}/file/${resumeFileId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.backendToken}`,
        },
      });

      console.log('Resume fetch response status:', response.status);

      if (!response.ok) {
        // Try to get detailed error message from backend
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If not JSON, try text
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch {
            // Ignore
          }
        }
        throw new Error(`Failed to preview resume: ${errorMessage}`);
      }

      const blob = await response.blob();
      console.log('Resume blob size:', blob.size, 'type:', blob.type);
      return blob;
    } catch (error) {
      console.error('Error in previewResume:', error);
      if (error instanceof Error) {
        throw error; // Re-throw with original message
      }
      throw new Error('Failed to preview resume: Unknown error');
    }
  }

  /**
   * Download resume by file ID (alias for previewResume for backward compatibility)
   * @param fileId - The resume file ID to download
   */
  static async downloadResume(fileId?: number): Promise<Blob> {
    return this.previewResume(fileId);
  }

  /**
   * Delete resume
   */
  static async deleteResume(): Promise<{ message: string }> {
    try {
      return await apiClient.delete('/cpsk/profile/resume');
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to delete resume: ${error.message}`);
      }
      throw new Error('Failed to delete resume');
    }
  }
}
