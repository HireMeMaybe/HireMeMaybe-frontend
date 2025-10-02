/**
 * Company Service
 * Handles company profile and company-related API calls
 */

import { apiClient, ApiError } from './api-client';

interface CompanyProfile {
  id: string;
  name: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
  size?: string;
  logoUrl?: string;
}

interface CompanyRegistrationData {
  name: string;
  email: string;
  phone: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
}

export class CompanyService {
  /**
   * Get company profile by ID
   */
  static async getCompanyProfile(companyId: string): Promise<CompanyProfile> {
    try {
      return await apiClient.get<CompanyProfile>(`/companies/${companyId}`, {
        requireAuth: false,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch company profile: ${error.message}`);
      }
      throw new Error('Failed to fetch company profile');
    }
  }

  /**
   * Update company profile
   */
  static async updateCompanyProfile(
    companyId: string,
    data: Partial<CompanyProfile>
  ): Promise<CompanyProfile> {
    try {
      return await apiClient.put<CompanyProfile>(`/companies/${companyId}`, data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to update company profile: ${error.message}`);
      }
      throw new Error('Failed to update company profile');
    }
  }

  /**
   * Register a new company
   */
  static async registerCompany(
    data: CompanyRegistrationData
  ): Promise<{ message: string; companyId: string }> {
    try {
      return await apiClient.post('/companies/register', data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Company registration failed: ${error.message}`);
      }
      throw new Error('Company registration failed');
    }
  }

  /**
   * Upload company logo
   */
  static async uploadLogo(companyId: string, logo: File): Promise<{ logoUrl: string }> {
    try {
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(logo.type)) {
        throw new Error('Logo must be a JPEG, PNG, or WebP image');
      }
      if (logo.size > 5 * 1024 * 1024) {
        throw new Error('Logo must be 5 MB or smaller');
      }

      const formData = new FormData();
      formData.append('logo', logo);

      return await apiClient.post(`/companies/${companyId}/logo`, formData, {
        useFormData: true,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to upload logo: ${error.message}`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to upload logo');
    }
  }

  /**
   * Get company's statistics
   */
  static async getCompanyStats(companyId: string): Promise<any> {
    try {
      return await apiClient.get(`/companies/${companyId}/stats`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch company stats: ${error.message}`);
      }
      throw new Error('Failed to fetch company stats');
    }
  }
}
