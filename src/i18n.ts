import { useGameStore } from './store/gameStore';
import type { Language, Phase, Camp } from './types/game.types';

interface Strings {
  languageLabel: string;
  appTitle: string;
  appSubtitle: string;
  rulebook: string;
  tabs: { setup: string; roles: string; game: string; log: string };
  setup: {
    numberOfPlayers: string;
    assignRoles: string;
    viewRoleDescriptions: string;
    roleSummary: string;
    discussionTimer: string;
    optionalRules: string;
    startGame: string;
    rolesTabHint: string;
    backToSetup: string;
    playerNamePlaceholder: (i: number) => string;
    errors: {
      tooMany: (name: string, max: number) => string;
      notEnough: (name: string, min: number) => string;
      needWolf: string;
      pairRequired: (name: string) => string;
    };
  };
  quickGuide: {
    title: string;
    subtitle: string;
    balanceTitle: string;
    balance: string[];
    difficultyTitle: string;
    beginner: string;
    spicy: string;
    ratioTitle: string;
    ratios: string[];
    startersTitle: string;
    startersSubtitle: string;
    applyPreset: string;
    playersLabel: (count: number) => string;
    starterSets: {
      id: string;
      title: string;
      description: string;
      players: number;
      roles: string[];
    }[];
  };
  roles: {
    referenceTitle: string;
    filters: { all: string; night: string; day: string };
    labels: {
      night: string;
      day: string;
      reveal: string;
      optional: string;
      firstNightOnly: string;
      everyOtherNight: string;
      oddNightsOnly: string;
      oneTime: string;
    };
    campLabel: (camp: Camp) => string;
  };
  game: {
    phaseChip: (phase: Phase, round: number) => string;
    alive: (count: number) => string;
    wolves: (count: number) => string;
    resetConfirm: string;
    reset: string;
    tabs: { game: string; roles: string; log: string };
    log: { title: string; empty: string };
    wins: {
      village: { title: string; body: string };
      werewolves: { title: string; body: string };
      pied_piper: { title: string; body: string };
      white_werewolf: { title: string; body: string };
      angel: { title: string; body: string };
    };
    newGame: string;
  };
  night: {
    title: (round: number) => string;
    subtitle: string;
    passiveTitle: string;
    passiveSubtitle: string;
    passiveHint: string;
    wakesUp: (name: string) => string;
    badges: {
      firstNightOnly: string;
      everyOtherNight: string;
      oddNightsOnly: string;
      oneTime: string;
    };
    wolvesChoose: string;
    selectTarget: string;
    infectVictim: string;
    noWolfVictim: string;
    infectUsed: string;
    infectInstead: string;
    skipInfect: string;
    infectNote: (name: string) => string;
    bigBadWolfLocked: string;
    bigBadWolfLabel: string;
    skipExtra: string;
    whiteWolfLabel: string;
    skipWhiteWolf: string;
    noOtherWolves: string;
    seerLabel: string;
    selectPlayer: string;
    dmReveal: (name: string, role: string) => string;
    witchVictim: (name: string | null) => string;
    witchHeal: string;
    witchDeath: string;
    none: string;
    cupidLabel: string;
    player1: string;
    player2: string;
    wolfDogLabel: string;
    villager: string;
    werewolf: string;
    wolfDogNote: string;
    wildChildLabel: string;
    selectModel: string;
    wildChildNote: (name: string) => string;
    sistersIntro: (firstNight: boolean) => string;
    sistersNote: string;
    piperLabel: string;
    piperOneTarget: string;
    piperNoTargets: string;
    enchantNote: string;
    ravenLabel: string;
    ravenNone: string;
    ravenNote: (name: string) => string;
    foxActive: string;
    foxLost: string;
    foxResultLabel: string;
    foxFoundWolf: string;
    foxFoundNone: string;
    foxReminder: string;
    goBack: string;
    backHint: string;
    done: string;
    nightEnds: string;
    noElim: string;
    eliminated: string;
    revealDay: string;
    usedBadge: string;
  };
  day: {
    title: (round: number) => string;
    subtitle: string;
    dmView: { show: string; hide: string };
    bearSignal: (growls: boolean) => string;
    dmReminders: string;
    piedPiperBar: (count: number, total: number) => string;
    piedPiperWins: string;
    infectedBar: string;
    foxPowerActive: string;
    foxPowerLost: string;
    playersTitle: (alive: number) => string;
    votingTitle: string;
    resetVotes: string;
    ravenCurse: (name: string) => string;
    mayorVotes: (mayorName: string) => string;
    noBonus: string;
    mayorBonus: string;
    cursedBonus: string;
    execute: (name?: string) => string;
    tieWarning: (names: string) => string;
    tieBreaker: string;
    nightButton: string;
  };
  timer: {
    label: string;
    start: string;
    pause: string;
    reset: string;
    alert: string;
  };
  playerCard: {
    mayor: string;
    lover: string;
    makeMayor: string;
    eliminate: string;
    mayorTitle: string;
    eliminateTitle: string;
  };
  tieBreaker: {
    title: string;
    hint: string;
    randomPick: string;
    selected: (name: string) => string;
    confirm: string;
    cancel: string;
  };
  logs: {
    gameStarted: (count: number) => string;
    nightSummary: (round: number, names: string | null, extraLog: string) => string;
    dayElimination: (round: number, names: string) => string;
    tieBreaker: (name: string) => string;
    knightRustySword: (name: string) => string;
  };
  camps: Record<Camp, string>;
}

