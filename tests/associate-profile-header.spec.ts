import { test, expect } from '@playwright/test';

test.describe('AssociateProfileHeader Component', () => {

  test('handles null/undefined employee gracefully (hydration guard)', async ({ page }) => {
    // Navigate to the test harness route
    await page.goto('/test-profile-header');

    // The first instance is the null employee case
    // We should see the loading text inside a data-testid="profile-header-loading"
    const loadingDiv = page.getByTestId('profile-header-loading');
    
    // There might be multiple headers rendered on the test harness, but only the first one has null employee.
    // So we just check that the loading state is visible.
    await expect(loadingDiv).toBeVisible({ timeout: 5000 });
    await expect(loadingDiv).toHaveText('Loading...');
  });

  test('correctly renders the Focus 5 badge when focus5 is true', async ({ page }) => {
    await page.goto('/test-profile-header');

    // Focus 5 badge should be visible on the second test case
    const focus5Badge = page.getByTestId('profile-header-focus5-badge');
    
    await expect(focus5Badge).toBeVisible();
    await expect(focus5Badge).toContainText('FOCUS 5');
  });

  test('correctly displays the CVI badge with correct classes based on calculateCVI', async ({ page }) => {
    await page.goto('/test-profile-header');

    // All test cases that have an employee will render the cvi-badge.
    const cviBadges = page.getByTestId('profile-header-cvi-badge');

    // We expect 3 CVI badges on the test harness (Accelerating, Needs Review, Neutral)
    await expect(cviBadges).toHaveCount(3);

    // 1. Accelerating CVI (+100%)
    const acceleratingBadge = cviBadges.nth(0);
    await expect(acceleratingBadge).toContainText('CVI: +100% (Accelerating)');
    await expect(acceleratingBadge).toHaveClass(/bg-success-alpha-15/);
    await expect(acceleratingBadge).toHaveClass(/text-success/);

    // 2. Needs Review CVI (-50%)
    const needsReviewBadge = cviBadges.nth(1);
    await expect(needsReviewBadge).toContainText('CVI: -50% (Needs Review)');
    await expect(needsReviewBadge).toHaveClass(/bg-error-alpha-20/);
    await expect(needsReviewBadge).toHaveClass(/text-error/);

    // 3. Neutral CVI (0%)
    const neutralBadge = cviBadges.nth(2);
    await expect(neutralBadge).toContainText('CVI: 0% (Neutral)');
    await expect(neutralBadge).toHaveClass(/bg-warning-alpha/);
    await expect(neutralBadge).toHaveClass(/text-warning/);
  });
});
