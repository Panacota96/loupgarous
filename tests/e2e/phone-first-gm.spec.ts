import { expect, test } from '@playwright/test';

const ROLE_PRESET = ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager'];

async function assignBaseRoles(page: import('@playwright/test').Page) {
  for (const [index, roleId] of ROLE_PRESET.entries()) {
    const row = page.getByTestId(`player-row-${index}`);
    await row.getByTestId('role-select').selectOption(roleId);
  }
}

test.describe('phone-first GM flow', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('prepare mode supports seat ordering and setup saves', async ({ page }) => {
    await page.goto('./');

    await page.getByTestId('player-row-0').getByRole('textbox').fill('Alice');
    await page.getByTestId('player-row-1').getByRole('textbox').fill('Bob');

    await expect(page.getByTestId('seat-order-row-0')).toContainText('Alice');
    await page.getByTestId('seat-order-row-0').getByRole('button', { name: '↓' }).click();
    await expect(page.getByTestId('seat-order-row-0')).toContainText('Bob');
    await expect(page.getByTestId('seat-order-row-1')).toContainText('Alice');

    await page.getByTestId('session-name-input').fill('Prep Table');
    await page.getByTestId('save-session').click();
    await expect(page.getByTestId('saved-session-card')).toContainText('Prep Table');
  });

  test('run mode supports privacy toggle and loading a saved live session', async ({ page }) => {
    await page.goto('./');
    await assignBaseRoles(page);
    await page.getByTestId('start-game').click();

    await expect(page.getByTestId('night-phase')).toBeVisible();
    await page.getByTestId('privacy-toggle').click();
    await expect(page.getByText(/Privacy mode is active|mode confidentialité/i)).toBeVisible();
    await page.getByTestId('privacy-toggle').click();
    await expect(page.getByText(/Privacy mode is active|mode confidentialité/i)).not.toBeVisible();

    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept('Live Save');
    });
    await page.getByTestId('save-live-session').click();

    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    await page.getByRole('button', { name: /Setup|Préparation/i }).click();

    await expect(page.getByTestId('setup-main-tab')).toBeVisible();
    const savedCard = page.getByTestId('saved-session-card').filter({ hasText: 'Live Save' });
    await expect(savedCard).toBeVisible();
    await savedCard.getByRole('button', { name: /Load|Charger/i }).click();
    await expect(page.getByTestId('night-phase')).toBeVisible();
  });

  test('day mode vote assist tracks totals, no-vote states, and ties', async ({ page }) => {
    await page.goto('./');
    await assignBaseRoles(page);
    await page.getByTestId('start-game').click();
    await page.getByTestId('night-next').click();
    await page.getByTestId('reveal-day').click();

    await expect(page.getByTestId('day-phase')).toBeVisible();
    await page.getByTestId('vote-assist-toggle').click();
    await expect(page.getByRole('heading', { name: /Vote Assist|Assistant de vote/i })).toBeVisible();

    const firstRow = page.locator('.vote-assist-row').first();
    await firstRow.getByRole('button', { name: '+1' }).click();
    await firstRow.getByRole('button', { name: /Mayor \+2|Maire \+2/i }).click();
    await expect(firstRow).toContainText(/Total against: 3|Total contre : 3/i);
    await firstRow.getByRole('button', { name: /No vote|Sans vote/i }).click();
    await expect(firstRow.getByRole('button', { name: /Allow vote|Autoriser/i })).toBeVisible();

    const secondRow = page.locator('.vote-assist-row').nth(1);
    await secondRow.getByRole('button', { name: '+1' }).click();
    await secondRow.getByRole('button', { name: /Mayor \+2|Maire \+2/i }).click();
    await expect(page.getByText(/Tie detected|Égalité détectée/i)).toBeVisible();
  });
});
