import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player, GameState, NightStep } from '../types/game.types';
import { getNightOrder, WOLF_ROLE_IDS } from '../data/roles';

interface SetupState {
  playerNames: string[];
  roleIds: string[];
  discussionTime: number;
  optionalRules: Record<string, boolean>;
}

interface StoreActions {
  setSetup: (s: SetupState) => void;
  startGame: () => void;
  resetGame: () => void;
  completeNightStep: () => void;
  setEliminatedThisNight: (ids: string[]) => void;
  useGameAbility: (key: string) => void;
  applyNightResults: () => void;
  setWildChildModel: (id: string) => void;
  setWolfDogChoice: (choice: 'villager' | 'werewolf') => void;
  addEnchanted: (ids: string[]) => void;
  infectPlayer: (id: string) => void;
  setAngelWon: (val: boolean) => void;
  setWolfVictimId: (id: string | null) => void;
  setRavenCursed: (id: string | null) => void;
  setProtectedPlayerId: (id: string | null) => void;
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
  wildChildModelId: null,
  wildChildTransformed: false,
  wolfDogChoice: null,
  enchantedPlayerIds: [],
  infectedPlayerIds: [],
  angelWon: false,
  wolfVictimId: null,
  ravenCursedId: null,
  protectedPlayerId: null,
  lastProtectedPlayerId: null,
};

function buildNightSteps(roleIds: string[], round: number): NightStep[] {
  return getNightOrder(roleIds, round).map((r, i) => ({
    roleId: r.id,
    stepIndex: i,
    completed: false,
  }));
}

