import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Company Profile View
 * Based on: src/features/company-profile/components/CompanyProfile.tsx
 * Route: /company/[id]
 */
export class CompanyProfilePage extends BasePage {
  // Header elements
  readonly companyName: Locator;
  readonly companyLogo: Locator;
  readonly companyCover: Locator;
  readonly editProfileButton: Locator;

  // Company information
  readonly aboutSection: Locator;
  readonly overviewText: Locator;
  readonly industryText: Locator;
  readonly sizeText: Locator;
  readonly locationText: Locator;
  readonly emailText: Locator;
  readonly phoneText: Locator;

  // Job openings section
  readonly jobOpeningsSection: Locator;
  readonly jobOpeningsTitle: Locator;
  readonly jobCards: Locator;
  readonly createJobButton: Locator;
  readonly viewApplicationsButton: Locator;
  readonly editJobButton: Locator;
  readonly deleteJobButton: Locator;

  // Edit profile modal
  readonly editProfileModal: Locator;
  readonly editCompanyNameInput: Locator;
  readonly editEmailInput: Locator;
  readonly editPhoneInput: Locator;
  readonly editOverviewInput: Locator;
  readonly editIndustrySelect: Locator;
  readonly editSizeSelect: Locator;
  readonly uploadLogoButton: Locator;
  readonly uploadCoverButton: Locator;
  readonly saveChangesButton: Locator;
  readonly cancelEditButton: Locator;

  // Loading and error states
  readonly loadingSpinner: Locator;
  readonly errorMessage: Locator;
  readonly notFoundMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Header elements - based on CompanyHeader.tsx
    this.companyName = page.getByRole('heading', { level: 1 }); // h1 with company name
    this.companyLogo = page.locator('div.overflow-hidden.rounded-xl img, svg.lucide-building');
    this.companyCover = page.locator('div.h-85.bg-gray-800');
    this.editProfileButton = page.getByRole('button', { name: /^edit profile$/i });

    // Company information - from CompanyHeader.tsx
    this.aboutSection = page.getByRole('heading', { name: /^about us$/i });
    this.overviewText = page.locator('p.text-lighter-gray-text.leading-relaxed');
    this.industryText = page.locator('p.text-lighter-gray-text.mb-4'); // Industry | Size format
    this.sizeText = page.locator('p.text-lighter-gray-text.mb-4'); // Same line as industry
    this.locationText = page.locator('text=Not provided, text=Location'); // If available
    this.emailText = page
      .locator('a[href^="mailto:"], span')
      .filter({ has: page.locator('svg.lucide-mail') });
    this.phoneText = page
      .locator('a[href^="tel:"], span')
      .filter({ has: page.locator('svg.lucide-phone') });

    // Job openings section - from JobOpenings.tsx
    this.jobOpeningsSection = page.getByRole('heading', { name: /job openings/i });
    this.jobOpeningsTitle = page.getByRole('heading', { name: /job openings/i });
    this.jobCards = page.locator('div').filter({ has: page.getByRole('heading', { level: 3 }) }); // Job cards
    this.createJobButton = page.getByRole('button', { name: /create job|post job/i });
    this.viewApplicationsButton = page.getByRole('button', { name: /view applications/i });
    this.editJobButton = page.getByRole('button', { name: /edit job/i });
    this.deleteJobButton = page.getByRole('button', { name: /delete job/i });

    // Edit profile modal - from EditProfileModal.tsx
    this.editProfileModal = page.getByRole('heading', { name: /edit profile/i });
    this.editCompanyNameInput = page.getByLabel(/company name/i);
    this.editEmailInput = page.getByLabel(/email/i);
    this.editPhoneInput = page.getByLabel(/phone/i);
    this.editOverviewInput = page.getByLabel(/overview/i);
    this.editIndustrySelect = page.getByLabel(/industry/i);
    this.editSizeSelect = page.getByLabel(/company size/i);
    this.uploadLogoButton = page.getByRole('button', { name: /upload logo/i });
    this.uploadCoverButton = page.getByRole('button', { name: /upload cover|upload banner/i });
    this.saveChangesButton = page.getByRole('button', { name: /save|update/i });
    this.cancelEditButton = page.getByRole('button', { name: /cancel/i });

