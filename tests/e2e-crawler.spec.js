import { test, expect } from '@playwright/test';
import fs from 'fs';

test('Autonomous QA Crawler', async ({ page }) => {
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[Console Error]: ${msg.text()}`);
    }
    if (msg.type() === 'warning') {
      errors.push(`[Console Warning]: ${msg.text()}`);
    }
  });

  page.on('pageerror', exception => {
    errors.push(`[Uncaught Exception]: ${exception.message}`);
  });

  // Navigate to root
  await page.goto('/');

  // Real authentication using data-testids
  await page.getByTestId('persona-supervisor-btn').click();
  
  // Wait for keypad and enter PIN 1022
  await page.getByTestId('keypad-1').click();
  await page.getByTestId('keypad-0').click();
  await page.getByTestId('keypad-2').click();
  await page.getByTestId('keypad-2').click();

  // Wait for the app to settle by asserting the dashboard nav item is visible
  const dashboardNav = page.getByTestId('nav-dashboard');
  await expect(dashboardNav).toBeVisible({ timeout: 10000 });
  await expect(dashboardNav).toHaveClass(/active/, { timeout: 10000 });

  // Take screenshot of Dashboard
  fs.mkdirSync('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/dashboard.png', fullPage: true });

  // Map of routes to visit with their corresponding sidebar testids
  const routesToTest = [
    { path: '/roster', name: 'Roster', testId: 'nav-roster' },
    { path: '/shadow', name: 'Shadow', testId: 'nav-shadow' },
    { path: '/floorLeader', name: 'FloorLeader', testId: 'nav-floor-leader' },
    { path: '/roleplay', name: 'Arena', testId: 'nav-roleplay' },
    { path: '/coach', name: 'Coach', testId: 'nav-coach' },
    { path: '/builder', name: 'LogBuilder', testId: 'nav-builder' },
    { path: '/history', name: 'History', testId: 'nav-history' },
    { path: '/playbook', name: 'Playbook', testId: 'nav-playbook' }
  ];

  for (const route of routesToTest) {
    // Navigate to the route directly
    await page.goto(route.path);
    
    // Assert that the view has settled by checking the active class on the corresponding nav item
    const navLink = page.getByTestId(route.testId);
    await expect(navLink).toHaveClass(/active/, { timeout: 5000 });
    
    await page.screenshot({ path: `test-results/${route.name.toLowerCase()}.png`, fullPage: true });
    
    // Simulate generic interactions: try hovering the first main content button we find
    const buttons = page.locator('main button');
    if (await buttons.count() > 0) {
      try {
        await buttons.first().hover();
      } catch (e) {
        errors.push(`[Interaction Error] on ${route.name}: ${e.message}`);
      }
    }
  }

  // Write collected errors to log
  fs.writeFileSync('test-results/console-errors.log', errors.join('\n'));
});
