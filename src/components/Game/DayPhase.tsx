import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ROLE_MAP, getRoleTexts, getRoleName, isPlayerWolfIdentity } from '../../data/roles';
import { useI18n } from '../../i18n';
import PlayerCard from './PlayerCard';
import Timer from './Timer';
import TieBreaker from './TieBreaker';
import '../../styles/day.css';

export default function DayPhase() {
  const { language, t } = useI18n();
  const players = useGameStore((s) => s.players);
  const alivePlayers = players.filter((p) => p.isAlive);
  const round = useGameStore((s) => s.round);
  const infectedPlayerIds = useGameStore((s) => s.infectedPlayerIds);
  const enchantedPlayerIds = useGameStore((s) => s.enchantedPlayerIds);
  const wildChildTransformed = useGameStore((s) => s.wildChildTransformed);
  const wolfDogChoice = useGameStore((s) => s.wolfDogChoice);
  const ravenCursedId = useGameStore((s) => s.ravenCursedId);
  const foxPowerActive = useGameStore((s) => s.foxPowerActive);
  const usedGameAbilities = useGameStore((s) => s.usedGameAbilities);

  const eliminatePlayer = useGameStore((s) => s.eliminatePlayer);
  const addLog = useGameStore((s) => s.addLog);
  const togglePhase = useGameStore((s) => s.togglePhase);

  const [revealAll, setRevealAll] = useState(false);
  const [isTieFlowOpen, setIsTieFlowOpen] = useState(false);
  const [selectedTieIds, setSelectedTieIds] = useState<string[]>([]);
  const [showTieBreaker, setShowTieBreaker] = useState(false);
  const [showScapegoatConfirm, setShowScapegoatConfirm] = useState(false);
  const [showTieValidation, setShowTieValidation] = useState(false);

  // Bear Tamer morning signal: use full player list (stable seating order)
  // and scan for the nearest alive neighbor on each side.
  const bearTamer = players.find((p) => p.isAlive && p.roleId === 'bear_tamer');
  const bearGrowls = (() => {
    if (!bearTamer || players.length < 2) return false;
    const total = players.length;
    const idx = players.findIndex((p) => p.id === bearTamer.id);
    if (idx === -1) return false;

    const isWolfSide = (p: typeof players[0] | undefined) =>
      !!p &&
      isPlayerWolfIdentity(p, {
        infectedPlayerIds,
        wolfDogChoice,
        wildChildTransformed,
      });

    let leftNeighbor: typeof players[0] | undefined;
    for (let offset = 1; offset < total; offset++) {
      const candidate = players[(idx - offset + total) % total];
      if (candidate.isAlive) {
        leftNeighbor = candidate;
        break;
      }
    }

    let rightNeighbor: typeof players[0] | undefined;
    for (let offset = 1; offset < total; offset++) {
      const candidate = players[(idx + offset) % total];
      if (candidate.isAlive) {
        rightNeighbor = candidate;
        break;
      }
    }

    return isWolfSide(leftNeighbor) || isWolfSide(rightNeighbor);
  })();

  const mayorAlive = players.find((p) => p.isAlive && p.isMayor) ?? null;
  const scapegoatPlayer = alivePlayers.find((p) => p.roleId === 'scapegoat') ?? null;
  const ravenCursedName = ravenCursedId
    ? players.find((p) => p.id === ravenCursedId)?.name ?? null
    : null;
  const foxInGame = players.some((p) => p.roleId === 'fox');
  const witchInGame = players.some((p) => p.roleId === 'witch' && p.isAlive);
  const witchHealUsed = usedGameAbilities.includes('witch_heal');
  const witchPoisonUsed = usedGameAbilities.includes('witch_poison');
  const witchPotionsSpent = witchHealUsed && witchPoisonUsed;

  const activeTieIds = selectedTieIds.filter((id) => alivePlayers.some((p) => p.id === id));
  const selectedTiePlayers = activeTieIds
    .map((id) => alivePlayers.find((p) => p.id === id))
    .filter((player): player is (typeof alivePlayers)[number] => Boolean(player));
  const selectedTieNames = selectedTiePlayers.map((p) => p.name).join(' & ');

  const resetTieFlow = () => {
    setIsTieFlowOpen(false);
    setSelectedTieIds([]);
    setShowTieBreaker(false);
    setShowScapegoatConfirm(false);
    setShowTieValidation(false);
  };

  const startTieFlow = () => {
    setIsTieFlowOpen(true);
    setShowTieBreaker(false);
    setShowScapegoatConfirm(false);
    setShowTieValidation(false);
  };

  const toggleTiePlayer = (playerId: string) => {
    setShowTieValidation(false);
    setShowTieBreaker(false);
    setShowScapegoatConfirm(false);
    setSelectedTieIds((ids) =>
      ids.includes(playerId) ? ids.filter((id) => id !== playerId) : [...ids, playerId]
    );
  };

  const resolveTie = () => {
    if (selectedTiePlayers.length < 2) {
      setShowTieValidation(true);
      return;
    }

    if (scapegoatPlayer) {
      setShowScapegoatConfirm(true);
      setShowTieBreaker(false);
      return;
    }

    setShowTieValidation(false);
    setShowScapegoatConfirm(false);
    setShowTieBreaker(true);
  };

  const confirmScapegoatTie = () => {
    if (!scapegoatPlayer) return;
    eliminatePlayer(scapegoatPlayer.id);
    addLog(t.logs.scapegoatTie(scapegoatPlayer.name));
    resetTieFlow();
  };

  // Day triggers to remind DM.
  const dayTriggers = alivePlayers
    .map((p) => ROLE_MAP[p.roleId])
    .filter((r) => r?.dayTrigger);

  return (
    <div className="day-phase" data-testid="day-phase">
      <div className="day-header">
        <span className="phase-icon">☀️</span>
        <div>
          <h2>{t.day.title(round)}</h2>
          <p className="day-subtitle">{t.day.subtitle}</p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          data-testid="dm-view-toggle"
          onClick={() => setRevealAll((r) => !r)}
        >
          {revealAll ? t.day.dmView.hide : t.day.dmView.show}
        </button>
      </div>

      {bearTamer && (
        <div className={`bear-signal ${bearGrowls ? 'growl' : 'silent'}`}>
          <strong>{t.day.bearSignal(bearGrowls)}</strong>
        </div>
      )}

      {dayTriggers.length > 0 && (
        <div className="day-triggers">
          <h3>{t.day.dmReminders}</h3>
          {dayTriggers.map((r) =>
            (() => {
              const dayText = getRoleTexts(r!, language).dayTrigger;
              if (!dayText) return null;
              return (
                <div key={r!.id} className="day-trigger-item">
                  {r!.emoji} <strong>{getRoleName(r!, language)}:</strong> {dayText}
                </div>
              );
            })()
          )}
        </div>
      )}

      {foxInGame && (
        <div className="day-trigger-item">
          {foxPowerActive ? t.day.foxPowerActive : t.day.foxPowerLost}
        </div>
      )}

      {witchInGame && (
        <div className="day-trigger-item">
          {t.day.witchPotionsStatus(witchHealUsed, witchPoisonUsed)}
          {witchPotionsSpent && <span className="win-alert"> {t.day.witchPotionsSpent}</span>}
        </div>
      )}

      {alivePlayers.some((p) => p.roleId === 'pied_piper') &&
        (() => {
          const aliveEnchantedCount = enchantedPlayerIds.filter(
            (id) => players.find((p) => p.id === id && p.isAlive)
          ).length;
          const piperWins = aliveEnchantedCount >= alivePlayers.length - 1;
          return (
            <div className="day-trigger-item day-enchanted-bar">
              {t.day.piedPiperBar(aliveEnchantedCount, alivePlayers.length - 1)}
              {piperWins && <span className="win-alert"> {t.day.piedPiperWins}</span>}
            </div>
          );
        })()}

      {infectedPlayerIds.length > 0 && (
        <div className="day-trigger-item day-infected-bar">
          {t.day.infectedBar}{' '}
          {infectedPlayerIds
            .map((id) => players.find((p) => p.id === id))
            .filter(Boolean)
            .map((p) => p!.name)
            .join(', ')}
        </div>
      )}

      <Timer />

      <section className="day-players">
        <h3>{t.day.playersTitle(alivePlayers.length)}</h3>
        <div className="players-grid">
          {players.map((p) => (
            <PlayerCard key={p.id} playerId={p.id} showRole={revealAll} />
          ))}
        </div>
      </section>

      <section className="voting-section tie-resolution-section" data-testid="tie-resolution-panel">
        <div className="voting-header">
          <h3>{t.day.tieResolutionTitle}</h3>
          {isTieFlowOpen && (
            <button className="btn btn-ghost btn-sm" onClick={resetTieFlow}>
              {t.day.tieResolutionCancel}
            </button>
          )}
        </div>

        <p className="tb-hint">{t.day.tieResolutionHint}</p>

        {ravenCursedName && (
          <div className="raven-curse-bar">
            {t.day.ravenCurse(ravenCursedName)}
          </div>
        )}

        {mayorAlive && (
          <div className="mayor-vote-bar">{t.day.mayorReminder(mayorAlive.name)}</div>
        )}

        {!isTieFlowOpen ? (
          <button
            className="btn btn-yellow"
            data-testid="tie-resolution-start"
            disabled={alivePlayers.length < 2}
            onClick={startTieFlow}
          >
            {t.day.tieResolutionStart}
          </button>
        ) : (
          <>
            <p className="tie-resolution-copy">{t.day.tieResolutionSelectionHint}</p>
            <div className="tie-resolution-status">
              {t.day.tieResolutionSelectedCount(selectedTiePlayers.length)}
            </div>

            <div className="tb-player-list">
              {alivePlayers.map((player) => {
                const selected = activeTieIds.includes(player.id);
                return (
                  <button
                    key={player.id}
                    type="button"
                    className={`tb-player ${selected ? 'selected' : ''}`}
                    aria-pressed={selected}
                    onClick={() => toggleTiePlayer(player.id)}
                  >
                    {player.name}
                    {player.isMayor && ' 🎖️'}
                  </button>
                );
              })}
            </div>

            {showTieValidation && (
              <div className="tie-resolution-error" data-testid="tie-resolution-error">
                {t.day.tieResolutionNeedPlayers}
              </div>
            )}

            {!showTieBreaker && !showScapegoatConfirm && (
              <button
                className="btn btn-danger"
                data-testid="tie-resolution-resolve"
                onClick={resolveTie}
              >
                {t.day.tieResolutionResolve}
              </button>
            )}

            {showScapegoatConfirm && scapegoatPlayer && (
              <div className="tie-warning" data-testid="scapegoat-resolution">
                <span>{t.day.scapegoatResolution(scapegoatPlayer.name, selectedTieNames)}</span>
                <button className="btn btn-danger" onClick={confirmScapegoatTie}>
                  {t.day.confirmScapegoat(scapegoatPlayer.name)}
                </button>
              </div>
            )}

            {showTieBreaker && selectedTiePlayers.length > 1 && !scapegoatPlayer && (
              <TieBreaker
                tiedPlayerIds={activeTieIds}
                players={alivePlayers}
                t={t}
                onLog={addLog}
                onEliminate={(id) => {
                  eliminatePlayer(id);
                  resetTieFlow();
                }}
                onClose={() => setShowTieBreaker(false)}
              />
            )}
          </>
        )}
      </section>

      <section className="day-footer">
        <button className="btn btn-primary btn-large night-btn" onClick={togglePhase}>
          {t.day.nightButton}
        </button>
      </section>
    </div>
  );
}
