import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Manage CPSK Page
 * Page Object Model for admin CPSK management
 */
export class ManageCPSKPage extends BasePage {
  readonly pageTitle: Locator;
  readonly searchInput: Locator;
  readonly filterSelect: Locator;
  readonly sortButton: Locator;
  readonly cpskTable: Locator;
  readonly tableRows: Locator;
  readonly noDataMessage: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { name: /manage cpsk/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.filterSelect = page.getByLabel(/filter|status/i);
    this.sortButton = page.getByRole('button', { name: /sort/i });
    this.cpskTable = page.locator('table');
    this.tableRows = page.locator('tbody tr');
    this.noDataMessage = page.locator('[data-testid="no-data"]');
    this.paginationNext = page.getByRole('button', { name: /next/i });
    this.paginationPrev = page.getByRole('button', { name: /previous/i });
  }

  /**
   * Navigate to manage CPSK page
   */
  async navigate() {
    await this.goto('/admin/manage-cpsk');
  }

  /**
   * Get number of CPSK in table
   */
  async getCPSKCount() {
    return await this.tableRows.count();
  }

  /**
   * Search for CPSK
   */
  async searchCPSK(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Filter CPSK by status
   */
  async filterByStatus(status: string) {
    await this.filterSelect.selectOption(status);
    await this.waitForPageLoad();
  }

  /**
   * Sort CPSK
   */
  async sortCPSK() {
    await this.sortButton.click();
    await this.waitForPageLoad();
  }

  /**
   * View CPSK details by index
   */
  async viewCPSK(index: number) {
    const viewButton = this.tableRows.nth(index).getByRole('button', { name: /view/i });
    await viewButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Approve CPSK by index
   */
  async approveCPSK(index: number) {
    const approveButton = this.tableRows.nth(index).getByRole('button', { name: /approve/i });
    await approveButton.click();
  }

  /**
   * Reject CPSK by index
   */
  async rejectCPSK(index: number) {
    const rejectButton = this.tableRows.nth(index).getByRole('button', { name: /reject/i });
    await rejectButton.click();
  }

  /**
   * Suspend CPSK by index
   */
  async suspendCPSK(index: number) {
    const suspendButton = this.tableRows.nth(index).getByRole('button', { name: /suspend/i });
    await suspendButton.click();
  }

  /**
   * Delete CPSK by index
   */
  async deleteCPSK(index: number) {
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
