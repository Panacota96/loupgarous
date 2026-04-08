import { test, expect } from '@playwright/test';

test('language switch toggles UI text and persists across reloads', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('./');

  // Default language is English
  await expect(page.getByText('Game Master Assistant')).toBeVisible();

  // Switch to French and verify UI strings change
  await page.getByRole('button', { name: 'FR' }).click();
  await expect(page.getByText('Assistant Maître du Jeu')).toBeVisible();
  await expect(page.getByTestId('start-game')).toHaveText(/Lancer la partie/i);

  const roleSelect = page.getByTestId('player-row-0').getByTestId('role-select');
  await expect(roleSelect.locator('option').first()).not.toContainText('/');
  await roleSelect.selectOption('werewolf');

  // Reload and ensure French persists
  await page.reload();
  await expect(page.getByText('Assistant Maître du Jeu')).toBeVisible();
  await page.getByTestId('player-row-0').getByTestId('role-select').selectOption('werewolf');
  await page.getByTestId('start-game').click();

  // In-game UI also uses French
  await expect(page.getByTestId('night-phase')).toBeVisible();
  await expect(page.locator('.phase-chip')).toContainText('Nuit');

  expect(consoleErrors, 'console errors detected').toEqual([]);
});
