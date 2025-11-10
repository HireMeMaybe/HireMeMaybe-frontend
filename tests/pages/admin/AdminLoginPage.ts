import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Admin Login Page
 * Page Object Model for admin authentication
 */
export class AdminLoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel(/username|email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.loginButton = page.getByRole('button', { name: /login|sign in/i });
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.forgotPasswordLink = page.getByRole('link', {
      name: /forgot password/i,
    });
  }

  /**
   * Navigate to admin login page
   */
  async navigate() {
    await this.goto('/admin/login');
  }

  /**
   * Perform admin login
   */
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Check if error message is visible
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
