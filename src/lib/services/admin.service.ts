/**
 * Admin Service
 * Handles admin-related API calls (reports, dashboard stats, etc.)
 */

import { apiClient, ApiError } from './api-client';
import type { CPSKUserResponse } from '@/types/cpsk';
import type { CPSKAccount, PunishmentStruct } from '@/types/admin';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'rejected';
export type VerificationStatus = 'pending' | 'verified' | 'unverified';
export type ReportType = 'user' | 'post';

export interface Report {
  id: string;
  originalId?: string | number; // Original ID from API before unique transformation
  reporter_id: string;
  reporter?: string;
  reporterRole?: string;
  reported_id: string;
  reportedEntity?: string; // Name of the reported entity (job title, company name, CPSK name)
  reportedEntityType?: 'Job' | 'Company' | 'CPSK';
  type: ReportType;
  reason: string;
  detail?: string;
  submitted: string;
  status: ReportStatus;
  admin_note?: string;
  link?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  User?: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    tel: string;
    email: string;
    id: string;
    username: string;
    role: string;
    punishment?: PunishmentInfo;
    profile_picture: string;
  };
  verified_status: string;
  name: string;
  overview: string;
  industry: string;
  size: string;
  logo_id: number | null;
  banner_id: number | null;
  job_post?: Array<{
    id: number;
    company_id: string;
    title: string;
    desc: string;
    req: string;
    exp_lvl: string;
    location: string;
    type: string;
    salary: string;
    tags: string[];
    post_time: string;
    applications: unknown;
  }>;
  verification_status?: VerificationStatus;
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
  reported_id: number;
  reportedEntityType: 'post' | 'user';
  reason: string;
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
   * Get all reports with optional status filter
   */
  static async getReports(status?: ReportStatus): Promise<Report[]> {
    try {
      const endpoint = status ? `/report?status=${status}` : '/report';
      console.log('Fetching reports from endpoint:', endpoint);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await apiClient.get<any>(endpoint);

      console.log('Raw API response:', response);

      // Handle different response formats
      let reports: Report[] = [];

      if (Array.isArray(response)) {
        console.log('Response is direct array');
        reports = response;
      } else if (response && typeof response === 'object') {
        console.log('Response object keys:', Object.keys(response));

        // Handle the API response structure: { post_reports: [], user_reports: [] }
        if (response.post_reports || response.user_reports) {
          console.log('Found post_reports and user_reports structure');
          const postReports = Array.isArray(response.post_reports) ? response.post_reports : [];
          const userReports = Array.isArray(response.user_reports) ? response.user_reports : [];

          // Merge both arrays and add type field
          reports = [
            ...postReports.map((r: Record<string, unknown>) => ({
              ...r,
              type: 'post' as ReportType,
            })),
            ...userReports.map((r: Record<string, unknown>) => ({
              ...r,
              type: 'user' as ReportType,
            })),
          ];
          console.log(
            `Combined ${postReports.length} post reports and ${userReports.length} user reports`
          );
        } else if (Array.isArray(response.reports)) {
          console.log('Found reports array in response.reports');
          reports = response.reports;
        } else if (Array.isArray(response.data)) {
          console.log('Found reports array in response.data');
          reports = response.data;
        } else {
          console.warn('Unexpected response format. Available keys:', Object.keys(response));
          return [];
        }
      } else {
        console.warn('Response is not an object or array:', response);
        return [];
      }

      console.log('Processing', reports.length, 'reports');

      // Normalize the response to include both old and new field names for compatibility
      // Generate unique IDs by adding prefix based on type to avoid collisions between post_reports and user_reports
      return reports.map((report) => {
        // Generate unique ID by combining type prefix with original ID
        const originalId =
          typeof report.id === 'string' ? Number.parseInt(report.id, 10) : report.id;
        const typePrefix = report.type === 'post' ? 1000000 : 2000000;
        const uniqueId = typePrefix + originalId;

        return {
          ...report,
          id: uniqueId.toString(), // Convert to string as Report type expects string
          originalId: report.id, // Keep original ID for API calls
          reporter_id: report.reporter_id || report.reporter || 'Unknown',
          reporter: undefined, // Clear this so useReport hook will fetch the actual name
          reporterRole:
            report.reporterRole ||
            (report as { reporter_role?: string }).reporter_role ||
            undefined, // Don't use report.type as it's the report type, not user role
          reported_id: (report as { reported?: string }).reported || report.reported_id,
          submitted: report.submitted || report.created_at || new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error('AdminService.getReports: Failed to fetch reports', error);
      if (error instanceof ApiError) {
        console.error('ApiError details:', {
          message: error.message,
          status: error.status,
          data: error.data,
        });
        throw new Error(`Failed to fetch reports: ${error.message}`);
      }
      throw new Error('Failed to fetch reports');
    }
  }

  /**
   * Get report by ID and type
   */
  static async getReport(reportId: string, type: ReportType): Promise<Report> {
    try {
      const report = await apiClient.get<Report>(`/report/${type}/${reportId}`);

      // Normalize the response
      return {
        ...report,
        reporter: report.reporter || report.reporter_id,
        reported_id: (report as { reported?: string }).reported || report.reported_id,
        submitted: report.submitted || report.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('AdminService.getReport: Failed to fetch report', error);
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch report: ${error.message}`);
      }
      throw new Error('Failed to fetch report');
    }
  }

  /**
   * Submit a report (available to all users)
   */
  static async submitReport(
    data: ReportSubmitData
  ): Promise<{ message: string; reportId: string }> {
    try {
      return await apiClient.post(`/report/${data.reportedEntityType}`, data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to submit report: ${error.message}`);
      }
      throw new Error('Failed to submit report');
    }
  }

  /**
   * Update report status
   * @param type - Report type ('user' or 'post')
   * @param reportId - ID of the report to update
   * @param status - New status for the report
   * @param adminNote - Optional admin note
   */
  static async updateReportStatus(
    type: ReportType,
    reportId: string,
    status: ReportStatus,
    adminNote?: string
  ): Promise<{ message: string }> {
    try {
      const payload: { status: string; admin_note?: string } = { status };
      if (adminNote) {
        payload.admin_note = adminNote;
      }

      return await apiClient.put<{ message: string }>(`/report/${type}/${reportId}`, payload);
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
   * Uses the standard /jobpost endpoint with admin authentication
   */
  static async getAllJobPosts(params?: {
    search?: string;
    type?: string;
    tag?: string;
    salary?: string;
    exp?: string;
    company?: string;
    industry?: string;
    location?: string;
    desc?: boolean;
  }): Promise<
    Array<{
      id: number;
      company_id: string;
      title: string;
      desc: string;
      exp_lvl: string;
      location: string;
      type: string;
      req: string;
      salary: string;
      tags: string[];
      post_time: string;
      expiring: string;
      company?: {
        id?: string;
        name?: string;
        industry?: string;
      };
    }>
  > {
    try {
      const queryParams = new URLSearchParams();

      if (params?.search) queryParams.set('search', params.search);
      if (params?.type) queryParams.set('type', params.type);
      if (params?.tag) queryParams.set('tag', params.tag);
      if (params?.salary) queryParams.set('salary', params.salary);
      if (params?.exp) queryParams.set('exp', params.exp);
      if (params?.company) queryParams.set('company', params.company);
      if (params?.industry) queryParams.set('industry', params.industry);
      if (params?.location) queryParams.set('location', params.location);
      if (params?.desc !== undefined) queryParams.set('desc', params.desc ? 'true' : 'false');

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/jobpost?${queryString}` : '/jobpost';

      return await apiClient.get(endpoint);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch job posts: ${error.message}`);
      }
      throw new Error('Failed to fetch job posts');
    }
  }

  /**
   * Get job post by ID (admin access)
   */
  static async getJobPostById(jobId: number): Promise<{
    id: number;
    company_id: string;
    title: string;
    desc: string;
    exp_lvl: string;
    location: string;
    type: string;
    req: string;
    salary: string;
    tags: string[];
    post_time: string;
    expiring: string;
  }> {
    try {
      return await apiClient.get(`/jobpost/${jobId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch job post: ${error.message}`);
      }
      throw new Error('Failed to fetch job post');
    }
  }

  /**
   * Delete a job post (admin access)
   */
  static async deleteJobPost(jobId: number): Promise<{ message: string }> {
    try {
      return await apiClient.delete(`/jobpost/${jobId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to delete job post: ${error.message}`);
      }
      throw new Error('Failed to delete job post');
    }
  }

  /**
   * Update a job post (admin access)
   */
  static async updateJobPost(
    jobId: number,
    data: {
      title?: string;
      desc?: string;
      exp_lvl?: string;
      location?: string;
      type?: string;
      req?: string;
      salary?: string;
      tags?: string[];
      expiring?: string;
    }
  ): Promise<{
    id: number;
    company_id: string;
    title: string;
    desc: string;
    exp_lvl: string;
    location: string;
    type: string;
    req: string;
    salary: string;
    tags: string[];
    post_time: string;
    expiring: string;
  }> {
    try {
      return await apiClient.patch(`/jobpost/${jobId}`, data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to update job post: ${error.message}`);
      }
      throw new Error('Failed to update job post');
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
      const endpoint = status ? `/get-companies?verify=${status}` : '/get-companies';
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

  /**
   * Get visitor accounts based on punishment status
   * @param punishment - Optional filter: 'ban' or 'suspend' (case insensitive)
   * @returns Array of visitor users
   */
  static async getVisitorAccounts(punishment?: 'ban' | 'suspend'): Promise<
    Array<{
      id: string;
      User?: {
        ID: number;
        CreatedAt: string;
        UpdatedAt: string;
        DeletedAt: string | null;
        tel: string | null;
        email: string;
        id: string;
        username: string;
        role: string;
        punishment: PunishmentInfo | null;
        profile_picture: string;
      };
      first_name: string;
      last_name: string;
    }>
  > {
    try {
      const endpoint = punishment ? `/get-visitors?punishment=${punishment}` : '/get-visitors';
      const response = await apiClient.get<
        Array<{
          id: string;
          User?: {
            ID: number;
            CreatedAt: string;
            UpdatedAt: string;
            DeletedAt: string | null;
            tel: string | null;
            email: string;
            id: string;
            username: string;
            role: string;
            punishment: PunishmentInfo | null;
            profile_picture: string;
          };
          first_name: string;
          last_name: string;
        }>
      >(endpoint);
      return response;
    } catch (error) {
      console.error('AdminService.getVisitorAccounts: Failed to fetch visitor accounts', error);
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch visitor accounts: ${error.message}`);
      }
      throw new Error('Failed to fetch visitor accounts');
    }
  }

  /**
   * Punish a visitor user (ban or suspend)
   * @param userId - ID of the visitor user to punish
   * @param punishment - Punishment details (type, at, end)
   * @returns Success message
   */
  static async punishVisitor(
    userId: string,
    punishment: PunishmentStruct
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.put<{ message: string }>(`/punish/${userId}`, punishment);
      console.log(`Successfully punished visitor user ${userId}:`, punishment.type);
      return response;
    } catch (error) {
      console.error('AdminService.punishVisitor: Failed to punish visitor', error);
      if (error instanceof ApiError) {
        throw new Error(`Failed to punish visitor: ${error.message}`);
      }
      throw new Error('Failed to punish visitor');
    }
  }

  /**
   * Remove punishment from a visitor user
   * @param userId - ID of the visitor user to unpunish
   * @returns Success message
   */
  static async removePunishmentVisitor(userId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/punish/${userId}`);
      console.log(`Successfully removed punishment from visitor user ${userId}`);
      return response;
    } catch (error) {
      console.error('AdminService.removePunishmentVisitor: Failed to remove punishment', error);
      if (error instanceof ApiError) {
        throw new Error(`Failed to remove punishment: ${error.message}`);
      }
      throw new Error('Failed to remove punishment');
    }
  }

  /**
   * Get user info (name and role) by ID
   * Fetches the user's name and role from the appropriate endpoint
   * @param userId - ID of the user
   * @returns Object with user's name and role
   */
  static async getUserInfo(
    userId: string
  ): Promise<{ name: string; role: 'CPSK' | 'Visitor' | 'Company' }> {
    try {
      // Try CPSK first
      try {
        const cpskUsers = await this.getCPSKAccounts();
        const cpskUser = cpskUsers.find((u) => u.id === userId);
        if (cpskUser) {
          return { name: cpskUser.name, role: 'CPSK' };
        }
      } catch (e) {
        console.log('User not found in CPSK accounts', e instanceof Error ? e.message : '');
      }

      // Try Visitor
      try {
        const visitorUsers = await this.getVisitorAccounts();
        const visitorUser = visitorUsers.find((u) => u.id === userId);
        if (visitorUser) {
          const name =
            `${visitorUser.first_name} ${visitorUser.last_name}`.trim() ||
            visitorUser.User?.username ||
            'Unknown';
          return { name, role: 'Visitor' };
        }
      } catch (e) {
        console.log('User not found in visitor accounts', e instanceof Error ? e.message : '');
      }

      // Try Company
      try {
        const response = await apiClient.get<Company>(`/company/${userId}`);
        return { name: response.name, role: 'Company' };
      } catch (e) {
        console.log('User not found in company accounts', e instanceof Error ? e.message : '');
      }

      // Return ID if name not found
      return { name: userId, role: 'Visitor' };
    } catch (error) {
      console.error('AdminService.getUserInfo: Failed to fetch user info', error);
      return { name: userId, role: 'Visitor' };
    }
  }

  /**
   * Get user name by ID and role
   * Fetches the user's name from the appropriate endpoint based on their role
   * @param userId - ID of the user
   * @param role - User role: 'cpsk', 'visitor', or 'company'
   * @returns User's full name or username
   */
  static async getUserName(userId: string, role?: string): Promise<string> {
    try {
      // If role is not provided or unknown, try to fetch from all endpoints
      if (!role || !['cpsk', 'visitor', 'company'].includes(role.toLowerCase())) {
        // Try CPSK first
        try {
          const cpskUsers = await this.getCPSKAccounts();
          const cpskUser = cpskUsers.find((u) => u.id === userId);
          if (cpskUser) {
            return cpskUser.name;
          }
        } catch (e) {
          console.log('User not found in CPSK accounts', e instanceof Error ? e.message : '');
        }

        // Try Visitor
        try {
          const visitorUsers = await this.getVisitorAccounts();
          const visitorUser = visitorUsers.find((u) => u.id === userId);
          if (visitorUser) {
            return (
              `${visitorUser.first_name} ${visitorUser.last_name}`.trim() ||
              visitorUser.User?.username ||
              'Unknown'
            );
          }
        } catch (e) {
          console.log('User not found in visitor accounts', e instanceof Error ? e.message : '');
        }

        // Try Company
        try {
          const response = await apiClient.get<Company>(`/company/${userId}`);
          return response.name;
        } catch (e) {
          console.log('User not found in company accounts', e instanceof Error ? e.message : '');
        }

        return userId; // Return ID if name not found
      }

      // Fetch based on role
      switch (role.toLowerCase()) {
        case 'cpsk': {
          const cpskUsers = await this.getCPSKAccounts();
          const cpskUser = cpskUsers.find((u) => u.id === userId);
          return cpskUser?.name || userId;
        }

        case 'visitor': {
          const visitorUsers = await this.getVisitorAccounts();
          const visitorUser = visitorUsers.find((u) => u.id === userId);
          return (
            `${visitorUser?.first_name || ''} ${visitorUser?.last_name || ''}`.trim() ||
            visitorUser?.User?.username ||
            userId
          );
        }

        case 'company': {
          const response = await apiClient.get<Company>(`/company/${userId}`);
          return response.name;
        }

        default:
          return userId;
      }
    } catch (error) {
      console.error('AdminService.getUserName: Failed to fetch user name', error);
      return userId; // Return ID if fetching fails
    }
  }

  /**
   * Get reported entity name by ID and type
   * @param entityId - ID of the reported entity
   * @param type - Type of entity ('post' or 'user')
   * @returns Entity name (job title, company name, or CPSK name)
   */
  static async getReportedEntityName(
    entityId: string,
    type: 'post' | 'user'
  ): Promise<{ name: string; entityType: 'Job' | 'Company' | 'CPSK' }> {
    try {
      if (type === 'post') {
        // Fetch job post title
        try {
          const jobPost = await this.getJobPostById(Number.parseInt(entityId, 10));
          return { name: jobPost.title, entityType: 'Job' };
        } catch (error) {
          console.error(`Failed to fetch job post ${entityId}:`, error);
          return { name: `Job Post #${entityId}`, entityType: 'Job' };
        }
      } else {
        // type === 'user', determine if CPSK or Company
        const userInfo = await this.getUserInfo(entityId);
        return {
          name: userInfo.name,
          entityType: userInfo.role === 'CPSK' ? 'CPSK' : 'Company',
        };
      }
    } catch (error) {
      console.error('AdminService.getReportedEntityName: Failed to fetch entity name', error);
      return {
        name: type === 'post' ? `Job Post #${entityId}` : `User #${entityId}`,
        entityType: type === 'post' ? 'Job' : 'Company',
      };
    }
  }
}
