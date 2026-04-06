import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player, GameState, NightStep } from '../types/game.types';
import { getNightOrder } from '../data/roles';

interface SetupState {
  playerNames: string[];
  roleIds: string[];
  discussionTime: number;
  optionalRules: Record<string, boolean>;
}

interface StoreActions {
  // Setup
  setSetup: (s: SetupState) => void;
  startGame: () => void;
  resetGame: () => void;

  // Night
  completeNightStep: () => void;
  setEliminatedThisNight: (ids: string[]) => void;
  useGameAbility: (key: string) => void;
  applyNightResults: () => void;

  // Day
  togglePhase: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  tickTimer: () => void;
  resetTimer: () => void;
  setVote: (targetId: string, count: number) => void;
  clearVotes: () => void;
  eliminatePlayer: (id: string) => void;
  revealPlayer: (id: string) => void;
  electMayor: (id: string) => void;
  setLovers: (id1: string, id2: string) => void;
  addLog: (message: string) => void;
}

export type GameStore = SetupState & GameState & StoreActions;

const defaultSetup: SetupState = {
  playerNames: [],
  roleIds: [],
  discussionTime: 180,
  optionalRules: {},
};

const defaultGame: GameState = {
  phase: 'setup',
  round: 0,
  players: [],
  nightSteps: [],
  currentNightStepIndex: 0,
  eliminatedThisNight: [],
  discussionTimeSeconds: 180,
  timerRunning: false,
  timerRemaining: 180,
  votes: [],
  loversIds: null,
  mayorId: null,
  log: [],
  usedGameAbilities: [],
  optionalRules: {},
};

function buildNightSteps(roleIds: string[], round: number): NightStep[] {
  const ordered = getNightOrder(roleIds);
  return ordered
    .filter((r) => {
      if (r.firstNightOnly && round > 1) return false;
      if (r.everyOtherNight && round % 2 !== 0) return false;
      return true;
    })
    .map((r, i) => ({ roleId: r.id, stepIndex: i, completed: false }));
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...defaultSetup,
      ...defaultGame,

      setSetup: (s) => set({ ...s }),

      startGame: () => {
        const { playerNames, roleIds, discussionTime, optionalRules } = get();
        const players: Player[] = playerNames.map((name, i) => ({
          id: `p${i}`,
          name,
          roleId: roleIds[i] ?? 'villager',
          isAlive: true,
          isRevealed: false,
          isMayor: false,
          isLover: false,
          extraVotes: 0,
          usedAbilities: [],
        }));
        const round = 1;
        const nightSteps = buildNightSteps(
          [...new Set(players.map((p) => p.roleId))],
          round
        );
        set({
          phase: 'night',
          round,
          players,
          nightSteps,
          currentNightStepIndex: 0,
          eliminatedThisNight: [],
          timerRemaining: discussionTime,
          discussionTimeSeconds: discussionTime,
          votes: [],
          loversIds: null,
          mayorId: null,
          log: [`Game started with ${players.length} players.`],
          usedGameAbilities: [],
          optionalRules,
        });
      },

      resetGame: () =>
        set({ ...defaultSetup, ...defaultGame }),

      completeNightStep: () => {
        const { nightSteps, currentNightStepIndex } = get();
        const updated = nightSteps.map((s, i) =>
          i === currentNightStepIndex ? { ...s, completed: true } : s
        );
        set({
          nightSteps: updated,
          currentNightStepIndex: currentNightStepIndex + 1,
        });
      },

      setEliminatedThisNight: (ids) => set({ eliminatedThisNight: ids }),

      useGameAbility: (key) =>
        set((s) => ({
          usedGameAbilities: [...s.usedGameAbilities, key],
        })),

      applyNightResults: () => {
        const { players, eliminatedThisNight, round, discussionTimeSeconds, optionalRules } =
          get();
        const updated = players.map((p) =>
          eliminatedThisNight.includes(p.id)
            ? { ...p, isAlive: false }
            : p
        );
        const roleIds = [...new Set(updated.filter(p => p.isAlive).map((p) => p.roleId))];
        const newRound = round + 1;
        const nightSteps = buildNightSteps(roleIds, newRound);
        set({
          players: updated,
          phase: 'day',
          eliminatedThisNight: [],
          nightSteps,
          currentNightStepIndex: 0,
          timerRemaining: discussionTimeSeconds,
          log: [
            ...get().log,
            eliminatedThisNight.length
              ? `Night ${round}: ${eliminatedThisNight
                  .map((id) => updated.find((p) => p.id === id)?.name)
                  .join(', ')} were eliminated.`
              : `Night ${round}: No one was eliminated (peaceful night).`,
          ],
          optionalRules,
        });
      },

      togglePhase: () => {
        const { phase, round, players, discussionTimeSeconds, optionalRules } = get();
        if (phase === 'day') {
          const roleIds = [...new Set(players.filter(p => p.isAlive).map((p) => p.roleId))];
          const newRound = round + 1;
          const nightSteps = buildNightSteps(roleIds, newRound);
          set({
            phase: 'night',
            round: newRound,
            nightSteps,
            currentNightStepIndex: 0,
            eliminatedThisNight: [],
            votes: [],
            optionalRules,
          });
        } else {
          set({
            phase: 'day',
            timerRemaining: discussionTimeSeconds,
            votes: [],
          });
        }
      },

      startTimer: () => set({ timerRunning: true }),
      stopTimer: () => set({ timerRunning: false }),
      tickTimer: () => {
        const { timerRemaining, timerRunning } = get();
        if (timerRunning && timerRemaining > 0) {
          set({ timerRemaining: timerRemaining - 1 });
        } else if (timerRemaining <= 0) {
          set({ timerRunning: false });
        }
      },
      resetTimer: () =>
        set((s) => ({ timerRemaining: s.discussionTimeSeconds, timerRunning: false })),

      setVote: (targetId, count) =>
        set((s) => {
          const existing = s.votes.find((v) => v.targetId === targetId);
          if (existing) {
            return {
              votes: s.votes.map((v) =>
                v.targetId === targetId ? { ...v, count } : v
              ),
            };
          }
          return { votes: [...s.votes, { targetId, count }] };
        }),

      clearVotes: () => set({ votes: [] }),

      eliminatePlayer: (id) => {
        const { players, loversIds, log, round } = get();
        const toElim = [id];
        // lover chain
        if (loversIds && loversIds.includes(id)) {
          const other = loversIds.find((lid) => lid !== id);
          if (other) toElim.push(other);
        }
        const updated = players.map((p) =>
          toElim.includes(p.id) ? { ...p, isAlive: false } : p
        );
        set({
          players: updated,
          log: [
            ...log,
            `Day ${round}: ${toElim
              .map((eid) => players.find((p) => p.id === eid)?.name)
              .join(' & ')} eliminated.`,
          ],
        });
      },

      revealPlayer: (id) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === id ? { ...p, isRevealed: true } : p
          ),
        })),

      electMayor: (id) =>
        set((s) => ({
          mayorId: id,
          players: s.players.map((p) => ({
            ...p,
            isMayor: p.id === id,
          })),
        })),

      setLovers: (id1, id2) =>
        set((s) => ({
          loversIds: [id1, id2],
          players: s.players.map((p) => ({
            ...p,
            isLover: p.id === id1 || p.id === id2,
          })),
        })),

      addLog: (message) =>
        set((s) => ({ log: [...s.log, message] })),
    }),
    { name: 'loupgarous-game' }
  )
);
