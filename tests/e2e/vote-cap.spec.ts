import { test, expect, type Page } from '@playwright/test';

const ROLE_PRESET = ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager'];

async function setupDayPhase(page: Page, roles = ROLE_PRESET) {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Loup-Garous' })).toBeVisible();

  for (const [index, roleId] of roles.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('night-phase')).toBeVisible();

  await page.getByTestId('night-next').click();

  await page.getByTestId('reveal-day').click();
  await expect(page.getByTestId('day-phase')).toBeVisible();
}

test('day phase removes vote counting controls but keeps DM reminders and manual elimination', async ({ page }) => {
  await setupDayPhase(page);

  await expect(page.locator('.vote-row')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Execute/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Reset Votes|Réinitialiser les votes/ })).toHaveCount(0);
  await expect(page.locator('.mayor-vote-select')).toHaveCount(0);
  await expect(page.getByTestId('elect-mayor-p0')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '🎖️ Mayor' })).toHaveCount(0);

  await page.getByTestId('eliminate-p0').click();
  await expect(page.getByTestId('player-card-p0')).toHaveCount(0);
  await expect(page.getByTestId('gm-role-chip-p0')).toHaveCount(0);
  await expect(page.locator('.player-card')).toHaveCount(5);
  await expect(page.locator('.gm-role-chip')).toHaveCount(5);
  await expect(page.locator('.player-card.dead')).toHaveCount(0);
  await expect(page.getByTestId('recent-eliminations')).toContainText('#1 Werewolf');

  await page.getByTestId('undo-pending-elimination').click();
  await expect(page.getByTestId('recent-eliminations')).toHaveCount(0);
  await expect(page.getByTestId('player-card-p0')).toBeVisible();
  await expect(page.getByTestId('gm-role-chip-p0')).toBeVisible();
  await expect(page.locator('.player-card')).toHaveCount(6);
  await expect(page.locator('.gm-role-chip')).toHaveCount(6);

  await page.getByTestId('eliminate-p0').click();
  await page.getByRole('button', { name: /Start Night Phase/ }).click();
  await expect(page.getByTestId('night-phase')).toBeVisible();

  await page.getByTestId('gameboard-tab-log').click();
  await expect(page.locator('.game-log')).toContainText('Day 1: #1 Werewolf eliminated.');
});

test('undo restores first-day Angel conversion state', async ({ page }) => {
  await setupDayPhase(page, ['werewolf', 'angel', 'villager', 'villager', 'villager', 'villager']);

  await expect(page.getByTestId('player-card-p1')).toContainText('#2 Angel');

  await page.getByTestId('eliminate-p2').click();
  await expect(page.getByTestId('player-card-p2')).toHaveCount(0);
  await expect(page.getByTestId('player-card-p1')).toContainText('#2 Villager');

  await page.getByTestId('undo-pending-elimination').click();
  await expect(page.getByTestId('player-card-p2')).toBeVisible();
  await expect(page.getByTestId('player-card-p1')).toContainText('#2 Angel');

  await page.getByTestId('eliminate-p1').click();
  await expect(page.getByRole('heading', { name: 'It looks like the Angel has won.' })).toBeVisible();
});
