import { test } from '@playwright/test';
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

  // Bypass authentication if present
  await page.evaluate(() => {
    sessionStorage.setItem('bby_authenticated', 'true');
    localStorage.setItem('bby_api_key', 'test_key');
  });
  await page.reload();

  // Wait for the app to settle
  await page.waitForTimeout(2000);

  // Take screenshot of Dashboard
  await page.screenshot({ path: 'test-results/dashboard.png', fullPage: true });

  // Map of routes to visit
  const routesToTest = [
    { path: '/roster', name: 'Roster' },
    { path: '/shadow', name: 'Shadow' },
    { path: '/floorLeader', name: 'FloorLeader' },
    { path: '/roleplay', name: 'Arena' },
    { path: '/coach', name: 'Coach' },
    { path: '/builder', name: 'LogBuilder' },
    { path: '/history', name: 'History' },
    { path: '/playbook', name: 'Playbook' }
  ];

  for (const route of routesToTest) {
    await page.goto(route.path);
    await page.waitForTimeout(1500); // Wait for animations
    await page.screenshot({ path: `test-results/${route.name.toLowerCase()}.png`, fullPage: true });
    
    // Simulate generic interactions: try clicking the first button we find on the page
    const buttons = page.locator('button');
    if (await buttons.count() > 0) {
      try {
        await buttons.first().hover();
        // We do not click blindly because it might submit forms or navigate away and break the loop
      } catch (e) {
        errors.push(`[Interaction Error] on ${route.name}: ${e.message}`);
      }
    }
  }

  // Write collected errors to log
  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync('test-results/console-errors.log', errors.join('\n'));
});
