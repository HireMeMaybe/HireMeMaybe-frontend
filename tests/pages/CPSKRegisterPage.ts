import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CPSK Registration Page
 * Page Object Model for CPSK (Career Professional Service Provider) registration
 */
export class CPSKRegisterPage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly specialtySelect: Locator;
  readonly experienceInput: Locator;
  readonly certificationInput: Locator;
  readonly bioTextarea: Locator;
  readonly documentsUpload: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.getByLabel(/name/i);
    this.emailInput = page.getByLabel(/email/i);
    this.phoneInput = page.getByLabel(/phone/i);
    this.specialtySelect = page.getByLabel(/specialty/i);
    this.experienceInput = page.getByLabel(/experience/i);
    this.certificationInput = page.getByLabel(/certification/i);
    this.bioTextarea = page.getByLabel(/bio|about/i);
    this.documentsUpload = page.locator('input[type="file"]');
    this.termsCheckbox = page.getByRole('checkbox', {
      name: /terms|agree/i,
    });
    this.submitButton = page.getByRole('button', { name: /submit|register/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.errorMessages = page.locator('[data-testid="error-message"]');
  }

  /**
   * Navigate to CPSK registration page
   */
  async navigate() {
    await this.goto('/cpsk-register');
  }

  /**
   * Fill CPSK registration form
   */
  async fillRegistrationForm(data: {
    name: string;
    email: string;
    phone: string;
    specialty: string;
    experience: string;
    certification?: string;
    bio: string;
    documentsPath?: string[];
  }) {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.specialtySelect.selectOption(data.specialty);
    await this.experienceInput.fill(data.experience);

    if (data.certification) {
      await this.certificationInput.fill(data.certification);
    }

    await this.bioTextarea.fill(data.bio);

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
