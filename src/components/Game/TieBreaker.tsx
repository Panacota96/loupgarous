import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import '../../styles/tiebreaker.css';

export default function TieBreaker() {
  const players = useGameStore((s) => s.players.filter((p) => p.isAlive));
  const eliminatePlayer = useGameStore((s) => s.eliminatePlayer);
  const addLog = useGameStore((s) => s.addLog);

  const [tieIds, setTieIds] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const toggle = (id: string) => {
    setTieIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setResult(null);
  };

  const runTieBreaker = () => {
    if (tieIds.length < 2) return;
    const pick = tieIds[Math.floor(Math.random() * tieIds.length)];
    const name = players.find((p) => p.id === pick)?.name ?? pick;
    setResult(pick);
    addLog(`Tie-breaker: ${name} was randomly selected for elimination.`);
  };

  const confirmElim = () => {
    if (!result) return;
    eliminatePlayer(result);
    setTieIds([]);
    setResult(null);
  };

  return (
    <div className="tiebreaker">
      <h3>⚖️ Tie-Breaker</h3>
      <p className="tb-hint">Select the tied players, then roll the random tie-breaker.</p>
      <div className="tb-player-list">
        {players.map((p) => (
          <label key={p.id} className={`tb-player ${tieIds.includes(p.id) ? 'selected' : ''}`}>
            <input
              type="checkbox"
              checked={tieIds.includes(p.id)}
              onChange={() => toggle(p.id)}
            />
            {p.name}
          </label>
        ))}
      </div>
      <button
        className="btn btn-yellow"
        onClick={runTieBreaker}
        disabled={tieIds.length < 2}
      >
        🎲 Random Pick
      </button>
      {result && (
        <div className="tb-result">
          <p>
            ➡️ <strong>{players.find((p) => p.id === result)?.name}</strong> is
            selected for elimination.
          </p>
          <button className="btn btn-danger" onClick={confirmElim}>
            ☠️ Confirm Elimination
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => { setResult(null); setTieIds([]); }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
