import { test, expect } from '@playwright/test';

test('protector marks the saved player for wolves and cannot repeat the same target next night', async ({ page }) => {
  const roles = ['protector', 'werewolf', 'big_bad_wolf', 'villager', 'villager', 'villager'];
  const names = ['Protector', 'Wolf A', 'Wolf B', 'Villager A', 'Villager B', 'Villager C'];

  await page.goto('/');

  for (const [index, roleId] of roles.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByRole('textbox').fill(names[index]);
    await row.getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();

  const protectorSelect = page.locator('.night-input:has-text("Protector shields this player tonight") select');
  await expect(protectorSelect).toBeVisible();
  await protectorSelect.selectOption({ label: 'Villager A' });
  await page.getByTestId('night-next').click();

  await expect(page.locator('.protected-banner')).toContainText('Protected tonight: Villager A');
  const wolvesSelect = page.locator('.night-input:has-text("Wolves choose their victim") select');
  await expect(wolvesSelect).toBeVisible();
  await expect(wolvesSelect.locator('option', { hasText: 'Villager A (Protected)' })).toBeDisabled();
  await wolvesSelect.selectOption({ label: 'Villager B' });
  await page.getByTestId('night-next').click();

  await expect(page.locator('.protected-banner')).toContainText('Protected tonight: Villager A');
  const bigBadSelect = page.locator('.night-input:has-text("OPTIONAL extra victim") select');
  await expect(bigBadSelect.locator('option', { hasText: 'Villager A (Protected)' })).toBeDisabled();
  await page.getByTestId('night-next').click();

  await page.getByTestId('reveal-day').click();
  await expect(page.getByTestId('day-phase')).toBeVisible();
  await page.getByRole('button', { name: /Start Night Phase/ }).click();

  const nightTwoProtectorSelect = page.locator('.night-input:has-text("Protector shields this player tonight") select');
  await expect(page.locator('.night-input')).toContainText('Last protection');
  const options = await nightTwoProtectorSelect.locator('option').allTextContents();
  expect(options.some((opt) => opt.includes('Villager A'))).toBeFalsy();
});

test('lovers still die together at night even when one lover was protected', async ({ page }) => {
  const roles = ['cupid', 'protector', 'werewolf', 'big_bad_wolf', 'villager', 'villager'];
  const names = ['Cupid', 'Protector', 'Wolf A', 'Wolf B', 'Lover A', 'Lover B'];

  await page.goto('/');

  for (const [index, roleId] of roles.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByRole('textbox').fill(names[index]);
    await row.getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();

  const cupidRow = page.locator('.night-input:has-text("Cupid links these two lovers")');
  await cupidRow.locator('select').nth(0).selectOption({ label: 'Lover A' });
  await cupidRow.locator('select').nth(1).selectOption({ label: 'Lover B' });
  await page.getByTestId('night-next').click();

  const protectorSelect = page.locator('.night-input:has-text("Protector shields this player tonight") select');
  await protectorSelect.selectOption({ label: 'Lover A' });
  await page.getByTestId('night-next').click();

  const wolvesSelect = page.locator('.night-input:has-text("Wolves choose their victim") select');
  await expect(page.locator('.protected-banner')).toContainText('Protected tonight: Lover A');
  await expect(wolvesSelect.locator('option', { hasText: 'Lover A (Protected)' })).toBeDisabled();
  await wolvesSelect.selectOption({ label: 'Lover B' });
  await page.getByTestId('night-next').click();

  const bigBadSelect = page.locator('.night-input:has-text("OPTIONAL extra victim") select');
  await expect(bigBadSelect.locator('option', { hasText: 'Lover A (Protected)' })).toBeDisabled();
  await page.getByTestId('night-next').click();

  await expect(page.getByRole('heading', { name: /Night ends/i })).toBeVisible();
  const summary = page.locator('.night-summary');
  await expect(summary).toContainText('Lover A');
  await expect(summary).toContainText('Lover B');

  await page.getByTestId('reveal-day').click();
  await expect(page.getByRole('heading', { name: /Werewolves Win!/i })).toBeVisible();
  await expect(page.locator('.alive-chip')).toContainText('4 alive');
});
