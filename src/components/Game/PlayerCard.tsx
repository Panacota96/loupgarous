
import { useGameStore } from '../../store/gameStore';
import { ROLE_MAP } from '../../data/roles';
import '../../styles/player.css';

interface Props {
  playerId: string;
  showRole?: boolean;
}

export default function PlayerCard({ playerId, showRole = false }: Props) {
  const player = useGameStore((s) => s.players.find((p) => p.id === playerId));
  const eliminatePlayer = useGameStore((s) => s.eliminatePlayer);
  const revealPlayer = useGameStore((s) => s.revealPlayer);
  const electMayor = useGameStore((s) => s.electMayor);

  if (!player) return null;

  const role = ROLE_MAP[player.roleId];
  const isRevealed = player.isRevealed || showRole;

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
          {player.isMayor && <span className="badge badge-mayor">🎖️ Mayor</span>}
          {player.isLover && <span className="badge badge-lover">💘 Lover</span>}
        </div>
      </div>

      {isRevealed && role && (
        <div className={`player-role camp-${role.camp}`}>
          <span>{role.emoji}</span>
          <span>{role.nameFr}</span>
          {role.revealTrigger && (
            <div className="reveal-trigger">⚡ {role.revealTrigger}</div>
          )}
        </div>
      )}

      {player.isAlive && (
        <div className="player-actions">
          {!player.isRevealed && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => revealPlayer(player.id)}
              title="Reveal role"
            >
              👁 Reveal
            </button>
          )}
          {!player.isMayor && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => electMayor(player.id)}
              title="Make Mayor"
            >
              🎖️ Mayor
            </button>
          )}
          <button
            className="btn btn-sm btn-danger"
            onClick={() => eliminatePlayer(player.id)}
            title="Eliminate"
          >
            ☠️ Elim.
          </button>
        </div>
      )}
    </div>
  );
}
