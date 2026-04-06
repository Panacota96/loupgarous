import { useState, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ROLES } from '../../data/roles';
import RoleReference from '../Roles/RoleReference';
import '../../styles/setup.css';

const MIN_PLAYERS = 5;
const MAX_PLAYERS = 20;
const RULEBOOK_URL =
  'https://media.play-in.com/pdf/rules_games/best_of__les_loups-garous_de_thiercelieux_regles_fr.pdf';

export default function SetupScreen() {
  const setSetup = useGameStore((s) => s.setSetup);
  const startGame = useGameStore((s) => s.startGame);

  const [tab, setTab] = useState<'setup' | 'roles'>('setup');
  const [playerCount, setPlayerCount] = useState(6);
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array.from({ length: 6 }, (_, i) => `Joueur ${i + 1}`)
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
        while (next.length < c) next.push(`Joueur ${next.length + 1}`);
        return next.slice(0, c);
      });
      setRoleAssignment((prev) => {
        const next = [...prev];
        while (next.length < c) next.push('villager');
        return next.slice(0, c);
      });
    },
    []
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
      next[i] = roleId;
      return next;
    });
  };

  // Tally roles assigned
  const roleCounts: Record<string, number> = {};
  roleAssignment.slice(0, playerCount).forEach((r) => {
    roleCounts[r] = (roleCounts[r] ?? 0) + 1;
  });

  // Validation
  const errors: string[] = [];
  Object.entries(roleCounts).forEach(([id, count]) => {
    const def = ROLES.find((r) => r.id === id);
    if (!def) return;
    if (count > def.maxCount)
      errors.push(`Too many "${def.name}" (max ${def.maxCount}).`);
    if (count < def.minCount)
      errors.push(`Not enough "${def.name}" (min ${def.minCount}).`);
  });
  const wolfCount = roleCounts['werewolf'] ?? 0;
  if (wolfCount === 0)
    errors.push('You must have at least 1 Werewolf.');

  const canStart = errors.length === 0;

  const handleStart = () => {
    if (!canStart) return;
    setSetup({
      playerNames: playerNames.slice(0, playerCount),
      roleIds: roleAssignment.slice(0, playerCount),
      discussionTime,
      optionalRules,
    });
    startGame();
  };

  // Role distribution helper: roles that have optional rules
  const optionalRoleRules = ROLES.filter((r) => r.optionalRule);

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <span className="moon-icon">🌕</span>
        <h1>Loup-Garous</h1>
        <p className="subtitle">Game Master Assistant</p>
        <a
          className="btn btn-primary btn-sm rulebook-btn"
          href={RULEBOOK_URL}
          target="_blank"
          rel="noreferrer"
        >
          📖 Règles complètes (PDF)
        </a>
      </div>

      <div className="setup-tabs">
        <button
          className={`tab-btn ${tab === 'setup' ? 'active' : ''}`}
          onClick={() => setTab('setup')}
          data-testid="setup-tab-setup"
        >
          ⚙️ Setup
        </button>
        <button
          className={`tab-btn ${tab === 'roles' ? 'active' : ''}`}
          onClick={() => setTab('roles')}
          data-testid="setup-tab-roles"
        >
          📚 Roles
        </button>
      </div>

      {tab === 'setup' ? (
        <>
          {/* Player Count */}
          <section className="setup-section">
            <h2>👥 Number of Players</h2>
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
              <h2>🃏 Assign Roles</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setTab('roles')}>
                📚 View role descriptions
              </button>
            </div>
            <div className="player-list">
              {Array.from({ length: playerCount }, (_, i) => (
                <div key={i} className="player-row" data-testid={`player-row-${i}`}>
                  <span className="player-num">{i + 1}</span>
                  <input
                    className="player-name-input"
                    value={playerNames[i] ?? `Joueur ${i + 1}`}
                    onChange={(e) => handleNameChange(i, e.target.value)}
                    placeholder={`Player ${i + 1}`}
                  />
                  <select
                    className="role-select"
                    data-testid="role-select"
                    value={roleAssignment[i] ?? 'villager'}
                    onChange={(e) => handleRoleChange(i, e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.emoji} {r.nameFr} / {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>

          {/* Role Summary */}
          <section className="setup-section">
            <h2>📊 Role Summary</h2>
            <div className="role-summary">
              {Object.entries(roleCounts).map(([id, count]) => {
                const def = ROLES.find((r) => r.id === id);
                if (!def) return null;
                return (
                  <div key={id} className={`role-badge camp-${def.camp}`}>
                    {def.emoji} {def.nameFr} ×{count}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Discussion Timer */}
          <section className="setup-section">
            <h2>⏱️ Discussion Timer</h2>
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
              <h2>⚙️ Optional Rules</h2>
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
                    {r.emoji} <strong>{r.nameFr}</strong>: {r.optionalRule}
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
            🐺 Start Game
          </button>
        </>
      ) : (
        <section className="roles-tab-panel" data-testid="setup-roles-tab">
          <p className="roles-tab-hint">
            Review what each role does before you assign them to players.
          </p>
          <RoleReference />
          <div className="roles-tab-actions">
            <button className="btn btn-primary btn-large" onClick={() => setTab('setup')}>
              ↩️ Back to setup
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
