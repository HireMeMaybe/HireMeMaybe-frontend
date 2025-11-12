import { test, expect } from '@playwright/test';
import {
  AdminLoginPage,
  CompanyVerificationPage,
  ManageCompaniesPage,
  ManageCPSKPage,
  ManageJobPostsPage,
  ManageVisitorsPage,
  ReportPage,
  VisitorReportsPage,
} from './pages/admin';

/**
 * Admin Pages Selector Validation Tests
 * These tests verify that all selectors in admin page objects can locate elements correctly
 * All tests require admin login first
 */
test.describe('Admin Pages - Selector Validation', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    const adminLogin = new AdminLoginPage(page);
    await adminLogin.navigate();
    await adminLogin.login('admin', 'trustmebro');
  });

  test('Company Verification Page - All selectors', async ({ page }) => {
    const companyVerification = new CompanyVerificationPage(page);
    await companyVerification.navigate();
    await companyVerification.waitForPageLoad();
    // Wait for data to load from API
    await page.waitForTimeout(2000);

    // Page structure
    await expect(companyVerification.pageTitle).toBeVisible({ timeout: 10000 });
    await expect(companyVerification.pageDescription).toBeVisible();
    await expect(companyVerification.sectionTitle).toBeVisible();
    await expect(companyVerification.table).toBeVisible();

    // Table headers
    await expect(companyVerification.tableHeaders.companyName).toBeVisible();
    await expect(companyVerification.tableHeaders.industry).toBeVisible();
    await expect(companyVerification.tableHeaders.contact).toBeVisible();
    await expect(companyVerification.tableHeaders.submitted).toBeVisible();
    await expect(companyVerification.tableHeaders.actions).toBeVisible();

    // Check table state
    const hasData = await companyVerification.getCompanyCount();
    console.log(`Found ${hasData} unverified companies`);

    if (hasData > 0) {
      // Verify action buttons exist
      await expect(companyVerification.viewButtons.first()).toBeVisible();
      await expect(companyVerification.reconsiderButtons.first()).toBeVisible();

      // Test getting company data
      const firstCompany = await companyVerification.getCompanyByIndex(0);
      console.log('First company:', firstCompany);
      expect(firstCompany.name).toBeTruthy();
    } else {
      // Verify empty state or loading state
      const isLoading = await companyVerification.isLoading();
      const isEmpty = await companyVerification.isEmpty();
      console.log(`Loading: ${isLoading}, Empty: ${isEmpty}`);
      expect(isLoading || isEmpty).toBe(true);
    }
  });

  test('Manage Companies Page - All selectors', async ({ page }) => {
    const manageCompanies = new ManageCompaniesPage(page);
    await manageCompanies.navigate();
    await manageCompanies.waitForPageLoad();
    // Wait for data to load from API
    await page.waitForTimeout(2000);

    // Page structure
    await expect(manageCompanies.pageTitle).toBeVisible({ timeout: 10000 });
    await expect(manageCompanies.pageDescription).toBeVisible();
    await expect(manageCompanies.sectionTitle).toBeVisible();
    await expect(manageCompanies.table).toBeVisible();

    // Table headers
    await expect(manageCompanies.tableHeaders.companyName).toBeVisible();
    await expect(manageCompanies.tableHeaders.industry).toBeVisible();
    await expect(manageCompanies.tableHeaders.contact).toBeVisible();
    await expect(manageCompanies.tableHeaders.status).toBeVisible();
    await expect(manageCompanies.tableHeaders.actions).toBeVisible();

    // Check table data
    const hasData = await manageCompanies.getCompanyCount();
    console.log(`Found ${hasData} companies`);

    if (hasData > 0) {
      await expect(manageCompanies.viewButtons.first()).toBeVisible();

      // Test getting company data and status
      const firstCompany = await manageCompanies.getCompanyByIndex(0);
      const status = await manageCompanies.getCompanyStatus(0);
      console.log('First company:', firstCompany, 'Status:', status);
      expect(firstCompany.name).toBeTruthy();

      // Check that at least one action button exists (depends on status)
      const actionCounts = {
        suspend: await manageCompanies.suspendButtons.count(),
        cancelSuspend: await manageCompanies.cancelSuspendButtons.count(),
        ban: await manageCompanies.banButtons.count(),
        unban: await manageCompanies.unbanButtons.count(),
      };
      console.log('Action buttons available:', actionCounts);
      const totalActions = Object.values(actionCounts).reduce((a, b) => a + b, 0);
      expect(totalActions).toBeGreaterThan(0);
    }
  });

  test('Manage CPSK Page - All selectors', async ({ page }) => {
    const manageCPSK = new ManageCPSKPage(page);
    await manageCPSK.navigate();
    await manageCPSK.waitForPageLoad();
    // Wait for data to load from API
    await page.waitForTimeout(2000);

    // Page structure
    await expect(manageCPSK.pageTitle).toBeVisible({ timeout: 10000 });
    await expect(manageCPSK.pageDescription).toBeVisible();
    await expect(manageCPSK.sectionTitle).toBeVisible();
    await expect(manageCPSK.table).toBeVisible();

    // Table headers
    await expect(manageCPSK.tableHeaders.name).toBeVisible();
    await expect(manageCPSK.tableHeaders.email).toBeVisible();
    await expect(manageCPSK.tableHeaders.department).toBeVisible();
    await expect(manageCPSK.tableHeaders.status).toBeVisible();
    await expect(manageCPSK.tableHeaders.actions).toBeVisible();

    // Check table data
    const hasData = await manageCPSK.getAccountCount();
    console.log(`Found ${hasData} CPSK accounts`);

    if (hasData > 0) {
      // ManageCPSK doesn't have View button, only action buttons based on status
      const actionCounts = {
        suspend: await manageCPSK.suspendButtons.count(),
        cancelSuspend: await manageCPSK.cancelSuspendButtons.count(),
        ban: await manageCPSK.banButtons.count(),
        unban: await manageCPSK.unbanButtons.count(),
      };
      console.log('Action buttons available:', actionCounts);
      const totalActions = Object.values(actionCounts).reduce((a, b) => a + b, 0);
      expect(totalActions).toBeGreaterThan(0);

      // Test getting account data
      const firstAccount = await manageCPSK.getAccountByIndex(0);
      const status = await manageCPSK.getAccountStatus(0);
      console.log('First CPSK account:', firstAccount, 'Status:', status);
      expect(firstAccount.name).toBeTruthy();
    }
  });

  test('Manage Job Posts Page - All selectors', async ({ page }) => {
    const manageJobPosts = new ManageJobPostsPage(page);
    await manageJobPosts.navigate();
    await manageJobPosts.waitForPageLoad();
    // Wait for data to load from API
    await page.waitForTimeout(2000);

    // Page structure
    await expect(manageJobPosts.pageTitle).toBeVisible({ timeout: 10000 });
    await expect(manageJobPosts.pageDescription).toBeVisible();
    await expect(manageJobPosts.sectionTitle).toBeVisible();
    await expect(manageJobPosts.table).toBeVisible();

    // Table headers
    await expect(manageJobPosts.tableHeaders.jobTitle).toBeVisible();
    await expect(manageJobPosts.tableHeaders.type).toBeVisible();
    await expect(manageJobPosts.tableHeaders.posted).toBeVisible();
    await expect(manageJobPosts.tableHeaders.reports).toBeVisible();
    await expect(manageJobPosts.tableHeaders.actions).toBeVisible();

    // Check table data
    const hasData = await manageJobPosts.getJobPostCount();
    console.log(`Found ${hasData} job posts`);

    if (hasData > 0) {
      await expect(manageJobPosts.viewButtons.first()).toBeVisible();
      await expect(manageJobPosts.deleteButtons.first()).toBeVisible();

      // Test getting job post data
      const firstPost = await manageJobPosts.getJobPostByIndex(0);
      const reportCount = await manageJobPosts.getReportCount(0);
      console.log('First job post:', firstPost, 'Reports:', reportCount);
      expect(firstPost.title).toBeTruthy();
    }
  });

  test('Manage Visitors Page - All selectors', async ({ page }) => {
    const manageVisitors = new ManageVisitorsPage(page);
    await manageVisitors.navigate();
    await manageVisitors.waitForPageLoad();
    // Wait for data to load from API
    await page.waitForTimeout(2000);

    // Page structure
    await expect(manageVisitors.pageTitle).toBeVisible({ timeout: 10000 });
    await expect(manageVisitors.pageDescription).toBeVisible();
    await expect(manageVisitors.sectionTitle).toBeVisible();
    await expect(manageVisitors.table).toBeVisible();

    // Table headers
    await expect(manageVisitors.tableHeaders.name).toBeVisible();
    await expect(manageVisitors.tableHeaders.email).toBeVisible();
    await expect(manageVisitors.tableHeaders.reports).toBeVisible();
    await expect(manageVisitors.tableHeaders.status).toBeVisible();
    await expect(manageVisitors.tableHeaders.actions).toBeVisible();

    // Check table data
    const hasData = await manageVisitors.getVisitorCount();
    console.log(`Found ${hasData} visitors`);

    if (hasData > 0) {
      await expect(manageVisitors.viewReportsButtons.first()).toBeVisible();

      // Test getting visitor data
      const firstVisitor = await manageVisitors.getVisitorByIndex(0);
      const reportCount = await manageVisitors.getReportCount(0);
      const status = await manageVisitors.getVisitorStatus(0);
      console.log('First visitor:', firstVisitor, 'Reports:', reportCount, 'Status:', status);
      expect(firstVisitor.name).toBeTruthy();
    }
  });

  test('Report Page - All selectors', async ({ page }) => {
    const reportPage = new ReportPage(page);
    await reportPage.navigate();
    await reportPage.waitForPageLoad();
    // Wait for data to load from API
    await page.waitForTimeout(2000);

    // Page structure
    await expect(reportPage.pageTitle).toBeVisible({ timeout: 10000 });
    await expect(reportPage.pageDescription).toBeVisible();
    await expect(reportPage.sectionTitle).toBeVisible();
    await expect(reportPage.table).toBeVisible();

    // Table headers
    await expect(reportPage.tableHeaders.reportedEntity).toBeVisible();
    await expect(reportPage.tableHeaders.type).toBeVisible();
    await expect(reportPage.tableHeaders.reason).toBeVisible();
    await expect(reportPage.tableHeaders.reportedBy).toBeVisible();
    await expect(reportPage.tableHeaders.submitted).toBeVisible();
    await expect(reportPage.tableHeaders.status).toBeVisible();
    await expect(reportPage.tableHeaders.actions).toBeVisible();

    // Check table data
    const hasData = await reportPage.getReportCount();
    console.log(`Found ${hasData} reports`);

    if (hasData > 0) {
      await expect(reportPage.viewEntityButtons.first()).toBeVisible();
      await expect(reportPage.reviewButtons.first()).toBeVisible();

      // Test getting report data
      const firstReport = await reportPage.getReportByIndex(0);
      const status = await reportPage.getReportStatus(0);
      console.log('First report:', firstReport, 'Status:', status);
      expect(firstReport.entity).toBeTruthy();
    }
  });

  test.skip('Visitor Reports Page - All selectors', async ({ page }) => {
    // This test is skipped by default because it requires a specific visitor ID
    // To run this test:
    // 1. Go to Manage Visitors page and note a visitor ID
    // 2. Replace 'VISITOR_ID_HERE' below with the actual ID
    // 3. Remove the .skip from the test

    const visitorId = 'VISITOR_ID_HERE'; // Replace with actual visitor ID

    const visitorReports = new VisitorReportsPage(page);
    await visitorReports.navigate(visitorId);

    // Page structure
    await expect(visitorReports.pageTitle).toBeVisible({ timeout: 10000 });
    await expect(visitorReports.pageDescription).toBeVisible();
    await expect(visitorReports.backButton).toBeVisible();
    await expect(visitorReports.sectionTitle).toBeVisible();
    await expect(visitorReports.table).toBeVisible();

    // Table headers
    await expect(visitorReports.tableHeaders.reportedEntity).toBeVisible();
    await expect(visitorReports.tableHeaders.type).toBeVisible();
    await expect(visitorReports.tableHeaders.reason).toBeVisible();
    await expect(visitorReports.tableHeaders.submitted).toBeVisible();
    await expect(visitorReports.tableHeaders.status).toBeVisible();
    await expect(visitorReports.tableHeaders.actions).toBeVisible();

    // Test back button
    await expect(visitorReports.backButton).toBeEnabled();

    // Check table data
    const hasData = await visitorReports.getReportCount();
    console.log(`Found ${hasData} reports for visitor ${visitorId}`);

    if (hasData > 0) {
      await expect(visitorReports.viewEntityButtons.first()).toBeVisible();

      // Test getting report data
      const firstReport = await visitorReports.getReportByIndex(0);
      console.log('First report:', firstReport);
      expect(firstReport.entity).toBeTruthy();
    }
  });
});

