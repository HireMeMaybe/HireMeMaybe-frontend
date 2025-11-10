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
  readonly websiteInput: Locator;
  readonly addressInput: Locator;
  readonly industrySelect: Locator;
  readonly companySizeSelect: Locator;
  readonly descriptionTextarea: Locator;
  readonly logoUpload: Locator;
  readonly documentsUpload: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.companyNameInput = page.getByLabel(/company name/i);
    this.emailInput = page.getByLabel(/email/i);
    this.phoneInput = page.getByLabel(/phone/i);
    this.websiteInput = page.getByLabel(/website/i);
    this.addressInput = page.getByLabel(/address/i);
    this.industrySelect = page.getByLabel(/industry/i);
    this.companySizeSelect = page.getByLabel(/company size/i);
    this.descriptionTextarea = page.getByLabel(/description/i);
    this.logoUpload = page.locator('input[name="logo"]');
    this.documentsUpload = page.locator('input[name="documents"]');
    this.termsCheckbox = page.getByRole('checkbox', {
      name: /terms|agree/i,
    });
    this.submitButton = page.getByRole('button', { name: /submit|register/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.errorMessages = page.locator('[data-testid="error-message"]');
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
    website?: string;
    address: string;
    industry: string;
    companySize: string;
    description: string;
    logoPath?: string;
    documentsPath?: string[];
  }) {
    await this.companyNameInput.fill(data.companyName);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);

    if (data.website) {
      await this.websiteInput.fill(data.website);
    }

    await this.addressInput.fill(data.address);
    await this.industrySelect.selectOption(data.industry);
    await this.companySizeSelect.selectOption(data.companySize);
    await this.descriptionTextarea.fill(data.description);

    if (data.logoPath) {
      await this.logoUpload.setInputFiles(data.logoPath);
    }

    if (data.documentsPath && data.documentsPath.length > 0) {
      await this.documentsUpload.setInputFiles(data.documentsPath);
    }
  }

  /**
   * Accept terms and conditions
   */
  async acceptTerms() {
    await this.termsCheckbox.check();
  }

  /**
   * Submit registration
   */
  async submit() {
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Cancel registration
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
