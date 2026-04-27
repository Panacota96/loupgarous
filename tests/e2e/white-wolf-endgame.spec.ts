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

test('white wolf night step no longer asks the GM to mark a wolf victim', async ({ page }) => {
  await setupGame(
    page,
    ['white_werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager']
  );

  await page.getByTestId('night-next').click();
  await expect(page.getByRole('heading', { name: /Night ends/i })).toBeVisible();

  await page.getByTestId('reveal-day').click();
  await page.getByRole('button', { name: /Start Night Phase/ }).click();

  await page.getByTestId('night-next').click();
  await expect(page.getByRole('heading', { name: /White Werewolf wakes up/i })).toBeVisible();
  await expect(page.getByText(/OPTIONAL.*devour one of the other werewolves/i)).toHaveCount(0);
  await expect(page.getByText(/Skip/i)).toHaveCount(0);
  await expect(page.locator('.night-input select')).toHaveCount(0);
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

test('wolves do not win while the white wolf is still alive', async ({ page }) => {
  await setupGame(
    page,
    ['white_werewolf', 'werewolf', 'werewolf', 'villager', 'villager', 'villager']
  );

  await advanceToDay(page);
  await eliminatePlayer(page, 'p3');
  await eliminatePlayer(page, 'p4');
  await eliminatePlayer(page, 'p5');

  await expect(page.locator('.win-screen')).toHaveCount(0);
  await expect(page.locator('.win-suggestion-screen')).toHaveCount(0);
  await expect(page.getByTestId('day-phase')).toBeVisible();
});

test('village win is suggested before it is confirmed', async ({ page }) => {
  await setupGame(
    page,
    ['werewolf', 'villager', 'villager', 'villager', 'villager', 'villager']
  );

  await advanceToDay(page);
  await eliminatePlayer(page, 'p0');

  await expect(page.locator('.win-screen')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'It looks like the villagers have won.' })).toBeVisible();
  await page.getByTestId('keep-playing').click();
  await expect(page.getByTestId('day-phase')).toBeVisible();
  await expect(page.getByTestId('review-winner')).toBeVisible();
  await page.getByTestId('review-winner').click();
  await expect(page.getByRole('heading', { name: 'It looks like the villagers have won.' })).toBeVisible();
  await page.getByTestId('confirm-winner').click();

  await expect(page.locator('.win-screen')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Village Wins!' })).toBeVisible();
});

test('angel win is suggested when Angel is the first Day 1 execution', async ({ page }) => {
  await setupGame(
    page,
    ['angel', 'werewolf', 'villager', 'villager', 'villager', 'villager']
  );

  await advanceToDay(page);
  await eliminatePlayer(page, 'p0');

  await expect(page.locator('.win-screen')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'It looks like the Angel has won.' })).toBeVisible();
  await page.getByTestId('confirm-winner').click();

  await expect(page.locator('.win-screen')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Angel Wins!' })).toBeVisible();
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

  await expect(page.locator('.win-screen')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'It looks like the White Werewolf has won.' })).toBeVisible();
  await page.getByTestId('confirm-winner').click();

  await expect(page.locator('.win-screen')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'White Werewolf Wins!' })).toBeVisible();
});
