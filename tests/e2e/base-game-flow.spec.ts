import { test, expect } from '@playwright/test';

const ROLE_PRESET = ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager'];

test('base 6-player game flow stays visible and interactive', async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await test.step('setup 6 players with 2 wolves', async () => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Loup-Garous' })).toBeVisible();

    for (const [index, roleId] of ROLE_PRESET.entries()) {
      const row = page.getByTestId(`player-row-${index}`);
      await row.getByTestId('role-select').selectOption(roleId);
    }

    await page.getByTestId('start-game').click();
  });

  await test.step('play through night 1', async () => {
    await expect(page.getByTestId('night-phase')).toBeVisible();
    await expect(page.locator('.gameboard')).toBeVisible();

    await page.getByTestId('night-next').click();
    await expect(page.getByRole('heading', { name: /Night ends/i })).toBeVisible();

    await page.getByTestId('reveal-day').click();
  });

  await test.step('day 1 actions and role verification', async () => {
    await expect(page.getByTestId('day-phase')).toBeVisible();

    await page.getByTestId('dm-view-toggle').click();
    await expect(page.locator('.player-role:has-text("Loup-Garou")')).toHaveCount(2);

    const firstVoteRow = page.locator('.vote-row').first();
    await firstVoteRow.getByRole('button', { name: '+' }).click();
    await page.getByRole('button', { name: /Execute/ }).click();

    await page.getByRole('button', { name: /Start Night Phase/ }).click();
  });

  await test.step('night 2 begins without black screen', async () => {
    await expect(page.getByTestId('night-phase')).toBeVisible();
    await expect(page.locator('.gameboard')).toBeVisible();

    const hasVisibleContent = await page.evaluate(() => document.body.innerText.trim().length > 0);
    expect(hasVisibleContent).toBeTruthy();

    if (consoleErrors.length > 0) {
      await testInfo.attach('console-errors', {
        body: consoleErrors.join('\n'),
        contentType: 'text/plain',
      });
    }

    expect(consoleErrors).toEqual([]);

    await testInfo.attach('final-state', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });
});
