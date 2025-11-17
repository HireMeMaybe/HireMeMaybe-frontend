import { test as base } from '@playwright/test';
import {
  LandingPage,
  CompanyRegisterPage,
  CPSKRegisterPage,
  AdminLoginPage,
  AdminDashboardPage,
  CompanyVerificationPage,
  ManageCompaniesPage,
  ManageCPSKPage,
  ManageJobPostsPage,
  ManageVisitorsPage,
  ReportPage,
  VisitorReportsPage,
  ApplicationPage,
  CompanyProfilePage,
  HistoryPage,
  JobApplicationsPage,
  JobPostPage,
  ProfilePage,
  SearchPage,
} from './pages';

/**
 * Extended test fixtures with all page objects
 * This allows easy access to page objects in tests
 *
 * Usage:
 * test('test name', async ({ landingPage }) => {
 *   await landingPage.navigate();
 *   // ... test code
 * });
 */
type PageFixtures = {
  // Public Pages
  landingPage: LandingPage;
  companyRegisterPage: CompanyRegisterPage;
  cpskRegisterPage: CPSKRegisterPage;

  // Admin Pages
  adminLoginPage: AdminLoginPage;
  adminDashboardPage: AdminDashboardPage;
  companyVerificationPage: CompanyVerificationPage;
  manageCompaniesPage: ManageCompaniesPage;
  manageCPSKPage: ManageCPSKPage;
  manageJobPostsPage: ManageJobPostsPage;
  manageVisitorsPage: ManageVisitorsPage;
  reportPage: ReportPage;
  visitorReportsPage: VisitorReportsPage;

  // User Pages
  applicationPage: ApplicationPage;
  companyProfilePage: CompanyProfilePage;
  historyPage: HistoryPage;
  jobApplicationsPage: JobApplicationsPage;
  jobPostPage: JobPostPage;
  profilePage: ProfilePage;
  searchPage: SearchPage;
};

export const test = base.extend<PageFixtures>({
  // Public Pages
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },
  companyRegisterPage: async ({ page }, use) => {
    await use(new CompanyRegisterPage(page));
  },
  cpskRegisterPage: async ({ page }, use) => {
    await use(new CPSKRegisterPage(page));
  },

  // Admin Pages
  adminLoginPage: async ({ page }, use) => {
    await use(new AdminLoginPage(page));
  },
  adminDashboardPage: async ({ page }, use) => {
    await use(new AdminDashboardPage(page));
  },
  companyVerificationPage: async ({ page }, use) => {
    await use(new CompanyVerificationPage(page));
  },
  manageCompaniesPage: async ({ page }, use) => {
    await use(new ManageCompaniesPage(page));
  },
  manageCPSKPage: async ({ page }, use) => {
    await use(new ManageCPSKPage(page));
  },
  manageJobPostsPage: async ({ page }, use) => {
    await use(new ManageJobPostsPage(page));
  },
  manageVisitorsPage: async ({ page }, use) => {
    await use(new ManageVisitorsPage(page));
  },
  reportPage: async ({ page }, use) => {
    await use(new ReportPage(page));
  },
  visitorReportsPage: async ({ page }, use) => {
    await use(new VisitorReportsPage(page));
  },

  // User Pages
  applicationPage: async ({ page }, use) => {
    await use(new ApplicationPage(page));
  },
  companyProfilePage: async ({ page }, use) => {
    await use(new CompanyProfilePage(page));
  },
  historyPage: async ({ page }, use) => {
    await use(new HistoryPage(page));
  },
  jobApplicationsPage: async ({ page }, use) => {
    await use(new JobApplicationsPage(page));
  },
  jobPostPage: async ({ page }, use) => {
    await use(new JobPostPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page));
  },
});

export { expect } from '@playwright/test';
