import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameState,
  Language,
  NightStep,
  NightStepState,
  Player,
  PlayerStatus,
  ResolutionItem,
  SavedSession,
  SessionSnapshot,
  SessionState,
  UIMode,
  VoteState,
} from '../types/game.types';
import { getNightOrder, WOLF_ROLE_IDS } from '../data/roles';
import { getStrings } from '../i18n';

interface SetupState {
  playerNames: string[];
  roleIds: string[];
  discussionTime: number;
  optionalRules: Record<string, boolean>;
  savedSessions: SavedSession[];
}

interface SetupConfig {
  playerNames: string[];
  roleIds: string[];
  discussionTime: number;
  optionalRules: Record<string, boolean>;
  seatOrder?: string[];
}

interface StoreActions {
  setSetup: (s: SetupConfig) => void;
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
  setUiMode: (mode: UIMode) => void;
  togglePrivacyMode: () => void;
  moveSeat: (playerId: string, direction: 'up' | 'down') => void;
  setPlayerStatusFlag: <K extends keyof PlayerStatus>(playerId: string, flag: K, value?: boolean) => void;
  toggleRoleReveal: (playerId: string) => void;
  undoLastAction: () => void;
  saveNamedSession: (name: string) => void;
  loadNamedSession: (sessionId: string) => void;
  deleteNamedSession: (sessionId: string) => void;
  setVoteAssistActive: (active: boolean) => void;
  adjustVote: (playerId: string, delta: number) => void;
  toggleNoVote: (playerId: string) => void;
  resetVoteAssist: () => void;
  clearResolutionQueue: () => void;
}

export type GameStore = SetupState & GameState & StoreActions;

const defaultSetup: SetupState = {
  playerNames: [],
  roleIds: [],
  discussionTime: 180,
  optionalRules: {},
  savedSessions: [],
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
  language: 'en',
  protectedPlayerId: null,
  lastProtectedPlayerId: null,
  seatOrder: [],
  playerStatuses: {},
  resolutionQueue: [],
  sessionSnapshots: [],
  uiMode: 'prepare',
  privacyMode: false,
  voteAssist: null,
};

function createDefaultPlayerStatus(): PlayerStatus {
  return {
    protected: false,
    cursed: false,
    silenced: false,
    noVote: false,
    cannotBeProtected: false,
    enchanted: false,
    infected: false,
    lovers: false,
    mayor: false,
    roleLocked: false,
    revealed: false,
    transformed: false,
  };
}

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
    .filter((role) => role.id !== 'witch' || witchPotionsAvailable)
    .map((role, index) => ({
      roleId: role.id,
      stepIndex: index,
      completed: false,
    }));
}

function clonePlayers(players: Player[]) {
  return players.map((player) => ({ ...player, usedAbilities: [...player.usedAbilities] }));
}

function cloneStatuses(statuses: Record<string, PlayerStatus>) {
  return Object.fromEntries(
    Object.entries(statuses).map(([id, status]) => [id, { ...status }])
  ) as Record<string, PlayerStatus>;
}

function cloneVoteAssist(voteAssist: VoteState | null) {
  if (!voteAssist) return null;
  return {
    active: voteAssist.active,
    votes: { ...voteAssist.votes },
    noVoteIds: [...voteAssist.noVoteIds],
  };
}

function normalizeSeatOrder(players: Pick<Player, 'id'>[], seatOrder: string[]) {
  const validIds = new Set(players.map((player) => player.id));
  const ordered = seatOrder.filter((id) => validIds.has(id));
  const missing = players.map((player) => player.id).filter((id) => !ordered.includes(id));
  return [...ordered, ...missing];
}

function getPlayersInSeatOrder(players: Player[], seatOrder: string[]) {
  const order = normalizeSeatOrder(players, seatOrder);
  return order
    .map((id) => players.find((player) => player.id === id))
    .filter((player): player is Player => Boolean(player));
}

function reorderArrayItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function buildVoteAssist(players: Player[], current?: VoteState | null): VoteState {
  return {
    active: current?.active ?? true,
    votes: Object.fromEntries(players.map((player) => [player.id, current?.votes[player.id] ?? 0])),
    noVoteIds: [...(current?.noVoteIds ?? [])].filter((id) => players.some((player) => player.id === id)),
  };
}

