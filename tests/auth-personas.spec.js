import { test, expect } from '@playwright/test';

test.describe('Authentication Personas', () => {

  test('Guest backdoor login (PIN 1234)', async ({ page }) => {
    await page.goto('/');

    // Select Supervisor persona
    await page.getByTestId('persona-supervisor-btn').click();

    // Enter backdoor PIN
    await page.getByTestId('keypad-1').click();
    await page.getByTestId('keypad-2').click();
    await page.getByTestId('keypad-3').click();
    await page.getByTestId('keypad-4').click();

    // Assert successful navigation by looking for the dashboard nav item
    const dashboardNav = page.getByTestId('nav-dashboard');
    await expect(dashboardNav).toBeVisible({ timeout: 10000 });
  });

  test('Real manager login (Corey T. PIN 2001)', async ({ page }) => {
    await page.goto('/');

    // Select Supervisor persona
    await page.getByTestId('persona-supervisor-btn').click();

    // Enter Real Manager PIN
    await page.getByTestId('keypad-2').click();
    await page.getByTestId('keypad-0').click();
    await page.getByTestId('keypad-0').click();
    await page.getByTestId('keypad-1').click();

    // Assert successful navigation by looking for the dashboard nav item
    const dashboardNav = page.getByTestId('nav-dashboard');
    await expect(dashboardNav).toBeVisible({ timeout: 10000 });
  });

  test('Invalid PIN triggers shake animation and clears keypad', async ({ page }) => {
    await page.goto('/');

    // Select Supervisor persona
    await page.getByTestId('persona-supervisor-btn').click();

    // Enter invalid PIN (e.g. 9999)
    await page.getByTestId('keypad-9').click();
    await page.getByTestId('keypad-9').click();
    await page.getByTestId('keypad-9').click();
    await page.getByTestId('keypad-9').click();

    // Check for shake animation on pin-dots-container
    // The class 'shake-animation' is added on invalid login
    const pinContainer = page.locator('.pin-dots-container');
    await expect(pinContainer).toHaveClass(/shake-animation/);

    // After shake animation, pin should clear (all dots should lose 'filled' class)
    // Wait for the shake animation to finish (600ms setTimeout in Login.tsx)
    // We shouldn't use waitForTimeout, so we will assert the state of the DOM.
    // The 'filled' class should disappear from the dots.
    const firstDot = pinContainer.locator('.pin-dot').first();
    await expect(firstDot).not.toHaveClass(/filled/, { timeout: 2000 });
  });

});
