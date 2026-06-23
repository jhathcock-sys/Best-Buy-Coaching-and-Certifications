---
name: playwright-authoring
description: Strict guidelines and rules for writing Playwright End-to-End tests in this application. Forbids waitForTimeout and mandates data-testid locators.
---

# Playwright Authoring Guidelines

Whenever you are tasked with writing, modifying, or fixing Playwright End-to-End (E2E) tests, you MUST strictly adhere to the following rules to ensure CI/CD pipeline stability.

## 1. The Golden Rule: NO waitForTimeout
You are strictly forbidden from using `await page.waitForTimeout(...)`. Artificial delays cause flaky tests and significantly slow down CI execution. 
**Instead**: Assert against the state of the DOM. Wait for elements to appear, disappear, or achieve a specific class.

**BAD:**
```javascript
await page.click('button.submit');
await page.waitForTimeout(2000); // VETO!
await expect(page.locator('.success')).toBeVisible();
```

**GOOD:**
```javascript
await page.click('button.submit');
await expect(page.getByTestId('success-message')).toBeVisible({ timeout: 5000 });
```

## 2. Locators: Mandate data-testid
Do not use CSS classes (e.g., `.btn-primary`) or XPath to locate elements, as they are highly susceptible to visual redesigns. 
- You MUST use `page.getByTestId('your-test-id')`.
- If an element does not have a `data-testid`, your first step must be to open the React component and add one before writing the test.

## 3. Authentication Mocks
Do not hack `sessionStorage` or `localStorage` to bypass login screens. The application relies on complex Firebase hydration that breaks when storage is manually manipulated. 
- You must perform an actual UI-driven login using the target test credentials by locating the login form and executing `page.fill()` and `page.click()`.

## 4. Routing Assertions
When verifying that navigation was successful, do not just check the URL. Check that the target page's primary container has successfully mounted.
```javascript
await page.getByTestId('nav-dashboard').click();
await expect(page.getByTestId('dashboard-container')).toBeVisible();
```
