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

test('fox preview highlights a standard werewolf inside the chosen trio', async ({ page }) => {
  await setupGame(
    page,
    ['werewolf', 'fox', 'villager', 'villager', 'villager', 'villager']
  );

  await page.getByTestId('night-next').click();

  await expect(page.getByTestId('fox-center-select')).toBeVisible();
  await page.getByTestId('fox-center-select').selectOption('p1');

  const preview = page.getByTestId('fox-trio-preview');
  await expect(preview).toBeVisible();
  await expect(preview.getByTestId('fox-trio-seat')).toHaveCount(3);
  await expect(preview.locator('.fox-trio-seat--wolf')).toHaveCount(1);
  await expect(preview.locator('.fox-trio-seat--wolf')).toContainText('#1 Werewolf');
  await expect(preview.getByTestId('fox-trio-seat-wolf')).toHaveCount(1);
  await expect(page.getByTestId('fox-result-summary')).toContainText('Wolf nearby');
});

test('fox loses power when the chosen trio contains no wolves and is skipped on later nights', async ({ page }) => {
  await setupGame(
    page,
    ['werewolf', 'fox', 'villager', 'villager', 'villager', 'villager']
  );

  await page.getByTestId('night-next').click();

  await page.getByTestId('fox-center-select').selectOption('p3');
  await expect(page.locator('.fox-trio-seat--wolf')).toHaveCount(0);
  await expect(page.getByTestId('fox-result-summary')).toContainText('No wolves');

  await page.getByTestId('night-next').click();
  await page.getByTestId('reveal-day').click();

  await expect(page.getByTestId('day-phase')).toContainText('Fox sniffing power: LOST');

  await page.getByRole('button', { name: /Start Night Phase/ }).click();
  await expect(page.getByTestId('night-phase')).toBeVisible();
  await page.getByTestId('night-next').click();
  await expect(page.getByRole('heading', { name: /Night ends/i })).toBeVisible();
});

test('fox preview treats White Werewolf as a wolf identity', async ({ page }) => {
  await setupGame(
    page,
    ['white_werewolf', 'villager', 'fox', 'villager', 'villager', 'werewolf']
  );

  await page.getByTestId('night-next').click();

  await page.getByTestId('fox-center-select').selectOption('p1');
  const wolfSeat = page.locator('.fox-trio-seat--wolf');
  await expect(wolfSeat).toHaveCount(1);
  await expect(wolfSeat).toContainText('#1 White Werewolf');
  await expect(page.getByTestId('fox-result-summary')).toContainText('Wolf nearby');
});
