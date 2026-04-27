import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Player,
  GameState,
  NightStep,
  NightStepState,
  Language,
  Player as GamePlayer,
} from '../types/game.types';
import {
  getNightOrder,
  isPlayerWolfIdentity,
  REMOVED_ROLE_IDS,
  SETUP_ROLE_IDS,
  WOLF_ROLE_IDS,
} from '../data/roles';
import { getStrings } from '../i18n';
import { getPlayerRoleLabelById } from '../utils/playerLabels';

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
  setRolePowerOverride: (roleId: string, active: boolean | null) => void;
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
  firstDayExecutionDone: false,
  language: 'en',
  protectedPlayerId: null,
  lastProtectedPlayerId: null,
  rolePowerOverrides: {},
};

interface NightStepContext {
  players: GamePlayer[];
  round: number;
  foxPowerActive: boolean;
  usedGameAbilities: string[];
  infectedPlayerIds: string[];
  wolfDogChoice: 'villager' | 'werewolf' | null;
  wildChildTransformed: boolean;
  rolePowerOverrides: Record<string, boolean>;
}

export function getAutoNightRoleAvailability(roleId: string, context: NightStepContext) {
  const witchPotionsAvailable = !(
    context.usedGameAbilities.includes('witch_heal') &&
    context.usedGameAbilities.includes('witch_poison')
  );

  if (roleId === 'witch') return witchPotionsAvailable;
  if (roleId === 'fox') return context.foxPowerActive;
  if (roleId === 'infect_pere') return !context.usedGameAbilities.includes('infect_pere');
  if (roleId === 'big_bad_wolf') {
    return !context.players.some(
      (p) =>
        !p.isAlive &&
        isPlayerWolfIdentity(p, {
          infectedPlayerIds: context.infectedPlayerIds,
          wolfDogChoice: context.wolfDogChoice,
          wildChildTransformed: context.wildChildTransformed,
        })
    );
  }
  return true;
}

export function isNightRoleAvailable(roleId: string, context: NightStepContext) {
  const manualOverride = context.rolePowerOverrides[roleId];
  if (typeof manualOverride === 'boolean') return manualOverride;
  return getAutoNightRoleAvailability(roleId, context);
}

function buildNightSteps(context: NightStepContext): NightStep[] {
  const roleIds = [...new Set(context.players.filter((p) => p.isAlive).map((p) => p.roleId))];
  const hasPackWolf = context.players.some(
    (p) =>
      p.isAlive &&
      p.roleId !== 'white_werewolf' &&
      isPlayerWolfIdentity(p, {
        infectedPlayerIds: context.infectedPlayerIds,
        wolfDogChoice: context.wolfDogChoice,
        wildChildTransformed: context.wildChildTransformed,
      })
  );
  if (hasPackWolf && !roleIds.includes('werewolf')) roleIds.push('werewolf');

  return getNightOrder(roleIds, context.round, true)
    .filter((r) => isNightRoleAvailable(r.id, context))
    .map((r, i) => ({
      roleId: r.id,
      stepIndex: i,
      completed: false,
    }));
}

function clonePlayers(players: Player[]) {
  return players.map((p) => ({ ...p }));
}

function buildNightStepsForState(
  state: Pick<
    GameStore,
    | 'players'
    | 'round'
    | 'foxPowerActive'
    | 'usedGameAbilities'
    | 'infectedPlayerIds'
    | 'wolfDogChoice'
    | 'wildChildTransformed'
    | 'rolePowerOverrides'
  >,
  overrides = state.rolePowerOverrides,
  players = state.players,
  round = state.round
) {
  return buildNightSteps({
    players,
    round,
    foxPowerActive: state.foxPowerActive,
    usedGameAbilities: state.usedGameAbilities,
    infectedPlayerIds: state.infectedPlayerIds,
    wolfDogChoice: state.wolfDogChoice,
    wildChildTransformed: state.wildChildTransformed,
    rolePowerOverrides: overrides,
  });
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
    wildChildModelId: state.wildChildModelId,
    wolfDogChoice: state.wolfDogChoice,
    protectorHistory: state.protectorHistory.map((p) => ({ ...p })),
    protectedPlayerId: state.protectedPlayerId,
    lastProtectedPlayerId: state.lastProtectedPlayerId,
    rolePowerOverrides: { ...state.rolePowerOverrides },
  };
}

