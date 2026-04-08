import { test, expect } from '@playwright/test';

const ROLE_PRESET = ['raven', 'werewolf', 'villager', 'villager', 'villager', 'villager'];

test('day phase removes vote counting controls but keeps DM reminders and manual elimination', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Loup-Garous' })).toBeVisible();

  for (const [index, roleId] of ROLE_PRESET.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('night-phase')).toBeVisible();

  await page.getByTestId('night-next').click();
  const ravenSelect = page.locator('.night-input select').first();
  await ravenSelect.selectOption({ label: 'Player 2' });
  await page.getByTestId('night-next').click();

  await page.getByTestId('reveal-day').click();
  await expect(page.getByTestId('day-phase')).toBeVisible();

  await expect(page.locator('.vote-row')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Execute/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Reset Votes|Réinitialiser les votes/ })).toHaveCount(0);
  await expect(page.locator('.mayor-vote-select')).toHaveCount(0);

  await expect(page.getByText(/Raven curse: Player 2 has \+2 votes today\./)).toBeVisible();

  await page.getByRole('button', { name: '🎖️ Mayor' }).first().click();
  await expect(page.getByText(/Mayor reminder: Player 1 is still the Mayor at the table\./)).toBeVisible();

  await page.locator('.player-card').first().getByRole('button', { name: /Elim\./ }).click();
  await expect(page.locator('.player-card.dead')).toHaveCount(1);
});
