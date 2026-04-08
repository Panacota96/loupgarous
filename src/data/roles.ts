import type { RoleDefinition, Language } from '../types/game.types';

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
    descriptionFr: 'Villageois simple sans pouvoir. Votez avec sagesse !',
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
      descriptionFr:
        'Tous les Loups-Garous (y compris le Grand Méchant Loup et l’Infect Père des Loups) ouvrent les yeux et choisissent silencieusement une victime à dévorer.',
    },
    dayTrigger: null,
    revealTrigger: 'One less wolf! The village rejoices… or does it?',
    revealTriggerFr: 'Un loup en moins ! Le village jubile… ou peut-être pas ?',
    description:
      'Each night, werewolves choose a villager to devour. Wolves win when their number ≥ remaining villagers.',
    descriptionFr:
      'Chaque nuit, les loups choisissent un villageois à dévorer. Les loups gagnent quand leur nombre ≥ aux villageois restants.',
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
      descriptionFr:
        'OPTION — seulement tant qu’AUCUN loup n’a été éliminé : le Grand Méchant Loup peut secrètement dévorer UNE victime supplémentaire en plus de l’attaque normale.',
    },
    dayTrigger:
      'If no wolf has been eliminated yet, the Big Bad Wolf still has its extra-kill power.',
    dayTriggerFr:
      'Tant qu’aucun loup n’a été éliminé, le Grand Méchant Loup conserve son pouvoir de mise à mort supplémentaire.',
    revealTrigger: 'The Big Bad Wolf is dead! Their extra kill power is gone.',
    revealTriggerFr: 'Le Grand Méchant Loup est mort ! Son pouvoir supplémentaire disparaît.',
    description:
      'Participates in the normal wolf attack. While no wolf has been eliminated, may additionally devour one more victim each night.',
    descriptionFr:
      'Participe à l’attaque normale des loups. Tant qu’aucun loup n’est mort, peut dévorer une victime supplémentaire chaque nuit.',
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
      descriptionFr:
        'UNE FOIS PAR PARTIE : au lieu de dévorer la victime des loups, l’Infect Père des Loups peut l’INFECTER. Le joueur infecté reste en vie mais rejoint secrètement l’équipe des loups (sa carte reste cachée).',
      isOneTime: true,
      key: 'infect_pere',
    },
    dayTrigger:
      'The infected player is a secret wolf — their real card is never revealed while alive.',
    dayTriggerFr:
      'Le joueur infecté est un loup secret — sa vraie carte n’est jamais révélée tant qu’il est en vie.',
    revealTrigger:
      '⚠️ INFECT PÈRE TRIGGER: If this player was infected, they secretly fought for the wolves.',
    revealTriggerFr:
      '⚠️ DÉCLENCHEUR INFECT PÈRE : si ce joueur a été infecté, il combattait secrètement pour les loups.',
    description:
      'Once per game, instead of killing the wolf victim, infects them — the victim secretly joins the wolf team.',
    descriptionFr:
      'Une fois par partie, au lieu de tuer la victime des loups, il l’infecte — la victime rejoint secrètement la meute.',
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
      descriptionFr:
        'La Voyante ouvre les yeux et pointe silencieusement un joueur. Le MJ lui montre la carte de rôle de ce joueur.',
    },
    dayTrigger:
      'Seer may hint to the village (she must be careful not to reveal herself).',
    dayTriggerFr:
      'La Voyante peut donner des indices au village (elle doit éviter de se révéler).',
    revealTrigger: 'The Seer is dead! The village loses a critical ally.',
    revealTriggerFr: 'La Voyante est morte ! Le village perd un allié essentiel.',
    description: 'Each night, the Seer learns the true role of one player.',
    descriptionFr: 'Chaque nuit, la Voyante découvre le vrai rôle d’un joueur.',
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
      descriptionFr:
        'Le MJ indique à la Sorcière qui a été attaqué. Elle peut utiliser sa potion de VIE (une fois) pour le sauver, et/ou sa potion de MORT (une fois) pour tuer n’importe qui.',
    },
    dayTrigger: null,
    revealTrigger: 'The Witch is dead! Check which potions she had remaining.',
    revealTriggerFr: 'La Sorcière est morte ! Vérifiez quelles potions il lui restait.',
    description:
      'Has one healing potion (save the night victim) and one death potion (kill anyone). Each is single-use.',
    descriptionFr:
      'Possède une potion de vie (sauver la victime de la nuit) et une potion de mort (tuer n’importe qui). Chacune est à usage unique.',
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
    revealTriggerFr:
      '⚠️ DÉCLENCHEUR CHASSEUR : le Chasseur doit immédiatement tirer sur un joueur avant de quitter la partie !',
    description:
      'When eliminated (by wolves or by vote), the Hunter immediately shoots one other player.',
    descriptionFr:
      'Lorsqu’il est éliminé (par les loups ou par vote), le Chasseur tire immédiatement sur un autre joueur.',
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
      descriptionFr:
        'PREMIÈRE NUIT UNIQUEMENT : Cupidon ouvre les yeux et désigne deux joueurs qui deviendront Amoureux. Le MJ les touche. Si un Amoureux meurt, l’autre meurt de chagrin.',
      isOneTime: true,
      key: 'cupid_link',
    },
    dayTrigger: null,
    revealTrigger: 'Cupid is revealed. The lovers remain secret.',
    revealTriggerFr: 'Cupidon est révélé. Les Amoureux restent secrets.',
    description:
      'On the first night, links two players as Lovers. If one dies, the other dies immediately.',
    descriptionFr:
      'La première nuit, lie deux joueurs en tant qu’Amoureux. Si l’un meurt, l’autre meurt immédiatement.',
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
      descriptionFr:
        'Pendant le tour des Loups-Garous, la Petite Fille peut espionner discrètement. Si un loup la surprend, il peut immédiatement changer sa cible pour l’éliminer.',
    },
    dayTrigger: null,
    revealTrigger: 'The Little Girl is revealed.',
    revealTriggerFr: 'La Petite Fille est révélée.',
    description:
      'May secretly spy during the werewolf turn at risk of being caught.',
    descriptionFr:
        'Peut espionner secrètement pendant le tour des loups au risque d’être découverte.',
    emoji: '👧',
  },
  {
    id: 'mayor',
    name: 'Mayor / Captain',
    nameFr: 'Maire / Capitaine',
    camp: 'village',
    setupSelectable: false,
    minCount: 0,
    maxCount: 1,
    nightOrder: null,
    nightAction: null,
    dayTrigger:
      'Captain\'s vote counts as 2. If the Captain dies, they designate a successor immediately.',
    dayTriggerFr:
      'Le vote du Capitaine compte double. S’il meurt, il désigne immédiatement un successeur.',
    revealTrigger:
      '⚠️ CAPTAIN TRIGGER: Captain designates a new Captain before being eliminated!',
    revealTriggerFr:
      '⚠️ DÉCLENCHEUR CAPITAINE : le Capitaine désigne un nouveau Capitaine avant d’être éliminé !',
    description:
      'Elected on Day 1. Vote counts double. On death, designates successor.',
    descriptionFr:
      'Élu au Jour 1. Son vote compte double. À sa mort, il désigne son successeur.',
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
      descriptionFr:
        'Le Salvateur ouvre les yeux et désigne un joueur à protéger pour la nuit (ne peut pas protéger le même joueur deux nuits de suite).',
    },
    dayTrigger: null,
    revealTrigger: 'The Protector is revealed. Protection is lost.',
    revealTriggerFr: 'Le Salvateur est révélé. La protection est perdue.',
    description:
      'Each night, protects one player from werewolf attack (not the same player twice in a row).',
    descriptionFr:
      'Chaque nuit, protège un joueur de l’attaque des loups (pas deux nuits de suite sur la même personne).',
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
    dayTriggerFr:
      "L'Ancien survit à la PREMIÈRE attaque des loups. Si le village l'exécute, TOUS les pouvoirs spéciaux des villageois sont définitivement perdus !",
    revealTrigger:
      '⚠️ ELDER TRIGGER: Was this their first wolf attack or a village execution? If village execution → ALL villager special powers removed!',
    revealTriggerFr:
      "⚠️ DÉCLENCHEUR ANCIEN : était-ce sa première attaque de loup ou une exécution du village ? Si exécution → TOUS les pouvoirs des villageois sont retirés !",
    description:
      'Survives the first werewolf attack. If the village votes to execute the Elder, all villager powers are permanently removed.',
    descriptionFr:
      "Survit à la première attaque des loups. Si le village vote son exécution, tous les pouvoirs spéciaux des villageois sont supprimés définitivement.",
    emoji: '🧓',
    optionalRule: 'Elder loses all powers after being attacked once (not just surviving).',
    optionalRuleFr: "L'Ancien perd tous ses pouvoirs après avoir été attaqué une fois (même s'il survit).",
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
    revealTriggerFr:
      "⚠️ DÉCLENCHEUR IDIOT DU VILLAGE : s'il est choisi pour l'exécution, révélez la carte. L'Idiot est ÉPARGNÉ mais perd définitivement son droit de vote !",
    description:
      'If voted for execution, the Village Idiot is spared but permanently loses voting rights.',
    descriptionFr:
      "S'il est exécuté par le vote, l'Idiot du Village est épargné mais perd définitivement son droit de vote.",
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
    revealTriggerFr:
      '⚠️ DÉCLENCHEUR BOUC ÉMISSAIRE : si ce joueur est éliminé suite à une ÉGALITÉ, il décide qui aura le droit de vote au prochain tour.',
    description:
      'If a vote ends in a tie, the Scapegoat is eliminated instead. The Scapegoat then chooses who may vote next round.',
    descriptionFr:
      "Si un vote se termine à égalité, le Bouc Émissaire est éliminé à la place. Il choisit ensuite qui pourra voter au prochain tour.",
    emoji: '🐐',
    optionalRule: 'Apply Scapegoat rule only in exact tie situations.',
    optionalRuleFr: "N'appliquez la règle du Bouc Émissaire qu'en cas d'égalité parfaite.",
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
    dayTriggerFr:
      "SIGNAL DU MATIN : si le voisin immédiat du Montreur d'Ours (gauche ou droite) est un Loup-Garou (ou infecté), l'ours GROGNE au début de la journée. Sinon, il reste silencieux.",
    revealTrigger: 'Bear Tamer is revealed. Bear signals stop.',
    revealTriggerFr: "Le Montreur d'Ours est révélé. Les signaux de l'ours cessent.",
    description:
      'Every morning, the bear growls if one of the Bear Tamer\'s neighbors is a Werewolf or infected.',
    descriptionFr:
      "Chaque matin, l'ours grogne si l'un des voisins du Montreur d'Ours est un Loup-Garou ou infecté.",
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
      descriptionFr:
        'Le Corbeau ouvre les yeux et désigne un joueur. Ce joueur aura 2 voix supplémentaires contre lui lors du vote du lendemain.',
    },
    dayTrigger: 'The Raven\'s chosen player has +2 votes against them today.',
    dayTriggerFr: 'Le joueur choisi par le Corbeau a +2 voix contre lui aujourd’hui.',
    revealTrigger: 'The Raven is revealed. The nightly curse ends.',
    revealTriggerFr: 'Le Corbeau est révélé. La malédiction nocturne prend fin.',
    description:
      'Each night, places a curse on a player giving them +2 votes in the next day\'s vote.',
    descriptionFr:
      'Chaque nuit, il place une malédiction sur un joueur, lui donnant +2 voix lors du vote du lendemain.',
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
      descriptionFr:
        'Le Renard ouvre les yeux et désigne un groupe de 3 joueurs adjacents. Le MJ hoche OUI si au moins un est un Loup-Garou, sinon NON. Si aucun loup n’est trouvé, le Renard perd son pouvoir pour le reste de la partie.',
    },
    dayTrigger: null,
    revealTrigger: 'The Fox is revealed.',
    revealTriggerFr: 'Le Renard est révélé.',
    description:
      'Each night, sniffs 3 adjacent players. Told if any is a werewolf. Loses power permanently if all 3 are innocent.',
    descriptionFr:
      'Chaque nuit, renifle 3 joueurs adjacents. Indique si au moins un est un loup. Perd son pouvoir définitivement si les 3 sont innocents.',
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
      descriptionFr:
        'Les Deux Sœurs ouvrent les yeux et se reconnaissent. (Nuit 1 : elles apprennent leur identité. À partir de la nuit 3 : une nuit sur deux elles peuvent communiquer brièvement en silence.)',
    },
    dayTrigger: null,
    revealTrigger: 'A Sister is revealed. The other Sister now plays alone.',
    revealTriggerFr: 'Une Sœur est révélée. L’autre joue désormais seule.',
    description:
      'Two cards — both players are Sisters. They wake up together on night 1 then every other night to silently communicate.',
    descriptionFr:
      'Deux cartes — les deux joueurs sont Sœurs. Elles se réveillent ensemble la nuit 1 puis une nuit sur deux pour communiquer silencieusement.',
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
    dayTriggerFr:
      "⚔️ Si le Chevalier a été dévoré par les loups la nuit dernière, le PREMIER Loup-Garou assis à SA GAUCHE meurt du tétanos au début de ce jour !",
    revealTrigger:
      '⚠️ KNIGHT TRIGGER: If killed by wolves → the first werewolf seated to their LEFT dies of tetanus at dawn!',
    revealTriggerFr:
      '⚠️ DÉCLENCHEUR CHEVALIER : s’il est tué par les loups → le premier loup assis à sa GAUCHE meurt du tétanos à l’aube !',
    description:
      'When devoured by wolves, the first werewolf seated to the Knight\'s left dies of tetanus at the start of the next day.',
    descriptionFr:
      'S’il est dévoré par les loups, le premier loup assis à sa gauche meurt du tétanos au début du jour suivant.',
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
      descriptionFr:
        'PREMIÈRE NUIT UNIQUEMENT : le Chien-Loup ouvre les yeux. Le MJ demande en secret : « Choisis-tu d’être Villageois ou Loup-Garou ? » Le Chien-Loup indique son choix en silence.',
    },
    dayTrigger:
      'Wolf-Dog\'s team depends on their night-1 choice. If Werewolf chosen: they wake with wolves each night.',
    dayTriggerFr:
      'Le camp du Chien-Loup dépend de son choix de la nuit 1. S’il choisit loup : il se réveille avec la meute chaque nuit.',
    revealTrigger:
      '⚠️ WOLF-DOG TRIGGER: Reveal whether they chose Villager or Werewolf. If Werewolf, they count as a wolf for the end-game condition.',
    revealTriggerFr:
      '⚠️ DÉCLENCHEUR CHIEN-LOUP : révélez s’il a choisi Villageois ou Loup-Garou. S’il est loup, il compte comme tel pour la condition de victoire.',
    description:
      'On the first night, secretly chooses to be Villager (no power) or Werewolf (joins the wolf pack).',
    descriptionFr:
      'La première nuit, choisit secrètement d’être Villageois (sans pouvoir) ou Loup-Garou (rejoint la meute).',
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
      descriptionFr:
        'PREMIÈRE NUIT UNIQUEMENT : l’Enfant Sauvage ouvre les yeux et désigne secrètement un joueur comme son « Modèle ». Si ce Modèle meurt, l’Enfant Sauvage devient immédiatement un Loup-Garou.',
    },
    dayTrigger:
      'Wild Child wins with the village if their model survives to the end, or with the wolves if their model died.',
    dayTriggerFr:
      'L’Enfant Sauvage gagne avec le village si son modèle survit, ou avec les loups si son modèle meurt.',
    revealTrigger:
      '⚠️ WILD CHILD TRIGGER: Has their Role Model died? If YES → Wild Child is now a Werewolf!',
    revealTriggerFr:
      '⚠️ DÉCLENCHEUR ENFANT SAUVAGE : son Modèle est-il mort ? Si OUI → l’Enfant Sauvage devient un Loup-Garou !',
    description:
      'Secretly chooses a role model on night 1. Wins with village if model survives; transforms into Werewolf and fights for wolves if model dies.',
    descriptionFr:
      'Choisit secrètement un Modèle la nuit 1. Gagne avec le village si le modèle survit ; devient Loup-Garou et combat avec les loups si le modèle meurt.',
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
      descriptionFr:
        'Une nuit sur deux (à partir de la nuit 2) : après l’attaque normale des loups, le Loup-Garou Blanc ouvre les yeux SEUL et peut dévorer secrètement UN autre loup-garou. Optionnel.',
    },
    dayTrigger: null,
    revealTrigger:
      '⚠️ WHITE WEREWOLF: Loner — wins ALONE as the last survivor. They appear to be a wolf but betray all sides.',
    revealTriggerFr:
      '⚠️ LOUP-GAROU BLANC : Solitaire — gagne SEUL en tant que dernier survivant. Il semble être un loup mais trahit tous les camps.',
    description:
      'Participates with wolves but wins alone. Every other night may secretly kill one other werewolf. Wins when they are the sole survivor.',
    descriptionFr:
      'Participe avec les loups mais gagne seul. Une nuit sur deux, peut tuer secrètement un autre loup. Gagne lorsqu’il est le seul survivant.',
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
      descriptionFr:
        'Le Joueur de Flûte ouvre les yeux et désigne 2 joueurs à envoûter. Les joueurs envoûtés acquiescent discrètement (ex : pouce levé). Le Joueur de Flûte gagne lorsque TOUS les autres joueurs sont envoûtés.',
    },
    dayTrigger:
      'Track enchanted players. Pied Piper wins when ALL others are enchanted. Enchanted players also win if they survive to the Pied Piper\'s victory.',
    dayTriggerFr:
      'Suivez les joueurs envoûtés. Le Joueur de Flûte gagne lorsque TOUS les autres sont envoûtés. Les joueurs envoûtés gagnent aussi s’ils survivent jusqu’à sa victoire.',
    revealTrigger:
      '⚠️ PIED PIPER: Loner — check enchanted count. If all others are enchanted → Pied Piper wins!',
    revealTriggerFr:
      '⚠️ JOUEUR DE FLÛTE : Solitaire — vérifiez le nombre d’envoûtés. Si tous les autres sont envoûtés → victoire du Joueur de Flûte !',
    description:
      'Each night enchants 2 players. Wins alone when all other players are enchanted. Enchanted players share the win if they survive.',
    descriptionFr:
      'Chaque nuit, envoûte 2 joueurs. Gagne seul lorsque tous les autres sont envoûtés. Les joueurs envoûtés partagent la victoire s’ils survivent.',
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
    dayTriggerFr:
      "⭐ CONDITION ANGE (Jour 1 uniquement) : si l'Ange est le PREMIER joueur exécuté par vote au Jour 1, il gagne immédiatement seul ! Sinon l'Ange devient un simple Villageois.",
    revealTrigger:
      '⚠️ ANGEL TRIGGER: Is this Day 1 and the FIRST execution? YES → Angel wins alone! NO → Angel becomes a Villager.',
    revealTriggerFr:
      "⚠️ DÉCLENCHEUR ANGE : est-ce le Jour 1 et la PREMIÈRE exécution ? OUI → l'Ange gagne seul ! NON → l'Ange devient Villageois.",
    description:
      'Wins alone if they are the first player executed by village vote on Day 1. Otherwise they become a regular Villager for the rest of the game.',
    descriptionFr:
      "Gagne seul s'il est le premier joueur exécuté par vote au Jour 1. Sinon, devient un Villageois pour le reste de la partie.",
    emoji: '👼',
  },
];

/** Roles that can be assigned during pre-game setup (excludes in-game statuses like Mayor) */
export const SETUP_ROLES = ROLES.filter((r) => r.setupSelectable !== false);
export const SETUP_ROLE_IDS = new Set(SETUP_ROLES.map((r) => r.id));

export function getRoleName(role: RoleDefinition, language: Language) {
  return language === 'fr' ? role.nameFr : role.name;
}

export function getRoleTexts(role: RoleDefinition, language: Language) {
  const isFr = language === 'fr';
  return {
    name: isFr ? role.nameFr : role.name,
    description: isFr ? role.descriptionFr ?? role.description : role.description,
    nightActionDescription: role.nightAction
      ? (isFr
        ? role.nightAction.descriptionFr ?? role.nightAction.description
        : role.nightAction.description)
      : null,
    dayTrigger: isFr ? role.dayTriggerFr ?? role.dayTrigger : role.dayTrigger,
    revealTrigger: isFr ? role.revealTriggerFr ?? role.revealTrigger : role.revealTrigger,
    optionalRule: isFr ? role.optionalRuleFr ?? role.optionalRule : role.optionalRule,
  };
}

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
