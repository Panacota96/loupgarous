import { test, expect } from '@playwright/test';

test('protector no longer marks a saved player in the app', async ({ page }) => {
  const roles = ['protector', 'werewolf', 'big_bad_wolf', 'villager', 'villager', 'villager'];

  await page.goto('/');

  for (const [index, roleId] of roles.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();

  const protectorSelect = page.locator('.night-input:has-text("Protector shields this player tonight") select');
  await expect(protectorSelect).toHaveCount(0);
  await page.getByTestId('night-next').click();

  await expect(page.getByText(/Wolves choose their victim/i)).toHaveCount(0);
  await page.getByTestId('night-next').click();

  await expect(page.locator('.protected-banner')).toHaveCount(0);
  await expect(page.getByText(/OPTIONAL extra victim/i)).toHaveCount(0);
  await expect(page.getByText(/Skip extra kill/i)).toHaveCount(0);
  await page.getByTestId('night-next').click();

  await page.getByTestId('reveal-day').click();
  await expect(page.getByTestId('day-phase')).toBeVisible();
  await expect(page.locator('.alive-chip')).toContainText('6 alive');
  await page.getByRole('button', { name: /Start Night Phase/ }).click();

  const nightTwoProtectorSelect = page.locator('.night-input:has-text("Protector shields this player tonight") select');
  await expect(nightTwoProtectorSelect).toHaveCount(0);
  await expect(page.getByText('Last protection')).toHaveCount(0);
});

test('cupid no longer marks lovers before protector flow', async ({ page }) => {
  const roles = ['cupid', 'protector', 'werewolf', 'big_bad_wolf', 'villager', 'villager'];

  await page.goto('/');

  for (const [index, roleId] of roles.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();

  await expect(page.locator('.night-input:has-text("Cupid links these two lovers")')).toHaveCount(0);
  await page.getByTestId('night-next').click();

  const protectorSelect = page.locator('.night-input:has-text("Protector shields this player tonight") select');
  await expect(protectorSelect).toHaveCount(0);
  await page.getByTestId('night-next').click();

  await expect(page.getByText(/Wolves choose their victim/i)).toHaveCount(0);
  await page.getByTestId('night-next').click();

  await expect(page.locator('.protected-banner')).toHaveCount(0);
  await expect(page.getByText(/OPTIONAL extra victim/i)).toHaveCount(0);
  await expect(page.getByText(/Skip extra kill/i)).toHaveCount(0);
  await page.getByTestId('night-next').click();

  await expect(page.getByRole('heading', { name: /Night ends/i })).toBeVisible();
  const summary = page.locator('.night-summary');
  await expect(summary).toContainText('No one was eliminated tonight.');
  await expect(summary).not.toContainText('#6 Villager');
  await expect(summary).not.toContainText('#5 Villager');

  await page.getByTestId('reveal-day').click();
  await expect(page.getByTestId('day-phase')).toBeVisible();
  await expect(page.locator('.alive-chip')).toContainText('6 alive');
});
