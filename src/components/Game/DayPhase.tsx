import { useCallback, useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ROLE_MAP, WOLF_ROLE_IDS } from '../../data/roles';
import PlayerCard from './PlayerCard';
import Timer from './Timer';
import TieBreaker from './TieBreaker';
import '../../styles/day.css';

export default function DayPhase() {
  const players = useGameStore((s) => s.players);
  const alivePlayers = players.filter((p) => p.isAlive);
  const votes = useGameStore((s) => s.votes);
  const round = useGameStore((s) => s.round);
  const infectedPlayerIds = useGameStore((s) => s.infectedPlayerIds);
  const enchantedPlayerIds = useGameStore((s) => s.enchantedPlayerIds);
  const wildChildTransformed = useGameStore((s) => s.wildChildTransformed);
  const wolfDogChoice = useGameStore((s) => s.wolfDogChoice);
  const ravenCursedId = useGameStore((s) => s.ravenCursedId);

  const setVote = useGameStore((s) => s.setVote);
  const clearVotes = useGameStore((s) => s.clearVotes);
  const eliminatePlayer = useGameStore((s) => s.eliminatePlayer);
  const togglePhase = useGameStore((s) => s.togglePhase);

  const [showTieBreaker, setShowTieBreaker] = useState(false);
  const [activeTieSignature, setActiveTieSignature] = useState<string | null>(null);
  const [revealAll, setRevealAll] = useState(false);
  // Mayor bonus: track which player the Mayor voted for (adds +1 to their total)
  const [mayorVoteTarget, setMayorVoteTarget] = useState('');

  // Bear Tamer morning signal: use full player list (stable seating order)
  // and scan for the nearest alive neighbor on each side
  const bearTamer = players.find((p) => p.isAlive && p.roleId === 'bear_tamer');
  const bearGrowls = (() => {
    if (!bearTamer || players.length < 2) return false;
    const total = players.length;
    const idx = players.findIndex((p) => p.id === bearTamer.id);
    if (idx === -1) return false;

    const isWolfSide = (p: typeof players[0] | undefined) =>
      !!p &&
      (WOLF_ROLE_IDS.includes(p.roleId) ||
        infectedPlayerIds.includes(p.id) ||
        (p.roleId === 'wolf_dog' && wolfDogChoice === 'werewolf') ||
        (p.roleId === 'wild_child' && wildChildTransformed));

    // Find nearest alive neighbor to the LEFT
    let leftNeighbor: typeof players[0] | undefined;
    for (let offset = 1; offset < total; offset++) {
      const candidate = players[(idx - offset + total) % total];
      if (candidate.isAlive) { leftNeighbor = candidate; break; }
    }
    // Find nearest alive neighbor to the RIGHT
    let rightNeighbor: typeof players[0] | undefined;
    for (let offset = 1; offset < total; offset++) {
      const candidate = players[(idx + offset) % total];
      if (candidate.isAlive) { rightNeighbor = candidate; break; }
    }
    return isWolfSide(leftNeighbor) || isWolfSide(rightNeighbor);
  })();

  // Compute vote totals:
  // base = manually counted votes, +2 for Raven-cursed player, +1 for Mayor's chosen target
  const mayorAlive = players.find((p) => p.isAlive && p.isMayor);
  const voteMap: Record<string, number> = {};
  alivePlayers.forEach((p) => {
    const base = votes.find((v) => v.targetId === p.id)?.count ?? 0;
    const ravenBonus = ravenCursedId === p.id ? 2 : 0;
    const mayorBonus = mayorAlive && mayorVoteTarget === p.id ? 1 : 0;
    voteMap[p.id] = base + ravenBonus + mayorBonus;
  });

  const maxVotes = Math.max(0, ...Object.values(voteMap));
  const topPlayers = alivePlayers.filter((p) => voteMap[p.id] === maxVotes && maxVotes > 0);
  const tiedPlayerIds = topPlayers.map((p) => p.id);
  const tieSignature = tiedPlayerIds.join('|');
  const isTie = topPlayers.length > 1;

  const ravenCursedName = ravenCursedId
    ? (players.find((p) => p.id === ravenCursedId)?.name ?? null)
    : null;

  const executeTop = () => {
    if (topPlayers.length === 1) {
      eliminatePlayer(topPlayers[0].id);
      clearVotes();
    }
  };

  const closeTieBreaker = useCallback(() => {
    setShowTieBreaker(false);
    setActiveTieSignature(null);
  }, []);

  const openTieBreaker = () => {
    if (!isTie) return;
    setActiveTieSignature(tieSignature);
    setShowTieBreaker(true);
  };

  useEffect(() => {
    if (!showTieBreaker) return;

    if (!isTie || activeTieSignature !== tieSignature) {
      closeTieBreaker();
    }
  }, [activeTieSignature, closeTieBreaker, isTie, showTieBreaker, tieSignature]);

  // Day triggers to remind DM
  const dayTriggers = alivePlayers
    .map((p) => ROLE_MAP[p.roleId])
    .filter((r) => r?.dayTrigger);

  return (
    <div className="day-phase" data-testid="day-phase">
      <div className="day-header">
        <span className="phase-icon">☀️</span>
        <div>
          <h2>Day Phase — Round {round}</h2>
          <p className="day-subtitle">All players open their eyes.</p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          data-testid="dm-view-toggle"
          onClick={() => setRevealAll((r) => !r)}
        >
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

      {/* Pied Piper enchanted count */}
      {alivePlayers.some((p) => p.roleId === 'pied_piper') && (() => {
        const aliveEnchantedCount = enchantedPlayerIds.filter(
          (id) => players.find((p) => p.id === id && p.isAlive)
        ).length;
        const piperWins = aliveEnchantedCount >= alivePlayers.length - 1;
        return (
          <div className="day-trigger-item day-enchanted-bar">
            🎶 <strong>Pied Piper enchanted:</strong>{' '}
            {aliveEnchantedCount} / {alivePlayers.length - 1} players
            {piperWins && <span className="win-alert"> ⭐ PIED PIPER WINS!</span>}
          </div>
        );
      })()}

      {/* Infected players (DM-only info) */}
      {infectedPlayerIds.length > 0 && (
        <div className="day-trigger-item day-infected-bar">
          🦠 <strong>Secret wolves (infected):</strong>{' '}
          {infectedPlayerIds
            .map((id) => players.find((p) => p.id === id))
            .filter(Boolean)
            .map((p) => p!.name)
            .join(', ')}
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
          <button className="btn btn-ghost btn-sm" onClick={() => { clearVotes(); setMayorVoteTarget(''); }}>
            🔄 Reset Votes
          </button>
        </div>

        {/* Raven curse reminder */}
        {ravenCursedName && (
          <div className="raven-curse-bar">
            🦅 Raven curse: <strong>{ravenCursedName}</strong> has +2 votes today.
          </div>
        )}

        {/* Mayor bonus vote */}
        {mayorAlive && (
          <div className="mayor-vote-bar">
            🎖️ Mayor <strong>{mayorAlive.name}</strong> votes for:&nbsp;
            <select
              className="mayor-vote-select"
              value={mayorVoteTarget}
              onChange={(e) => setMayorVoteTarget(e.target.value)}
            >
              <option value="">&mdash; No bonus vote &mdash;</option>
              {alivePlayers
                .filter((p) => !p.isMayor)
                .map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {mayorVoteTarget && <span className="extra-votes">+1 Mayor bonus</span>}
          </div>
        )}

        <div className="vote-list">
          {alivePlayers.map((p) => {
            const count = votes.find((v) => v.targetId === p.id)?.count ?? 0;
            return (
              <div key={p.id} className={`vote-row ${voteMap[p.id] === maxVotes && maxVotes > 0 ? 'vote-top' : ''}`}>
                <span className="vote-name">
                  {p.name}
                  {p.isMayor && ' 🎖️'}
                  {ravenCursedId === p.id && <span className="extra-votes">+2 cursed</span>}
                  {mayorAlive && mayorVoteTarget === p.id && <span className="extra-votes">+1 mayor</span>}
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
                  onClick={openTieBreaker}
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

        {showTieBreaker && (
          <TieBreaker tiedPlayerIds={tiedPlayerIds} onClose={closeTieBreaker} />
        )}
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
