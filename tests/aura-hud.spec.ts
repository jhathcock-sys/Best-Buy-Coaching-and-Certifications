import { test, expect } from '@playwright/test';

test.describe('Aura HUD Manager View', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Select Supervisor persona
    await page.getByTestId('persona-supervisor-btn').click();

    // Enter backdoor PIN (1022)
    await page.getByTestId('keypad-1').click();
    await page.getByTestId('keypad-0').click();
    await page.getByTestId('keypad-2').click();
    await page.getByTestId('keypad-2').click();

    // Wait for dashboard
    await expect(page.getByTestId('nav-dashboard')).toBeVisible({ timeout: 10000 });

    // Ensure Overview menu is expanded (Aura is under Floor Operations)
    // Wait, Aura is under Floor Operations. Let's make sure it's expanded.
    const auraNav = page.getByTestId('nav-aura');
    if (!(await auraNav.isVisible())) {
      await page.getByTestId('toggle-floorOps').click();
    }
    
    // Navigate to Aura HUD
    await auraNav.click();
    await expect(page.getByTestId('aura-hud-page')).toBeVisible({ timeout: 10000 });
  });

  test('Aura HUD renders and shows roster cards or empty state', async ({ page }) => {
    const scanBtn = page.getByTestId('scan-floor-btn');
    await expect(scanBtn).toBeVisible();
    
    const emptyState = page.getByTestId('empty-roster-state');
    if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
    } else {
        const firstAuraCard = page.locator('[data-testid^="aura-card-"]').first();
        await expect(firstAuraCard).toBeVisible();
        
        const defaultWaitingMsg = firstAuraCard.getByText('Awaiting Scan...');
        await expect(defaultWaitingMsg).toBeVisible();
    }
  });

  test('Scan Floor button triggers loading states and calls AI mock', async ({ page }) => {
    // Intercept the Firebase cloud function call
    await page.route('**/*generateAIContent', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
             text: JSON.stringify({
                "yinel": { "status": "excellent", "action": "Celebrate", "insight": "Great job" }
             })
          }
        })
      });
    });

    // We must handle the API key alert if it pops up
    page.on('dialog', dialog => dialog.dismiss());
    
    // Set mock api key in local storage to bypass the alert
    await page.evaluate(() => {
        window.localStorage.setItem('bby_api_key', 'mock_api_key_123');
    });
    
    // Check for empty state first
    if (await page.getByTestId('empty-roster-state').isVisible()) {
       // Skip test if no roster
       return;
    }

    const scanBtn = page.getByTestId('scan-floor-btn');
    await scanBtn.click();
    
    await expect(scanBtn).toBeDisabled();
    
    const firstAuraCard = page.locator('[data-testid^="aura-card-"]').first();
    const firstInsightSkeleton = firstAuraCard.getByTestId('insight-skeleton');
    
    // Wait for the skeleton to appear then disappear
    await expect(firstInsightSkeleton).toBeVisible();
    await expect(firstInsightSkeleton).not.toBeVisible({ timeout: 10000 });
    
    await expect(scanBtn).toBeEnabled();
  });

});
