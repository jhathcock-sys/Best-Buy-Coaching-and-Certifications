import { test, expect } from '@playwright/test';

test.describe('Zone Scheduler E2E', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Select Supervisor persona
    await page.getByTestId('persona-supervisor-btn').click();

    // Enter backdoor PIN (1022)
    await page.getByTestId('keypad-1').click();
    await page.getByTestId('keypad-0').click();
    await page.getByTestId('keypad-2').click();
    await page.getByTestId('keypad-2').click();

    // Wait for the app to settle
    const dashboardNav = page.getByTestId('nav-dashboard');
    await expect(dashboardNav).toBeVisible({ timeout: 10000 });

    // Go to Floor Leader
    await page.getByTestId('nav-floor-leader').click();
    
    // Wait for either the setup form OR the tabs to appear
    await expect(page.locator('text=Start Shift Monitoring').or(page.locator('text=Zones & Breaks Run Sheet'))).toBeVisible({ timeout: 10000 });

    const startShiftBtn = page.getByRole('button', { name: 'Start Shift Monitoring' });
    if (await startShiftBtn.isVisible()) {
      await page.locator('input[type="text"]').first().fill('Playwright Test Leader');
      await startShiftBtn.click();
    }

    // Switch to 'Zones & Breaks Run Sheet' tab
    await page.getByText('Zones & Breaks Run Sheet').click();
  });

  test('Auto-Deploy (AI) button works and shows success toast', async ({ page }) => {
    // Mock the Firebase Cloud Function
    await page.route('**/*generateAIContent', async route => {
      // Simulate delay for disabled state testing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const payload = {
        data: {
          text: JSON.stringify({
            'Computing': ['emp-1'],
            'Mobile': ['emp-2']
          })
        }
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload)
      });
    });

    const autoDeployBtn = page.getByTestId('auto-deploy-btn');
    
    // Initial state
    await expect(autoDeployBtn).toBeEnabled();
    
    // Click auto deploy
    await autoDeployBtn.click();

    // While fetching, it should be disabled and say "Optimizing..."
    await expect(autoDeployBtn).toBeDisabled();
    await expect(autoDeployBtn).toContainText('Optimizing...');

    // Wait for the success toast message
    const toastMessage = page.locator('.go3958317564'); // Default hot-toast class, but we can look for text
    await expect(page.getByText('Roster optimized and Auto-Deployed!')).toBeVisible({ timeout: 5000 });

    // Should return to enabled
    await expect(autoDeployBtn).toBeEnabled();
    await expect(autoDeployBtn).toContainText('Auto-Deploy (AI)');
  });

  test.skip('Drag-and-drop mechanism moves associate to zone', async ({ page }) => {
    // Look for an unassigned associate. Draggable associates have data-testid="draggable-associate-<id>"
    // We don't know the exact ID, so we get the first one inside the unassigned zone
    const unassignedZone = page.getByTestId('droppable-zone-unassigned');
    const firstAssociate = unassignedZone.locator('[data-testid^="draggable-associate-"]').first();
    
    // Get the ID of the first associate
    const associateId = await firstAssociate.getAttribute('data-testid');
    
    // Drag to Computing zone using dispatchEvent for dnd-kit
    const computingZone = page.getByTestId('droppable-zone-computing');
    
    // Playwright dragTo is the most robust way to test drag-and-drop
    await firstAssociate.dragTo(computingZone, {
      force: true,
      targetPosition: { x: 50, y: 50 }, // Aim for center of computing zone
    });
    await page.waitForTimeout(500);

    // Verify the associate is now inside the Computing zone
    await expect(computingZone.locator(`[data-testid="${associateId}"]`)).toBeVisible({ timeout: 5000 });
    
    // Verify the unassigned zone no longer has this associate
    await expect(unassignedZone.locator(`[data-testid="${associateId}"]`)).not.toBeVisible();
  });

  test('UI correctly renders active break statuses on associate cards', async ({ page }) => {
    // Send the first associate on a break
    const unassignedZone = page.getByTestId('droppable-zone-unassigned');
    const firstAssociate = unassignedZone.locator('[data-testid^="draggable-associate-"]').first();
    const associateId = await firstAssociate.getAttribute('data-testid');
    const empId = associateId.replace('draggable-associate-', '');
    
    // Click the 15m break button on the associate
    const breakBtn = firstAssociate.locator('button', { hasText: '15m' }).first();
    
    // DND Kit cards intercept clicks, so dispatch pointerdown directly to bypass drag sensors
    await breakBtn.dispatchEvent('pointerdown');

    // Verify the break status shows
    const breakStatus = firstAssociate.getByTestId(`break-status-${empId}`);
    await expect(breakStatus).toBeVisible();
    await expect(breakStatus).toContainText('On 15m Break');
    
    // End the break
    const endBtn = firstAssociate.locator('button', { hasText: 'End Break' });
    await endBtn.dispatchEvent('pointerdown');
    
    // Verify the status is gone
    await expect(breakStatus).not.toBeVisible();
  });

});
