import { test, expect, type Page } from '@playwright/test';

const BASE_PLAYERS = [
  { roleId: 'werewolf' },
  { roleId: 'werewolf' },
  { roleId: 'villager' },
  { roleId: 'villager' },
  { roleId: 'villager' },
  { roleId: 'villager' },
];

async function setupDayPhase(page: Page, players = BASE_PLAYERS) {
  await page.goto('/');

  for (const [index, player] of players.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByTestId('role-select').selectOption(player.roleId);
  }

  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('night-phase')).toBeVisible();

  await page.getByTestId('night-next').click();
  await expect(page.getByRole('heading', { name: /Night ends/i })).toBeVisible();

  await page.getByTestId('reveal-day').click();
  await expect(page.getByTestId('day-phase')).toBeVisible();
}

test('manual tie flow requires at least two players and resolves through the tie-breaker', async ({ page }) => {
  await setupDayPhase(page);

  await page.getByTestId('tie-resolution-start').click();
  const panel = page.getByTestId('tie-resolution-panel');

  await page.getByTestId('tie-resolution-resolve').click();
  await expect(page.getByTestId('tie-resolution-error')).toContainText('Select at least 2 tied players');

  await panel.getByTestId('tie-player-p0').click();
  await panel.getByTestId('tie-player-p1').click();

  await page.getByTestId('tie-resolution-resolve').click();

  const tieBreakerPanel = page.getByTestId('tie-breaker-panel');
  await expect(tieBreakerPanel).toBeVisible();
  await expect(tieBreakerPanel).toContainText('#1 Werewolf');
  await expect(tieBreakerPanel).toContainText('#2 Werewolf');
  await expect(tieBreakerPanel).not.toContainText('#3 Villager');
  await expect(page.getByTestId('tie-breaker-result')).toContainText('Select one tied player');
  await expect(page.getByRole('button', { name: /Confirm Elimination/ })).toBeDisabled();

  await page.getByTestId('tie-breaker-player-p1').click();
  await expect(page.getByTestId('tie-breaker-result')).toContainText('#2 Werewolf');

  await page.getByRole('button', { name: /Confirm Elimination/ }).click();
  await expect(page.getByTestId('player-card-p1')).toHaveClass(/dead/);
});