export const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
];

const campLabels: Record<Language, Record<Camp, string>> = {
  en: {
    village: 'Village',
    werewolves: 'Werewolves',
    lovers: 'Lovers',
    lone_wolf: 'Lone Wolf',
    neutral: 'Neutral',
    ambiguous: 'Ambiguous',
    loner: 'Loner',
  },
  fr: {
    village: 'Village',
    werewolves: 'Loups-Garous',
    lovers: 'Amoureux',
    lone_wolf: 'Loup solitaire',
    neutral: 'Neutre',
    ambiguous: 'Ambigu',
    loner: 'Solitaire',
  },
};

const translations: Record<Language, Strings> = {
  en: {
    languageLabel: 'Language',
    appTitle: 'Loup-Garous',
    appSubtitle: 'Game Master Assistant',
    rulebook: 'Rulebook',
    tabs: {
      setup: 'Setup',
      roles: 'Roles',
      game: 'Game',
      log: 'Log',
    },
    setup: {
      numberOfPlayers: 'Number of Players',
      assignRoles: 'Assign Roles',
      viewRoleDescriptions: 'Roles',
      roleSummary: 'Role Summary',
      discussionTimer: 'Discussion Timer',
      optionalRules: 'Optional Rules',
      startGame: '🐺 Start Game',
      rolesTabHint: 'Review what each role does before you assign them to players.',
      backToSetup: '↩️ Back to setup',
      playerNamePlaceholder: (i: number) => `Player ${i}`,
      errors: {
        tooMany: (name: string, max: number) => `Too many "${name}" (max ${max}).`,
        notEnough: (name: string, min: number) => `Not enough "${name}" (min ${min}).`,
        needWolf: 'You must have at least 1 Werewolf.',
        pairRequired: (name: string) => `"${name}" must be assigned either 0 or 2 times.`,
      },
    },
    quickGuide: {
      title: '📘 Quick Guide',
      subtitle: 'Fast reminders to keep setups balanced.',
      balanceTitle: 'Balance tips',
      balance: [
        'Start near 1 wolf for 4–5 players; add a wolf sooner if you run many info roles.',
        'Keep at least as many plain Villagers as special roles so the village still needs deduction.',
        'Introduce only 1–2 swingy roles (Raven, Fox, Cupid) at a time to avoid chaos.',
      ],
      difficultyTitle: 'Role difficulty',
      beginner: 'Beginner friendly: Seer, Protector, Witch, Hunter, Mayor / Captain',
      spicy:
        'Advanced / swingy: Little Girl, Big Bad Wolf, Infect Père des Loups, Village Idiot, Scapegoat, Bear Tamer, Raven, Fox, Cupid',
      ratioTitle: 'Suggested wolf count',
      ratios: [
        '5–6 players: 1 wolf (light pressure)',
        '7–9 players: 2 wolves',
        '10–12 players: 3 wolves',
        '13–16 players: 4 wolves',
        '17–20 players: 4–5 wolves depending on how many chaotic roles you add',
      ],
      startersTitle: 'Starter packs for new GMs',
      startersSubtitle: 'One-click role spreads that are fast to run and easy to explain.',
      applyPreset: 'Use this setup',
      playersLabel: (count: number) => `${count} players`,
      starterSets: [
        {
          id: 'classic-6',
          title: 'Gentle intro (6p)',
          description: 'Teach night flow with one wolf and the core information/power roles.',
          players: 6,
          roles: ['werewolf', 'seer', 'witch', 'protector', 'hunter', 'villager'],
        },
        {
          id: 'balanced-8',
          title: 'Balanced village (8p)',
          description: 'Two wolves, protection, and Cupid for light drama without chaos.',
          players: 8,
          roles: ['werewolf', 'werewolf', 'seer', 'witch', 'protector', 'cupid', 'hunter', 'villager'],
        },
        {
          id: 'spicy-10',
          title: 'Spicy but fair (10p)',
          description: 'Three wolves plus Raven pressure; still keeps clear information roles.',
          players: 10,
          roles: ['werewolf', 'werewolf', 'werewolf', 'seer', 'witch', 'cupid', 'raven', 'bear_tamer', 'villager', 'villager'],
        },
      ],
    },
    roles: {
      referenceTitle: '📚 Role Reference',
      filters: {
        all: 'All',
        night: '🌙 Night Actions',
        day: '☀️ Day Triggers',
      },
      labels: {
        night: 'Night',
        day: 'Day',
        reveal: 'On reveal/death',
        optional: 'Optional',
        firstNightOnly: 'First Night Only',
        everyOtherNight: 'Every Other Night',
        oddNightsOnly: 'Nights 1, 3, 5…',
        oneTime: 'One-Time Ability',
      },
      campLabel: (camp: Camp) => campLabels.en[camp],
    },
    game: {
      phaseChip: (phase: Phase, round: number) =>
        `${phase === 'night' ? '🌙 Night' : '☀️ Day'} — Round ${round}`,
      alive: (count: number) => `🫀 ${count} alive`,
      wolves: (count: number) => `🐺 ${count} wolves`,
      resetConfirm: 'Reset game and return to setup?',
      reset: '🏠 Setup',
      tabs: {
        game: '🎮 Game',
        roles: '📚 Roles',
        log: '📜 Log',
      },
      log: {
        title: '📜 Game Log',
        empty: 'No events yet.',
      },
      wins: {
        village: { title: 'Village Wins!', body: 'All werewolves have been eliminated.' },
        werewolves: { title: 'Werewolves Win!', body: 'The wolves now control the village.' },
        pied_piper: { title: 'Pied Piper Wins!', body: 'All players have been enchanted by the Pied Piper!' },
        white_werewolf: { title: 'White Werewolf Wins!', body: 'The White Werewolf is the last survivor!' },
        angel: { title: 'Angel Wins!', body: 'The Angel was the first to be executed on Day 1!' },
      },
      newGame: '🔄 New Game',
    },
    night: {
      title: (round: number) => `Night Phase — Round ${round}`,
      subtitle: 'All players close their eyes.',
      passiveTitle: 'First-night GM checklist',
      passiveSubtitle: 'Passive/manual roles to remember. Do NOT wake them.',
      passiveHint: 'Use the checkboxes as reminders — this list only appears on night 1.',
      wakesUp: (name: string) => `${name} wakes up`,
      badges: {
        firstNightOnly: 'First Night Only',
        everyOtherNight: 'Every Other Night',
        oddNightsOnly: 'Nights 1, 3, 5…',
        oneTime: 'One-Time Ability',
      },
      wolvesChoose: '🎭 Wolves choose their victim:',
      selectTarget: '— Select target (optional) —',
      infectVictim: "🐺 Tonight's wolf victim:",
      noWolfVictim: '🌙 No wolf victim selected yet.',
      infectUsed: '☠️ Infect ability already used this game.',
      infectInstead: '🦠 Infect instead of killing (ONCE PER GAME):',
      skipInfect: '— Do not infect —',
      infectNote: (name: string) =>
        `⚠️ If infected, ${name} stays alive and secretly joins the wolves.`,
      bigBadWolfLocked:
        '⚠️ A wolf has been eliminated — Big Bad Wolf’s extra kill power is gone.',
      bigBadWolfLabel: '🐗 OPTIONAL extra victim (while no wolf eliminated):',
      skipExtra: '— Skip extra kill —',
      whiteWolfLabel: '⬛ OPTIONAL — devour one of the other werewolves:',
      skipWhiteWolf: '— Skip —',
      noOtherWolves: 'No other werewolves are alive.',
      seerLabel: '🪄 Seer looks at player:',
      selectPlayer: '— Select player —',
      dmReveal: (name: string, role: string) => `DM only: ${name} is ${role}`,
      witchVictim: (name: string | null) =>
        name ? `🐺 Wolf victim tonight: ${name}` : '🌙 No wolf victim tonight.',
      witchHeal: '💖 Use Healing Potion (save victim)',
      witchDeath: '☠️ Use Death Potion on:',
      none: '— None —',
      cupidLabel: '💘 Cupid links these two lovers:',
      player1: '— Player 1 —',
      player2: '— Player 2 —',
      wolfDogLabel: '🐕 Wolf-Dog secretly chooses their side:',
      villager: '👨‍🌾 Villager',
      werewolf: '🐺 Werewolf',
      wolfDogNote: '🐺 Wolf-Dog joins the wolves! They will wake with the pack from next night.',
      wildChildLabel: '🧒 Wild Child secretly points to their Role Model:',
      selectModel: '— Select model —',
      wildChildNote: (name: string) =>
        `If ${name} dies, Wild Child becomes a Werewolf.`,
      sistersIntro: (firstNight: boolean) =>
        firstNight
          ? '👯 The Two Sisters open their eyes and recognise each other. This is their first meeting.'
          : '👯 The Two Sisters open their eyes and recognise each other. They communicate silently.',
      sistersNote: 'No DM action required — let them see each other, then close eyes again.',
      piperLabel: '🎶 Pied Piper enchants 2 players:',
      piperOneTarget: 'Only one eligible target remains to enchant this night.',
      piperNoTargets: 'All eligible players are already enchanted. Continue to skip this action.',
      enchantNote: 'Enchanted players acknowledge secretly (e.g. thumb up under the table).',
      ravenLabel: '🦅 Raven places a curse on (optional):',
      ravenNone: '— No curse this night —',
      ravenNote: (name: string) => `☠️ ${name} will have +2 votes against them tomorrow.`,
      foxActive: '🦊 Fox still has its sniffing power.',
      foxLost: '🦊 Fox already lost its sniffing power.',
      foxResultLabel: 'Result of tonight’s sniff:',
      foxFoundWolf: '🐺 Wolf nearby (keep power)',
      foxFoundNone: '❌ No wolves (power lost)',
      foxReminder:
        'If the 3 chosen seats have no werewolves, the Fox loses this power for the rest of the game.',
      goBack: '↩️ Back to previous step',
      backHint: 'Tap any completed role above to rewind and fix that step.',
      done: '✅ Done — Next',
      nightEnds: '🌅 Night ends',
      noElim: 'No one was eliminated tonight. 🐱',
      eliminated: 'Eliminated:',
      revealDay: '🌤 Reveal Day',
      usedBadge: 'USED',
    },
    day: {
      title: (round: number) => `Day Phase — Round ${round}`,
      subtitle: 'All players open their eyes.',
      dmView: { show: '👁 DM View', hide: '🙈 Hide Roles' },
      bearSignal: (growls: boolean) =>
        growls ? '🐻 Bear signal: 🔊 GROWLS (wolf nearby!)' : '🐻 Bear signal: 🤫 Silent',
      dmReminders: '📋 DM Reminders',
      piedPiperBar: (count: number, total: number) =>
        `🎶 Pied Piper enchanted: ${count} / ${total} players`,
      piedPiperWins: '⭐ PIED PIPER WINS!',
      infectedBar: '🦠 Secret wolves (infected):',
      foxPowerActive: '🦊 Fox sniffing power: ACTIVE',
      foxPowerLost: '🦊 Fox sniffing power: LOST (skip future Fox wake-ups)',
      playersTitle: (alive: number) => `👥 Players (${alive} alive)`,
      votingTitle: '🗳️ Voting',
      resetVotes: '🔄 Reset Votes',
      ravenCurse: (name: string) => `🦅 Raven curse: ${name} has +2 votes today.`,
      mayorVotes: (mayorName: string) => `🎖️ Mayor ${mayorName} votes for:`,
      noBonus: '— No bonus vote —',
      mayorBonus: '+1 Mayor bonus',
      cursedBonus: '+2 cursed',
      execute: (name: string | undefined) => (name ? `☠️ Execute ${name}` : '☠️ Execute'),
      tieWarning: (names: string) => `⚖️ TIE between ${names}!`,
      tieBreaker: '⚖️ Tie-Breaker',
      nightButton: '🌙 Start Night Phase',
    },
    timer: {
      label: '⏱️ Discussion Timer',
      start: '▶ Start',
      pause: '⏸ Pause',
      reset: '🔄 Reset',
      alert: "⏰ Time's up! Vote now!",
    },
    playerCard: {
      mayor: '🎖️ Mayor',
      lover: '💘 Lover',
      makeMayor: '🎖️ Mayor',
      eliminate: '☠️ Elim.',
      mayorTitle: 'Make Mayor',
      eliminateTitle: 'Eliminate',
    },
    tieBreaker: {
      title: '⚖️ Tie-Breaker',
      hint: 'Select the tied players, then roll the random tie-breaker.',
      randomPick: '🎲 Random Pick',
      selected: (name: string) => `➡️ ${name} is selected for elimination.`,
      confirm: '☠️ Confirm Elimination',
      cancel: 'Cancel',
    },
    logs: {
      gameStarted: (count: number) => `Game started with ${count} players.`,
      nightSummary: (round: number, names: string | null, extraLog: string) =>
        names ? `Night ${round}: ${names} were eliminated.${extraLog}` : `Night ${round}: No one was eliminated (peaceful night).`,
      dayElimination: (round: number, names: string) => `Day ${round}: ${names} eliminated.`,
      tieBreaker: (name: string) => `Tie-breaker: ${name} was randomly selected for elimination.`,
      knightRustySword: (name: string) => ` ⚔️ Knight's rusty sword: ${name} dies of tetanus!`,
    },
    camps: campLabels.en,
  },
  fr: {
    languageLabel: 'Langue',
    appTitle: 'Loup-Garous',
    appSubtitle: 'Assistant Maître du Jeu',
    rulebook: 'Livret de règles',
    tabs: {
      setup: 'Préparation',
      roles: 'Rôles',
      game: 'Partie',
      log: 'Journal',
    },
    setup: {
      numberOfPlayers: 'Nombre de joueurs',
      assignRoles: 'Attribuer les rôles',
      viewRoleDescriptions: 'Rôles',
      roleSummary: 'Résumé des rôles',
      discussionTimer: 'Minuteur de discussion',
      optionalRules: 'Règles optionnelles',
      startGame: '🐺 Lancer la partie',
      rolesTabHint: 'Relisez chaque rôle avant de les attribuer aux joueurs.',
      backToSetup: '↩️ Retour à la préparation',
      playerNamePlaceholder: (i: number) => `Joueur ${i}`,
      errors: {
        tooMany: (name: string, max: number) => `Trop de « ${name} » (max ${max}).`,
        notEnough: (name: string, min: number) => `Pas assez de « ${name} » (min ${min}).`,
        needWolf: 'Vous devez avoir au moins 1 Loup-Garou.',
        pairRequired: (name: string) => `« ${name} » doit être attribué soit 0 soit 2 fois.`,
      },
    },
    quickGuide: {
      title: '📘 Guide rapide',
      subtitle: 'Rappels express pour garder des parties équilibrées.',
      balanceTitle: "Conseils d'équilibre",
      balance: [
        'Commencez avec 1 loup pour 4–5 joueurs ; ajoutez-en un plus tôt si vous jouez beaucoup de rôles d’information.',
        'Gardez au moins autant de simples Villageois que de rôles spéciaux pour que le village doive déduire.',
        'Introduisez seulement 1–2 rôles chaotiques (Corbeau, Renard, Cupidon) à la fois pour éviter le chaos.',
      ],
      difficultyTitle: 'Difficulté des rôles',
      beginner: 'Faciles : Voyante, Salvateur, Sorcière, Chasseur, Maire / Capitaine',
      spicy:
        'Avancés / swingy : Petite Fille, Grand Méchant Loup, Infect Père des Loups, Idiot du Village, Bouc Émissaire, Montreur d’Ours, Corbeau, Renard, Cupidon',
      ratioTitle: 'Nombre de loups suggéré',
      ratios: [
        '5–6 joueurs : 1 loup (pression légère)',
        '7–9 joueurs : 2 loups',
        '10–12 joueurs : 3 loups',
        '13–16 joueurs : 4 loups',
        '17–20 joueurs : 4–5 loups selon les rôles chaotiques ajoutés',
      ],
      startersTitle: 'Packs prêts à jouer',
      startersSubtitle: 'Des répartitions rapides pour lancer une partie sans préparation.',
      applyPreset: 'Utiliser ce setup',
      playersLabel: (count: number) => `${count} joueurs`,
      starterSets: [
        {
          id: 'classic-6',
          title: 'Intro douce (6j)',
          description: 'Une explication simple : un loup, des rôles d’info et de protection.',
          players: 6,
          roles: ['werewolf', 'seer', 'witch', 'protector', 'hunter', 'villager'],
        },
        {
          id: 'balanced-8',
          title: 'Village équilibré (8j)',
          description: 'Deux loups, protection et Cupidon : du drama léger sans chaos.',
          players: 8,
          roles: ['werewolf', 'werewolf', 'seer', 'witch', 'protector', 'cupid', 'hunter', 'villager'],
        },
        {
          id: 'spicy-10',
          title: 'Épicé mais lisible (10j)',
          description: 'Trois loups avec pression du Corbeau et des rôles d’info clairs.',
          players: 10,
          roles: ['werewolf', 'werewolf', 'werewolf', 'seer', 'witch', 'cupid', 'raven', 'bear_tamer', 'villager', 'villager'],
        },
      ],
    },
    roles: {
      referenceTitle: '📚 Référence des rôles',
      filters: {
        all: 'Tous',
        night: '🌙 Actions de nuit',
        day: '☀️ Déclencheurs de jour',
      },
      labels: {
        night: 'Nuit',
        day: 'Jour',
        reveal: 'À la révélation / mort',
        optional: 'Optionnel',
        firstNightOnly: 'Première nuit uniquement',
        everyOtherNight: 'Une nuit sur deux',
        oddNightsOnly: 'Nuits 1, 3, 5…',
        oneTime: 'Pouvoir unique',
      },
      campLabel: (camp: Camp) => campLabels.fr[camp],
    },
    game: {
      phaseChip: (phase: Phase, round: number) =>
        `${phase === 'night' ? '🌙 Nuit' : '☀️ Jour'} — Manche ${round}`,
      alive: (count: number) => `🫀 ${count} vivants`,
      wolves: (count: number) => `🐺 ${count} loups`,
      resetConfirm: 'Réinitialiser et revenir à la préparation ?',
      reset: '🏠 Préparation',
      tabs: {
        game: '🎮 Partie',
        roles: '📚 Rôles',
        log: '📜 Journal',
      },
      log: {
        title: '📜 Journal de partie',
        empty: 'Aucun événement pour le moment.',
      },
      wins: {
        village: { title: 'Victoire du village !', body: 'Tous les loups-garous sont éliminés.' },
        werewolves: { title: 'Victoire des loups-garous !', body: 'Les loups contrôlent désormais le village.' },
        pied_piper: { title: 'Victoire du Joueur de Flûte !', body: 'Tous les joueurs ont été envoûtés par le Joueur de Flûte !' },
        white_werewolf: { title: 'Victoire du Loup-Garou Blanc !', body: 'Le Loup-Garou Blanc est le dernier survivant !' },
        angel: { title: "Victoire de l'Ange !", body: "L'Ange a été le premier exécuté du Jour 1 !" },
      },
      newGame: '🔄 Nouvelle partie',
    },
    night: {
      title: (round: number) => `Phase de nuit — Manche ${round}`,
      subtitle: 'Tous les joueurs ferment les yeux.',
      passiveTitle: 'Checklist MJ (première nuit)',
      passiveSubtitle: 'Rôles passifs/manuels à garder en tête. Ne les réveillez pas.',
      passiveHint: 'Servez-vous des cases comme pense-bête — la liste disparaît après la nuit 1.',
      wakesUp: (name: string) => `${name} se réveille`,
      badges: {
        firstNightOnly: 'Première nuit uniquement',
        everyOtherNight: 'Une nuit sur deux',
        oddNightsOnly: 'Nuits 1, 3, 5…',
        oneTime: 'Pouvoir unique',
      },
      wolvesChoose: '🎭 Les loups choisissent leur victime :',
      selectTarget: '— Choisir une cible (optionnel) —',
      infectVictim: '🐺 Victime des loups ce soir :',
      noWolfVictim: '🌙 Aucune victime des loups pour le moment.',
      infectUsed: "☠️ Le pouvoir d'infection a déjà été utilisé.",
      infectInstead: '🦠 Infecter au lieu de tuer (UNE FOIS PAR PARTIE) :',
      skipInfect: '— Ne pas infecter —',
      infectNote: (name: string) =>
        `⚠️ Si infecté, ${name} reste en vie et rejoint secrètement les loups.`,
      bigBadWolfLocked:
        '⚠️ Un loup a été éliminé — le pouvoir de mise à mort supplémentaire du Grand Méchant Loup est perdu.',
      bigBadWolfLabel: '🐗 VICTIME OPTIONNELLE (tant qu’aucun loup éliminé) :',
      skipExtra: '— Passer —',
      whiteWolfLabel: '⬛ OPTION — dévorer un autre loup :',
      skipWhiteWolf: '— Passer —',
      noOtherWolves: "Aucun autre loup-garou n'est en vie.",
      seerLabel: '🪄 La Voyante regarde le joueur :',
      selectPlayer: '— Choisir un joueur —',
      dmReveal: (name: string, role: string) => `MDJ seulement : ${name} est ${role}`,
      witchVictim: (name: string | null) =>
        name ? `🐺 Victime des loups : ${name}` : '🌙 Aucune victime cette nuit.',
      witchHeal: '💖 Utiliser la potion de vie (sauver la victime)',
      witchDeath: '☠️ Utiliser la potion de mort sur :',
      none: '— Aucun —',
      cupidLabel: '💘 Cupidon lie ces deux amoureux :',
      player1: '— Joueur 1 —',
      player2: '— Joueur 2 —',
      wolfDogLabel: '🐕 Le Chien-Loup choisit secrètement son camp :',
      villager: '👨‍🌾 Villageois',
      werewolf: '🐺 Loup-Garou',
      wolfDogNote: '🐺 Le Chien-Loup rejoint la meute ! Il se réveillera avec les loups dès la prochaine nuit.',
      wildChildLabel: "🧒 L'Enfant Sauvage désigne secrètement son Modèle :",
      selectModel: '— Choisir un modèle —',
      wildChildNote: (name: string) =>
        `Si ${name} meurt, l'Enfant Sauvage devient un Loup-Garou.`,
      sistersIntro: (firstNight: boolean) =>
        firstNight
          ? '👯 Les Deux Sœurs ouvrent les yeux et se reconnaissent. Première rencontre.'
          : '👯 Les Deux Sœurs ouvrent les yeux et se reconnaissent. Elles communiquent silencieusement.',
      sistersNote: 'Aucune action pour le MDJ — laissez-les se voir puis refermer les yeux.',
      piperLabel: '🎶 Le Joueur de Flûte envoûte 2 joueurs :',
      piperOneTarget: "Plus qu'une seule cible éligible à envoûter cette nuit.",
      piperNoTargets: 'Tous les joueurs éligibles sont déjà envoûtés. Continuez pour passer cette action.',
      enchantNote: 'Les joueurs envoûtés acquiescent discrètement (ex : pouce levé).',
      ravenLabel: '🦅 Le Corbeau place une malédiction sur (optionnel) :',
      ravenNone: '— Pas de malédiction cette nuit —',
      ravenNote: (name: string) => `☠️ ${name} aura +2 voix contre lui demain.`,
      foxActive: '🦊 Le Renard a toujours son pouvoir de flair.',
      foxLost: '🦊 Le Renard a déjà perdu son pouvoir de flair.',
      foxResultLabel: 'Résultat du flair cette nuit :',
      foxFoundWolf: '🐺 Loup à proximité (pouvoir conservé)',
      foxFoundNone: '❌ Aucun loup (pouvoir perdu)',
      foxReminder:
        'Si les 3 joueurs choisis ne comptent aucun loup, le Renard perd ce pouvoir pour toute la partie.',
      goBack: '↩️ Retour à l’étape précédente',
      backHint: 'Touchez un rôle déjà validé pour revenir en arrière et corriger.',
      done: '✅ Terminé — Suivant',
      nightEnds: '🌅 Fin de nuit',
      noElim: 'Personne éliminé cette nuit. 🐱',
      eliminated: 'Éliminés :',
      revealDay: '🌤 Révéler le jour',
      usedBadge: 'UTILISÉ',
    },
    day: {
      title: (round: number) => `Phase de jour — Manche ${round}`,
      subtitle: 'Tous les joueurs ouvrent les yeux.',
      dmView: { show: '👁 Vue MJ', hide: '🙈 Masquer les rôles' },
      bearSignal: (growls: boolean) =>
        growls ? '🐻 Signal de l’ours : 🔊 GROGNE (loup voisin !)' : '🐻 Signal de l’ours : 🤫 Silencieux',
      dmReminders: '📋 Rappels MJ',
      piedPiperBar: (count: number, total: number) =>
        `🎶 Envoûtés par le Joueur de Flûte : ${count} / ${total} joueurs`,
      piedPiperWins: '⭐ VICTOIRE DU JOUEUR DE FLÛTE !',
      infectedBar: '🦠 Loups secrets (infectés) :',
      foxPowerActive: '🦊 Pouvoir du Renard : ACTIF',
      foxPowerLost: '🦊 Pouvoir du Renard : PERDU (ne plus le réveiller)',
      playersTitle: (alive: number) => `👥 Joueurs (${alive} vivants)`,
      votingTitle: '🗳️ Votes',
      resetVotes: '🔄 Réinitialiser les votes',
      ravenCurse: (name: string) => `🦅 Malédiction du Corbeau : ${name} a +2 voix aujourd’hui.`,
      mayorVotes: (mayorName: string) => `🎖️ Maire ${mayorName} vote pour :`,
      noBonus: '— Pas de vote bonus —',
      mayorBonus: '+1 bonus Maire',
      cursedBonus: '+2 maudit',
      execute: (name: string | undefined) => (name ? `☠️ Exécuter ${name}` : '☠️ Exécuter'),
      tieWarning: (names: string) => `⚖️ ÉGALITÉ entre ${names} !`,
      tieBreaker: '⚖️ Bris d’égalité',
      nightButton: '🌙 Commencer la nuit',
    },
    timer: {
      label: '⏱️ Minuteur de discussion',
      start: '▶ Démarrer',
      pause: '⏸ Pause',
      reset: '🔄 Réinitialiser',
      alert: '⏰ Temps écoulé ! Votez maintenant !',
    },
    playerCard: {
      mayor: '🎖️ Maire',
      lover: '💘 Amoureux',
      makeMayor: '🎖️ Maire',
      eliminate: '☠️ Élim.',
      mayorTitle: 'Nommer Maire',
      eliminateTitle: 'Éliminer',
    },
    tieBreaker: {
      title: '⚖️ Bris d’égalité',
      hint: 'Sélectionnez les joueurs à égalité puis lancez le tirage au sort.',
      randomPick: '🎲 Tirage aléatoire',
      selected: (name: string) => `➡️ ${name} est choisi pour l’élimination.`,
      confirm: '☠️ Confirmer l’élimination',
      cancel: 'Annuler',
    },
    logs: {
      gameStarted: (count: number) => `Partie lancée avec ${count} joueurs.`,
      nightSummary: (round: number, names: string | null, extraLog: string) =>
        names ? `Nuit ${round} : ${names} ont été éliminés.${extraLog}` : `Nuit ${round} : Personne éliminé (nuit paisible).`,
      dayElimination: (round: number, names: string) => `Jour ${round} : ${names} éliminé(s).`,
      tieBreaker: (name: string) => `Bris d’égalité : ${name} a été tiré au sort pour être éliminé.`,
      knightRustySword: (name: string) => ` ⚔️ Épée rouillée du Chevalier : ${name} meurt du tétanos !`,
    },
    camps: campLabels.fr,
  },
};

export function getStrings(language?: Language): Strings {
  if (language && translations[language]) return translations[language];
  return translations.en;
}

export function useI18n() {
  const language = useGameStore((s) => s.language ?? 'en');
  const setLanguage = useGameStore((s) => s.setLanguage);
  return { language, setLanguage, t: getStrings(language) };
}

export function getCampLabel(camp: Camp, language: Language | undefined) {
  const lang = language ?? 'en';
  return campLabels[lang][camp];
}
