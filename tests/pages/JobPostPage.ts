import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Job Post Creation/Edit Form
 * Based on: src/features/job-post/components/JobPostForm.tsx
 * Route: /job-post
 */
export class JobPostPage extends BasePage {
  // Page elements
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;

  // Form fields
  readonly openingPositionInput: Locator;
  readonly descriptionInput: Locator;
  readonly requirementsInput: Locator;
  readonly workLocationInput: Locator;
  readonly hiringTypeSelect: Locator;
  readonly salarySelect: Locator;
  readonly experienceLevelSelect: Locator;
  readonly tagsInput: Locator;
  readonly expiringTimeInput: Locator;

  // Tags
  readonly tagsList: Locator;
  readonly removeTagButtons: Locator;

  // Application form options
  readonly includeDefaultFormCheckbox: Locator;
  readonly includeCustomFormCheckbox: Locator;
  readonly customFormLinkInput: Locator;
  readonly defaultQuestionsPreview: Locator;

  // Buttons
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly previewButton: Locator;

  // Error messages
  readonly errorMessage: Locator;
  readonly fieldErrors: Locator;

  // Success state
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Page elements - based on JobPostForm.tsx
    this.pageTitle = page.getByRole('heading', { name: /^job posting$/i }); // h1: "Job Posting"
    this.pageDescription = page.getByRole('heading', { name: /^job details$/i }); // h2: "Job Details"

    // Form fields - match actual label text
    this.openingPositionInput = page.getByLabel(/opening position|job title/i);
    this.descriptionInput = page.getByLabel(/^description$/i);
    this.requirementsInput = page.getByLabel(/requirements/i);
    this.workLocationInput = page.getByLabel(/work location|location/i);
    this.hiringTypeSelect = page.getByLabel(/hiring type|job type/i);
    this.salarySelect = page.getByLabel(/salary/i);
    this.experienceLevelSelect = page.getByLabel(/experience level/i);
    this.tagsInput = page.getByLabel(/tags/i);
    this.expiringTimeInput = page.getByLabel(/expiring time|deadline/i);

    // Tags - match actual structure
    this.tagsList = page.locator('span.rounded-full').filter({ hasText: /^(?!soft|skill)/ }); // Filter out soft skills
    this.removeTagButtons = page.locator('button').filter({ hasText: /[×✕]/ });

    // Application form options - match checkbox labels
    this.includeDefaultFormCheckbox = page.getByLabel(/include default application form/i);
    this.includeCustomFormCheckbox = page.getByLabel(/include custom form/i);
    this.customFormLinkInput = page.getByLabel(/custom form link/i);
    this.defaultQuestionsPreview = page.locator('text=/default questions/i');

