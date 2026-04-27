import { ROLE_MAP, getRoleName } from '../../data/roles';
import { getAutoNightRoleAvailability, useGameStore } from '../../store/gameStore';
import { useI18n } from '../../i18n';

const TRACKED_POWER_ROLE_IDS = ['fox', 'witch', 'infect_pere', 'big_bad_wolf'];

export default function PowerStatusPanel() {
  const { language, t } = useI18n();
  const players = useGameStore((s) => s.players);
  const round = useGameStore((s) => s.round);
  const foxPowerActive = useGameStore((s) => s.foxPowerActive);
  const usedGameAbilities = useGameStore((s) => s.usedGameAbilities);
  const infectedPlayerIds = useGameStore((s) => s.infectedPlayerIds);
  const wolfDogChoice = useGameStore((s) => s.wolfDogChoice);
  const wildChildTransformed = useGameStore((s) => s.wildChildTransformed);
  const rolePowerOverrides = useGameStore((s) => s.rolePowerOverrides ?? {});
  const setRolePowerOverride = useGameStore((s) => s.setRolePowerOverride);

  const powerRoles = TRACKED_POWER_ROLE_IDS.filter((roleId) =>
    players.some((player) => player.roleId === roleId)
  );

  if (powerRoles.length === 0) return null;

  return (
    <section className="power-status-panel" data-testid="power-status-panel">
      <h3>{t.game.powerStatus.title}</h3>
      <div className="power-status-grid">
        {powerRoles.map((roleId) => {
          const role = ROLE_MAP[roleId];
          if (!role) return null;
          const autoActive = getAutoNightRoleAvailability(roleId, {
            players,
            round,
            foxPowerActive,
            usedGameAbilities,
            infectedPlayerIds,
            wolfDogChoice,
            wildChildTransformed,
            rolePowerOverrides: {},
          });
          const override = rolePowerOverrides[roleId];
          const effectiveActive = typeof override === 'boolean' ? override : autoActive;

          return (
            <div key={roleId} className="power-status-row">
              <div className="power-status-role">
                <span>{role.emoji}</span>
                <strong>{getRoleName(role, language)}</strong>
              </div>
              <label className="power-status-toggle">
                <input
                  type="checkbox"
                  data-testid={`power-toggle-${roleId}`}
                  checked={effectiveActive}
                  onChange={(event) => setRolePowerOverride(roleId, event.target.checked)}
                />
                <span>
                  {effectiveActive ? t.game.powerStatus.active : t.game.powerStatus.inactive}
                </span>
              </label>
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                data-testid={`power-auto-${roleId}`}
                onClick={() => setRolePowerOverride(roleId, null)}
                disabled={typeof override !== 'boolean'}
              >
                {t.game.powerStatus.resetAuto}
              </button>
              <span className="power-status-auto">
                {t.game.powerStatus.auto}: {autoActive ? t.game.powerStatus.active : t.game.powerStatus.inactive}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