export function resolveNightEliminations(
  players: Player[],
  eliminatedThisNight: string[],
  infectedPlayerIds: string[],
  loversIds: [string, string] | null
) {
  const finalEliminated = [...eliminatedThisNight];
  let extraLog = '';

  // Knight with Rusty Sword: if Knight was killed by wolves,
  // the first wolf to their LEFT (seating order) dies at dawn.
  const knightPlayer = players.find((p) => p.isAlive && p.roleId === 'knight');
  if (knightPlayer && finalEliminated.includes(knightPlayer.id)) {
    const total = players.length;
    const knightIdx = players.findIndex((p) => p.id === knightPlayer.id);
    for (let offset = 1; offset < total; offset++) {
      const candidate = players[(knightIdx - offset + total) % total];
      if (!candidate.isAlive) continue;
      if (
        WOLF_ROLE_IDS.includes(candidate.roleId) ||
        infectedPlayerIds.includes(candidate.id)
      ) {
        if (!finalEliminated.includes(candidate.id)) {
          finalEliminated.push(candidate.id);
          extraLog = ` ⚔️ Knight's rusty sword: ${candidate.name} dies of tetanus!`;
        }
        break;
      }
    }
  }

  let loversLog = '';
  if (loversIds) {
    const [loverAId, loverBId] = loversIds;
    const loverAEliminated = finalEliminated.includes(loverAId);
    const loverBEliminated = finalEliminated.includes(loverBId);

    if (loverAEliminated !== loverBEliminated) {
      const chainedId = loverAEliminated ? loverBId : loverAId;
      const fallenId = loverAEliminated ? loverAId : loverBId;
      const chainedPlayer = players.find((p) => p.id === chainedId);

      if (chainedPlayer?.isAlive && !finalEliminated.includes(chainedId)) {
        finalEliminated.push(chainedId);
        const chainedName = chainedPlayer.name;
        const fallenName = players.find((p) => p.id === fallenId)?.name ?? 'Unknown';
        loversLog = ` 💘 Lovers: ${chainedName} dies with ${fallenName}.`;
      }
    }
  }

  return { finalEliminated, extraLog, loversLog };
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
          wildChildModelId: null,
          wildChildTransformed: false,
          wolfDogChoice: null,
          enchantedPlayerIds: [],
          infectedPlayerIds: [],
          angelWon: false,
          wolfVictimId: null,
          ravenCursedId: null,
          protectedPlayerId: null,
          lastProtectedPlayerId: null,
        });
      },

      resetGame: () => set({ ...defaultSetup, ...defaultGame }),

      completeNightStep: () => {
        const { nightSteps, currentNightStepIndex } = get();
        const updated = nightSteps.map((s, i) =>
          i === currentNightStepIndex ? { ...s, completed: true } : s
        );
        set({ nightSteps: updated, currentNightStepIndex: currentNightStepIndex + 1 });
      },

      setEliminatedThisNight: (ids) => set({ eliminatedThisNight: ids }),

      useGameAbility: (key) =>
        set((s) => ({ usedGameAbilities: [...s.usedGameAbilities, key] })),

      setWildChildModel: (id) => set({ wildChildModelId: id }),
      setWolfDogChoice: (choice) => set({ wolfDogChoice: choice }),
      addEnchanted: (ids) =>
        set((s) => ({ enchantedPlayerIds: [...new Set([...s.enchantedPlayerIds, ...ids])] })),
      infectPlayer: (id) =>
        set((s) => ({
          eliminatedThisNight: s.eliminatedThisNight.filter((eid) => eid !== id),
          infectedPlayerIds: [...new Set([...s.infectedPlayerIds, id])],
          usedGameAbilities: [...s.usedGameAbilities, 'infect_pere'],
        })),
      setAngelWon: (val) => set({ angelWon: val }),
      setWolfVictimId: (id) => set({ wolfVictimId: id }),
      setRavenCursed: (id) => set({ ravenCursedId: id }),
      setProtectedPlayerId: (id) => set({ protectedPlayerId: id }),

      applyNightResults: () => {
        const {
          players, eliminatedThisNight, round, discussionTimeSeconds, optionalRules,
          infectedPlayerIds, wildChildModelId, wildChildTransformed, log,
          loversIds, protectedPlayerId,
        } = get();
        const { finalEliminated, extraLog, loversLog } = resolveNightEliminations(
          players,
          eliminatedThisNight,
          infectedPlayerIds,
          loversIds
        );

        const updated = players.map((p) =>
          finalEliminated.includes(p.id) ? { ...p, isAlive: false } : p
        );

        const newWildChildTransformed =
          wildChildTransformed ||
          (wildChildModelId !== null && finalEliminated.includes(wildChildModelId));

        const roleIds = [...new Set(updated.filter((p) => p.isAlive).map((p) => p.roleId))];
        const newRound = round + 1;
        const nightSteps = buildNightSteps(roleIds, newRound);

        const nightMsg = finalEliminated.length
          ? `Night ${round}: ${finalEliminated.map((id) => updated.find((p) => p.id === id)?.name).join(', ')} were eliminated.${extraLog}${loversLog}`
          : `Night ${round}: No one was eliminated (peaceful night).`;

        set({
          players: updated,
          phase: 'day',
          eliminatedThisNight: [],
          nightSteps,
          currentNightStepIndex: 0,
          timerRemaining: discussionTimeSeconds,
          log: [...log, nightMsg],
          optionalRules,
          wildChildTransformed: newWildChildTransformed,
          wolfVictimId: null,
          protectedPlayerId: null,
          lastProtectedPlayerId: protectedPlayerId,
        });
      },

      togglePhase: () => {
        const { phase, round, players, discussionTimeSeconds, optionalRules } = get();
        if (phase === 'day') {
          const roleIds = [...new Set(players.filter((p) => p.isAlive).map((p) => p.roleId))];
          const newRound = round + 1;
          const nightSteps = buildNightSteps(roleIds, newRound);
          set({
            phase: 'night', round: newRound, nightSteps,
            currentNightStepIndex: 0, eliminatedThisNight: [], votes: [], optionalRules,
            ravenCursedId: null,
            protectedPlayerId: null,
          });
        } else {
          set({ phase: 'day', timerRemaining: discussionTimeSeconds, votes: [] });
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
            return { votes: s.votes.map((v) => v.targetId === targetId ? { ...v, count } : v) };
          }
          return { votes: [...s.votes, { targetId, count }] };
        }),

      clearVotes: () => set({ votes: [] }),

      eliminatePlayer: (id) => {
        const { players, loversIds, log, round, wildChildModelId, wildChildTransformed } = get();
        const toElim = [id];
        if (loversIds && loversIds.includes(id)) {
          const other = loversIds.find((lid) => lid !== id);
          if (other) toElim.push(other);
        }
        const updated = players.map((p) => toElim.includes(p.id) ? { ...p, isAlive: false } : p);
        const newWildChildTransformed =
          wildChildTransformed ||
          (wildChildModelId !== null && toElim.includes(wildChildModelId));
        set({
          players: updated,
          wildChildTransformed: newWildChildTransformed,
          log: [
            ...log,
            `Day ${round}: ${toElim.map((eid) => players.find((p) => p.id === eid)?.name).join(' & ')} eliminated.`,
          ],
        });
      },

      revealPlayer: (id) =>
        set((s) => ({ players: s.players.map((p) => p.id === id ? { ...p, isRevealed: true } : p) })),

      electMayor: (id) =>
        set((s) => ({
          mayorId: id,
          players: s.players.map((p) => ({ ...p, isMayor: p.id === id })),
        })),

      setLovers: (id1, id2) =>
        set((s) => ({
          loversIds: [id1, id2],
          players: s.players.map((p) => ({ ...p, isLover: p.id === id1 || p.id === id2 })),
        })),

      addLog: (message) =>
        set((s) => ({ log: [...s.log, message] })),
    }),
    { name: 'loupgarous-game' }
  )
);
