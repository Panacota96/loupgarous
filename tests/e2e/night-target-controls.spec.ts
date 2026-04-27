import { test, expect } from '@playwright/test';

test('seer witch and pied piper avoid player target dropdowns at night', async ({ page }) => {
  const roles = ['werewolf', 'seer', 'witch', 'pied_piper', 'villager', 'villager'];

  await page.goto('/');

  for (const [index, roleId] of roles.entries()) {
    await page.getByTestId(`player-row-${index}`).getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();

  await page.getByTestId('night-next').click();

  await expect(page.getByRole('heading', { name: /Seer wakes up/i })).toBeVisible();
  await expect(page.getByText(/Seer looks at player/i)).toHaveCount(0);
  await expect(page.locator('.night-input select')).toHaveCount(0);

  await page.getByTestId('night-next').click();

  await expect(page.getByRole('heading', { name: /Witch wakes up/i })).toBeVisible();
  const witchDeath = page
    .locator('.witch-option')
    .filter({ hasText: /Use Death Potion/i })
    .getByRole('checkbox');
  await expect(witchDeath).toBeVisible();
  await expect(page.locator('.night-input select')).toHaveCount(0);
  await witchDeath.check();
  await expect(witchDeath).toBeChecked();

  await page.getByTestId('night-next').click();

  await expect(page.getByRole('heading', { name: /Pied Piper wakes up/i })).toBeVisible();
  await expect(page.getByText(/Pied Piper enchants 2 players/i)).toHaveCount(0);
  await expect(page.getByText(/Player 1/i)).toHaveCount(0);
  await expect(page.getByText(/Player 2/i)).toHaveCount(0);
  await expect(page.locator('.night-input select')).toHaveCount(0);
});
