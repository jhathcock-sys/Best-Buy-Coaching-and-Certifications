import { test, expect } from '@playwright/test';

test.describe('Playbook Studio Settings Tabs', () => {

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

    // 5. Navigate to Playbook Studio page via routing
    await page.goto('/playbook');

    // Wait for the playbook studio content to load
    await expect(page.getByTestId('playbook-studio-content')).toBeVisible({ timeout: 10000 });
  });

  test('can navigate between all settings tabs without crashing', async ({ page }) => {
    // 1. AI Engine Tab (Default)
    await expect(page.getByTestId('ai-engine-tab')).toBeVisible();

    // 2. System Prompts Tab
    await page.getByTestId('tab-prompts').click();
    await expect(page.getByTestId('system-prompts-tab')).toBeVisible();

    // 3. Supervisor Profiles Tab
    await page.getByTestId('tab-supervisors').click();
    await expect(page.getByTestId('supervisor-profiles-tab')).toBeVisible();

    // 4. BBY Dictionary Tab
    await page.getByTestId('tab-vocab').click();
    await expect(page.getByTestId('bby-vocab-tab')).toBeVisible();

    // 5. Metric Goals Tab
    await page.getByTestId('tab-targets').click();
    await expect(page.getByTestId('department-targets-tab')).toBeVisible();

    // 6. Custom Scenarios Tab
    await page.getByTestId('tab-scenarios').click();
    await expect(page.getByTestId('custom-scenarios-tab')).toBeVisible();

    // 7. Database Sync Tab
    await page.getByTestId('tab-sync').click();
    await expect(page.getByTestId('sync-diagnostics-tab')).toBeVisible();
  });
});
