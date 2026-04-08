import { test, expect } from '@playwright/test';

const ROLE_PRESET = ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager'];

test('mobile gameboard collapses extra tabs into conf menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  for (const [index, roleId] of ROLE_PRESET.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('night-phase')).toBeVisible();

  await expect(page.getByTestId('gameboard-tab-game')).toBeVisible();
  await expect(page.getByTestId('gameboard-tab-conf')).toBeVisible();
  await expect(page.getByTestId('gameboard-tab-roles')).not.toBeVisible();
  await expect(page.getByTestId('gameboard-tab-log')).not.toBeVisible();

  await page.getByTestId('gameboard-tab-conf').click();
  await expect(page.getByTestId('gameboard-conf-menu')).toBeVisible();

  await page.getByTestId('gameboard-conf-roles').click();
  await expect(page.getByRole('heading', { name: /Role Reference/i })).toBeVisible();

  await page.getByTestId('gameboard-tab-game').click();
  await expect(page.getByTestId('night-phase')).toBeVisible();

  await page.getByTestId('gameboard-tab-conf').click();
  await page.getByTestId('gameboard-conf-log').click();
  await expect(page.getByRole('heading', { name: /Game Log/i })).toBeVisible();
});
