import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Company Verification Page
 * Page Object Model for admin company verification page
 */
export class CompanyVerificationPage extends BasePage {
  readonly userIcon: Locator;
  readonly logoutButton: Locator;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly sectionTitle: Locator;
  readonly table: Locator;
  readonly tableHeaders: {
    companyName: Locator;
    industry: Locator;
    contact: Locator;
    submitted: Locator;
    actions: Locator;
  };

  // Table actions
  readonly viewButtons: Locator;
  readonly reconsiderButtons: Locator;

  // Modals
  readonly reconsiderModal: Locator;
  readonly successModal: Locator;
  readonly errorModal: Locator;

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
      name: /company verification/i,
      level: 1,
    });
    this.pageDescription = page.getByText(
      /review and reconsider unverified company registrations/i
    );
    this.sectionTitle = page.getByRole('heading', { name: /unverified companies/i });

    // Table elements
    this.table = page.locator('table');
    this.tableHeaders = {
      companyName: page.locator('th').filter({ hasText: /company name/i }),
      industry: page.locator('th').filter({ hasText: /industry/i }),
      contact: page.locator('th').filter({ hasText: /contact/i }),
      submitted: page.locator('th').filter({ hasText: /submitted/i }),
      actions: page.locator('th').filter({ hasText: /actions/i }),
    };

    // Actions
    this.viewButtons = page.getByRole('button', { name: /view/i });
    this.reconsiderButtons = page.getByRole('button', { name: /reconsider/i });

    // Modals
    this.reconsiderModal = page.locator('[role="dialog"]', {
      has: page.getByText(/reconsider/i),
    });
    this.successModal = page.locator('[role="dialog"]', { has: page.getByText(/success/i) });
    this.errorModal = page.locator('[role="dialog"]', { has: page.getByText(/error|failed/i) });

    // States
    this.loadingMessage = page.getByText(/loading companies/i);
    this.emptyMessage = page.getByText(/no unverified companies found/i);
  }

  /**
   * Navigate to company verification page
   */
  async navigate() {
    await this.goto('/admin/company-verification');
  }

  /**
   * Wait for companies to load
   */
  async waitForCompaniesLoad() {
    await this.page.waitForSelector('table tbody tr', { state: 'visible' });
  }

  /**
   * Check if page is in loading state
   */
  async isLoading() {
    return await this.loadingMessage.isVisible();
  }

  /**
   * Check if there are no companies
   */
  async isEmpty() {
    return await this.emptyMessage.isVisible();
  }

  /**
   * Get number of companies in table
   */
  async getCompanyCount() {
    const rows = await this.table.locator('tbody tr').count();
    // Subtract 1 if loading or empty message row is present
    const hasMessage = await this.loadingMessage.isVisible().catch(() => false);
    return hasMessage ? 0 : rows;
  }

  /**
   * Get company data by row index
   */
  async getCompanyByIndex(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    const cells = row.locator('td');

    return {
      name: await cells.nth(0).textContent(),
      industry: await cells.nth(1).textContent(),
      contact: await cells.nth(2).textContent(),
      submitted: await cells.nth(3).textContent(),
    };
  }

  /**
   * Click view button for a specific company by index
   */
  async viewCompany(index: number) {
    await this.viewButtons.nth(index).click();
  }

  /**
   * Click reconsider button for a specific company by index
   */
  async reconsiderCompany(index: number) {
    await this.reconsiderButtons.nth(index).click();
    await this.reconsiderModal.waitFor({ state: 'visible' });
  }

  /**
   * Confirm reconsider action in modal
   */
  async confirmReconsider() {
    const confirmButton = this.reconsiderModal.getByRole('button', {
      name: /approve/i,
    });
    await confirmButton.click();
  }

  /**
   * Cancel reconsider action in modal
   */
  async cancelReconsider() {
    const cancelButton = this.reconsiderModal.getByRole('button', { name: /cancel/i });
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
