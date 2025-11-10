import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Application Page
 * Page Object Model for job application page
 */
export class ApplicationPage extends BasePage {
  readonly jobTitle: Locator;
  readonly companyName: Locator;
  readonly coverLetterTextarea: Locator;
  readonly resumeUpload: Locator;
  readonly additionalDocumentsUpload: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.jobTitle = page.locator('[data-testid="job-title"]');
    this.companyName = page.locator('[data-testid="company-name"]');
    this.coverLetterTextarea = page.getByLabel(/cover letter/i);
    this.resumeUpload = page.locator('input[name="resume"]');
    this.additionalDocumentsUpload = page.locator('input[name="additional-documents"]');
    this.submitButton = page.getByRole('button', { name: /submit/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  /**
   * Navigate to application page
   */
  async navigate(jobId: string) {
    await this.goto(`/application/${jobId}`);
  }

  /**
   * Fill application form
   */
  async fillApplication(data: {
    coverLetter: string;
    resumePath?: string;
    additionalDocuments?: string[];
  }) {
    await this.coverLetterTextarea.fill(data.coverLetter);

    if (data.resumePath) {
      await this.resumeUpload.setInputFiles(data.resumePath);
    }

    if (data.additionalDocuments && data.additionalDocuments.length > 0) {
      await this.additionalDocumentsUpload.setInputFiles(data.additionalDocuments);
    }
  }

  /**
   * Submit application
   */
  async submit() {
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Cancel application
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * Check if application was submitted successfully
   */
  async isSuccessMessageVisible() {
    return await this.successMessage.isVisible();
  }

  /**
   * Check if there's an error
   */
  async isErrorMessageVisible() {
    return await this.errorMessage.isVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}
