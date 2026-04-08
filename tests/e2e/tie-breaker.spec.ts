import { test, expect, type Page } from '@playwright/test';

const PLAYERS = [
  { name: 'Alice', roleId: 'werewolf' },
  { name: 'Bob', roleId: 'werewolf' },
  { name: 'Charlie', roleId: 'villager' },
  { name: 'Diana', roleId: 'villager' },
  { name: 'Eve', roleId: 'villager' },
  { name: 'Frank', roleId: 'villager' },
];

async function setupDayPhase(page: Page) {
  await page.goto('/');

  for (const [index, player] of PLAYERS.entries()) {
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

function voteRow(page: Page, playerName: string) {
  return page.locator('.vote-row').filter({ hasText: playerName });
}

test('tie-breaker auto-selects only tied players and waits for confirmation', async ({ page }) => {
  await setupDayPhase(page);

  await voteRow(page, 'Alice').getByRole('button', { name: '+' }).click();
  await voteRow(page, 'Bob').getByRole('button', { name: '+' }).click();

  await expect(page.locator('.tie-warning')).toContainText('Alice');
  await expect(page.locator('.tie-warning')).toContainText('Bob');

  await page.evaluate(() => {
    Math.random = () => 0.75;
  });

  await page.getByRole('button', { name: /Tie-Breaker/ }).click();

  const panel = page.getByTestId('tie-breaker-panel');
  await expect(panel).toBeVisible();
  await expect(panel.locator('input[type="checkbox"]')).toHaveCount(0);
  await expect(panel.getByRole('button', { name: /Random Pick/ })).toHaveCount(0);
  await expect(panel).toContainText('Alice');
  await expect(panel).toContainText('Bob');

  const result = page.getByTestId('tie-breaker-result');
  await expect(result).toContainText('Bob');

  await page.getByRole('button', { name: /Confirm Elimination/ }).click();

  await expect(page.getByTestId('tie-breaker-panel')).toHaveCount(0);
  await expect(page.locator('.player-card.dead').filter({ hasText: 'Bob' })).toBeVisible();
});

test('tie-breaker closes if the tied set changes after opening', async ({ page }) => {
  await setupDayPhase(page);

  await voteRow(page, 'Alice').getByRole('button', { name: '+' }).click();
  await voteRow(page, 'Bob').getByRole('button', { name: '+' }).click();

  await page.evaluate(() => {
    Math.random = () => 0.1;
  });

  await page.getByRole('button', { name: /Tie-Breaker/ }).click();
  await expect(page.getByTestId('tie-breaker-panel')).toBeVisible();

  await voteRow(page, 'Charlie').getByRole('button', { name: '+' }).click();

  await expect(page.getByTestId('tie-breaker-panel')).toHaveCount(0);
});
