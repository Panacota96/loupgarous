import type { RoleDefinition } from '../types/game.types';

export const ROLES: RoleDefinition[] = [
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
  {
    id: 'werewolf',
    name: 'Werewolf',
    nameFr: 'Loup-Garou',
    camp: 'werewolves',
    minCount: 1,
    maxCount: 6,
    nightOrder: 40,
    nightAction: {
      description:
        'All Werewolves open their eyes and silently agree on a victim to devour.',
    },
    dayTrigger: null,
    revealTrigger: 'One less wolf! The village rejoices... or does it?',
    description:
      'Each night, werewolves silently choose a villager to devour. Win when wolves ≥ remaining villagers.',
    emoji: '🐺',
  },
  {
    id: 'seer',
    name: 'Seer',
    nameFr: 'Voyante',
    camp: 'village',
    minCount: 1,
    maxCount: 1,
    nightOrder: 50,
    nightAction: {
      description:
        'The Seer opens her eyes and silently points to a player. The DM shows her that player\'s role card.',
    },
    dayTrigger: 'Seer may give clues to the village (she must be careful not to reveal herself).',
    revealTrigger: 'The Seer is dead! The village loses a critical ally.',
    description:
      'Each night, the Seer learns the true role of one player.',
    emoji: '🔮',
  },
  {
    id: 'witch',
    name: 'Witch',
    nameFr: 'Sorcière',
    camp: 'village',
    minCount: 1,
    maxCount: 1,
    nightOrder: 60,
    nightAction: {
      description:
        'The DM shows the Witch who was attacked. She may use her HEALING potion (once per game) to save them, and/or her DEATH potion (once per game) to kill someone else.',
    },
    dayTrigger: null,
    revealTrigger: 'The Witch is dead! Check which potions she had remaining.',
    description:
      'Has one healing potion (save the night victim) and one death potion (kill anyone). Each potion is single-use.',
    emoji: '🧙‍♀️',
  },
  {
    id: 'hunter',
    name: 'Hunter',
    nameFr: 'Chasseur',
    camp: 'village',
    minCount: 1,
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
    minCount: 1,
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
    minCount: 1,
    maxCount: 1,
    nightOrder: 35, // during wolves, but passively
    nightAction: {
      description:
        'During the Werewolves\' turn, the Little Girl may secretly peek through her fingers. If a wolf catches her, they can change their vote to eliminate her immediately.',
    },
    dayTrigger: null,
    revealTrigger: 'The Little Girl is revealed.',
    description:
      'May secretly spy during the werewolf turn at risk of being caught.',
    emoji: '👧',
  },
  {
    id: 'mayor',
    name: 'Mayor',
    nameFr: 'Maire',
    camp: 'village',
    minCount: 1,
    maxCount: 1,
    nightOrder: null,
    nightAction: null,
    dayTrigger:
      'Mayor\'s vote counts as 2. If Mayor dies, they designate a successor immediately.',
    revealTrigger:
      '⚠️ MAYOR TRIGGER: Mayor designates a new Mayor before being eliminated!',
    description:
      'Elected on Day 1. Vote counts double. On death, designates successor.',
    emoji: '🎖️',
  },
  {
    id: 'protector',
    name: 'Protector',
    nameFr: 'Salvateur',
    camp: 'village',
    minCount: 1,
    maxCount: 1,
    nightOrder: 30,
    nightAction: {
      description:
        'The Protector opens eyes and points to a player to protect for this night (cannot protect the same player two nights in a row).',
    },
    dayTrigger: null,
    revealTrigger: 'The Protector is revealed. Protection is lost.',
    description:
      'Each night, protects one player from werewolf attack (not the same player twice).',
    emoji: '🛡️',
  },
  {
    id: 'elder',
    name: 'Elder',
    nameFr: 'Ancien',
    camp: 'village',
    minCount: 1,
    maxCount: 1,
    nightOrder: null,
    nightAction: null,
    dayTrigger:
      'The Elder can survive the FIRST werewolf attack. If executed by the village, ALL villager special powers are lost!',
    revealTrigger:
      '⚠️ ELDER TRIGGER: Was this their first wolf attack or village execution? If village execution → all villager powers removed!',
    description:
      'Survives the first werewolf attack. If the village votes to execute the Elder, all villager powers are permanently removed.',
    emoji: '🧓',
    optionalRule: 'Elder loses powers after being attacked once.',
  },
  {
    id: 'village_idiot',
    name: 'Village Idiot',
    nameFr: 'Idiot du Village',
    camp: 'village',
    minCount: 1,
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
    minCount: 1,
    maxCount: 1,
    nightOrder: null,
    nightAction: null,
    dayTrigger: null,
    revealTrigger: null,
    description:
      'If a vote ends in a tie, the Scapegoat is eliminated instead. The Scapegoat then chooses who may vote next round.',
    emoji: '🐐',
    optionalRule: 'Apply Scapegoat only in tie situations.',
  },
  {
    id: 'bear_tamer',
    name: 'Bear Tamer',
    nameFr: 'Montreur d\'Ours',
    camp: 'village',
    minCount: 1,
    maxCount: 1,
    nightOrder: null,
    nightAction: null,
    dayTrigger:
      'MORNING SIGNAL: If the Bear Tamer\'s immediate neighbor (left or right) is a Werewolf or infected, the bear GROWLS at the start of day. Otherwise silent.',
    revealTrigger: 'Bear Tamer is revealed. Bear signals stop.',
    description:
      'Every morning, the bear growls if one of the Bear Tamer\'s neighbors is a Werewolf.',
    emoji: '🐻',
  },
  {
    id: 'raven',
    name: 'Raven',
    nameFr: 'Corbeau',
    camp: 'village',
    minCount: 1,
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
    minCount: 1,
    maxCount: 1,
    nightOrder: 45,
    nightAction: {
      description:
        'The Fox opens eyes and points to a group of 3 adjacent players. The DM silently nods YES if at least one is a Werewolf, or shakes NO. If no wolf found, the Fox loses their power.',
      isOneTime: false,
    },
    dayTrigger: null,
    revealTrigger: 'The Fox is revealed.',
    description:
      'Each night, sniffs 3 adjacent players. Told if any is a werewolf. Loses power if all 3 are innocent.',
    emoji: '🦊',
  },
];

export const ROLE_MAP: Record<string, RoleDefinition> = Object.fromEntries(
  ROLES.map((r) => [r.id, r])
);

/** Returns night-phase roles in night order (ascending) for a given set of role IDs */
export function getNightOrder(roleIds: string[]): RoleDefinition[] {
  return ROLES.filter(
    (r) => r.nightOrder !== null && roleIds.includes(r.id)
  ).sort((a, b) => (a.nightOrder as number) - (b.nightOrder as number));
}
