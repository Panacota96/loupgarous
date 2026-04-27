import { useMemo, useState } from 'react';
import { resolveNightEliminations, useGameStore } from '../../store/gameStore';
import {
  ROLE_MAP,
  WOLF_ROLE_IDS,
  getRoleTexts,
  getRoleName,
  isPlayerWolfIdentity,
} from '../../data/roles';
import { getCampLabel, useI18n } from '../../i18n';
import { getPlayerRoleLabel, getPlayerRoleLabelById } from '../../utils/playerLabels';
import '../../styles/night.css';

const PASSIVE_REMINDER_ROLE_IDS = ['bear_tamer', 'elder', 'hunter', 'angel'];

export default function NightPhase() {
  const { language, t } = useI18n();
  const nightSteps = useGameStore((s) => s.nightSteps);
  const currentNightStepIndex = useGameStore((s) => s.currentNightStepIndex);
  const eliminatedThisNight = useGameStore((s) => s.eliminatedThisNight);
  const allPlayers = useGameStore((s) => s.players);
  const players = useMemo(() => allPlayers.filter((p) => p.isAlive), [allPlayers]);
  const usedGameAbilities = useGameStore((s) => s.usedGameAbilities);
  const round = useGameStore((s) => s.round);
  const infectedPlayerIds = useGameStore((s) => s.infectedPlayerIds);
  const wolfVictimId = useGameStore((s) => s.wolfVictimId);
  const wolfDogChoiceStore = useGameStore((s) => s.wolfDogChoice);
  const wildChildTransformed = useGameStore((s) => s.wildChildTransformed);
  const foxPowerActive = useGameStore((s) => s.foxPowerActive);
  const enchantedPlayerIds = useGameStore((s) => s.enchantedPlayerIds);
  const loversIds = useGameStore((s) => s.loversIds);

  const completeNightStep = useGameStore((s) => s.completeNightStep);
  const setEliminatedThisNight = useGameStore((s) => s.setEliminatedThisNight);
  const recordAbilityUsed = useGameStore((s) => s.useGameAbility);
  const applyNightResults = useGameStore((s) => s.applyNightResults);
  const setWolfDogChoiceStore = useGameStore((s) => s.setWolfDogChoice);
  const addEnchanted = useGameStore((s) => s.addEnchanted);
  const setRavenCursed = useGameStore((s) => s.setRavenCursed);
  const setFoxPowerActiveStore = useGameStore((s) => s.setFoxPowerActive);
  const goToNightStepStore = useGameStore((s) => s.goToNightStep);

  const [witchSave, setWitchSave] = useState(false);
  const [witchKill, setWitchKill] = useState('');
  const [seerTarget, setSeerTarget] = useState('');
  const [wolfDogChoice, setWolfDogChoiceLocal] = useState<'villager' | 'werewolf' | ''>('');
  const [whiteWolfTarget, setWhiteWolfTarget] = useState('');
  const [pipedP1, setPipedP1] = useState('');
  const [pipedP2, setPipedP2] = useState('');
  const [ravenTarget, setRavenTarget] = useState('');
  const [passiveChecks, setPassiveChecks] = useState<Record<string, boolean>>({});
  const [foxCenterTarget, setFoxCenterTarget] = useState('');

  const allStepsDone = currentNightStepIndex >= nightSteps.length;
  const currentStep = nightSteps[currentNightStepIndex];
  const currentRole = currentStep ? ROLE_MAP[currentStep.roleId] : null;
  const currentRoleText = currentRole ? getRoleTexts(currentRole, language) : null;
  const currentRoleName = currentRole ? getRoleName(currentRole, language) : '';
  const playerLabel = (player: typeof allPlayers[number]) =>
    getPlayerRoleLabel(player, allPlayers, language);
  const playerLabelById = (id: string | null | undefined, fallback = 'Unknown') =>
    getPlayerRoleLabelById(id, allPlayers, language, fallback);

  const passiveReminderRoles = useMemo(() => {
    const uniqueRoleIds = [...new Set(allPlayers.map((p) => p.roleId))];
    return uniqueRoleIds
      .map((id) => ROLE_MAP[id])
      .filter(
        (r): r is NonNullable<typeof ROLE_MAP[string]> =>
          !!r && PASSIVE_REMINDER_ROLE_IDS.includes(r.id)
      );
  }, [allPlayers]);

  const witchHealUsed = usedGameAbilities.includes('witch_heal');
  const witchPoisonUsed = usedGameAbilities.includes('witch_poison');

  const alivePureWolves = players.filter(
    (p) => WOLF_ROLE_IDS.includes(p.roleId) && p.roleId !== 'white_werewolf'
  );

  const isWolfIdentity = (p: typeof players[0]) =>
    isPlayerWolfIdentity(p, {
      infectedPlayerIds,
      wolfDogChoice: wolfDogChoiceStore,
      wildChildTransformed,
    });

  const piperEligiblePlayers = useMemo(
    () => players.filter((p) => !enchantedPlayerIds.includes(p.id)),
    [players, enchantedPlayerIds]
  );
  const piperEligibleIds = useMemo(
    () => new Set(piperEligiblePlayers.map((p) => p.id)),
    [piperEligiblePlayers]
  );
  const canCompleteStep = true;
  const foxHasSingleTrio = players.length === 3;
  const foxCenterOptions = useMemo(
    () => (foxHasSingleTrio ? players.slice(0, 1) : players),
    [foxHasSingleTrio, players]
  );
  const selectedFoxCenterId = foxCenterTarget || foxCenterOptions[0]?.id || '';
  const foxTrioPlayers = useMemo(() => {
    if (players.length < 3 || !selectedFoxCenterId) return [];
    const centerIndex = players.findIndex((p) => p.id === selectedFoxCenterId);
    if (centerIndex === -1) return [];
    if (players.length === 3) return players;
    return [-1, 0, 1].map((offset) => players[(centerIndex + offset + players.length) % players.length]);
  }, [players, selectedFoxCenterId]);
  const foxFoundWolf = foxTrioPlayers.some((p) => isWolfIdentity(p));
  const nightResolutionPreview = useMemo(
    () => resolveNightEliminations(allPlayers, eliminatedThisNight, infectedPlayerIds, loversIds),
    [allPlayers, eliminatedThisNight, infectedPlayerIds, loversIds]
  );

  const resetLocalState = () => {
    setSeerTarget('');
    setWitchSave(false);
    setWitchKill('');
    setWolfDogChoiceLocal('');
    setWhiteWolfTarget('');
    setPipedP1('');
    setPipedP2('');
    setRavenTarget('');
    setFoxCenterTarget('');
  };

  const handleCompleteStep = () => {
    if (!currentRole) return;
    if (!canCompleteStep) return;

    if (currentRole.id === 'white_werewolf' && whiteWolfTarget)
      setEliminatedThisNight([...eliminatedThisNight.filter((id) => id !== whiteWolfTarget), whiteWolfTarget]);

    if (currentRole.id === 'witch') {
      // No normal wolf victim is recorded; this only applies to older/restored games.
      const victimToSave = wolfVictimId ?? '';
      if (witchSave && !witchHealUsed) {
        recordAbilityUsed('witch_heal');
        setEliminatedThisNight(eliminatedThisNight.filter((id) => id !== victimToSave));
      }
      if (witchKill && !witchPoisonUsed) {
        recordAbilityUsed('witch_poison');
        setEliminatedThisNight([...eliminatedThisNight, witchKill]);
      }
    }

    if (currentRole.id === 'raven' && ravenTarget)
      setRavenCursed(ravenTarget);

    if (currentRole.id === 'fox') {
      if (foxTrioPlayers.length > 0 && !foxFoundWolf) setFoxPowerActiveStore(false);
      else if (foxPowerActive) setFoxPowerActiveStore(true);
    }

    if (currentRole.id === 'wolf_dog' && wolfDogChoice)
      setWolfDogChoiceStore(wolfDogChoice);

    if (currentRole.id === 'pied_piper') {
      const toEnchant = [pipedP1, pipedP2].filter(
        (id): id is string => !!id && piperEligibleIds.has(id)
      );
      if (toEnchant.length > 0) addEnchanted(toEnchant);
    }

    completeNightStep();
    resetLocalState();
  };

  const handleBackStep = () => {
    if (currentNightStepIndex <= 0 || nightSteps.length === 0) return;
    const target = Math.min(currentNightStepIndex - 1, nightSteps.length - 1);
    goToNightStepStore(target);
    resetLocalState();
  };

  const handleJumpToStep = (index: number) => {
    if (index < 0 || index >= currentNightStepIndex) return;
    goToNightStepStore(index);
    resetLocalState();
  };

  const renderStepContent = () => {
    if (!currentRole) return null;

    const currentVictimId = wolfVictimId || eliminatedThisNight[0] || '';
    const currentVictimLabel = currentVictimId
      ? playerLabelById(currentVictimId)
      : null;

    return (
      <div className="night-step-content">
        <div className="role-wake">
          <span className="role-wake-emoji">{currentRole.emoji}</span>
          <div>
            <h3>{t.night.wakesUp(currentRoleName)}</h3>
            <div className="role-wake-badges">
              {currentRole.firstNightOnly && <span className="badge badge-once">{t.night.badges.firstNightOnly}</span>}
              {currentRole.everyOtherNight && <span className="badge badge-once">{t.night.badges.everyOtherNight}</span>}
              {currentRole.oddNightsOnly && <span className="badge badge-once">{t.night.badges.oddNightsOnly}</span>}
              {currentRole.nightAction?.isOneTime && <span className="badge badge-once">{t.night.badges.oneTime}</span>}
            </div>
          </div>
        </div>

        <div className="night-instruction">{currentRoleText?.nightActionDescription}</div>

        {/* White Werewolf: devour a fellow wolf */}
        {currentRole.id === 'white_werewolf' && (
          <div className="night-input">
            <label>{t.night.whiteWolfLabel}</label>
            <select value={whiteWolfTarget} onChange={(e) => setWhiteWolfTarget(e.target.value)}>
              <option value="">&mdash; {t.night.skipWhiteWolf} &mdash;</option>
              {alivePureWolves.map((p) => <option key={p.id} value={p.id}>{playerLabel(p)}</option>)}
            </select>
            {alivePureWolves.length === 0 && <p className="infect-note">{t.night.noOtherWolves}</p>}
          </div>
        )}

        {/* Fox: sniff result */}
        {currentRole.id === 'fox' && (
          <div className="night-input">
            {foxPowerActive ? (
              <p className="witch-victim-info">{t.night.foxActive}</p>
            ) : (
              <div className="used-banner">{t.night.foxLost}</div>
            )}
            <label>{t.night.foxCenterLabel}</label>
            {foxHasSingleTrio ? (
              <p className="witch-victim-info">{t.night.foxSingleTrio}</p>
            ) : (
              <select
                value={selectedFoxCenterId}
                onChange={(e) => setFoxCenterTarget(e.target.value)}
                data-testid="fox-center-select"
              >
                {foxCenterOptions.map((p) => <option key={p.id} value={p.id}>{playerLabel(p)}</option>)}
              </select>
            )}
            {foxTrioPlayers.length > 0 && (
              <div className="fox-trio" data-testid="fox-trio-preview">
                <p className="fox-trio__label">{t.night.foxPreviewLabel}</p>
                <div className="fox-trio__cards">
                  {foxTrioPlayers.map((player) => {
                    const isWolfSeat = isWolfIdentity(player);
                    return (
                      <div
                        key={player.id}
                        className={`fox-trio-seat ${isWolfSeat ? 'fox-trio-seat--wolf' : ''}`}
                        data-testid="fox-trio-seat"
                      >
                        <span className="fox-trio-seat__name">{playerLabel(player)}</span>
                        {isWolfSeat && (
                          <span className="fox-trio-seat__badge" data-testid="fox-trio-seat-wolf">
                            🐺
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div
              className={`fox-result-summary ${foxFoundWolf ? 'fox-result-summary--wolf' : 'fox-result-summary--none'}`}
              data-testid="fox-result-summary"
            >
              <span>{t.night.foxResultLabel}</span>
              <strong>{foxFoundWolf ? t.night.foxFoundWolf : t.night.foxFoundNone}</strong>
            </div>
            <p className="infect-note">{t.night.foxReminder}</p>
          </div>
        )}

        {/* Seer: DM-only card peek */}
        {currentRole.id === 'seer' && (
          <div className="night-input">
            <label>{t.night.seerLabel}</label>
            <select value={seerTarget} onChange={(e) => setSeerTarget(e.target.value)}>
              <option value="">&mdash; {t.night.selectPlayer} &mdash;</option>
              {players.map((p) => <option key={p.id} value={p.id}>{playerLabel(p)}</option>)}
            </select>
            {seerTarget && (() => {
              const target = allPlayers.find((p) => p.id === seerTarget);
              const targetRole = target ? ROLE_MAP[target.roleId] : null;
              return targetRole ? (
                <div className="seer-reveal">
                  <strong>{t.night.dmReveal(target ? playerLabel(target) : '', getRoleName(targetRole, language))}</strong>{' '}
                  <span className={`camp-badge camp-${targetRole.camp}`}>{getCampLabel(targetRole.camp, language)}</span>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Witch */}
        {currentRole.id === 'witch' && (
          <div className="night-input">
            {currentVictimLabel
              ? <p className="witch-victim-info">{t.night.witchVictim(currentVictimLabel)}</p>
              : <p className="witch-victim-info">{t.night.witchVictim(null)}</p>}
            <label className="witch-option">
              <input type="checkbox" checked={witchSave} onChange={(e) => setWitchSave(e.target.checked)} disabled={witchHealUsed} />
              <span>{t.night.witchHeal} {witchHealUsed && <span className="used-badge">{t.night.usedBadge}</span>}</span>
            </label>
            <label className="witch-option">
              <span>{t.night.witchDeath}</span>
              {witchPoisonUsed ? <span className="used-badge">{t.night.usedBadge}</span> : (
                <select value={witchKill} onChange={(e) => setWitchKill(e.target.value)}>
                  <option value="">&mdash; {t.night.none} &mdash;</option>
                  {players.map((p) => <option key={p.id} value={p.id}>{playerLabel(p)}</option>)}
                </select>
              )}
            </label>
          </div>
        )}

        {/* Wolf-Dog: choose side */}
        {currentRole.id === 'wolf_dog' && (
          <div className="night-input">
            <label>{t.night.wolfDogLabel}</label>
            <div className="choice-buttons">
              <button
                className={`choice-btn ${wolfDogChoice === 'villager' ? 'selected-village' : ''}`}
                onClick={() => setWolfDogChoiceLocal('villager')}
              >{t.night.villager}</button>
              <button
                className={`choice-btn ${wolfDogChoice === 'werewolf' ? 'selected-wolf' : ''}`}
                onClick={() => setWolfDogChoiceLocal('werewolf')}
              >{t.night.werewolf}</button>
            </div>
            {wolfDogChoice === 'werewolf' && (
              <p className="infect-note">{t.night.wolfDogNote}</p>
            )}
          </div>
        )}

        {/* Sisters: acknowledgment */}
        {currentRole.id === 'soeurs' && (
          <div className="night-input">
            <p className="witch-victim-info">
              {t.night.sistersIntro(round === 1)}
            </p>
            <p className="infect-note">{t.night.sistersNote}</p>
          </div>
        )}

        {/* Pied Piper: enchant 2 */}
        {currentRole.id === 'pied_piper' && (
          <div className="night-input">
            <label>{t.night.piperLabel}</label>
            <div className="lovers-row">
              <select
                value={pipedP1}
                onChange={(e) => setPipedP1(e.target.value)}
                disabled={piperEligiblePlayers.length === 0}
              >
                <option value="">&mdash; {t.night.player1} &mdash;</option>
                {piperEligiblePlayers
                  .filter((p) => p.id !== pipedP2)
                  .map((p) => <option key={p.id} value={p.id}>{playerLabel(p)}</option>)}
              </select>
              <span>&#127926;</span>
              <select
                value={pipedP2}
                onChange={(e) => setPipedP2(e.target.value)}
                disabled={piperEligiblePlayers.length <= 1}
              >
                <option value="">&mdash; {t.night.player2} &mdash;</option>
                {piperEligiblePlayers
                  .filter((p) => p.id !== pipedP1)
                  .map((p) => <option key={p.id} value={p.id}>{playerLabel(p)}</option>)}
              </select>
            </div>
            {piperEligiblePlayers.length <= 1 && (
              <p className="infect-note">
                {piperEligiblePlayers.length === 0
                  ? t.night.piperNoTargets
                  : t.night.piperOneTarget}
              </p>
            )}
            <p className="infect-note">{t.night.enchantNote}</p>
          </div>
        )}

        {/* Raven: curse a player (+2 votes next day) */}
        {currentRole.id === 'raven' && (
          <div className="night-input">
            <label>{t.night.ravenLabel}</label>
            <select value={ravenTarget} onChange={(e) => setRavenTarget(e.target.value)}>
              <option value="">&mdash; {t.night.ravenNone} &mdash;</option>
              {players.map((p) => <option key={p.id} value={p.id}>{playerLabel(p)}</option>)}
            </select>
            {ravenTarget && (() => {
              const cursedName = playerLabelById(ravenTarget, '');
              return (
                <p className="infect-note">
                  {t.night.ravenNote(cursedName)}
                </p>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="night-phase" data-testid="night-phase">
      <div className="night-header">
        <span className="phase-icon">&#127769;</span>
        <div>
          <h2>{t.night.title(round)}</h2>
          <p className="night-subtitle">{t.night.subtitle}</p>
        </div>
      </div>

      {round === 1 && passiveReminderRoles.length > 0 && (
        <div className="gm-checklist" data-testid="passive-checklist">
          <div className="gm-checklist__header">
            <span className="gm-checklist__icon">📋</span>
            <div>
              <h3>{t.night.passiveTitle}</h3>
              <p className="gm-checklist__subtitle">{t.night.passiveSubtitle}</p>
            </div>
          </div>
          <div className="gm-checklist__items">
            {passiveReminderRoles.map((r) => {
              const texts = getRoleTexts(r, language);
              const reminder = texts.dayTrigger ?? texts.revealTrigger ?? texts.description ?? '';
              const checked = passiveChecks[r.id] ?? false;
              return (
                <label key={r.id} className="gm-checklist__item">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setPassiveChecks((prev) => ({ ...prev, [r.id]: e.target.checked }))
                    }
                  />
                  <span>
                    {r.emoji} <strong>{getRoleName(r, language)}:</strong> {reminder}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="gm-checklist__hint">{t.night.passiveHint}</p>
        </div>
      )}

      <div className="night-steps-bar">
        {nightSteps.map((step, i) => {
          const r = ROLE_MAP[step.roleId];
          const canJump = i < currentNightStepIndex;
          return (
            <div
              key={i}
              className={`step-pip ${step.completed ? 'done' : ''} ${i === currentNightStepIndex ? 'active' : ''} ${canJump ? 'clickable' : ''}`}
              title={r ? getRoleName(r, language) : undefined}
              role={canJump ? 'button' : undefined}
              tabIndex={canJump ? 0 : -1}
              onClick={canJump ? () => handleJumpToStep(i) : undefined}
              onKeyDown={
                canJump
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleJumpToStep(i);
                    }
                  : undefined
              }
            >
              {r?.emoji}
            </div>
          );
        })}
      </div>
      {currentNightStepIndex > 0 && (
        <p className="night-nav-hint">{t.night.backHint}</p>
      )}

      {!allStepsDone ? (
        <>
          {renderStepContent()}
          <button
            className="btn btn-primary btn-large"
            data-testid="night-next"
            onClick={handleCompleteStep}
            disabled={!canCompleteStep}
          >
            &#9989; Done &mdash; Next
          </button>
        </>
      ) : (
        <div className="night-summary">
          <h3>&#127749; Night ends</h3>
          {nightResolutionPreview.finalEliminated.length === 0 ? (
            <p>No one was eliminated tonight. &#128570;</p>
          ) : (
            <p>
              {t.night.eliminated}{' '}
              <strong>
                {nightResolutionPreview.finalEliminated
                  .map((id) => playerLabelById(id))
                  .join(', ')}
              </strong>
            </p>
          )}
          <div className="night-actions summary-actions">
            <button
              className="btn btn-ghost"
              onClick={handleBackStep}
              disabled={currentNightStepIndex <= 0}
            >
              {t.night.goBack}
            </button>
            <button
              className="btn btn-primary btn-large"
              data-testid="reveal-day"
              onClick={applyNightResults}
            >
              {t.night.revealDay}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
