import { test, expect, type Page } from '@playwright/test';

async function setupGame(page: Page, roles: string[]) {
  await page.goto('/');

  for (const [index, roleId] of roles.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
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

async function eliminatePlayer(page: Page, playerId: string) {
  const card = page.getByTestId(`player-card-${playerId}`);
  await expect(card).toBeVisible();
  await card.getByTestId(`eliminate-${playerId}`).click();
}

test('white-wolf-only setup is valid and does not auto-end as a village win', async ({ page }) => {
  await setupGame(
    page,
    ['white_werewolf', 'villager', 'villager', 'villager', 'villager', 'villager']
  );

  await expect(page.getByTestId('night-phase')).toBeVisible();
  await expect(page.locator('.win-screen')).toHaveCount(0);
  await expect(page.getByTestId('reveal-day')).toBeVisible();
});

test('two wolves plus white wolf does not auto-end on parity at game start', async ({ page }) => {
  await setupGame(
    page,
    ['werewolf', 'werewolf', 'white_werewolf', 'villager', 'villager', 'villager']
  );

  await expect(page.getByTestId('night-phase')).toBeVisible();
  await expect(page.locator('.win-screen')).toHaveCount(0);
  await expect(page.locator('.wolf-chip')).toContainText('2 wolves');
});

test('eliminating the last pack wolf while white wolf lives does not give the village the win', async ({ page }) => {
  await setupGame(
    page,
    ['white_werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager']
  );

  await advanceToDay(page);
  await eliminatePlayer(page, 'p1');

  await expect(page.locator('.win-screen')).toHaveCount(0);
  await expect(page.getByTestId('day-phase')).toBeVisible();
});

test('white wolf wins when it becomes the sole survivor', async ({ page }) => {
  await setupGame(
    page,
    ['white_werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager']
  );

  await advanceToDay(page);
  await eliminatePlayer(page, 'p1');
  await eliminatePlayer(page, 'p2');
  await eliminatePlayer(page, 'p3');
  await eliminatePlayer(page, 'p4');
  await eliminatePlayer(page, 'p5');

  await expect(page.locator('.win-screen')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'White Werewolf Wins!' })).toBeVisible();
});
