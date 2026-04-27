import { test, expect } from '@playwright/test';

test('role-first setup uses ordered seats and seat labels', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('player-row-0').getByRole('textbox')).toHaveCount(0);

  await page.getByTestId('player-row-0').getByTestId('role-select').selectOption('werewolf');
  await page.getByTestId('player-row-1').getByTestId('role-select').selectOption('fox');
  await page.getByTestId('player-row-2').getByTestId('role-select').selectOption('witch');

  await page.getByTestId('player-row-3').getByTestId('role-select').selectOption('cupid');
  await expect(page.getByTestId('player-row-3').getByTestId('role-select')).toContainText('Cupid');
  await expect(page.getByTestId('player-row-4').getByTestId('role-select')).not.toContainText('Cupid');
  await page.getByTestId('player-row-3').getByTestId('role-select').selectOption('villager');
  await expect(page.getByTestId('player-row-4').getByTestId('role-select')).toContainText('Cupid');

  await expect(page.getByTestId('table-preview')).toHaveCount(0);

  await page.getByTestId('move-seat-down-1').click();
  await expect(page.getByTestId('player-row-2').getByTestId('role-select')).toHaveValue('fox');
  await expect(page.getByTestId('player-row-2')).toContainText('#3');
  await expect(page.getByTestId('player-row-2')).toContainText('Fox');

  await page.getByTestId('add-role-slot').click();
  await expect(page.getByTestId('player-row-6')).toBeVisible();
  await page.getByTestId('remove-seat-6').click();
  await expect(page.getByTestId('player-row-6')).toHaveCount(0);

  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('night-phase')).toBeVisible();
  await page.getByTestId('night-next').click();
  await page.getByTestId('night-next').click();
  await page.getByTestId('night-next').click();
  await page.getByTestId('reveal-day').click();
  await expect(page.getByTestId('player-card-p0')).toContainText('#1 Werewolf');
});

test('manual power override removes a role from the current night steps', async ({ page }) => {
  await page.goto('/');

  const roles = ['werewolf', 'fox', 'witch', 'villager', 'villager', 'villager'];
  for (const [index, roleId] of roles.entries()) {
    await page.getByTestId(`player-row-${index}`).getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();
  await expect(page.getByTestId('power-status-panel')).toBeVisible();

  await page.getByTestId('power-toggle-fox').uncheck();
  await expect(page.locator('.step-pip')).toHaveCount(2);

  await page.getByTestId('night-next').click();
  await expect(page.getByText(/Fox wakes up/i)).toHaveCount(0);
  await expect(page.getByText(/Witch wakes up/i)).toBeVisible();
});

test('manual power override keeps previous night steps reachable', async ({ page }) => {
  await page.goto('/');

  const roles = ['werewolf', 'fox', 'witch', 'villager', 'villager', 'villager'];
  for (const [index, roleId] of roles.entries()) {
    await page.getByTestId(`player-row-${index}`).getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();
  await page.getByTestId('night-next').click();
  await expect(page.getByRole('heading', { name: /Fox wakes up/i })).toBeVisible();

  await page.getByTestId('power-toggle-witch').uncheck();
  await page.locator('.step-pip.clickable').first().click();

  await expect(page.getByRole('heading', { name: /Werewolf wakes up/i })).toBeVisible();
});

test('role pools cap wolves at three and hide removed roles', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('player-row-0').getByTestId('role-select').selectOption('werewolf');
  await page.getByTestId('player-row-1').getByTestId('role-select').selectOption('werewolf');
  await page.getByTestId('player-row-2').getByTestId('role-select').selectOption('werewolf');

  await expect(page.getByTestId('player-row-2').locator('option[value="werewolf"]')).toHaveCount(1);
  await expect(page.getByTestId('player-row-3').locator('option[value="werewolf"]')).toHaveCount(0);

  for (const removedRoleId of ['raven', 'village_idiot', 'scapegoat']) {
    await expect(page.getByTestId('player-row-3').locator(`option[value="${removedRoleId}"]`)).toHaveCount(0);
  }

  await page.getByTestId('setup-tab-roles').click();
  await expect(page.getByTestId('setup-roles-tab')).not.toContainText('Raven');
  await expect(page.getByTestId('setup-roles-tab')).not.toContainText('Village Idiot');
  await expect(page.getByTestId('setup-roles-tab')).not.toContainText('Scapegoat');
});

test('setup validation requires villagers but accepts wolf-side special roles', async ({ page }) => {
  await page.goto('/');

  const noVillagerRoles = ['big_bad_wolf', 'fox', 'witch', 'cupid', 'protector', 'hunter'];
  for (const [index, roleId] of noVillagerRoles.entries()) {
    await page.getByTestId(`player-row-${index}`).getByTestId('role-select').selectOption(roleId);
  }

  await expect(page.getByTestId('start-game')).toBeDisabled();
  await expect(page.locator('.setup-errors')).toContainText(/Villager/i);

  await page.getByTestId('player-row-5').getByTestId('role-select').selectOption('villager');
  await expect(page.getByTestId('start-game')).toBeEnabled();
});

test('special wolf-side roles still create the normal wolf wake-up', async ({ page }) => {
  await page.goto('/');

  const roles = ['big_bad_wolf', 'villager', 'villager', 'villager', 'villager', 'villager'];
  for (const [index, roleId] of roles.entries()) {
    await page.getByTestId(`player-row-${index}`).getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();

  await expect(page.getByRole('heading', { name: /Werewolf wakes up/i })).toBeVisible();
});