function derivePlayerStatuses(state: Pick<
  GameStore,
  | 'players'
  | 'playerStatuses'
  | 'protectedPlayerId'
  | 'ravenCursedId'
  | 'enchantedPlayerIds'
  | 'infectedPlayerIds'
  | 'loversIds'
  | 'mayorId'
  | 'wildChildTransformed'
  | 'wolfDogChoice'
  | 'voteAssist'
> & Partial<GameStore>) {
  return Object.fromEntries(
    state.players.map((player) => {
      const current = state.playerStatuses[player.id] ?? createDefaultPlayerStatus();
      const transformed =
        (player.roleId === 'wild_child' && state.wildChildTransformed) ||
        (player.roleId === 'wolf_dog' && state.wolfDogChoice === 'werewolf');

      return [
        player.id,
        {
          ...current,
          protected: state.protectedPlayerId === player.id,
          cursed: state.ravenCursedId === player.id,
          enchanted: state.enchantedPlayerIds.includes(player.id),
          infected: state.infectedPlayerIds.includes(player.id),
          lovers: state.loversIds?.includes(player.id) ?? false,
          mayor: state.mayorId === player.id,
          noVote: current.noVote || (state.voteAssist?.noVoteIds.includes(player.id) ?? false),
          transformed,
        },
      ];
    })
  ) as Record<string, PlayerStatus>;
}

function cloneSessionState(state: SessionState): SessionState {
  return {
    phase: state.phase,
    round: state.round,
    players: clonePlayers(state.players),
    nightSteps: state.nightSteps.map((step) => ({ ...step })),
    currentNightStepIndex: state.currentNightStepIndex,
    eliminatedThisNight: [...state.eliminatedThisNight],
    discussionTimeSeconds: state.discussionTimeSeconds,
    timerRunning: state.timerRunning,
    timerRemaining: state.timerRemaining,
    loversIds: state.loversIds ? [...state.loversIds] as [string, string] : null,
    mayorId: state.mayorId,
    log: [...state.log],
    usedGameAbilities: [...state.usedGameAbilities],
    optionalRules: { ...state.optionalRules },
    foxPowerActive: state.foxPowerActive,
    wildChildModelId: state.wildChildModelId,
    wildChildTransformed: state.wildChildTransformed,
    wolfDogChoice: state.wolfDogChoice,
    enchantedPlayerIds: [...state.enchantedPlayerIds],
    infectedPlayerIds: [...state.infectedPlayerIds],
    angelWon: state.angelWon,
    wolfVictimId: state.wolfVictimId,
    ravenCursedId: state.ravenCursedId,
    language: state.language,
    nightStepStates: state.nightStepStates.map((snapshot) => ({
      ...snapshot,
      eliminatedThisNight: [...snapshot.eliminatedThisNight],
      usedGameAbilities: [...snapshot.usedGameAbilities],
      enchantedPlayerIds: [...snapshot.enchantedPlayerIds],
      infectedPlayerIds: [...snapshot.infectedPlayerIds],
      loversIds: snapshot.loversIds ? [...snapshot.loversIds] as [string, string] : null,
      players: clonePlayers(snapshot.players),
      protectorHistory: snapshot.protectorHistory.map((entry) => ({ ...entry })),
    })),
    protectorHistory: state.protectorHistory.map((entry) => ({ ...entry })),
    protectedPlayerId: state.protectedPlayerId,
    lastProtectedPlayerId: state.lastProtectedPlayerId,
    seatOrder: [...state.seatOrder],
    playerStatuses: cloneStatuses(state.playerStatuses),
    resolutionQueue: state.resolutionQueue.map((item) => ({ ...item, playerIds: [...item.playerIds] })),
    uiMode: state.uiMode,
    privacyMode: state.privacyMode,
    voteAssist: cloneVoteAssist(state.voteAssist),
  };
}

