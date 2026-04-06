import { test, expect } from '@playwright/test';

const ROLE_SETUP = ['cupid', 'wild_child', 'werewolf', 'big_bad_wolf', 'villager', 'villager'];
const NAME_SETUP = ['Cupid', 'Wild Child', 'Wolf A', 'Wolf B', 'Villager A', 'Villager B'];

test('wolves and special roles cannot target themselves', async ({ page }) => {
  await page.goto('/');

  for (const [index, roleId] of ROLE_SETUP.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByRole('textbox').fill(NAME_SETUP[index]);
    await row.getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();

  // Wild Child cannot pick themselves as model
  const wildChildSelect = page.locator('.night-input:has-text("Wild Child secretly points") select');
  await expect(wildChildSelect).toBeVisible();
  const wildChildOptions = await wildChildSelect.locator('option').allTextContents();
  expect(wildChildOptions.some((opt) => opt.includes('Wild Child'))).toBeFalsy();

  await page.getByTestId('night-next').click();

  // Cupid cannot link themselves as a lover
  const cupidRow = page.locator('.night-input:has-text("Cupid links these two lovers")');
  await expect(cupidRow).toBeVisible();
  for (const i of [0, 1]) {
    const options = await cupidRow.locator('select').nth(i).locator('option').allTextContents();
    expect(options.some((opt) => opt.includes('Cupid'))).toBeFalsy();
  }

  await page.getByTestId('night-next').click();

  // Wolves cannot target other wolves (or themselves)
  const wolvesSelect = page.locator('.night-input:has-text("Wolves choose their victim") select');
  await expect(wolvesSelect).toBeVisible();
  const wolfOptions = await wolvesSelect.locator('option').allTextContents();
  expect(wolfOptions.some((opt) => opt.includes('Wolf A'))).toBeFalsy();
  expect(wolfOptions.some((opt) => opt.includes('Wolf B'))).toBeFalsy();

  await page.getByTestId('night-next').click();

  // Big Bad Wolf extra kill cannot target wolves
  const bigBadSelect = page.locator('.night-input:has-text("OPTIONAL extra victim") select');
  await expect(bigBadSelect).toBeVisible();
  const bigBadOptions = await bigBadSelect.locator('option').allTextContents();
  expect(bigBadOptions.some((opt) => opt.includes('Wolf A'))).toBeFalsy();
  expect(bigBadOptions.some((opt) => opt.includes('Wolf B'))).toBeFalsy();
});
