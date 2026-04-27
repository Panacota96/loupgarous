
import { useGameStore } from '../../store/gameStore';
import { ROLE_MAP, getRoleName, getRoleTexts } from '../../data/roles';
import { useI18n } from '../../i18n';
import { getPlayerRoleLabel } from '../../utils/playerLabels';
import '../../styles/player.css';

interface Props {
  playerId: string;
  showRole?: boolean;
}

export default function PlayerCard({ playerId, showRole = false }: Props) {
  const { language, t } = useI18n();
  const player = useGameStore((s) => s.players.find((p) => p.id === playerId));
  const players = useGameStore((s) => s.players);
  const eliminatePlayer = useGameStore((s) => s.eliminatePlayer);
  const electMayor = useGameStore((s) => s.electMayor);

  if (!player) return null;

  const role = ROLE_MAP[player.roleId];
  const roleTexts = role ? getRoleTexts(role, language) : null;
  const roleName = role ? getRoleName(role, language) : '';
  const shouldShowRole = showRole;
  const playerDisplayLabel = getPlayerRoleLabel(player, players, language);

  return (
    <div
      className={`player-card ${!player.isAlive ? 'dead' : ''} ${
        player.isMayor ? 'mayor' : ''
      } ${player.isLover ? 'lover' : ''}`}
      data-testid={`player-card-${player.id}`}
    >
      <div className="player-card-header">
        <span className="player-emoji">{player.isAlive ? '🙂' : '💀'}</span>
        <span className="player-card-name">{playerDisplayLabel}</span>
        <div className="player-badges">
          {player.isLover && <span className="badge badge-lover">{t.playerCard.lover}</span>}
        </div>
      </div>

      {shouldShowRole && role && (
        <div className={`player-role camp-${role.camp}`}>
          <span>{role.emoji}</span>
          <span>{roleName}</span>
          {roleTexts?.revealTrigger && (
            <div className="reveal-trigger">⚡ {roleTexts.revealTrigger}</div>
          )}
        </div>
      )}

      {player.isAlive && (
        <div className="player-actions">
          {!player.isMayor && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => electMayor(player.id)}
              data-testid={`elect-mayor-${player.id}`}
              title={t.playerCard.mayorTitle}
            >
              {t.playerCard.makeMayor}
            </button>
          )}
          <button
            className="btn btn-sm btn-danger"
            onClick={() => eliminatePlayer(player.id)}
            data-testid={`eliminate-${player.id}`}
            title={t.playerCard.eliminateTitle}
          >
            {t.playerCard.eliminate}
          </button>
        </div>
      )}
    </div>
  );
}
