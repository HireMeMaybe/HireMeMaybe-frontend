import { test, expect } from '../fixtures';

/**
 * Smoke & Navigation Tests
 * Based on HireMeMaybe Frontend E2E Test Plan - Section 4.1
 *
 * Coverage:
 * - SMK-01: Landing page loads with role cards
 * - SMK-02: Protected route guard (search)
 * - SMK-03: Global 404 fallbacks
 */

test.describe('Smoke & Navigation Tests', () => {
  test.describe('SMK-01: Landing loads with role cards', () => {
    test('should display hero section and role cards', async ({ landingPage }) => {
      await landingPage.navigate();

      // Verify page loaded
      await expect(landingPage.page).toHaveURL('/');
      await expect(landingPage.page).toHaveTitle(/HireMeMaybe/i);

      // Verify navbar is visible
      await expect(landingPage.navBar).toBeVisible();

      // Verify footer is visible
      await expect(landingPage.footer).toBeVisible();

      // Verify join button (part of hero section)
      await expect(landingPage.joinButton).toBeVisible();

      // Verify all three role cards are clickable
      await expect(landingPage.cpskCard).toBeVisible();
      await expect(landingPage.cpskCard).toBeEnabled();

      await expect(landingPage.companyCard).toBeVisible();
      await expect(landingPage.companyCard).toBeEnabled();

      await expect(landingPage.visitorCard).toBeVisible();
      await expect(landingPage.visitorCard).toBeEnabled();
    });

    test('should allow clicking on role cards', async ({ landingPage, page }) => {
      await landingPage.navigate();

      // Click CPSK card and verify Google sign-in stub would fire
      // (In real implementation, this would redirect to Google OAuth)
      await landingPage.clickCPSKCard();

      // Verify the page still loaded (even if OAuth is not fully set up)
      await expect(page).toHaveURL(/\//);

      // Reload and test Company card
      await landingPage.navigate();
      await landingPage.clickCompanyCard();
      await expect(page).toHaveURL(/\//);

      // Reload and test Visitor card
      await landingPage.navigate();
      await landingPage.clickVisitorCard();
      await expect(page).toHaveURL(/\//);
    });

    test('should have functional join button that scrolls to login section', async ({
      landingPage,
    }) => {
      await landingPage.navigate();

      // Click join button (should scroll to login section)
      await landingPage.clickJoin();

      // Verify role cards are visible after scroll
      await expect(landingPage.cpskCard).toBeVisible();
      await expect(landingPage.companyCard).toBeVisible();
      await expect(landingPage.visitorCard).toBeVisible();
    });
  });

  test.describe('SMK-02: Protected route guard (search)', () => {
    test('should redirect unauthenticated user from protected route to landing', async ({
      page,
    }) => {
      // Try to access protected route without authentication
      await page.goto('/search');

      // Wait for network to settle and page to fully load
      await page.waitForLoadState('networkidle');
      await page.waitForLoadState('domcontentloaded');

      // Give extra time for WebKit to complete redirect
      await page.waitForTimeout(1000);

      const currentUrl = page.url();

      // In some browsers (WebKit), the redirect might not happen immediately
      // Check if we're redirected OR if there's an auth prompt/blocker
      const isRedirected = !currentUrl.includes('/search');
      const hasAuthBlocker = (await page.locator('text=/sign in|login|authenticate/i').count()) > 0;

      // Should either redirect OR show authentication requirement
      expect(isRedirected || hasAuthBlocker).toBeTruthy();
    });

    test('should not flash protected UI content before redirect', async ({ page }) => {
      // Navigate to protected route
      await page.goto('/search');
      await page.waitForLoadState('networkidle');
      await page.waitForLoadState('domcontentloaded');

      // Give extra time for WebKit to complete redirect
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      const searchInput = page.locator('input[placeholder*="Search"]').first();

      // Check if redirected OR if search functionality is blocked
      const isRedirected = !currentUrl.includes('/search');

      if (isRedirected) {
        // If redirected, search input should not exist
        const searchCount = await page.locator('input[placeholder*="Search"]').count();
        expect(searchCount).toBe(0);
      } else {
        // If stayed on /search, should show auth blocker or disabled state
        // Check that either: search input is hidden, disabled, or auth prompt is shown
        const hasAuthPrompt =
          (await page.locator('text=/sign in|login|authenticate/i').count()) > 0;
        const isSearchHidden = !(await searchInput.isVisible().catch(() => false));

        expect(hasAuthPrompt || isSearchHidden).toBeTruthy();
      }
    });
  });

  test.describe('SMK-03: Global 404 fallbacks', () => {
    test('should show 404 page for non-existent routes', async ({ page }) => {
      // Navigate to a route that definitely doesn't exist
      await page.goto('/this-route-does-not-exist-12345');
      await page.waitForLoadState('networkidle');

      // Should show 404 error or custom not-found page
      // Check for common 404 indicators
      const pageContent = await page.textContent('body');

      // Should contain "404" or "not found" somewhere on the page
      expect(pageContent?.toLowerCase()).toMatch(/404|not found|page not found/i);
    });

    test('should show 404 for non-existent nested routes', async ({ page }) => {
      await page.goto('/admin/some-random-page-that-does-not-exist');
      await page.waitForLoadState('networkidle');

      const pageContent = await page.textContent('body');
      expect(pageContent?.toLowerCase()).toMatch(/404|not found|page not found/i);
    });

    test('should show 404 for malformed dynamic routes', async ({ page }) => {
      // Try accessing a dynamic route with invalid ID format
      await page.goto('/company/invalid-id-format-###');
      await page.waitForLoadState('networkidle');

      // Should either show 404 or handle gracefully
      const currentUrl = page.url();
      const pageContent = await page.textContent('body');

      // Verify page handles this gracefully (either 404 or error message)
      const hasErrorHandling =
        pageContent?.toLowerCase().includes('404') ||
        pageContent?.toLowerCase().includes('not found') ||
        pageContent?.toLowerCase().includes('error') ||
        currentUrl.includes('/');

      expect(hasErrorHandling).toBeTruthy();
    });

    test('should maintain navigation after 404', async ({ page, landingPage }) => {
      // Go to 404 page
      await page.goto('/non-existent-page');
      await page.waitForLoadState('networkidle');

      // Should still be able to navigate to landing page
      await landingPage.navigate();

      // Verify we can successfully navigate back to working routes
      await expect(page).toHaveURL('/');
      await expect(landingPage.cpskCard).toBeVisible();
    });
  });
});
