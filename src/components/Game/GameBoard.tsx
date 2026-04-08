import { useMemo, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { WOLF_ROLE_IDS, INDEPENDENT_LONER_ROLE_IDS } from '../../data/roles';
import NightPhase from './NightPhase';
import DayPhase from './DayPhase';
import RoleReference from '../Roles/RoleReference';
import LanguageToggle from '../LanguageToggle';
import { useI18n } from '../../i18n';
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
  const uiMode = useGameStore((s) => s.uiMode);
  const setUiMode = useGameStore((s) => s.setUiMode);
  const privacyMode = useGameStore((s) => s.privacyMode);
  const togglePrivacyMode = useGameStore((s) => s.togglePrivacyMode);
  const undoLastAction = useGameStore((s) => s.undoLastAction);
  const resolutionQueue = useGameStore((s) => s.resolutionQueue);
  const saveNamedSession = useGameStore((s) => s.saveNamedSession);
  const { t } = useI18n();

  const [tab, setTab] = useState<Tab>('game');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const alivePlayers = players.filter((player) => player.isAlive);

  const isWolfAligned = (player: typeof players[0]) =>
    WOLF_ROLE_IDS.includes(player.roleId) ||
    (player.roleId === 'wolf_dog' && wolfDogChoice === 'werewolf') ||
    (player.roleId === 'wild_child' && wildChildTransformed) ||
    infectedPlayerIds.includes(player.id);

  const packWolfCount = alivePlayers.filter(isWolfAligned).length;
  const whiteWolfAlive = alivePlayers.some((player) => player.roleId === 'white_werewolf');
  const villageCount = alivePlayers.filter(
    (player) =>
      !isWolfAligned(player) &&
      player.roleId !== 'white_werewolf' &&
      !INDEPENDENT_LONER_ROLE_IDS.includes(player.roleId)
  ).length;

  const piedPiperAlive = alivePlayers.find((player) => player.roleId === 'pied_piper');
  const piedPiperWins =
    !!piedPiperAlive &&
    alivePlayers.every((player) => player.roleId === 'pied_piper' || enchantedPlayerIds.includes(player.id));
  const whiteWolfWins = alivePlayers.length === 1 && alivePlayers[0]?.roleId === 'white_werewolf';
  const villageWins = packWolfCount === 0 && !whiteWolfAlive && !piedPiperWins && !whiteWolfWins && !angelWon;
  const wolvesWin =
    packWolfCount > 0 &&
    packWolfCount >= villageCount &&
    !piedPiperWins &&
    !whiteWolfWins &&
    !angelWon;
  const gameOver = villageWins || wolvesWin || piedPiperWins || whiteWolfWins || angelWon;

  const winner = useMemo(() => {
    if (wolvesWin) return 'werewolves';
    if (piedPiperWins) return 'pied_piper';
    if (whiteWolfWins) return 'white_werewolf';
    if (angelWon) return 'angel';
    return 'village';
  }, [angelWon, piedPiperWins, villageWins, whiteWolfWins, wolvesWin]);

  const endReason = useMemo(() => {
    if (winner === 'village') return t.game.endReasons.village;
    if (winner === 'werewolves') return t.game.endReasons.werewolves(packWolfCount, villageCount);
    if (winner === 'pied_piper') return t.game.endReasons.piedPiper;
    if (winner === 'white_werewolf') return t.game.endReasons.whiteWerewolf;
    return t.game.endReasons.angel;
  }, [packWolfCount, t, villageCount, winner]);

  const openTab = (nextTab: Tab) => {
    setTab(nextTab);
    setUiMode(nextTab === 'game' ? 'run' : 'reference');
    setIsConfigOpen(false);
  };

  const exportRecap = () => {
    const lines = [
      `${t.appTitle} - ${t.game.recapTitle}`,
      `${t.game.phaseChip(phase, round)}`,
      '',
      ...players.map((player) => `${player.name}: ${player.roleId} - ${player.isAlive ? 'alive' : 'dead'}`),
      '',
      ...log,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `loupgarous-recap-round-${round}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`gameboard ${phase} ${privacyMode ? 'privacy-on' : ''}`}>
      <div className="gameboard-topbar">
        <div className="topbar-left">
          <span className="phase-chip">{t.game.phaseChip(phase, round)}</span>
          <span className="alive-chip">{t.game.alive(alivePlayers.length)}</span>
          <span className="wolf-chip">{t.game.wolves(packWolfCount)}</span>
          <span className="queue-chip">{t.game.unresolved(resolutionQueue.length)}</span>
        </div>
        <div className="topbar-right">
          <LanguageToggle compact />
          <button className="btn btn-ghost btn-sm" onClick={undoLastAction}>
            {t.game.undo}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            data-testid="save-live-session"
            onClick={() => {
              const name = window.prompt(
                t.setup.sessionNamePlaceholder,
                t.setup.defaultSessionName(players.length)
              );
              if (name) saveNamedSession(name);
            }}
          >
            {t.setup.saveSession}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={togglePrivacyMode} data-testid="privacy-toggle">
            {privacyMode ? t.game.privacyOff : t.game.privacyOn}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (window.confirm(t.game.resetConfirm)) resetGame();
            }}
          >
            {t.game.reset}
          </button>
        </div>
      </div>

      {gameOver && (
        <div className={`win-screen win-${winner}`}>
          {winner === 'village' && (
            <>
              <div className="win-emoji">🎉</div>
              <h2>{t.game.wins.village.title}</h2>
              <p>{t.game.wins.village.body}</p>
            </>
          )}
          {winner === 'werewolves' && (
            <>
              <div className="win-emoji">🐺</div>
              <h2>{t.game.wins.werewolves.title}</h2>
              <p>{t.game.wins.werewolves.body}</p>
            </>
          )}
          {winner === 'pied_piper' && (
            <>
              <div className="win-emoji">🎶</div>
              <h2>{t.game.wins.pied_piper.title}</h2>
              <p>{t.game.wins.pied_piper.body}</p>
            </>
          )}
          {winner === 'white_werewolf' && (
            <>
              <div className="win-emoji">⬛</div>
              <h2>{t.game.wins.white_werewolf.title}</h2>
              <p>{t.game.wins.white_werewolf.body}</p>
            </>
          )}
          {winner === 'angel' && (
            <>
              <div className="win-emoji">👼</div>
              <h2>{t.game.wins.angel.title}</h2>
              <p>{t.game.wins.angel.body}</p>
            </>
          )}
          <div className="win-explainer">
            <strong>{t.game.endReason}</strong>
            <p>{endReason}</p>
          </div>
          <div className="win-actions">
            <button className="btn btn-ghost" onClick={exportRecap}>
              {t.game.exportRecap}
            </button>
            <button className="btn btn-primary" onClick={resetGame}>
              {t.game.newGame}
            </button>
          </div>
        </div>
      )}

      {!gameOver && (
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
                {t.game.tabs.roles}
              </button>
              <button
                className={`tab-btn ${tab === 'log' ? 'active' : ''}`}
                onClick={() => openTab('log')}
                data-testid="gameboard-tab-log"
              >
                {t.game.tabs.log}
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
                    {t.game.tabs.roles}
                  </button>
                  <button
                    className={`conf-menu-item ${tab === 'log' ? 'active' : ''}`}
                    onClick={() => openTab('log')}
                    role="menuitem"
                    data-testid="gameboard-conf-log"
                  >
                    {t.game.tabs.log}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={`tab-content ${uiMode === 'reference' ? 'tab-content--reference' : ''}`}>
            {privacyMode && tab === 'game' && (
              <div className="privacy-overlay">
                <strong>{t.game.privacyTitle}</strong>
                <p>{t.game.privacyBody}</p>
              </div>
            )}

            {tab === 'game' && (phase === 'night' ? <NightPhase /> : <DayPhase />)}
            {tab === 'roles' && <RoleReference />}
            {tab === 'log' && (
              <div className="game-log">
                <div className="game-log-header">
                  <h3>{t.game.log.title}</h3>
                  <button className="btn btn-ghost btn-sm" onClick={exportRecap}>
                    {t.game.exportRecap}
                  </button>
                </div>
                {log.length === 0 && <p className="log-empty">{t.game.log.empty}</p>}
                {[...log].reverse().map((entry, index) => (
                  <div key={`${entry}-${index}`} className="log-entry">
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
