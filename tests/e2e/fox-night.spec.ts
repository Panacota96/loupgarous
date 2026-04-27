import { test, expect, type Page } from '@playwright/test';

async function setupGame(page: Page, roles: string[]) {
  await page.goto('/');

  for (const [index, roleId] of roles.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('night-phase')).toBeVisible();
}

test('fox night step no longer asks the GM to choose a trio', async ({ page }) => {
  await setupGame(
    page,
    ['werewolf', 'fox', 'villager', 'villager', 'villager', 'villager']
  );

  await page.getByTestId('night-next').click();

  await expect(page.getByRole('heading', { name: /Fox wakes up/i })).toBeVisible();
  await expect(page.getByTestId('fox-center-select')).toHaveCount(0);
  await expect(page.getByTestId('fox-trio-preview')).toHaveCount(0);
  await expect(page.getByTestId('fox-result-summary')).toHaveCount(0);
  await expect(page.getByText(/Center seat of the trio/i)).toHaveCount(0);
  await expect(page.getByText(/Result of tonight/i)).toHaveCount(0);
});

test('fox stays active unless the GM disables the power manually', async ({ page }) => {
  await setupGame(
    page,
    ['werewolf', 'fox', 'villager', 'villager', 'villager', 'villager']
  );

  await page.getByTestId('night-next').click();
  await page.getByTestId('night-next').click();
  await page.getByTestId('reveal-day').click();

  await expect(page.getByTestId('day-phase')).toContainText('Fox sniffing power: ACTIVE');

  await page.getByRole('button', { name: /Start Night Phase/ }).click();
  await page.getByTestId('night-next').click();
  await expect(page.getByRole('heading', { name: /Fox wakes up/i })).toBeVisible();
});

test('manual fox power override skips future Fox wake-ups', async ({ page }) => {
  await setupGame(
    page,
    ['werewolf', 'fox', 'villager', 'villager', 'villager', 'villager']
  );

  await page.getByTestId('power-toggle-fox').uncheck();

  await page.getByTestId('night-next').click();
  await expect(page.getByRole('heading', { name: /Night ends/i })).toBeVisible();
  await expect(page.getByText(/Fox wakes up/i)).toHaveCount(0);
});
