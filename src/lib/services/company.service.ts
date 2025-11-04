/**
 * Company Service
 * Handles company profile and company-related API calls
 */

import { apiClient, ApiError } from './api-client';
import { mapFrontendToBackend } from '@/lib/utils/size';
import type { Session } from 'next-auth';

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
export interface CompanyProfileResponse {
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

interface AIVerificationResponse {
  ai_decision: string;
  company: CompanyProfileResponse;
  confidence: string;
  reasoning: string;
}

export class CompanyService {
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
   * Update company profile (PATCH /company/profile)
   * Requires bearer token (authenticated)
   */
  static async patchCompanyProfile(company_profile: {
    industry?: string;
    name?: string;
    overview?: string;
    size?: string;
    tel?: string;
    email?: string;
  }): Promise<CompanyProfileResponse> {
    try {
      // Map frontend size values to backend-expected values if needed.
      // Currently this is a no-op mapping but centralizes the place to adapt
      // if the backend expects different enum keys (e.g. SMALL/MEDIUM/LARGE).
      const payload = {
        ...company_profile,
        size: mapFrontendToBackend(company_profile.size),
      };

      // Send plain object as the request body per backend contract
      return await apiClient.patch<CompanyProfileResponse>('/company/profile', payload, {
        requireAuth: true,
      });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw new Error('Failed to update company profile');
      }

      if (this.isCompanySizeConstraint(error)) {
        throw new Error(
          'The selected company size is not accepted by the backend. Please choose a different size or ask the backend team for the allowed values.'
        );
      }

      throw new Error(`Failed to update company profile: ${error.message}`);
    }
  }

  private static readonly SIZE_ERROR_PATTERNS = [
    'chk_companies_size',
    'sqlstate 23514',
    'companies_size',
  ];

  private static extractErrorText(data: unknown): string {
    if (typeof data === 'string') return data;

    if (data && typeof data === 'object') {
      const maybeMessage = (data as { message?: unknown }).message;
      if (typeof maybeMessage === 'string') return maybeMessage;
      try {
        return JSON.stringify(data);
      } catch {
        return '';
      }
    }

    return '';
  }

  private static isCompanySizeConstraint(error: ApiError): boolean {
    const errorText = this.extractErrorText(error.data);
    const combined = `${error.message} ${errorText}`.toLowerCase();
    return this.SIZE_ERROR_PATTERNS.some((pattern) => combined.includes(pattern));
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

  /**
   * Get public company profile (GET /companies/{companyId})
   * No authentication required for public company profiles
   */
  static async getCompany(companyId: string): Promise<CompanyProfileResponse> {
    try {
      return await apiClient.get<CompanyProfileResponse>(`/company/${companyId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch company profile: ${error.message}`);
      }
      throw new Error('Failed to fetch company profile');
    }
  }

  /**
   * Fetch own company profile from /company/myprofile and sync it into the client session.
   * - Fetches authenticated user's company profile
   * - If `updateSession` is provided (the `update` function from `useSession()`), it will be called
   *   with a partial session containing the fresh company data including User field.
   * - If not provided, but a global `window.__HMM_UPDATE_SESSION__` function exists, it will be used.
   */
  static async getMyProfileAndSync(
    updateSession?: (partialSession: Partial<Session>) => Promise<void> | void
  ): Promise<CompanyProfileResponse> {
    const company = await this.getMyProfile();

    // Sync session with fresh data when in browser environment
    if (typeof window !== 'undefined') {
      const verifiedStatus = company?.verified_status;
      const normalizedStatus: 'Verified' | 'Pending' | 'Unverified' | null | undefined =
        verifiedStatus === 'Verified' ||
        verifiedStatus === 'Pending' ||
        verifiedStatus === 'Unverified'
          ? verifiedStatus
          : null;

      // Extract User data from the company response
      const userData = (company as unknown as Record<string, unknown>)?.User || company?.user;

      const companyPayload = {
        ...company,
        verified_status: company?.verified_status ?? null,
      } as Record<string, unknown> & { verified_status?: string | null };

      const sessionPatch = {
        backendUser: {
          ...company,
          company: companyPayload,
          // Sync User data at top level for EditProfileModal access
          User: userData,
          // keep verified_status at top-level for backward compatibility
          verified_status: normalizedStatus ?? null,
        } as Record<string, unknown>,
      };

      try {
        if (typeof updateSession === 'function') {
          // Caller provided the `update` function from useSession()
          await updateSession(sessionPatch);
        } else {
          const globalWindow = window as typeof window & {
            __HMM_UPDATE_SESSION__?: (patch: Partial<Session>) => Promise<void> | void;
          };
          // Optional global hook: window.__HMM_UPDATE_SESSION__ = update (set by app root if desired)
          try {
            await globalWindow.__HMM_UPDATE_SESSION__?.(sessionPatch);
          } catch (hookError) {
            // ignore failures from the global hook
            console.warn('Global session update hook failed', hookError);
          }
        }
      } catch (updateError) {
        // Don't fail the fetch if session syncing fails; just warn
        console.warn('Failed to update client session after fetching company', updateError);
      }
    }

    return company;
  }

  /**
   * Verify company using AI (POST /company/ai-verify)
   * Requires bearer token (authenticated)
   * Returns AI decision, confidence, reasoning, and updated company profile
   */
  static async aiVerifyCompany(): Promise<AIVerificationResponse> {
    try {
      return await apiClient.post<AIVerificationResponse>(
        '/company/ai-verify',
        {},
        {
          requireAuth: true,
        }
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to verify company: ${error.message}`);
      }
      throw new Error('Failed to verify company');
    }
  }

  /**
   * Fetch logo file by file ID using /file/{id} endpoint
   * @param fileId - The logo file ID
   */
  static async fetchLogo(fileId: number): Promise<Blob> {
    console.log('fetchLogo: Starting fetch for fileId:', fileId);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL is not configured');
      }

      // Use apiClient's auth mechanism instead of manual token handling
      const token = await apiClient['getAuthToken']();
      console.log('fetchLogo: Got token:', token ? `${token.substring(0, 20)}...` : 'none');

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${backendUrl}/file/${fileId}`;
      console.log('fetchLogo: Fetching from URL:', url, 'with auth:', !!token);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('fetchLogo: Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          console.log('fetchLogo: Error response:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          console.log('fetchLogo: Could not parse error response as JSON');
        }
        throw new Error(`Failed to fetch logo: ${errorMessage}`);
      }

      const blob = await response.blob();
      console.log('fetchLogo: Successfully fetched blob, size:', blob.size, 'type:', blob.type);
      return blob;
    } catch (error) {
      console.error('fetchLogo: Error occurred:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch logo: Unknown error');
    }
  }

  /**
   * Fetch banner file by file ID using /file/{id} endpoint
   * @param fileId - The banner file ID
   */
  static async fetchBanner(fileId: number): Promise<Blob> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL is not configured');
      }

      // Use apiClient's auth mechanism instead of manual token handling
      const token = await apiClient['getAuthToken']();

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${backendUrl}/file/${fileId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Could not parse error response
        }
        throw new Error(`Failed to fetch banner: ${errorMessage}`);
      }

      return await response.blob();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch banner: Unknown error');
    }
  }
}
