import { test, expect, type Page } from '@playwright/test';

async function setupGame(page: Page, roles: string[], names: string[]) {
  await page.goto('/');

  for (const [index, roleId] of roles.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByRole('textbox').fill(names[index]);
    await row.getByTestId('role-select').selectOption(roleId);
  }

  await page.getByTestId('start-game').click();
}

async function advanceToDay(page: Page) {
  if (await page.getByTestId('night-next').isVisible().catch(() => false)) {
    await page.getByTestId('night-next').click();
  }

  await expect(page.getByTestId('reveal-day')).toBeVisible();
  await page.getByTestId('reveal-day').click();
  await expect(page.getByTestId('day-phase')).toBeVisible();
}

async function eliminatePlayer(page: Page, name: string) {
  const card = page.locator('.player-card').filter({ hasText: name });
  await expect(card).toHaveCount(1);
  await card.getByRole('button', { name: /Elim\./ }).click();
}

test('white-wolf-only setup is valid and does not auto-end as a village win', async ({ page }) => {
  await setupGame(
    page,
    ['white_werewolf', 'villager', 'villager', 'villager', 'villager', 'villager'],
    ['White Wolf', 'Villager A', 'Villager B', 'Villager C', 'Villager D', 'Villager E']
  );

  await expect(page.getByTestId('night-phase')).toBeVisible();
  await expect(page.locator('.win-screen')).toHaveCount(0);
  await expect(page.getByTestId('reveal-day')).toBeVisible();
});

test('two wolves plus white wolf does not auto-end on parity at game start', async ({ page }) => {
  await setupGame(
    page,
    ['werewolf', 'werewolf', 'white_werewolf', 'villager', 'villager', 'villager'],
    ['Wolf A', 'Wolf B', 'White Wolf', 'Villager A', 'Villager B', 'Villager C']
  );

  await expect(page.getByTestId('night-phase')).toBeVisible();
  await expect(page.locator('.win-screen')).toHaveCount(0);
  await expect(page.locator('.wolf-chip')).toContainText('2 wolves');
});

test('eliminating the last pack wolf while white wolf lives does not give the village the win', async ({ page }) => {
  await setupGame(
    page,
    ['white_werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager'],
    ['White Wolf', 'Pack Wolf', 'Villager A', 'Villager B', 'Villager C', 'Villager D']
  );

  await advanceToDay(page);
  await eliminatePlayer(page, 'Pack Wolf');

  await expect(page.locator('.win-screen')).toHaveCount(0);
  await expect(page.getByTestId('day-phase')).toBeVisible();
});

test('white wolf wins when it becomes the sole survivor', async ({ page }) => {
  await setupGame(
    page,
    ['white_werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager'],
    ['White Wolf', 'Pack Wolf', 'Villager A', 'Villager B', 'Villager C', 'Villager D']
  );

  await advanceToDay(page);
  await eliminatePlayer(page, 'Pack Wolf');
  await eliminatePlayer(page, 'Villager A');
  await eliminatePlayer(page, 'Villager B');
  await eliminatePlayer(page, 'Villager C');
  await eliminatePlayer(page, 'Villager D');

  await expect(page.locator('.win-screen')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'White Werewolf Wins!' })).toBeVisible();
});
