import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Admin Dashboard Page
 * Page Object Model for admin dashboard
 */
export class AdminDashboardPage extends BasePage {
  readonly pageTitle: Locator;
  readonly statsCards: Locator;
  readonly totalUsersCard: Locator;
  readonly totalCompaniesCard: Locator;
  readonly totalJobPostsCard: Locator;
  readonly pendingVerificationsCard: Locator;
  readonly navigationMenu: Locator;
  readonly logoutButton: Locator;

  // Navigation links
  readonly companyVerificationLink: Locator;
  readonly manageCompanyLink: Locator;
  readonly manageCPSKLink: Locator;
  readonly manageJobPostsLink: Locator;
  readonly manageVisitorsLink: Locator;
  readonly reportsLink: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { name: /dashboard/i });
    this.statsCards = page.locator('[data-testid="stat-card"]');
    this.totalUsersCard = page.locator('[data-testid="total-users"]');
    this.totalCompaniesCard = page.locator('[data-testid="total-companies"]');
    this.totalJobPostsCard = page.locator('[data-testid="total-job-posts"]');
    this.pendingVerificationsCard = page.locator('[data-testid="pending-verifications"]');
    this.navigationMenu = page.locator('nav[data-testid="admin-nav"]');
    this.logoutButton = page.getByRole('button', { name: /logout/i });

    // Navigation
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
    this.reportsLink = page.getByRole('link', { name: /reports/i });
  }

  /**
   * Navigate to admin dashboard
   */
  async navigate() {
    await this.goto('/admin/dashboard');
  }

  /**
   * Get total users count
   */
  async getTotalUsers() {
    return await this.totalUsersCard.textContent();
  }

  /**
   * Get total companies count
   */
  async getTotalCompanies() {
    return await this.totalCompaniesCard.textContent();
  }

  /**
   * Get total job posts count
   */
  async getTotalJobPosts() {
    return await this.totalJobPostsCard.textContent();
  }

  /**
   * Get pending verifications count
   */
  async getPendingVerifications() {
    return await this.pendingVerificationsCard.textContent();
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
   * Logout from admin panel
   */
  async logout() {
    await this.logoutButton.click();
    await this.waitForPageLoad();
  }
}
