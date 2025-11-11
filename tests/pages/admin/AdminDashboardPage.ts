import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { AdminLoginPage } from './AdminLoginPage';

/**
 * Admin Dashboard Page
 * Page Object Model for admin dashboard
 */
export class AdminDashboardPage extends BasePage {
  private readonly loginPage: AdminLoginPage;
  readonly totalJobPostsCard: Locator;
  readonly openReportsCard: Locator;
  readonly verifiedCompaniesCard: Locator;
  readonly activeCPSKCard: Locator;
  readonly totalVisitorsCard: Locator;
  readonly unverifiedCompaniesCard: Locator;
  readonly sidebar: Locator;
  readonly dashboardTitle: Locator;

  // Navigation links
  readonly companyVerificationLink: Locator;
  readonly manageCompanyLink: Locator;
  readonly manageCPSKLink: Locator;
  readonly manageJobPostsLink: Locator;
  readonly manageVisitorsLink: Locator;
  readonly reportsLink: Locator;
  readonly dashboardLink: Locator;

  constructor(page: Page) {
    super(page);
    this.loginPage = new AdminLoginPage(page);

    // Stat cards - using text content to identify them
    this.totalJobPostsCard = page.getByText('Total Job Posts').locator('..');
    this.openReportsCard = page.getByText('Open Reports').locator('..');
    this.verifiedCompaniesCard = page.getByText('Verified Companies').locator('..');
    this.activeCPSKCard = page.getByText('Active CPSK').locator('..');
    this.totalVisitorsCard = page.getByText('Total Visitors').locator('..');
    this.unverifiedCompaniesCard = page.getByText('Unverified Companies').locator('..');

    this.sidebar = page.locator('nav');
    this.dashboardTitle = page.getByRole('heading', { name: /admin dashboard/i });

    // Navigation links in sidebar
    this.dashboardLink = page.getByRole('link', { name: /^dashboard$/i });
    this.companyVerificationLink = page.getByRole('link', {
      name: /company verification/i,
    });
    this.manageCompanyLink = page.getByRole('link', {
      name: /manage company/i,
    });
    this.manageCPSKLink = page.getByRole('link', { name: /manage cpsk/i });
    this.manageJobPostsLink = page.getByRole('link', {
      name: /manage job posts/i,
    });
    this.manageVisitorsLink = page.getByRole('link', {
      name: /manage visitors/i,
    });
    this.reportsLink = page.getByRole('link', { name: /review reports/i });
  }

  /**
   * Navigate to admin dashboard
   */
  async navigate() {
    await this.goto('/admin/dashboard');
  }

  /**
   * Login and navigate to admin dashboard
   * @param username - Admin username (default: 'admin')
   * @param password - Admin password (default: 'trustmebro')
   */
  async loginAndNavigate(username: string = 'admin', password: string = 'trustmebro') {
    await this.loginPage.navigate();
    await this.loginPage.login(username, password);
    // After successful login, should redirect to dashboard
    await this.waitForPageLoad();
  }

  /**
   * Get total job posts count
   */
  async getTotalJobPosts() {
    return await this.totalJobPostsCard.textContent();
  }

  /**
   * Get open reports count
   */
  async getOpenReports() {
    return await this.openReportsCard.textContent();
  }

  /**
   * Get verified companies count
   */
  async getVerifiedCompanies() {
    return await this.verifiedCompaniesCard.textContent();
  }

  /**
   * Get active CPSK count
   */
  async getActiveCPSK() {
    return await this.activeCPSKCard.textContent();
  }

  /**
   * Get total visitors count
   */
  async getTotalVisitors() {
    return await this.totalVisitorsCard.textContent();
  }

  /**
   * Get unverified companies count
   */
  async getUnverifiedCompanies() {
    return await this.unverifiedCompaniesCard.textContent();
  }

  /**
   * Navigate to company verification page
   */
  async goToCompanyVerification() {
    await this.companyVerificationLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to manage company page
   */
  async goToManageCompany() {
    await this.manageCompanyLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to manage CPSK page
   */
  async goToManageCPSK() {
    await this.manageCPSKLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to manage job posts page
   */
  async goToManageJobPosts() {
    await this.manageJobPostsLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to manage visitors page
   */
  async goToManageVisitors() {
    await this.manageVisitorsLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to reports page
   */
  async goToReports() {
    await this.reportsLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to dashboard page
   */
  async goToDashboard() {
    await this.dashboardLink.click();
    await this.waitForPageLoad();
  }
}
