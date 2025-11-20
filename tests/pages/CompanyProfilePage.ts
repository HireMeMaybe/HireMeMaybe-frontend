import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Company Profile View
 * Based on: src/features/company-profile/components/CompanyProfile.tsx
 * Route: /company/[id]
 *
 * Supports multiple viewpoints:
 * - owner: Company owner (can edit profile, manage jobs)
 * - cpsk: Job seeker (can apply to jobs)
 * - company: Other company viewing (read-only)
 * - visitor: Visitor viewing (read-only)
 */
export class CompanyProfilePage extends BasePage {
  // Header elements
  readonly companyName: Locator;
  readonly companyLogo: Locator;
  readonly companyCover: Locator;

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
  readonly noJobsMessage: Locator;

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
    this.jobOpeningsSection = page.getByRole('heading', { name: /^current job openings$/i }); // h2
    this.jobOpeningsTitle = page.getByRole('heading', { name: /^current job openings$/i });
    this.jobCards = page.locator(
      'div.border-gray-cancel.bg-very-dark-gray.flex.items-start.justify-between.rounded-xl.border.p-4'
    );
    this.noJobsMessage = page.getByText(/no job openings available/i);

    // Loading and error states
    this.loadingSpinner = page.getByText(/loading company profile/i);
    this.errorMessage = page.locator('p.text-red-reject');
    this.notFoundMessage = page.getByText(/company not found/i);
  }

  // ==================== Role-specific Buttons ====================

  /**
   * Get Edit Profile button (Owner only)
   * Visible only in owner viewpoint
   */
  getEditProfileButton(): Locator {
    return this.page
      .getByRole('button', { name: /edit profile/i })
      .filter({ has: this.page.locator('svg.lucide-square-pen') });
  }

  /**
   * Get Post New Job button (Owner only)
   * Visible only in owner viewpoint
   */
  getPostNewJobButton(): Locator {
    return this.page.getByRole('button', { name: /post new job/i });
  }

  /**
   * Get Apply button for a specific job (CPSK only)
   * Visible only in cpsk viewpoint
   */
  getApplyButton(jobCard?: Locator): Locator {
    const baseLocator = jobCard || this.page;
    return baseLocator.getByRole('button', { name: /^apply$/i });
  }

  /**
   * Get Edit Job button for a specific job (Owner only)
   * Visible only in owner viewpoint
   */
  getEditJobButton(jobCard?: Locator): Locator {
    const baseLocator = jobCard || this.page;
    return baseLocator.getByRole('button', { name: /edit/i }).first();
  }

  /**
   * Get Delete Job button for a specific job (Owner only)
   * Visible only in owner viewpoint
   */
  getDeleteJobButton(jobCard?: Locator): Locator {
    const baseLocator = jobCard || this.page;
    return baseLocator.getByRole('button', { name: /delete/i }).first();
  }

  /**
   * Get View Applications button for a specific job (Owner only)
   * Visible only in owner viewpoint
   */
  getViewApplicationsButton(jobCard?: Locator): Locator {
    const baseLocator = jobCard || this.page;
    return baseLocator.getByRole('button', { name: /view applications/i });
  }

  // ==================== Edit Profile Modal ====================

  /**
   * Get Edit Profile Modal elements
   * Only accessible after clicking Edit Profile button in owner view
   */
  getEditProfileModal() {
    return {
      modal: this.page.getByRole('heading', { name: /edit profile/i }),
      companyNameInput: this.page.getByLabel(/company name/i),
      emailInput: this.page.getByLabel(/email/i),
      phoneInput: this.page.getByLabel(/phone/i),
      overviewInput: this.page.getByLabel(/overview/i),
      industrySelect: this.page.getByLabel(/industry/i),
      sizeSelect: this.page.getByLabel(/company size/i),
      uploadLogoButton: this.page.getByRole('button', { name: /upload logo/i }),
      uploadCoverButton: this.page.getByRole('button', { name: /upload cover|upload banner/i }),
      saveButton: this.page.getByRole('button', { name: /save|update/i }),
      cancelButton: this.page.getByRole('button', { name: /cancel/i }),
    };
  }

  // ==================== Job Card Components ====================

  /**
   * Get a specific job card by index
   */
  getJobCard(index: number): Locator {
    return this.jobCards.nth(index);
  }

  /**
   * Get job card elements for a specific job
   */
  getJobCardElements(jobCard: Locator) {
    return {
      title: jobCard.locator('h3').first(),
      experienceLevel: jobCard
        .locator('span')
        .filter({ hasText: /entry|junior|mid|senior|lead/i })
        .first(),
      salary: jobCard.locator('span.text-primary-green').first(),
      location: jobCard.locator('p.text-lighter-gray-text').first(),
      tags: jobCard.locator('span.rounded-full.bg-zinc-800'),
      applicationCount: jobCard
        .locator('div')
        .filter({ has: this.page.locator('svg.lucide-users') }),
      postedDate: jobCard.locator('div.text-xs.text-zinc-400').filter({ hasText: /posted/i }),
      expiryDate: jobCard.locator('div.text-xs.text-orange-400').filter({ hasText: /expires/i }),
      externalLink: jobCard.locator('a[href^="/job-post/"]').locator('svg.lucide-external-link'),
    };
  }

  // ==================== Navigation ====================

  /**
   * Navigate to company profile page
   * @param companyId - The company ID to navigate to
   * @param viewType - The view type (owner, cpsk, company, visitor)
   */
  async navigate(companyId: string, viewType?: 'owner' | 'cpsk' | 'company'): Promise<void> {
    const params = viewType ? `?view=${viewType}` : '';
    await this.page.goto(`/company/${companyId}${params}`);
    await this.waitForPageLoad();
  }

  // ==================== View State Checks ====================

  /**
   * Check if viewing as owner (edit buttons visible)
   */
  async isOwnerView(): Promise<boolean> {
    return await this.getEditProfileButton().isVisible();
  }

  /**
   * Check if viewing as CPSK (apply buttons visible)
   */
  async isCPSKView(): Promise<boolean> {
    const jobCount = await this.jobCards.count();
    if (jobCount === 0) return false;
    return await this.getApplyButton(this.getJobCard(0)).isVisible();
  }

  /**
   * Check if viewing as read-only (no action buttons)
   */
  async isReadOnlyView(): Promise<boolean> {
    const hasEditProfile = await this.getEditProfileButton().isVisible();
    const jobCount = await this.jobCards.count();

    if (hasEditProfile) return false;
    if (jobCount === 0) return true;

    const hasApply = await this.getApplyButton(this.getJobCard(0)).isVisible();
    return !hasApply;
  }

  // ==================== Owner Actions ====================

  /**
   * Open edit profile modal (owner only)
   */
  async openEditProfile(): Promise<void> {
    const modal = this.getEditProfileModal();
    await this.getEditProfileButton().click();
    await modal.modal.waitFor({ state: 'visible' });
  }

  /**
   * Update company profile information (owner only)
   */
  async updateProfile(data: {
    companyName?: string;
    email?: string;
    phone?: string;
    overview?: string;
    industry?: string;
    size?: string;
  }): Promise<void> {
    const modal = this.getEditProfileModal();
    if (data.companyName) await modal.companyNameInput.fill(data.companyName);
    if (data.email) await modal.emailInput.fill(data.email);
    if (data.phone) await modal.phoneInput.fill(data.phone);
    if (data.overview) await modal.overviewInput.fill(data.overview);
    if (data.industry) await modal.industrySelect.selectOption(data.industry);
    if (data.size) await modal.sizeSelect.selectOption(data.size);
  }

  /**
   * Upload company logo (owner only)
   */
  async uploadLogo(filePath: string): Promise<void> {
    const modal = this.getEditProfileModal();
    const fileInput = modal.uploadLogoButton.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Upload company cover image (owner only)
   */
  async uploadCover(filePath: string): Promise<void> {
    const modal = this.getEditProfileModal();
    const fileInput = modal.uploadCoverButton.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Save profile changes (owner only)
   */
  async saveProfileChanges(): Promise<void> {
    const modal = this.getEditProfileModal();
    await modal.saveButton.click();
    await modal.modal.waitFor({ state: 'hidden' });
  }

  /**
   * Cancel profile editing (owner only)
   */
  async cancelProfileEdit(): Promise<void> {
    const modal = this.getEditProfileModal();
    await modal.cancelButton.click();
  }

  /**
   * Create a new job posting (owner only)
   */
  async createJob(): Promise<void> {
    await this.getPostNewJobButton().click();
  }

  /**
   * Edit a specific job (owner only)
   * @param jobIndex - The index of the job to edit (0-based)
   */
  async editJob(jobIndex: number): Promise<void> {
    const jobCard = this.getJobCard(jobIndex);
    await this.getEditJobButton(jobCard).click();
  }

  /**
   * Delete a specific job (owner only)
   * @param jobIndex - The index of the job to delete (0-based)
   */
  async deleteJob(jobIndex: number): Promise<void> {
    const jobCard = this.getJobCard(jobIndex);
    await this.getDeleteJobButton(jobCard).click();
  }

  /**
   * View applications for a specific job (owner only)
   * @param jobIndex - The index of the job to view applications (0-based)
   */
  async viewApplications(jobIndex: number): Promise<void> {
    const jobCard = this.getJobCard(jobIndex);
    await this.getViewApplicationsButton(jobCard).click();
  }

  // ==================== CPSK Actions ====================

  /**
   * Apply to a specific job (CPSK only)
   * @param jobIndex - The index of the job to apply to (0-based)
   */
  async applyToJob(jobIndex: number): Promise<void> {
    const jobCard = this.getJobCard(jobIndex);
    await this.getApplyButton(jobCard).click();
  }

  // ==================== Common Actions ====================

  /**
   * Get the count of job openings
   */
  async getJobOpeningsCount(): Promise<number> {
    return await this.jobCards.count();
  }

  /**
   * Click on a job card by index to view details
   * @param jobIndex - The index of the job card (0-based)
   */
  async clickJobCard(jobIndex: number): Promise<void> {
    await this.getJobCard(jobIndex).click();
  }

  /**
   * Get company information displayed on the page
   */
  async getCompanyInfo(): Promise<{
    name: string;
    industry: string;
    size: string;
    email: string;
    phone: string;
  }> {
    return {
      name: (await this.companyName.textContent()) || '',
      industry: (await this.industryText.textContent()) || '',
      size: (await this.sizeText.textContent()) || '',
      email: (await this.emailText.textContent()) || '',
      phone: (await this.phoneText.textContent()) || '',
    };
  }

  /**
   * Get job information for a specific job card
   * @param jobIndex - The index of the job card (0-based)
   */
  async getJobInfo(jobIndex: number): Promise<{
    title: string;
    experienceLevel: string;
    salary: string;
    location: string;
    tags: string[];
  }> {
    const jobCard = this.getJobCard(jobIndex);
    const elements = this.getJobCardElements(jobCard);

    const tagsCount = await elements.tags.count();
    const tags: string[] = [];
    for (let i = 0; i < tagsCount; i++) {
      const tagText = await elements.tags.nth(i).textContent();
      if (tagText) tags.push(tagText);
    }

    return {
      title: (await elements.title.textContent()) || '',
      experienceLevel: (await elements.experienceLevel.textContent()) || '',
      salary: (await elements.salary.textContent()) || '',
      location: (await elements.location.textContent()) || '',
      tags,
    };
  }
}
