import { useState, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { SETUP_ROLE_IDS, SETUP_ROLES, getRoleName, getRoleTexts } from '../../data/roles';
import RoleReference from '../Roles/RoleReference';
import LanguageToggle from '../LanguageToggle';
import QuickGuide from './QuickGuide';
import { useI18n } from '../../i18n';
import '../../styles/setup.css';

const MIN_PLAYERS = 5;
const MAX_PLAYERS = 20;
const RULEBOOK_URL =
  'https://media.play-in.com/pdf/rules_games/best_of__les_loups-garous_de_thiercelieux_regles_fr.pdf';

export default function SetupScreen() {
  const { language, t } = useI18n();
  const setSetup = useGameStore((s) => s.setSetup);
  const startGame = useGameStore((s) => s.startGame);

  const [tab, setTab] = useState<'setup' | 'roles' | 'guide'>('setup');
  const [playerCount, setPlayerCount] = useState(6);
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array.from({ length: 6 }, (_, i) => t.setup.playerNamePlaceholder(i + 1))
  );
  const [roleAssignment, setRoleAssignment] = useState<string[]>(
    Array(6).fill('villager')
  );
  const [discussionTime, setDiscussionTime] = useState(180);
  const [optionalRules, setOptionalRules] = useState<Record<string, boolean>>({});

  const handlePlayerCountChange = useCallback(
    (count: number) => {
      const c = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, count));
      setPlayerCount(c);
      setPlayerNames((prev) => {
        const next = [...prev];
        while (next.length < c) next.push(t.setup.playerNamePlaceholder(next.length + 1));
        return next.slice(0, c);
      });
      setRoleAssignment((prev) => {
        const next = [...prev];
        while (next.length < c) next.push('villager');
        return next.slice(0, c);
      });
    },
    [t]
  );

  const handleNameChange = (i: number, value: string) => {
    setPlayerNames((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  };

  const handleRoleChange = (i: number, roleId: string) => {
    setRoleAssignment((prev) => {
      const next = [...prev];
      next[i] = SETUP_ROLE_IDS.has(roleId) ? roleId : 'villager';
      return next;
    });
  };

  const applyStarterPreset = useCallback(
    (preset: (typeof t.quickGuide.starterSets)[number]) => {
      const clamped = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, preset.players));
      setPlayerCount(clamped);
      setPlayerNames((prev) => {
        const next = [...prev];
        while (next.length < clamped) next.push(t.setup.playerNamePlaceholder(next.length + 1));
        return next.slice(0, clamped);
      });
      setRoleAssignment(() => {
        const next = preset.roles.slice(0, clamped);
        while (next.length < clamped) next.push('villager');
        return next.map((id: string) => (SETUP_ROLE_IDS.has(id) ? id : 'villager'));
      });
      setOptionalRules({});
    },
    [t]
  );

  // Tally roles assigned
  const roleCounts: Record<string, number> = {};
  roleAssignment.slice(0, playerCount).forEach((r) => {
    const roleId = SETUP_ROLE_IDS.has(r) ? r : 'villager';
    roleCounts[roleId] = (roleCounts[roleId] ?? 0) + 1;
  });

  // Validation
  const errors: string[] = [];
  Object.entries(roleCounts).forEach(([id, count]) => {
    const def = SETUP_ROLES.find((r) => r.id === id);
    if (!def) return;
    const roleLabel = getRoleName(def, language);
    if (count > def.maxCount)
      errors.push(t.setup.errors.tooMany(roleLabel, def.maxCount));
    if (count < def.minCount)
      errors.push(t.setup.errors.notEnough(roleLabel, def.minCount));
  });
  const wolfSideCount = (roleCounts['werewolf'] ?? 0) + (roleCounts['white_werewolf'] ?? 0);
  if (wolfSideCount === 0)
    errors.push(t.setup.errors.needWolf);
  const sistersDef = SETUP_ROLES.find((r) => r.id === 'soeurs');
  if (sistersDef && (roleCounts['soeurs'] ?? 0) === 1)
    errors.push(t.setup.errors.pairRequired(getRoleName(sistersDef, language)));

  const canStart = errors.length === 0;

  const handleStart = () => {
    if (!canStart) return;
    const sanitizedRoleIds = roleAssignment
      .slice(0, playerCount)
      .map((id) => (SETUP_ROLE_IDS.has(id) ? id : 'villager'));
    const allowedOptionalRules = Object.fromEntries(
      Object.entries(optionalRules).filter(([id]) => SETUP_ROLE_IDS.has(id))
    );
    setSetup({
      playerNames: playerNames.slice(0, playerCount),
      roleIds: sanitizedRoleIds,
      discussionTime,
      optionalRules: allowedOptionalRules,
    });
    startGame();
  };

  // Role distribution helper: roles that have optional rules
  const optionalRoleRules = SETUP_ROLES.filter((r) => r.optionalRule);

  return (
    <div className="setup-screen">
      <div className="corner-actions">
        <LanguageToggle compact />
        <a
          className="btn btn-primary btn-sm rulebook-btn"
          href={RULEBOOK_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={t.rulebook}
        >
          <span aria-hidden="true">📖</span>
        </a>
      </div>
      <div className="setup-header">
        <span className="moon-icon">🌕</span>
        <h1>{t.appTitle}</h1>
        <p className="subtitle">{t.appSubtitle}</p>
      </div>

      <div className="setup-tabs">
        <button
          className={`tab-btn ${tab === 'setup' ? 'active' : ''}`}
          onClick={() => setTab('setup')}
          data-testid="setup-tab-setup"
        >
          ⚙️ {t.tabs.setup}
        </button>
        <button
          className={`tab-btn ${tab === 'roles' ? 'active' : ''}`}
          onClick={() => setTab('roles')}
          data-testid="setup-tab-roles"
        >
          📚 {t.tabs.roles}
        </button>
        <button
          className={`tab-btn ${tab === 'guide' ? 'active' : ''}`}
          onClick={() => setTab('guide')}
          data-testid="setup-tab-guide"
        >
          {language === 'fr' ? '📘 Guide rapide' : '📘 Quick Guide'}
        </button>
      </div>

      {tab === 'setup' ? (
        <div data-testid="setup-main-tab">
          {/* Player Count */}
          <section className="setup-section">
            <h2>👥 {t.setup.numberOfPlayers}</h2>
            <div className="player-count-row">
              <button
                className="count-btn"
                onClick={() => handlePlayerCountChange(playerCount - 1)}
                disabled={playerCount <= MIN_PLAYERS}
              >
                −
              </button>
              <span className="count-display">{playerCount}</span>
              <button
                className="count-btn"
                onClick={() => handlePlayerCountChange(playerCount + 1)}
                disabled={playerCount >= MAX_PLAYERS}
              >
                +
              </button>
            </div>
          </section>

          {/* Player Names & Role Assignment */}
          <section className="setup-section">
            <div className="setup-section-header">
              <h2>🃏 {t.setup.assignRoles}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setTab('roles')}>
                📚 {t.setup.viewRoleDescriptions}
              </button>
            </div>
            <div className="player-list">
              {Array.from({ length: playerCount }, (_, i) => (
                <div key={i} className="player-row" data-testid={`player-row-${i}`}>
                  <span className="player-num">{i + 1}</span>
                  <input
                    className="player-name-input"
                    value={playerNames[i] ?? ''}
                    onChange={(e) => handleNameChange(i, e.target.value)}
                    placeholder={t.setup.playerNamePlaceholder(i + 1)}
                  />
                  <select
                    className="role-select"
                    data-testid="role-select"
                    value={roleAssignment[i] ?? 'villager'}
                    onChange={(e) => handleRoleChange(i, e.target.value)}
                  >
                    {SETUP_ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.emoji} {getRoleName(r, language)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>

          {/* Role Summary */}
          <section className="setup-section">
            <h2>📊 {t.setup.roleSummary}</h2>
            <div className="role-summary">
              {Object.entries(roleCounts).map(([id, count]) => {
                const def = SETUP_ROLES.find((r) => r.id === id);
                if (!def) return null;
                return (
                  <div key={id} className={`role-badge camp-${def.camp}`}>
                    {def.emoji} {getRoleName(def, language)} ×{count}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Discussion Timer */}
          <section className="setup-section">
            <h2>⏱️ {t.setup.discussionTimer}</h2>
            <div className="timer-config">
              <button
                className="count-btn"
                onClick={() => setDiscussionTime((t) => Math.max(30, t - 30))}
              >
                −30s
              </button>
              <span className="count-display">
                {Math.floor(discussionTime / 60)}:{String(discussionTime % 60).padStart(2, '0')}
              </span>
              <button
                className="count-btn"
                onClick={() => setDiscussionTime((t) => Math.min(600, t + 30))}
              >
                +30s
              </button>
            </div>
          </section>

          {/* Optional Rules */}
          {optionalRoleRules.length > 0 && (
            <section className="setup-section">
              <h2>⚙️ {t.setup.optionalRules}</h2>
              {optionalRoleRules.map((r) => (
                <label key={r.id} className="optional-rule">
                  <input
                    type="checkbox"
                    checked={!!optionalRules[r.id]}
                    onChange={(e) =>
                      setOptionalRules((prev) => ({ ...prev, [r.id]: e.target.checked }))
                    }
                  />
                  <span>
                    {r.emoji} <strong>{getRoleName(r, language)}</strong>: {getRoleTexts(r, language).optionalRule}
                  </span>
                </label>
              ))}
            </section>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="setup-errors">
              {errors.map((e, i) => (
                <div key={i} className="error-msg">
                  ⚠️ {e}
                </div>
              ))}
            </div>
          )}

          <button
            className="start-btn"
            data-testid="start-game"
            onClick={handleStart}
            disabled={!canStart}
          >
            {t.setup.startGame}
          </button>
        </div>
      ) : tab === 'roles' ? (
        <section className="roles-tab-panel" data-testid="setup-roles-tab">
          <p className="roles-tab-hint">{t.setup.rolesTabHint}</p>
          <RoleReference />
          <div className="roles-tab-actions">
            <button className="btn btn-primary btn-large" onClick={() => setTab('setup')}>
              {t.setup.backToSetup}
            </button>
          </div>
        </section>
      ) : (
        <section className="roles-tab-panel guide-tab-panel" data-testid="setup-guide-tab">
          <p className="roles-tab-hint">{t.quickGuide.subtitle}</p>
          <QuickGuide onApplyPreset={applyStarterPreset} />
          <div className="roles-tab-actions">
            <button className="btn btn-primary btn-large" onClick={() => setTab('setup')}>
              {t.setup.backToSetup}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
