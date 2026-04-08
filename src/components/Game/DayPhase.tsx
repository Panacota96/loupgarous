import { useMemo, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ROLE_MAP, getRoleTexts, getRoleName, isPlayerWolfIdentity } from '../../data/roles';
import { useI18n } from '../../i18n';
import ActionSurface from '../Shared/ActionSurface';
import PlayerCard from './PlayerCard';
import Timer from './Timer';
import TieBreaker from './TieBreaker';
import '../../styles/day.css';

export default function DayPhase() {
  const { language, t } = useI18n();
  const players = useGameStore((s) => s.players);
  const seatOrder = useGameStore((s) => s.seatOrder);
  const round = useGameStore((s) => s.round);
  const infectedPlayerIds = useGameStore((s) => s.infectedPlayerIds);
  const enchantedPlayerIds = useGameStore((s) => s.enchantedPlayerIds);
  const wildChildTransformed = useGameStore((s) => s.wildChildTransformed);
  const wolfDogChoice = useGameStore((s) => s.wolfDogChoice);
  const ravenCursedId = useGameStore((s) => s.ravenCursedId);
  const foxPowerActive = useGameStore((s) => s.foxPowerActive);
  const usedGameAbilities = useGameStore((s) => s.usedGameAbilities);
  const voteAssist = useGameStore((s) => s.voteAssist);
  const resolutionQueue = useGameStore((s) => s.resolutionQueue);

  const eliminatePlayer = useGameStore((s) => s.eliminatePlayer);
  const addLog = useGameStore((s) => s.addLog);
  const togglePhase = useGameStore((s) => s.togglePhase);
  const setVoteAssistActive = useGameStore((s) => s.setVoteAssistActive);
  const adjustVote = useGameStore((s) => s.adjustVote);
  const toggleNoVote = useGameStore((s) => s.toggleNoVote);
  const resetVoteAssist = useGameStore((s) => s.resetVoteAssist);

  const [revealAll, setRevealAll] = useState(false);
  const [isTieFlowOpen, setIsTieFlowOpen] = useState(false);
  const [selectedTieIds, setSelectedTieIds] = useState<string[]>([]);
  const [showTieBreaker, setShowTieBreaker] = useState(false);
  const [showScapegoatConfirm, setShowScapegoatConfirm] = useState(false);
  const [showTieValidation, setShowTieValidation] = useState(false);

  const orderedPlayers = useMemo(
    () =>
      seatOrder
        .map((id) => players.find((player) => player.id === id))
        .filter((player): player is (typeof players)[number] => Boolean(player)),
    [players, seatOrder]
  );
  const alivePlayers = orderedPlayers.filter((player) => player.isAlive);

  const packWolfCount = alivePlayers.filter((player) =>
    isPlayerWolfIdentity(player, {
      infectedPlayerIds,
      wolfDogChoice,
      wildChildTransformed,
    }) && player.roleId !== 'white_werewolf'
  ).length;

  const bearTamer = orderedPlayers.find((player) => player.isAlive && player.roleId === 'bear_tamer');
  const bearGrowls = (() => {
    if (!bearTamer || orderedPlayers.length < 2) return false;
    const total = orderedPlayers.length;
    const index = orderedPlayers.findIndex((player) => player.id === bearTamer.id);
    if (index === -1) return false;

    const isWolfSide = (player: typeof players[number] | undefined) =>
      !!player &&
      isPlayerWolfIdentity(player, {
        infectedPlayerIds,
        wolfDogChoice,
        wildChildTransformed,
      });

    let leftNeighbor: typeof players[number] | undefined;
    for (let offset = 1; offset < total; offset++) {
      const candidate = orderedPlayers[(index - offset + total) % total];
      if (candidate.isAlive) {
        leftNeighbor = candidate;
        break;
      }
    }

    let rightNeighbor: typeof players[number] | undefined;
    for (let offset = 1; offset < total; offset++) {
      const candidate = orderedPlayers[(index + offset) % total];
      if (candidate.isAlive) {
        rightNeighbor = candidate;
        break;
      }
    }

    return isWolfSide(leftNeighbor) || isWolfSide(rightNeighbor);
  })();

  const mayorAlive = players.find((player) => player.isAlive && player.isMayor) ?? null;
  const scapegoatPlayer = alivePlayers.find((player) => player.roleId === 'scapegoat') ?? null;
  const ravenCursedName = ravenCursedId
    ? players.find((player) => player.id === ravenCursedId)?.name ?? null
    : null;
  const foxInGame = players.some((player) => player.roleId === 'fox');
  const witchInGame = players.some((player) => player.roleId === 'witch' && player.isAlive);
  const witchHealUsed = usedGameAbilities.includes('witch_heal');
  const witchPoisonUsed = usedGameAbilities.includes('witch_poison');

  const dayTriggers = alivePlayers
    .map((player) => ROLE_MAP[player.roleId])
    .filter((role) => role?.dayTrigger);

  const resetTieFlow = () => {
    setIsTieFlowOpen(false);
    setSelectedTieIds([]);
    setShowTieBreaker(false);
    setShowScapegoatConfirm(false);
    setShowTieValidation(false);
  };

  const selectedTiePlayers = selectedTieIds
    .map((id) => alivePlayers.find((player) => player.id === id))
    .filter((player): player is (typeof alivePlayers)[number] => Boolean(player));
  const selectedTieNames = selectedTiePlayers.map((player) => player.name).join(' & ');

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

  const effectiveVoteTotals = voteAssist
    ? alivePlayers.map((player) => {
        const total = (voteAssist.votes[player.id] ?? 0) + (ravenCursedId === player.id ? 2 : 0);
        return { playerId: player.id, total };
      })
    : [];
  const highestVote = effectiveVoteTotals.reduce((max, item) => Math.max(max, item.total), 0);
  const tieLeaders = effectiveVoteTotals.filter((item) => item.total === highestVote && highestVote > 0);

  const metrics = [
    { label: t.day.metrics.alive, value: String(alivePlayers.length), tone: 'neutral' as const },
    { label: t.day.metrics.pressure, value: String(packWolfCount), tone: packWolfCount > 0 ? 'danger' as const : 'success' as const },
    { label: t.day.metrics.unresolved, value: String(resolutionQueue.length), tone: resolutionQueue.length > 0 ? 'day' as const : 'success' as const },
    { label: t.day.metrics.timer, value: t.timer.label, tone: 'day' as const },
  ];

  return (
    <ActionSurface
      phase="day"
      title={t.day.title(round)}
      subtitle={t.day.subtitle}
      metrics={metrics}
      className="day-phase"
      quickPanel={
        <div className="gm-quick-panel">
          <div className="gm-quick-panel__header">
            <strong>{t.game.quickPanel}</strong>
          </div>
          <div className="gm-quick-panel__actions">
            <button
              className="btn btn-ghost btn-sm"
              data-testid="dm-view-toggle"
              onClick={() => setRevealAll((visible) => !visible)}
            >
              {revealAll ? t.day.dmView.hide : t.day.dmView.show}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              data-testid="vote-assist-toggle"
              onClick={() => setVoteAssistActive(!voteAssist)}
            >
              {voteAssist ? t.day.voteAssistDisable : t.day.voteAssistEnable}
            </button>
            {voteAssist && (
              <button className="btn btn-ghost btn-sm" onClick={resetVoteAssist}>
                {t.day.clearVotes}
              </button>
            )}
          </div>
        </div>
      }
      footer={
        <div className="sticky-action-bar">
          <button className="btn btn-primary btn-large night-btn" onClick={togglePhase}>
            {t.day.nightButton}
          </button>
        </div>
      }
    >
      <div data-testid="day-phase">
        {resolutionQueue.length > 0 && (
          <section className="day-panel">
            <div className="panel-header">
              <h3>{t.day.resolutionTitle}</h3>
              <span className="panel-kicker">{t.day.resolutionHint}</span>
            </div>
            <div className="resolution-list">
              {resolutionQueue.map((item) => (
                <div key={item.id} className={`resolution-item resolution-item--${item.type}`}>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {bearTamer && (
          <div className={`bear-signal ${bearGrowls ? 'growl' : 'silent'}`}>
            <strong>{t.day.bearSignal(bearGrowls)}</strong>
          </div>
        )}

        {(dayTriggers.length > 0 || foxInGame || witchInGame || infectedPlayerIds.length > 0) && (
          <section className="day-panel">
            <h3>{t.day.dmReminders}</h3>
            <div className="day-trigger-stack">
              {dayTriggers.map((role) => {
                const dayText = getRoleTexts(role!, language).dayTrigger;
                if (!dayText) return null;
                return (
                  <div key={role!.id} className="day-trigger-item">
                    {role!.emoji} <strong>{getRoleName(role!, language)}:</strong> {dayText}
                  </div>
                );
              })}

              {foxInGame && (
                <div className="day-trigger-item">
                  {foxPowerActive ? t.day.foxPowerActive : t.day.foxPowerLost}
                </div>
              )}

              {witchInGame && (
                <div className="day-trigger-item">
                  {t.day.witchPotionsStatus(witchHealUsed, witchPoisonUsed)}
                </div>
              )}

              {alivePlayers.some((player) => player.roleId === 'pied_piper') && (
                <div className="day-trigger-item day-enchanted-bar">
                  {t.day.piedPiperBar(
                    enchantedPlayerIds.filter((id) => alivePlayers.some((player) => player.id === id)).length,
                    alivePlayers.length - 1
                  )}
                </div>
              )}

              {infectedPlayerIds.length > 0 && (
                <div className="day-trigger-item day-infected-bar">
                  {t.day.infectedBar}{' '}
                  {infectedPlayerIds
                    .map((id) => players.find((player) => player.id === id)?.name)
                    .filter(Boolean)
                    .join(', ')}
                </div>
              )}
            </div>
          </section>
        )}

        <Timer />

        {voteAssist && (
          <section className="day-panel vote-assist-panel">
            <div className="panel-header">
              <h3>{t.day.voteAssistTitle}</h3>
              <span className="panel-kicker">{t.day.voteAssistHint}</span>
            </div>
            {ravenCursedName && (
              <div className="raven-curse-bar">{t.day.ravenCurse(ravenCursedName)}</div>
            )}
            {mayorAlive && (
              <div className="mayor-vote-bar">{t.day.mayorReminder(mayorAlive.name)}</div>
            )}
            <div className="vote-assist-list">
              {alivePlayers.map((player) => {
                const baseVotes = voteAssist.votes[player.id] ?? 0;
                const totalVotes = baseVotes + (ravenCursedId === player.id ? 2 : 0);
                const noVote = voteAssist.noVoteIds.includes(player.id);
                return (
                  <div key={player.id} className={`vote-assist-row ${noVote ? 'vote-assist-row--novote' : ''}`}>
                    <div>
                      <strong>{player.name}</strong>
                      <p>{t.day.totalVotes(totalVotes)}</p>
                    </div>
                    <div className="vote-assist-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => adjustVote(player.id, -1)}>
                        −1
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => adjustVote(player.id, 1)}>
                        +1
                      </button>
                      <button className="btn btn-yellow btn-sm" onClick={() => adjustVote(player.id, 2)}>
                        {t.day.mayorPlusTwo}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleNoVote(player.id)}>
                        {noVote ? t.day.allowVote : t.day.noVote}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {tieLeaders.length > 1 && (
              <div className="tie-warning">{t.day.tieDetected(tieLeaders.map((item) => alivePlayers.find((player) => player.id === item.playerId)?.name ?? '').join(', '))}</div>
            )}
          </section>
        )}

        <section className="day-players">
          <h3>{t.day.playersTitle(alivePlayers.length)}</h3>
          <div className="players-grid">
            {orderedPlayers.map((player) => (
              <PlayerCard key={player.id} playerId={player.id} showRole={revealAll} />
            ))}
          </div>
        </section>

        <section className="day-panel tie-resolution-section" data-testid="tie-resolution-panel">
          <div className="panel-header">
            <h3>{t.day.tieResolutionTitle}</h3>
            {isTieFlowOpen && (
              <button className="btn btn-ghost btn-sm" onClick={resetTieFlow}>
                {t.day.tieResolutionCancel}
              </button>
            )}
          </div>

          <p className="tb-hint">{t.day.tieResolutionHint}</p>

          {!isTieFlowOpen ? (
            <button
              className="btn btn-yellow"
              data-testid="tie-resolution-start"
              disabled={alivePlayers.length < 2}
              onClick={() => {
                setIsTieFlowOpen(true);
                setShowTieBreaker(false);
                setShowScapegoatConfirm(false);
                setShowTieValidation(false);
              }}
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
                  const selected = selectedTieIds.includes(player.id);
                  return (
                    <button
                      key={player.id}
                      type="button"
                      className={`tb-player ${selected ? 'selected' : ''}`}
                      aria-pressed={selected}
                      onClick={() => {
                        setShowTieValidation(false);
                        setShowTieBreaker(false);
                        setShowScapegoatConfirm(false);
                        setSelectedTieIds((ids) =>
                          ids.includes(player.id)
                            ? ids.filter((id) => id !== player.id)
                            : [...ids, player.id]
                        );
                      }}
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
                  tiedPlayerIds={selectedTieIds}
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
      </div>
    </ActionSurface>
  );
}
