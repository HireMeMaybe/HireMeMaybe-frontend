import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Visitor Reports Page
 * Page Object Model for admin visitor reports page (individual visitor's reports)
 */
export class VisitorReportsPage extends BasePage {
  readonly userIcon: Locator;
  readonly logoutButton: Locator;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly sectionTitle: Locator;
  readonly backButton: Locator;
  readonly table: Locator;
  readonly tableHeaders: {
    reportedEntity: Locator;
    type: Locator;
    reason: Locator;
    submitted: Locator;
    status: Locator;
    actions: Locator;
  };

  // Table actions
  readonly viewEntityButtons: Locator;

  // Modals
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
      name: /visitor reports/i,
      level: 1,
    });
    this.pageDescription = page.getByText(/view all reports submitted by this visitor/i);
    this.sectionTitle = page.getByRole('heading', { name: /submitted reports/i });
    this.backButton = page.getByRole('button', { name: /back to manage visitors/i });

    // Table elements
    this.table = page.locator('table');
    this.tableHeaders = {
      reportedEntity: page.locator('th').filter({ hasText: /reported entity/i }),
      type: page.locator('th').filter({ hasText: /type/i }),
      reason: page.locator('th').filter({ hasText: /reason/i }),
      submitted: page.locator('th').filter({ hasText: /submitted/i }),
      status: page.locator('th').filter({ hasText: /status/i }),
      actions: page.locator('th').filter({ hasText: /actions/i }),
    };

    // Actions
    this.viewEntityButtons = page.getByRole('button', { name: /view entity/i });

    // Modals
    this.cpskDetailModal = page.locator('[role="dialog"]', {
      has: page.getByText(/cpsk detail/i),
    });

    // States
    this.loadingMessage = page.getByText(/loading reports/i);
    this.emptyMessage = page.getByText(/no reports found/i);
  }

  /**
   * Navigate to visitor reports page
   * @param visitorId - The visitor ID
   */
  async navigate(visitorId: string) {
    await this.goto(`/admin/visitor-reports/${visitorId}`);
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
      submitted: await cells.nth(3).textContent(),
      status: await cells.nth(4).textContent(),
    };
  }

  /**
   * Get report status by row index
   */
  async getReportStatus(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const statusCell = row.locator('td').nth(4);
    return await statusCell.textContent();
  }

  /**
   * Get status badge color class by row index
   */
  async getStatusColorClass(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const statusBadge = row.locator('td').nth(4).locator('span');
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
   * Click back button to return to manage visitors page
   */
  async goBack() {
    await this.backButton.click();
    await this.waitForPageLoad();
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
   * Get all visible report statuses
   */
  async getAllReportStatuses() {
    const rows = await this.table.locator('tbody tr').all();
    const statuses = [];

    for (const row of rows) {
      const statusCell = row.locator('td').nth(4);
      const status = await statusCell.textContent();
      statuses.push(status?.trim());
    }

    return statuses;
  }

  /**
   * Get reports filtered by status
   */
  async getReportsByStatus(status: string) {
    const allStatuses = await this.getAllReportStatuses();
    return allStatuses.filter((s) => s?.toLowerCase().includes(status.toLowerCase()));
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
