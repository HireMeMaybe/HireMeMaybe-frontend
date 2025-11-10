import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Company Verification Page
 * Page Object Model for admin company verification
 */
export class CompanyVerificationPage extends BasePage {
  readonly pageTitle: Locator;
  readonly pendingCompanies: Locator;
  readonly searchInput: Locator;
  readonly filterSelect: Locator;
  readonly companyCards: Locator;
  readonly noDataMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', {
      name: /company verification/i,
    });
    this.pendingCompanies = page.locator('[data-testid="pending-companies"]');
    this.searchInput = page.getByPlaceholder(/search/i);
    this.filterSelect = page.getByLabel(/filter/i);
    this.companyCards = page.locator('[data-testid="company-card"]');
    this.noDataMessage = page.locator('[data-testid="no-data"]');
  }

  /**
   * Navigate to company verification page
   */
  async navigate() {
    await this.goto('/admin/company-verification');
  }

  /**
   * Get number of pending companies
   */
  async getPendingCount() {
    return await this.companyCards.count();
  }

  /**
   * View company details by index
   */
  async viewCompanyDetails(index: number) {
    await this.companyCards.nth(index).click();
    await this.waitForPageLoad();
  }

  /**
   * Search for company
   */
  async searchCompany(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Filter companies
   */
  async filterCompanies(filterValue: string) {
    await this.filterSelect.selectOption(filterValue);
    await this.waitForPageLoad();
  }

  /**
   * Approve company by index
   */
  async approveCompany(index: number) {
    const approveButton = this.companyCards.nth(index).getByRole('button', { name: /approve/i });
    await approveButton.click();
  }

  /**
   * Reject company by index
   */
  async rejectCompany(index: number) {
    const rejectButton = this.companyCards.nth(index).getByRole('button', { name: /reject/i });
    await rejectButton.click();
  }

  /**
   * Check if no data message is visible
   */
  async isNoDataVisible() {
    return await this.noDataMessage.isVisible();
  }
}
