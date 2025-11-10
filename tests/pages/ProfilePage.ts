import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Profile Page
 * Page Object Model for user profile page
 */
export class ProfilePage extends BasePage {
  readonly profileImage: Locator;
  readonly userName: Locator;
  readonly userEmail: Locator;
  readonly editButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // Edit form fields
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly bioTextarea: Locator;
  readonly resumeUpload: Locator;

  constructor(page: Page) {
    super(page);
    this.profileImage = page.locator('[data-testid="profile-image"]');
    this.userName = page.locator('[data-testid="user-name"]');
    this.userEmail = page.locator('[data-testid="user-email"]');
    this.editButton = page.getByRole('button', { name: /edit/i });
    this.saveButton = page.getByRole('button', { name: /save/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });

    // Edit fields
    this.nameInput = page.getByLabel(/name/i);
    this.emailInput = page.getByLabel(/email/i);
    this.phoneInput = page.getByLabel(/phone/i);
    this.bioTextarea = page.getByLabel(/bio|about/i);
    this.resumeUpload = page.locator('input[type="file"]');
  }

  /**
   * Navigate to profile page
   */
  async navigate() {
    await this.goto('/profile');
  }

  /**
   * Navigate to edit profile page
   */
  async navigateToEdit() {
    await this.goto('/profile/edit');
  }

  /**
   * Get user name
   */
  async getUserName() {
    return await this.userName.textContent();
  }

  /**
   * Get user email
   */
  async getUserEmail() {
    return await this.userEmail.textContent();
  }

  /**
   * Click edit button
   */
  async clickEdit() {
    await this.editButton.click();
  }

  /**
   * Update profile information
   */
  async updateProfile(data: { name?: string; email?: string; phone?: string; bio?: string }) {
    if (data.name) {
      await this.nameInput.fill(data.name);
    }
    if (data.email) {
      await this.emailInput.fill(data.email);
    }
    if (data.phone) {
      await this.phoneInput.fill(data.phone);
    }
    if (data.bio) {
      await this.bioTextarea.fill(data.bio);
    }
  }

  /**
   * Upload resume
   */
  async uploadResume(filePath: string) {
    await this.resumeUpload.setInputFiles(filePath);
  }

  /**
   * Save profile changes
   */
  async save() {
    await this.saveButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Cancel profile editing
   */
  async cancel() {
    await this.cancelButton.click();
  }
}
