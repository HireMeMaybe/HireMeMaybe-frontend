import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Report Page
 * Page Object Model for admin review reports page
 */
export class ReportPage extends BasePage {
  readonly userIcon: Locator;
  readonly logoutButton: Locator;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly sectionTitle: Locator;
  readonly table: Locator;
  readonly tableHeaders: {
    reportedEntity: Locator;
    type: Locator;
    reason: Locator;
    reportedBy: Locator;
    submitted: Locator;
    status: Locator;
    actions: Locator;
  };

  // Table actions
  readonly viewEntityButtons: Locator;
  readonly reviewButtons: Locator;

  // Modals
  readonly reviewModal: Locator;
  readonly cpskDetailModal: Locator;

  // Loading state
  readonly loadingMessage: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.userIcon = page
      .locator('button[aria-label*="user" i], button:has(svg):has-text("admin")')
      .first();
    this.logoutButton = page.getByRole('button', { name: /Logout/i });

    this.pageTitle = page.getByRole('heading', {
      name: /review reports/i,
      level: 1,
    });
    this.pageDescription = page.getByText(/handle reports from students and companies/i);
    this.sectionTitle = page.getByRole('heading', { name: /open reports/i });

    // Table elements
    this.table = page.locator('table');
    this.tableHeaders = {
      reportedEntity: page.locator('th').filter({ hasText: /reported entity/i }),
      type: page.locator('th').filter({ hasText: /type/i }),
      reason: page.locator('th').filter({ hasText: /reason/i }),
      reportedBy: page.locator('th').filter({ hasText: /^reporter$/i }),
      submitted: page.locator('th').filter({ hasText: /submitted/i }),
      status: page.locator('th').filter({ hasText: /status/i }),
      actions: page.locator('th').filter({ hasText: /actions/i }),
    };

    // Actions
    this.viewEntityButtons = page.getByRole('button', { name: /^view$/i });
    this.reviewButtons = page.getByRole('button', { name: /review/i });

    // Modals
    this.reviewModal = page.locator('[role="dialog"]', { has: page.getByText(/review report/i) });
    this.cpskDetailModal = page.locator('[role="dialog"]', {
      has: page.getByText(/cpsk detail/i),
    });

    // States
    this.loadingMessage = page.getByText(/loading reports/i);
    this.emptyMessage = page.getByText(/no reports found/i);
  }

  /**
   * Navigate to report page
   */
  async navigate() {
    await this.goto('/admin/report');
  }

  /**
   * Wait for reports to load
   */
  async waitForReportsLoad() {
    await this.page.waitForSelector('table tbody tr', { state: 'visible' });
  }

  /**
   * Check if page is in loading state
   */
  async isLoading() {
    return await this.loadingMessage.isVisible();
  }

  /**
   * Check if there are no reports
   */
  async isEmpty() {
    return await this.emptyMessage.isVisible();
  }

  /**
   * Get number of reports in table
   */
  async getReportCount() {
    const rows = await this.table.locator('tbody tr').count();
    const hasMessage = await this.loadingMessage.isVisible().catch(() => false);
    return hasMessage ? 0 : rows;
  }

  /**
   * Get report data by row index
   */
  async getReportByIndex(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const cells = row.locator('td');

    return {
      entity: await cells.nth(0).textContent(),
      type: await cells.nth(1).textContent(),
      reason: await cells.nth(2).textContent(),
      reportedBy: await cells.nth(3).textContent(),
      submitted: await cells.nth(4).textContent(),
      status: await cells.nth(5).textContent(),
    };
  }

  /**
   * Get report status by row index
   */
  async getReportStatus(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const statusCell = row.locator('td').nth(5);
    return await statusCell.textContent();
  }

  /**
   * Get status badge color class by row index
   */
  async getStatusBadgeClass(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const statusBadge = row.locator('td').nth(5).locator('span');
    const className = await statusBadge.getAttribute('class');
    return className;
  }

  /**
   * Click view entity button for a specific report by index
   */
  async viewEntity(index: number) {
    await this.viewEntityButtons.nth(index).click();
  }

  /**
   * Click review button for a specific report by index
   */
  async reviewReport(index: number) {
    await this.reviewButtons.nth(index).click();
    await this.reviewModal.waitFor({ state: 'visible' });
  }

  /**
   * Mark report as reviewed in modal
   */
  async markAsReviewed(adminNote?: string) {
    if (adminNote) {
      const noteInput = this.reviewModal.getByLabel(/admin note/i);
      await noteInput.fill(adminNote);
    }
    const reviewButton = this.reviewModal.getByRole('button', { name: /reviewed/i });
    await reviewButton.click();
  }

  /**
   * Mark report as resolved in modal
   */
  async markAsResolved(adminNote?: string) {
    if (adminNote) {
      const noteInput = this.reviewModal.getByLabel(/admin note/i);
      await noteInput.fill(adminNote);
    }
    const resolveButton = this.reviewModal.getByRole('button', { name: /resolve/i });
    await resolveButton.click();
  }

  /**
   * Reject report in modal
   */
  async rejectReport(adminNote?: string) {
    if (adminNote) {
      const noteInput = this.reviewModal.getByLabel(/admin note/i);
      await noteInput.fill(adminNote);
    }
    const rejectButton = this.reviewModal.getByRole('button', { name: /reject/i });
    await rejectButton.click();
  }

  /**
   * Close review modal
   */
  async closeReviewModal() {
    const closeButton = this.reviewModal.getByRole('button', { name: /close|cancel/i });
    await closeButton.click();
  }

  /**
   * Check if review modal is visible
   */
  async isReviewModalVisible() {
    return await this.reviewModal.isVisible();
  }

  /**
   * Check if CPSK detail modal is visible
   */
  async isCPSKDetailModalVisible() {
    return await this.cpskDetailModal.isVisible();
  }

  /**
   * Close CPSK detail modal
   */
  async closeCPSKDetailModal() {
    const closeButton = this.cpskDetailModal.getByRole('button', { name: /close/i });
    await closeButton.click();
  }

  /**
   * Filter reports by status
   */
  async filterByStatus(status: 'pending' | 'reviewed' | 'resolved' | 'rejected') {
    // Assuming there's a filter/dropdown for status
    const statusFilter = this.page.getByRole('combobox', { name: /filter by status/i });
    await statusFilter.selectOption(status);
    await this.waitForPageLoad();
  }

  /**
   * Get all visible report statuses
   */
  async getAllReportStatuses() {
    const rows = await this.table.locator('tbody tr').all();
    const statuses = [];

    for (const row of rows) {
      const statusCell = row.locator('td').nth(5);
      const status = await statusCell.textContent();
      statuses.push(status?.trim());
    }

    return statuses;
  }

  /**
   * Logout from admin panel
   * Clicks user icon to open dropdown menu, then clicks logout button
   */
  async logout() {
    await this.userIcon.click();
    await this.page.waitForTimeout(300);
    await this.logoutButton.click();
    await this.waitForPageLoad();
  }
}
