import { test, expect } from '@playwright/test';

const ROLE_SETUP = [
  'cupid',
  'wild_child',
  'werewolf',
  'big_bad_wolf',
  'villager',
  'infect_pere',
  'villager',
  'villager',
];

test('wolves and special roles cannot target themselves', async ({ page }) => {
  await page.goto('/');

  for (const [index, roleId] of ROLE_SETUP.entries()) {
    if (index >= 6) await page.getByTestId('add-role-slot').click();
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();

  // Wild Child no longer asks the GM to mark a role model
  const wildChildSelect = page.locator('.night-input:has-text("Wild Child secretly points") select');
  await expect(wildChildSelect).toHaveCount(0);

  await page.getByTestId('night-next').click();

  // Cupid no longer asks the GM to mark lovers
  const cupidRow = page.locator('.night-input:has-text("Cupid links these two lovers")');
  await expect(cupidRow).toHaveCount(0);

  await page.getByTestId('night-next').click();

  // Wolves no longer mark a victim in the app
  await expect(page.getByText(/Wolves choose their victim/i)).toHaveCount(0);

  await page.getByTestId('night-next').click();

  // Infect Père no longer asks the GM to mark an infected player
  await expect(page.getByText(/Infect instead of killing/i)).toHaveCount(0);
  await expect(page.getByText(/Do not infect/i)).toHaveCount(0);

  await page.getByTestId('night-next').click();

  // Big Bad Wolf no longer asks the GM to mark an extra victim
  await expect(page.getByText(/OPTIONAL extra victim/i)).toHaveCount(0);
  await expect(page.getByText(/Skip extra kill/i)).toHaveCount(0);
});
