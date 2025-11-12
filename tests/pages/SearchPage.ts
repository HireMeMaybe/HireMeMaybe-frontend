import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Job Search Page
 * Based on: src/features/search/components/SearchPage.tsx
 * Route: /search
 */
export class SearchPage extends BasePage {
  // Page elements
  readonly pageTitle: Locator;

  // Search bar
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  // Filters
  readonly filtersSection: Locator;
  readonly industryFilter: Locator;
  readonly locationFilter: Locator;
  readonly jobTypeFilter: Locator;
  readonly experienceLevelFilter: Locator;
  readonly salaryRangeFilter: Locator;
  readonly clearFiltersButton: Locator;
  readonly applyFiltersButton: Locator;

  // Sort controls
  readonly sortButton: Locator;
  readonly sortDropdown: Locator;

  // Job cards
  readonly jobCards: Locator;
  readonly jobTitle: Locator;
  readonly companyName: Locator;
  readonly companyLogo: Locator;
  readonly jobLocation: Locator;
  readonly jobType: Locator;
  readonly jobSalary: Locator;
  readonly jobTags: Locator;
  readonly postedDate: Locator;

  // Job details panel/modal
  readonly jobDetailsPanel: Locator;
  readonly jobDescription: Locator;
  readonly jobRequirements: Locator;
  readonly applyButton: Locator;
  readonly viewCompanyButton: Locator;

  // Pagination
  readonly paginationContainer: Locator;
  readonly previousPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly pageNumbers: Locator;
  readonly currentPageIndicator: Locator;

  // Empty/No results state
  readonly noResultsMessage: Locator;
  readonly clearSearchButton: Locator;

  // Loading state
  readonly loadingSpinner: Locator;

  // Error state
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Page elements - based on SearchPage.tsx
    // Note: SearchPage doesn't have a page title heading, starts with search bar
    this.pageTitle = page.getByRole('heading').first(); // Fallback if heading exists

    // Search bar - match actual placeholder
    this.searchInput = page.getByPlaceholder(/search for job titles/i);
    this.searchButton = page.getByRole('button', { name: /search/i }).first();

    // Filters - based on SearchFilters.tsx
    this.filtersSection = page.locator('div').filter({ has: page.getByText(/filters/i) });
    this.industryFilter = page.getByLabel(/industry/i);
    this.locationFilter = page.getByLabel(/location/i);
    this.jobTypeFilter = page.getByLabel(/job type|type/i);
    this.experienceLevelFilter = page.getByLabel(/experience level|experience/i);
    this.salaryRangeFilter = page.getByLabel(/salary/i);
    this.clearFiltersButton = page.getByRole('button', { name: /clear filters|reset/i });
    this.applyFiltersButton = page.getByRole('button', { name: /apply filters/i });

    // Sort controls - match actual button text "Newest first" / "Oldest first"
    this.sortButton = page.getByRole('button', { name: /newest first|oldest first/i });
    this.sortDropdown = page.locator('select, div[role="listbox"]');

    // Job cards - based on JobCard.tsx
    this.jobCards = page.locator('div.cursor-pointer').filter({ has: page.locator('h3') });
    this.jobTitle = page.locator('h3');
    this.companyName = page.locator('p').filter({ hasText: /ltd|corp|inc|co|company/i });
    this.companyLogo = page.locator('img[alt*="logo"]');
    this.jobLocation = page.locator('text=/onsite|remote|hybrid/i');
    this.jobType = page.locator('text=/onsite|remote|hybrid/i');
    this.jobSalary = page.locator('text=/฿|baht|thb/i');
    this.jobTags = page.locator('span.rounded-full, span.badge');
    this.postedDate = page.locator('text=/posted|ago|days|hours/i');

    // Job details panel/modal
    this.jobDetailsPanel = page
      .locator('div')
      .filter({ has: page.getByRole('heading', { level: 2 }) });
    this.jobDescription = page.locator('p, div').filter({ hasText: /description|about/i });
    this.jobRequirements = page
      .locator('p, div')
      .filter({ hasText: /requirements|qualifications/i });
    this.applyButton = page.getByRole('button', { name: /^apply$|apply now/i });
    this.viewCompanyButton = page.getByRole('button', { name: /view company/i });