    // Buttons - match actual button text
    this.submitButton = page.getByRole('button', { name: /post job|submit|create/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.previewButton = page.getByRole('button', { name: /preview/i });

    // Error messages
    this.errorMessage = page.locator('div.text-red-400, p.text-red-reject');
    this.fieldErrors = page.locator('p.text-red-reject, span.text-red-reject');

    // Success state
    this.successMessage = page.getByText(/success|posted/i);
  }

  /**
   * Navigate to job post creation page
   */
  async navigate(): Promise<void> {
    await this.page.goto('/job-post');
    await this.waitForPageLoad();
  }

  /**
   * Fill basic job information
   */
  private async fillBasicInfo(data: {
    openingPosition?: string;
    description?: string;
    requirements?: string;
    workLocation?: string;
    hiringType?: string;
    salary?: string;
    experienceLevel?: string;
    expiringTime?: string;
  }): Promise<void> {
    if (data.openingPosition) await this.openingPositionInput.fill(data.openingPosition);
    if (data.description) await this.descriptionInput.fill(data.description);
    if (data.requirements) await this.requirementsInput.fill(data.requirements);
    if (data.workLocation) await this.workLocationInput.fill(data.workLocation);
    if (data.hiringType) await this.hiringTypeSelect.selectOption(data.hiringType);
    if (data.salary) await this.salarySelect.selectOption(data.salary);
    if (data.experienceLevel) await this.experienceLevelSelect.selectOption(data.experienceLevel);
    if (data.expiringTime) await this.expiringTimeInput.fill(data.expiringTime);
  }

  /**
   * Configure application form options
   */
  private async configureApplicationForm(data: {
    includeDefaultForm?: boolean;
    includeCustomForm?: boolean;
    customFormLink?: string;
  }): Promise<void> {
    if (data.includeDefaultForm !== undefined) {
      const isChecked = await this.includeDefaultFormCheckbox.isChecked();
      if (isChecked !== data.includeDefaultForm) {
        await this.includeDefaultFormCheckbox.click();
      }
    }

    if (data.includeCustomForm !== undefined) {
      const isChecked = await this.includeCustomFormCheckbox.isChecked();
      if (isChecked !== data.includeCustomForm) {
        await this.includeCustomFormCheckbox.click();
      }
    }

    if (data.customFormLink) await this.customFormLinkInput.fill(data.customFormLink);
  }

  /**
   * Fill in job post form
   */
  async fillJobPostForm(data: {
    openingPosition?: string;
    description?: string;
    requirements?: string;
    workLocation?: string;
    hiringType?: string;
    salary?: string;
    experienceLevel?: string;
    tags?: string[];
    expiringTime?: string;
    includeDefaultForm?: boolean;
    includeCustomForm?: boolean;
    customFormLink?: string;
  }): Promise<void> {
    await this.fillBasicInfo(data);

    // Add tags
    if (data.tags && data.tags.length > 0) {
      for (const tag of data.tags) {
        await this.tagsInput.fill(tag);
        await this.tagsInput.press('Enter');
      }
    }

    await this.configureApplicationForm(data);
  }

  /**
   * Add a tag
   */
  async addTag(tag: string): Promise<void> {
    await this.tagsInput.fill(tag);
    await this.tagsInput.press('Enter');
  }

  /**
   * Remove a tag by index
   */
  async removeTag(index: number): Promise<void> {
    await this.removeTagButtons.nth(index).click();
  }

  /**
   * Get list of tags
   */
  async getTags(): Promise<string[]> {
    return await this.tagsList.allTextContents();
  }

  /**
   * Toggle include default application form
   */
  async toggleDefaultForm(): Promise<void> {
    await this.includeDefaultFormCheckbox.click();
  }

  /**
   * Toggle include custom form
   */
  async toggleCustomForm(): Promise<void> {
    await this.includeCustomFormCheckbox.click();
  }

  /**
   * Submit the job post
   */
  async submitJobPost(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Cancel job post creation
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Preview job post
   */
  async preview(): Promise<void> {
    await this.previewButton.click();
  }

  /**
   * Check if default questions are visible
   */
  async areDefaultQuestionsVisible(): Promise<boolean> {
    return await this.defaultQuestionsPreview.isVisible();
  }

  /**
   * Check if custom form link field is visible
   */
  async isCustomFormLinkVisible(): Promise<boolean> {
    return await this.customFormLinkInput.isVisible();
  }

  /**
   * Get all available job types
   */
  async getJobTypes(): Promise<string[]> {
    await this.hiringTypeSelect.click();
    const options = await this.page.locator('[role="option"]').allTextContents();
    await this.hiringTypeSelect.press('Escape');
    return options;
  }

  /**
   * Get all available experience levels
   */
  async getExperienceLevels(): Promise<string[]> {
    await this.experienceLevelSelect.click();
    const options = await this.page.locator('[role="option"]').allTextContents();
    await this.experienceLevelSelect.press('Escape');
    return options;
  }

  /**
   * Get all available salary ranges
   */
  async getSalaryRanges(): Promise<string[]> {
    await this.salarySelect.click();
    const options = await this.page.locator('[role="option"]').allTextContents();
    await this.salarySelect.press('Escape');
    return options;
  }

  /**
   * Check for validation errors
   */
  async hasValidationErrors(): Promise<boolean> {
    return await this.fieldErrors.first().isVisible();
  }

  /**
   * Get validation error messages
   */
  async getValidationErrors(): Promise<string[]> {
    return await this.fieldErrors.allTextContents();
  }
}
