import { test, expect } from '@playwright/test';

const ROLE_PRESET = ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager'];

test('base 6-player game flow stays visible and interactive', async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('requestfailed', (req) => failedRequests.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`));

  await test.step('setup 6 players with 2 wolves', async () => {
    await page.goto('./');
    await expect(page.getByRole('heading', { name: 'Loup-Garous' })).toBeVisible();
    await expect(page.getByTestId('setup-main-tab')).toBeVisible();

    // DM can open the quick guide without mixing it into the main setup screen
    await page.getByTestId('setup-tab-guide').click();
    await expect(page.getByTestId('setup-guide-tab')).toBeVisible();
    await expect(page.getByTestId('setup-main-tab')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: /Quick Guide/i })).toBeVisible();

    await page.getByTestId('setup-tab-setup').click();
    await expect(page.getByTestId('setup-main-tab')).toBeVisible();

    // DM can review role reference before assigning
    await page.getByTestId('setup-tab-roles').click();
    await expect(page.getByTestId('setup-roles-tab')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Role Reference/i })).toBeVisible();
    await page.getByTestId('setup-tab-setup').click();

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
    await expect(page.locator('.player-role').filter({ hasText: /Werewolf|Loup-Garou/i })).toHaveCount(2);

    await expect(page.locator('.vote-row')).toHaveCount(0);
    await expect(page.locator('.mayor-vote-select')).toHaveCount(0);
    await expect(page.getByTestId('tie-resolution-panel')).toBeVisible();

    await page.getByRole('button', { name: '🎖️ Mayor' }).first().click();
    await page.locator('.player-card').first().getByRole('button', { name: /Elim\./ }).click();
    await expect(page.locator('.player-card.dead')).toHaveCount(1);

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

    if (pageErrors.length > 0) {
      await testInfo.attach('page-errors', {
        body: pageErrors.join('\n'),
        contentType: 'text/plain',
      });
    }

    if (failedRequests.length > 0) {
      await testInfo.attach('failed-requests', {
        body: failedRequests.join('\n'),
        contentType: 'text/plain',
      });
    }

    expect(consoleErrors, 'console errors detected').toEqual([]);
    expect(pageErrors, 'uncaught page errors detected').toEqual([]);
    expect(failedRequests, 'failed network requests detected').toEqual([]);

    await testInfo.attach('final-state', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });
});
