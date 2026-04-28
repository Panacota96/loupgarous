import { ROLE_MAP, getRoleName } from '../../data/roles';
import { useI18n } from '../../i18n';
import { useGameStore } from '../../store/gameStore';
import { getSeatNumber } from '../../utils/playerLabels';

export default function RoleTray() {
  const { language, t } = useI18n();
  const players = useGameStore((s) => s.players);

  if (players.length === 0) return null;

  return (
    <section
      className="gm-role-tray"
      data-testid="gm-role-tray"
      aria-label={t.game.roleTrayLabel}
    >
      <div className="gm-role-tray__list" role="list">
        {players.map((player) => {
          const role = ROLE_MAP[player.roleId];
          const roleName = role ? getRoleName(role, language) : player.roleId;
          const seatNumber = getSeatNumber(player, players);
          const fullLabel = `#${seatNumber} ${roleName}`;
          const chipLabel = `${fullLabel}${!player.isAlive ? ` - ${t.game.roleTrayDead}` : ''}`;

          return (
            <div
              key={player.id}
              className={`gm-role-chip ${!player.isAlive ? 'is-dead' : ''} camp-${role?.camp ?? 'unknown'}`}
              data-testid={`gm-role-chip-${player.id}`}
              role="listitem"
              title={chipLabel}
              aria-label={chipLabel}
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
