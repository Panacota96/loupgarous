import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useI18n } from '../../i18n';
import '../../styles/tiebreaker.css';

export default function TieBreaker() {
  const { t } = useI18n();
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
    addLog(t.logs.tieBreaker(name));
  };

  const confirmElim = () => {
    if (!result) return;
    eliminatePlayer(result);
    setTieIds([]);
    setResult(null);
  };

  return (
    <div className="tiebreaker">
      <h3>{t.tieBreaker.title}</h3>
      <p className="tb-hint">{t.tieBreaker.hint}</p>
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
        {t.tieBreaker.randomPick}
      </button>
      {result && (
        <div className="tb-result">
          <p>
            {t.tieBreaker.selected(players.find((p) => p.id === result)?.name ?? '')}
          </p>
          <button className="btn btn-danger" onClick={confirmElim}>
            {t.tieBreaker.confirm}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => { setResult(null); setTieIds([]); }}
          >
            {t.tieBreaker.cancel}
          </button>
        </div>
      )}
    </div>
  );
}
