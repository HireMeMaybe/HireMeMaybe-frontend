import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Admin Login Page
 * Page Object Model for admin authentication
 */
export class AdminLoginPage extends BasePage {
  // Default test credentials
  static readonly DEFAULT_CREDENTIALS = {
    username: process.env.ADMIN_TEST_USERNAME || 'admin',
    password: process.env.ADMIN_TEST_PASSWORD || 'trustmebro',
  };

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly showPasswordButton: Locator;
  readonly userIcon: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.getByRole('button', { name: /sign in/i });
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.showPasswordButton = page.locator('[data-testid="toggle-password-visibility"]');
    // User icon in navbar that opens dropdown
    this.userIcon = page
      .locator('button[aria-label*="user" i], button:has(svg):has-text("admin")')
      .first();
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
   * Quick login with default test credentials
   */
  async loginWithDefaults() {
    await this.navigate();
    await this.login(
      AdminLoginPage.DEFAULT_CREDENTIALS.username,
      AdminLoginPage.DEFAULT_CREDENTIALS.password
    );
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
   * Toggle password visibility
   */
  async togglePasswordVisibility() {
    await this.showPasswordButton.click();
  }

  /**
   * Check if user is authenticated (has token)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.page.evaluate(() => localStorage.getItem('adminToken'));
    return !!token;
  }

  /**
   * Get admin token
   */
  async getToken(): Promise<string | null> {
    return await this.page.evaluate(() => localStorage.getItem('adminToken'));
  }

  /**
   * Set admin token directly (for testing)
   */
  async setToken(token: string) {
    await this.page.evaluate((tokenValue) => {
      localStorage.setItem('adminToken', tokenValue);
    }, token);
  }

  /**
   * Clear all authentication
   */
  async clearAuth() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}
