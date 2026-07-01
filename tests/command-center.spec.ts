import { test, expect } from '@playwright/test';

test.describe('Command Center', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Go to Login page
    await page.goto('/');

    // 2. Select Supervisor persona
    await page.getByTestId('persona-supervisor-btn').click();

    // 3. Enter Real Manager PIN (2001)
    await page.getByTestId('keypad-2').click();
    await page.getByTestId('keypad-0').click();
    await page.getByTestId('keypad-0').click();
    await page.getByTestId('keypad-1').click();

    // 4. Assert successful navigation to dashboard
    await expect(page.getByTestId('nav-dashboard')).toBeVisible({ timeout: 10000 });

    // 5. Navigate to Command Center
    await page.goto('/command-center');

    // Wait for the command center page to load
    await expect(page.getByTestId('command-center-page')).toBeVisible({ timeout: 10000 });
  });

  test('renders the new modular components', async ({ page }) => {
    // Check SystemStatusPanel
    const statusPanel = page.getByTestId('system-status-panel');
    await expect(statusPanel).toBeVisible();
    await expect(page.getByTestId('active-file-name')).toBeVisible();
    await expect(page.getByTestId('phase-indicator')).toBeVisible();

    // Check AgentCommLink
    const commLink = page.getByTestId('agent-comm-link');
    await expect(commLink).toBeVisible();

    // Check ProcessingQueue
    const queue = page.getByTestId('processing-queue');
    await expect(queue).toBeVisible();
    await expect(page.getByTestId('queue-count')).toBeVisible();
  });
});
