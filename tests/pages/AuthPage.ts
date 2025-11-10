import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Authentication Page
 * Page Object Model for login/authentication pages
 */
export class AuthPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.passwordInput = page.getByRole('textbox', { name: /password/i });
    this.loginButton = page.getByRole('button', { name: /login|sign in/i });
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.forgotPasswordLink = page.getByRole('link', {
      name: /forgot password/i,
    });
    this.signUpLink = page.getByRole('link', { name: /sign up|register/i });
  }

  /**
   * Navigate to login page
   */
  async navigate() {
    await this.goto('/auth/login');
  }

  /**
   * Perform login action
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
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

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Click sign up link
   */
  async clickSignUp() {
    await this.signUpLink.click();
  }
}
