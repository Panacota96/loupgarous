import { test, expect, type Page } from '@playwright/test';

const ROLE_PRESET = ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager'];

async function startDayOne(page: Page) {
  await page.goto('./');

  for (const [index, roleId] of ROLE_PRESET.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('night-phase')).toBeVisible();

  await page.getByTestId('night-next').click();
  await expect(page.getByRole('heading', { name: /Night ends/i })).toBeVisible();

  await page.getByTestId('reveal-day').click();
  await expect(page.getByTestId('day-phase')).toBeVisible();
}

test('day discussion timer can be adjusted during a game', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await startDayOne(page);

  await expect(page.getByTestId('timer-display')).toHaveText('03:00');
  await expect(page.getByTestId('timer-duration')).toHaveText('03:00');

  await page.getByTestId('timer-increase').click();
  await expect(page.getByTestId('timer-display')).toHaveText('03:30');
  await expect(page.getByTestId('timer-duration')).toHaveText('03:30');

  await page.getByTestId('timer-start').click();
  await page.getByTestId('timer-decrease').click();

  await expect(page.getByTestId('timer-pause')).toBeVisible();
  await expect(page.getByTestId('timer-duration')).toHaveText('03:00');

  expect(consoleErrors, 'console errors detected').toEqual([]);
});