/**
 * Modal Interaction Tests
 * Test that modals can be opened and closed correctly
 */
test.describe('Admin Pages - Modal Interactions', () => {
  test.beforeEach(async ({ page }) => {
    const adminLogin = new AdminLoginPage(page);
    await adminLogin.navigate();
    await adminLogin.login('admin', 'trustmebro');
  });

  test('Company Verification - Reconsider modal', async ({ page }) => {
    const companyVerification = new CompanyVerificationPage(page);
    await companyVerification.navigate();

    const hasData = await companyVerification.getCompanyCount();

    if (hasData > 0) {
      // Open reconsider modal
      await companyVerification.reconsiderCompany(0);
      await expect(companyVerification.reconsiderModal).toBeVisible();

      // Close modal
      await companyVerification.cancelReconsider();
      await expect(companyVerification.reconsiderModal).not.toBeVisible();

      console.log('✅ Reconsider modal can open and close');
    } else {
      console.log('⚠️ Skipping modal test - no companies to test with');
    }
  });

  test('Manage Companies - Suspend modal', async ({ page }) => {
    const manageCompanies = new ManageCompaniesPage(page);
    await manageCompanies.navigate();

    const hasData = await manageCompanies.getCompanyCount();
    const hasSuspendBtn = (await manageCompanies.suspendButtons.count()) > 0;

    if (hasData > 0 && hasSuspendBtn) {
      // Open suspend modal
      await manageCompanies.suspendCompany(0);
      await expect(manageCompanies.suspendModal).toBeVisible();

      // Close modal
      await manageCompanies.cancelSuspendAction();
      await expect(manageCompanies.suspendModal).not.toBeVisible();

      console.log('✅ Suspend modal can open and close');
    } else {
      console.log('⚠️ Skipping modal test - no active companies to test with');
    }
  });

  test('Manage Job Posts - Delete modal', async ({ page }) => {
    const manageJobPosts = new ManageJobPostsPage(page);
    await manageJobPosts.navigate();

    const hasData = await manageJobPosts.getJobPostCount();

    if (hasData > 0) {
      // Open delete modal
      await manageJobPosts.deleteJobPost(0);
      await expect(manageJobPosts.deleteModal).toBeVisible();

      // Close modal
      await manageJobPosts.cancelDelete();
      await expect(manageJobPosts.deleteModal).not.toBeVisible();

      console.log('✅ Delete modal can open and close');
    } else {
      console.log('⚠️ Skipping modal test - no job posts to test with');
    }
  });

  test('Report Page - Review modal', async ({ page }) => {
    const reportPage = new ReportPage(page);
    await reportPage.navigate();

    const hasData = await reportPage.getReportCount();

    if (hasData > 0) {
      // Open review modal
      await reportPage.reviewReport(0);
      await expect(reportPage.reviewModal).toBeVisible();

      // Close modal
      await reportPage.closeReviewModal();
      await expect(reportPage.reviewModal).not.toBeVisible();

      console.log('✅ Review modal can open and close');
    } else {
      console.log('⚠️ Skipping modal test - no reports to test with');
    }
  });
});
