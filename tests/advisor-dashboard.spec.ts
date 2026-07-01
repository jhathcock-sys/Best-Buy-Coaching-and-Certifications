import { test, expect } from '@playwright/test';

test.describe('Advisor Experience Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');



    // Select Advisor persona
    await page.getByTestId('persona-advisor-btn').click();

    // Fill Advisor Login
    await page.getByTestId('advisor-store-input').fill('1480');
    await page.getByTestId('advisor-id-input').fill('yinel');
    await page.getByTestId('advisor-login-submit').click();

    // Check for login error before asserting navigation
    const errorMsg = page.locator('.text-error');
    if (await errorMsg.isVisible()) {
        console.error('LOGIN ERROR:', await errorMsg.textContent());
    }

    // Assert successful navigation by looking for the dashboard container
    await expect(page.getByTestId('advisor-dashboard-container')).toBeVisible({ timeout: 5000 });
  });

  test('Daily Quests widget renders and tracks progress correctly', async ({ page }) => {
    const dailyQuestsWidget = page.getByTestId('daily-quests-widget');
    await expect(dailyQuestsWidget).toBeVisible();

    const questItems = dailyQuestsWidget.getByTestId('quest-item');
    await expect(questItems).toHaveCount(3);
    
    const firstQuest = questItems.nth(0);
    await expect(firstQuest).toBeVisible();
    await expect(firstQuest).toContainText('Complete an AI Roleplay');
  });

  test('Advisor Leaderboard renders champions correctly', async ({ page }) => {
    const leaderboard = page.getByTestId('advisor-leaderboard');
    await expect(leaderboard).toBeVisible();

    const noChampionsMsg = leaderboard.getByTestId('no-champions-message');
    const championCards = leaderboard.getByTestId('champion-card');

    if (await noChampionsMsg.isVisible()) {
      await expect(noChampionsMsg).toContainText('No champions this period');
    } else {
      const count = await championCards.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(3);
    }
  });

  test('Trophy Case renders with empty or populated state', async ({ page }) => {
    const trophyCase = page.getByTestId('trophy-case-widget');
    await expect(trophyCase).toBeVisible();

    const noTrophiesMsg = trophyCase.getByTestId('no-trophies-message');
    const trophyItems = trophyCase.getByTestId('trophy-item');

    if (await noTrophiesMsg.isVisible()) {
      await expect(noTrophiesMsg).toContainText('No trophies yet');
    } else {
      await expect(trophyItems.first()).toBeVisible();
    }
  });
});
