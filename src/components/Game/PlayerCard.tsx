
import { useGameStore } from '../../store/gameStore';
import { ROLE_MAP, getRoleName, getRoleTexts } from '../../data/roles';
import { useI18n } from '../../i18n';
import '../../styles/player.css';

interface Props {
  playerId: string;
  showRole?: boolean;
}

export default function PlayerCard({ playerId, showRole = false }: Props) {
  const { language, t } = useI18n();
  const player = useGameStore((s) => s.players.find((p) => p.id === playerId));
  const eliminatePlayer = useGameStore((s) => s.eliminatePlayer);
  const electMayor = useGameStore((s) => s.electMayor);

  if (!player) return null;

  const role = ROLE_MAP[player.roleId];
  const roleTexts = role ? getRoleTexts(role, language) : null;
  const roleName = role ? getRoleName(role, language) : '';
  const shouldShowRole = showRole;

  return (
    <div
      className={`player-card ${!player.isAlive ? 'dead' : ''} ${
        player.isMayor ? 'mayor' : ''
      } ${player.isLover ? 'lover' : ''}`}
    >
      <div className="player-card-header">
        <span className="player-emoji">{player.isAlive ? '🙂' : '💀'}</span>
        <span className="player-card-name">{player.name}</span>
        <div className="player-badges">
          {player.isMayor && <span className="badge badge-mayor">{t.playerCard.mayor}</span>}
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
              title={t.playerCard.mayorTitle}
            >
              {t.playerCard.makeMayor}
            </button>
          )}
          <button
            className="btn btn-sm btn-danger"
            onClick={() => eliminatePlayer(player.id)}
            title={t.playerCard.eliminateTitle}
          >
            {t.playerCard.eliminate}
          </button>
        </div>
      )}
    </div>
  );
}
