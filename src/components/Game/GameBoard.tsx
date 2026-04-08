import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { WOLF_ROLE_IDS, LONER_ROLE_IDS } from '../../data/roles';
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
  const wolfDogChoice = useGameStore((s) => s.wolfDogChoice);
  const wildChildTransformed = useGameStore((s) => s.wildChildTransformed);
  const infectedPlayerIds = useGameStore((s) => s.infectedPlayerIds);
  const enchantedPlayerIds = useGameStore((s) => s.enchantedPlayerIds);
  const angelWon = useGameStore((s) => s.angelWon);

  const [tab, setTab] = useState<Tab>('game');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const alivePlayers = players.filter((p) => p.isAlive);

  /** Returns true if this player is wolf-aligned (including transforms) */
  const isWolfAligned = (p: typeof players[0]) =>
    WOLF_ROLE_IDS.includes(p.roleId) ||
    (p.roleId === 'wolf_dog' && wolfDogChoice === 'werewolf') ||
    (p.roleId === 'wild_child' && wildChildTransformed) ||
    infectedPlayerIds.includes(p.id);

  const wolfCount = alivePlayers.filter(isWolfAligned).length;

  // Loners are not counted as village (they have independent win conditions)
  const villageCount = alivePlayers.filter(
    (p) => !isWolfAligned(p) && !LONER_ROLE_IDS.includes(p.roleId)
  ).length;

  // Pied Piper wins when ALL other alive players are enchanted
  const piedPiperAlive = alivePlayers.find((p) => p.roleId === 'pied_piper');
  const piedPiperWins =
    !!piedPiperAlive &&
    alivePlayers.every((p) => p.roleId === 'pied_piper' || enchantedPlayerIds.includes(p.id));

  // White Werewolf wins as sole survivor
  const whiteWolfWins =
    alivePlayers.length === 1 && alivePlayers[0]?.roleId === 'white_werewolf';

  // Standard win conditions
  const villageWins = wolfCount === 0 && !piedPiperWins && !whiteWolfWins && !angelWon;
  const wolvesWin = wolfCount > 0 && wolfCount >= villageCount && !piedPiperWins && !whiteWolfWins && !angelWon;

  const gameOver = villageWins || wolvesWin || piedPiperWins || whiteWolfWins || angelWon;

  let winner: 'village' | 'werewolves' | 'pied_piper' | 'white_werewolf' | 'angel' = 'village';
  if (wolvesWin) winner = 'werewolves';
  else if (piedPiperWins) winner = 'pied_piper';
  else if (whiteWolfWins) winner = 'white_werewolf';
  else if (angelWon) winner = 'angel';

  const openTab = (nextTab: Tab) => {
    setTab(nextTab);
    setIsConfigOpen(false);
  };

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
          {winner === 'village' && (
            <>
              <div className="win-emoji">🎉</div>
              <h2>Village Wins!</h2>
              <p>All werewolves have been eliminated.</p>
            </>
          )}
          {winner === 'werewolves' && (
            <>
              <div className="win-emoji">🐺</div>
              <h2>Werewolves Win!</h2>
              <p>The wolves now control the village.</p>
            </>
          )}
          {winner === 'pied_piper' && (
            <>
              <div className="win-emoji">🎶</div>
              <h2>Pied Piper Wins!</h2>
              <p>All players have been enchanted by the Joueur de Flûte!</p>
            </>
          )}
          {winner === 'white_werewolf' && (
            <>
              <div className="win-emoji">⬛</div>
              <h2>White Werewolf Wins!</h2>
              <p>The Loup-Garou Blanc is the last survivor!</p>
            </>
          )}
          {winner === 'angel' && (
            <>
              <div className="win-emoji">👼</div>
              <h2>Angel Wins!</h2>
              <p>The Angel was the first to be executed on Day 1!</p>
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
              onClick={() => openTab('game')}
              data-testid="gameboard-tab-game"
            >
              🎮 Game
            </button>
            <div className="tabs-desktop">
              <button
                className={`tab-btn ${tab === 'roles' ? 'active' : ''}`}
                onClick={() => openTab('roles')}
                data-testid="gameboard-tab-roles"
              >
                📚 Roles
              </button>
              <button
                className={`tab-btn ${tab === 'log' ? 'active' : ''}`}
                onClick={() => openTab('log')}
                data-testid="gameboard-tab-log"
              >
                📜 Log
              </button>
            </div>
            <div className="tabs-mobile-config">
              <button
                className={`tab-btn conf-tab-btn ${tab !== 'game' || isConfigOpen ? 'active' : ''}`}
                onClick={() => setIsConfigOpen((open) => !open)}
                aria-expanded={isConfigOpen}
                aria-haspopup="menu"
                data-testid="gameboard-tab-conf"
              >
                ⚙️ Conf
              </button>
              {isConfigOpen && (
                <div className="conf-menu" role="menu" data-testid="gameboard-conf-menu">
                  <button
                    className={`conf-menu-item ${tab === 'roles' ? 'active' : ''}`}
                    onClick={() => openTab('roles')}
                    role="menuitem"
                    data-testid="gameboard-conf-roles"
                  >
                    📚 Roles
                  </button>
                  <button
                    className={`conf-menu-item ${tab === 'log' ? 'active' : ''}`}
                    onClick={() => openTab('log')}
                    role="menuitem"
                    data-testid="gameboard-conf-log"
                  >
                    📜 Log
                  </button>
                </div>
              )}
            </div>
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