function captureSessionState(state: GameStore): SessionState {
  return cloneSessionState({
    phase: state.phase,
    round: state.round,
    players: state.players,
    nightSteps: state.nightSteps,
    currentNightStepIndex: state.currentNightStepIndex,
    eliminatedThisNight: state.eliminatedThisNight,
    discussionTimeSeconds: state.discussionTimeSeconds,
    timerRunning: state.timerRunning,
    timerRemaining: state.timerRemaining,
    loversIds: state.loversIds,
    mayorId: state.mayorId,
    log: state.log,
    usedGameAbilities: state.usedGameAbilities,
    optionalRules: state.optionalRules,
    foxPowerActive: state.foxPowerActive,
    wildChildModelId: state.wildChildModelId,
    wildChildTransformed: state.wildChildTransformed,
    wolfDogChoice: state.wolfDogChoice,
    enchantedPlayerIds: state.enchantedPlayerIds,
    infectedPlayerIds: state.infectedPlayerIds,
    angelWon: state.angelWon,
    wolfVictimId: state.wolfVictimId,
    ravenCursedId: state.ravenCursedId,
    language: state.language,
    nightStepStates: state.nightStepStates,
    protectorHistory: state.protectorHistory,
    protectedPlayerId: state.protectedPlayerId,
    lastProtectedPlayerId: state.lastProtectedPlayerId,
    seatOrder: state.seatOrder,
    playerStatuses: state.playerStatuses,
    resolutionQueue: state.resolutionQueue,
    uiMode: state.uiMode,
    privacyMode: state.privacyMode,
    voteAssist: state.voteAssist,
  });
}