    // Pagination - based on Pagination.tsx
    this.paginationContainer = page.locator('nav[aria-label="pagination"]');
    this.previousPageButton = page.getByRole('button', { name: /previous/i });
    this.nextPageButton = page.getByRole('button', { name: /next/i });
    this.pageNumbers = page.getByRole('button').filter({ hasText: /^\d+$/ });
    this.currentPageIndicator = page.locator('button[aria-current="page"]');

    // Empty/No results state
    this.noResultsMessage = page.getByText(/no jobs found|no results/i);
    this.clearSearchButton = page.getByRole('button', { name: /clear search/i });

    // Loading state
    this.loadingSpinner = page.locator('div.animate-spin');

    // Error state
    this.errorMessage = page.locator('div.text-red-400');
  }

  /**
   * Navigate to search page
   */
  async navigate(query?: string): Promise<void> {
    const url = query ? `/search?query=${encodeURIComponent(query)}` : '/search';
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  /**
   * Search for jobs
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Apply filters
   */
  async applyFilters(filters: {
    industry?: string;
    location?: string;
    jobType?: string;
    experienceLevel?: string;
    salaryRange?: string;
  }): Promise<void> {
    if (filters.industry) await this.industryFilter.selectOption(filters.industry);
    if (filters.location) await this.locationFilter.fill(filters.location);
    if (filters.jobType) await this.jobTypeFilter.selectOption(filters.jobType);
    if (filters.experienceLevel)
      await this.experienceLevelFilter.selectOption(filters.experienceLevel);
    if (filters.salaryRange) await this.salaryRangeFilter.selectOption(filters.salaryRange);

    if (this.applyFiltersButton) {
      await this.applyFiltersButton.click();
      await this.waitForPageLoad();
    }
  }

  /**
   * Clear all filters
   */
  async clearFilters(): Promise<void> {
    await this.clearFiltersButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Toggle sort order
   */
  async toggleSort(): Promise<void> {
    await this.sortButton.click();
  }

  /**
   * Get number of job results
   */
  async getJobCount(): Promise<number> {
    return await this.jobCards.count();
  }

  /**
   * Click on a job card by index
   */
  async clickJobCard(index: number): Promise<void> {
    await this.jobCards.nth(index).click();
  }

  /**
   * Get job information by index
   */
  async getJobInfo(index: number): Promise<{
    title: string;
    company: string;
    location: string;
    type: string;
  }> {
    const card = this.jobCards.nth(index);
    return {
      title: (await card.locator(this.jobTitle).textContent()) || '',
      company: (await card.locator(this.companyName).textContent()) || '',
      location: (await card.locator(this.jobLocation).textContent()) || '',
      type: (await card.locator(this.jobType).textContent()) || '',
    };
  }

  /**
   * Apply to a job from details panel
   */
  async applyToJob(): Promise<void> {
    await this.applyButton.click();
  }

  /**
   * View company profile from job details
   */
  async viewCompany(): Promise<void> {
    await this.viewCompanyButton.click();
  }

  /**
   * Go to next page
   */
  async goToNextPage(): Promise<void> {
    await this.nextPageButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Go to previous page
   */
  async goToPreviousPage(): Promise<void> {
    await this.previousPageButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Go to specific page number
   */
  async goToPage(pageNumber: number): Promise<void> {
    await this.pageNumbers.filter({ hasText: String(pageNumber) }).click();
    await this.waitForPageLoad();
  }

  /**
   * Check if there are no results
   */
  async hasNoResults(): Promise<boolean> {
    return await this.noResultsMessage.isVisible();
  }

  /**
   * Get job tags for a specific job card
   */
  async getJobTags(jobIndex: number): Promise<string[]> {
    return await this.jobCards.nth(jobIndex).locator(this.jobTags).allTextContents();
  }

  /**
   * Check if filters are applied
   */
  async areFiltersApplied(): Promise<boolean> {
    // Check if any filter has a value
    const industryValue = await this.industryFilter.inputValue();
    const locationValue = await this.locationFilter.inputValue();
    return industryValue.length > 0 || locationValue.length > 0;
  }

  /**
   * Get current page number
   */
  async getCurrentPage(): Promise<number> {
    const pageText = await this.currentPageIndicator.textContent();
    return Number.parseInt(pageText || '1', 10);
  }

  /**
   * Clear search query
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.searchButton.click();
    await this.waitForPageLoad();
  }
}
