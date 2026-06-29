# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: floor-audit.spec.js >> Floor Audit >> RBAC gate: Non-managers cannot access Floor Leader Tracker
- Location: tests\floor-audit.spec.js:5:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('advisor-dashboard-container')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByTestId('advisor-dashboard-container')

```

```yaml
- button "Back"
- heading "Advisor Portal" [level=2]
- paragraph: Enter your Employee ID to view your metrics
- textbox "Store Number": "0281"
- textbox "Employee ID": yinel
- text: Failed to connect to store database.
- button "Access Portal"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Floor Audit', () => {
  4  | 
  5  |   test('RBAC gate: Non-managers cannot access Floor Leader Tracker', async ({ page }) => {
  6  |     await page.goto('/');
  7  | 
  8  |     // Select Advisor persona
  9  |     await page.getByTestId('persona-advisor-btn').click();
  10 | 
  11 |     // Enter Store Number and Employee ID (yinel)
  12 |     await page.getByPlaceholder('Store Number').fill('0281');
  13 |     await page.getByPlaceholder('Employee ID').fill('yinel');
  14 |     await page.getByTestId('advisor-login-submit').click();
  15 | 
  16 |     // Verify Advisor Dashboard is visible
> 17 |     await expect(page.getByTestId('advisor-dashboard-container')).toBeVisible({ timeout: 10000 });
     |                                                                   ^ Error: expect(locator).toBeVisible() failed
  18 | 
  19 |     // Verify Floor Leader nav is not present
  20 |     await expect(page.getByTestId('nav-floor-leader')).toHaveCount(0);
  21 | 
  22 |     // The absence of the navigation link satisfies the RBAC requirement for the UI.
  23 |   });
  24 | 
  25 |   test('Demo Snapshot flow, Audit Report generation, and Huddle Script', async ({ page }) => {
  26 |     // 1. Manager Login
  27 |     await page.goto('/');
  28 |     await page.getByTestId('persona-supervisor-btn').click();
  29 |     await page.getByTestId('keypad-1').click();
  30 |     await page.getByTestId('keypad-0').click();
  31 |     await page.getByTestId('keypad-2').click();
  32 |     await page.getByTestId('keypad-2').click();
  33 |     await expect(page.getByTestId('nav-dashboard')).toBeVisible({ timeout: 10000 });
  34 | 
  35 |     // 2. Navigate to Floor Leader
  36 |     await page.getByTestId('nav-floor-leader').click();
  37 |     
  38 |     // 3. Start a new shift
  39 |     await page.getByTestId('start-shift-btn').click();
  40 |     
  41 |     // Wait for the tabs to appear
  42 |     await expect(page.getByTestId('tab-audit')).toBeVisible({ timeout: 10000 });
  43 |     
  44 |     // 4. Click on Floor Audit Tab via evaluate to bypass strict actionability checks
  45 |     await page.evaluate(() => {
  46 |       const tab = document.querySelector('[data-testid="tab-audit"]');
  47 |       if (tab) tab.click();
  48 |     });
  49 |     
  50 |     // Intercept the Firebase function call to return a successful mock audit
  51 |     await page.route('**/auditStoreFloor', async route => {
  52 |       const json = {
  53 |         data: {
  54 |           status: 'Yellow',
  55 |           statusDetails: 'Visual merchandising gap observed in Computing display and moderate register queues.',
  56 |           observations: [
  57 |             'Computing laptop table has multiple devices out of line or with screen power turned off.',
  58 |             'Register checkout has a line of 3 customers waiting with only one cashier logged in.'
  59 |           ],
  60 |           actionPlan: [
  61 |             "Floor leader should call for a 'Code 1' support cashier to clear the register queue.",
  62 |             'Assign an advisor to Computing to inspect display cables and clean/tidy up the laptop table.'
  63 |           ]
  64 |         }
  65 |       };
  66 |       await route.fulfill({ json });
  67 |     });
  68 | 
  69 |     // 5. Load Demo Store Photo Snapshot
  70 |     await expect(page.getByTestId('demo-photo-btn')).toBeVisible({ timeout: 10000 });
  71 |     await page.getByTestId('demo-photo-btn').click();
  72 |     
  73 |     // 6. Run Audit
  74 |     await page.getByTestId('run-audit-btn').click();
  75 |     
  76 |     // Verify Audit Report Summary appears
  77 |     await expect(page.getByTestId('audit-report')).toBeVisible({ timeout: 20000 });
  78 |     
  79 |     // 7. Compile Huddle Script
  80 |     await page.getByTestId('generate-huddle-btn').click();
  81 |     
  82 |     // Verify Huddle Script Output appears
  83 |     await expect(page.getByTestId('huddle-script-output')).toBeVisible({ timeout: 10000 });
  84 |     
  85 |     // Verify the output has some text
  86 |     const scriptText = await page.getByTestId('huddle-script-output').inputValue();
  87 |     expect(scriptText).toContain('Live Leadership Huddle Script');
  88 |     expect(scriptText).toContain('Action Plan');
  89 |   });
  90 | 
  91 | });
  92 | 
```