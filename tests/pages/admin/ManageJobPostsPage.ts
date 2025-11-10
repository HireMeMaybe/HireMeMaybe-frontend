import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Manage Job Posts Page
 * Page Object Model for admin job posts management
 */
export class ManageJobPostsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly searchInput: Locator;
  readonly filterSelect: Locator;
  readonly sortButton: Locator;
  readonly jobPostsTable: Locator;
  readonly tableRows: Locator;
  readonly noDataMessage: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByRole('heading', { name: /manage job posts/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.filterSelect = page.getByLabel(/filter|status/i);
    this.sortButton = page.getByRole('button', { name: /sort/i });
    this.jobPostsTable = page.locator('table');
    this.tableRows = page.locator('tbody tr');
    this.noDataMessage = page.locator('[data-testid="no-data"]');
    this.paginationNext = page.getByRole('button', { name: /next/i });
    this.paginationPrev = page.getByRole('button', { name: /previous/i });
  }

  /**
   * Navigate to manage job posts page
   */
  async navigate() {
    await this.goto('/admin/manage-job-posts');
  }

  /**
   * Get number of job posts in table
   */
  async getJobPostsCount() {
    return await this.tableRows.count();
  }

  /**
   * Search for job post
   */
  async searchJobPost(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Filter job posts by status
   */
  async filterByStatus(status: string) {
    await this.filterSelect.selectOption(status);
    await this.waitForPageLoad();
  }

  /**
   * Sort job posts
   */
  async sortJobPosts() {
    await this.sortButton.click();
    await this.waitForPageLoad();
  }

  /**
   * View job post details by index
   */
  async viewJobPost(index: number) {
    const viewButton = this.tableRows.nth(index).getByRole('button', { name: /view/i });
    await viewButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Approve job post by index
   */
  async approveJobPost(index: number) {
    const approveButton = this.tableRows.nth(index).getByRole('button', { name: /approve/i });
    await approveButton.click();
  }

  /**
   * Reject job post by index
   */
  async rejectJobPost(index: number) {
    const rejectButton = this.tableRows.nth(index).getByRole('button', { name: /reject/i });
    await rejectButton.click();
  }

  /**
   * Delete job post by index
   */
  async deleteJobPost(index: number) {
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
