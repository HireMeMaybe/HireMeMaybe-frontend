import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for User Profile View/Edit
 * Based on: src/features/profile/components/Profile.tsx
 * Route: /profile and /profile/edit
 */
export class ProfilePage extends BasePage {
  // Page elements
  readonly pageTitle: Locator;
  readonly editProfileButton: Locator;

  // Profile header
  readonly profileAvatar: Locator;
  readonly userName: Locator;
  readonly userProgram: Locator;
  readonly userYear: Locator;

  // Contact information
  readonly emailText: Locator;
  readonly phoneText: Locator;

  // Profile details
  readonly majorText: Locator;
  readonly educationLevelText: Locator;
  readonly softSkillsList: Locator;

  // Resume section
  readonly resumeSection: Locator;
  readonly previewResumeButton: Locator;
  readonly downloadResumeButton: Locator;

  // Edit mode elements
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly majorInput: Locator;
  readonly yearSelect: Locator;
  readonly programSelect: Locator;
  readonly softSkillInput: Locator;
  readonly softSkillTags: Locator;
  readonly removeSkillButtons: Locator;
  readonly resumeUpload: Locator;

  // Edit mode buttons
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // Modals
  readonly resumePreviewModal: Locator;

  // Messages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  // Loading state
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);

    // Page elements - based on Profile.tsx
    // Note: Profile page doesn't have a "Profile" heading, h1 is the user's full name
    this.pageTitle = page.getByRole('heading', { level: 1 }).first(); // h1: User's full name
    this.editProfileButton = page.getByRole('button', { name: /^edit profile$/i });

    // Profile header
    this.profileAvatar = page.locator('div.rounded-full').filter({ has: page.locator('img') });
    this.userName = page.locator('h1, h2').first();
    this.userProgram = page.locator(
      'text=/computer engineering|software and knowledge engineering/i'
    );
    this.userYear = page.locator('text=/year|not specified/i');

    // Contact information
    this.emailText = page
      .locator('a[href^="mailto:"], text')
      .filter({ has: page.locator('svg.lucide-mail') });
    this.phoneText = page
      .locator('a[href^="tel:"], text')
      .filter({ has: page.locator('svg.lucide-phone') });

    // Profile details
    this.majorText = page.locator('text=/cpe|ske|major/i');
    this.educationLevelText = page.locator('text=/education|year|bachelor/i');
    this.softSkillsList = page.locator('span.rounded-full');

    // Resume section
    this.resumeSection = page.locator('text=/resume/i');
    this.previewResumeButton = page.getByRole('button', { name: /Preview/i });
    this.downloadResumeButton = page.getByRole('button', { name: /download resume/i });

    // Edit mode elements - match label text from actual form
    this.firstNameInput = page.getByLabel(/first name/i);
    this.lastNameInput = page.getByLabel(/last name/i);
    this.emailInput = page.getByLabel(/email/i);
    this.phoneInput = page.getByLabel(/phone/i);
    this.majorInput = page.getByLabel(/major/i);
    this.yearSelect = page.getByLabel(/year/i);
    this.programSelect = page.getByLabel(/program/i);
    this.softSkillInput = page.locator('input[placeholder*="skill"]');
    this.softSkillTags = page.locator('span.rounded-full');
    this.removeSkillButtons = page.locator('button[aria-label^="Remove"]');
    this.resumeUpload = page.getByLabel(/resume/i);

    // Edit mode buttons
    this.saveButton = page.getByRole('button', { name: /^save$/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });

    // Modals
    this.resumePreviewModal = page.locator('[role="dialog"]');

    // Messages
    this.successMessage = page.getByText(/success|updated/i);
    this.errorMessage = page.locator('div.text-red-400, p.text-red-reject');

    // Loading state
    this.loadingSpinner = page.getByText(/loading/i);
  }

  /**
   * Navigate to profile page
   */
  async navigate(): Promise<void> {
    await this.page.goto('/profile');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to profile edit page
   */
  async navigateToEdit(): Promise<void> {
    await this.page.goto('/profile/edit');
    await this.waitForPageLoad();
  }

  /**
   * Click edit profile button
   */
  async clickEditProfile(): Promise<void> {
    await this.editProfileButton.click();
  }

  /**
   * Get user information
   */
  async getUserInfo(): Promise<{
    name: string;
    program: string;
    year: string;
    email: string;
    phone: string;
    major: string;
  }> {
    return {
      name: (await this.userName.textContent()) || '',
      program: (await this.userProgram.textContent()) || '',
      year: (await this.userYear.textContent()) || '',
      email: (await this.emailText.textContent()) || '',
      phone: (await this.phoneText.textContent()) || '',
      major: (await this.majorText.textContent()) || '',
    };
  }

  /**
   * Get soft skills list
   */
  async getSoftSkills(): Promise<string[]> {
    return await this.softSkillsList.allTextContents();
  }

  /**
   * Preview resume
   */
  async previewResume(): Promise<void> {
    await this.previewResumeButton.click();
  }

  /**
   * Download resume
   */
  async downloadResume(): Promise<void> {
    await this.downloadResumeButton.click();
  }

  /**
   * Update profile information (in edit mode)
   */
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    major?: string;
    year?: string;
    program?: string;
  }): Promise<void> {
    if (data.firstName) await this.firstNameInput.fill(data.firstName);
    if (data.lastName) await this.lastNameInput.fill(data.lastName);
    if (data.email) await this.emailInput.fill(data.email);
    if (data.phone) await this.phoneInput.fill(data.phone);
    if (data.major) await this.majorInput.fill(data.major);
    if (data.year) await this.yearSelect.selectOption(data.year);
    if (data.program) await this.programSelect.selectOption(data.program);
  }

  /**
   * Add a soft skill
   */
  async addSoftSkill(skill: string): Promise<void> {
    await this.softSkillInput.fill(skill);
    await this.softSkillInput.press('Enter');
  }

  /**
   * Remove a soft skill by index
   */
  async removeSoftSkill(index: number): Promise<void> {
    await this.removeSkillButtons.nth(index).click();
  }

  /**
   * Upload new resume
   */
  async uploadResume(filePath: string): Promise<void> {
    await this.resumeUpload.setInputFiles(filePath);
  }

  /**
   * Save profile changes
   */
  async saveChanges(): Promise<void> {
    await this.saveButton.click();
  }

  /**
   * Cancel profile editing
   */
  async cancelEdit(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Check if in edit mode
   */
  async isInEditMode(): Promise<boolean> {
    return await this.saveButton.isVisible();
  }

  /**
   * Check if profile has resume
   */
  async hasResume(): Promise<boolean> {
    return await this.resumeSection.isVisible();
  }

  /**
   * Close resume preview modal
   */
  async closeResumePreview(): Promise<void> {
    await this.resumePreviewModal.getByRole('button', { name: /close/i }).click();
  }
}
