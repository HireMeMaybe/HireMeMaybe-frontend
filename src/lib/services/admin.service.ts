/**
 * Admin Service
 * Handles admin-related API calls (reports, dashboard stats, etc.)
 */

import { apiClient, ApiError } from './api-client';

export interface Report {
  id: string;
  reporter: string;
  reporterRole: string;
  reportedEntityId: string;
  reportedEntityType: 'job' | 'company';
  reason: string;
  submitted: string;
  status: 'pending' | 'reviewed' | 'resolved';
  link?: string;
}

export interface CompanyVerification {
  id: number;
  name: string;
  location: string;
  industry: string;
  contact: string;
  submitted: string;
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
  static async getReports(status?: 'pending' | 'reviewed' | 'resolved'): Promise<Report[]> {
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
    status: 'reviewed' | 'resolved',
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
   * Get rejected companies for verification
   */
  static async getRejectedCompanies(): Promise<CompanyVerification[]> {
    // Mock data for rejected companies
    const mockRejectedCompanies: CompanyVerification[] = [
      {
        id: 1,
        name: 'Tech Solutions Co.',
        location: 'Bangkok, Thailand',
        industry: 'Software Development',
        contact: 'contact@techsolutions.com',
        submitted: '2025-09-30',
      },
      {
        id: 2,
        name: 'Digital Marketing Hub',
        location: 'Chiang Mai, Thailand',
        industry: 'Marketing',
        contact: 'hr@digitalhub.co.th',
        submitted: '2025-09-30',
      },
      {
        id: 3,
        name: 'Tech Solutions Co.',
        location: 'Bangkok, Thailand',
        industry: 'Software Development',
        contact: 'contact@techsolutions.com',
        submitted: '2025-09-30',
      },
      {
        id: 4,
        name: 'Digital Marketing Hub',
        location: 'Chiang Mai, Thailand',
        industry: 'Marketing',
        contact: 'hr@digitalhub.co.th',
        submitted: '2025-09-30',
      },
      {
        id: 5,
        name: 'Tech Solutions Co.',
        location: 'Bangkok, Thailand',
        industry: 'Software Development',
        contact: 'contact@techsolutions.com',
        submitted: '2025-09-30',
      },
      {
        id: 6,
        name: 'Digital Marketing Hub',
        location: 'Chiang Mai, Thailand',
        industry: 'Marketing',
        contact: 'hr@digitalhub.co.th',
        submitted: '2025-09-30',
      },
      {
        id: 7,
        name: 'Tech Solutions Co.',
        location: 'Bangkok, Thailand',
        industry: 'Software Development',
        contact: 'contact@techsolutions.com',
        submitted: '2025-09-30',
      },
    ];

    try {
      return await apiClient.get<CompanyVerification[]>('/admin/companies/rejected');
    } catch (error) {
      console.warn(
        'AdminService.getRejectedCompanies: backend unavailable, returning mock data',
        error
      );
      return mockRejectedCompanies;
    }
  }

  /**
   * Reconsider a rejected company (move back to pending)
   */
  static async reconsiderCompany(companyId: number): Promise<{ message: string }> {
    try {
      return await apiClient.post(`/admin/companies/${companyId}/reconsider`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to reconsider company: ${error.message}`);
      }
      throw new Error('Failed to reconsider company');
    }
  }
}
