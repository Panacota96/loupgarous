import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ROLE_MAP } from '../../data/roles';
import PlayerCard from './PlayerCard';
import Timer from './Timer';
import TieBreaker from './TieBreaker';
import '../../styles/day.css';

export default function DayPhase() {
  const players = useGameStore((s) => s.players);
  const alivePlayers = players.filter((p) => p.isAlive);
  const votes = useGameStore((s) => s.votes);
  const round = useGameStore((s) => s.round);

  const setVote = useGameStore((s) => s.setVote);
  const clearVotes = useGameStore((s) => s.clearVotes);
  const eliminatePlayer = useGameStore((s) => s.eliminatePlayer);
  const togglePhase = useGameStore((s) => s.togglePhase);

  const [showTieBreaker, setShowTieBreaker] = useState(false);
  const [revealAll, setRevealAll] = useState(false);

  // Bear Tamer morning signal
  const bearTamer = players.find((p) => p.isAlive && p.roleId === 'bear_tamer');
  const bearGrowls = (() => {
    if (!bearTamer) return false;
    const idx = alivePlayers.findIndex((p) => p.id === bearTamer.id);
    const left = alivePlayers[(idx - 1 + alivePlayers.length) % alivePlayers.length];
    const right = alivePlayers[(idx + 1) % alivePlayers.length];
    return (
      left?.roleId === 'werewolf' || right?.roleId === 'werewolf'
    );
  })();

  // Compute vote totals (extra votes from Raven curse or similar effects)
  const voteMap: Record<string, number> = {};
  alivePlayers.forEach((p) => {
    const voteEntry = votes.find((v) => v.targetId === p.id);
    const base = voteEntry?.count ?? 0;
    const extra = p.extraVotes ?? 0;
    voteMap[p.id] = base + extra;
  });

  const maxVotes = Math.max(0, ...Object.values(voteMap));
  const topPlayers = alivePlayers.filter((p) => voteMap[p.id] === maxVotes && maxVotes > 0);
  const isTie = topPlayers.length > 1;

  const executeTop = () => {
    if (topPlayers.length === 1) {
      eliminatePlayer(topPlayers[0].id);
      clearVotes();
    }
  };

  // Day triggers to remind DM
  const dayTriggers = alivePlayers
    .map((p) => ROLE_MAP[p.roleId])
    .filter((r) => r?.dayTrigger);

  return (
    <div className="day-phase">
      <div className="day-header">
        <span className="phase-icon">☀️</span>
        <div>
          <h2>Day Phase — Round {round}</h2>
          <p className="day-subtitle">All players open their eyes.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setRevealAll((r) => !r)}>
          {revealAll ? '🙈 Hide Roles' : '👁 DM View'}
        </button>
      </div>

      {/* Bear Tamer Signal */}
      {bearTamer && (
        <div className={`bear-signal ${bearGrowls ? 'growl' : 'silent'}`}>
          🐻 Bear signal: <strong>{bearGrowls ? '🔊 GROWLS (wolf nearby!)' : '🤫 Silent'}</strong>
        </div>
      )}

      {/* Day Triggers */}
      {dayTriggers.length > 0 && (
        <div className="day-triggers">
          <h3>📋 DM Reminders</h3>
          {dayTriggers.map((r) => (
            <div key={r!.id} className="day-trigger-item">
              {r!.emoji} <strong>{r!.nameFr}:</strong> {r!.dayTrigger}
            </div>
          ))}
        </div>
      )}

      {/* Discussion Timer */}
      <Timer />

      {/* Players Grid */}
      <section className="day-players">
        <h3>👥 Players ({alivePlayers.length} alive)</h3>
        <div className="players-grid">
          {players.map((p) => (
            <PlayerCard key={p.id} playerId={p.id} showRole={revealAll} />
          ))}
        </div>
      </section>

      {/* Voting */}
      <section className="voting-section">
        <div className="voting-header">
          <h3>🗳️ Voting</h3>
          <button className="btn btn-ghost btn-sm" onClick={clearVotes}>
            🔄 Reset Votes
          </button>
        </div>
        <div className="vote-list">
          {alivePlayers.map((p) => {
            const count = votes.find((v) => v.targetId === p.id)?.count ?? 0;
            return (
              <div key={p.id} className={`vote-row ${voteMap[p.id] === maxVotes && maxVotes > 0 ? 'vote-top' : ''}`}>
                <span className="vote-name">
                  {p.name}
                  {p.isMayor && ' 🎖️'}
                  {p.extraVotes > 0 && (
                    <span className="extra-votes">+{p.extraVotes} extra</span>
                  )}
                </span>
                <div className="vote-controls">
                  <button
                    className="vote-btn"
                    onClick={() => setVote(p.id, Math.max(0, count - 1))}
                  >
                    −
                  </button>
                  <span className="vote-count">{voteMap[p.id]}</span>
                  <button
                    className="vote-btn"
                    onClick={() => setVote(p.id, count + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Execute or Tie */}
        {maxVotes > 0 && (
          <div className="vote-result">
            {isTie ? (
              <div className="tie-warning">
                ⚖️ TIE between {topPlayers.map((p) => p.name).join(' & ')}!
                <button
                  className="btn btn-yellow"
                  onClick={() => setShowTieBreaker(true)}
                >
                  ⚖️ Tie-Breaker
                </button>
              </div>
            ) : (
              <button className="btn btn-danger btn-large" onClick={executeTop}>
                ☠️ Execute {topPlayers[0]?.name}
              </button>
            )}
          </div>
        )}

        {showTieBreaker && <TieBreaker />}
      </section>

      {/* Night transition */}
      <section className="day-footer">
        <button className="btn btn-primary btn-large night-btn" onClick={togglePhase}>
          🌙 Start Night Phase
        </button>
      </section>
    </div>
  );
}
