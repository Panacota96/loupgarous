import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { WOLF_ROLE_IDS, INDEPENDENT_LONER_ROLE_IDS } from '../../data/roles';
import NightPhase from './NightPhase';
import DayPhase from './DayPhase';
import PowerStatusPanel from './PowerStatusPanel';
import RoleReference from '../Roles/RoleReference';
import LanguageToggle from '../LanguageToggle';
import { useI18n } from '../../i18n';
import '../../styles/gameboard.css';

type Tab = 'game' | 'roles' | 'log';
type Winner = 'village' | 'werewolves' | 'pied_piper' | 'white_werewolf' | 'angel';

const winnerEmoji: Record<Winner, string> = {
  village: '🎉',
  werewolves: '🐺',
  pied_piper: '🎶',
  white_werewolf: '⬛',
  angel: '👼',
};

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
  const { t } = useI18n();

  const [tab, setTab] = useState<Tab>('game');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [confirmedWinner, setConfirmedWinner] = useState<Winner | null>(null);
  const [dismissedSuggestionKey, setDismissedSuggestionKey] = useState<string | null>(null);

  const alivePlayers = players.filter((p) => p.isAlive);

  /** Returns true if this player is wolf-aligned (including transforms) */
  const isWolfAligned = (p: typeof players[0]) =>
    WOLF_ROLE_IDS.includes(p.roleId) ||
    (p.roleId === 'wolf_dog' && wolfDogChoice === 'werewolf') ||
    (p.roleId === 'wild_child' && wildChildTransformed) ||
    infectedPlayerIds.includes(p.id);

  const packWolfCount = alivePlayers.filter(isWolfAligned).length;
  const whiteWolfAlive = alivePlayers.some((p) => p.roleId === 'white_werewolf');

  // Village parity excludes pack wolves, White Werewolf, and truly independent loners.
  const villageCount = alivePlayers.filter(
    (p) => (
      !isWolfAligned(p) &&
      p.roleId !== 'white_werewolf' &&
      !INDEPENDENT_LONER_ROLE_IDS.includes(p.roleId)
    )
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
  const villageWins = packWolfCount === 0 && !whiteWolfAlive && !piedPiperWins && !whiteWolfWins && !angelWon;
  const wolvesWin =
    packWolfCount > 0 &&
    packWolfCount >= villageCount &&
    !whiteWolfAlive &&
    !piedPiperWins &&
    !whiteWolfWins &&
    !angelWon;

  let suggestedWinner: Winner | null = null;
  if (wolvesWin) suggestedWinner = 'werewolves';
  else if (piedPiperWins) suggestedWinner = 'pied_piper';
  else if (whiteWolfWins) suggestedWinner = 'white_werewolf';
  else if (angelWon) suggestedWinner = 'angel';
  else if (villageWins) suggestedWinner = 'village';

  const suggestionKey = suggestedWinner
    ? `${suggestedWinner}:${alivePlayers.map((p) => p.id).join(',')}`
    : null;
  const pendingWinner =
    suggestedWinner && !confirmedWinner && suggestionKey !== dismissedSuggestionKey
      ? suggestedWinner
      : null;
  const dismissedWinner =
    suggestedWinner && !confirmedWinner && suggestionKey === dismissedSuggestionKey
      ? suggestedWinner
      : null;
  const gameOver = confirmedWinner !== null;

  const openTab = (nextTab: Tab) => {
    setTab(nextTab);
    setIsConfigOpen(false);
  };

  const handleResetGame = () => {
    setConfirmedWinner(null);
    setDismissedSuggestionKey(null);
    resetGame();
  };

  return (
    <div className={`gameboard ${phase}`}>
      {/* Top bar */}
      <div className="gameboard-topbar">
        <div className="topbar-left">
          <span className="phase-chip">
            {t.game.phaseChip(phase, round)}
          </span>
          <span className="alive-chip">{t.game.alive(alivePlayers.length)}</span>
          <span className="wolf-chip">{t.game.wolves(packWolfCount)}</span>
        </div>
        <div className="topbar-right">
          {dismissedWinner && (
            <button
              className="btn btn-yellow btn-sm"
              onClick={() => setDismissedSuggestionKey(null)}
              data-testid="review-winner"
            >
              {t.game.reviewWin}
            </button>
          )}
          <LanguageToggle compact />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (window.confirm(t.game.resetConfirm)) handleResetGame();
            }}
          >
            {t.game.reset}
          </button>
        </div>
      </div>

      {/* Winner suggestion */}
      {pendingWinner && (
        <div className={`win-suggestion-screen win-${pendingWinner}`}>
          <div className="win-emoji">{winnerEmoji[pendingWinner]}</div>
          <h2>{t.game.wins[pendingWinner].suggestion}</h2>
          <p>{t.game.confirmWinBody}</p>
          <div className="win-actions">
            <button
              className="btn btn-primary"
              onClick={() => setConfirmedWinner(pendingWinner)}
              data-testid="confirm-winner"
            >
              {t.game.confirmWin}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                if (suggestionKey) setDismissedSuggestionKey(suggestionKey);
              }}
              data-testid="keep-playing"
            >
              {t.game.keepPlaying}
            </button>
          </div>
        </div>
      )}

      {/* Win screen */}
      {gameOver && (
        <div className={`win-screen win-${confirmedWinner}`}>
          <div className="win-emoji">{winnerEmoji[confirmedWinner]}</div>
          <h2>{t.game.wins[confirmedWinner].title}</h2>
          <p>{t.game.wins[confirmedWinner].body}</p>
          <button className="btn btn-primary" onClick={handleResetGame}>
            {t.game.newGame}
          </button>
        </div>
      )}

      {/* Tabs */}
      {!pendingWinner && !gameOver && (
        <>
          <div className="tabs">
            <button
              className={`tab-btn ${tab === 'game' ? 'active' : ''}`}
              onClick={() => openTab('game')}
              data-testid="gameboard-tab-game"
            >
              {t.game.tabs.game}
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
              <>
                <PowerStatusPanel />
                {phase === 'night' ? <NightPhase /> : <DayPhase />}
              </>
            )}
            {tab === 'roles' && <RoleReference />}
            {tab === 'log' && (
              <div className="game-log">
                <h3>{t.game.log.title}</h3>
                {log.length === 0 && <p className="log-empty">{t.game.log.empty}</p>}
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
