import { useCallback, useMemo, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { SETUP_ROLE_IDS, SETUP_ROLES, getRoleName, getRoleTexts } from '../../data/roles';
import ActionSurface from '../Shared/ActionSurface';
import RoleReference from '../Roles/RoleReference';
import LanguageToggle from '../LanguageToggle';
import QuickGuide from './QuickGuide';
import { useI18n } from '../../i18n';
import '../../styles/setup.css';

const MIN_PLAYERS = 5;
const MAX_PLAYERS = 20;
const RULEBOOK_URL =
  'https://media.play-in.com/pdf/rules_games/best_of__les_loups-garous_de_thiercelieux_regles_fr.pdf';

const ADVANCED_ROLE_IDS = new Set([
  'white_werewolf',
  'pied_piper',
  'infect_pere',
  'big_bad_wolf',
  'wolf_dog',
  'wild_child',
  'village_idiot',
  'scapegoat',
  'raven',
  'fox',
  'cupid',
]);

function createSeatIds(count: number) {
  return Array.from({ length: count }, (_, index) => `p${index}`);
}

export default function SetupScreen() {
  const { language, t } = useI18n();
  const setSetup = useGameStore((s) => s.setSetup);
  const startGame = useGameStore((s) => s.startGame);
  const savedSessions = useGameStore((s) => s.savedSessions);
  const saveNamedSession = useGameStore((s) => s.saveNamedSession);
  const loadNamedSession = useGameStore((s) => s.loadNamedSession);
  const deleteNamedSession = useGameStore((s) => s.deleteNamedSession);
  const setUiMode = useGameStore((s) => s.setUiMode);

  const [tab, setTab] = useState<'setup' | 'roles' | 'guide'>('setup');
  const [playerCount, setPlayerCount] = useState(6);
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array.from({ length: 6 }, (_, index) => t.setup.playerNamePlaceholder(index + 1))
  );
  const [roleAssignment, setRoleAssignment] = useState<string[]>(Array(6).fill('villager'));
  const [seatOrder, setSeatOrder] = useState<string[]>(createSeatIds(6));
  const [discussionTime, setDiscussionTime] = useState(180);
  const [optionalRules, setOptionalRules] = useState<Record<string, boolean>>({});
  const [sessionName, setSessionName] = useState('');

  const switchTab = useCallback(
    (nextTab: 'setup' | 'roles' | 'guide') => {
      setTab(nextTab);
      setUiMode(nextTab === 'setup' ? 'prepare' : 'reference');
    },
    [setUiMode]
  );

  const handlePlayerCountChange = useCallback(
    (count: number) => {
      const nextCount = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, count));
      setPlayerCount(nextCount);
      setPlayerNames((prev) => {
        const next = [...prev];
        while (next.length < nextCount) next.push(t.setup.playerNamePlaceholder(next.length + 1));
        return next.slice(0, nextCount);
      });
      setRoleAssignment((prev) => {
        const next = [...prev];
        while (next.length < nextCount) next.push('villager');
        return next.slice(0, nextCount);
      });
      setSeatOrder((prev) => {
        const nextIds = createSeatIds(nextCount);
        const preserved = prev.filter((id) => nextIds.includes(id));
        return [...preserved, ...nextIds.filter((id) => !preserved.includes(id))];
      });
    },
    [t]
  );

  const handleNameChange = (index: number, value: string) => {
    setPlayerNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRoleChange = (index: number, roleId: string) => {
    setRoleAssignment((prev) => {
      const next = [...prev];
      next[index] = SETUP_ROLE_IDS.has(roleId) ? roleId : 'villager';
      return next;
    });
  };

  const moveSeat = (seatId: string, direction: 'up' | 'down') => {
    setSeatOrder((prev) => {
      const fromIndex = prev.indexOf(seatId);
      const toIndex = fromIndex + (direction === 'up' ? -1 : 1);
      if (fromIndex === -1 || toIndex < 0 || toIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const applyStarterPreset = useCallback(
    (preset: (typeof t.quickGuide.starterSets)[number]) => {
      const nextCount = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, preset.players));
      setPlayerCount(nextCount);
      setPlayerNames((prev) => {
        const next = [...prev];
        while (next.length < nextCount) next.push(t.setup.playerNamePlaceholder(next.length + 1));
        return next.slice(0, nextCount);
      });
      setRoleAssignment(() => {
        const next = preset.roles.slice(0, nextCount);
        while (next.length < nextCount) next.push('villager');
        return next.map((id: string) => (SETUP_ROLE_IDS.has(id) ? id : 'villager'));
      });
      setSeatOrder(createSeatIds(nextCount));
      setOptionalRules({});
    },
    [t]
  );

  const orderedSeats = useMemo(
    () =>
      seatOrder.map((seatId) => {
        const index = Number(seatId.replace('p', ''));
        return {
          seatId,
          index,
          name: playerNames[index] ?? t.setup.playerNamePlaceholder(index + 1),
          roleId: roleAssignment[index] ?? 'villager',
        };
      }),
    [playerNames, roleAssignment, seatOrder, t]
  );

  const roleCounts: Record<string, number> = {};
  roleAssignment.slice(0, playerCount).forEach((roleId) => {
    const normalizedRoleId = SETUP_ROLE_IDS.has(roleId) ? roleId : 'villager';
    roleCounts[normalizedRoleId] = (roleCounts[normalizedRoleId] ?? 0) + 1;
  });

  const errors: string[] = [];
  Object.entries(roleCounts).forEach(([id, count]) => {
    const definition = SETUP_ROLES.find((role) => role.id === id);
    if (!definition) return;
    const roleLabel = getRoleName(definition, language);
    if (count > definition.maxCount) errors.push(t.setup.errors.tooMany(roleLabel, definition.maxCount));
    if (count < definition.minCount) errors.push(t.setup.errors.notEnough(roleLabel, definition.minCount));
  });

  const wolfSideCount =
    (roleCounts['werewolf'] ?? 0) +
    (roleCounts['white_werewolf'] ?? 0) +
    (roleCounts['big_bad_wolf'] ?? 0) +
    (roleCounts['infect_pere'] ?? 0);
  if (wolfSideCount === 0) errors.push(t.setup.errors.needWolf);

  const sistersDef = SETUP_ROLES.find((role) => role.id === 'soeurs');
  if (sistersDef && (roleCounts['soeurs'] ?? 0) === 1) {
    errors.push(t.setup.errors.pairRequired(getRoleName(sistersDef, language)));
  }

  const infoRoleCount =
    (roleCounts['seer'] ?? 0) +
    (roleCounts['protector'] ?? 0) +
    (roleCounts['witch'] ?? 0) +
    (roleCounts['bear_tamer'] ?? 0) +
    (roleCounts['fox'] ?? 0);
  const advancedRoleCount = Object.entries(roleCounts)
    .filter(([id]) => ADVANCED_ROLE_IDS.has(id))
    .reduce((sum, [, count]) => sum + count, 0);

  const balanceNotes = [
    wolfSideCount < Math.ceil(playerCount / 6) && t.setup.balanceWarnings.needPressure,
    infoRoleCount === 0 && t.setup.balanceWarnings.needInformation,
    advancedRoleCount >= Math.ceil(playerCount / 3) && t.setup.balanceWarnings.tooChaotic,
  ].filter(Boolean) as string[];

  const canStart = errors.length === 0;
  const optionalRoleRules = SETUP_ROLES.filter((role) => role.optionalRule);

  const handleStart = () => {
    if (!canStart) return;
    setSetup({
      playerNames: playerNames.slice(0, playerCount),
      roleIds: roleAssignment
        .slice(0, playerCount)
        .map((roleId) => (SETUP_ROLE_IDS.has(roleId) ? roleId : 'villager')),
      discussionTime,
      optionalRules: Object.fromEntries(
        Object.entries(optionalRules).filter(([id]) => SETUP_ROLE_IDS.has(id))
      ),
      seatOrder: seatOrder.slice(0, playerCount),
    });
    startGame();
  };

  const handleSaveSession = () => {
    const name = sessionName.trim() || t.setup.defaultSessionName(playerCount);
    setSetup({
      playerNames: playerNames.slice(0, playerCount),
      roleIds: roleAssignment.slice(0, playerCount),
      discussionTime,
      optionalRules,
      seatOrder: seatOrder.slice(0, playerCount),
    });
    saveNamedSession(name);
    setSessionName('');
  };

  const metrics = [
    { label: t.setup.metrics.players, value: String(playerCount), tone: 'neutral' as const },
    { label: t.setup.metrics.wolfPressure, value: String(wolfSideCount), tone: wolfSideCount > 0 ? 'danger' as const : 'neutral' as const },
    { label: t.setup.metrics.infoRoles, value: String(infoRoleCount), tone: infoRoleCount > 0 ? 'success' as const : 'neutral' as const },
    { label: t.setup.metrics.chaos, value: String(advancedRoleCount), tone: advancedRoleCount > 1 ? 'day' as const : 'neutral' as const },
  ];

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
          onClick={() => switchTab('setup')}
          data-testid="setup-tab-setup"
        >
          ⚙️ {t.setup.prepareTab}
        </button>
        <button
          className={`tab-btn ${tab === 'roles' ? 'active' : ''}`}
          onClick={() => switchTab('roles')}
          data-testid="setup-tab-roles"
        >
          📚 {t.tabs.roles}
        </button>
        <button
          className={`tab-btn ${tab === 'guide' ? 'active' : ''}`}
          onClick={() => switchTab('guide')}
          data-testid="setup-tab-guide"
        >
          📘 {t.quickGuide.title}
        </button>
      </div>

      {tab === 'setup' ? (
        <ActionSurface
          phase="prepare"
          title={t.setup.prepareTitle}
          subtitle={t.setup.prepareSubtitle}
          metrics={metrics}
          className="setup-surface"
          footer={
            <div className="setup-footer-actions">
              <button className="btn btn-ghost" onClick={handleSaveSession}>
                {t.setup.saveSession}
              </button>
              <button
                className="start-btn"
                data-testid="start-game"
                onClick={handleStart}
                disabled={!canStart}
              >
                {t.setup.startGame}
              </button>
            </div>
          }
        >
          <div data-testid="setup-main-tab" className="setup-main-grid">
            <section className="setup-section setup-section--hero">
              <div className="setup-section-header">
                <h2>{t.setup.quickStarts}</h2>
                <p className="setup-kicker">{t.quickGuide.startersSubtitle}</p>
              </div>
              <QuickGuide onApplyPreset={applyStarterPreset} />
            </section>

            <section className="setup-section">
              <div className="setup-section-header">
                <h2>{t.setup.savedSessionsTitle}</h2>
                <span className="setup-kicker">{t.setup.resumeHint}</span>
              </div>
              <div className="session-save-row">
                <input
                  className="player-name-input"
                  value={sessionName}
                  onChange={(event) => setSessionName(event.target.value)}
                  placeholder={t.setup.sessionNamePlaceholder}
                  data-testid="session-name-input"
                />
                <button className="btn btn-ghost" onClick={handleSaveSession} data-testid="save-session">
                  {t.setup.saveSession}
                </button>
              </div>
              {savedSessions.length === 0 ? (
                <p className="setup-empty">{t.setup.noSavedSessions}</p>
              ) : (
                <div className="saved-session-list">
                  {savedSessions.map((session) => (
                    <div key={session.id} className="saved-session-card" data-testid="saved-session-card">
                      <div>
                        <strong>{session.name}</strong>
                        <p>{new Date(session.updatedAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}</p>
                      </div>
                      <div className="saved-session-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => loadNamedSession(session.id)}>
                          {t.setup.loadSession}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteNamedSession(session.id)}>
                          {t.setup.deleteSession}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

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

            <section className="setup-section">
              <div className="setup-section-header">
                <h2>🃏 {t.setup.assignRoles}</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => switchTab('roles')}>
                  📚 {t.setup.viewRoleDescriptions}
                </button>
              </div>
              <div className="player-list">
                {Array.from({ length: playerCount }, (_, index) => (
                  <div key={index} className="player-row" data-testid={`player-row-${index}`}>
                    <span className="player-num">{index + 1}</span>
                    <input
                      className="player-name-input"
                      value={playerNames[index] ?? ''}
                      onChange={(event) => handleNameChange(index, event.target.value)}
                      placeholder={t.setup.playerNamePlaceholder(index + 1)}
                    />
                    <select
                      className="role-select"
                      data-testid="role-select"
                      value={roleAssignment[index] ?? 'villager'}
                      onChange={(event) => handleRoleChange(index, event.target.value)}
                    >
                      {SETUP_ROLES.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.emoji} {getRoleName(role, language)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </section>

            <section className="setup-section">
              <div className="setup-section-header">
                <h2>{t.setup.seatOrder}</h2>
                <span className="setup-kicker">{t.setup.seatOrderHint}</span>
              </div>
              <div className="seat-order-list">
                {orderedSeats.map((seat, index) => {
                  const role = SETUP_ROLES.find((candidate) => candidate.id === seat.roleId);
                  return (
                    <div key={seat.seatId} className="seat-order-row" data-testid={`seat-order-row-${index}`}>
                      <div>
                        <strong>{index + 1}. {seat.name}</strong>
                        <p>{role ? `${role.emoji} ${getRoleName(role, language)}` : seat.roleId}</p>
                      </div>
                      <div className="seat-order-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => moveSeat(seat.seatId, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => moveSeat(seat.seatId, 'down')}
                          disabled={index === orderedSeats.length - 1}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="setup-section">
              <h2>📊 {t.setup.roleSummary}</h2>
              <div className="role-summary">
                {Object.entries(roleCounts).map(([id, count]) => {
                  const role = SETUP_ROLES.find((candidate) => candidate.id === id);
                  if (!role) return null;
                  return (
                    <div key={id} className={`role-badge camp-${role.camp}`}>
                      {role.emoji} {getRoleName(role, language)} ×{count}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="setup-section">
              <div className="setup-section-header">
                <h2>{t.setup.balanceTitle}</h2>
                <span className="setup-kicker">
                  {balanceNotes.length === 0 ? t.setup.balanceGood : t.setup.balanceNeedsAttention}
                </span>
              </div>
              <div className="balance-notes">
                {balanceNotes.length === 0 ? (
                  <div className="balance-note balance-note--good">{t.setup.balanceGoodBody}</div>
                ) : (
                  balanceNotes.map((note) => (
                    <div key={note} className="balance-note balance-note--warn">
                      {note}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="setup-section">
              <h2>⏱️ {t.setup.discussionTimer}</h2>
              <div className="timer-config">
                <button
                  className="count-btn"
                  onClick={() => setDiscussionTime((time) => Math.max(30, time - 30))}
                >
                  −30s
                </button>
                <span className="count-display">
                  {Math.floor(discussionTime / 60)}:{String(discussionTime % 60).padStart(2, '0')}
                </span>
                <button
                  className="count-btn"
                  onClick={() => setDiscussionTime((time) => Math.min(600, time + 30))}
                >
                  +30s
                </button>
              </div>
            </section>

            {optionalRoleRules.length > 0 && (
              <section className="setup-section">
                <h2>⚙️ {t.setup.optionalRules}</h2>
                {optionalRoleRules.map((role) => (
                  <label key={role.id} className="optional-rule">
                    <input
                      type="checkbox"
                      checked={!!optionalRules[role.id]}
                      onChange={(event) =>
                        setOptionalRules((prev) => ({ ...prev, [role.id]: event.target.checked }))
                      }
                    />
                    <span>
                      {role.emoji} <strong>{getRoleName(role, language)}</strong>: {getRoleTexts(role, language).optionalRule}
                    </span>
                  </label>
                ))}
              </section>
            )}

            {errors.length > 0 && (
              <div className="setup-errors">
                {errors.map((error) => (
                  <div key={error} className="error-msg">
                    ⚠️ {error}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ActionSurface>
      ) : tab === 'roles' ? (
        <section className="roles-tab-panel" data-testid="setup-roles-tab">
          <p className="roles-tab-hint">{t.setup.rolesTabHint}</p>
          <RoleReference />
          <div className="roles-tab-actions">
            <button className="btn btn-primary btn-large" onClick={() => switchTab('setup')}>
              {t.setup.backToSetup}
            </button>
          </div>
        </section>
      ) : (
        <section className="roles-tab-panel guide-tab-panel" data-testid="setup-guide-tab">
          <p className="roles-tab-hint">{t.quickGuide.subtitle}</p>
          <QuickGuide onApplyPreset={applyStarterPreset} />
          <div className="roles-tab-actions">
            <button className="btn btn-primary btn-large" onClick={() => switchTab('setup')}>
              {t.setup.backToSetup}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
