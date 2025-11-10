import { test, expect } from '@playwright/test';
import { CompanyRegisterPage, LandingPage, CPSKRegisterPage } from './pages';

test.describe('Selector smoke validation', () => {
  test('Landing page basic elements', async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.navigate();
    await expect(landing.navBar).toBeVisible({ timeout: 5000 });
    await expect(landing.footer).toBeVisible();
    await expect(landing.joinButton).toBeVisible();
    await expect(landing.companyCard).toBeVisible();
    await expect(landing.cpskCard).toBeVisible();
    await expect(landing.visitorCard).toBeVisible();
  });

  test('Company register form fields', async ({ page }) => {
    const companyRegister = new CompanyRegisterPage(page);
    await companyRegister.navigate();
    await expect(companyRegister.companyNameInput).toBeVisible();
    await expect(companyRegister.emailInput).toBeVisible();
    await expect(companyRegister.phoneInput).toBeVisible();
    await expect(companyRegister.industryTrigger).toBeVisible();
    await expect(companyRegister.companySizeTrigger).toBeVisible();
    await expect(companyRegister.overviewTextarea).toBeVisible();
    await expect(companyRegister.logoUpload).toBeVisible();
    await expect(companyRegister.bannerUpload).toBeVisible();
    await expect(companyRegister.submitButton).toBeVisible();
  });

  test.skip('CPSK register form fields', async ({ page }) => {
    const cpskRegister = new CPSKRegisterPage(page);
    await cpskRegister.navigate();

    await expect(cpskRegister.firstNameInput).toBeVisible();
    await expect(cpskRegister.lastNameInput).toBeVisible();
    await expect(cpskRegister.emailInput).toBeVisible();
    await expect(cpskRegister.phoneInput).toBeVisible();
    await expect(cpskRegister.programCPE).toBeVisible();
    await expect(cpskRegister.programSKE).toBeVisible();
    await expect(cpskRegister.yearRadioGroup).toBeVisible();
    await expect(cpskRegister.resumeUpload).toBeVisible();
    await expect(cpskRegister.softSkillInput).toBeVisible();
    await expect(cpskRegister.submitButton).toBeVisible();
  });
});
