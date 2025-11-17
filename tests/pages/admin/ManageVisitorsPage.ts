import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Manage Visitors Page
 * Page Object Model for admin manage visitors page
 */
export class ManageVisitorsPage extends BasePage {
  readonly userIcon: Locator;
  readonly logoutButton: Locator;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly sectionTitle: Locator;
  readonly table: Locator;
  readonly tableHeaders: {
    name: Locator;
    email: Locator;
    reports: Locator;
    status: Locator;
    actions: Locator;
  };

  // Table actions
  readonly viewReportsButtons: Locator;
  readonly suspendButtons: Locator;
  readonly cancelSuspendButtons: Locator;
  readonly banButtons: Locator;
  readonly unbanButtons: Locator;

  // Modals
  readonly suspendModal: Locator;
  readonly cancelSuspendModal: Locator;
  readonly banModal: Locator;
  readonly unbanModal: Locator;

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
      name: /manage visitors/i,
      level: 1,
    });
    this.pageDescription = page.getByText(/view and manage visitor accounts/i);
    this.sectionTitle = page.getByRole('heading', { name: /visitor accounts/i });

    // Table elements
    this.table = page.locator('table');
    this.tableHeaders = {
      name: page.locator('th').filter({ hasText: /name/i }),
      email: page.locator('th').filter({ hasText: /email/i }),
      reports: page.locator('th').filter({ hasText: /report count/i }),
      status: page.locator('th').filter({ hasText: /status/i }),
      actions: page.locator('th').filter({ hasText: /actions/i }),
    };

    // Actions
    this.viewReportsButtons = page.getByRole('button', { name: /view reports/i });
    this.suspendButtons = page.getByRole('button', { name: /^suspend$/i });
    this.cancelSuspendButtons = page.getByRole('button', { name: /cancel suspend/i });
    this.banButtons = page.getByRole('button', { name: /^ban$/i });
    this.unbanButtons = page.getByRole('button', { name: /unban/i });

    // Modals
    this.suspendModal = page.locator('[role="dialog"]', { has: page.getByText(/suspend/i) });
    this.cancelSuspendModal = page.locator('[role="dialog"]', {
      has: page.getByText(/cancel suspend/i),
    });
    this.banModal = page.locator('[role="dialog"]', { has: page.getByText(/ban/i) });
    this.unbanModal = page.locator('[role="dialog"]', { has: page.getByText(/unban/i) });

    // States
    this.loadingMessage = page.getByText(/loading visitors/i);
    this.emptyMessage = page.getByText(/no visitors found/i);
  }

  /**
   * Navigate to manage visitors page
   */
  async navigate() {
    await this.goto('/admin/manage-visitors');
  }

  /**
   * Wait for visitors to load
   */
  async waitForVisitorsLoad() {
    await this.page.waitForSelector('table tbody tr', { state: 'visible' });
  }

  /**
   * Check if page is in loading state
   */
  async isLoading() {
    return await this.loadingMessage.isVisible();
  }

  /**
   * Check if there are no visitors
   */
  async isEmpty() {
    return await this.emptyMessage.isVisible();
  }

  /**
   * Get number of visitors in table
   */
  async getVisitorCount() {
    const rows = await this.table.locator('tbody tr').count();
    const hasMessage = await this.loadingMessage.isVisible().catch(() => false);
    return hasMessage ? 0 : rows;
  }

  /**
   * Get visitor data by row index
   */
  async getVisitorByIndex(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const cells = row.locator('td');

    return {
      name: await cells.nth(0).textContent(),
      email: await cells.nth(1).textContent(),
      reports: await cells.nth(2).textContent(),
      status: await cells.nth(3).textContent(),
    };
  }

  /**
   * Get report count for a visitor by row index
   */
  async getReportCount(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const reportCell = row.locator('td').nth(2);
    const text = await reportCell.textContent();
    return Number.parseInt(text?.trim() || '0');
  }

  /**
   * Get report color class for a visitor by row index
   */
  async getReportColorClass(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const reportCell = row.locator('td').nth(2);
    const className = await reportCell.getAttribute('class');
    return className;
  }

  /**
   * Get visitor status by row index
   */
  async getVisitorStatus(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const statusCell = row.locator('td').nth(3);
    return await statusCell.textContent();
  }

  /**
   * Click view reports button for a specific visitor by index
   */
  async viewReports(index: number) {
    await this.viewReportsButtons.nth(index).click();
    await this.waitForPageLoad();
  }

  /**
   * Click suspend button for a specific visitor by index
   */
  async suspendVisitor(index: number) {
    await this.suspendButtons.nth(index).click();
    await this.suspendModal.waitFor({ state: 'visible' });
  }

  /**
   * Fill suspend form and confirm
   */
  async confirmSuspend(startDate?: string, endDate?: string) {
    if (startDate) {
      const startDateInput = this.suspendModal.getByLabel(/start date/i);
      await startDateInput.fill(startDate);
    }
    if (endDate) {
      const endDateInput = this.suspendModal.getByLabel(/end date/i);
      await endDateInput.fill(endDate);
    }
    const confirmButton = this.suspendModal.getByRole('button', { name: /confirm|suspend/i });
    await confirmButton.click();
  }

  /**
   * Cancel suspend action
   */
  async cancelSuspendAction() {
    const cancelButton = this.suspendModal.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
  }

  /**
   * Click cancel suspend button for a specific visitor by index
   */
  async cancelSuspendVisitor(index: number) {
    await this.cancelSuspendButtons.nth(index).click();
    await this.cancelSuspendModal.waitFor({ state: 'visible' });
  }

  /**
   * Confirm cancel suspend action
   */
  async confirmCancelSuspend() {
    const confirmButton = this.cancelSuspendModal.getByRole('button', {
      name: /confirm|cancel suspend/i,
    });
    await confirmButton.click();
  }

  /**
   * Click ban button for a specific visitor by index
   */
  async banVisitor(index: number) {
    await this.banButtons.nth(index).click();
    await this.banModal.waitFor({ state: 'visible' });
  }

  /**
   * Confirm ban action
   */
  async confirmBan() {
    const confirmButton = this.banModal.getByRole('button', { name: /confirm|ban/i });
    await confirmButton.click();
  }

  /**
   * Click unban button for a specific visitor by index
   */
  async unbanVisitor(index: number) {
    await this.unbanButtons.nth(index).click();
    await this.unbanModal.waitFor({ state: 'visible' });
  }

  /**
   * Confirm unban action
   */
  async confirmUnban() {
    const confirmButton = this.unbanModal.getByRole('button', { name: /confirm|unban/i });
    await confirmButton.click();
  }

  /**
   * Check if suspend modal is visible
   */
  async isSuspendModalVisible() {
    return await this.suspendModal.isVisible();
  }

  /**
   * Check if ban modal is visible
   */
  async isBanModalVisible() {
    return await this.banModal.isVisible();
  }

  /**
   * Check if cancel suspend modal is visible
   */
  async isCancelSuspendModalVisible() {
    return await this.cancelSuspendModal.isVisible();
  }

  /**
   * Check if unban modal is visible
   */
  async isUnbanModalVisible() {
    return await this.unbanModal.isVisible();
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
