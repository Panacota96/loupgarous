import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Player,
  GameState,
  NightStep,
  NightStepState,
  Language,
  ProtectorRecord,
} from '../types/game.types';
import { getNightOrder, WOLF_ROLE_IDS } from '../data/roles';
import { getStrings } from '../i18n';

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
  goToNightStep: (index: number) => void;
  setEliminatedThisNight: (ids: string[]) => void;
  useGameAbility: (key: string) => void;
  applyNightResults: () => void;
  setWildChildModel: (id: string) => void;
  setWolfDogChoice: (choice: 'villager' | 'werewolf') => void;
  addEnchanted: (ids: string[]) => void;
  infectPlayer: (id: string) => void;
  setAngelWon: (val: boolean) => void;
  setFoxPowerActive: (active: boolean) => void;
  setWolfVictimId: (id: string | null) => void;
  setRavenCursed: (id: string | null) => void;
  setProtectedPlayerId: (id: string | null) => void;
  togglePhase: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  tickTimer: () => void;
  resetTimer: () => void;
  eliminatePlayer: (id: string) => void;
  electMayor: (id: string) => void;
  setLovers: (id1: string, id2: string) => void;
  addLog: (message: string) => void;
  setLanguage: (lang: Language) => void;
  setProtectorTarget: (targetId: string | null) => void;
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
  nightStepStates: [],
  currentNightStepIndex: 0,
  eliminatedThisNight: [],
  discussionTimeSeconds: 180,
  timerRunning: false,
  timerRemaining: 180,
  loversIds: null,
  mayorId: null,
  log: [],
  usedGameAbilities: [],
  optionalRules: {},
  foxPowerActive: true,
  protectorHistory: [],
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

function buildNightSteps(
  roleIds: string[],
  round: number,
  foxPowerActive = true,
  usedGameAbilities: string[] = []
): NightStep[] {
  const witchPotionsAvailable = !(
    usedGameAbilities.includes('witch_heal') &&
    usedGameAbilities.includes('witch_poison')
  );

  return getNightOrder(roleIds, round, foxPowerActive)
    .filter((r) => r.id !== 'witch' || witchPotionsAvailable)
    .map((r, i) => ({
      roleId: r.id,
      stepIndex: i,
      completed: false,
    }));
}

function clonePlayers(players: Player[]) {
  return players.map((p) => ({ ...p }));
}

