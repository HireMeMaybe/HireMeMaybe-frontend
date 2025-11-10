import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * History Page
 * Page Object Model for viewing application history
 */
export class HistoryPage extends BasePage {
  readonly applicationCards: Locator;
  readonly filterSelect: Locator;
  readonly searchInput: Locator;
  readonly sortButton: Locator;
  readonly noHistoryMessage: Locator;
  readonly loadMoreButton: Locator;

  constructor(page: Page) {
    super(page);
    this.applicationCards = page.locator('[data-testid="application-card"]');
    this.filterSelect = page.getByLabel(/filter|status/i);
    this.searchInput = page.getByPlaceholder(/search/i);
    this.sortButton = page.getByRole('button', { name: /sort/i });
    this.noHistoryMessage = page.locator('[data-testid="no-history"]');
    this.loadMoreButton = page.getByRole('button', { name: /load more/i });
  }

  /**
   * Navigate to history page
   */
  async navigate() {
    await this.goto('/history');
  }

  /**
   * Get number of applications
   */
  async getApplicationCount() {
    return await this.applicationCards.count();
  }

  /**
   * Click on specific application card
   */
  async clickApplicationCard(index: number) {
    await this.applicationCards.nth(index).click();
  }

  /**
   * Filter applications by status
   */
  async filterByStatus(status: string) {
    await this.filterSelect.selectOption(status);
    await this.waitForPageLoad();
  }

  /**
   * Search applications
   */
  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Sort applications
   */
  async sort() {
    await this.sortButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Check if no history message is visible
   */
  async isNoHistoryVisible() {
    return await this.noHistoryMessage.isVisible();
  }

  /**
   * Load more applications
   */
  async loadMore() {
    await this.loadMoreButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Get application status by index
   */
  async getApplicationStatus(index: number) {
    const statusLocator = this.applicationCards
      .nth(index)
      .locator('[data-testid="application-status"]');
    return await statusLocator.textContent();
  }
}
