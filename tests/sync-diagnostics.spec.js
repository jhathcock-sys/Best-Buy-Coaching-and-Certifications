import { test, expect } from '@playwright/test';

test.describe('Sync Diagnostics Tab Security & Execution', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Manager Login
    await page.goto('/');
    await page.getByTestId('persona-supervisor-btn').click();
    await page.getByTestId('keypad-2').click();
    await page.getByTestId('keypad-0').click();
    await page.getByTestId('keypad-0').click();
    await page.getByTestId('keypad-1').click();
    await expect(page.getByTestId('nav-dashboard')).toBeVisible({ timeout: 10000 });
    
    // 2. Navigate to Playbook Studio via nav link to preserve auth state
    await page.getByTestId('nav-playbook').evaluate(el => el.click());
    
    // 3. Click Database Sync tab
    await page.getByTestId('tab-sync').click();
  });

  test('UI is secured and does not allow manual API key inputs', async ({ page }) => {
    // The manual input fields for Firebase config should NO LONGER exist.
    // Ensure the vulnerable form fields are completely removed from the DOM.
    await expect(page.getByText('Firebase API Key:')).toHaveCount(0);
    await expect(page.getByText('Firebase Project ID:')).toHaveCount(0);
    await expect(page.getByPlaceholder('e.g. AIzaSyA1...')).toHaveCount(0);

    // Verify the UI shows the secured Sync Diagnostics section
    await expect(page.getByTestId('run-sync-diagnostics-btn')).toBeVisible();
  });

  test('Run Sync Diagnostics flow executes without locking the UI', async ({ page }) => {
    const runBtn = page.getByTestId('run-sync-diagnostics-btn');
    await runBtn.click();

    // Verify it enters the running state and disables the button temporarily
    await expect(runBtn).toBeDisabled();
    await expect(runBtn).toHaveText(/Running/i);

    // Verify the UI isn't locked by checking if we can see the logs stream in asynchronously
    const logContainer = page.getByTestId('diagnostics-log-output');
    await expect(logContainer).toBeVisible();
    
    // Check that we're seeing realtime asynchronous updates
    await expect(logContainer).toContainText('Starting IndexedDB', { timeout: 5000 });
    
    // Eventually finishes and re-enables
    await expect(runBtn).toBeEnabled({ timeout: 15000 });
    await expect(logContainer).toContainText('Audit complete', { timeout: 15000 });
  });

});
