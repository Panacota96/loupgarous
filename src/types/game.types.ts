export type Phase = 'setup' | 'night' | 'day';
export type Camp = 'village' | 'werewolves' | 'lovers' | 'lone_wolf' | 'neutral';

export interface RoleAction {
  description: string;
  isOptional?: boolean;
  isOneTime?: boolean;
  /** Used by game state to track if this one-time action was spent */
  key?: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  nameFr: string;
  camp: Camp;
  minCount: number;
  maxCount: number;
  nightOrder: number | null; // null = day-only or passive
  nightPhaseOnly?: boolean;
  firstNightOnly?: boolean;
  everyOtherNight?: boolean;
  nightAction: RoleAction | null;
  dayTrigger: string | null;       // tooltip shown to DM on day phase
  revealTrigger: string | null;    // what happens when this role is revealed/dies
  optionalRule?: string;
  description: string;
  emoji: string;
}

export interface PlayerSetup {
  id: string;
  name: string;
  roleId: string;
}

export interface Player {
  id: string;
  name: string;
  roleId: string;
  isAlive: boolean;
  isRevealed: boolean;
  isMayor: boolean;
  isLover: boolean;
  extraVotes: number;
  // One-time ability tracking per player
  usedAbilities: string[];
}

export interface NightStep {
  roleId: string;
  stepIndex: number;
  completed: boolean;
}

export interface Vote {
  targetId: string;
  count: number;
}

export interface GameState {
  phase: Phase;
  round: number;
  players: Player[];
  nightSteps: NightStep[];
  currentNightStepIndex: number;
  eliminatedThisNight: string[];
  discussionTimeSeconds: number;
  timerRunning: boolean;
  timerRemaining: number;
  votes: Vote[];
  loversIds: [string, string] | null;
  mayorId: string | null;
  log: string[];
  usedGameAbilities: string[]; // e.g. 'witch_heal', 'witch_poison'
  optionalRules: Record<string, boolean>;
}
