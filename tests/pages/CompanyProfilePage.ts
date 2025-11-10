import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Company Profile Page
 * Page Object Model for viewing company profiles
 */
export class CompanyProfilePage extends BasePage {
  readonly companyName: Locator;
  readonly companyLogo: Locator;
  readonly companyDescription: Locator;
  readonly companyLocation: Locator;
  readonly companyWebsite: Locator;
  readonly companyIndustry: Locator;
  readonly companySize: Locator;
  readonly jobListings: Locator;
  readonly followButton: Locator;
  readonly contactButton: Locator;

  constructor(page: Page) {
    super(page);
    this.companyName = page.locator('[data-testid="company-name"]');
    this.companyLogo = page.locator('[data-testid="company-logo"]');
    this.companyDescription = page.locator('[data-testid="company-description"]');
    this.companyLocation = page.locator('[data-testid="company-location"]');
    this.companyWebsite = page.locator('[data-testid="company-website"]');
    this.companyIndustry = page.locator('[data-testid="company-industry"]');
    this.companySize = page.locator('[data-testid="company-size"]');
    this.jobListings = page.locator('[data-testid="job-listing"]');
    this.followButton = page.getByRole('button', { name: /follow/i });
    this.contactButton = page.getByRole('button', { name: /contact/i });
  }

  /**
   * Navigate to company profile page
   */
  async navigate(companyId: string) {
    await this.goto(`/company/${companyId}`);
  }

  /**
   * Get company name
   */
  async getCompanyName() {
    return await this.companyName.textContent();
  }

  /**
   * Get company description
   */
  async getCompanyDescription() {
    return await this.companyDescription.textContent();
  }

  /**
   * Get number of job listings
   */
  async getJobListingsCount() {
    return await this.jobListings.count();
  }

  /**
   * Click on a specific job listing
   */
  async clickJobListing(index: number) {
    await this.jobListings.nth(index).click();
  }

  /**
   * Follow the company
   */
  async followCompany() {
    await this.followButton.click();
  }

  /**
   * Contact the company
   */
  async contactCompany() {
    await this.contactButton.click();
  }

  /**
   * Check if follow button is active
   */
  async isFollowing() {
    const text = await this.followButton.textContent();
    return text?.toLowerCase().includes('following');
  }
}