function captureNightState(state: GameStore): NightStepState {
  return {
    eliminatedThisNight: [...state.eliminatedThisNight],
    usedGameAbilities: [...state.usedGameAbilities],
    enchantedPlayerIds: [...state.enchantedPlayerIds],
    infectedPlayerIds: [...state.infectedPlayerIds],
    loversIds: state.loversIds ? [...state.loversIds] as [string, string] : null,
    players: clonePlayers(state.players),
    foxPowerActive: state.foxPowerActive,
    wolfVictimId: state.wolfVictimId,
    ravenCursedId: state.ravenCursedId,
    wildChildModelId: state.wildChildModelId,
    wolfDogChoice: state.wolfDogChoice,
    protectorHistory: state.protectorHistory.map((p) => ({ ...p })),
  };
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
        const { playerNames, roleIds, discussionTime, optionalRules, language } = get();
        const strings = getStrings(language);
        const players: Player[] = playerNames.map((name, i) => ({
          id: `p${i}`,
          name,
          roleId: roleIds[i] ?? 'villager',
          isAlive: true,
          isMayor: false,
          isLover: false,
          extraVotes: 0,
          usedAbilities: [],
        }));
        const round = 1;
        const nightSteps = buildNightSteps(
          [...new Set(players.map((p) => p.roleId))],
          round,
          true,
          []
        );
        const nextState: Partial<GameStore> = {
          phase: 'night',
          round,
          players,
          nightSteps,
          currentNightStepIndex: 0,
          eliminatedThisNight: [] as string[],
          timerRemaining: discussionTime,
          discussionTimeSeconds: discussionTime,
          loversIds: null,
          mayorId: null,
          log: [strings.logs.gameStarted(players.length)],
          usedGameAbilities: [] as string[],
          optionalRules,
          foxPowerActive: true,
          protectorHistory: [] as ProtectorRecord[],
          wildChildModelId: null,
          wildChildTransformed: false,
          wolfDogChoice: null,
          enchantedPlayerIds: [] as string[],
          infectedPlayerIds: [] as string[],
          angelWon: false,
          wolfVictimId: null,
          ravenCursedId: null,
          protectedPlayerId: null,
          lastProtectedPlayerId: null,
        });
      },

      resetGame: () => set((s) => ({ ...defaultSetup, ...defaultGame, language: s.language })),

      completeNightStep: () =>
        set((state) => {
          const updated = state.nightSteps.map((s, i) =>
            i === state.currentNightStepIndex ? { ...s, completed: true } : s
          );
          const nextIndex = state.currentNightStepIndex + 1;
          const history = [...(state.nightStepStates ?? [])];
          history[nextIndex] = captureNightState(state);
          return {
            nightSteps: updated,
            currentNightStepIndex: nextIndex,
            nightStepStates: history,
          };
        }),

      goToNightStep: (index) =>
        set((state) => {
          const target = Math.max(0, Math.min(index, state.nightSteps.length - 1));
          const history = state.nightStepStates ?? [];
          const snapshot = history[target];
          if (!snapshot) return {};
          const nightSteps = state.nightSteps.map((step, i) => ({
            ...step,
            completed: i < target,
          }));
          return {
            eliminatedThisNight: [...snapshot.eliminatedThisNight],
            usedGameAbilities: [...snapshot.usedGameAbilities],
            enchantedPlayerIds: [...snapshot.enchantedPlayerIds],
            infectedPlayerIds: [...snapshot.infectedPlayerIds],
            loversIds: snapshot.loversIds ? [...snapshot.loversIds] as [string, string] : null,
            players: clonePlayers(snapshot.players),
            foxPowerActive: snapshot.foxPowerActive,
            wolfVictimId: snapshot.wolfVictimId,
            ravenCursedId: snapshot.ravenCursedId,
            wildChildModelId: snapshot.wildChildModelId,
            wolfDogChoice: snapshot.wolfDogChoice,
            protectorHistory: snapshot.protectorHistory.map((p) => ({ ...p })),
            nightSteps,
            currentNightStepIndex: target,
            nightStepStates: history.slice(0, target + 1),
          };
        }),

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
      setFoxPowerActive: (active) => set({ foxPowerActive: active }),
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

        const witchHealUsed = usedGameAbilities.includes('witch_heal');
        const witchPoisonUsed = usedGameAbilities.includes('witch_poison');
        if (witchHealUsed || witchPoisonUsed) {
          extraLogParts.push(strings.logs.witchPotionsStatus(witchHealUsed, witchPoisonUsed));
          if (witchHealUsed && witchPoisonUsed) {
            extraLogParts.push(strings.logs.witchPotionsSpent);
          }
        }

        const protectionEntry = protectorHistory.find((p) => p.round === round);
        if (protectionEntry) {
          const targetName = protectionEntry.targetId
            ? players.find((p) => p.id === protectionEntry.targetId)?.name ?? strings.night.protectorUnknown
            : '';
          extraLogParts.push(
            protectionEntry.targetId
              ? strings.logs.protectorProtected(targetName)
              : strings.logs.protectorNoProtection
          );
        }

        const updated = players.map((p) =>
          finalEliminated.includes(p.id) ? { ...p, isAlive: false } : p
        );

        const newWildChildTransformed =
          wildChildTransformed ||
          (wildChildModelId !== null && finalEliminated.includes(wildChildModelId));

        const roleIds = [...new Set(updated.filter((p) => p.isAlive).map((p) => p.roleId))];
        const newRound = round + 1;
        const nightSteps = buildNightSteps(roleIds, newRound, foxPowerActive, usedGameAbilities);

        const nightMsg = finalEliminated.length
          ? `Night ${round}: ${finalEliminated.map((id) => updated.find((p) => p.id === id)?.name).join(', ')} were eliminated.${extraLog}${loversLog}`
          : `Night ${round}: No one was eliminated (peaceful night).`;

        set({
          players: updated,
          phase: 'day',
          eliminatedThisNight: [],
          nightSteps,
          currentNightStepIndex: 0,
          nightStepStates: [],
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
        const {
          phase, round, players, discussionTimeSeconds, optionalRules, foxPowerActive, usedGameAbilities
        } = get();
        if (phase === 'day') {
          const roleIds = [...new Set(players.filter((p) => p.isAlive).map((p) => p.roleId))];
          const newRound = round + 1;
          const nightSteps = buildNightSteps(roleIds, newRound, foxPowerActive, usedGameAbilities);
          const nextState: Partial<GameStore> = {
            phase: 'night',
            round: newRound,
            nightSteps,
            currentNightStepIndex: 0,
            eliminatedThisNight: [] as string[],
            optionalRules,
            ravenCursedId: null,
            protectedPlayerId: null,
          });
        } else {
          set({ phase: 'day', timerRemaining: discussionTimeSeconds, nightStepStates: [] });
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

      eliminatePlayer: (id) => {
        const { players, loversIds, log, round, wildChildModelId, wildChildTransformed } = get();
        const strings = getStrings(get().language);
        const toElim = [id];
        if (loversIds && loversIds.includes(id)) {
          const other = loversIds.find((lid) => lid !== id);
          if (other) toElim.push(other);
        }
        const updated = players.map((p) => toElim.includes(p.id) ? { ...p, isAlive: false } : p);
        const newWildChildTransformed =
          wildChildTransformed ||
          (wildChildModelId !== null && toElim.includes(wildChildModelId));
        const elimNames = toElim
          .map((eid) => players.find((p) => p.id === eid)?.name)
          .filter(Boolean)
          .join(' & ');
        set({
          players: updated,
          wildChildTransformed: newWildChildTransformed,
          log: [
            ...log,
            strings.logs.dayElimination(round, elimNames),
          ],
        });
      },

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

      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'loupgarous-game',
      version: 2,
      migrate: (persistedState: unknown) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return persistedState as unknown as GameStore;
        }

        const rest = { ...(persistedState as Record<string, unknown>) };
        delete rest.votes;
        return rest as unknown as GameStore;
      },
    }
  )
);
