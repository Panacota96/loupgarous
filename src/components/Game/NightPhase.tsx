import { useMemo, useState } from 'react';
import { resolveNightEliminations, useGameStore } from '../../store/gameStore';
import { ROLE_MAP, WOLF_ROLE_IDS } from '../../data/roles';
import '../../styles/night.css';

export default function NightPhase() {
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
  const setProtectedPlayerIdStore = useGameStore((s) => s.setProtectedPlayerId);

  const [witchSave, setWitchSave] = useState(false);
  const [witchKill, setWitchKill] = useState('');
  const [wolfVictim, setWolfVictim] = useState('');
  const [protectorTarget, setProtectorTarget] = useState('');
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

  const allStepsDone = currentNightStepIndex >= nightSteps.length;
  const currentStep = nightSteps[currentNightStepIndex];
  const currentRole = currentStep ? ROLE_MAP[currentStep.roleId] : null;

  const witchHealUsed = usedGameAbilities.includes('witch_heal');
  const witchPoisonUsed = usedGameAbilities.includes('witch_poison');
  const infectPereUsed = usedGameAbilities.includes('infect_pere');

  // Has any wolf-aligned player been eliminated already?
  const anyWolfEliminated = allPlayers.some(
    (p) => !p.isAlive && (WOLF_ROLE_IDS.includes(p.roleId) || infectedPlayerIds.includes(p.id))
  );

  // Alive pure wolves (not white werewolf) for White Werewolf target
  const alivePureWolves = players.filter(
    (p) => WOLF_ROLE_IDS.includes(p.roleId) && p.roleId !== 'white_werewolf'
  );

  const isWolfAligned = (p: typeof players[0]) =>
    WOLF_ROLE_IDS.includes(p.roleId) ||
    (p.roleId === 'wolf_dog' && wolfDogChoiceStore === 'werewolf') ||
    (p.roleId === 'wild_child' && wildChildTransformed) ||
    infectedPlayerIds.includes(p.id);

  const wolfTargets = players.filter((p) => !isWolfAligned(p));
  const cupidIds = players.filter((p) => p.roleId === 'cupid').map((p) => p.id);
  const wildChildId = players.find((p) => p.roleId === 'wild_child')?.id ?? null;
  const protectablePlayers = players.filter((p) => p.id !== lastProtectedPlayerId);
  const protectedPlayer = protectedPlayerId
    ? allPlayers.find((p) => p.id === protectedPlayerId) ?? null
    : null;
  const protectedWolfTarget = protectedPlayerId
    ? wolfTargets.find((p) => p.id === protectedPlayerId) ?? null
    : null;
  const currentWolfTargets = wolfTargets.filter((p) => p.id !== protectedPlayerId);
  const bigBadWolfTargets = players.filter(
    (p) => p.id !== wolfVictim && !eliminatedThisNight.includes(p.id) && !isWolfAligned(p)
  );
  const protectedBigBadTarget = protectedPlayerId
    ? bigBadWolfTargets.find((p) => p.id === protectedPlayerId) ?? null
    : null;
  const currentBigBadTargets = bigBadWolfTargets.filter((p) => p.id !== protectedPlayerId);
  const canCompleteStep =
    currentRole?.id !== 'protector' ||
    protectablePlayers.length === 0 ||
    protectablePlayers.some((p) => p.id === protectorTarget);
  const nightResolutionPreview = useMemo(
    () => resolveNightEliminations(allPlayers, eliminatedThisNight, infectedPlayerIds, loversIds),
    [allPlayers, eliminatedThisNight, infectedPlayerIds, loversIds]
  );

  const resetLocalState = () => {
    setWolfVictim('');
    setProtectorTarget('');
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
  };

  const handleCompleteStep = () => {
    if (!currentRole) return;
    if (!canCompleteStep) return;

    if (currentRole.id === 'protector') {
      const validTarget = protectablePlayers.find((p) => p.id === protectorTarget);
      setProtectedPlayerIdStore(validTarget ? protectorTarget : null);
    }

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
      const toEnchant = [pipedP1, pipedP2].filter(Boolean);
      if (toEnchant.length > 0) addEnchanted(toEnchant);
    }

    completeNightStep();
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
            <h3>{currentRole.nameFr} wakes up</h3>
            <div className="role-wake-badges">
              {currentRole.firstNightOnly && <span className="badge badge-once">First Night Only</span>}
              {currentRole.everyOtherNight && <span className="badge badge-once">Every Other Night</span>}
              {currentRole.oddNightsOnly && <span className="badge badge-once">Nights 1, 3, 5&hellip;</span>}
              {currentRole.nightAction?.isOneTime && <span className="badge badge-once">One-Time Ability</span>}
            </div>
          </div>
        </div>

        <div className="night-instruction">{currentRole.nightAction?.description}</div>

        {/* Werewolf: pick victim */}
        {currentRole.id === 'protector' && (
          <div className="night-input">
            {lastProtectedPlayerId && (
              <p className="protect-note">
                🕘 Last night&apos;s protection: <strong>{allPlayers.find((p) => p.id === lastProtectedPlayerId)?.name ?? 'Unknown'}</strong>. You cannot protect the same player twice in a row.
              </p>
            )}
            {protectablePlayers.length === 0 ? (
              <div className="used-banner">🛡️ No valid protection target remains tonight.</div>
            ) : (
              <>
                <label>🛡️ Protector guards:</label>
                <select value={protectorTarget} onChange={(e) => setProtectorTarget(e.target.value)}>
                  <option value="">&mdash; Select player &mdash;</option>
                  {protectablePlayers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </>
            )}
          </div>
        )}

        {/* Werewolf: pick victim */}
        {currentRole.id === 'werewolf' && (
          <div className="night-input">
            {protectedPlayer && (
              <p className="protected-banner">🛡️ Protected tonight: <strong>{protectedPlayer.name}</strong></p>
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
              ? <p className="witch-victim-info">&#128054; Tonight&apos;s wolf victim: <strong>{currentVictimName}</strong></p>
              : <p className="witch-victim-info">&#127769; No wolf victim selected yet.</p>}
            {infectPereUsed ? (
              <div className="used-banner">&#9760;&#65039; Infect ability already used this game.</div>
            ) : (
              <>
                <label>&#129440; Infect instead of killing (ONCE PER GAME):</label>
                <select value={infectTarget} onChange={(e) => setInfectTarget(e.target.value)}>
                  <option value="">&mdash; Do not infect &mdash;</option>
                  {wolfTargets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {infectTarget && (
                  <p className="infect-note">
                    &#9888;&#65039; If infected, <strong>{players.find((p) => p.id === infectTarget)?.name}</strong> stays alive and secretly joins the wolves.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Big Bad Wolf: optional extra kill */}
        {currentRole.id === 'big_bad_wolf' && (
          <div className="night-input">
            {protectedPlayer && (
              <p className="protected-banner">🛡️ Protected tonight: <strong>{protectedPlayer.name}</strong></p>
            )}
            {anyWolfEliminated ? (
              <div className="used-banner">&#9888;&#65039; A wolf has been eliminated &mdash; Big Bad Wolf&apos;s extra kill power is GONE.</div>
            ) : (
              <>
                <label>&#128023; OPTIONAL extra victim (while no wolf eliminated):</label>
                <select value={bigBadWolfExtra} onChange={(e) => setBigBadWolfExtra(e.target.value)}>
                  <option value="">&mdash; Skip extra kill &mdash;</option>
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
            <label>&#11035;&#65039; OPTIONAL &mdash; devour one of the other werewolves:</label>
            <select value={whiteWolfTarget} onChange={(e) => setWhiteWolfTarget(e.target.value)}>
              <option value="">&mdash; Skip &mdash;</option>
              {alivePureWolves.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {alivePureWolves.length === 0 && <p className="infect-note">No other werewolves are alive.</p>}
          </div>
        )}

        {/* Seer: DM-only card peek */}
        {currentRole.id === 'seer' && (
          <div className="night-input">
            <label>&#128302; Seer looks at player:</label>
            <select value={seerTarget} onChange={(e) => setSeerTarget(e.target.value)}>
              <option value="">&mdash; Select player &mdash;</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {seerTarget && (() => {
              const target = allPlayers.find((p) => p.id === seerTarget);
              const targetRole = target ? ROLE_MAP[target.roleId] : null;
              return targetRole ? (
                <div className="seer-reveal">
                  <strong>DM only:</strong> {target?.name} is {targetRole.emoji}{' '}
                  <strong>{targetRole.nameFr}</strong>{' '}
                  <span className={`camp-badge camp-${targetRole.camp}`}>{targetRole.camp}</span>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Witch */}
        {currentRole.id === 'witch' && (
          <div className="night-input">
            {currentVictimName
              ? <p className="witch-victim-info">&#128054; Wolf victim tonight: <strong>{currentVictimName}</strong></p>
              : <p className="witch-victim-info">&#127769; No wolf victim tonight.</p>}
            <label className="witch-option">
              <input type="checkbox" checked={witchSave} onChange={(e) => setWitchSave(e.target.checked)} disabled={witchHealUsed} />
              <span>&#128154; Use Healing Potion (save victim) {witchHealUsed && <span className="used-badge">USED</span>}</span>
            </label>
            <label className="witch-option">
              <span>&#9760;&#65039; Use Death Potion on:</span>
              {witchPoisonUsed ? <span className="used-badge">USED</span> : (
                <select value={witchKill} onChange={(e) => setWitchKill(e.target.value)}>
                  <option value="">&mdash; None &mdash;</option>
                  {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
            </label>
          </div>
        )}

        {/* Cupid: link lovers */}
        {currentRole.id === 'cupid' && round === 1 && (
          <div className="night-input">
            <label>&#128152; Cupid links these two lovers:</label>
            <div className="lovers-row">
              <select value={loversP1} onChange={(e) => setLoversP1(e.target.value)}>
                <option value="">&mdash; Player 1 &mdash;</option>
                {players
                  .filter((p) => p.id !== loversP2 && !cupidIds.includes(p.id))
                  .map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <span>&#128152;</span>
              <select value={loversP2} onChange={(e) => setLoversP2(e.target.value)}>
                <option value="">&mdash; Player 2 &mdash;</option>
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
            <label>&#128021; Wolf-Dog secretly chooses their side:</label>
            <div className="choice-buttons">
              <button
                className={`choice-btn ${wolfDogChoice === 'villager' ? 'selected-village' : ''}`}
                onClick={() => setWolfDogChoiceLocal('villager')}
              >&#128104;&zwj;&#127806; Villager</button>
              <button
                className={`choice-btn ${wolfDogChoice === 'werewolf' ? 'selected-wolf' : ''}`}
                onClick={() => setWolfDogChoiceLocal('werewolf')}
              >&#128054; Werewolf</button>
            </div>
            {wolfDogChoice === 'werewolf' && (
              <p className="infect-note">&#128054; Wolf-Dog joins the wolves! They will wake with the pack from next night.</p>
            )}
          </div>
        )}

        {/* Wild Child: pick model */}
        {currentRole.id === 'wild_child' && (
          <div className="night-input">
            <label>&#129536; Wild Child secretly points to their Role Model:</label>
            <select value={wildChildModel} onChange={(e) => setWildChildModelLocal(e.target.value)}>
              <option value="">&mdash; Select model &mdash;</option>
              {players.filter((p) => p.id !== wildChildId).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {wildChildModel && (
              <p className="infect-note">
                If <strong>{players.find((p) => p.id === wildChildModel)?.name}</strong> dies, Wild Child becomes a Werewolf.
              </p>
            )}
          </div>
        )}

        {/* Sisters: acknowledgment */}
        {currentRole.id === 'soeurs' && (
          <div className="night-input">
            <p className="witch-victim-info">
              &#128111;&#65039; The Two Sisters open their eyes and recognise each other.
              {round === 1 ? ' This is their first meeting.' : ' They communicate silently.'}
            </p>
            <p className="infect-note">No DM action required &mdash; let them see each other, then close eyes again.</p>
          </div>
        )}

        {/* Pied Piper: enchant 2 */}
        {currentRole.id === 'pied_piper' && (
          <div className="night-input">
            <label>&#127926; Pied Piper enchants 2 players:</label>
            <div className="lovers-row">
              <select value={pipedP1} onChange={(e) => setPipedP1(e.target.value)}>
                <option value="">&mdash; Player 1 &mdash;</option>
                {players.filter((p) => p.id !== pipedP2).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <span>&#127926;</span>
              <select value={pipedP2} onChange={(e) => setPipedP2(e.target.value)}>
                <option value="">&mdash; Player 2 &mdash;</option>
                {players.filter((p) => p.id !== pipedP1).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <p className="infect-note">Enchanted players acknowledge secretly (e.g. thumb up under the table).</p>
          </div>
        )}

        {/* Raven: curse a player (+2 votes next day) */}
        {currentRole.id === 'raven' && (
          <div className="night-input">
            <label>&#129413; Raven places a curse on (optional):</label>
            <select value={ravenTarget} onChange={(e) => setRavenTarget(e.target.value)}>
              <option value="">&mdash; No curse this night &mdash;</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {ravenTarget && (() => {
              const cursedName = players.find((p) => p.id === ravenTarget)?.name;
              return (
                <p className="infect-note">
                  &#9760;&#65039; <strong>{cursedName}</strong> will have +2 votes against them tomorrow.
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
          <h2>Night Phase &mdash; Round {round}</h2>
          <p className="night-subtitle">All players close their eyes.</p>
        </div>
      </div>

      <div className="night-steps-bar">
        {nightSteps.map((step, i) => {
          const r = ROLE_MAP[step.roleId];
          return (
            <div
              key={i}
              className={`step-pip ${step.completed ? 'done' : ''} ${i === currentNightStepIndex ? 'active' : ''}`}
              title={r?.nameFr}
            >
              {r?.emoji}
            </div>
          );
        })}
      </div>

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
              Eliminated:{' '}
              <strong>
                {nightResolutionPreview.finalEliminated
                  .map((id) => allPlayers.find((p) => p.id === id)?.name)
                  .join(', ')}
              </strong>
            </p>
          )}
          <button
            className="btn btn-primary btn-large"
            data-testid="reveal-day"
            onClick={applyNightResults}
          >
            &#127748; Reveal Day
          </button>
        </div>
      )}
    </div>
  );
}
