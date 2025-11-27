/**
 * CPSK Service
 * Handles all CPSK-related API calls (profile, registration)
 */

import { apiClient, ApiError } from './api-client';
import type { ProfileData } from '@/types/cpsk';
import { z } from 'zod';
import { validateFile, FILE_CONFIGS } from '@/lib/utils/file-validation';

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

const buildAuthHeaderValue = (token?: string | null): string | null => {
  if (!token) return null;
  const trimmed = token.trim();
  if (!trimmed) return null;
  return /^bearer\s+/i.test(trimmed) ? trimmed : `Bearer ${trimmed}`;
};

export type CpskRegistrationData = z.infer<typeof cpskRegistrationSchema>;

interface CpskProfileUpdateData {
  first_name?: string;
  last_name?: string;
  tel?: string;
  soft_skill?: string[];
  program?: string;
  year?: string;
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
      return await apiClient.patch<ProfileData>('/cpsk/profile', data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }
      console.log('Error in updateProfile:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Register new CPSK (with optional resume)
   */
  static async register(
    data: CpskRegistrationData,
    resume?: File
  ): Promise<{ message: string; data: unknown }> {
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
   * ASVS V5.2.2: Validates file with magic bytes check
   */
  static async uploadResume(resume: File): Promise<{ message: string }> {
    try {
      // ASVS V5.2.2: Validate resume with magic bytes check
      const validation = await validateFile(resume, FILE_CONFIGS.RESUME);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid resume file');
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
   * Get authenticated session with backend token
   */
  private static async getAuthSession() {
    const { getSession } = await import('next-auth/react');
    const session = await getSession();

    if (!session?.backendToken) {
      throw new Error('No authentication token found. Please sign in again.');
    }

    return session;
  }

  /**
   * Fetch resume ID from user profile if not provided
   */
  private static async fetchResumeIdFromProfile(
    backendUrl: string,
    token: string,
    providedFileId?: number
  ): Promise<number> {
    if (providedFileId) {
      return providedFileId;
    }

    const authHeader = buildAuthHeaderValue(token);
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const profileResponse = await fetch(`${backendUrl}/cpsk/myprofile`, {
      method: 'GET',
      headers,
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      if (profileData.resume_id) {
        return profileData.resume_id;
      }
    }

    throw new Error('No resume file ID available. Please upload a resume first.');
  }

  /**
   * Extract error message from failed response
   */
  private static async extractErrorMessage(response: Response): Promise<string> {
    const errorMessage = `HTTP ${response.status}`;

    try {
      const errorData = await response.json();
      return errorData.error || errorData.message || errorMessage;
    } catch {
      try {
        const errorText = await response.text();
        if (errorText) return errorText;
      } catch {
        // Ignore
      }
    }

    return errorMessage;
  }

  /**
   * Preview/download resume by file ID
   * @param fileId - The resume file ID to preview/download
   */
  static async previewResume(fileId?: number): Promise<Blob> {
    try {
      const session = await this.getAuthSession();

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL is not configured');
      }

      const resumeFileId = await this.fetchResumeIdFromProfile(
        backendUrl,
        session.backendToken as string,
        fileId
      );

      console.log('Fetching resume for preview from:', `${backendUrl}/file/${resumeFileId}`);

      const authHeader = buildAuthHeaderValue(session.backendToken);
      const headers: Record<string, string> = {};
      if (authHeader) {
        headers.Authorization = authHeader;
      }

      const response = await fetch(`${backendUrl}/file/${resumeFileId}`, {
        method: 'GET',
        headers,
      });

      console.log('Resume fetch response status:', response.status);

      if (!response.ok) {
        const errorMessage = await this.extractErrorMessage(response);
        throw new Error(`Failed to preview resume: ${errorMessage}`);
      }

      const blob = await response.blob();
      console.log('Resume blob size:', blob.size, 'type:', blob.type);
      return blob;
    } catch (error) {
      console.error('Error in previewResume:', error);
      if (error instanceof Error) {
        throw error;
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
