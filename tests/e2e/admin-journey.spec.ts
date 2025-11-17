import { test, expect } from '../fixtures';
import { AdminLoginPage } from '../pages';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../utils/test-data';

/**
 * Admin Journey Tests
 * Based on HireMeMaybe Frontend E2E Test Plan - Section 4.4
 *
 * Coverage:
 * - ADM-01: Admin login/logout
 * - ADM-02: Dashboard stats
 * - ADM-03: Company verification workflow
 * - ADM-04: Manage job posts
 * - ADM-05: Manage CPSK accounts
 * - ADM-06: Visitor reports
 * - ADM-07: Auth guard enforced
 */

test.describe('Admin Journey Tests', () => {
  test.describe('ADM-01: Admin login/logout', () => {
    test('should successfully login with valid credentials', async ({
      adminLoginPage,
      adminDashboardPage,
      page,
    }) => {
      // Navigate to admin login page
      await adminLoginPage.navigate();

      // Verify we're on the login page
      await expect(page).toHaveURL('/admin/login');
      await expect(page.getByRole('heading', { name: /admin portal/i })).toBeVisible();

      // Perform login with default credentials
      await adminLoginPage.login(
        AdminLoginPage.DEFAULT_CREDENTIALS.username,
        AdminLoginPage.DEFAULT_CREDENTIALS.password
      );

      // Should redirect to dashboard
      await page.waitForTimeout(500);
      await expect(page).toHaveURL('/admin/dashboard');
      await expect(adminDashboardPage.dashboardTitle).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ adminLoginPage, page }) => {
      await adminLoginPage.navigate();

      // Try to login with invalid credentials
      await adminLoginPage.login('invalid_user', 'wrong_password');

      // Should show error message
      await expect(adminLoginPage.errorMessage).toBeVisible();

      const errorText = await adminLoginPage.getErrorMessage();
      expect(errorText?.toLowerCase()).toMatch(/invalid|incorrect|failed|wrong/i);

      // Should remain on login page
      await expect(page).toHaveURL('/admin/login');
    });

    test('should toggle password visibility', async ({ adminLoginPage }) => {
      await adminLoginPage.navigate();

      // Password should be hidden by default
      await expect(adminLoginPage.passwordInput).toHaveAttribute('type', 'password');

      // Toggle visibility
      await adminLoginPage.togglePasswordVisibility();

      // Password should now be visible
      await expect(adminLoginPage.passwordInput).toHaveAttribute('type', 'text');

      // Toggle back
      await adminLoginPage.togglePasswordVisibility();

      // Password should be hidden again
      await expect(adminLoginPage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('should logout and clear token', async ({ adminLoginPage, adminDashboardPage, page }) => {
      // Login first
      await adminLoginPage.loginWithDefaults();
      await expect(page).toHaveURL('/admin/dashboard');

      // Logout
      await adminDashboardPage.logout();

      // Should redirect to login page
      await expect(page).toHaveURL('/admin/login');

      // Verify localStorage token is cleared
      const isAuth = await adminLoginPage.isAuthenticated();
      expect(isAuth).toBeFalsy();
    });

    test('should redirect to dashboard if already authenticated', async ({
      adminLoginPage,
      page,
    }) => {
      // Set up authentication state
      await adminLoginPage.loginWithDefaults();
      await expect(page).toHaveURL('/admin/dashboard');

      // Try to navigate back to login page
      await adminLoginPage.navigate();

      // Should automatically redirect to dashboard
      await page.waitForURL('/admin/dashboard');
      await expect(page).toHaveURL('/admin/dashboard');
    });
  });

  test.describe('ADM-02: Dashboard stats', () => {
    test.beforeEach(async ({ adminLoginPage, page }) => {
      // Login before each test
      await adminLoginPage.loginWithDefaults();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL('/admin/dashboard');
    });

    test('should display all dashboard stat cards', async ({ adminDashboardPage, page }) => {
      await adminDashboardPage.navigate();

      // Wait for cards to load
      await page.waitForTimeout(1000);

      // Verify all stat cards are visible
      await expect(adminDashboardPage.totalJobPostsCard).toBeVisible();
      await expect(adminDashboardPage.openReportsCard).toBeVisible();
      await expect(adminDashboardPage.verifiedCompaniesCard).toBeVisible();
      await expect(adminDashboardPage.unverifiedCompaniesCard).toBeVisible();
      await expect(adminDashboardPage.activeCPSKCard).toBeVisible();
      await expect(adminDashboardPage.totalVisitorsCard).toBeVisible();
    });

    test('should load metrics from backend', async ({ adminDashboardPage, page }) => {
      await adminDashboardPage.navigate();

      // Wait for data to load
      await page.waitForLoadState('networkidle');

      // Verify cards contain numeric values
      const totalJobPosts = await adminDashboardPage.getTotalJobPosts();
      const openReports = await adminDashboardPage.getOpenReports();
      const verifiedCompanies = await adminDashboardPage.getVerifiedCompanies();
      const activeCPSK = await adminDashboardPage.getActiveCPSK();
      const totalVisitors = await adminDashboardPage.getTotalVisitors();

      // All should contain numbers (may be 0)
      expect(totalJobPosts).toMatch(/\d+/);
      expect(openReports).toMatch(/\d+/);
      expect(verifiedCompanies).toMatch(/\d+/);
      expect(activeCPSK).toMatch(/\d+/);
      expect(totalVisitors).toMatch(/\d+/);
    });

    test('should have clickable stat cards that navigate to respective pages', async ({
      adminDashboardPage,
      page,
    }) => {
      await adminDashboardPage.navigate();
      await page.waitForTimeout(1000);

      // Click on verified companies card
      await adminDashboardPage.verifiedCompaniesCard.click();
      await page.waitForLoadState('networkidle');

      // Should navigate to manage companies or company verification
      expect(page.url()).toMatch(/\/admin\/(manage-company|company-verification)/);
    });
  });

  test.describe('ADM-03: Company verification workflow', () => {
    test.beforeEach(async ({ adminLoginPage, page }) => {
      await adminLoginPage.loginWithDefaults();
      await expect(page).toHaveURL('/admin/dashboard');
    });

    test('should display company verification page', async ({ page }) => {
      await page.goto('/admin/company-verification');

      // Verify page title and description
      await expect(page.getByRole('heading', { name: /company verification/i })).toBeVisible();

      await expect(
        page.getByText(/review and reconsider unverified company registrations/i)
      ).toBeVisible();
    });

    test('should list unverified companies', async ({ page }) => {
      await page.goto('/admin/company-verification');
      await page.waitForLoadState('networkidle');

      // Check if table exists
      const table = page.locator('table');
      await expect(table).toBeVisible();

      // Check for either companies or empty message
      const hasCompanies = (await page.locator('table tbody tr').count()) > 0;
      const hasEmptyMessage = await page
        .getByText(/no unverified companies found/i)
        .isVisible()
        .catch(() => false);

      expect(hasCompanies || hasEmptyMessage).toBeTruthy();
    });

    test('should have functional view and reconsider buttons', async ({ page }) => {
      await page.goto('/admin/company-verification');
      await page.waitForLoadState('networkidle');

      // Check if there are any companies
      const rowCount = await page.locator('table tbody tr').count();

      if (rowCount > 0) {
        // Verify buttons exist
        const viewButton = page.getByRole('button', { name: /view/i }).first();
        const reconsiderButton = page.getByRole('button', { name: /reconsider/i }).first();

        await expect(viewButton).toBeVisible();
        await expect(reconsiderButton).toBeVisible();
      }
    });

    test('should open reconsider modal and update status', async ({ page }) => {
      await page.goto('/admin/company-verification');
      await page.waitForLoadState('networkidle');

      const rowCount = await page.locator('table tbody tr').count();

      if (rowCount > 0) {
        // Click reconsider button on first company
        const reconsiderButton = page.getByRole('button', { name: /reconsider/i }).first();
        await reconsiderButton.click();

        // Modal should appear
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Confirm the action
        const confirmButton = modal.getByRole('button', { name: /confirm|reconsider/i });
        await confirmButton.click();

        // Should show success or update the list
        await page.waitForLoadState('networkidle');

        // Verify modal closed or success message shown
        const modalVisible = await modal.isVisible().catch(() => false);
        expect(modalVisible).toBeFalsy();
      }
    });
  });

  test.describe('ADM-04: Manage job posts', () => {
    test.beforeEach(async ({ adminLoginPage, page }) => {
      await adminLoginPage.loginWithDefaults();
      await expect(page).toHaveURL('/admin/dashboard');
    });

    test('should display manage job posts page', async ({ page }) => {
      await page.goto('/admin/manage-job-posts');

      // Verify page title
      await expect(page.getByRole('heading', { name: /manage job posts/i })).toBeVisible();

      // Verify table exists
      const table = page.locator('table');
      await expect(table).toBeVisible();
    });

    test('should list all job posts with correct columns', async ({ page }) => {
      await page.goto('/admin/manage-job-posts');
      await page.waitForLoadState('networkidle');

      // Verify table headers
      await expect(page.locator('th').filter({ hasText: /job title/i })).toBeVisible();
      await expect(page.locator('th').filter({ hasText: /type/i })).toBeVisible();
      await expect(page.locator('th').filter({ hasText: /posted/i })).toBeVisible();
      await expect(page.locator('th').filter({ hasText: /reports/i })).toBeVisible();
      await expect(page.locator('th').filter({ hasText: /actions/i })).toBeVisible();
    });

    test('should have view and delete buttons for each job', async ({ page }) => {
      await page.goto('/admin/manage-job-posts');
      await page.waitForLoadState('networkidle');

      const rowCount = await page.locator('table tbody tr').count();

      if (rowCount > 0) {
        // Verify action buttons exist
        const viewButton = page.getByRole('button', { name: /view/i }).first();
        const deleteButton = page.getByRole('button', { name: /delete/i }).first();

        await expect(viewButton).toBeVisible();
        await expect(deleteButton).toBeVisible();
      }
    });

    test('should open delete confirmation modal', async ({ page }) => {
      await page.goto('/admin/manage-job-posts');
      await page.waitForLoadState('networkidle');

      const rowCount = await page.locator('table tbody tr').count();

      if (rowCount > 0) {
        // Click delete button
        const deleteButton = page.getByRole('button', { name: /delete/i }).first();
        await deleteButton.click();

        // Modal should appear
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        await expect(modal.getByText(/delete/i)).toBeVisible();

        // Cancel the deletion
        const cancelButton = modal.getByRole('button', { name: /cancel/i });
        await cancelButton.click();

        // Modal should close
        await expect(modal).not.toBeVisible();
      }
    });

    test('should navigate to job details when view is clicked', async ({ page }) => {
      await page.goto('/admin/manage-job-posts');
      await page.waitForLoadState('networkidle');

      const rowCount = await page.locator('table tbody tr').count();

      if (rowCount > 0) {
        // Click view button
        const viewButton = page.getByRole('button', { name: /view/i }).first();
        await viewButton.click();

        await page.waitForLoadState('networkidle');

        // Should navigate to job detail page
        expect(page.url()).toMatch(/\/job-post\/\d+/);
      }
    });
  });

  test.describe('ADM-05: Manage CPSK accounts', () => {
    test.beforeEach(async ({ adminLoginPage, page }) => {
      await adminLoginPage.loginWithDefaults();
      await expect(page).toHaveURL('/admin/dashboard');
    });

    test('should display manage CPSK page', async ({ page }) => {
      await page.goto('/admin/manage-cpsk');

      // Verify page title
      await expect(page.getByRole('heading', { name: /manage cpsk/i })).toBeVisible();

      // Verify table exists
      const table = page.locator('table');
      await expect(table).toBeVisible();
    });

    test('should list CPSK accounts with status', async ({ page }) => {
      await page.goto('/admin/manage-cpsk');
      await page.waitForLoadState('networkidle');

      // Check if there are accounts
      const rowCount = await page.locator('table tbody tr').count();

      if (rowCount > 0) {
        // Verify first row has status badge
        const firstRow = page.locator('table tbody tr').first();
        const statusCell = firstRow.locator('td').nth(3);

        await expect(statusCell).toBeVisible();

        // Status should be one of: Active, Suspended, Banned
        const statusText = await statusCell.textContent();
        expect(statusText).toMatch(/Active|Suspended|Banned/i);
      }
    });

    test('should have appropriate action buttons based on status', async ({ page }) => {
      await page.goto('/admin/manage-cpsk');
      await page.waitForLoadState('networkidle');

      const rowCount = await page.locator('table tbody tr').count();

      if (rowCount > 0) {
        // Check for action buttons
        const hasView = (await page.getByRole('button', { name: /^view$/i }).count()) > 0;
        const hasSuspend = (await page.getByRole('button', { name: /^suspend$/i }).count()) > 0;
        const hasBan = (await page.getByRole('button', { name: /^ban$/i }).count()) > 0;

        // At least view button should exist
        expect(hasView).toBeTruthy();

        // Suspend or ban buttons should exist depending on account status
        expect(hasSuspend || hasBan).toBeTruthy();
      }
    });

    test('should open suspend modal with date fields', async ({ page }) => {
      await page.goto('/admin/manage-cpsk');
      await page.waitForLoadState('networkidle');

      const suspendButton = page.getByRole('button', { name: /^suspend$/i }).first();
      const buttonCount = await suspendButton.count();

      if (buttonCount > 0) {
        await suspendButton.click();

        // Modal should appear
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Should have date fields
        await expect(modal.getByLabel(/start date/i)).toBeVisible();
        await expect(modal.getByLabel(/end date/i)).toBeVisible();

        // Close modal
        const cancelButton = modal.getByRole('button', { name: /cancel/i });
        await cancelButton.click();
      }
    });

    test('should open ban confirmation modal', async ({ page }) => {
      await page.goto('/admin/manage-cpsk');
      await page.waitForLoadState('networkidle');

      const banButton = page.getByRole('button', { name: /^ban$/i }).first();
      const buttonCount = await banButton.count();

      if (buttonCount > 0) {
        await banButton.click();

        // Modal should appear
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        await expect(modal.getByText(/ban/i)).toBeVisible();

        // Close modal
        const cancelButton = modal.getByRole('button', { name: /cancel/i });
        await cancelButton.click();
      }
    });
  });

  test.describe('ADM-06: Visitor reports', () => {
    test.beforeEach(async ({ adminLoginPage, page }) => {
      await adminLoginPage.loginWithDefaults();
      await expect(page).toHaveURL('/admin/dashboard');
    });

    test('should display manage visitors page', async ({ page }) => {
      await page.goto('/admin/manage-visitors');

      // Verify page title
      await expect(page.getByRole('heading', { name: /manage visitors/i })).toBeVisible();
    });

    test('should list visitor accounts', async ({ page }) => {
      await page.goto('/admin/manage-visitors');
      await page.waitForLoadState('networkidle');

      // Verify table exists
      const table = page.locator('table');
      await expect(table).toBeVisible();
    });

    test('should navigate to visitor reports page', async ({ page }) => {
      await page.goto('/admin/manage-visitors');
      await page.waitForLoadState('networkidle');

      const rowCount = await page.locator('table tbody tr').count();

      if (rowCount > 0) {
        // Click view reports button
        const viewReportsButton = page.getByRole('button', { name: /view reports/i }).first();

        if (await viewReportsButton.isVisible()) {
          await viewReportsButton.click();
          await page.waitForLoadState('networkidle');

          // Should navigate to visitor reports page
          expect(page.url()).toMatch(/\/admin\/visitor-reports\/\d+/);
        }
      }
    });

    test('should display visitor reports with correct structure', async ({ page }) => {
      // First navigate to manage visitors to get a visitor ID
      await page.goto('/admin/manage-visitors');
      await page.waitForLoadState('networkidle');

      const rowCount = await page.locator('table tbody tr').count();

      if (rowCount > 0) {
        const viewReportsButton = page.getByRole('button', { name: /view reports/i }).first();

        if (await viewReportsButton.isVisible()) {
          await viewReportsButton.click();
          await page.waitForLoadState('networkidle');

          // Verify reports page structure
          await expect(page.getByRole('heading', { name: /visitor reports/i })).toBeVisible();

          // Verify back button exists
          await expect(
            page.getByRole('button', { name: /back to manage visitors/i })
          ).toBeVisible();

          // Verify table exists with correct headers
          const table = page.locator('table');
          await expect(table).toBeVisible();
        }
      }
    });
  });

  test.describe('ADM-07: Auth guard enforced', () => {
    test('should redirect to login when accessing admin pages without auth', async ({
      adminLoginPage,
      page,
    }) => {
      // Clear any existing auth
      await adminLoginPage.navigate();
      await adminLoginPage.clearAuth();

      const adminRoutes = [
        '/admin/dashboard',
        '/admin/company-verification',
        '/admin/manage-company',
        '/admin/manage-cpsk',
        '/admin/manage-job-posts',
        '/admin/manage-visitors',
        '/admin/report',
      ];

      for (const route of adminRoutes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');

        // Should redirect to login page
        expect(page.url()).toContain('/admin/login');
      }
    });

    test('should not allow access with invalid token', async ({ adminLoginPage, page }) => {
      // Set invalid token
      await adminLoginPage.navigate();
      await adminLoginPage.setToken('invalid_token_12345');

      // Try to access admin page
      await page.goto('/admin/dashboard');
      await page.waitForLoadState('networkidle');

      // Should redirect to login or show error
      expect(page.url()).toContain('/admin/login');
    });

    test('should maintain authentication across page refreshes', async ({
      adminLoginPage,
      page,
    }) => {
      // Login
      await adminLoginPage.navigate();
      await adminLoginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
      await expect(page).toHaveURL('/admin/dashboard');

      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be on dashboard
      await expect(page).toHaveURL('/admin/dashboard');
      await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible();
    });

    test('should enforce auth on direct URL navigation', async ({ adminLoginPage, page }) => {
      // Clear auth
      await adminLoginPage.navigate();
      await adminLoginPage.clearAuth();

      // Try to directly navigate via URL bar (simulate)
      await page.goto('/admin/manage-cpsk');
      await page.waitForLoadState('networkidle');

      // Should be redirected to login
      expect(page.url()).toContain('/admin/login');
    });
  });

  test.describe('Admin Dashboard Navigation', () => {
    test.beforeEach(async ({ adminLoginPage, page }) => {
      await adminLoginPage.loginWithDefaults();
      await expect(page).toHaveURL('/admin/dashboard');
    });

    test('should navigate to all admin pages from dashboard', async ({
      adminDashboardPage,
      page,
    }) => {
      await adminDashboardPage.navigate();

      // Test Company Verification navigation
      await adminDashboardPage.goToCompanyVerification();
      await expect(page).toHaveURL('/admin/company-verification');

      await adminDashboardPage.goToDashboard();
      await expect(page).toHaveURL('/admin/dashboard');

      // Test Manage Company navigation
      await adminDashboardPage.goToManageCompany();
      await expect(page).toHaveURL('/admin/manage-company');

      await adminDashboardPage.goToDashboard();

      // Test Manage CPSK navigation
      await adminDashboardPage.goToManageCPSK();
      await expect(page).toHaveURL('/admin/manage-cpsk');

      await adminDashboardPage.goToDashboard();

      // Test Manage Job Posts navigation
      await adminDashboardPage.goToManageJobPosts();
      await expect(page).toHaveURL('/admin/manage-job-posts');

      await adminDashboardPage.goToDashboard();

      // Test Manage Visitors navigation
      await adminDashboardPage.goToManageVisitors();
      await expect(page).toHaveURL('/admin/manage-visitors');

      await adminDashboardPage.goToDashboard();

      // Test Reports navigation
      await adminDashboardPage.goToReports();
      await expect(page).toHaveURL('/admin/report');
    });

    test('should have consistent sidebar navigation across all pages', async ({ page }) => {
      const adminPages = [
        '/admin/dashboard',
        '/admin/company-verification',
        '/admin/manage-company',
        '/admin/manage-cpsk',
        '/admin/manage-job-posts',
        '/admin/manage-visitors',
      ];

      for (const adminPage of adminPages) {
        await page.goto(adminPage);
        await page.waitForLoadState('networkidle');

        // Verify sidebar navigation links exist
        await expect(page.getByRole('link', { name: /^dashboard$/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /company verification/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /manage company/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /manage cpsk/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /manage job posts/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /manage visitors/i })).toBeVisible();
      }
    });
  });
});
