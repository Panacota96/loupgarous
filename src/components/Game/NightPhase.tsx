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
import '../../styles/night.css';

const PASSIVE_REMINDER_ROLE_IDS = ['bear_tamer', 'elder', 'village_idiot', 'scapegoat', 'hunter', 'angel'];

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
  const protectorHistory = useGameStore((s) => s.protectorHistory);
  const protectedPlayerId = useGameStore((s) => s.protectedPlayerId);
  const lastProtectedPlayerId = useGameStore((s) => s.lastProtectedPlayerId);
  const loversIds = useGameStore((s) => s.loversIds);

  const completeNightStep = useGameStore((s) => s.completeNightStep);
  const setEliminatedThisNight = useGameStore((s) => s.setEliminatedThisNight);
  const recordAbilityUsed = useGameStore((s) => s.useGameAbility);
  const applyNightResults = useGameStore((s) => s.applyNightResults);
  const setLovers = useGameStore((s) => s.setLovers);
  const setWildChildModelStore = useGameStore((s) => s.setWildChildModel);
  const setWolfDogChoiceStore = useGameStore((s) => s.setWolfDogChoice);
  const addEnchanted = useGameStore((s) => s.addEnchanted);
  const infectPlayer = useGameStore((s) => s.infectPlayer);
  const setWolfVictimIdStore = useGameStore((s) => s.setWolfVictimId);
  const setRavenCursed = useGameStore((s) => s.setRavenCursed);
  const setFoxPowerActiveStore = useGameStore((s) => s.setFoxPowerActive);
  const goToNightStepStore = useGameStore((s) => s.goToNightStep);
  const setProtectorTargetStore = useGameStore((s) => s.setProtectorTarget);

  const [witchSave, setWitchSave] = useState(false);
  const [witchKill, setWitchKill] = useState('');
  const [wolfVictim, setWolfVictim] = useState('');
  const [bigBadWolfExtra, setBigBadWolfExtra] = useState('');
  const [seerTarget, setSeerTarget] = useState('');
  const [loversP1, setLoversP1] = useState('');
  const [loversP2, setLoversP2] = useState('');
  const [wildChildModel, setWildChildModelLocal] = useState('');
  const [wolfDogChoice, setWolfDogChoiceLocal] = useState<'villager' | 'werewolf' | ''>('');
  const [whiteWolfTarget, setWhiteWolfTarget] = useState('');
  const [pipedP1, setPipedP1] = useState('');
  const [pipedP2, setPipedP2] = useState('');
  const [infectTarget, setInfectTarget] = useState('');
  const [ravenTarget, setRavenTarget] = useState('');
  const [passiveChecks, setPassiveChecks] = useState<Record<string, boolean>>({});
  const [foxCenterTarget, setFoxCenterTarget] = useState('');
  const [protectorTarget, setProtectorTargetLocal] = useState('');
  const [protectorTouched, setProtectorTouched] = useState(false);

  const allStepsDone = currentNightStepIndex >= nightSteps.length;
  const currentStep = nightSteps[currentNightStepIndex];
  const currentRole = currentStep ? ROLE_MAP[currentStep.roleId] : null;
  const currentRoleText = currentRole ? getRoleTexts(currentRole, language) : null;
  const currentRoleName = currentRole ? getRoleName(currentRole, language) : '';

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
  const infectPereUsed = usedGameAbilities.includes('infect_pere');

  const anyWolfEliminated = allPlayers.some(
    (p) => !p.isAlive && (WOLF_ROLE_IDS.includes(p.roleId) || infectedPlayerIds.includes(p.id))
  );

  const alivePureWolves = players.filter(
    (p) => WOLF_ROLE_IDS.includes(p.roleId) && p.roleId !== 'white_werewolf'
  );

  const isWolfAligned = (p: typeof players[0]) =>
    WOLF_ROLE_IDS.includes(p.roleId) ||
    (p.roleId === 'wolf_dog' && wolfDogChoiceStore === 'werewolf') ||
    (p.roleId === 'wild_child' && wildChildTransformed) ||
    infectedPlayerIds.includes(p.id);

  const isWolfIdentity = (p: typeof players[0]) =>
    isPlayerWolfIdentity(p, {
      infectedPlayerIds,
      wolfDogChoice: wolfDogChoiceStore,
      wildChildTransformed,
    });

  const wolfTargets = players.filter((p) => !isWolfAligned(p));
  const cupidIds = players.filter((p) => p.roleId === 'cupid').map((p) => p.id);
  const wildChildId = players.find((p) => p.roleId === 'wild_child')?.id ?? null;
  const piperEligiblePlayers = useMemo(
    () => players.filter((p) => !enchantedPlayerIds.includes(p.id)),
    [players, enchantedPlayerIds]
  );
  const piperEligibleIds = useMemo(
    () => new Set(piperEligiblePlayers.map((p) => p.id)),
    [piperEligiblePlayers]
  );
  const protectionThisNight = protectorHistory.find((p) => p.round === round) ?? null;
  const lastProtection = useMemo(() => {
    const prior = [...protectorHistory]
      .filter((p) => p.round < round)
      .sort((a, b) => b.round - a.round)[0];
    if (!prior) return null;
    const targetName = prior.targetId
      ? allPlayers.find((p) => p.id === prior.targetId)?.name ?? null
      : null;
    return { ...prior, targetName };
  }, [protectorHistory, round, allPlayers]);
  const previousProtectedPlayerId = lastProtectedPlayerId ?? lastProtection?.targetId ?? null;
  const currentProtectedPlayerId = protectedPlayerId ?? protectionThisNight?.targetId ?? null;
  const currentProtectionValue = protectorTouched
    ? protectorTarget
    : currentProtectedPlayerId ?? '';
  const protectablePlayers = players.filter((p) => p.id !== previousProtectedPlayerId);
  const currentProtectedPlayer = currentProtectedPlayerId
    ? allPlayers.find((p) => p.id === currentProtectedPlayerId) ?? null
    : null;
  const protectedWolfTarget = currentProtectedPlayerId
    ? wolfTargets.find((p) => p.id === currentProtectedPlayerId) ?? null
    : null;
  const currentWolfTargets = wolfTargets.filter((p) => p.id !== currentProtectedPlayerId);
  const bigBadWolfTargets = players.filter(
    (p) => p.id !== wolfVictim && !eliminatedThisNight.includes(p.id) && !isWolfAligned(p)
  );
  const protectedBigBadTarget = currentProtectedPlayerId
    ? bigBadWolfTargets.find((p) => p.id === currentProtectedPlayerId) ?? null
    : null;
  const currentBigBadTargets = bigBadWolfTargets.filter((p) => p.id !== currentProtectedPlayerId);
  const canCompleteStep =
    currentRole?.id !== 'protector' ||
    protectablePlayers.length === 0 ||
    protectablePlayers.some((p) => p.id === currentProtectionValue);
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
    setWolfVictim('');
    setBigBadWolfExtra('');
    setSeerTarget('');
    setWitchSave(false);
    setWitchKill('');
    setWildChildModelLocal('');
    setWolfDogChoiceLocal('');
    setWhiteWolfTarget('');
    setPipedP1('');
    setPipedP2('');
    setInfectTarget('');
    setLoversP1('');
    setLoversP2('');
    setRavenTarget('');
    setFoxCenterTarget('');
    setProtectorTargetLocal('');
    setProtectorTouched(false);
  };

  const handleCompleteStep = () => {
    if (!currentRole) return;
    if (!canCompleteStep) return;

    if (currentRole.id === 'werewolf') {
      const target = players.find((p) => p.id === wolfVictim);
      if (target && !isWolfAligned(target)) {
        setEliminatedThisNight([...eliminatedThisNight.filter((id) => id !== wolfVictim), wolfVictim]);
        setWolfVictimIdStore(wolfVictim);
      } else {
        setWolfVictimIdStore(null);
      }
    }

    if (currentRole.id === 'big_bad_wolf' && bigBadWolfExtra && !anyWolfEliminated) {
      const target = players.find((p) => p.id === bigBadWolfExtra);
      if (target && !isWolfAligned(target))
        setEliminatedThisNight([...eliminatedThisNight.filter((id) => id !== bigBadWolfExtra), bigBadWolfExtra]);
    }

    if (currentRole.id === 'infect_pere' && infectTarget && !infectPereUsed) {
      const target = players.find((p) => p.id === infectTarget);
      if (target && !isWolfAligned(target)) infectPlayer(infectTarget);
    }

    if (currentRole.id === 'white_werewolf' && whiteWolfTarget)
      setEliminatedThisNight([...eliminatedThisNight.filter((id) => id !== whiteWolfTarget), whiteWolfTarget]);

    if (currentRole.id === 'protector') {
      const selectedProtection = protectablePlayers.find((p) => p.id === currentProtectionValue)?.id ?? null;
      setProtectorTargetStore(selectedProtection);
    }

    if (currentRole.id === 'witch') {
      // Use the persisted wolfVictimId from store — wolfVictim local state is empty at this step
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

    if (currentRole.id === 'cupid' && loversP1 && loversP2 && round === 1) {
      const invalidLover =
        loversP1 === loversP2 || cupidIds.includes(loversP1) || cupidIds.includes(loversP2);
      if (!invalidLover) setLovers(loversP1, loversP2);
    }

    if (currentRole.id === 'wild_child' && wildChildModel) {
      if (wildChildModel !== wildChildId) setWildChildModelStore(wildChildModel);
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

    const currentVictimId = wolfVictim || wolfVictimId || eliminatedThisNight[0] || '';
    const currentVictimName = currentVictimId
      ? (allPlayers.find((p) => p.id === currentVictimId)?.name ?? 'Unknown')
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

        {/* Werewolf: pick victim */}
        {currentRole.id === 'werewolf' && (
          <div className="night-input">
            {currentProtectedPlayer && (
              <p className="protected-banner">🛡️ Protected tonight: <strong>{currentProtectedPlayer.name}</strong></p>
            )}
            <label>&#127919; Wolves choose their victim:</label>
            <select value={wolfVictim} onChange={(e) => setWolfVictim(e.target.value)}>
              <option value="">&mdash; Select target (optional) &mdash;</option>
              {protectedWolfTarget && (
                <option value={protectedWolfTarget.id} disabled>
                  🛡️ {protectedWolfTarget.name} (Protected)
                </option>
              )}
              {currentWolfTargets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}

        {/* Infect Pere: infect instead of kill */}
        {currentRole.id === 'infect_pere' && (
          <div className="night-input">
            {currentVictimName
              ? <p className="witch-victim-info">{t.night.infectVictim} <strong>{currentVictimName}</strong></p>
              : <p className="witch-victim-info">{t.night.noWolfVictim}</p>}
            {infectPereUsed ? (
              <div className="used-banner">{t.night.infectUsed}</div>
            ) : (
              <>
                <label>{t.night.infectInstead}</label>
                <select value={infectTarget} onChange={(e) => setInfectTarget(e.target.value)}>
                  <option value="">&mdash; {t.night.skipInfect} &mdash;</option>
                  {wolfTargets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {infectTarget && (
                  <p className="infect-note">
                    {t.night.infectNote(players.find((p) => p.id === infectTarget)?.name ?? '')}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Big Bad Wolf: optional extra kill */}
        {currentRole.id === 'big_bad_wolf' && (
          <div className="night-input">
            {currentProtectedPlayer && (
              <p className="protected-banner">🛡️ Protected tonight: <strong>{currentProtectedPlayer.name}</strong></p>
            )}
            {anyWolfEliminated ? (
              <div className="used-banner">{t.night.bigBadWolfLocked}</div>
            ) : (
              <>
                <label>{t.night.bigBadWolfLabel}</label>
                <select value={bigBadWolfExtra} onChange={(e) => setBigBadWolfExtra(e.target.value)}>
                  <option value="">&mdash; {t.night.skipExtra} &mdash;</option>
                  {protectedBigBadTarget && (
                    <option value={protectedBigBadTarget.id} disabled>
                      🛡️ {protectedBigBadTarget.name} (Protected)
                    </option>
                  )}
                  {currentBigBadTargets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </>
            )}
          </div>
        )}

        {/* White Werewolf: devour a fellow wolf */}
        {currentRole.id === 'white_werewolf' && (
          <div className="night-input">
            <label>{t.night.whiteWolfLabel}</label>
            <select value={whiteWolfTarget} onChange={(e) => setWhiteWolfTarget(e.target.value)}>
              <option value="">&mdash; {t.night.skipWhiteWolf} &mdash;</option>
              {alivePureWolves.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {alivePureWolves.length === 0 && <p className="infect-note">{t.night.noOtherWolves}</p>}
          </div>
        )}

        {/* Protector: choose a player to guard */}
        {currentRole.id === 'protector' && (
          <div className="night-input">
            {lastProtection ? (
              lastProtection.targetId ? (
                <p className="witch-victim-info">
                  {t.night.protectorLast(
                    lastProtection.targetName ?? t.night.protectorUnknown,
                    lastProtection.round
                  )}
                </p>
              ) : (
                <p className="witch-victim-info">
                  {t.night.protectorLastNone(lastProtection.round)}
                </p>
              )
            ) : (
              <p className="witch-victim-info">{t.night.protectorNoPrevious}</p>
            )}
            {protectablePlayers.length === 0 ? (
              <div className="used-banner">🛡️ No valid protection target remains tonight.</div>
            ) : (
              <>
                <label>{t.night.protectorLabel}</label>
                <select
                  value={currentProtectionValue}
                  onChange={(e) => {
                    setProtectorTouched(true);
                    setProtectorTargetLocal(e.target.value);
                  }}
                >
                  <option value="">&mdash; Select player &mdash;</option>
                  {protectablePlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </>
            )}
            {previousProtectedPlayerId && (
              <p className="infect-note">
                {t.night.protectorCannotRepeat(
                  lastProtection?.targetName ??
                    allPlayers.find((p) => p.id === previousProtectedPlayerId)?.name ??
                    t.night.protectorUnknown
                )}
              </p>
            )}
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
                {foxCenterOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
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
                        <span className="fox-trio-seat__name">{player.name}</span>
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
              {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {seerTarget && (() => {
              const target = allPlayers.find((p) => p.id === seerTarget);
              const targetRole = target ? ROLE_MAP[target.roleId] : null;
              return targetRole ? (
                <div className="seer-reveal">
                  <strong>{t.night.dmReveal(target?.name ?? '', getRoleName(targetRole, language))}</strong>{' '}
                  <span className={`camp-badge camp-${targetRole.camp}`}>{getCampLabel(targetRole.camp, language)}</span>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Witch */}
        {currentRole.id === 'witch' && (
          <div className="night-input">
            {currentVictimName
              ? <p className="witch-victim-info">{t.night.witchVictim(currentVictimName)}</p>
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
                  {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
            </label>
          </div>
        )}

        {/* Cupid: link lovers */}
        {currentRole.id === 'cupid' && round === 1 && (
          <div className="night-input">
            <label>{t.night.cupidLabel}</label>
            <div className="lovers-row">
              <select value={loversP1} onChange={(e) => setLoversP1(e.target.value)}>
                <option value="">&mdash; {t.night.player1} &mdash;</option>
                {players
                  .filter((p) => p.id !== loversP2 && !cupidIds.includes(p.id))
                  .map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <span>&#128152;</span>
              <select value={loversP2} onChange={(e) => setLoversP2(e.target.value)}>
                <option value="">&mdash; {t.night.player2} &mdash;</option>
                {players
                  .filter((p) => p.id !== loversP1 && !cupidIds.includes(p.id))
                  .map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
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

        {/* Wild Child: pick model */}
        {currentRole.id === 'wild_child' && (
          <div className="night-input">
            <label>{t.night.wildChildLabel}</label>
            <select value={wildChildModel} onChange={(e) => setWildChildModelLocal(e.target.value)}>
              <option value="">&mdash; {t.night.selectModel} &mdash;</option>
              {players.filter((p) => p.id !== wildChildId).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {wildChildModel && (
              <p className="infect-note">
                {t.night.wildChildNote(players.find((p) => p.id === wildChildModel)?.name ?? '')}
              </p>
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
                  .map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
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
                  .map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
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
              {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {ravenTarget && (() => {
              const cursedName = players.find((p) => p.id === ravenTarget)?.name;
              return (
                <p className="infect-note">
                  {t.night.ravenNote(cursedName ?? '')}
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
                  .map((id) => allPlayers.find((p) => p.id === id)?.name)
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
