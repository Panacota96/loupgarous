import type { Language, Player } from '../types/game.types';
import { ROLE_MAP, getRoleName } from '../data/roles';

export function getSeatNumber(player: Player, players: Player[]) {
  if (player.seatNumber) return player.seatNumber;
  const index = players.findIndex((p) => p.id === player.id);
  return index >= 0 ? index + 1 : Number(player.id.replace(/\D/g, '')) + 1 || 0;
}

export function getPlayerRoleLabel(
  player: Player,
  players: Player[],
  language: Language
) {
  const role = ROLE_MAP[player.roleId];
  const roleName = role ? getRoleName(role, language) : player.roleId;
  const seat = getSeatNumber(player, players);
  return `#${seat} ${roleName}`;
}

export function getPlayerRoleLabelById(
  playerId: string | null | undefined,
  players: Player[],
  language: Language,
  fallback = 'Unknown'
) {
  if (!playerId) return fallback;
  const player = players.find((p) => p.id === playerId);
  return player ? getPlayerRoleLabel(player, players, language) : fallback;
}
