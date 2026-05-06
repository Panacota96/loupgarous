import { test, expect } from '@playwright/test';

test('v2 persisted games migrate to the current store shape', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.addInitScript(() => {
    localStorage.setItem(
      'loupgarous-game',
      JSON.stringify({
        state: {
          phase: 'day',
          round: 1,
          playerNames: [],
          roleIds: ['werewolf', 'scapegoat', 'villager'],
          discussionTime: 5,
          optionalRules: { elder: true },
          players: [
            {
              id: 'p0',
              name: '',
              seatNumber: 1,
              roleId: 'werewolf',
              isAlive: true,
              isMayor: false,
              isLover: false,
              extraVotes: 0,
              usedAbilities: [],
            },
            {
              id: 'p1',
              name: '',
              seatNumber: 2,
              roleId: 'scapegoat',
              isAlive: true,
              isMayor: false,
              isLover: false,
              extraVotes: 0,
              usedAbilities: [],
            },
            {
              id: 'p2',
              name: '',
              seatNumber: 3,
              roleId: 'villager',
              isAlive: true,
              isMayor: false,
              isLover: false,
              extraVotes: 0,
              usedAbilities: [],
            },
          ],
          nightSteps: [],
          nightStepStates: [],
          currentNightStepIndex: 0,
          eliminatedThisNight: [],
          discussionTimeSeconds: 5,
          timerRunning: true,
          timerRemaining: 999,
          loversIds: null,
          mayorId: null,
          log: [],
          usedGameAbilities: [],
          foxPowerActive: true,
          protectorHistory: [],
          wildChildModelId: null,
          wildChildTransformed: false,
          wolfDogChoice: null,
          enchantedPlayerIds: [],
          infectedPlayerIds: [],
          angelWon: false,
          firstDayExecutionDone: false,
          language: 'en',
          protectedPlayerId: null,
          lastProtectedPlayerId: null,
          rolePowerOverrides: {},
        },
        version: 2,
      })
    );
  });

  await page.goto('/');

  await expect(page.getByTestId('day-phase')).toBeVisible();
  await expect(page.getByTestId('recent-eliminations')).toHaveCount(0);
  await expect(page.getByTestId('timer-duration')).toHaveText('00:30');
  await expect(page.getByTestId('timer-display')).toHaveText('00:30');
  await expect(page.getByTestId('player-card-p1')).toContainText('#2 Villager');

  const persisted = await page.evaluate(() => {
    const raw = localStorage.getItem('loupgarous-game');
    if (!raw) throw new Error('missing persisted state');
    return JSON.parse(raw) as {
      state: {
        pendingDayEliminations?: unknown;
        optionalRules?: unknown;
        discussionTime: number;
        discussionTimeSeconds: number;
        timerRemaining: number;
        timerRunning: boolean;
        roleIds: string[];
        players: { id: string; roleId: string }[];
      };
      version: number;
    };
  });

  expect(persisted.version).toBe(3);
  expect(persisted.state.pendingDayEliminations).toEqual([]);
  expect(persisted.state.optionalRules).toBeUndefined();
  expect(persisted.state.discussionTime).toBe(30);
  expect(persisted.state.discussionTimeSeconds).toBe(30);
  expect(persisted.state.timerRemaining).toBe(30);
  expect(typeof persisted.state.timerRunning).toBe('boolean');
  expect(persisted.state.roleIds).toEqual(['werewolf', 'villager', 'villager']);
  expect(persisted.state.players.find((player) => player.id === 'p1')?.roleId).toBe('villager');
  expect(consoleErrors, 'console errors detected').toEqual([]);
});
