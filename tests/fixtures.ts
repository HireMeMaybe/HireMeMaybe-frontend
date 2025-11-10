import { test as base } from '@playwright/test';
import {
  LandingPage,
  AuthPage,
  SearchPage,
  JobPostPage,
  JobDetailPage,
  ProfilePage,
  ApplicationPage,
  CompanyProfilePage,
  CompanyRegisterPage,
  CPSKRegisterPage,
  HistoryPage,
  AdminLoginPage,
  AdminDashboardPage,
  CompanyVerificationPage,
  ManageCompanyPage,
  ManageCPSKPage,
  ManageJobPostsPage,
  ManageVisitorsPage,
  AdminReportsPage,
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
  landingPage: LandingPage;
  authPage: AuthPage;
  searchPage: SearchPage;
  jobPostPage: JobPostPage;
  jobDetailPage: JobDetailPage;
  profilePage: ProfilePage;
  applicationPage: ApplicationPage;
  companyProfilePage: CompanyProfilePage;
  companyRegisterPage: CompanyRegisterPage;
  cpskRegisterPage: CPSKRegisterPage;
  historyPage: HistoryPage;
  adminLoginPage: AdminLoginPage;
  adminDashboardPage: AdminDashboardPage;
  companyVerificationPage: CompanyVerificationPage;
  manageCompanyPage: ManageCompanyPage;
  manageCPSKPage: ManageCPSKPage;
  manageJobPostsPage: ManageJobPostsPage;
  manageVisitorsPage: ManageVisitorsPage;
  adminReportsPage: AdminReportsPage;
};

export const test = base.extend<PageFixtures>({
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  searchPage: async ({ page }, use) => {
    await use(new SearchPage(page));
  },
  jobPostPage: async ({ page }, use) => {
    await use(new JobPostPage(page));
  },
  jobDetailPage: async ({ page }, use) => {
    await use(new JobDetailPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  applicationPage: async ({ page }, use) => {
    await use(new ApplicationPage(page));
  },
  companyProfilePage: async ({ page }, use) => {
    await use(new CompanyProfilePage(page));
  },
  companyRegisterPage: async ({ page }, use) => {
    await use(new CompanyRegisterPage(page));
  },
  cpskRegisterPage: async ({ page }, use) => {
    await use(new CPSKRegisterPage(page));
  },
  historyPage: async ({ page }, use) => {
    await use(new HistoryPage(page));
  },
  adminLoginPage: async ({ page }, use) => {
    await use(new AdminLoginPage(page));
  },
  adminDashboardPage: async ({ page }, use) => {
    await use(new AdminDashboardPage(page));
  },
  companyVerificationPage: async ({ page }, use) => {
    await use(new CompanyVerificationPage(page));
  },
  manageCompanyPage: async ({ page }, use) => {
    await use(new ManageCompanyPage(page));
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
  adminReportsPage: async ({ page }, use) => {
    await use(new AdminReportsPage(page));
  },
});

export { expect } from '@playwright/test';
