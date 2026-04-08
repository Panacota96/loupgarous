import { useState } from 'react';
import type { useI18n } from '../../i18n';
import '../../styles/tiebreaker.css';

type Strings = ReturnType<typeof useI18n>['t'];
type SimplePlayer = { id: string; name: string };

type Props = {
  players: SimplePlayer[];
  t: Strings;
  onEliminate: (id: string) => void;
  onLog: (message: string) => void;
  onClose?: () => void;
};

export default function TieBreaker({ players, t, onEliminate, onLog, onClose }: Props) {

  const tiedPlayers = useMemo(
    () =>
      tiedPlayerIds
        .map((id) => alivePlayers.find((p) => p.id === id))
        .filter((player): player is (typeof alivePlayers)[number] => Boolean(player)),
    [alivePlayers, tiedPlayerIds]
  );

  const selectedPlayer = alivePlayers.find((p) => p.id === result) ?? null;

  const runTieBreaker = () => {
    if (tieIds.length < 2) return;
    const pick = tieIds[Math.floor(Math.random() * tieIds.length)];
    const name = players.find((p) => p.id === pick)?.name ?? pick;
    setResult(pick);
    onLog(t.logs.tieBreaker(name));
  };

  const confirmElim = () => {
    if (!result) return;
    onEliminate(result);
    setTieIds([]);
    setResult(null);
    onClose?.();
  };

  return (
    <div className="tiebreaker">
      <h3>{t.tieBreaker.title}</h3>
      <p className="tb-hint">{t.tieBreaker.hint}</p>
      <div className="tb-player-list">
        {tiedPlayers.map((p) => (
          <div key={p.id} className="tb-player selected readonly">
            {p.name}
          </div>
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
            onClick={() => {
              setResult(null);
              setTieIds([]);
              onClose?.();
            }}
          >
            {t.tieBreaker.cancel}
          </button>
        </div>
      )}
    </div>
  );
}
