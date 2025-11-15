import { test as base } from '@playwright/test';
import {
  LandingPage,
  CompanyRegisterPage,
  CPSKRegisterPage,
  AdminLoginPage,
  AdminDashboardPage,
} from './pages';

/**
 * Extended test fixtures with all page objects
 * This allows easy access to page objects in tests
 *
 * Usage:
 * test('test name', async ({ landingPage }) => {
 *   await landingPage.navigate();
 *   // ... test code
 * });
 */
type PageFixtures = {
  landingPage: LandingPage;
  companyRegisterPage: CompanyRegisterPage;
  cpskRegisterPage: CPSKRegisterPage;
  adminLoginPage: AdminLoginPage;
  adminDashboardPage: AdminDashboardPage;
};

export const test = base.extend<PageFixtures>({
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },

  companyRegisterPage: async ({ page }, use) => {
    await use(new CompanyRegisterPage(page));
  },
  cpskRegisterPage: async ({ page }, use) => {
    await use(new CPSKRegisterPage(page));
  },
  
  adminLoginPage: async ({ page }, use) => {
    await use(new AdminLoginPage(page));
  },
  adminDashboardPage: async ({ page }, use) => {
    await use(new AdminDashboardPage(page));
  },
});

export { expect } from '@playwright/test';
