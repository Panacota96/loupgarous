import { useState } from 'react';
import type { Language } from '../../types/game.types';
import type { useI18n } from '../../i18n';
import type { Player } from '../../types/game.types';
import { getPlayerRoleLabelById } from '../../utils/playerLabels';
import '../../styles/tiebreaker.css';

type Strings = ReturnType<typeof useI18n>['t'];
type SimplePlayer = { id: string };

type Props = {
  tiedPlayerIds: string[];
  players: SimplePlayer[];
  allPlayers: Player[];
  language: Language;
  t: Strings;
  onEliminate: (id: string) => void;
  onLog: (message: string) => void;
  onClose?: () => void;
};

export default function TieBreaker({
  tiedPlayerIds,
  players,
  allPlayers,
  language,
  t,
  onEliminate,
  onLog,
  onClose,
}: Props) {
  const tiedPlayers = tiedPlayerIds
    .map((id) => players.find((p) => p.id === id))
    .filter((player): player is SimplePlayer => Boolean(player));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedPlayer = tiedPlayers.find((p) => p.id === selectedId) ?? null;

  if (tiedPlayers.length < 2) {
    return null;
  }

  const confirmElim = () => {
    if (!selectedPlayer) return;
    onEliminate(selectedPlayer.id);
    onLog(t.logs.tieBreaker(getPlayerRoleLabelById(selectedPlayer.id, allPlayers, language)));
    onClose?.();
  };

  return (
    <div className="tiebreaker" data-testid="tie-breaker-panel">
      <h3>{t.tieBreaker.title}</h3>
      <p className="tb-hint">{t.tieBreaker.hint}</p>
      <div className="tb-player-list">
        {tiedPlayers.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`tb-player ${selectedId === p.id ? 'selected' : ''}`}
            aria-pressed={selectedId === p.id}
            data-testid={`tie-breaker-player-${p.id}`}
            onClick={() => setSelectedId(p.id)}
          >
            {getPlayerRoleLabelById(p.id, allPlayers, language)}
          </button>
        ))}
      </div>
      <div className="tb-result" data-testid="tie-breaker-result">
        <p>
          {selectedPlayer
            ? t.tieBreaker.selected(getPlayerRoleLabelById(selectedPlayer.id, allPlayers, language))
            : t.tieBreaker.selectionRequired}
        </p>
        <button className="btn btn-danger" onClick={confirmElim} disabled={!selectedPlayer}>
          {t.tieBreaker.confirm}
        </button>
        <button className="btn btn-ghost" onClick={() => onClose?.()}>
          {t.tieBreaker.cancel}
        </button>
      </div>
    </div>
  );
}
