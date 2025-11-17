import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Admin Dashboard Page
 * Page Object Model for admin dashboard
 */
export class AdminDashboardPage extends BasePage {
  readonly userIcon: Locator;
  readonly logoutButton: Locator;
  readonly totalJobPostsCard: Locator;
  readonly openReportsCard: Locator;
  readonly verifiedCompaniesCard: Locator;
  readonly activeCPSKCard: Locator;
  readonly totalVisitorsCard: Locator;
  readonly unverifiedCompaniesCard: Locator;
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
        this.userIcon = page
      .locator('button[aria-label*="user" i], button:has(svg):has-text("admin")')
      .first();
    // Logout button inside dropdown (initially hidden)
    this.logoutButton = page.getByRole('button', { name: /Logout/i });

    // Stat cards - using more specific selectors to avoid conflicts
    this.totalJobPostsCard = page.getByRole('link', { name: /total job posts/i });
    this.openReportsCard = page.getByRole('link', { name: /open reports/i });
    this.verifiedCompaniesCard = page.getByRole('link', { name: /verified companies.*active/i }); // More specific
    this.activeCPSKCard = page.getByRole('link', { name: /active cpsk/i });
    this.totalVisitorsCard = page.getByRole('link', { name: /total visitors/i });
    this.unverifiedCompaniesCard = page.getByRole('link', { name: /unverified companies/i });

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
