import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for Job Application Form
 * Based on: src/features/applications/components/ApplicationForm.tsx
 * Route: /application/[jobId]
 */
export class ApplicationPage extends BasePage {
  // Page elements
  readonly pageTitle: Locator;
  readonly jobTitle: Locator;
  readonly companyName: Locator;

  // Form fields
  readonly nameInput: Locator;
  readonly surnameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly majorInput: Locator;
  readonly educationLevelSelect: Locator;
  readonly resumeUpload: Locator;
  readonly softSkillInput: Locator;

  // Soft skills
  readonly softSkillTags: Locator;
  readonly removeSkillButtons: Locator;

  // Application form questions (if included)
  readonly defaultQuestions: Locator;
  readonly questionAnswers: Locator;

  // Buttons
  readonly previewResumeButton: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // Modals
  readonly confirmModal: Locator;
  readonly successModal: Locator;
  readonly resumePreviewModal: Locator;
  readonly loadingModal: Locator;

  // Messages
  readonly errorMessage: Locator;
  readonly existingResumeNotice: Locator;

  constructor(page: Page) {
    super(page);

    // Page elements
    this.pageTitle = page.getByRole('heading', { name: /^application form$/i });
    this.jobTitle = page.locator('text=Job not found'); // fallback if job doesn't exist
    this.companyName = page.locator('text=Back to Search');

    // Form fields - match actual labels from component
    this.nameInput = page.getByLabel(/^name\*$/i);
    this.surnameInput = page.getByLabel(/^surname\*$/i);
    this.emailInput = page.getByLabel(/^email\*$/i);
    this.phoneInput = page.getByLabel(/^phone\*$/i);
    this.majorInput = page.getByLabel(/^major\*$/i); // This is actually a RadioGroup
    this.educationLevelSelect = page.getByLabel(/^education level\*$/i); // Also RadioGroup
    this.resumeUpload = page.getByLabel(/^resume\*$/i);
    this.softSkillInput = page.locator('#soft-skill-input'); // Has explicit ID

    // Soft skills - match actual structure
    this.softSkillTags = page.locator('span.inline-flex.items-center.rounded-full');
    this.removeSkillButtons = page.locator('button[aria-label^="Remove"]');

    // Application form questions
    this.defaultQuestions = page.getByRole('heading', { name: /^questions$/i });
    this.questionAnswers = page.locator('textarea, select, input[type="checkbox"]');

    // Buttons - match actual text
    this.previewResumeButton = page.getByRole('button', { name: /^preview$/i });
    this.submitButton = page.getByRole('button', { name: /^submit$/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });

    // Modals - look for actual modal content
    this.confirmModal = page.getByText(/submit application\?/i);
    this.successModal = page.getByText(/application submitted successfully/i);
    this.resumePreviewModal = page.locator('[role="dialog"]');
    this.loadingModal = page.getByText(/loading your profile/i);

    // Messages
    this.errorMessage = page.locator('div.text-red-400, p.text-red-reject');
    this.existingResumeNotice = page.getByText(/existing resume/i);
  }

  /**
   * Navigate to application page for specific job
   */
  async navigate(jobId: string): Promise<void> {
    await this.page.goto(`/application/${jobId}`);
    await this.waitForPageLoad();
  }

  /**
   * Fill in application form
   */
  async fillApplicationForm(data: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
    major?: string;
    educationLevel?: string;
    softSkills?: string[];
  }): Promise<void> {
    if (data.name) await this.nameInput.fill(data.name);
    if (data.surname) await this.surnameInput.fill(data.surname);
    if (data.email) await this.emailInput.fill(data.email);
    if (data.phone) await this.phoneInput.fill(data.phone);
    if (data.major) await this.majorInput.fill(data.major);
    if (data.educationLevel) await this.educationLevelSelect.selectOption(data.educationLevel);

    // Add soft skills
    if (data.softSkills && data.softSkills.length > 0) {
      for (const skill of data.softSkills) {
        await this.softSkillInput.fill(skill);
        await this.softSkillInput.press('Enter');
      }
    }
  }

  /**
   * Upload resume file
   */
  async uploadResume(filePath: string): Promise<void> {
    await this.resumeUpload.setInputFiles(filePath);
  }

  /**
   * Remove a soft skill by index
   */
  async removeSoftSkill(index: number): Promise<void> {
    await this.removeSkillButtons.nth(index).click();
  }

  /**
   * Preview uploaded resume
   */
  async previewResume(): Promise<void> {
    await this.previewResumeButton.click();
  }

  /**
   * Submit the application
   */
  async submitApplication(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Confirm submission in modal
   */
  async confirmSubmission(): Promise<void> {
    await this.confirmModal.getByRole('button', { name: /confirm/i }).click();
  }

  /**
   * Answer a default question by index
   */
  async answerQuestion(questionIndex: number, answer: string): Promise<void> {
    await this.questionAnswers.nth(questionIndex).fill(answer);
  }

  /**
   * Get list of soft skills displayed
   */
  async getSoftSkills(): Promise<string[]> {
    return await this.softSkillTags.allTextContents();
  }

  /**
   * Check if form is pre-filled with profile data
   */
  async isFormPreFilled(): Promise<boolean> {
    const nameValue = await this.nameInput.inputValue();
    return nameValue.length > 0;
  }

  /**
   * Close success modal and navigate away
   */
  async closeSuccessModal(): Promise<void> {
    await this.successModal.getByRole('button', { name: /ok|close/i }).click();
  }
}
