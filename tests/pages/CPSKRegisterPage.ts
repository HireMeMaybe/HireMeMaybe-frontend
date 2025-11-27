import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CPSK Registration Page
 * Page Object Model for CPSK (Career Professional Service Provider) registration
 */
export class CPSKRegisterPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly programRadioGroup: Locator;
  readonly programCPE: Locator;
  readonly programSKE: Locator;
  readonly yearRadioGroup: Locator;
  readonly yearOptions: Locator;
  readonly resumeUpload: Locator;
  readonly checkPrivacy: Locator;
  readonly submitButton: Locator;
  readonly confirmDialog: Locator;
  readonly confirmSubmitButton: Locator;
  readonly successDialog: Locator;
  readonly successCloseButton: Locator;
  readonly loadingDialog: Locator;
  readonly softSkillInput: Locator;
  readonly softSkillChips: Locator;
  readonly softSkillRemoveButtons: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('input[name="first_name"]');
    this.lastNameInput = page.locator('input[name="last_name"]');
    this.emailInput = page.locator('input[name="email"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.programRadioGroup = page.locator('input[type="radio"][name="program"]');
    this.programCPE = page.locator('#program-cpe');
    this.programSKE = page.locator('#program-ske');
    this.yearRadioGroup = page.locator('input[type="radio"][name="year"]');
    this.yearOptions = this.yearRadioGroup; // alias
    this.resumeUpload = page.locator('input[type="file"]');
    this.submitButton = page.locator('button[type="button"]:has-text("Submit")');
    this.checkPrivacy = page.locator('#privacy-checkbox');
    this.confirmDialog = page.locator('[role="dialog"]:has-text("Submit?")');
    this.confirmSubmitButton = this.confirmDialog.locator('button:has-text("Submit")');
    this.successDialog = page.locator('[role="dialog"]:has-text("Submitted")');
    this.successCloseButton = this.successDialog.locator('button:has-text("Close")');
    this.loadingDialog = page.locator('[role="dialog"]:has-text("Submitting Profile")');
    this.softSkillInput = page.locator('#soft-skill-input');
    this.softSkillChips = page.locator('span.inline-flex.items-center.rounded-full');
    this.softSkillRemoveButtons = this.softSkillChips.locator('button[aria-label^="Remove"]');
    this.errorMessages = page.locator('.text-red-reject, .text-red-600');
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
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    program: 'CPE' | 'SKE';
    year?: string;
    resumePath?: string; // single file
    softSkills?: string[];
  }) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.phoneInput.fill(data.phone);

    // Click program radio button
    if (data.program === 'CPE') {
      await this.programCPE.click();
    } else {
      await this.programSKE.click();
    }

    // Click year radio button using getByLabel
    if (data.year) {
      await this.page.getByLabel(data.year).click();
    }

    if (data.resumePath) {
      await this.resumeUpload.setInputFiles(data.resumePath);
    }

    if (data.softSkills?.length) {
      for (const skill of data.softSkills) {
        await this.softSkillInput.fill(skill);
        // Press Enter to add
        await this.softSkillInput.press('Enter');
      }
    }

    await this.checkPrivacy.click();
  }

  /**
   * Submit registration
   */
  async submit() {
    await this.submitButton.click();
    // Wait for confirm dialog, then submit
    await this.confirmDialog.waitFor({ state: 'visible' });
    await this.confirmSubmitButton.click();
    // Either loading then success or direct success
    await Promise.race([
      this.successDialog.waitFor({ state: 'visible' }),
      this.page.waitForURL(/\/profile$/),
    ]);
  }

  /**
   * Cancel registration
   */
  async cancel() {
    // Open confirm modal then cancel by clicking its Cancel button
    await this.submitButton.click();
    await this.confirmDialog.waitFor({ state: 'visible' });
    await this.confirmDialog.locator('button:has-text("Cancel")').click();
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
