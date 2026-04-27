import { useState } from 'react';
import type { useI18n } from '../../i18n';
import '../../styles/tiebreaker.css';

type Strings = ReturnType<typeof useI18n>['t'];
type SimplePlayer = { id: string; name: string };

type Props = {
  tiedPlayerIds: string[];
  players: SimplePlayer[];
  t: Strings;
  onEliminate: (id: string) => void;
  onLog: (message: string) => void;
  onClose?: () => void;
};

function pickRandomId(ids: string[]) {
  if (ids.length < 2) return null;
  return ids[Math.floor(Math.random() * ids.length)] ?? null;
}

export default function TieBreaker({
  tiedPlayerIds,
  players,
  t,
  onEliminate,
  onLog,
  onClose,
}: Props) {
  const tiedPlayers = tiedPlayerIds
    .map((id) => players.find((p) => p.id === id))
    .filter((player): player is SimplePlayer => Boolean(player));
  const [result] = useState<string | null>(() => pickRandomId(tiedPlayerIds));

  const selectedPlayer = tiedPlayers.find((p) => p.id === result) ?? null;

  if (tiedPlayers.length < 2 || !selectedPlayer) {
    return null;
  }

  const confirmElim = () => {
    onEliminate(selectedPlayer.id);
    onLog(t.logs.tieBreaker(selectedPlayer.name));
    onClose?.();
  };

  return (
    <div className="tiebreaker" data-testid="tie-breaker-panel">
      <h3>{t.tieBreaker.title}</h3>
      <p className="tb-hint">{t.tieBreaker.hint}</p>
      <div className="tb-player-list">
        {tiedPlayers.map((p) => (
          <div key={p.id} className="tb-player selected readonly" data-testid={`tie-breaker-player-${p.id}`}>
            {p.name}
          </div>
        ))}
      </div>
      <div className="tb-result" data-testid="tie-breaker-result">
        <p>{t.tieBreaker.selected(selectedPlayer.name)}</p>
        <button className="btn btn-danger" onClick={confirmElim}>
          {t.tieBreaker.confirm}
        </button>
        <button className="btn btn-ghost" onClick={() => onClose?.()}>
          {t.tieBreaker.cancel}
        </button>
      </div>
    </div>
  );
}
