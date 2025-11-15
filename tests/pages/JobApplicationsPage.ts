import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Job Applications Management
 * Based on: src/features/job-applications/components/JobApplications.tsx
 * Route: /company/[companyId]/job/[jobId]/applications (accessed from company profile)
 */
export class JobApplicationsPage extends BasePage {
  // Page elements
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly backButton: Locator;

  // Job information
  readonly jobTitle: Locator;
  readonly applicationCount: Locator;
  readonly viewJobButton: Locator;

  // Application cards
  readonly applicationCards: Locator;
  readonly applicantName: Locator;
  readonly applicantEmail: Locator;
  readonly applicationDate: Locator;
  readonly applicationStatus: Locator;

  // Action buttons on cards
  readonly viewApplicationButtons: Locator;
  readonly approveButtons: Locator;
  readonly rejectButtons: Locator;

  // Application detail view
  readonly applicationDetailModal: Locator;
  readonly resumePreviewButton: Locator;
  readonly applicantPhone: Locator;
  readonly applicantMajor: Locator;
  readonly applicantEducation: Locator;
  readonly softSkillsList: Locator;
  readonly questionAnswers: Locator;

  // Empty state
  readonly emptyStateMessage: Locator;

  // Loading state
  readonly loadingSpinner: Locator;

  // Error state
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Page elements - based on JobApplications.tsx
    this.pageTitle = page.getByRole('heading', { level: 1 }); // h1: "{jobPost.title} Applications"
    this.pageDescription = page.getByText(/applications received/i); // p: "X applications received"
    this.backButton = page.getByRole('button', { name: /back to company profile/i });

    // Job information
    this.jobTitle = page.getByRole('heading', { level: 1 });
    this.applicationCount = page.getByText(/applications received/i);
    this.viewJobButton = page.getByRole('button', { name: /view job post/i });

    // Application cards - ApplicationCard components
    this.applicationCards = page.locator('div').filter({ has: page.locator('h3') });
    this.applicantName = page.locator('h3');
    this.applicantEmail = page.locator('a[href^="mailto:"]');
    this.applicationDate = page.locator('text=/applied on/i');
    this.applicationStatus = page.locator('span').filter({ hasText: /pending|approved|rejected/i });

    // Action buttons on cards
    this.viewApplicationButtons = page.getByRole('button', { name: /^view$/i });
    this.approveButtons = page.getByRole('button', { name: /approve/i });
    this.rejectButtons = page.getByRole('button', { name: /reject/i });

    // Application detail view
    this.applicationDetailModal = page.locator('[role="dialog"]');
    this.resumePreviewButton = page.getByRole('button', { name: /preview resume|view resume/i });
    this.applicantPhone = page.locator('a[href^="tel:"]');
    this.applicantMajor = page.locator('text=/major|cpe|ske/i');
    this.applicantEducation = page.locator('text=/education|year/i');
    this.softSkillsList = page.locator('span.rounded-full');
    this.questionAnswers = page.locator('div').filter({ has: page.locator('h4') });

    // Empty state
    this.emptyStateMessage = page.getByText(/no applications/i);

    // Loading state
    this.loadingSpinner = page.getByText(/loading applications/i);

    // Error state
    this.errorMessage = page.getByText(/applications not found/i);
  }

  /**
   * Navigate to job applications page
   * Note: This is typically accessed from company profile, not directly
   */
  async navigate(companyId: string, jobId: string): Promise<void> {
    // The actual route may vary based on implementation
    await this.page.goto(`/company/${companyId}/job/${jobId}/applications`);
    await this.waitForPageLoad();
  }

  /**
   * Go back to company profile
   */
  async goBackToProfile(): Promise<void> {
    await this.backButton.click();
  }

  /**
   * View job post details
   */
  async viewJobPost(): Promise<void> {
    await this.viewJobButton.click();
  }

  /**
   * Get number of applications
   */
  async getApplicationCount(): Promise<number> {
    return await this.applicationCards.count();
  }

  /**
   * View application details by index
   */
  async viewApplication(index: number): Promise<void> {
    await this.applicationCards.nth(index).locator(this.viewApplicationButtons).first().click();
  }

  /**
   * Approve an application by index
   */
  async approveApplication(index: number): Promise<void> {
    await this.applicationCards.nth(index).locator(this.approveButtons).click();
  }

  /**
   * Reject an application by index
   */
  async rejectApplication(index: number): Promise<void> {
    await this.applicationCards.nth(index).locator(this.rejectButtons).click();
  }

  /**
   * Get applicant information by index
   */
  async getApplicantInfo(index: number): Promise<{
    name: string;
    email: string;
    date: string;
    status: string;
  }> {
    const card = this.applicationCards.nth(index);
    return {
      name: (await card.locator(this.applicantName).textContent()) || '',
      email: (await card.locator(this.applicantEmail).textContent()) || '',
      date: (await card.locator(this.applicationDate).textContent()) || '',
      status: (await card.locator(this.applicationStatus).textContent()) || '',
    };
  }

  /**
   * Preview applicant's resume
   */
  async previewResume(): Promise<void> {
    await this.resumePreviewButton.click();
  }

  /**
   * Get applicant's soft skills
   */
  async getSoftSkills(): Promise<string[]> {
    return await this.softSkillsList.allTextContents();
  }

  /**
   * Get question answers
   */
  async getQuestionAnswers(): Promise<string[]> {
    return await this.questionAnswers.allTextContents();
  }

  /**
   * Filter applications by status
   */
  async filterByStatus(status: 'Pending' | 'Approved' | 'Rejected'): Promise<void> {
    await this.page.getByRole('button', { name: new RegExp(status, 'i') }).click();
  }

  /**
   * Check if there are no applications
   */
  async hasNoApplications(): Promise<boolean> {
    return await this.emptyStateMessage.isVisible();
  }

  /**
   * Get application status by index
   */
  async getApplicationStatus(index: number): Promise<string> {
    return (
      (await this.applicationCards.nth(index).locator(this.applicationStatus).textContent()) || ''
    );
  }

  /**
   * Close application detail modal
   */
  async closeApplicationDetail(): Promise<void> {
    await this.applicationDetailModal.getByRole('button', { name: /close/i }).click();
  }
}
