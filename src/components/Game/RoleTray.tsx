import { ROLE_MAP, getRoleName } from '../../data/roles';
import { useI18n } from '../../i18n';
import { useGameStore } from '../../store/gameStore';
import { getSeatNumber } from '../../utils/playerLabels';

export default function RoleTray() {
  const { language, t } = useI18n();
  const players = useGameStore((s) => s.players);
  const activePlayers = players.filter((player) => player.isAlive);

  if (activePlayers.length === 0) return null;

  return (
    <section
      className="gm-role-tray"
      data-testid="gm-role-tray"
      aria-label={t.game.roleTrayLabel}
    >
      <div className="gm-role-tray__list" role="list">
        {activePlayers.map((player) => {
          const role = ROLE_MAP[player.roleId];
          const roleName = role ? getRoleName(role, language) : player.roleId;
          const seatNumber = getSeatNumber(player, players);
          const fullLabel = `#${seatNumber} ${roleName}`;

          return (
            <div
              key={player.id}
              className={`gm-role-chip camp-${role?.camp ?? 'unknown'}`}
              data-testid={`gm-role-chip-${player.id}`}
              role="listitem"
              title={fullLabel}
              aria-label={fullLabel}
            >
              <span className="gm-role-chip__seat">#{seatNumber}</span>
              <span className="gm-role-chip__emoji" aria-hidden="true">
                {role?.emoji ?? '?'}
              </span>
              <span className="gm-role-chip__name">{roleName}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