function createSnapshot(state: GameStore, reason: string): SessionSnapshot {
  return {
    id: `snapshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    reason,
    createdAt: Date.now(),
    state: captureSessionState(state),
  };
}

function buildResolutionQueue(
  state: GameStore,
  strings: ReturnType<typeof getStrings>,
  finalEliminated: string[],
  extraLogParts: string[],
  protectedSaved: boolean
): ResolutionItem[] {
  const queue: ResolutionItem[] = [];

  if (protectedSaved && state.protectedPlayerId) {
    const protectedName = state.players.find((player) => player.id === state.protectedPlayerId)?.name;
    if (protectedName) {
      queue.push({
        id: `resolution-save-${state.round}`,
        round: state.round,
        phase: 'day',
        type: 'save',
        title: 'Protection held',
        detail: `${protectedName} survived because the Protector covered them.`,
        playerIds: [state.protectedPlayerId],
        public: false,
      });
    }
  }

  finalEliminated.forEach((playerId, index) => {
    const player = state.players.find((candidate) => candidate.id === playerId);
    if (!player) return;
    queue.push({
      id: `resolution-death-${state.round}-${index}`,
      round: state.round,
      phase: 'day',
      type: 'death',
      title: `${player.name} dies`,
      detail: `${player.name} should be removed at dawn.`,
      playerIds: [playerId],
      public: true,
    });
  });

  extraLogParts.forEach((message, index) => {
    queue.push({
      id: `resolution-extra-${state.round}-${index}`,
      round: state.round,
      phase: 'day',
      type: 'chain',
      title: strings.game.log.title,
      detail: message,
      playerIds: [],
      public: false,
    });
  });

  if (state.ravenCursedId) {
    const cursedName = state.players.find((player) => player.id === state.ravenCursedId)?.name;
    if (cursedName) {
      queue.push({
        id: `resolution-raven-${state.round}`,
        round: state.round,
        phase: 'day',
        type: 'status',
        title: 'Raven curse',
        detail: `${cursedName} starts the day with +2 votes against them.`,
        playerIds: [state.ravenCursedId],
        public: false,
      });
    }
  }

  return queue;
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
    protectorHistory: state.protectorHistory.map((entry) => ({ ...entry })),
    protectedPlayerId: state.protectedPlayerId,
    lastProtectedPlayerId: state.lastProtectedPlayerId,
  };
}

export function resolveNightEliminations(
  players: Player[],
  eliminatedThisNight: string[],
  infectedPlayerIds: string[],
  loversIds: [string, string] | null,
  seatOrder: string[] = []
) {
  const finalEliminated = [...eliminatedThisNight];
  let knightLog = '';
  let loversLog = '';
  const orderedPlayers = getPlayersInSeatOrder(players, seatOrder);

  const knightPlayer = players.find((player) => player.isAlive && player.roleId === 'knight');
  if (knightPlayer && finalEliminated.includes(knightPlayer.id)) {
    const total = orderedPlayers.length;
    const knightIndex = orderedPlayers.findIndex((player) => player.id === knightPlayer.id);
    for (let offset = 1; offset < total; offset++) {
      const candidate = orderedPlayers[(knightIndex - offset + total) % total];
      if (!candidate.isAlive) continue;
      if (WOLF_ROLE_IDS.includes(candidate.roleId) || infectedPlayerIds.includes(candidate.id)) {
        if (!finalEliminated.includes(candidate.id)) {
          finalEliminated.push(candidate.id);
          knightLog = `⚔️ Knight's rusty sword: ${candidate.name} dies of tetanus!`;
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
      const chainedPlayer = players.find((player) => player.id === chainedId);

      if (chainedPlayer?.isAlive && !finalEliminated.includes(chainedId)) {
        finalEliminated.push(chainedId);
        const fallenName = players.find((player) => player.id === fallenId)?.name ?? 'Unknown';
        loversLog = `💘 Lovers: ${chainedPlayer.name} dies with ${fallenName}.`;
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

      setSetup: (setup) =>
        set((state) => ({
          playerNames: [...setup.playerNames],
          roleIds: [...setup.roleIds],
          discussionTime: setup.discussionTime,
          optionalRules: { ...setup.optionalRules },
          seatOrder:
            setup.seatOrder && setup.seatOrder.length === setup.playerNames.length
              ? [...setup.seatOrder]
              : normalizeSeatOrder(
                  setup.playerNames.map((_, index) => ({ id: `p${index}` })),
                  state.seatOrder
                ),
        })),

      startGame: () => {
        const { playerNames, roleIds, discussionTime, optionalRules, language, seatOrder } = get();
        const strings = getStrings(language);
        const players: Player[] = playerNames.map((name, index) => ({
          id: `p${index}`,
          name,
          roleId: roleIds[index] ?? 'villager',
          isAlive: true,
          isMayor: false,
          isLover: false,
          extraVotes: 0,
          usedAbilities: [],
        }));
        const round = 1;
        const normalizedSeatOrder = normalizeSeatOrder(players, seatOrder);
        const nightSteps = buildNightSteps(
          [...new Set(players.map((player) => player.roleId))],
          round,
          true,
          []
        );
        const snapshotBase = {
          ...get(),
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
          optionalRules: { ...optionalRules },
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
          seatOrder: normalizedSeatOrder,
          playerStatuses: Object.fromEntries(players.map((player) => [player.id, createDefaultPlayerStatus()])),
          resolutionQueue: [],
          sessionSnapshots: [],
          uiMode: 'run' as UIMode,
          privacyMode: false,
          voteAssist: null,
          nightStepStates: [],
        } as GameStore;
        const nightStepStates = [captureNightState(snapshotBase)];
        const playerStatuses = derivePlayerStatuses({ ...snapshotBase, nightStepStates });
        const nextState = { ...snapshotBase, nightStepStates, playerStatuses };
        set({
          ...nextState,
          sessionSnapshots: [createSnapshot(nextState, 'Game start')],
        });
      },

      resetGame: () =>
        set((state) => ({
          ...defaultSetup,
          ...defaultGame,
          language: state.language,
          savedSessions: state.savedSessions,
        })),

      completeNightStep: () =>
        set((state) => {
          const nightSteps = state.nightSteps.map((step, index) =>
            index === state.currentNightStepIndex ? { ...step, completed: true } : step
          );
          const currentNightStepIndex = state.currentNightStepIndex + 1;
          const nightStepStates = [...state.nightStepStates];
          nightStepStates[currentNightStepIndex] = captureNightState(state);
          return { nightSteps, currentNightStepIndex, nightStepStates };
        }),

      goToNightStep: (index) =>
        set((state) => {
          const target = Math.max(0, Math.min(index, state.nightSteps.length - 1));
          const snapshot = state.nightStepStates[target];
          if (!snapshot) return {};
          const players = clonePlayers(snapshot.players);
          const nightSteps = state.nightSteps.map((step, stepIndex) => ({
            ...step,
            completed: stepIndex < target,
          }));
          const voteAssist = state.voteAssist ? buildVoteAssist(players, state.voteAssist) : null;
          const playerStatuses = derivePlayerStatuses({
            ...state,
            players,
            enchantedPlayerIds: [...snapshot.enchantedPlayerIds],
            infectedPlayerIds: [...snapshot.infectedPlayerIds],
            loversIds: snapshot.loversIds ? [...snapshot.loversIds] as [string, string] : null,
            ravenCursedId: snapshot.ravenCursedId,
            protectedPlayerId: snapshot.protectedPlayerId,
            lastProtectedPlayerId: snapshot.lastProtectedPlayerId,
            wolfDogChoice: snapshot.wolfDogChoice,
            voteAssist,
          });
          return {
            eliminatedThisNight: [...snapshot.eliminatedThisNight],
            usedGameAbilities: [...snapshot.usedGameAbilities],
            enchantedPlayerIds: [...snapshot.enchantedPlayerIds],
            infectedPlayerIds: [...snapshot.infectedPlayerIds],
            loversIds: snapshot.loversIds ? [...snapshot.loversIds] as [string, string] : null,
            players,
            foxPowerActive: snapshot.foxPowerActive,
            wolfVictimId: snapshot.wolfVictimId,
            ravenCursedId: snapshot.ravenCursedId,
            wildChildModelId: snapshot.wildChildModelId,
            wolfDogChoice: snapshot.wolfDogChoice,
            protectorHistory: snapshot.protectorHistory.map((entry) => ({ ...entry })),
            protectedPlayerId: snapshot.protectedPlayerId,
            lastProtectedPlayerId: snapshot.lastProtectedPlayerId,
            nightSteps,
            currentNightStepIndex: target,
            nightStepStates: state.nightStepStates.slice(0, target + 1),
            voteAssist,
            playerStatuses,
          };
        }),

      setEliminatedThisNight: (ids) => set({ eliminatedThisNight: ids }),
      useGameAbility: (key) => set((state) => ({ usedGameAbilities: [...state.usedGameAbilities, key] })),
      setWildChildModel: (id) => set({ wildChildModelId: id }),
      setWolfDogChoice: (choice) =>
        set((state) => ({
          wolfDogChoice: choice,
          playerStatuses: derivePlayerStatuses({ ...state, wolfDogChoice: choice }),
        })),
      addEnchanted: (ids) =>
        set((state) => {
          const enchantedPlayerIds = [...new Set([...state.enchantedPlayerIds, ...ids])];
          return {
            enchantedPlayerIds,
            playerStatuses: derivePlayerStatuses({ ...state, enchantedPlayerIds }),
          };
        }),
      infectPlayer: (id) =>
        set((state) => {
          const infectedPlayerIds = [...new Set([...state.infectedPlayerIds, id])];
          return {
            eliminatedThisNight: state.eliminatedThisNight.filter((playerId) => playerId !== id),
            infectedPlayerIds,
            usedGameAbilities: [...state.usedGameAbilities, 'infect_pere'],
            playerStatuses: derivePlayerStatuses({ ...state, infectedPlayerIds }),
          };
        }),
      setAngelWon: (val) => set({ angelWon: val }),
      setFoxPowerActive: (active) => set({ foxPowerActive: active }),
      setWolfVictimId: (id) => set({ wolfVictimId: id }),
      setRavenCursed: (id) =>
        set((state) => ({
          ravenCursedId: id,
          playerStatuses: derivePlayerStatuses({ ...state, ravenCursedId: id }),
        })),
      setProtectorTarget: (targetId) =>
        set((state) => {
          const protectorHistory = [
            ...state.protectorHistory.filter((entry) => entry.round !== state.round),
            { round: state.round, targetId },
          ];
          return {
            protectorHistory,
            protectedPlayerId: targetId,
            playerStatuses: derivePlayerStatuses({ ...state, protectorHistory, protectedPlayerId: targetId }),
          };
        }),

      applyNightResults: () => {
        const state = get();
        const strings = getStrings(state.language);
        const extraLogParts: string[] = [];
        const { finalEliminated, knightLog, loversLog } = resolveNightEliminations(
          state.players,
          state.eliminatedThisNight,
          state.infectedPlayerIds,
          state.loversIds,
          state.seatOrder
        );

        if (knightLog) extraLogParts.push(knightLog);
        if (loversLog) extraLogParts.push(loversLog);

        const witchHealUsed = state.usedGameAbilities.includes('witch_heal');
        const witchPoisonUsed = state.usedGameAbilities.includes('witch_poison');
        if (witchHealUsed || witchPoisonUsed) {
          extraLogParts.push(strings.logs.witchPotionsStatus(witchHealUsed, witchPoisonUsed));
          if (witchHealUsed && witchPoisonUsed) extraLogParts.push(strings.logs.witchPotionsSpent);
        }

        const protectionEntry = state.protectorHistory.find((entry) => entry.round === state.round);
        if (protectionEntry) {
          const targetName = protectionEntry.targetId
            ? state.players.find((player) => player.id === protectionEntry.targetId)?.name ?? strings.night.protectorUnknown
            : '';
          extraLogParts.push(
            protectionEntry.targetId
              ? strings.logs.protectorProtected(targetName)
              : strings.logs.protectorNoProtection
          );
        }

        const players = state.players.map((player) =>
          finalEliminated.includes(player.id) ? { ...player, isAlive: false } : player
        );
        const wildChildTransformed =
          state.wildChildTransformed ||
          (state.wildChildModelId !== null && finalEliminated.includes(state.wildChildModelId));
        const roleIds = [...new Set(players.filter((player) => player.isAlive).map((player) => player.roleId))];
        const newRound = state.round + 1;
        const nightSteps = buildNightSteps(roleIds, newRound, state.foxPowerActive, state.usedGameAbilities);
        const eliminatedNames = finalEliminated
          .map((playerId) => players.find((player) => player.id === playerId)?.name)
          .filter(Boolean)
          .join(', ');
        const nightMsg = strings.logs.nightSummary(
          state.round,
          eliminatedNames || null,
          extraLogParts.length > 0 ? ` ${extraLogParts.join(' ')}` : ''
        );
        const protectedSaved =
          !!state.protectedPlayerId &&
          state.protectedPlayerId === state.wolfVictimId &&
          !finalEliminated.includes(state.protectedPlayerId);
        const voteAssist = null;
        const resolutionQueue = buildResolutionQueue(state, strings, finalEliminated, extraLogParts, protectedSaved);
        const base = {
          ...state,
          players,
          phase: 'day' as const,
          eliminatedThisNight: [],
          nightSteps,
          currentNightStepIndex: 0,
          nightStepStates: [],
          timerRemaining: state.discussionTimeSeconds,
          log: [...state.log, nightMsg],
          wildChildTransformed,
          wolfVictimId: null,
          protectedPlayerId: null,
          lastProtectedPlayerId: state.protectedPlayerId,
          resolutionQueue,
          voteAssist,
          uiMode: 'run' as UIMode,
        };
        const playerStatuses = derivePlayerStatuses(base);
        set({
          ...base,
          playerStatuses,
          sessionSnapshots: [...state.sessionSnapshots, createSnapshot({ ...base, playerStatuses } as GameStore, `Reveal day ${state.round}`)],
        });
      },

      togglePhase: () => {
        const state = get();
        if (state.phase === 'day') {
          const roleIds = [...new Set(state.players.filter((player) => player.isAlive).map((player) => player.roleId))];
          const round = state.round + 1;
          const nightSteps = buildNightSteps(roleIds, round, state.foxPowerActive, state.usedGameAbilities);
          const base = {
            ...state,
            phase: 'night' as const,
            round,
            nightSteps,
            currentNightStepIndex: 0,
            eliminatedThisNight: [],
            ravenCursedId: null,
            protectedPlayerId: null,
            resolutionQueue: [],
            voteAssist: null,
            nightStepStates: [],
            uiMode: 'run' as UIMode,
          };
          const nightStepStates = [captureNightState(base as GameStore)];
          const playerStatuses = derivePlayerStatuses({ ...base, nightStepStates });
          set({
            ...base,
            nightStepStates,
            playerStatuses,
            sessionSnapshots: [...state.sessionSnapshots, createSnapshot({ ...base, nightStepStates, playerStatuses } as GameStore, `Start night ${round}`)],
          });
          return;
        }

        const voteAssist = buildVoteAssist(state.players, state.voteAssist);
        set({
          phase: 'day',
          timerRemaining: state.discussionTimeSeconds,
          nightStepStates: [],
          voteAssist,
          playerStatuses: derivePlayerStatuses({ ...state, voteAssist }),
        });
      },

      startTimer: () => set({ timerRunning: true }),
      stopTimer: () => set({ timerRunning: false }),
      tickTimer: () => {
        const { timerRemaining, timerRunning } = get();
        if (timerRunning && timerRemaining > 0) set({ timerRemaining: timerRemaining - 1 });
        else if (timerRemaining <= 0) set({ timerRunning: false });
      },
      resetTimer: () => set((state) => ({ timerRemaining: state.discussionTimeSeconds, timerRunning: false })),

      eliminatePlayer: (id) => {
        const state = get();
        const strings = getStrings(state.language);
        const toEliminate = [id];
        if (state.loversIds && state.loversIds.includes(id)) {
          const other = state.loversIds.find((loverId) => loverId !== id);
          if (other) toEliminate.push(other);
        }
        const players = state.players.map((player) =>
          toEliminate.includes(player.id) ? { ...player, isAlive: false } : player
        );
        const wildChildTransformed =
          state.wildChildTransformed ||
          (state.wildChildModelId !== null && toEliminate.includes(state.wildChildModelId));
        const eliminatedNames = toEliminate
          .map((playerId) => state.players.find((player) => player.id === playerId)?.name)
          .filter(Boolean)
          .join(' & ');
        const resolutionQueue = [
          {
            id: `day-elim-${Date.now()}`,
            round: state.round,
            phase: 'day' as const,
            type: 'death' as const,
            title: `${eliminatedNames} eliminated`,
            detail: strings.logs.dayElimination(state.round, eliminatedNames),
            playerIds: [...toEliminate],
            public: true,
          },
          ...state.resolutionQueue,
        ];
        const voteAssist = state.voteAssist ? buildVoteAssist(players, state.voteAssist) : null;
        const base = {
          ...state,
          players,
          wildChildTransformed,
          log: [...state.log, strings.logs.dayElimination(state.round, eliminatedNames)],
          resolutionQueue,
          voteAssist,
        };
        const playerStatuses = derivePlayerStatuses(base);
        set({
          ...base,
          playerStatuses,
          sessionSnapshots: [...state.sessionSnapshots, createSnapshot({ ...base, playerStatuses } as GameStore, `Eliminate ${eliminatedNames}`)],
        });
      },

      electMayor: (id) =>
        set((state) => {
          const players = state.players.map((player) => ({ ...player, isMayor: player.id === id }));
          return {
            mayorId: id,
            players,
            playerStatuses: derivePlayerStatuses({ ...state, players, mayorId: id }),
          };
        }),

      setLovers: (id1, id2) =>
        set((state) => {
          const loversIds: [string, string] = [id1, id2];
          const players = state.players.map((player) => ({
            ...player,
            isLover: player.id === id1 || player.id === id2,
          }));
          return {
            loversIds,
            players,
            playerStatuses: derivePlayerStatuses({ ...state, players, loversIds }),
          };
        }),

      addLog: (message) => set((state) => ({ log: [...state.log, message] })),
      setLanguage: (lang) => set({ language: lang }),
      setUiMode: (mode) => set({ uiMode: mode }),
      togglePrivacyMode: () => set((state) => ({ privacyMode: !state.privacyMode })),

      moveSeat: (playerId, direction) =>
        set((state) => {
          const seatOrder = normalizeSeatOrder(state.players, state.seatOrder);
          const fromIndex = seatOrder.indexOf(playerId);
          if (fromIndex === -1) return {};
          const toIndex = fromIndex + (direction === 'up' ? -1 : 1);
          if (toIndex < 0 || toIndex >= seatOrder.length) return {};
          return { seatOrder: reorderArrayItem(seatOrder, fromIndex, toIndex) };
        }),

      setPlayerStatusFlag: (playerId, flag, value) =>
        set((state) => {
          const current = state.playerStatuses[playerId] ?? createDefaultPlayerStatus();
          const nextValue = value ?? !current[flag];
          const playerStatuses = {
            ...state.playerStatuses,
            [playerId]: {
              ...current,
              [flag]: nextValue,
            },
          };
          const voteAssist =
            flag === 'noVote' && state.voteAssist
              ? {
                  ...state.voteAssist,
                  noVoteIds: nextValue
                    ? [...new Set([...state.voteAssist.noVoteIds, playerId])]
                    : state.voteAssist.noVoteIds.filter((id) => id !== playerId),
                }
              : state.voteAssist;
          return { playerStatuses, voteAssist };
        }),

      toggleRoleReveal: (playerId) =>
        set((state) => {
          const current = state.playerStatuses[playerId] ?? createDefaultPlayerStatus();
          return {
            playerStatuses: {
              ...state.playerStatuses,
              [playerId]: {
                ...current,
                revealed: !current.revealed,
              },
            },
          };
        }),

      undoLastAction: () => {
        const state = get();
        if (state.sessionSnapshots.length <= 1) return;
        const sessionSnapshots = [...state.sessionSnapshots];
        sessionSnapshots.pop();
        const previous = sessionSnapshots[sessionSnapshots.length - 1];
        if (!previous) return;
        set({
          ...cloneSessionState(previous.state),
          savedSessions: state.savedSessions,
          sessionSnapshots,
        });
      },

      saveNamedSession: (name) =>
        set((state) => {
          const trimmed = name.trim();
          if (!trimmed) return {};
          const snapshot = captureSessionState(state);
          const now = Date.now();
          const existing = state.savedSessions.find((session) => session.name.toLowerCase() === trimmed.toLowerCase());
          const savedSessions = existing
            ? state.savedSessions.map((session) =>
                session.id === existing.id
                  ? { ...session, name: trimmed, updatedAt: now, state: snapshot }
                  : session
              )
            : [
                {
                  id: `session-${now}-${Math.random().toString(36).slice(2, 8)}`,
                  name: trimmed,
                  createdAt: now,
                  updatedAt: now,
                  state: snapshot,
                },
                ...state.savedSessions,
              ];
          return { savedSessions };
        }),

      loadNamedSession: (sessionId) =>
        set((state) => {
          const session = state.savedSessions.find((candidate) => candidate.id === sessionId);
          if (!session) return {};
          const restored = cloneSessionState(session.state);
          return {
            ...restored,
            savedSessions: state.savedSessions,
            sessionSnapshots: [createSnapshot({ ...state, ...restored, savedSessions: state.savedSessions, sessionSnapshots: [] } as GameStore, `Load session ${session.name}`)],
          };
        }),

      deleteNamedSession: (sessionId) =>
        set((state) => ({
          savedSessions: state.savedSessions.filter((session) => session.id !== sessionId),
        })),

      setVoteAssistActive: (active) =>
        set((state) => {
          const voteAssist = active ? buildVoteAssist(state.players, state.voteAssist) : null;
          return {
            voteAssist,
            playerStatuses: derivePlayerStatuses({ ...state, voteAssist }),
          };
        }),

      adjustVote: (playerId, delta) =>
        set((state) => {
          if (!state.voteAssist) return {};
          const currentVotes = state.voteAssist.votes[playerId] ?? 0;
          return {
            voteAssist: {
              ...state.voteAssist,
              votes: {
                ...state.voteAssist.votes,
                [playerId]: Math.max(0, currentVotes + delta),
              },
            },
          };
        }),

      toggleNoVote: (playerId) =>
        set((state) => {
          if (!state.voteAssist) return {};
          const noVoteIds = state.voteAssist.noVoteIds.includes(playerId)
            ? state.voteAssist.noVoteIds.filter((id) => id !== playerId)
            : [...state.voteAssist.noVoteIds, playerId];
          const voteAssist = { ...state.voteAssist, noVoteIds };
          return {
            voteAssist,
            playerStatuses: derivePlayerStatuses({ ...state, voteAssist }),
          };
        }),

      resetVoteAssist: () =>
        set((state) => ({
          voteAssist: state.voteAssist ? buildVoteAssist(state.players) : null,
        })),

      clearResolutionQueue: () => set({ resolutionQueue: [] }),
    }),
    {
      name: 'loupgarous-game',
      version: 3,
      migrate: (persistedState: unknown) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return persistedState as GameStore;
        }

        const state = persistedState as Record<string, unknown>;
        const players = Array.isArray(state.players) ? (state.players as Player[]) : [];
        const nextState = {
          ...state,
          savedSessions: Array.isArray(state.savedSessions) ? state.savedSessions : [],
          seatOrder: Array.isArray(state.seatOrder)
            ? state.seatOrder
            : players.map((player) => player.id),
          playerStatuses:
            state.playerStatuses && typeof state.playerStatuses === 'object'
              ? state.playerStatuses
              : Object.fromEntries(players.map((player) => [player.id, createDefaultPlayerStatus()])),
          resolutionQueue: Array.isArray(state.resolutionQueue) ? state.resolutionQueue : [],
          sessionSnapshots: [],
          uiMode: (state.uiMode as UIMode | undefined) ?? 'prepare',
          privacyMode: Boolean(state.privacyMode),
          voteAssist: state.voteAssist ?? null,
        };
        delete (nextState as Record<string, unknown>).votes;
        return nextState as unknown as GameStore;
      },
    }
  )
);
