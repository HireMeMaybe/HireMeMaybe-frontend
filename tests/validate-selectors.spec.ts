import { test, expect } from '@playwright/test';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { CompanyRegisterPage, LandingPage, CPSKRegisterPage } from './pages';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

test.describe('Selector smoke validation', () => {
  test('Landing page basic elements', async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.navigate();
    await expect(landing.navBar).toBeVisible({ timeout: 5000 });
    await expect(landing.footer).toBeVisible();
    await expect(landing.joinButton).toBeVisible();
    await expect(landing.companyCard).toBeVisible();
    await expect(landing.cpskCard).toBeVisible();
    await expect(landing.visitorCard).toBeVisible();
  });

  test('Company register form fields', async ({ page }) => {
    const companyRegister = new CompanyRegisterPage(page);
    await companyRegister.navigate();
    await expect(companyRegister.companyNameInput).toBeVisible();
    await expect(companyRegister.emailInput).toBeVisible();
    await expect(companyRegister.phoneInput).toBeVisible();
    await expect(companyRegister.industryTrigger).toBeVisible();
    await expect(companyRegister.companySizeTrigger).toBeVisible();
    await expect(companyRegister.overviewTextarea).toBeVisible();
    await expect(companyRegister.logoUpload).toBeVisible();
    await expect(companyRegister.bannerUpload).toBeVisible();
    await expect(companyRegister.submitButton).toBeVisible();
  });

  test.skip('CPSK register form fields', async ({ page }) => {
    const cpskRegister = new CPSKRegisterPage(page);
    await cpskRegister.navigate();

    await expect(cpskRegister.firstNameInput).toBeVisible();
    await expect(cpskRegister.lastNameInput).toBeVisible();
    await expect(cpskRegister.emailInput).toBeVisible();
    await expect(cpskRegister.phoneInput).toBeVisible();
    await expect(cpskRegister.programCPE).toBeVisible();
    await expect(cpskRegister.programSKE).toBeVisible();
    await expect(cpskRegister.yearRadioGroup).toBeVisible();
    await expect(cpskRegister.resumeUpload).toBeVisible();
    await expect(cpskRegister.softSkillInput).toBeVisible();
    await expect(cpskRegister.submitButton).toBeVisible();
  });

  test('Admin login page components', async ({ page }) => {
    const adminLogin = new AdminLoginPage(page);
    await adminLogin.navigate();

    await expect(adminLogin.usernameInput).toBeVisible();
    await expect(adminLogin.passwordInput).toBeVisible();
    await expect(adminLogin.loginButton).toBeVisible();
    await expect(adminLogin.showPasswordButton).toBeVisible();
    await expect(adminLogin.errorMessage).toBeHidden();
  });

  test.describe('Admin dashboard', () => {
    // Login first before accessing dashboard
    test.beforeEach(async ({ page }) => {
      const adminLogin = new AdminLoginPage(page);
      await adminLogin.navigate();
      await adminLogin.login('admin', 'trustmebro');
    });

    test('Admin dashboard page components', async ({ page }) => {
      const adminDashboard = new AdminDashboardPage(page);
      await adminDashboard.navigate();
      await adminDashboard.waitForPageLoad();
      await page.waitForTimeout(2000);

      await expect(adminDashboard.totalJobPostsCard).toBeVisible();
      await expect(adminDashboard.openReportsCard).toBeVisible();
      await expect(adminDashboard.verifiedCompaniesCard).toBeVisible();
      await expect(adminDashboard.activeCPSKCard).toBeVisible();
      await expect(adminDashboard.totalVisitorsCard).toBeVisible();
      await expect(adminDashboard.unverifiedCompaniesCard).toBeVisible();
      await expect(adminDashboard.userIcon).toBeVisible();
      // Open dropdown to see logout button
      await adminDashboard.userIcon.click();
      await expect(adminDashboard.logoutButton).toBeVisible();
    });
  });
});
