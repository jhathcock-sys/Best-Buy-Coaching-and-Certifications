import { test, expect } from '@playwright/test';

test.describe('Rents Due Auditor', () => {

  // Helper to login and navigate to Rents Due
  const loginAndNavigateToRentsDue = async (page, pin) => {
    await page.goto('/');
    
    // Select Supervisor persona
    await page.getByTestId('persona-supervisor-btn').click();
    
    // Enter PIN
    for (const digit of pin.split('')) {
      await page.getByTestId(`keypad-${digit}`).click();
    }
    
    // Wait for Dashboard to mount
    await expect(page.getByTestId('nav-dashboard')).toBeVisible({ timeout: 10000 });
    
    // Navigate to Roster page
    await page.getByTestId('nav-roster').click();
    
    // Wait for Roster page
    await expect(page.getByTestId('store-roster-page')).toBeVisible({ timeout: 10000 });
    
    // Switch to Rents Due tab
    await page.getByTestId('tab-rentsDue').click();
    
    // Wait for Auditor to be visible
    await expect(page.getByTestId('rents-due-auditor')).toBeVisible({ timeout: 10000 });
  };

  test('Positive Path: Load demo dataset and sync metrics to roster', async ({ page }) => {
    await loginAndNavigateToRentsDue(page, '1022'); // Guest Admin PIN

    // Click try demo data button
    await page.getByTestId('try-demo-btn').click();

    // Verify the ledger appears (demo data takes 1.2s to load)
    const ledger = page.getByTestId('rents-due-ledger');
    await expect(ledger).toBeVisible({ timeout: 10000 });

    // Verify some text or rows exist in the ledger
    await expect(page.locator('text=Revenue Rent Owed')).toBeVisible();

    // Click Sync Metrics button
    await page.getByTestId('sync-metrics-btn').click();

    // Verify success toast appears
    await expect(page.getByTestId('sync-success-message')).toBeVisible({ timeout: 5000 });
  });

  test('Negative Path: Invalid file upload type shows error', async ({ page }) => {
    await loginAndNavigateToRentsDue(page, '1022');

    // Upload an unsupported file type, like PDF
    const fileInput = page.getByTestId('upload-input');
    
    // Use setInputFiles to simulate uploading a file
    await fileInput.setInputFiles({
      name: 'invalid.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('This is a fake PDF content'),
    });

    // Check that the error message is displayed
    const errorMessage = page.locator('text=Error: Please upload a valid CSV file');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('Negative Path: Navigating away during sync prevents state updates on unmounted component', async ({ page }) => {
    await loginAndNavigateToRentsDue(page, '1022');

    // Load demo dataset
    await page.getByTestId('try-demo-btn').click();
    await expect(page.getByTestId('rents-due-ledger')).toBeVisible({ timeout: 10000 });

    // Click Sync Metrics button
    await page.getByTestId('sync-metrics-btn').click();

    // IMMEDIATELY navigate away to Dashboard
    await page.getByTestId('nav-dashboard').click();

    // Verify Dashboard mounts successfully and no unhandled rejections crash the test
    await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 5000 });
  });

  test('Interactive Column Mapping UI: Shows when headers are unrecognized and successfully maps data', async ({ page }) => {
    await loginAndNavigateToRentsDue(page, '1022');

    // Paste weird CSV
    await page.getByTestId('paste-textarea').fill('ColA,ColB,ColC\nJohn,120,5');
    await page.getByTestId('parse-text-btn').click();

    // Verify Mapping UI appears
    await expect(page.locator('text=Column Mapping Required')).toBeVisible({ timeout: 5000 });

    // Select mappings
    await page.getByTestId('mapping-select-name').selectOption('ColA');
    await page.getByTestId('mapping-select-revenue').selectOption('ColB');

    // Confirm Mapping
    await page.getByTestId('confirm-mapping-btn').click();

    // Verify ledger appears with John
    const ledger = page.getByTestId('rents-due-ledger');
    await expect(ledger).toBeVisible({ timeout: 10000 });
    
    // John should be rendered in the table
    await expect(page.locator('text=John')).toBeVisible();
  });

  test('Multi-Persona: Real Manager can access and view Rents Due archives', async ({ page }) => {
    await loginAndNavigateToRentsDue(page, '2001'); // Corey T. (Real Manager)

    // Ensure they can see the Upload & Audit tab content
    await expect(page.getByTestId('upload-dropzone')).toBeVisible();

    // Switch to Archives tab
    await page.getByTestId('tab-archives').click();

    // We may not have archives in mock data, but the section should mount
    // "archives" section or "No Rents Due archives found for this store"
    await expect(page.getByTestId('archives-list')).toBeVisible({ timeout: 5000 });
  });

});
