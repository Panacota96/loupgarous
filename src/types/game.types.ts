export type Phase = 'setup' | 'night' | 'day';
export type Language = 'en' | 'fr';
export type Camp =
  | 'village'
  | 'werewolves'
  | 'lovers'
  | 'lone_wolf'
  | 'neutral'
  | 'ambiguous'
  | 'loner';

export interface RoleAction {
  description: string;
  isOptional?: boolean;
  isOneTime?: boolean;
  /** Used by game state to track if this one-time action was spent */
  key?: string;
  /** Localized description (French) */
  descriptionFr?: string;
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
  /** Role wakes only on odd rounds (1, 3, 5 …) — e.g. Sisters */
  oddNightsOnly?: boolean;
  nightAction: RoleAction | null;
  dayTrigger: string | null;       // tooltip shown to DM on day phase
  revealTrigger: string | null;    // what happens when this role is revealed/dies
  dayTriggerFr?: string | null;
  revealTriggerFr?: string | null;
  optionalRule?: string;
  optionalRuleFr?: string;
  description: string;
  descriptionFr?: string;
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
  usedGameAbilities: string[]; // e.g. 'witch_heal', 'witch_poison', 'infect_pere'
  optionalRules: Record<string, boolean>;
  // New role mechanics
  wildChildModelId: string | null;       // ID of Wild Child's chosen role model
  wildChildTransformed: boolean;         // true once Wild Child's model has died
  wolfDogChoice: 'villager' | 'werewolf' | null; // Wolf-Dog's night-1 choice
  enchantedPlayerIds: string[];          // players enchanted by Pied Piper
  infectedPlayerIds: string[];           // players infected by Infect Père (secret wolves)
  angelWon: boolean;                     // true if Angel was first Day-1 execution
  wolfVictimId: string | null;           // wolf's chosen victim for this night (persists across steps for Witch)
  ravenCursedId: string | null;          // player cursed by Raven last night (+2 votes)
  language: Language;
}
