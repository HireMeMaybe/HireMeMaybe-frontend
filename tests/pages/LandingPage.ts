import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Landing Page (Home Page)
 * Page Object Model for the main landing page
 */
export class LandingPage extends BasePage {
  readonly navBar: Locator;
  readonly footer: Locator;
  readonly searchButton: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    super(page);
    this.navBar = page.locator('nav');
    this.footer = page.locator('footer');
    this.searchButton = page.getByRole('button', { name: /search/i });
    this.loginButton = page.getByRole('button', { name: /login/i });
    this.registerButton = page.getByRole('button', { name: /register/i });
  }

  /**
   * Navigate to landing page
   */
  async navigate() {
    await this.goto('/');
  }

  /**
   * Click on search button
   */
  async clickSearch() {
    await this.searchButton.click();
  }

  /**
   * Click on login button
   */
  async clickLogin() {
    await this.loginButton.click();
  }

  /**
   * Click on register button
   */
  async clickRegister() {
    await this.registerButton.click();
  }
}
