import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Application History Page
 * Based on: src/features/history/components/HistoryPage.tsx
 * Route: /history
 */
export class HistoryPage extends BasePage {
  // Page elements
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;

  // Sorting controls
  readonly sortButton: Locator;
  readonly refreshButton: Locator;

  // History list
  readonly historyCards: Locator;
  readonly applicationStatus: Locator;

  // Pagination
  readonly paginationContainer: Locator;
  readonly previousPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly pageNumbers: Locator;

  // History details panel
  readonly detailsPanel: Locator;
  readonly jobTitle: Locator;
  readonly companyName: Locator;
  readonly appliedDate: Locator;
  readonly statusBadge: Locator;
  readonly applicationDetails: Locator;

  // Empty state
  readonly emptyStateMessage: Locator;
  readonly browseJobsButton: Locator;

  // Loading state
  readonly loadingSpinner: Locator;

  // Error state
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Page elements - based on HistoryPage.tsx
    this.pageTitle = page.getByRole('heading', { name: /^history$/i }); // h1: "History"
    this.pageDescription = page.getByText(/review your job applied activity/i); // p: description text

    // Sorting controls - match actual button text
    this.sortButton = page.getByRole('button', { name: /^newest$|^oldest$/i }); // Button shows "Newest" or "Oldest"
    this.refreshButton = page.getByRole('button', { name: /refresh/i });

    // History list - HistoryCard components
    this.historyCards = page.locator('button.cursor-pointer').filter({ has: page.locator('h3') });
    this.applicationStatus = this.historyCards
      .locator('span')
      .filter({ hasText: /pending|approved|rejected/i });

    // Pagination - from Pagination.tsx
    this.paginationContainer = page.locator('nav[aria-label="pagination"]');
    this.previousPageButton = page.getByRole('button', { name: /previous/i });
    this.nextPageButton = page.getByRole('button', { name: /next/i });
    this.pageNumbers = page.getByRole('button').filter({ hasText: /^\d+$/ });

    // History details panel
    this.detailsPanel = page.getByRole('button', { name: 'View Application' });
    this.jobTitle = page.getByRole('heading', { name: 'Full Stack Developer' });
    this.companyName = page.getByText('TechCorp Solutions');
    this.appliedDate = page.getByText('Applied August 28,');
    this.statusBadge = page.locator('span').filter({ hasText: /pending|approved|rejected/i });
    this.applicationDetails = page.getByRole('heading', { name: 'Job Description' });

    // Empty state
    this.emptyStateMessage = page.getByText(/no application history|you haven't applied/i);
    this.browseJobsButton = page.getByRole('button', { name: /browse jobs/i });

    // Loading state
    this.loadingSpinner = page.getByText(/loading/i);

    // Error state
    this.errorMessage = page.locator('div.text-red-400');
  }

  /**
   * Navigate to history page
   */
  async navigate(): Promise<void> {
    await this.page.goto('/history');
    await this.waitForPageLoad();
  }

  /**
   * Toggle sort order (ascending/descending)
   */
  async toggleSort(): Promise<void> {
    await this.sortButton.click();
  }

  /**
   * Refresh history data
   */
  async refresh(): Promise<void> {
    await this.refreshButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Get number of history items
   */
  async getHistoryCount(): Promise<number> {
    return await this.historyCards.count();
  }

  /**
   * Click on a history card by index
   */
  async clickHistoryCard(index: number): Promise<void> {
    await this.historyCards.nth(index).click();
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
   * Get application status by index
   */
  async getApplicationStatus(index: number): Promise<string> {
    const status = await this.historyCards
      .nth(index)
      .locator('span')
      .filter({ hasText: /pending|approved|rejected/i })
      .first()
      .textContent();
    return status || '';
  }

  /**
   * Get selected application details
   */
  async getSelectedApplicationDetails(): Promise<{
    jobTitle: string;
    companyName: string;
    appliedDate: string;
    status: string;
  }> {
    await this.detailsPanel.waitFor({ state: 'visible' });
    return {
      jobTitle: (await this.jobTitle.textContent()) || '',
      companyName: (await this.companyName.textContent()) || '',
      appliedDate: (await this.appliedDate.textContent()) || '',
      status: (await this.statusBadge.first().textContent()) || '',
    };
  }

  /**
   * Check if history is empty
   */
  async isHistoryEmpty(): Promise<boolean> {
    return await this.emptyStateMessage.isVisible();
  }

  /**
   * Browse jobs from empty state
   */
  async browseJobs(): Promise<void> {
    await this.browseJobsButton.click();
  }

  /**
   * Filter applications by status
   */
  async filterByStatus(status: 'Pending' | 'Approved' | 'Rejected'): Promise<void> {
    // This would depend on the actual filter implementation
    await this.page.getByRole('button', { name: new RegExp(status, 'i') }).click();
  }

  /**
   * Get all visible application statuses
   */
  async getAllStatuses(): Promise<string[]> {
    return await this.applicationStatus.allTextContents();
  }
}
