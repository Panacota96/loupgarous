import { useMemo, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import '../../styles/tiebreaker.css';

interface Props {
  tiedPlayerIds: string[];
  onClose: () => void;
}

function pickRandomId(ids: string[]) {
  if (ids.length < 2) return null;
  return ids[Math.floor(Math.random() * ids.length)] ?? null;
}

export default function TieBreaker({ tiedPlayerIds, onClose }: Props) {
  const players = useGameStore((s) => s.players);
  const eliminatePlayer = useGameStore((s) => s.eliminatePlayer);
  const clearVotes = useGameStore((s) => s.clearVotes);
  const addLog = useGameStore((s) => s.addLog);
  const [result] = useState<string | null>(() => pickRandomId(tiedPlayerIds));
  const alivePlayers = useMemo(() => players.filter((p) => p.isAlive), [players]);

  const tiedPlayers = useMemo(
    () =>
      tiedPlayerIds
        .map((id) => alivePlayers.find((p) => p.id === id))
        .filter((player): player is (typeof alivePlayers)[number] => Boolean(player)),
    [alivePlayers, tiedPlayerIds]
  );

  const selectedPlayer = alivePlayers.find((p) => p.id === result) ?? null;

  if (tiedPlayers.length < 2 || !selectedPlayer) {
    return null;
  }

  const confirmElim = () => {
    eliminatePlayer(selectedPlayer.id);
    clearVotes();
    addLog(`Tie-breaker: ${selectedPlayer.name} was randomly selected for elimination.`);
    onClose();
  };

  return (
    <div className="tiebreaker" data-testid="tie-breaker-panel">
      <h3>⚖️ Tie-Breaker</h3>
      <p className="tb-hint">
        The tied players were detected automatically. One of them was selected at random.
      </p>
      <div className="tb-player-list">
        {tiedPlayers.map((p) => (
          <div key={p.id} className="tb-player selected readonly">
            {p.name}
          </div>
        ))}
      </div>
      <div className="tb-result" data-testid="tie-breaker-result">
        <p>
          ➡️ <strong>{selectedPlayer.name}</strong> is selected for elimination.
        </p>
        <button className="btn btn-danger" onClick={confirmElim}>
          ☠️ Confirm Elimination
        </button>
        <button className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
