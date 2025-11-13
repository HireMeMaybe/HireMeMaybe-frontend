import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Job Search Page
 * Based on: src/features/search/components/SearchPage.tsx
 * Route: /search
 *
 * Role-based access:
 * - CPSK: Can view jobs and apply
 * - Company: Can view jobs (read-only, no apply button)
 * - Visitor: Can view jobs (read-only, no apply button)
 * - Admin: Can view jobs (read-only, no apply button)
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
  readonly jobDetailsTitle: Locator;
  readonly jobDescription: Locator;
  readonly jobRequirements: Locator;
  readonly externalLinkIcon: Locator;

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

    // Job details panel/modal - based on JobDetails component in JobCard.tsx
    this.jobDetailsPanel = page.locator(
      'div.bg-very-dark-gray.rounded-lg.border.border-gray-700.p-6'
    );
    this.jobDetailsTitle = page.locator('div.bg-very-dark-gray h1.text-2xl');
    this.jobDescription = page.locator('div.text-sm.leading-relaxed.whitespace-pre-line');
    this.jobRequirements = page
      .locator('p, div')
      .filter({ hasText: /requirements|qualifications/i });
    this.externalLinkIcon = page.locator('svg.lucide-external-link');

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

  // ==================== Role-specific Buttons ====================

  /**
   * Get Apply button in job details panel (CPSK only)
   * Visible only for CPSK role, hidden for Company, Visitor, and Admin
   */
  getApplyButton(): Locator {
    return this.page.getByRole('button', { name: /^apply$/i });
  }

  /**
   * Get company logo/name button that links to company profile
   * Available for all roles
   */
  getCompanyProfileButton(): Locator {
    return this.jobDetailsPanel.locator('button').filter({
      has: this.page.locator('img[alt*="logo"], div.rounded.bg-gray-600'),
    });
  }

  // ==================== Navigation ====================

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

  // ==================== Role-specific Actions ====================

  /**
   * Apply to a job from details panel (CPSK only)
   */
  async applyToJob(): Promise<void> {
    await this.getApplyButton().click();
  }

  /**
   * View company profile from job details (All roles)
   */
  async viewCompanyProfile(): Promise<void> {
    await this.getCompanyProfileButton().click();
  }

  /**
   * Open job post in new tab via external link icon (All roles)
   */
  async openJobInNewTab(): Promise<void> {
    await this.externalLinkIcon.click();
  }

  // ==================== View State Checks ====================

  /**
   * Check if Apply button is visible (indicates CPSK view)
   */
  async canApplyToJobs(): Promise<boolean> {
    // First check if job details panel is visible
    const isDetailsVisible = await this.jobDetailsPanel.isVisible();
    if (!isDetailsVisible) return false;

    return await this.getApplyButton().isVisible();
  }

  /**
   * Check if viewing as read-only (Company, Visitor, or Admin)
   */
  async isReadOnlyView(): Promise<boolean> {
    const isDetailsVisible = await this.jobDetailsPanel.isVisible();
    if (!isDetailsVisible) return false;

    const hasApplyButton = await this.getApplyButton().isVisible();
    return !hasApplyButton;
  }

  // ==================== Pagination ====================

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
