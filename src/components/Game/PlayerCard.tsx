import { useMemo } from 'react';
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
  const player = useGameStore((s) => s.players.find((candidate) => candidate.id === playerId));
  const status = useGameStore((s) => s.playerStatuses[playerId]);
  const eliminatePlayer = useGameStore((s) => s.eliminatePlayer);
  const electMayor = useGameStore((s) => s.electMayor);
  const toggleRoleReveal = useGameStore((s) => s.toggleRoleReveal);

  const role = player ? ROLE_MAP[player.roleId] : null;
  const roleTexts = role ? getRoleTexts(role, language) : null;
  const roleName = role ? getRoleName(role, language) : '';
  const shouldShowRole = showRole || status?.revealed;

  const statusBadges = useMemo(
    () =>
      [
        status?.protected && '🛡️',
        status?.cursed && '🦅',
        status?.enchanted && '🎶',
        status?.infected && '🦠',
        status?.noVote && '🚫',
        status?.transformed && '🐺',
      ].filter(Boolean) as string[],
    [status]
  );

  if (!player || !role) return null;

  return (
    <div
      className={`player-card ${!player.isAlive ? 'dead' : ''} ${
        player.isMayor ? 'mayor' : ''
      } ${player.isLover ? 'lover' : ''}`}
    >
      <div className="player-card-main">
        <div className="player-card-header">
          <span className="player-emoji">{player.isAlive ? '🙂' : '💀'}</span>
          <div className="player-card-identity">
            <span className="player-card-name">{player.name}</span>
            <div className="player-badges">
              {player.isMayor && <span className="badge badge-mayor">{t.playerCard.mayor}</span>}
              {player.isLover && <span className="badge badge-lover">{t.playerCard.lover}</span>}
              {statusBadges.map((badge) => (
                <span key={badge} className="badge badge-status">{badge}</span>
              ))}
            </div>
          </div>
        </div>

        {shouldShowRole && (
          <div className={`player-role camp-${role.camp}`}>
            <span>{role.emoji}</span>
            <span>{roleName}</span>
            {roleTexts?.revealTrigger && (
              <div className="reveal-trigger">⚡ {roleTexts.revealTrigger}</div>
            )}
          </div>
        )}
      </div>

      {player.isAlive && (
        <div className="player-actions">
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => toggleRoleReveal(player.id)}
            title={t.playerCard.revealTitle}
          >
            {status?.revealed ? t.playerCard.hideRole : t.playerCard.revealRole}
          </button>
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
