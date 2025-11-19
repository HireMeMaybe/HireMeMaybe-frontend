import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Manage Job Posts Page
 * Page Object Model for admin manage job posts page
 */
export class ManageJobPostsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly sectionTitle: Locator;
  readonly table: Locator;
  readonly tableHeaders: {
    jobTitle: Locator;
    type: Locator;
    posted: Locator;
    reports: Locator;
    actions: Locator;
  };

  // Table actions
  readonly viewButtons: Locator;
  readonly deleteButtons: Locator;

  // Modals
  readonly deleteModal: Locator;
  readonly successModal: Locator;
  readonly errorModal: Locator;

  // Loading state
  readonly loadingMessage: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.getByRole('heading', {
      name: /manage job posts/i,
      level: 1,
    });
    this.pageDescription = page.getByText(/monitor and manage job postings on the platform/i);
    this.sectionTitle = page.getByRole('heading', { name: /job posts overview/i });

    // Table elements
    this.table = page.locator('table');
    this.tableHeaders = {
      jobTitle: page.locator('th').filter({ hasText: /job title/i }),
      type: page.locator('th').filter({ hasText: /type/i }),
      posted: page.locator('th').filter({ hasText: /posted/i }),
      reports: page.locator('th').filter({ hasText: /reports/i }),
      actions: page.locator('th').filter({ hasText: /actions/i }),
    };

    // Actions
    this.viewButtons = page.getByRole('button', { name: /view/i });
    this.deleteButtons = page.getByRole('button', { name: /delete/i });

    // Modals
    this.deleteModal = page.locator('[role="dialog"]', { has: page.getByText(/delete/i) });
    this.successModal = page.locator('[role="dialog"]', { has: page.getByText(/success/i) });
    this.errorModal = page.locator('[role="dialog"]', { has: page.getByText(/error|failed/i) });

    // States
    this.loadingMessage = page.getByText(/loading job posts/i);
    this.emptyMessage = page.getByText(/no job posts found/i);
  }

  /**
   * Navigate to manage job posts page
   */
  async navigate() {
    await this.goto('/admin/manage-job-posts');
  }

  /**
   * Wait for job posts to load
   */
  async waitForJobPostsLoad() {
    await this.page.waitForSelector('table tbody tr', { state: 'visible' });
  }

  /**
   * Check if page is in loading state
   */
  async isLoading() {
    return await this.loadingMessage.isVisible();
  }

  /**
   * Check if there are no job posts
   */
  async isEmpty() {
    return await this.emptyMessage.isVisible();
  }

  /**
   * Get number of job posts in table
   */
  async getJobPostCount() {
    const rows = await this.table.locator('tbody tr').count();
    const hasMessage = await this.loadingMessage.isVisible().catch(() => false);
    return hasMessage ? 0 : rows;
  }

  /**
   * Get job post data by row index
   */
  async getJobPostByIndex(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const cells = row.locator('td');

    return {
      title: await cells.nth(0).textContent(),
      type: await cells.nth(1).textContent(),
      posted: await cells.nth(2).textContent(),
      reports: await cells.nth(3).textContent(),
    };
  }

  /**
   * Get report count for a job post by row index
   */
  async getReportCount(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const reportCell = row.locator('td').nth(3);
    const text = await reportCell.textContent();
    return Number.parseInt(text?.trim() || '0');
  }

  /**
   * Get report color class for a job post by row index
   */
  async getReportColorClass(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const reportCell = row.locator('td').nth(3);
    const className = await reportCell.getAttribute('class');
    return className;
  }

  /**
   * Click view button for a specific job post by index
   */
  async viewJobPost(index: number) {
    await this.viewButtons.nth(index).click();
  }

  /**
   * Click delete button for a specific job post by index
   */
  async deleteJobPost(index: number) {
    await this.deleteButtons.nth(index).click();
    await this.deleteModal.waitFor({ state: 'visible' });
  }

  /**
   * Confirm delete action in modal
   */
  async confirmDelete() {
    const confirmButton = this.deleteModal.getByRole('button', { name: /confirm|delete/i });
    await confirmButton.click();
  }

  /**
   * Cancel delete action in modal
   */
  async cancelDelete() {
    const cancelButton = this.deleteModal.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
  }

  /**
   * Close success modal
   */
  async closeSuccessModal() {
    const closeButton = this.successModal.getByRole('button', { name: /close|ok/i });
    await closeButton.click();
  }

  /**
   * Close error modal
   */
  async closeErrorModal() {
    const closeButton = this.errorModal.getByRole('button', { name: /close|ok/i });
    await closeButton.click();
  }

  /**
   * Check if delete modal is visible
   */
  async isDeleteModalVisible() {
    return await this.deleteModal.isVisible();
  }

  /**
   * Check if success modal is visible
   */
  async isSuccessModalVisible() {
    return await this.successModal.isVisible();
  }

  /**
   * Check if error modal is visible
   */
  async isErrorModalVisible() {
    return await this.errorModal.isVisible();
  }

  /**
   * Get error message from error modal
   */
  async getErrorMessage() {
    return await this.errorModal.textContent();
  }
}
