import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Job Post Page (Create/Edit)
 * Page Object Model for creating and editing job posts
 */
export class JobPostPage extends BasePage {
  readonly titleInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly locationInput: Locator;
  readonly salaryInput: Locator;
  readonly jobTypeSelect: Locator;
  readonly experienceSelect: Locator;
  readonly skillsInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly publishButton: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.titleInput = page.getByLabel(/job title|title/i);
    this.descriptionTextarea = page.getByLabel(/description/i);
    this.locationInput = page.getByLabel(/location/i);
    this.salaryInput = page.getByLabel(/salary/i);
    this.jobTypeSelect = page.getByLabel(/job type/i);
    this.experienceSelect = page.getByLabel(/experience/i);
    this.skillsInput = page.getByLabel(/skills/i);
    this.saveButton = page.getByRole('button', { name: /save/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.publishButton = page.getByRole('button', { name: /publish/i });
    this.errorMessages = page.locator('[data-testid="error-message"]');
  }

  /**
   * Navigate to create job post page
   */
  async navigate() {
    await this.goto('/job-post');
  }

  /**
   * Navigate to edit job post page
   */
  async navigateToEdit(jobId: string) {
    await this.goto(`/job-post/${jobId}`);
  }

  /**
   * Fill job post form
   */
  async fillJobPostForm(data: {
    title: string;
    description: string;
    location: string;
    salary?: string;
    jobType?: string;
    experience?: string;
    skills?: string[];
  }) {
    await this.titleInput.fill(data.title);
    await this.descriptionTextarea.fill(data.description);
    await this.locationInput.fill(data.location);

    if (data.salary) {
      await this.salaryInput.fill(data.salary);
    }

    if (data.jobType) {
      await this.jobTypeSelect.selectOption(data.jobType);
    }

    if (data.experience) {
      await this.experienceSelect.selectOption(data.experience);
    }

    if (data.skills && data.skills.length > 0) {
      for (const skill of data.skills) {
        await this.skillsInput.fill(skill);
        await this.page.keyboard.press('Enter');
      }
    }
  }

  /**
   * Save job post as draft
   */
  async saveDraft() {
    await this.saveButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Publish job post
   */
  async publish() {
    await this.publishButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Cancel job post creation/editing
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * Check if form has errors
   */
  async hasErrors() {
    return (await this.errorMessages.count()) > 0;
  }

  /**
   * Get all error messages
   */
  async getErrorMessages() {
    return await this.errorMessages.allTextContents();
  }
}
