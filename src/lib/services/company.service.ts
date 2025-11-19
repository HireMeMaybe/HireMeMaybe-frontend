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

interface CompanyApplicationUser {
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
    email?: string;
    id?: string;
    profile_picture?: string | null;
    punishment?: { at?: string; end?: string; type?: string } | null;
    role?: string;
    tel?: string;
    UpdatedAt?: string;
    username?: string;
  };
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
      cpsk_user?: CompanyApplicationUser;
      id?: number;
      post_id?: number;
      resume_id?: number;
      status?: string;
    }>;
    company_id?: string;
    company_user?: string | null;
    desc?: string;
    exp_lvl?: string;
    expiring?: string;
    id?: number;
    location?: string;
    optional_forms?: string[];
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

type SessionSafeCompany = {
  id?: string;
  name?: string | null;
  overview?: string | null;
  industry?: string | null;
  size?: string | null;
  verified_status?: 'Verified' | 'Pending' | 'Unverified' | null;
  logo_id?: number | null;
  banner_id?: number | null;
};

type SessionSafeUser = {
  id?: string;
  email?: string | null;
  tel?: string | null;
  username?: string | null;
  profile_picture?: string | null;
};

const fetchFileWithAuth = async (fileId: number, logLabel: string): Promise<Blob> => {
  console.log(`${logLabel}: Starting fetch for fileId:`, fileId);
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error('Backend URL is not configured');
    }

    const token = await apiClient['getAuthToken']();
    console.log(`${logLabel}: Got token:`, token ? `${token.substring(0, 20)}...` : 'none');

    const headers: Record<string, string> = {};
    if (token) {
      const hasScheme = /^[A-Za-z]+\s+/i.test(token);
      headers['Authorization'] = hasScheme ? token : `Bearer ${token}`;
    }

    const url = `${backendUrl}/file/${fileId}`;
    console.log(`${logLabel}: Fetching from URL:`, url, 'with auth:', !!token);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log(`${logLabel}: Response status:`, response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        console.log(`${logLabel}: Error response:`, errorData);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        console.log(`${logLabel}: Could not parse error response as JSON`);
      }
      throw new Error(`Failed to fetch file: ${errorMessage}`);
    }

    const blob = await response.blob();
    console.log(`${logLabel}: Successfully fetched blob, size:`, blob.size, 'type:', blob.type);
    return blob;
  } catch (error) {
    console.error(`${logLabel}: Error occurred:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch file: Unknown error');
  }
};

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

  private static buildSessionCompanyPayload(
    company: CompanyProfileResponse,
    normalizedStatus: 'Verified' | 'Pending' | 'Unverified' | null
  ): SessionSafeCompany {
    return {
      id: company.id,
      name: company.name ?? null,
      overview: company.overview ?? null,
      industry: company.industry ?? null,
      size: company.size ?? null,
      verified_status: normalizedStatus,
      logo_id: typeof company.logo_id === 'number' ? company.logo_id : null,
      banner_id: typeof company.banner_id === 'number' ? company.banner_id : null,
    };
  }

  private static buildSessionUserPayload(user?: CompanyProfileResponse['user']): SessionSafeUser | undefined {
    if (!user) return undefined;

    return {
      id: user.id,
      email: user.email ?? null,
      tel: user.tel ?? null,
      username: user.username ?? null,
      profile_picture: user.profile_picture ?? null,
    };
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

      const companyPayload = this.buildSessionCompanyPayload(company, normalizedStatus ?? null);
      const userPayload = this.buildSessionUserPayload(company.user);

      const sessionPatch = {
        backendUser: {
          id: companyPayload.id,
          name: companyPayload.name,
          overview: companyPayload.overview,
          industry: companyPayload.industry,
          size: companyPayload.size,
          company: companyPayload,
          verified_status: companyPayload.verified_status ?? null,
          ...(userPayload
            ? {
                User: userPayload,
                user: userPayload,
              }
            : {}),
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
   */
  static async fetchLogo(fileId: number): Promise<Blob> {
    return fetchFileWithAuth(fileId, 'fetchLogo');
  }

  /**
   * Fetch banner file by file ID using /file/{id} endpoint
   */
  static async fetchBanner(fileId: number): Promise<Blob> {
    return fetchFileWithAuth(fileId, 'fetchBanner');
  }

  /**
   * Fetch arbitrary file (e.g., applicant resumes)
   */
  static async fetchFile(fileId: number): Promise<Blob> {
    return fetchFileWithAuth(fileId, 'fetchFile');
  }

}
