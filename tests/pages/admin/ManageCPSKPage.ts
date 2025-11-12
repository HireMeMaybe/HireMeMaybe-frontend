import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Manage CPSK Page
 * Page Object Model for admin manage CPSK page
 */
export class ManageCPSKPage extends BasePage {
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly sectionTitle: Locator;
  readonly table: Locator;
  readonly tableHeaders: {
    name: Locator;
    email: Locator;
    department: Locator;
    status: Locator;
    actions: Locator;
  };

  // Table actions
  readonly viewButtons: Locator;
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

    this.pageTitle = page.getByRole('heading', {
      name: /manage cpsk/i,
      level: 1,
    });
    this.pageDescription = page.getByText(/oversee and moderate cpsk accounts/i);
    this.sectionTitle = page.getByRole('heading', { name: /cpsk accounts overview/i });

    // Table elements
    this.table = page.locator('table');
    this.tableHeaders = {
      name: page.locator('th').filter({ hasText: /name/i }),
      email: page.locator('th').filter({ hasText: /email/i }),
      department: page.locator('th').filter({ hasText: /department/i }),
      status: page.locator('th').filter({ hasText: /status/i }),
      actions: page.locator('th').filter({ hasText: /actions/i }),
    };

    // Actions
    this.viewButtons = page.getByRole('button', { name: /^view$/i });
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
    this.loadingMessage = page.getByText(/loading cpsk accounts/i);
    this.emptyMessage = page.getByText(/no cpsk accounts found/i);
  }

  /**
   * Navigate to manage CPSK page
   */
  async navigate() {
    await this.goto('/admin/manage-cpsk');
  }

  /**
   * Wait for accounts to load
   */
  async waitForAccountsLoad() {
    await this.page.waitForSelector('table tbody tr', { state: 'visible' });
  }

  /**
   * Check if page is in loading state
   */
  async isLoading() {
    return await this.loadingMessage.isVisible();
  }

  /**
   * Check if there are no accounts
   */
  async isEmpty() {
    return await this.emptyMessage.isVisible();
  }

  /**
   * Get number of accounts in table
   */
  async getAccountCount() {
    const rows = await this.table.locator('tbody tr').count();
    const hasMessage = await this.loadingMessage.isVisible().catch(() => false);
    return hasMessage ? 0 : rows;
  }

  /**
   * Get account data by row index
   */
  async getAccountByIndex(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const cells = row.locator('td');

    return {
      name: await cells.nth(0).textContent(),
      email: await cells.nth(1).textContent(),
      department: await cells.nth(2).textContent(),
      status: await cells.nth(3).textContent(),
    };
  }

  /**
   * Get account status by row index
   */
  async getAccountStatus(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const statusCell = row.locator('td').nth(3);
    return await statusCell.textContent();
  }

  /**
   * Click view button for a specific account by index
   */
  async viewAccount(index: number) {
    await this.viewButtons.nth(index).click();
  }

  /**
   * Click suspend button for a specific account by index
   */
  async suspendAccount(index: number) {
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
   * Click cancel suspend button for a specific account by index
   */
  async cancelSuspendAccount(index: number) {
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
   * Click ban button for a specific account by index
   */
  async banAccount(index: number) {
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
   * Click unban button for a specific account by index
   */
  async unbanAccount(index: number) {
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
}
