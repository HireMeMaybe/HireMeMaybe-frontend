import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Admin Dashboard Page
 * Page Object Model for admin dashboard
 */
export class AdminDashboardPage extends BasePage {
  readonly pageTitle: Locator;
  readonly statsCards: Locator;
  readonly totalJobPostsCard: Locator;
  readonly openReportsCard: Locator;
  readonly verifiedCompaniesCard: Locator;
  readonly activeCPSKCard: Locator;
  readonly totalVisitorsCard: Locator;
  readonly unverifiedCompaniesCard: Locator;
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
    this.statsCards = page.locator('.stat-card');
    this.totalJobPostsCard = page.locator('.stat-card:has-text("Total Job Posts")');
    this.openReportsCard = page.locator('.stat-card:has-text("Open Reports")');
    this.verifiedCompaniesCard = page.locator('.stat-card:has-text("Verified Companies")');
    this.activeCPSKCard = page.locator('.stat-card:has-text("Active CPSK")');
    this.totalVisitorsCard = page.locator('.stat-card:has-text("Total Visitors")');
    this.unverifiedCompaniesCard = page.locator('.stat-card:has-text("Unverified Companies")');
    this.navigationMenu = page.locator('nav.admin-nav');
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
   * Logout from admin panel
   */
  async logout() {
    await this.logoutButton.click();
    await this.waitForPageLoad();
  }
}
