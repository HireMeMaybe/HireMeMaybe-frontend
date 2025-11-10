import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Company Registration Page
 * Page Object Model for company registration
 */
export class CompanyRegisterPage extends BasePage {
  readonly companyNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly industryTrigger: Locator;
  readonly companySizeTrigger: Locator;
  readonly overviewTextarea: Locator;
  readonly logoUpload: Locator;
  readonly bannerUpload: Locator;
  readonly submitButton: Locator;
  readonly confirmDialog: Locator;
  readonly confirmSubmitButton: Locator;
  readonly cancelButton: Locator;
  readonly successDialog: Locator;
  readonly successCloseButton: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.companyNameInput = page.getByLabel(/company name/i);
    this.emailInput = page.getByLabel(/email/i);
    this.phoneInput = page.getByLabel(/phone/i);
    this.industryTrigger = page.locator('[data-slot="select-trigger"]', {
      hasText: /select industry/i,
    });
    this.companySizeTrigger = page.locator('[data-slot="select-trigger"]', {
      hasText: /select size/i,
    });
    this.overviewTextarea = page.getByLabel(/overview/i);
    this.logoUpload = page.locator('input[type="file"]').first();
    this.bannerUpload = page.locator('input[type="file"]').nth(1);
    this.submitButton = page.getByRole('button', { name: /^submit$/i });
    // Confirmation modal (Dialog)
    this.confirmDialog = page.getByRole('dialog', { name: /submit register\?/i });
    this.confirmSubmitButton = this.confirmDialog.getByRole('button', { name: /^submit$/i });
    this.cancelButton = this.confirmDialog.getByRole('button', { name: /cancel/i });
    // Success modal (Dialog)
    this.successDialog = page.getByRole('dialog', {
      name: /registration submitted|action successful/i,
    });
    this.successCloseButton = this.successDialog.getByRole('button', { name: /(close|continue)/i });
    // Error messages use either 'text-red-reject' or 'text-red-600'
    this.errorMessages = page.locator('.text-red-reject, .text-red-600');
  }

  /**
   * Navigate to company registration page
   */
  async navigate() {
    await this.goto('/company-register');
  }

  /**
   * Fill company registration form
   */
  async fillRegistrationForm(data: {
    companyName: string;
    email: string;
    phone: string;
    industry: string;
    companySize: string;
    overview: string;
    logoPath?: string;
    bannerUpload?: string;
  }) {
    await this.companyNameInput.fill(data.companyName);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    // Open and select Industry
    await this.industryTrigger.click();
    await this.page.getByRole('option', { name: new RegExp(data.industry, 'i') }).click();
    // Open and select Company Size
    await this.companySizeTrigger.click();
    await this.page.getByRole('option', { name: new RegExp(data.companySize, 'i') }).click();
    await this.overviewTextarea.fill(data.overview);

    if (data.logoPath) {
      await this.logoUpload.setInputFiles(data.logoPath);
    }

    if (data.bannerUpload) {
      await this.bannerUpload.setInputFiles(data.bannerUpload);
    }
  }
  /**
   * Submit registration
   */
  async submit() {
    // Click primary submit, then confirm in modal
    await this.submitButton.click();
    await this.confirmDialog.waitFor({ state: 'visible' });
    await this.confirmSubmitButton.click();
    // Wait for either success dialog or navigation to occur
    await Promise.race([
      this.successDialog.waitFor({ state: 'visible' }),
      this.page.waitForLoadState('networkidle'),
    ]);
  }

  /**
   * Cancel registration
   */
  async cancel() {
    // Open modal then cancel
    await this.submitButton.click();
    await this.confirmDialog.waitFor({ state: 'visible' });
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
