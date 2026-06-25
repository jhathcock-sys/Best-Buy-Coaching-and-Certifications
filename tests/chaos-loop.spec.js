import { test, expect } from '@playwright/test';

test.describe('Chaos Loop', () => {
  // Increase test timeout significantly since we are looping
  test.setTimeout(120000); 

  test('Execute Floor Leader & Aura HUD loop multiple times', async ({ page }) => {
    
    // We loop 3 times to prove stability
    for (let i = 0; i < 3; i++) {
      console.log(`\n\n=== Starting Chaos Sweep Iteration ${i + 1} ===`);
      
      // Navigate to Login
      await page.goto('/');

      // Wait for Auth to initialize if needed
      await page.waitForTimeout(1000); // Wait for auth state

      // If we are already logged in (from previous loop), we need to handle it or ensure we are logged out.
      // Actually, playwright clears state between tests, but inside the loop it maintains state!
      // So if i > 0, we are ALREADY logged in and on the dashboard.
      // We will only login if the persona button is visible.
      const isLoginVisible = await page.getByTestId('persona-supervisor-btn').isVisible();
      
      if (isLoginVisible) {
         // Login
         console.log('Logging in as Supervisor...');
         await page.getByTestId('persona-supervisor-btn').click();
         
         // Select store first
         await page.getByTestId('store-input').fill('1480');

         // Enter backdoor PIN
         await page.getByTestId('keypad-1').click();
         await page.getByTestId('keypad-0').click();
         await page.getByTestId('keypad-2').click();
         await page.getByTestId('keypad-2').click();
      } else {
         console.log('Already logged in, continuing from Dashboard.');
         await page.getByTestId('nav-dashboard').click();
      }

      // Assert successful navigation by looking for the dashboard nav item
      await expect(page.getByTestId('nav-dashboard')).toBeVisible({ timeout: 10000 });

      console.log('Navigating to Floor Leader Tracker...');
      // Use the specific nav item
      await page.getByTestId('nav-floor-leader').click();

      // Ensure we are in the active shift view by starting a shift if needed
      await expect(page.getByText('Floor Leader Tracker').first()).toBeVisible({ timeout: 10000 });
      // Give React a moment to render the form or the tabs
      await page.waitForTimeout(1000);

      const startShiftBtn = page.getByRole('button', { name: 'Start Shift Monitoring' });
      if (await startShiftBtn.isVisible()) {
         console.log('Starting Shift Monitoring...');
         await startShiftBtn.click();
      }

      await expect(page.getByText('Hourly Tracker')).toBeVisible({ timeout: 10000 });
      console.log('Floor Leader Tracker loaded successfully.');

      console.log('Navigating to Aura HUD...');
      // Navigate to Aura HUD
      await page.getByTestId('nav-aura').click();

      // Check if Scan Floor button exists
      const scanFloorBtn = page.getByTestId('scan-floor-btn');
      await expect(scanFloorBtn).toBeVisible({ timeout: 10000 });

      console.log('Scanning Floor...');
      await scanFloorBtn.click();

      // Wait for the scan to finish
      console.log('Waiting for AI generation to complete (this tests the hanging issue)...');
      await expect(scanFloorBtn).toHaveText('Scanning Floor...', { timeout: 5000 });
      // The button text changes back to 'Scan Floor' when done
      await expect(scanFloorBtn).toHaveText('Scan Floor', { timeout: 35000 });
      console.log('Scan Floor completed successfully!');

      console.log(`=== Finished Chaos Sweep Iteration ${i + 1} ===\n`);
    }

    console.log('Chaos Loop completed successfully!');
  });
});
