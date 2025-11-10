import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Admin Reports Page
 * Page Object Model for viewing and managing reports
 */
export class AdminReportsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly searchInput: Locator;
  readonly filterSelect: Locator;
  readonly sortButton: Locator;
  readonly reportsTable: Locator;
  readonly tableRows: Locator;
  readonly noDataMessage: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { name: /reports/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.filterSelect = page.getByLabel(/filter|status/i);
    this.sortButton = page.getByRole('button', { name: /sort/i });
    this.reportsTable = page.locator('table');
    this.tableRows = page.locator('tbody tr');
    this.noDataMessage = page.locator('[data-testid="no-data"]');
    this.paginationNext = page.getByRole('button', { name: /next/i });
    this.paginationPrev = page.getByRole('button', { name: /previous/i });
  }

  /**
   * Navigate to admin reports page
   */
  async navigate() {
    await this.goto('/admin/report');
  }

  /**
   * Get number of reports in table
   */
  async getReportsCount() {
    return await this.tableRows.count();
  }

  /**
   * Search for report
   */
  async searchReport(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Filter reports by status
   */
  async filterByStatus(status: string) {
    await this.filterSelect.selectOption(status);
    await this.waitForPageLoad();
  }

  /**
   * Sort reports
   */
  async sortReports() {
    await this.sortButton.click();
    await this.waitForPageLoad();
  }

  /**
   * View report details by index
   */
  async viewReport(index: number) {
    const viewButton = this.tableRows.nth(index).getByRole('button', { name: /view/i });
    await viewButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Resolve report by index
   */
  async resolveReport(index: number) {
    const resolveButton = this.tableRows.nth(index).getByRole('button', { name: /resolve/i });
    await resolveButton.click();
  }

  /**
   * Dismiss report by index
   */
  async dismissReport(index: number) {
    const dismissButton = this.tableRows.nth(index).getByRole('button', { name: /dismiss/i });
    await dismissButton.click();
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
