import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Manage Visitors Page
 * Page Object Model for admin visitors management
 */
export class ManageVisitorsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly searchInput: Locator;
  readonly filterSelect: Locator;
  readonly sortButton: Locator;
  readonly visitorsTable: Locator;
  readonly tableRows: Locator;
  readonly noDataMessage: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;
  readonly exportButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { name: /manage visitors/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.filterSelect = page.getByLabel(/filter/i);
    this.sortButton = page.getByRole('button', { name: /sort/i });
    this.visitorsTable = page.locator('table');
    this.tableRows = page.locator('tbody tr');
    this.noDataMessage = page.locator('[data-testid="no-data"]');
    this.paginationNext = page.getByRole('button', { name: /next/i });
    this.paginationPrev = page.getByRole('button', { name: /previous/i });
    this.exportButton = page.getByRole('button', { name: /export/i });
  }

  /**
   * Navigate to manage visitors page
   */
  async navigate() {
    await this.goto('/admin/manage-visitors');
  }

  /**
   * Get number of visitors in table
   */
  async getVisitorsCount() {
    return await this.tableRows.count();
  }

  /**
   * Search for visitor
   */
  async searchVisitor(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Filter visitors
   */
  async filterVisitors(filterValue: string) {
    await this.filterSelect.selectOption(filterValue);
    await this.waitForPageLoad();
  }

  /**
   * Sort visitors
   */
  async sortVisitors() {
    await this.sortButton.click();
    await this.waitForPageLoad();
  }

  /**
   * View visitor details by index
   */
  async viewVisitor(index: number) {
    const viewButton = this.tableRows.nth(index).getByRole('button', { name: /view/i });
    await viewButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Ban visitor by index
   */
  async banVisitor(index: number) {
    const banButton = this.tableRows.nth(index).getByRole('button', { name: /ban/i });
    await banButton.click();
  }

  /**
   * Unban visitor by index
   */
  async unbanVisitor(index: number) {
    const unbanButton = this.tableRows.nth(index).getByRole('button', { name: /unban/i });
    await unbanButton.click();
  }

  /**
   * Export visitors data
   */
  async exportData() {
    await this.exportButton.click();
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
