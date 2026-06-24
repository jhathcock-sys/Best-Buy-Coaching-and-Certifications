# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: autonomous-audit.spec.js >> Autonomous QA Crawler
- Location: tests\autonomous-audit.spec.js:4:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('nav-dashboard')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByTestId('nav-dashboard')

```

```yaml
- button "Back"
- heading "FloorVision Login" [level=2]
- paragraph: Enter your store number and passcode PIN
- textbox "Store Number"
- button "1"
- button "2"
- button "3"
- button "4"
- button "5"
- button "6"
- button "7"
- button "8"
- button "9"
- button "CLEAR"
- button "0"
- button
- text: Cloud Database Sync Active
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import fs from 'fs';
  3  | 
  4  | test('Autonomous QA Crawler', async ({ page }) => {
  5  |   const errors = [];
  6  | 
  7  |   page.on('console', msg => {
  8  |     if (msg.type() === 'error') {
  9  |       errors.push(`[Console Error]: ${msg.text()}`);
  10 |     }
  11 |     if (msg.type() === 'warning') {
  12 |       errors.push(`[Console Warning]: ${msg.text()}`);
  13 |     }
  14 |   });
  15 | 
  16 |   page.on('pageerror', exception => {
  17 |     errors.push(`[Uncaught Exception]: ${exception.message}`);
  18 |   });
  19 | 
  20 |   // Navigate to root
  21 |   await page.goto('/');
  22 | 
  23 |   // Real authentication using data-testids
  24 |   await page.getByTestId('persona-supervisor-btn').click();
  25 |   
  26 |   // Wait for keypad and enter PIN 1234
  27 |   await page.locator('button.keypad-btn', { hasText: /^1$/ }).click();
  28 |   await page.locator('button.keypad-btn', { hasText: /^2$/ }).click();
  29 |   await page.locator('button.keypad-btn', { hasText: /^3$/ }).click();
  30 |   await page.locator('button.keypad-btn', { hasText: /^4$/ }).click();
  31 | 
  32 |   // Wait for the app to settle by asserting the dashboard nav item is visible
  33 |   const dashboardNav = page.getByTestId('nav-dashboard');
> 34 |   await expect(dashboardNav).toBeVisible({ timeout: 10000 });
     |                              ^ Error: expect(locator).toBeVisible() failed
  35 |   await expect(dashboardNav).toHaveClass(/active/, { timeout: 10000 });
  36 | 
  37 |   // Take screenshot of Dashboard
  38 |   fs.mkdirSync('test-results', { recursive: true });
  39 |   await page.screenshot({ path: 'test-results/dashboard.png', fullPage: true });
  40 | 
  41 |   // Map of routes to visit with their corresponding sidebar testids
  42 |   const routesToTest = [
  43 |     { path: '/roster', name: 'Roster', testId: 'nav-roster' },
  44 |     { path: '/shadow', name: 'Shadow', testId: 'nav-shadow' },
  45 |     { path: '/floorLeader', name: 'FloorLeader', testId: 'nav-floor-leader' },
  46 |     { path: '/roleplay', name: 'Arena', testId: 'nav-roleplay' },
  47 |     { path: '/coach', name: 'Coach', testId: 'nav-coach' },
  48 |     { path: '/builder', name: 'LogBuilder', testId: 'nav-builder' },
  49 |     { path: '/history', name: 'History', testId: 'nav-history' },
  50 |     { path: '/playbook', name: 'Playbook', testId: 'nav-playbook' }
  51 |   ];
  52 | 
  53 |   for (const route of routesToTest) {
  54 |     // Navigate to the route directly
  55 |     await page.goto(route.path);
  56 |     
  57 |     // Assert that the view has settled by checking the active class on the corresponding nav item
  58 |     const navLink = page.getByTestId(route.testId);
  59 |     await expect(navLink).toHaveClass(/active/, { timeout: 5000 });
  60 |     
  61 |     await page.screenshot({ path: `test-results/${route.name.toLowerCase()}.png`, fullPage: true });
  62 |     
  63 |     // Simulate generic interactions: try hovering the first main content button we find
  64 |     const buttons = page.locator('main button');
  65 |     if (await buttons.count() > 0) {
  66 |       try {
  67 |         await buttons.first().hover();
  68 |       } catch (e) {
  69 |         errors.push(`[Interaction Error] on ${route.name}: ${e.message}`);
  70 |       }
  71 |     }
  72 |   }
  73 | 
  74 |   // Write collected errors to log
  75 |   fs.writeFileSync('test-results/console-errors.log', errors.join('\n'));
  76 | });
  77 | 
```