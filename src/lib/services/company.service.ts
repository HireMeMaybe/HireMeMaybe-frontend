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

// Full response shape for PATCH /company/profile (simplified types)
interface CompanyProfileResponse {
  banner_id: number;
  id: string;
  industry?: string;
  job_post?: Array<{
    applications?: Array<{
      answer?: {
        expected_salary?: string;
        id?: number;
        programming_languages?: string[];
        right_to_work?: string;
        year_of_experience?: number;
      };
      answer_id?: number;
      applied_at?: string;
      cpsk_id?: string;
      id?: number;
      post_id?: number;
      resume_id?: number;
      status?: string;
    }>;
    company_id?: string;
    desc?: string;
    exp_lvl?: string;
    expiring?: string;
    id?: number;
    location?: string;
    post_time?: string;
    req?: string;
    salary?: string;
    tags?: string[];
    title?: string;
    type?: string;
  }>;
  logo_id?: number;
  name?: string;
  overview?: string;
  size?: string;
  user?: {
    createdAt?: string;
    deletedAt?: { time?: string; valid?: boolean } | null;
    email?: string;
    id?: string;
    profile_picture?: string;
    punishment?: { at?: string; end?: string; type?: string } | null;
    tel?: string;
    updatedAt?: string;
    username?: string;
  };
  verified_status?: string;
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
   * Upload company profile logo (with bearer token)
   */
  static async uploadProfileLogo(logo: File): Promise<CompanyProfile> {
    try {
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(logo.type)) {
        throw new Error('Logo must be a JPEG, PNG, WebP image, or PDF');
      }
      if (logo.size > 10 * 1024 * 1024) {
        throw new Error('Logo must be 10 MB or smaller');
      }

      const formData = new FormData();
      formData.append('logo', logo);

      return await apiClient.post<CompanyProfile>('/company/profile/logo', formData, {
        useFormData: true,
        requireAuth: true,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to upload profile logo: ${error.message}`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to upload profile logo');
    }
  }

  /**
   * Upload company profile banner (with bearer token)
   */
  static async uploadProfileBanner(banner: File): Promise<CompanyProfile> {
    try {
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(banner.type)) {
        throw new Error('Banner must be a JPEG, PNG, WebP image, or PDF');
      }
      if (banner.size > 10 * 1024 * 1024) {
        throw new Error('Banner must be 10 MB or smaller');
      }

      const formData = new FormData();
      formData.append('banner', banner);

      return await apiClient.post<CompanyProfile>('/company/profile/banner', formData, {
        useFormData: true,
        requireAuth: true,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to upload profile banner: ${error.message}`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to upload profile banner');
    }
  }

  /**
   * Get company's statistics
   */
  static async getCompanyStats(companyId: string): Promise<{
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
  }> {
    try {
      return await apiClient.get(`/companies/${companyId}/stats`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch company stats: ${error.message}`);
      }
      throw new Error('Failed to fetch company stats');
    }
  }

  /**
   * Update company profile (PATCH /company/profile)
   * Requires bearer token (authenticated)
   */
  static async patchCompanyProfile(company_profile: {
    industry?: string;
    name?: string;
    overview?: string;
    size?: string;
    tel?: string;
  }): Promise<CompanyProfileResponse> {
    try {
      // Map frontend size values to backend-expected values if needed.
      // Currently this is a no-op mapping but centralizes the place to adapt
      // if the backend expects different enum keys (e.g. SMALL/MEDIUM/LARGE).
      const mapSize = (s?: string) => {
        if (!s) return undefined;
        // Map the UI-friendly ranges to backend enum values
        // Frontend values (from COMPANY_SIZE_OPTIONS):
        //  '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
        const mapping: Record<string, string> = {
          '1-10': 'XS',
          '11-50': 'S',
          '51-200': 'M',
          '201-500': 'L',
          '501-1000': 'XL',
          '1000+': 'XL',
        };
        return mapping[s] ?? s;
      };

      const payload = {
        ...company_profile,
        size: mapSize(company_profile.size),
      };

      // Send plain object as the request body per backend contract
      return await apiClient.patch<CompanyProfileResponse>('/company/profile', payload, {
        requireAuth: true,
      });
    } catch (error) {
      // Detect DB constraint error for company size and surface a clearer message
      if (error instanceof ApiError) {
        try {
          const data = (error as any).data;
          const text = typeof data === 'string' ? data : data?.message || JSON.stringify(data);
          const combined = `${error.message} ${text}`.toLowerCase();
          if (
            combined.includes('chk_companies_size') ||
            combined.includes('sqlstate 23514') ||
            combined.includes('companies_size')
          ) {
            throw new Error(
              'The selected company size is not accepted by the backend. Please choose a different size or ask the backend team for the allowed values.'
            );
          }
        } catch (e) {
          // fallthrough to generic message below
        }

        throw new Error(`Failed to update company profile: ${error.message}`);
      }

      throw new Error('Failed to update company profile');
    }
  }

  /**
   * Get my company profile (GET /company/myprofile)
   * Requires bearer token
   */
  static async getMyProfile(): Promise<CompanyProfileResponse> {
    try {
      return await apiClient.get<CompanyProfileResponse>('/company/myprofile', {
        requireAuth: true,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch my company profile: ${error.message}`);
      }
      throw new Error('Failed to fetch my company profile');
    }
  }
}
