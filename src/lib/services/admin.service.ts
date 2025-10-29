/**
 * Admin Service
 * Handles admin-related API calls (reports, dashboard stats, etc.)
 */

import { apiClient, ApiError } from './api-client';
import type { CPSKUserResponse } from '@/types/cpsk';
import type { CPSKAccount, PunishmentStruct } from '@/types/admin';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved';
export type VerificationStatus = 'pending' | 'verified' | 'unverified';

export interface Report {
  id: string;
  reporter: string;
  reporterRole: string;
  reportedEntityId: string;
  reportedEntityType: 'job' | 'company';
  reason: string;
  submitted: string;
  status: ReportStatus;
  link?: string;
}

export interface Company {
  id: string;
  ID: number;
  name: string;
  about: string;
  location: string;
  industry: string;
  size: string;
  email: string;
  phone: string;
  website: string;
  User?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    tel: string;
    punishment?: PunishmentInfo;
  };
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface PunishmentInfo {
  type: 'ban' | 'suspend';
  at?: string;
  end?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  pendingReports: number;
}

interface ReportSubmitData {
  reportedEntityId: string;
  reportedEntityType: 'job' | 'company';
  reason: string;
  details?: string;
}

export class AdminService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      return await apiClient.get<DashboardStats>('/admin/dashboard/stats');
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
      }
      throw new Error('Failed to fetch dashboard stats');
    }
  }

  /**
   * Get all reports
   */
  static async getReports(status?: ReportStatus): Promise<Report[]> {
    // Fallback to mock data if backend API is not available yet
    const mockReports: Report[] = [
      {
        id: 'rpt-1',
        reporter: 'Alice Example',
        reporterRole: 'User',
        reportedEntityId: 'job-123',
        reportedEntityType: 'job',
        reason: 'Inappropriate content',
        submitted: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        status: 'pending',
        link: 'https://example.com/job/123',
      },
      {
        id: 'rpt-2',
        reporter: 'Bob Example',
        reporterRole: 'Employer',
        reportedEntityId: 'company-456',
        reportedEntityType: 'company',
        reason: 'Spam posting',
        submitted: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        status: 'reviewed',
      },
    ];

    try {
      const endpoint = status ? `/admin/reports?status=${status}` : '/admin/reports';
      return await apiClient.get<Report[]>(endpoint);
    } catch (error) {
      // If the API client reports an error, return mock data filtered by status (if provided)
      console.warn('AdminService.getReports: backend unavailable, returning mock data', error);
      return status ? mockReports.filter((r) => r.status === status) : mockReports;
    }
  }

  /**
   * Get report by ID
   */
  static async getReport(reportId: string): Promise<Report> {
    // Mock fallback when backend isn't ready
    const mockReports: Report[] = [
      {
        id: 'rpt-1',
        reporter: 'Alice Example',
        reporterRole: 'User',
        reportedEntityId: 'job-123',
        reportedEntityType: 'job',
        reason: 'Inappropriate content',
        submitted: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        status: 'pending',
        link: 'https://example.com/job/123',
      },
      {
        id: 'rpt-2',
        reporter: 'Bob Example',
        reporterRole: 'Employer',
        reportedEntityId: 'company-456',
        reportedEntityType: 'company',
        reason: 'Spam posting',
        submitted: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        status: 'reviewed',
      },
    ];

    try {
      return await apiClient.get<Report>(`/admin/reports/${reportId}`);
    } catch (error) {
      console.warn('AdminService.getReport: backend unavailable, returning mock report', error);
      const found = mockReports.find((r) => r.id === reportId);
      if (found) return found;
      throw new Error('Failed to fetch report and no mock available');
    }
  }

  /**
   * Submit a report (available to all users)
   */
  static async submitReport(
    data: ReportSubmitData
  ): Promise<{ message: string; reportId: string }> {
    try {
      return await apiClient.post('/reports', data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to submit report: ${error.message}`);
      }
      throw new Error('Failed to submit report');
    }
  }

  /**
   * Update report status
   */
  static async updateReportStatus(
    reportId: string,
    status: Exclude<ReportStatus, 'pending'>,
    notes?: string
  ): Promise<Report> {
    try {
      return await apiClient.put<Report>(`/admin/reports/${reportId}`, { status, notes });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to update report: ${error.message}`);
      }
      throw new Error('Failed to update report');
    }
  }

  /**
   * Delete report
   */
  static async deleteReport(reportId: string): Promise<{ message: string }> {
    try {
      return await apiClient.delete(`/admin/reports/${reportId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to delete report: ${error.message}`);
      }
      throw new Error('Failed to delete report');
    }
  }

  /**
   * Get all job posts (for admin management)
   */
  static async getAllJobPosts(): Promise<
    Array<{
      id: string;
      title: string;
      company: string;
      status: string;
      createdAt: string;
    }>
  > {
    try {
      return await apiClient.get('/admin/jobs');
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch job posts: ${error.message}`);
      }
      throw new Error('Failed to fetch job posts');
    }
  }

  /**
   * Approve or reject a job post
   */
  static async moderateJobPost(
    jobId: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<{ message: string }> {
    try {
      return await apiClient.post(`/admin/jobs/${jobId}/${action}`, { reason });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to ${action} job post: ${error.message}`);
      }
      throw new Error(`Failed to ${action} job post`);
    }
  }
  /**
   * Get companies based on verification status
   * @param status - Optional status filter: 'pending', 'verified', or 'unverified'
   */
  static async getCompanies(status?: VerificationStatus): Promise<Company[]> {
    try {
      console.log('Fetching companies with status:', status || 'all');
      const endpoint = status ? `/get-companies?status=${status}` : '/get-companies';
      const companies = await apiClient.get<Company[]>(endpoint);
      console.log('Fetched companies:', companies.length);
      return companies;
    } catch (error) {
      console.error('AdminService.getCompanies: Failed to fetch companies', error);
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch companies: ${error.message}`);
      }
      throw new Error('Failed to fetch companies');
    }
  }

  /**
   * Verify or unverify a company
   * @param companyId - The ID of the company to update
   * @param status - The new verification status: 'verified' or 'unverified'
   */
  static async verifyCompany(
    companyId: string,
    status: Exclude<VerificationStatus, 'pending'> = 'verified'
  ): Promise<Company> {
    try {
      console.log(`Updating company ${companyId} status to:`, status);
      const endpoint = `/verify-company/${companyId}?status=${status}`;
      const company = await apiClient.patch<Company>(endpoint);
      console.log('Company verification updated successfully:', company.name);
      return company;
    } catch (error) {
      console.error('AdminService.verifyCompany: Failed to update company', error);
      if (error instanceof ApiError) {
        throw new Error(
          `Failed to ${status === 'verified' ? 'verify' : 'unverify'} company: ${error.message}`
        );
      }
      throw new Error(`Failed to ${status === 'verified' ? 'verify' : 'unverify'} company`);
    }
  }

  /**
   * @deprecated Use getCompanies() with status filter instead
   * Get rejected companies for verification
   */
  static async getRejectedCompanies(): Promise<Company[]> {
    return this.getCompanies('unverified');
  }

  /**
   * @deprecated Use reconsiderCompany() instead
   * Reconsider a rejected company
   */
  static async reconsiderCompany(companyId: number): Promise<{ message: string }> {
    try {
      await this.verifyCompany(companyId.toString(), 'verified');
      return { message: 'Company verified successfully' };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to reconsider company: ${error.message}`);
      }
      throw new Error('Failed to reconsider company');
    }
  }

  /**
   * Get CPSK accounts based on punishment status
   * @param punishment - Optional filter: 'ban' or 'suspend' (case insensitive)
   * @returns Array of CPSK users
   */
  static async getCPSKAccounts(punishment?: 'ban' | 'suspend'): Promise<CPSKAccount[]> {
    try {
      const endpoint = punishment ? `/get-cpsk?punishment=${punishment}` : '/get-cpsk';
      const response = await apiClient.get<CPSKUserResponse[]>(endpoint);

      // Transform backend response to frontend format
      return response.map((cpsk) => {
        let status: 'Active' | 'Suspended' | 'Banned' = 'Active';

        if (cpsk.User?.punishment) {
          status = cpsk.User.punishment.type === 'ban' ? 'Banned' : 'Suspended';
        }

        return {
          id: cpsk.id,
          name: `${cpsk.first_name} ${cpsk.last_name}`.trim(),
          email: cpsk.User?.email || '',
          major: cpsk.program || 'N/A',
          year: cpsk.year?.toString() || 'N/A',
          status,
          tel: cpsk.User?.tel || '',
          first_name: cpsk.first_name,
          last_name: cpsk.last_name,
          program: cpsk.program || undefined,
          punishment: cpsk.User?.punishment,
        };
      });
    } catch (error) {
      console.error('AdminService.getCPSKAccounts: Failed to fetch CPSK accounts', error);
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch CPSK accounts: ${error.message}`);
      }
      throw new Error('Failed to fetch CPSK accounts');
    }
  }

  /**
   * Punish a CPSK user (ban or suspend)
   * @param userId - ID of the user to punish
   * @param punishment - Punishment details (type, at, end)
   * @returns Success message
   */
  static async punishCPSK(
    userId: string,
    punishment: PunishmentStruct
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.put<{ message: string }>(`/punish/${userId}`, punishment);
      console.log(`Successfully punished user ${userId}:`, punishment.type);
      return response;
    } catch (error) {
      console.error('AdminService.punishCPSK: Failed to punish user', error);
      if (error instanceof ApiError) {
        throw new Error(`Failed to punish user: ${error.message}`);
      }
      throw new Error('Failed to punish user');
    }
  }

  /**
   * Remove punishment from a CPSK user
   * @param userId - ID of the user to unpunish
   * @returns Success message
   */
  static async removePunishment(userId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/punish/${userId}`);
      console.log(`Successfully removed punishment from user ${userId}`);
      return response;
    } catch (error) {
      console.error('AdminService.removePunishment: Failed to remove punishment', error);
      if (error instanceof ApiError) {
        throw new Error(`Failed to remove punishment: ${error.message}`);
      }
      throw new Error('Failed to remove punishment');
    }
  }

  /**
   * Punish a company user (ban or suspend)
   * @param userId - ID of the company user to punish
   * @param punishment - Punishment details (type, at, end)
   * @returns Success message
   */
  static async punishCompany(
    userId: string,
    punishment: PunishmentStruct
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.put<{ message: string }>(`/punish/${userId}`, punishment);
      console.log(`Successfully punished company user ${userId}:`, punishment.type);
      return response;
    } catch (error) {
      console.error('AdminService.punishCompany: Failed to punish company', error);
      if (error instanceof ApiError) {
        throw new Error(`Failed to punish company: ${error.message}`);
      }
      throw new Error('Failed to punish company');
    }
  }

  /**
   * Remove punishment from a company user
   * @param userId - ID of the company user to unpunish
   * @returns Success message
   */
  static async removePunishmentCompany(userId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/punish/${userId}`);
      console.log(`Successfully removed punishment from company user ${userId}`);
      return response;
    } catch (error) {
      console.error('AdminService.removePunishmentCompany: Failed to remove punishment', error);
      if (error instanceof ApiError) {
        throw new Error(`Failed to remove punishment: ${error.message}`);
      }
      throw new Error('Failed to remove punishment');
    }
  }
}