    // Loading and error states
    this.loadingSpinner = page.getByText(/loading company profile/i);
    this.errorMessage = page.locator('p.text-red-reject');
    this.notFoundMessage = page.getByText(/company not found/i);
  }

  /**
   * Navigate to company profile page
   */
  async navigate(companyId: string, viewType: 'owner' | 'visitor' = 'visitor'): Promise<void> {
    const params = viewType === 'owner' ? '?view=company' : '';
    await this.page.goto(`/company/${companyId}${params}`);
    await this.waitForPageLoad();
  }

  /**
   * Open edit profile modal (owner only)
   */
  async openEditProfile(): Promise<void> {
    await this.editProfileButton.click();
    await this.editProfileModal.waitFor({ state: 'visible' });
  }

  /**
   * Update company profile information
   */
  async updateProfile(data: {
    companyName?: string;
    email?: string;
    phone?: string;
    overview?: string;
    industry?: string;
    size?: string;
  }): Promise<void> {
    if (data.companyName) await this.editCompanyNameInput.fill(data.companyName);
    if (data.email) await this.editEmailInput.fill(data.email);
    if (data.phone) await this.editPhoneInput.fill(data.phone);
    if (data.overview) await this.editOverviewInput.fill(data.overview);
    if (data.industry) await this.editIndustrySelect.selectOption(data.industry);
    if (data.size) await this.editSizeSelect.selectOption(data.size);
  }

  /**
   * Upload company logo
   */
  async uploadLogo(filePath: string): Promise<void> {
    const fileInput = this.uploadLogoButton.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Upload company cover image
   */
  async uploadCover(filePath: string): Promise<void> {
    const fileInput = this.uploadCoverButton.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Save profile changes
   */
  async saveProfileChanges(): Promise<void> {
    await this.saveChangesButton.click();
    await this.editProfileModal.waitFor({ state: 'hidden' });
  }

  /**
   * Cancel profile editing
   */
  async cancelProfileEdit(): Promise<void> {
    await this.cancelEditButton.click();
  }

  /**
   * Get list of job openings
   */
  async getJobOpenings(): Promise<number> {
    return await this.jobCards.count();
  }

  /**
   * Click on a job card by index
   */
  async clickJobCard(index: number): Promise<void> {
    await this.jobCards.nth(index).click();
  }

  /**
   * View applications for a specific job (owner only)
   */
  async viewApplications(jobIndex: number): Promise<void> {
    await this.jobCards.nth(jobIndex).locator(this.viewApplicationsButton).click();
  }

  /**
   * Edit a specific job (owner only)
   */
  async editJob(jobIndex: number): Promise<void> {
    await this.jobCards.nth(jobIndex).locator(this.editJobButton).click();
  }

  /**
   * Delete a specific job (owner only)
   */
  async deleteJob(jobIndex: number): Promise<void> {
    await this.jobCards.nth(jobIndex).locator(this.deleteJobButton).click();
  }

  /**
   * Create a new job posting (owner only)
   */
  async createJob(): Promise<void> {
    await this.createJobButton.click();
  }

  /**
   * Get company information
   */
  async getCompanyInfo(): Promise<{
    name: string;
    industry: string;
    size: string;
    location: string;
  }> {
    return {
      name: (await this.companyName.textContent()) || '',
      industry: (await this.industryText.textContent()) || '',
      size: (await this.sizeText.textContent()) || '',
      location: (await this.locationText.textContent()) || '',
    };
  }

  /**
   * Check if viewing as owner (edit buttons visible)
   */
  async isOwnerView(): Promise<boolean> {
    return await this.editProfileButton.isVisible();
  }
}
