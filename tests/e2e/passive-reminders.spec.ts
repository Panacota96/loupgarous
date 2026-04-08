import { test, expect } from '@playwright/test';

const ROLE_SETUP = ['werewolf', 'seer', 'bear_tamer', 'elder', 'villager', 'villager'];
const NAME_SETUP = ['Wolf', 'Seer', 'Bear Tamer', 'Elder', 'Villager A', 'Villager B'];

test('first-night checklist highlights passive/manual roles without adding night turns', async ({ page }) => {
  await page.goto('/');

  for (const [index, roleId] of ROLE_SETUP.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByRole('textbox').fill(NAME_SETUP[index]);
    await row.getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();

  const checklist = page.getByTestId('passive-checklist');
  await expect(checklist).toBeVisible();
  await expect(checklist).toContainText('Bear Tamer');
  await expect(checklist).toContainText('Elder');

  // Checklist behaves as a note without affecting night order
  const firstCheckbox = checklist.getByRole('checkbox').first();
  await firstCheckbox.check();
  await expect(firstCheckbox).toBeChecked();

  // Only active night roles appear in the step list
  await expect(page.locator('.step-pip')).toHaveCount(2);
  await expect(page.getByText(/Bear Tamer wakes up/i)).toHaveCount(0);
  await expect(page.getByText(/Elder wakes up/i)).toHaveCount(0);

  // Night steps remain playable
  await page.getByTestId('night-next').click();
  await page.getByTestId('night-next').click();
  await expect(page.getByRole('heading', { name: /Night ends/i })).toBeVisible();
});
