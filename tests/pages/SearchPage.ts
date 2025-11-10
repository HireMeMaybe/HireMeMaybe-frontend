import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Search Page
 * Page Object Model for job search page
 */
export class SearchPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly filterButton: Locator;
  readonly jobCards: Locator;
  readonly noResultsMessage: Locator;
  readonly loadMoreButton: Locator;

  // Filter locators
  readonly locationFilter: Locator;
  readonly salaryFilter: Locator;
  readonly jobTypeFilter: Locator;
  readonly experienceFilter: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder(/search/i);
    this.searchButton = page.getByRole('button', { name: /search/i });
    this.filterButton = page.getByRole('button', { name: /filter/i });
    this.jobCards = page.locator('[data-testid="job-card"]');
    this.noResultsMessage = page.locator('[data-testid="no-results"]');
    this.loadMoreButton = page.getByRole('button', { name: /load more/i });

    // Filters
    this.locationFilter = page.locator('[data-testid="location-filter"]');
    this.salaryFilter = page.locator('[data-testid="salary-filter"]');
    this.jobTypeFilter = page.locator('[data-testid="job-type-filter"]');
    this.experienceFilter = page.locator('[data-testid="experience-filter"]');
  }

  /**
   * Navigate to search page
   */
  async navigate() {
    await this.goto('/search');
  }

  /**
   * Perform search with keyword
   */
  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Apply location filter
   */
  async applyLocationFilter(location: string) {
    await this.locationFilter.click();
    await this.page.getByText(location).click();
  }

  /**
   * Get number of job results
   */
  async getJobCount() {
    return await this.jobCards.count();
  }

  /**
   * Click on specific job card by index
   */
  async clickJobCard(index: number) {
    await this.jobCards.nth(index).click();
  }

  /**
   * Check if no results message is visible
   */
  async isNoResultsVisible() {
    return await this.noResultsMessage.isVisible();
  }

  /**
   * Load more results
   */
  async loadMore() {
    await this.loadMoreButton.click();
    await this.waitForPageLoad();
  }
}
