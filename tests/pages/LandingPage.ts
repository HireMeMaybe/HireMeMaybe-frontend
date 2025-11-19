import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Landing Page (Home Page)
 * Page Object Model for the main landing page
 */
export class LandingPage extends BasePage {
  readonly navBar: Locator;
  readonly footer: Locator;
  readonly joinButton: Locator;
  readonly companyCard: Locator;
  readonly cpskCard: Locator;
  readonly visitorCard: Locator;

  constructor(page: Page) {
    super(page);
    this.navBar = page.locator('nav');
    this.footer = page.locator('footer');
    this.joinButton = page.getByRole('button', { name: /join/i });
    this.companyCard = page.getByRole('button', { name: /^company\b/i });
    this.cpskCard = page.getByRole('button', { name: /^cpsk\b/i });
    this.visitorCard = page.getByRole('button', { name: /^visitor\b/i });
  }

  /**
   * Navigate to landing page
   */
  async navigate() {
    await this.goto('/');
  }

  /**
   * Click on join button (scrolls to login section)
   */
  async clickJoin() {
    await this.joinButton.click();
  }

  /**
   * Click on Company role card
   */
  async clickCompanyCard() {
    await this.companyCard.click();
  }

  /**
   * Click on CPSK role card
   */
  async clickCPSKCard() {
    await this.cpskCard.click();
  }

  /**
   * Click on Visitor role card
   */
  async clickVisitorCard() {
    await this.visitorCard.click();
  }
}
