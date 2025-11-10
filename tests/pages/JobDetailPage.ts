import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Job Detail Page
 * Page Object Model for viewing job details
 */
export class JobDetailPage extends BasePage {
  readonly jobTitle: Locator;
  readonly companyName: Locator;
  readonly location: Locator;
  readonly salary: Locator;
  readonly jobType: Locator;
  readonly description: Locator;
  readonly requirements: Locator;
  readonly applyButton: Locator;
  readonly saveButton: Locator;
  readonly shareButton: Locator;
  readonly reportButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.jobTitle = page.locator('[data-testid="job-title"]');
    this.companyName = page.locator('[data-testid="company-name"]');
    this.location = page.locator('[data-testid="job-location"]');
    this.salary = page.locator('[data-testid="job-salary"]');
    this.jobType = page.locator('[data-testid="job-type"]');
    this.description = page.locator('[data-testid="job-description"]');
    this.requirements = page.locator('[data-testid="job-requirements"]');
    this.applyButton = page.getByRole('button', { name: /apply/i });
    this.saveButton = page.getByRole('button', { name: /save|bookmark/i });
    this.shareButton = page.getByRole('button', { name: /share/i });
    this.reportButton = page.getByRole('button', { name: /report/i });
    this.backButton = page.getByRole('button', { name: /back/i });
  }

  /**
   * Navigate to job detail page
   */
  async navigate(jobId: string) {
    await this.goto(`/job-post/${jobId}`);
  }

  /**
   * Get job title text
   */
  async getJobTitle() {
    return await this.jobTitle.textContent();
  }

  /**
   * Get company name
   */
  async getCompanyName() {
    return await this.companyName.textContent();
  }

  /**
   * Apply for the job
   */
  async applyForJob() {
    await this.applyButton.click();
  }

  /**
   * Save/bookmark the job
   */
  async saveJob() {
    await this.saveButton.click();
  }

  /**
   * Share the job
   */
  async shareJob() {
    await this.shareButton.click();
  }

  /**
   * Report the job
   */
  async reportJob() {
    await this.reportButton.click();
  }

  /**
   * Go back to previous page
   */
  async goBack() {
    await this.backButton.click();
  }

  /**
   * Check if apply button is enabled
   */
  async isApplyButtonEnabled() {
    return await this.applyButton.isEnabled();
  }
}
