import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import NightPhase from './NightPhase';
import DayPhase from './DayPhase';
import RoleReference from '../Roles/RoleReference';
import '../../styles/gameboard.css';

type Tab = 'game' | 'roles' | 'log';

export default function GameBoard() {
  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const log = useGameStore((s) => s.log);
  const resetGame = useGameStore((s) => s.resetGame);
  const round = useGameStore((s) => s.round);

  const [tab, setTab] = useState<Tab>('game');

  const alivePlayers = players.filter((p) => p.isAlive);
  const wolfCount = alivePlayers.filter((p) => p.roleId === 'werewolf').length;
  const villageCount = alivePlayers.filter((p) => p.roleId !== 'werewolf').length;

  // Simple win check
  const gameOver = wolfCount === 0 || wolfCount >= villageCount;
  const winner = wolfCount === 0 ? 'village' : 'werewolves';

  return (
    <div className={`gameboard ${phase}`}>
      {/* Top bar */}
      <div className="gameboard-topbar">
        <div className="topbar-left">
          <span className="phase-chip">
            {phase === 'night' ? '🌙 Night' : '☀️ Day'} — Round {round}
          </span>
          <span className="alive-chip">🫀 {alivePlayers.length} alive</span>
          <span className="wolf-chip">🐺 {wolfCount} wolves</span>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            if (window.confirm('Reset game and return to setup?')) resetGame();
          }}
        >
          🏠 Setup
        </button>
      </div>

      {/* Win screen */}
      {gameOver && (
        <div className={`win-screen win-${winner}`}>
          {winner === 'village' ? (
            <>
              <div className="win-emoji">🎉</div>
              <h2>Village Wins!</h2>
              <p>All werewolves have been eliminated.</p>
            </>
          ) : (
            <>
              <div className="win-emoji">🐺</div>
              <h2>Werewolves Win!</h2>
              <p>The wolves now control the village.</p>
            </>
          )}
          <button className="btn btn-primary" onClick={resetGame}>
            🔄 New Game
          </button>
        </div>
      )}

      {/* Tabs */}
      {!gameOver && (
        <>
          <div className="tabs">
            <button
              className={`tab-btn ${tab === 'game' ? 'active' : ''}`}
              onClick={() => setTab('game')}
            >
              🎮 Game
            </button>
            <button
              className={`tab-btn ${tab === 'roles' ? 'active' : ''}`}
              onClick={() => setTab('roles')}
            >
              📚 Roles
            </button>
            <button
              className={`tab-btn ${tab === 'log' ? 'active' : ''}`}
              onClick={() => setTab('log')}
            >
              📜 Log
            </button>
          </div>

          <div className="tab-content">
            {tab === 'game' && (
              phase === 'night' ? <NightPhase /> : <DayPhase />
            )}
            {tab === 'roles' && <RoleReference />}
            {tab === 'log' && (
              <div className="game-log">
                <h3>📜 Game Log</h3>
                {log.length === 0 && <p className="log-empty">No events yet.</p>}
                {[...log].reverse().map((entry, i) => (
                  <div key={i} className="log-entry">
                    {entry}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
