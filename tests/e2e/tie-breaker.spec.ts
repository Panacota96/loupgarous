import { test, expect, type Page } from '@playwright/test';

const BASE_PLAYERS = [
  { name: 'Alice', roleId: 'werewolf' },
  { name: 'Bob', roleId: 'werewolf' },
  { name: 'Charlie', roleId: 'villager' },
  { name: 'Diana', roleId: 'villager' },
  { name: 'Eve', roleId: 'villager' },
  { name: 'Frank', roleId: 'villager' },
];

async function setupDayPhase(page: Page, players = BASE_PLAYERS) {
  await page.goto('/');

  for (const [index, player] of players.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByRole('textbox').fill(player.name);
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

  await panel.getByRole('button', { name: 'Alice' }).click();
  await panel.getByRole('button', { name: 'Bob' }).click();

  await page.evaluate(() => {
    Math.random = () => 0.75;
  });

  await page.getByTestId('tie-resolution-resolve').click();

  const tieBreakerPanel = page.getByTestId('tie-breaker-panel');
  await expect(tieBreakerPanel).toBeVisible();
  await expect(tieBreakerPanel).toContainText('Alice');
  await expect(tieBreakerPanel).toContainText('Bob');
  await expect(tieBreakerPanel).not.toContainText('Charlie');
  await expect(page.getByTestId('tie-breaker-result')).toContainText('Bob');

  await page.getByRole('button', { name: /Confirm Elimination/ }).click();
  await expect(page.locator('.player-card.dead').filter({ hasText: 'Bob' })).toBeVisible();
});

test('manual tie flow eliminates the Scapegoat automatically when present', async ({ page }) => {
  await setupDayPhase(page, [
    { name: 'Alice', roleId: 'werewolf' },
    { name: 'Bob', roleId: 'villager' },
    { name: 'Charlie', roleId: 'scapegoat' },
    { name: 'Diana', roleId: 'villager' },
    { name: 'Eve', roleId: 'villager' },
    { name: 'Frank', roleId: 'villager' },
  ]);

  await page.getByTestId('tie-resolution-start').click();
  const panel = page.getByTestId('tie-resolution-panel');
  await panel.getByRole('button', { name: 'Alice' }).click();
  await panel.getByRole('button', { name: 'Bob' }).click();
  await page.getByTestId('tie-resolution-resolve').click();

  await expect(page.getByTestId('scapegoat-resolution')).toContainText('Charlie');
  await expect(page.getByTestId('tie-breaker-panel')).toHaveCount(0);

  await page.getByRole('button', { name: /Eliminate Charlie/ }).click();
  await expect(page.locator('.player-card.dead').filter({ hasText: 'Charlie' })).toBeVisible();

  await page.getByTestId('gameboard-tab-log').click();
  await expect(page.getByText(/Scapegoat: Charlie was eliminated because the village vote ended in a tie\./)).toBeVisible();
});
