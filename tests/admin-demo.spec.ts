import { test, expect } from './fixtures';
import {
  AdminLoginPage,
  AdminDashboardPage,
  CompanyVerificationPage,
  ReportPage,
  ManageJobPostsPage,
  ManageCompaniesPage,
  ManageCPSKPage,
  ManageVisitorsPage,
} from './pages';

/**
 * Admin Demo E2E Test
 * Demonstrates admin portal functionality for demo purposes
 *
 * This test showcases the complete admin workflow:
 * 1. Admin login
 * 2. Dashboard overview
 * 3. Company verification - reconsider 1 company
 * 4. Review reports - review and resolve 1 report
 * 5. Manage job posts - delete 1 job post
 * 6. Manage companies - ban 1 company
 * 7. Manage CPSK - ban 1 CPSK account
 * 8. Manage visitors - ban 1 visitor
 */

test.describe('Admin Demo Journey', () => {
  test('complete admin demo flow', async ({ page }) => {
    // Initialize page objects
    const adminLoginPage = new AdminLoginPage(page);
    const adminDashboardPage = new AdminDashboardPage(page);
    const companyVerificationPage = new CompanyVerificationPage(page);
    const reportPage = new ReportPage(page);
    const manageJobPostsPage = new ManageJobPostsPage(page);
    const manageCompaniesPage = new ManageCompaniesPage(page);
    const manageCPSKPage = new ManageCPSKPage(page);
    const manageVisitorsPage = new ManageVisitorsPage(page);

    // ==========================================
    // STEP 1: Admin Login
    // ==========================================
    await test.step('Step 1: Admin login', async () => {
      await adminLoginPage.navigate();

      // Verify we're on the login page
      await expect(page).toHaveURL('/admin/login');
      await expect(page.getByRole('heading', { name: /admin portal/i })).toBeVisible();

      // Perform login with default credentials
      await adminLoginPage.login(
        AdminLoginPage.DEFAULT_CREDENTIALS.username,
        AdminLoginPage.DEFAULT_CREDENTIALS.password
      );

      // Wait for redirect to dashboard
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL('/admin/dashboard');
      await expect(adminDashboardPage.dashboardTitle).toBeVisible();
    });

    // ==========================================
    // STEP 2: Show Dashboard
    // ==========================================
    await test.step('Step 2: Show dashboard', async () => {
      await adminDashboardPage.navigate();

      // Wait for dashboard to fully load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify all stat cards are visible
      await expect(adminDashboardPage.totalJobPostsCard).toBeVisible();
      await expect(adminDashboardPage.openReportsCard).toBeVisible();
      await expect(adminDashboardPage.verifiedCompaniesCard).toBeVisible();
      await expect(adminDashboardPage.unverifiedCompaniesCard).toBeVisible();
      await expect(adminDashboardPage.activeCPSKCard).toBeVisible();
      await expect(adminDashboardPage.totalVisitorsCard).toBeVisible();

      // Pause to show dashboard
      await page.waitForTimeout(3000);
    });

    // ==========================================
    // STEP 3: Company Verification - Reconsider
    // ==========================================
    await test.step('Step 3: Company verification - reconsider 1 company', async () => {
      await adminDashboardPage.goToCompanyVerification();
      await expect(page).toHaveURL('/admin/company-verification');

      // Wait for page to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify we're on the company verification page
      await expect(companyVerificationPage.pageTitle).toBeVisible();

      // Check if there are companies to reconsider
      const companyCount = await companyVerificationPage.getCompanyCount();

      if (companyCount > 0) {
        // Get first company name for demo
        const company = await companyVerificationPage.getCompanyByIndex(0);
        console.log(`Reconsidering company: ${company.name}`);

        // Click reconsider button
        await companyVerificationPage.reconsiderCompany(0);

        // Wait for modal to appear
        await page.waitForTimeout(1000);
        await expect(companyVerificationPage.reconsiderModal).toBeVisible();

        // Pause to show modal
        await page.waitForTimeout(2000);

        // Confirm reconsider action
        await companyVerificationPage.confirmReconsider();
        await companyVerificationPage.closeSuccessModal();

        // Wait for action to complete
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log('Company reconsidered successfully');
      } else {
        console.log('No unverified companies available to reconsider');
      }
    });

    // ==========================================
    // STEP 4: Review Reports - Review and Resolve
    // ==========================================
    await test.step('Step 4: Review reports - review and resolve 1 report', async () => {
      await adminDashboardPage.goToReports();
      await expect(page).toHaveURL('/admin/report');

      // Wait for page to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify we're on the reports page
      await expect(reportPage.pageTitle).toBeVisible();

      // Check if there are reports to review
      const reportCount = await reportPage.getReportCount();

      if (reportCount > 0) {
        // Get first report for demo
        const report = await reportPage.getReportByIndex(0);
        console.log(`Reviewing report: ${report.entity} - ${report.reason}`);

        // Click review button
        await reportPage.reviewReport(0);

        // Wait for modal to appear
        await page.waitForTimeout(1000);
        await expect(reportPage.reviewModal).toBeVisible();

        // Pause to show modal
        await page.waitForTimeout(500);

        // Mark as resolved
        await reportPage.markAsResolved('Reviewed during demo - resolved');

        // Wait for action to complete
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log('Report resolved successfully');
      } else {
        console.log('No reports available to review');
      }
    });

    // ==========================================
    // STEP 5: Manage Job Posts - Delete
    // ==========================================
    await test.step('Step 5: Manage job posts - delete 1 job post', async () => {
      await adminDashboardPage.goToManageJobPosts();
      await expect(page).toHaveURL('/admin/manage-job-posts');

      // Wait for page to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify we're on the manage job posts page
      await expect(manageJobPostsPage.pageTitle).toBeVisible();

      // Check if there are job posts to delete
      const jobPostCount = await manageJobPostsPage.getJobPostCount();

      if (jobPostCount > 0) {
        // Get first job post for demo
        const jobPost = await manageJobPostsPage.getJobPostByIndex(0);
        console.log(`Deleting job post: ${jobPost.title}`);

        // Click delete button
        await manageJobPostsPage.deleteJobPost(0);

        // Wait for modal to appear
        await page.waitForTimeout(1000);
        await expect(manageJobPostsPage.deleteModal).toBeVisible();

        // Pause to show modal
        await page.waitForTimeout(2000);

        // Confirm delete action
        await manageJobPostsPage.confirmDelete();
        await manageJobPostsPage.closeSuccessModal();

        // Wait for action to complete
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log('Job post deleted successfully');
      } else {
        console.log('No job posts available to delete');
      }
    });

    // ==========================================
    // STEP 6: Manage Companies - Ban
    // ==========================================
    await test.step('Step 6: Manage companies - ban 1 company', async () => {
      await adminDashboardPage.goToManageCompany();
      await expect(page).toHaveURL('/admin/manage-company');

      // Wait for page to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify we're on the manage companies page
      await expect(manageCompaniesPage.pageTitle).toBeVisible();

      // Check if there are companies to ban
      const companyCount = await manageCompaniesPage.getCompanyCount();

      if (companyCount > 0) {
        // Find an active company to ban
        let companyIndex = 0;
        let foundActiveCompany = false;

        for (let i = 0; i < companyCount; i++) {
          const status = await manageCompaniesPage.getCompanyStatus(i);
          if (status?.toLowerCase().includes('active')) {
            companyIndex = i;
            foundActiveCompany = true;
            break;
          }
        }

        if (foundActiveCompany) {
          const company = await manageCompaniesPage.getCompanyByIndex(companyIndex);
          console.log(`Banning company: ${company.name}`);

          // Click ban button
          await manageCompaniesPage.banCompany(companyIndex);

          // Wait for modal to appear
          await page.waitForTimeout(1000);
          await expect(manageCompaniesPage.banModal).toBeVisible();

          // Pause to show modal
          await page.waitForTimeout(2000);

          // Confirm ban action
          await manageCompaniesPage.confirmBan();

          // Wait for action to complete
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          console.log('Company banned successfully');
        } else {
          console.log('No active companies available to ban');
        }
      } else {
        console.log('No companies available to ban');
      }
    });

    // ==========================================
    // STEP 7: Manage CPSK - Ban
    // ==========================================
    await test.step('Step 7: Manage CPSK - ban 1 CPSK account', async () => {
      await adminDashboardPage.goToManageCPSK();
      await expect(page).toHaveURL('/admin/manage-cpsk');

      // Wait for page to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify we're on the manage CPSK page
      await expect(manageCPSKPage.pageTitle).toBeVisible();

      // Check if there are CPSK accounts to ban
      const accountCount = await manageCPSKPage.getAccountCount();

      if (accountCount > 0) {
        // Find an active CPSK account to ban
        let accountIndex = 0;
        let foundActiveAccount = false;

        for (let i = 0; i < accountCount; i++) {
          const status = await manageCPSKPage.getAccountStatus(i);
          if (status?.toLowerCase().includes('active')) {
            accountIndex = i;
            foundActiveAccount = true;
            break;
          }
        }

        if (foundActiveAccount) {
          const account = await manageCPSKPage.getAccountByIndex(accountIndex);
          console.log(`Banning CPSK account: ${account.name}`);

          // Click ban button
          await manageCPSKPage.banAccount(accountIndex);

          // Wait for modal to appear
          await page.waitForTimeout(1000);
          await expect(manageCPSKPage.banModal).toBeVisible();

          // Pause to show modal
          await page.waitForTimeout(2000);

          // Confirm ban action
          await manageCPSKPage.confirmBan();

          // Wait for action to complete
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          console.log('CPSK account banned successfully');
        } else {
          console.log('No active CPSK accounts available to ban');
        }
      } else {
        console.log('No CPSK accounts available to ban');
      }
    });

    // ==========================================
    // STEP 8: Manage Visitors - Ban
    // ==========================================
    await test.step('Step 8: Manage visitors - ban 1 visitor', async () => {
      await adminDashboardPage.goToManageVisitors();
      await expect(page).toHaveURL('/admin/manage-visitors');

      // Wait for page to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Verify we're on the manage visitors page
      await expect(manageVisitorsPage.pageTitle).toBeVisible();

      // Check if there are visitors to ban
      const visitorCount = await manageVisitorsPage.getVisitorCount();

      if (visitorCount > 0) {
        // Find an active visitor to ban
        let visitorIndex = 0;
        let foundActiveVisitor = false;

        for (let i = 0; i < visitorCount; i++) {
          const status = await manageVisitorsPage.getVisitorStatus(i);
          if (status?.toLowerCase().includes('active')) {
            visitorIndex = i;
            foundActiveVisitor = true;
            break;
          }
        }

        if (foundActiveVisitor) {
          const visitor = await manageVisitorsPage.getVisitorByIndex(visitorIndex);
          console.log(`Banning visitor: ${visitor.name}`);

          // Click ban button
          await manageVisitorsPage.banVisitor(visitorIndex);

          // Wait for modal to appear
          await page.waitForTimeout(1000);
          await expect(manageVisitorsPage.banModal).toBeVisible();

          // Pause to show modal
          await page.waitForTimeout(2000);

          // Confirm ban action
          await manageVisitorsPage.confirmBan();

          // Wait for action to complete
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);

          console.log('Visitor banned successfully');
        } else {
          console.log('No active visitors available to ban');
        }
      } else {
        console.log('No visitors available to ban');
      }
    });

    // ==========================================
    // DEMO COMPLETE
    // ==========================================
    await test.step('Demo complete - return to dashboard', async () => {
      await adminDashboardPage.goToDashboard();
      await expect(page).toHaveURL('/admin/dashboard');

      // Final pause to show dashboard
      await page.waitForTimeout(2000);

      console.log('='.repeat(50));
      console.log('Admin demo completed successfully!');
      console.log('='.repeat(50));
    });
  });
});
