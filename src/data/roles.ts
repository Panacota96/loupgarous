import type { RoleDefinition } from '../types/game.types';

export const ROLES: RoleDefinition[] = [
  // ─── VILLAGEOIS ──────────────────────────────────────────────────────────────
  {
    id: 'villager',
    name: 'Villager',
    nameFr: 'Villageois',
    camp: 'village',
    minCount: 1,
    maxCount: 12,
    nightOrder: null,
    nightAction: null,
    dayTrigger: null,
    revealTrigger: null,
    description: 'Simple villager with no special powers. Vote wisely!',
    emoji: '👨‍🌾',
  },

  // ─── LOUPS-GAROUS ────────────────────────────────────────────────────────────
  {
    id: 'werewolf',
    name: 'Werewolf',
    nameFr: 'Loup-Garou',
    camp: 'werewolves',
    minCount: 0,
    maxCount: 6,
    nightOrder: 40,
    nightAction: {
      description:
        'All Werewolves (including Grand-Méchant-Loup and Infect Père des Loups) open their eyes and silently agree on a victim to devour.',
    },
    dayTrigger: null,
    revealTrigger: 'One less wolf! The village rejoices… or does it?',
    description:
      'Each night, werewolves choose a villager to devour. Wolves win when their number ≥ remaining villagers.',
    emoji: '🐺',
  },
  {
    id: 'big_bad_wolf',
    name: 'Big Bad Wolf',
    nameFr: 'Grand-Méchant-Loup',
    camp: 'werewolves',
    minCount: 0,
    maxCount: 1,
    nightOrder: 42,
    nightAction: {
      description:
        'OPTIONAL — available only while NO werewolf has been eliminated yet: the Big Bad Wolf may secretly devour ONE additional victim beyond the normal wolf attack.',
    },
    dayTrigger:
      'If no wolf has been eliminated yet, the Big Bad Wolf still has its extra-kill power.',
    revealTrigger: 'The Big Bad Wolf is dead! Their extra kill power is gone.',
    description:
      'Participates in the normal wolf attack. While no wolf has been eliminated, may additionally devour one more victim each night.',
    emoji: '🐗',
  },
  {
    id: 'infect_pere',
    name: 'Infected Father of Wolves',
    nameFr: 'Infect Père des Loups',
    camp: 'werewolves',
    minCount: 0,
    maxCount: 1,
    nightOrder: 41,
    nightAction: {
      description:
        'ONCE PER GAME: Instead of devouring the wolf victim, the Infect Père des Loups may INFECT them. The infected player stays alive but secretly joins the wolf team (their card is not revealed).',
      isOneTime: true,
      key: 'infect_pere',
    },
    dayTrigger:
      'The infected player is a secret wolf — their real card is never revealed while alive.',
    revealTrigger:
      '⚠️ INFECT PÈRE TRIGGER: If this player was infected, they secretly fought for the wolves.',
    description:
      'Once per game, instead of killing the wolf victim, infects them — the victim secretly joins the wolf team.',
    emoji: '🦠',
  },

  // ─── VILLAGEOIS SPÉCIAUX ────────────────────────────────────────────────────
  {
    id: 'seer',
    name: 'Seer',
    nameFr: 'Voyante',
    camp: 'village',
    minCount: 0,
    maxCount: 1,
    nightOrder: 50,
    nightAction: {
      description:
        'The Seer opens her eyes and silently points to a player. The DM shows her that player\'s role card.',
    },
    dayTrigger:
      'Seer may hint to the village (she must be careful not to reveal herself).',
    revealTrigger: 'The Seer is dead! The village loses a critical ally.',
    description: 'Each night, the Seer learns the true role of one player.',
    emoji: '🔮',
  },
  {
    id: 'witch',
    name: 'Witch',
    nameFr: 'Sorcière',
    camp: 'village',
    minCount: 0,
    maxCount: 1,
    nightOrder: 60,
    nightAction: {
      description:
        'The DM shows the Witch who was attacked. She may use her HEALING potion (once per game) to save them, and/or her DEATH potion (once per game) to kill anyone.',
    },
    dayTrigger: null,
    revealTrigger: 'The Witch is dead! Check which potions she had remaining.',
    description:
      'Has one healing potion (save the night victim) and one death potion (kill anyone). Each is single-use.',
    emoji: '🧙‍♀️',
  },
  {
    id: 'hunter',
    name: 'Hunter',
    nameFr: 'Chasseur',
    camp: 'village',
    minCount: 0,
    maxCount: 1,
    nightOrder: null,
    nightAction: null,
    dayTrigger: null,
    revealTrigger:
      '⚠️ HUNTER TRIGGER: The Hunter must immediately shoot one player before being removed from the game!',
    description:
      'When eliminated (by wolves or by vote), the Hunter immediately shoots one other player.',
    emoji: '🏹',
  },
  {
    id: 'cupid',
    name: 'Cupid',
    nameFr: 'Cupidon',
    camp: 'village',
    minCount: 0,
    maxCount: 1,
    nightOrder: 10,
    firstNightOnly: true,
    nightAction: {
      description:
        'FIRST NIGHT ONLY: Cupid opens eyes and points to two players who will be Lovers. The DM taps them. If one Lover dies, the other dies of grief.',
      isOneTime: true,
      key: 'cupid_link',
    },
    dayTrigger: null,
    revealTrigger: 'Cupid is revealed. The lovers remain secret.',
    description:
      'On the first night, links two players as Lovers. If one dies, the other dies immediately.',
    emoji: '💘',
  },
  {
    id: 'little_girl',
    name: 'Little Girl',
    nameFr: 'Petite Fille',
    camp: 'village',
    minCount: 0,
    maxCount: 1,
    nightOrder: 35,
    nightAction: {
      description:
        'During the Werewolves\' turn, the Little Girl may secretly peek through her fingers. If a wolf catches her peeking, they can immediately change their vote to eliminate her instead.',
    },
    dayTrigger: null,
    revealTrigger: 'The Little Girl is revealed.',
    description:
      'May secretly spy during the werewolf turn at risk of being caught.',
    emoji: '👧',
  },
  {
    id: 'mayor',
    name: 'Mayor / Captain',
    nameFr: 'Maire / Capitaine',
    camp: 'village',
    minCount: 0,
    maxCount: 1,
    nightOrder: null,
    nightAction: null,
    dayTrigger:
      'Captain\'s vote counts as 2. If the Captain dies, they designate a successor immediately.',
    revealTrigger:
      '⚠️ CAPTAIN TRIGGER: Captain designates a new Captain before being eliminated!',
    description:
      'Elected on Day 1. Vote counts double. On death, designates successor.',
    emoji: '🎖️',
  },
  {
    id: 'protector',
    name: 'Protector',
    nameFr: 'Salvateur',
    camp: 'village',
    minCount: 0,
    maxCount: 1,
    nightOrder: 30,
    nightAction: {
      description:
        'The Protector opens eyes and points to a player to protect for this night (cannot protect the same player two nights in a row).',
    },
    dayTrigger: null,
    revealTrigger: 'The Protector is revealed. Protection is lost.',
    description:
      'Each night, protects one player from werewolf attack (not the same player twice in a row).',
    emoji: '🛡️',
  },
  {
    id: 'elder',
    name: 'Elder',
    nameFr: 'Ancien',
    camp: 'village',
    minCount: 0,
    maxCount: 1,
    nightOrder: null,
    nightAction: null,
    dayTrigger:
      'The Elder can survive the FIRST werewolf attack. If the village executes the Elder, ALL special villager powers are permanently lost!',
    revealTrigger:
      '⚠️ ELDER TRIGGER: Was this their first wolf attack or a village execution? If village execution → ALL villager special powers removed!',
    description:
      'Survives the first werewolf attack. If the village votes to execute the Elder, all villager powers are permanently removed.',
    emoji: '🧓',
    optionalRule: 'Elder loses all powers after being attacked once (not just surviving).',
  },
  {
    id: 'village_idiot',
    name: 'Village Idiot',
    nameFr: 'Idiot du Village',
    camp: 'village',
    minCount: 0,
    maxCount: 1,
    nightOrder: null,
    nightAction: null,
    dayTrigger: null,
    revealTrigger:
      '⚠️ VILLAGE IDIOT TRIGGER: If chosen for execution, reveal the card. Village Idiot is SPARED but permanently loses their right to vote!',
    description:
      'If voted for execution, the Village Idiot is spared but permanently loses voting rights.',
    emoji: '🃏',
  },
  {
    id: 'scapegoat',
    name: 'Scapegoat',
    nameFr: 'Bouc-Emissaire',
    camp: 'village',
    minCount: 0,
    maxCount: 1,
    nightOrder: null,
    nightAction: null,
    dayTrigger: null,
    revealTrigger:
      '⚠️ SCAPEGOAT TRIGGER: If this player is eliminated via a TIE vote, they then decide who may vote in the next round.',
    description:
      'If a vote ends in a tie, the Scapegoat is eliminated instead. The Scapegoat then chooses who may vote next round.',
    emoji: '🐐',
    optionalRule: 'Apply Scapegoat rule only in exact tie situations.',
  },
  {
    id: 'bear_tamer',
    name: 'Bear Tamer',
    nameFr: 'Montreur d\'Ours',
    camp: 'village',
    minCount: 0,
    maxCount: 1,
    nightOrder: null,
    nightAction: null,
    dayTrigger:
      'MORNING SIGNAL: If the Bear Tamer\'s immediate neighbor (left or right) is a Werewolf (or infected), the bear GROWLS at the start of day. Otherwise silent.',
    revealTrigger: 'Bear Tamer is revealed. Bear signals stop.',
    description:
      'Every morning, the bear growls if one of the Bear Tamer\'s neighbors is a Werewolf or infected.',
    emoji: '🐻',
  },
  {
    id: 'raven',
    name: 'Raven',
    nameFr: 'Corbeau',
    camp: 'village',
    minCount: 0,
    maxCount: 1,
    nightOrder: 70,
    nightAction: {
      description:
        'The Raven opens eyes and points to a player. That player will have 2 extra votes against them during the next day\'s vote.',
    },
    dayTrigger: 'The Raven\'s chosen player has +2 votes against them today.',
    revealTrigger: 'The Raven is revealed. The nightly curse ends.',
    description:
      'Each night, places a curse on a player giving them +2 votes in the next day\'s vote.',
    emoji: '🦅',
  },
  {
    id: 'fox',
    name: 'Fox',
    nameFr: 'Renard',
    camp: 'village',
    minCount: 0,
    maxCount: 1,
    nightOrder: 45,
    nightAction: {
      description:
        'The Fox opens eyes and points to a group of 3 adjacent players. The DM silently nods YES if at least one is a Werewolf, or shakes NO. If no wolf found, the Fox loses their power for the rest of the game.',
    },
    dayTrigger: null,
    revealTrigger: 'The Fox is revealed.',
    description:
      'Each night, sniffs 3 adjacent players. Told if any is a werewolf. Loses power permanently if all 3 are innocent.',
    emoji: '🦊',
  },
  {
    id: 'soeurs',
    name: 'Two Sisters',
    nameFr: 'Les Deux Sœurs',
    camp: 'village',
    minCount: 0,
    maxCount: 2,
    nightOrder: 20,
    oddNightsOnly: true,
    nightAction: {
      description:
        'The Two Sisters open their eyes. They recognise each other. (Night 1: they learn each other\'s identity. From night 3 onward: every other night they may briefly communicate silently.)',
    },
    dayTrigger: null,
    revealTrigger: 'A Sister is revealed. The other Sister now plays alone.',
    description:
      'Two cards — both players are Sisters. They wake up together on night 1 then every other night to silently communicate.',
    emoji: '👯‍♀️',
  },
  {
    id: 'knight',
    name: 'Knight with Rusty Sword',
    nameFr: 'Chevalier à l\'Épée Rouillée',
    camp: 'village',
    minCount: 0,
    maxCount: 1,
    nightOrder: null,
    nightAction: null,
    dayTrigger:
      '⚔️ If the Knight was devoured by wolves last night, the FIRST Werewolf seated to the Knight\'s LEFT dies of tetanus at the start of this day phase!',
    revealTrigger:
      '⚠️ KNIGHT TRIGGER: If killed by wolves → the first werewolf seated to their LEFT dies of tetanus at dawn!',
    description:
      'When devoured by wolves, the first werewolf seated to the Knight\'s left dies of tetanus at the start of the next day.',
    emoji: '⚔️',
  },

  // ─── AMBIGUS ─────────────────────────────────────────────────────────────────
  {
    id: 'wolf_dog',
    name: 'Wolf-Dog',
    nameFr: 'Chien-Loup',
    camp: 'ambiguous',
    minCount: 0,
    maxCount: 1,
    nightOrder: 1,
    firstNightOnly: true,
    nightAction: {
      description:
        'FIRST NIGHT ONLY: The Wolf-Dog opens eyes. The DM secretly asks: "Do you choose to be a Villager or a Werewolf?" The Wolf-Dog indicates their choice silently.',
      isOneTime: true,
      key: 'wolf_dog_choice',
    },
    dayTrigger:
      'Wolf-Dog\'s team depends on their night-1 choice. If Werewolf chosen: they wake with wolves each night.',
    revealTrigger:
      '⚠️ WOLF-DOG TRIGGER: Reveal whether they chose Villager or Werewolf. If Werewolf, they count as a wolf for the end-game condition.',
    description:
      'On the first night, secretly chooses to be Villager (no power) or Werewolf (joins the wolf pack).',
    emoji: '🐕',
  },
  {
    id: 'wild_child',
    name: 'Wild Child',
    nameFr: 'Enfant Sauvage',
    camp: 'ambiguous',
    minCount: 0,
    maxCount: 1,
    nightOrder: 5,
    firstNightOnly: true,
    nightAction: {
      description:
        'FIRST NIGHT ONLY: Wild Child opens eyes and secretly points to one player as their "Role Model". If the Role Model dies at any point, the Wild Child immediately becomes a Werewolf.',
      isOneTime: true,
      key: 'wild_child_model',
    },
    dayTrigger:
      'Wild Child wins with the village if their model survives to the end, or with the wolves if their model died.',
    revealTrigger:
      '⚠️ WILD CHILD TRIGGER: Has their Role Model died? If YES → Wild Child is now a Werewolf!',
    description:
      'Secretly chooses a role model on night 1. Wins with village if model survives; transforms into Werewolf and fights for wolves if model dies.',
    emoji: '🧒',
  },

  // ─── SOLITAIRES ──────────────────────────────────────────────────────────────
  {
    id: 'white_werewolf',
    name: 'White Werewolf',
    nameFr: 'Loup-Garou Blanc',
    camp: 'loner',
    minCount: 0,
    maxCount: 1,
    nightOrder: 44,
    everyOtherNight: true,
    nightAction: {
      description:
        'Every other night (starting night 2): After the regular wolf attack, the White Werewolf opens eyes ALONE and may secretly devour ONE of the other werewolves. This is optional.',
    },
    dayTrigger: null,
    revealTrigger:
      '⚠️ WHITE WEREWOLF: Loner — wins ALONE as the last survivor. They appear to be a wolf but betray all sides.',
    description:
      'Participates with wolves but wins alone. Every other night may secretly kill one other werewolf. Wins when they are the sole survivor.',
    emoji: '🐺‍⬛',
  },
  {
    id: 'pied_piper',
    name: 'Pied Piper',
    nameFr: 'Joueur de Flûte',
    camp: 'loner',
    minCount: 0,
    maxCount: 1,
    nightOrder: 80,
    nightAction: {
      description:
        'The Pied Piper opens eyes and points to 2 players to enchant. Enchanted players secretly acknowledge (e.g. thumb up under the table). The Pied Piper wins when ALL other players are enchanted.',
    },
    dayTrigger:
      'Track enchanted players. Pied Piper wins when ALL others are enchanted. Enchanted players also win if they survive to the Pied Piper\'s victory.',
    revealTrigger:
      '⚠️ PIED PIPER: Loner — check enchanted count. If all others are enchanted → Pied Piper wins!',
    description:
      'Each night enchants 2 players. Wins alone when all other players are enchanted. Enchanted players share the win if they survive.',
    emoji: '🎶',
  },
  {
    id: 'angel',
    name: 'Angel',
    nameFr: 'Ange',
    camp: 'loner',
    minCount: 0,
    maxCount: 1,
    nightOrder: null,
    nightAction: null,
    dayTrigger:
      '⭐ ANGEL WIN CHECK (Day 1 only): If the Angel is the FIRST player executed by vote on Day 1, the Angel wins immediately alone! Otherwise the Angel becomes a regular Villager.',
    revealTrigger:
      '⚠️ ANGEL TRIGGER: Is this Day 1 and the FIRST execution? YES → Angel wins alone! NO → Angel becomes a Villager.',
    description:
      'Wins alone if they are the first player executed by village vote on Day 1. Otherwise they become a regular Villager for the rest of the game.',
    emoji: '👼',
  },
];

export const ROLE_MAP: Record<string, RoleDefinition> = Object.fromEntries(
  ROLES.map((r) => [r.id, r])
);

/** All role IDs that count as werewolf-aligned */
export const WOLF_ROLE_IDS = ['werewolf', 'big_bad_wolf', 'infect_pere'];

/** Role IDs that are loners (win alone, not with village or wolves) */
export const LONER_ROLE_IDS = ['white_werewolf', 'pied_piper', 'angel'];

/** Returns night-phase roles in night order (ascending) for a given set of roleIds and round */
export function getNightOrder(roleIds: string[], round: number): RoleDefinition[] {
  return ROLES.filter((r) => {
    if (r.nightOrder === null) return false;
    if (!roleIds.includes(r.id)) return false;
    if (r.firstNightOnly && round > 1) return false;
    if (r.everyOtherNight && round % 2 !== 0) return false;
    if (r.oddNightsOnly && round % 2 !== 1) return false;
    return true;
  }).sort((a, b) => (a.nightOrder as number) - (b.nightOrder as number));
}