export function resolveNightEliminations(
  players: Player[],
  eliminatedThisNight: string[],
  infectedPlayerIds: string[],
  loversIds: [string, string] | null,
  language: Language = 'en',
  eliminationCauses: Record<string, 'wolves' | 'other'> = {}
) {
  const finalEliminated = [...eliminatedThisNight];
  let knightLog = '';
  let loversLog = '';
  const labelFor = (id: string) => getPlayerRoleLabelById(id, players, language);

  const knightPlayer = players.find((p) => p.isAlive && p.roleId === 'knight');
  const knightEliminationCause = knightPlayer
    ? eliminationCauses[knightPlayer.id] ?? 'wolves'
    : undefined;
  if (
    knightPlayer &&
    finalEliminated.includes(knightPlayer.id) &&
    knightEliminationCause === 'wolves'
  ) {
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
          knightLog = `⚔️ Knight's rusty sword: ${labelFor(candidate.id)} dies of tetanus!`;
        }
        break;
      }
    }
  }

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
        loversLog = `💘 Lovers: ${labelFor(chainedPlayer.id)} dies with ${labelFor(fallenId)}.`;
      }
    }
  }

  return { finalEliminated, knightLog, loversLog };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...defaultSetup,
      ...defaultGame,

      setSetup: (s) => set({ ...s }),

      startGame: () => {
        const { roleIds, discussionTime, optionalRules, language } = get();
        const strings = getStrings(language);
        const players: Player[] = roleIds.map((roleId, i) => ({
          id: `p${i}`,
          name: '',
          seatNumber: i + 1,
          roleId: roleId ?? 'villager',
          isAlive: true,
          isMayor: false,
          isLover: false,
          extraVotes: 0,
          usedAbilities: [],
        }));
        const round = 1;
        const rolePowerOverrides: Record<string, boolean> = {};
        const nightSteps = buildNightSteps({
          players,
          round,
          foxPowerActive: true,
          usedGameAbilities: [],
          infectedPlayerIds: [],
          wolfDogChoice: null,
          wildChildTransformed: false,
          rolePowerOverrides,
        });
        const nextState: Partial<GameStore> = {
          phase: 'night',
          round,
          players,
          nightSteps,
          currentNightStepIndex: 0,
          eliminatedThisNight: [],
          timerRemaining: discussionTime,
          discussionTimeSeconds: discussionTime,
          loversIds: null,
          mayorId: null,
          log: [strings.logs.gameStarted(players.length)],
          usedGameAbilities: [],
          optionalRules,
          foxPowerActive: true,
          protectorHistory: [],
          wildChildModelId: null,
          wildChildTransformed: false,
          wolfDogChoice: null,
          enchantedPlayerIds: [],
          infectedPlayerIds: [],
          angelWon: false,
          firstDayExecutionDone: false,
          language: language ?? 'en',
          protectedPlayerId: null,
          lastProtectedPlayerId: null,
          rolePowerOverrides,
        };
        const snapshotBase = { ...get(), ...nextState, nightStepStates: [] } as GameStore;
        const nightStepStates = [captureNightState(snapshotBase)];
        set({ ...nextState, nightStepStates });
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
            wildChildModelId: snapshot.wildChildModelId,
            wolfDogChoice: snapshot.wolfDogChoice,
            protectorHistory: snapshot.protectorHistory.map((p) => ({ ...p })),
            protectedPlayerId: snapshot.protectedPlayerId,
            lastProtectedPlayerId: snapshot.lastProtectedPlayerId,
            rolePowerOverrides: { ...(snapshot.rolePowerOverrides ?? {}) },
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
      setRolePowerOverride: (roleId, active) =>
        set((state) => {
          const rolePowerOverrides = { ...state.rolePowerOverrides };
          if (active === null) delete rolePowerOverrides[roleId];
          else rolePowerOverrides[roleId] = active;

          if (state.phase !== 'night') return { rolePowerOverrides };

          const previousRoleId = state.nightSteps[state.currentNightStepIndex]?.roleId;
          const nextNightSteps = buildNightStepsForState(state, rolePowerOverrides);
          const nextRoleIndex = previousRoleId
            ? nextNightSteps.findIndex((step) => step.roleId === previousRoleId)
            : -1;
          const currentNightStepIndex =
            nextRoleIndex >= 0
              ? nextRoleIndex
              : Math.min(state.currentNightStepIndex, nextNightSteps.length);
          const nightSteps = nextNightSteps.map((step, index) => ({
            ...step,
            completed: index < currentNightStepIndex,
          }));
          const fallbackSnapshot = captureNightState({
            ...state,
            rolePowerOverrides,
            nightSteps,
            currentNightStepIndex,
          } as GameStore);
          const existingHistory = state.nightStepStates ?? [];
          const nightStepStates = Array.from(
            { length: currentNightStepIndex + 1 },
            (_, index) => ({
              ...(existingHistory[index] ?? fallbackSnapshot),
              rolePowerOverrides: { ...rolePowerOverrides },
            })
          );
          nightStepStates[currentNightStepIndex] = fallbackSnapshot;

          return {
            rolePowerOverrides,
            nightSteps,
            currentNightStepIndex,
            nightStepStates,
          };
        }),
      setProtectorTarget: (targetId) =>
        set((s) => {
          const withoutCurrentRound = s.protectorHistory.filter((p) => p.round !== s.round);
          return {
            protectorHistory: [...withoutCurrentRound, { round: s.round, targetId }],
            protectedPlayerId: targetId,
          };
        }),

      applyNightResults: () => {
        const {
          players,
          eliminatedThisNight,
          round,
          discussionTimeSeconds,
          optionalRules,
          infectedPlayerIds,
          wildChildModelId,
          wildChildTransformed,
          log,
          foxPowerActive,
          usedGameAbilities,
          protectorHistory,
          loversIds,
          protectedPlayerId,
          rolePowerOverrides,
          wolfDogChoice,
        } = get();
        const strings = getStrings(get().language);
        const language = get().language;
        const extraLogParts: string[] = [];
        const { finalEliminated, knightLog, loversLog } = resolveNightEliminations(
          players,
          eliminatedThisNight,
          infectedPlayerIds,
          loversIds,
          language
        );

        if (knightLog) extraLogParts.push(knightLog);
        if (loversLog) extraLogParts.push(loversLog);

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
            ? getPlayerRoleLabelById(
              protectionEntry.targetId,
              players,
              language,
              strings.night.protectorUnknown
            )
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

        const newRound = round + 1;
        const nightSteps = buildNightSteps({
          players: updated,
          round: newRound,
          foxPowerActive,
          usedGameAbilities,
          infectedPlayerIds,
          wolfDogChoice,
          wildChildTransformed: newWildChildTransformed,
          rolePowerOverrides,
        });

        const eliminatedNames = finalEliminated
          .map((id) => getPlayerRoleLabelById(id, updated, language, ''))
          .filter(Boolean)
          .join(', ');

        const nightMsg = strings.logs.nightSummary(
          round,
          eliminatedNames || null,
          extraLogParts.length > 0 ? ` ${extraLogParts.join(' ')}` : ''
        );

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
          protectedPlayerId: null,
          lastProtectedPlayerId: protectedPlayerId,
        });
      },

      togglePhase: () => {
        const {
          phase,
          round,
          players,
          discussionTimeSeconds,
          optionalRules,
          foxPowerActive,
          usedGameAbilities,
          infectedPlayerIds,
          wolfDogChoice,
          wildChildTransformed,
          rolePowerOverrides,
        } = get();
        if (phase === 'day') {
          const newRound = round + 1;
          const nightSteps = buildNightSteps({
            players,
            round: newRound,
            foxPowerActive,
            usedGameAbilities,
            infectedPlayerIds,
            wolfDogChoice,
            wildChildTransformed,
            rolePowerOverrides,
          });
          const nextState: Partial<GameStore> = {
            phase: 'night',
            round: newRound,
            nightSteps,
            currentNightStepIndex: 0,
            eliminatedThisNight: [],
            optionalRules,
            protectedPlayerId: null,
          };
          const snapshotBase = { ...get(), ...nextState, nightStepStates: [] } as GameStore;
          const nightStepStates = [captureNightState(snapshotBase)];
          set({ ...nextState, nightStepStates });
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
        const {
          phase,
          players,
          loversIds,
          log,
          round,
          wildChildModelId,
          wildChildTransformed,
          firstDayExecutionDone,
        } = get();
        const strings = getStrings(get().language);
        const language = get().language;
        const toElim = [id];
        if (loversIds && loversIds.includes(id)) {
          const other = loversIds.find((lid) => lid !== id);
          if (other) toElim.push(other);
        }
        const updated = players.map((p) => toElim.includes(p.id) ? { ...p, isAlive: false } : p);
        const isFirstDayExecution = phase === 'day' && round === 1 && !firstDayExecutionDone;
        const executedPlayer = players.find((p) => p.id === id);
        const angelWins = isFirstDayExecution && executedPlayer?.roleId === 'angel';
        const finalPlayers =
          isFirstDayExecution && !angelWins
            ? updated.map((p) => (p.isAlive && p.roleId === 'angel' ? { ...p, roleId: 'villager' } : p))
            : updated;
        const newWildChildTransformed =
          wildChildTransformed ||
          (wildChildModelId !== null && toElim.includes(wildChildModelId));
        const elimNames = toElim
          .map((eid) => getPlayerRoleLabelById(eid, players, language, ''))
          .filter(Boolean)
          .join(' & ');
        set({
          players: finalPlayers,
          wildChildTransformed: newWildChildTransformed,
          angelWon: angelWins || get().angelWon,
          firstDayExecutionDone: firstDayExecutionDone || isFirstDayExecution,
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
        const sanitizeRoleId = (roleId: unknown) =>
          typeof roleId === 'string' && SETUP_ROLE_IDS.has(roleId) && !REMOVED_ROLE_IDS.has(roleId)
            ? roleId
            : 'villager';
        const normalizePlayer = (player: unknown, index: number) => {
          const raw = player && typeof player === 'object' ? player as Record<string, unknown> : {};
          return {
            ...raw,
            id: typeof raw.id === 'string' ? raw.id : `p${index}`,
            name: typeof raw.name === 'string' ? raw.name : '',
            seatNumber: typeof raw.seatNumber === 'number' ? raw.seatNumber : index + 1,
            roleId: sanitizeRoleId(raw.roleId),
            isAlive: typeof raw.isAlive === 'boolean' ? raw.isAlive : true,
            isMayor: typeof raw.isMayor === 'boolean' ? raw.isMayor : false,
            isLover: typeof raw.isLover === 'boolean' ? raw.isLover : false,
            extraVotes: typeof raw.extraVotes === 'number' ? raw.extraVotes : 0,
            usedAbilities: Array.isArray(raw.usedAbilities) ? raw.usedAbilities : [],
          } as Player;
        };
        const normalizeOverrides = (value: unknown) => {
          if (!value || typeof value !== 'object') return {};
          return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).filter(
              ([roleId, active]) => SETUP_ROLE_IDS.has(roleId) && typeof active === 'boolean'
            )
          ) as Record<string, boolean>;
        };
        const normalizeProtectorHistory = (value: unknown) =>
          Array.isArray(value)
            ? value
              .map((entry) => {
                const raw = entry && typeof entry === 'object' ? entry as Record<string, unknown> : {};
                return {
                  round: typeof raw.round === 'number' ? raw.round : 0,
                  targetId: typeof raw.targetId === 'string' ? raw.targetId : null,
                };
              })
              .filter((entry) => entry.round > 0)
            : [];
        const normalizeLoversIds = (value: unknown) =>
          Array.isArray(value) &&
          value.length === 2 &&
          typeof value[0] === 'string' &&
          typeof value[1] === 'string'
            ? value as [string, string]
            : null;

        delete rest.votes;
        rest.rolePowerOverrides = normalizeOverrides(rest.rolePowerOverrides);
        if (typeof rest.firstDayExecutionDone !== 'boolean') rest.firstDayExecutionDone = false;
        rest.loversIds = normalizeLoversIds(rest.loversIds);
        if (Array.isArray(rest.roleIds)) rest.roleIds = rest.roleIds.map(sanitizeRoleId);
        if (Array.isArray(rest.players)) {
          rest.players = rest.players.map(normalizePlayer);
        }
        if (Array.isArray(rest.nightSteps)) {
          const currentNightStepIndex =
            typeof rest.currentNightStepIndex === 'number'
              ? Math.max(0, rest.currentNightStepIndex)
              : 0;
          let adjustedCurrentNightStepIndex = 0;
          const nightSteps = rest.nightSteps.flatMap((step, originalIndex) => {
            const raw = step && typeof step === 'object'
              ? step as Record<string, unknown>
              : {};
            const roleId = raw.roleId;
            if (
              typeof roleId !== 'string' ||
              !SETUP_ROLE_IDS.has(roleId) ||
              REMOVED_ROLE_IDS.has(roleId)
            ) return [];
            if (originalIndex < currentNightStepIndex) adjustedCurrentNightStepIndex += 1;
            return [{
              ...raw,
              roleId,
              stepIndex: 0,
            }];
          }).map((step, index) => ({
            ...step,
            stepIndex: index,
            completed: index < adjustedCurrentNightStepIndex,
          }));
          rest.nightSteps = nightSteps;
          rest.currentNightStepIndex = Math.min(adjustedCurrentNightStepIndex, nightSteps.length);
        }
        if (Array.isArray(rest.nightStepStates)) {
          rest.nightStepStates = rest.nightStepStates.map((snapshot) => {
            const raw = snapshot && typeof snapshot === 'object'
              ? snapshot as Record<string, unknown>
              : {};
            return {
              ...raw,
              eliminatedThisNight: Array.isArray(raw.eliminatedThisNight) ? raw.eliminatedThisNight : [],
              usedGameAbilities: Array.isArray(raw.usedGameAbilities) ? raw.usedGameAbilities : [],
              enchantedPlayerIds: Array.isArray(raw.enchantedPlayerIds) ? raw.enchantedPlayerIds : [],
              infectedPlayerIds: Array.isArray(raw.infectedPlayerIds) ? raw.infectedPlayerIds : [],
              loversIds: normalizeLoversIds(raw.loversIds),
              players: Array.isArray(raw.players) ? raw.players.map(normalizePlayer) : [],
              foxPowerActive: typeof raw.foxPowerActive === 'boolean' ? raw.foxPowerActive : true,
              wildChildModelId: typeof raw.wildChildModelId === 'string' ? raw.wildChildModelId : null,
              wolfDogChoice: raw.wolfDogChoice === 'villager' || raw.wolfDogChoice === 'werewolf'
                ? raw.wolfDogChoice
                : null,
              protectorHistory: normalizeProtectorHistory(raw.protectorHistory),
              protectedPlayerId: typeof raw.protectedPlayerId === 'string' ? raw.protectedPlayerId : null,
              lastProtectedPlayerId: typeof raw.lastProtectedPlayerId === 'string' ? raw.lastProtectedPlayerId : null,
              rolePowerOverrides: normalizeOverrides(raw.rolePowerOverrides),
            } satisfies NightStepState;
          });
        }
        return rest as unknown as GameStore;
      },
    }
  )
);
