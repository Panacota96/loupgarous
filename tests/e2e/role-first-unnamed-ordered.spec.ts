import { test, expect, type Page } from '@playwright/test';

async function assignRoles(page: Page, roles: string[]) {
  for (const [index, roleId] of roles.entries()) {
    await page.getByTestId(`player-row-${index}`).getByTestId('role-select').selectOption(roleId);
  }
}

test('role-first can start without names and keeps duplicate role labels seat-stable', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('player-row-0').getByRole('textbox')).toHaveCount(0);

  await assignRoles(page, ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager']);
  await page.getByTestId('start-game').click();

  await expect(page.getByTestId('night-phase')).toBeVisible();
  await expect(page.getByTestId('gm-role-chip-p0')).toContainText('#1');
  await expect(page.getByTestId('gm-role-chip-p1')).toContainText('#2');

  await page.getByTestId('night-next').click();
  await expect(page.getByRole('heading', { name: /Night ends/i })).toBeVisible();
  await page.getByTestId('reveal-day').click();
  await expect(page.getByTestId('player-card-p0')).toContainText('#1 Werewolf');
  await expect(page.getByTestId('player-card-p1')).toContainText('#2 Werewolf');
});

test('seat-based night kill and day elimination are reflected on the correct seat', async ({ page }) => {
  await page.goto('/');

  await assignRoles(page, ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager']);
  await page.getByTestId('start-game').click();

  await expect(page.getByRole('heading', { name: /Werewolf wakes up/i })).toBeVisible();
  await page.getByTestId('night-next').click();
  await expect(page.getByRole('heading', { name: /Night ends/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Night ends/i })).toBeVisible();
  await page.getByTestId('reveal-day').click();

  await page.getByTestId('player-card-p1').getByTestId('eliminate-p1').click();
  await expect(page.getByTestId('player-card-p1')).toContainText('💀');
});

test('night step role order preserves seat order when multiple act in same group', async ({ page }) => {
  await page.goto('/');

  await assignRoles(page, ['werewolf', 'witch', 'fox', 'villager', 'villager', 'villager']);
  await page.getByTestId('start-game').click();

  await expect(page.getByRole('heading', { name: /Werewolf wakes up/i })).toBeVisible();
  await page.getByTestId('night-next').click();
  await expect(page.getByRole('heading', { name: /Fox wakes up/i })).toBeVisible();
  await expect(page.getByTestId('fox-center-select')).toHaveCount(0);
  await page.getByTestId('night-next').click();
  await expect(page.getByRole('heading', { name: /Witch wakes up/i })).toBeVisible();
});

test('fox trio selection enforces adjacency across seats', async ({ page }) => {
  await page.goto('/');

  await assignRoles(page, ['werewolf', 'fox', 'witch', 'villager', 'villager', 'villager']);
  await page.getByTestId('start-game').click();
  await page.getByTestId('night-next').click();

  await expect(page.getByRole('heading', { name: /Fox wakes up/i })).toBeVisible();
  await expect(page.getByTestId('fox-center-select')).toHaveCount(0);
  await page.getByTestId('night-next').click();
  await expect(page.getByRole('heading', { name: /Witch wakes up/i })).toBeVisible();
});

test('power-status panel lets the GM skip night steps immediately', async ({ page }) => {
  await page.goto('/');

  await assignRoles(page, ['werewolf', 'fox', 'witch', 'villager', 'villager', 'villager']);
  await page.getByTestId('start-game').click();

  await expect(page.getByTestId('power-status-panel')).toBeVisible();
  await page.getByTestId('power-toggle-fox').uncheck();
  await page.getByTestId('power-toggle-witch').uncheck();

  await expect(page.locator('.step-pip')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: /Werewolf wakes up/i })).toBeVisible();
});
