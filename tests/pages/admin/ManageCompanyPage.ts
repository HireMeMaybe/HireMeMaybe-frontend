import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Manage Company Page
 * Page Object Model for admin company management
 */
export class ManageCompanyPage extends BasePage {
  readonly pageTitle: Locator;
  readonly searchInput: Locator;
  readonly filterSelect: Locator;
  readonly sortButton: Locator;
  readonly companyTable: Locator;
  readonly tableRows: Locator;
  readonly noDataMessage: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { name: /manage company/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.filterSelect = page.getByLabel(/filter|status/i);
    this.sortButton = page.getByRole('button', { name: /sort/i });
    this.companyTable = page.locator('table');
    this.tableRows = page.locator('tbody tr');
    this.noDataMessage = page.locator('[data-testid="no-data"]');
    this.paginationNext = page.getByRole('button', { name: /next/i });
    this.paginationPrev = page.getByRole('button', { name: /previous/i });
  }

  /**
   * Navigate to manage company page
   */
  async navigate() {
    await this.goto('/admin/manage-company');
  }

  /**
   * Get number of companies in table
   */
  async getCompanyCount() {
    return await this.tableRows.count();
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
   * Filter companies by status
   */
  async filterByStatus(status: string) {
    await this.filterSelect.selectOption(status);
    await this.waitForPageLoad();
  }

  /**
   * Sort companies
   */
  async sortCompanies() {
    await this.sortButton.click();
    await this.waitForPageLoad();
  }

  /**
   * View company details by index
   */
  async viewCompany(index: number) {
    const viewButton = this.tableRows.nth(index).getByRole('button', { name: /view/i });
    await viewButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Suspend company by index
   */
  async suspendCompany(index: number) {
    const suspendButton = this.tableRows.nth(index).getByRole('button', { name: /suspend/i });
    await suspendButton.click();
  }

  /**
   * Ban company by index
   */
  async banCompany(index: number) {
    const banButton = this.tableRows.nth(index).getByRole('button', { name: /ban/i });
    await banButton.click();
  }

  /**
   * Delete company by index
   */
  async deleteCompany(index: number) {
    const deleteButton = this.tableRows.nth(index).getByRole('button', { name: /delete/i });
    await deleteButton.click();
  }

  /**
   * Navigate to next page
   */
  async nextPage() {
    await this.paginationNext.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to previous page
   */
  async previousPage() {
    await this.paginationPrev.click();
    await this.waitForPageLoad();
  }

  /**
   * Check if no data message is visible
   */
  async isNoDataVisible() {
    return await this.noDataMessage.isVisible();
  }
}
