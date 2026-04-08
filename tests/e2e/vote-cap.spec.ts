import { test, expect } from '@playwright/test';

const ROLE_PRESET = ['raven', 'werewolf', 'villager', 'villager', 'villager', 'villager'];

test('day vote totals cap at alive count plus mayor/raven bonuses', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Loup-Garous' })).toBeVisible();

  for (const [index, roleId] of ROLE_PRESET.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('night-phase')).toBeVisible();

  // Werewolves skip a kill, Raven curses Player 2
  await page.getByTestId('night-next').click();
  const ravenSelect = page.locator('.night-input select').first();
  await ravenSelect.selectOption({ label: 'Player 2' });
  await page.getByTestId('night-next').click();

  await page.getByTestId('reveal-day').click();
  await expect(page.getByTestId('day-phase')).toBeVisible();

  // Elect Player 1 as Mayor and have them vote against Player 2 (also Raven-cursed)
  await page.getByRole('button', { name: '🎖️ Mayor' }).first().click();
  await expect(page.locator('.mayor-vote-select')).toBeVisible();
  await page.locator('.mayor-vote-select').selectOption({ label: 'Player 2' });

  const cursedRow = page.locator('.vote-row', { hasText: 'Player 2' });
  const cursedPlus = cursedRow.getByRole('button', { name: '+' });
  const cursedCount = cursedRow.locator('.vote-count');
  for (let i = 0; i < 6; i++) await cursedPlus.click();
  await expect(cursedCount).toHaveText('9');
  await expect(cursedPlus).toBeDisabled();

  const plainRow = page.locator('.vote-row', { hasText: 'Player 3' });
  const plainPlus = plainRow.getByRole('button', { name: '+' });
  const plainCount = plainRow.locator('.vote-count');
  for (let i = 0; i < 6; i++) await plainPlus.click();
  await expect(plainCount).toHaveText('6');
  await expect(plainPlus).toBeDisabled();
});
