import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ROLE_MAP } from '../../data/roles';
import '../../styles/night.css';

export default function NightPhase() {
  const nightSteps = useGameStore((s) => s.nightSteps);
  const currentNightStepIndex = useGameStore((s) => s.currentNightStepIndex);
  const eliminatedThisNight = useGameStore((s) => s.eliminatedThisNight);
  const players = useGameStore((s) => s.players.filter((p) => p.isAlive));
  const usedGameAbilities = useGameStore((s) => s.usedGameAbilities);
  const round = useGameStore((s) => s.round);

  const completeNightStep = useGameStore((s) => s.completeNightStep);
  const setEliminatedThisNight = useGameStore((s) => s.setEliminatedThisNight);
  const recordAbilityUsed = useGameStore((s) => s.useGameAbility);
  const applyNightResults = useGameStore((s) => s.applyNightResults);

  const [witchSave, setWitchSave] = useState(false);
  const [witchKill, setWitchKill] = useState<string>('');
  const [wolfVictim, setWolfVictim] = useState<string>('');
  const [seerTarget, setSeerTarget] = useState<string>('');
  const [loversP1, setLoversP1] = useState<string>('');
  const [loversP2, setLoversP2] = useState<string>('');

  const setLovers = useGameStore((s) => s.setLovers);

  const allStepsDone = currentNightStepIndex >= nightSteps.length;

  const currentStep = nightSteps[currentNightStepIndex];
  const currentRole = currentStep ? ROLE_MAP[currentStep.roleId] : null;

  const witchHealUsed = usedGameAbilities.includes('witch_heal');
  const witchPoisonUsed = usedGameAbilities.includes('witch_poison');

  const handleCompleteStep = () => {
    if (!currentRole) return;

    // Apply effects for specific roles
    if (currentRole.id === 'werewolf') {
      if (wolfVictim) {
        setEliminatedThisNight([...eliminatedThisNight.filter(id => id !== wolfVictim), wolfVictim]);
      }
    }

    if (currentRole.id === 'witch') {
      if (witchSave && !witchHealUsed) {
        recordAbilityUsed('witch_heal');
        // Remove the wolf victim from eliminated list
        setEliminatedThisNight(eliminatedThisNight.filter((id) => id !== wolfVictim));
      }
      if (witchKill && !witchPoisonUsed) {
        recordAbilityUsed('witch_poison');
        setEliminatedThisNight([...eliminatedThisNight, witchKill]);
      }
    }

    if (currentRole.id === 'cupid' && loversP1 && loversP2 && round === 1) {
      setLovers(loversP1, loversP2);
    }

    completeNightStep();
    // reset local state
    setWolfVictim('');
    setSeerTarget('');
    setWitchSave(false);
    setWitchKill('');
  };

  const renderStepContent = () => {
    if (!currentRole) return null;

    return (
      <div className="night-step-content">
        <div className="role-wake">
          <span className="role-wake-emoji">{currentRole.emoji}</span>
          <div>
            <h3>{currentRole.nameFr} wakes up</h3>
            {currentRole.firstNightOnly && <span className="badge badge-once">First Night Only</span>}
            {currentRole.nightAction?.isOneTime && (
              <span className="badge badge-once">One-Time Action</span>
            )}
          </div>
        </div>

        <div className="night-instruction">
          {currentRole.nightAction?.description}
        </div>

        {/* Werewolf: pick victim */}
        {currentRole.id === 'werewolf' && (
          <div className="night-input">
            <label>🎯 Wolves choose their victim:</label>
            <select
              value={wolfVictim}
              onChange={(e) => setWolfVictim(e.target.value)}
            >
              <option value="">— Select target —</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Seer: look at card */}
        {currentRole.id === 'seer' && (
          <div className="night-input">
            <label>🔮 Seer looks at player:</label>
            <select
              value={seerTarget}
              onChange={(e) => setSeerTarget(e.target.value)}
            >
              <option value="">— Select player —</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {seerTarget && (() => {
              const store = useGameStore.getState();
              const allPlayers = store.players;
              const target = allPlayers.find((p) => p.id === seerTarget);
              const targetRole = target ? ROLE_MAP[target.roleId] : null;
              return targetRole ? (
                <div className="seer-reveal">
                  <strong>DM only:</strong> {target?.name} is {targetRole.emoji}{' '}
                  <strong>{targetRole.nameFr}</strong>{' '}
                  <span className={`camp-badge camp-${targetRole.camp}`}>
                    {targetRole.camp}
                  </span>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Witch */}
        {currentRole.id === 'witch' && (
          <div className="night-input">
            {wolfVictim || eliminatedThisNight.length > 0 ? (
              <p className="witch-victim-info">
                🐺 Wolf victim tonight:{' '}
                <strong>
                  {players.find((p) => p.id === (wolfVictim || eliminatedThisNight[0]))?.name ??
                    'Unknown'}
                </strong>
              </p>
            ) : (
              <p className="witch-victim-info">🌙 No wolf victim tonight.</p>
            )}

            <label className="witch-option">
              <input
                type="checkbox"
                checked={witchSave}
                onChange={(e) => setWitchSave(e.target.checked)}
                disabled={witchHealUsed}
              />
              <span>
                💚 Use Healing Potion (save victim){' '}
                {witchHealUsed && <span className="used-badge">USED</span>}
              </span>
            </label>

            <label className="witch-option">
              <span>☠️ Use Death Potion on:</span>
              {witchPoisonUsed ? (
                <span className="used-badge">USED</span>
              ) : (
                <select
                  value={witchKill}
                  onChange={(e) => setWitchKill(e.target.value)}
                >
                  <option value="">— None —</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>
        )}

        {/* Cupid: link lovers */}
        {currentRole.id === 'cupid' && round === 1 && (
          <div className="night-input">
            <label>💘 Cupid links these two lovers:</label>
            <div className="lovers-row">
              <select
                value={loversP1}
                onChange={(e) => setLoversP1(e.target.value)}
              >
                <option value="">— Player 1 —</option>
                {players.filter((p) => p.id !== loversP2).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <span>💘</span>
              <select
                value={loversP2}
                onChange={(e) => setLoversP2(e.target.value)}
              >
                <option value="">— Player 2 —</option>
                {players.filter((p) => p.id !== loversP1).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="night-phase">
      <div className="night-header">
        <span className="phase-icon">🌙</span>
        <div>
          <h2>Night Phase — Round {round}</h2>
          <p className="night-subtitle">All players close their eyes.</p>
        </div>
      </div>

      {/* Step progress */}
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

      {/* Current step */}
      {!allStepsDone ? (
        <>
          {renderStepContent()}
          <button className="btn btn-primary btn-large" onClick={handleCompleteStep}>
            ✅ Done — Next
          </button>
        </>
      ) : (
        <div className="night-summary">
          <h3>🌅 Night ends</h3>
          {eliminatedThisNight.length === 0 ? (
            <p>No one was eliminated tonight. 🕊️</p>
          ) : (
            <p>
              Eliminated:{' '}
              <strong>
                {eliminatedThisNight
                  .map(
                    (id) =>
                      useGameStore.getState().players.find((p) => p.id === id)?.name
                  )
                  .join(', ')}
              </strong>
            </p>
          )}
          <button className="btn btn-primary btn-large" onClick={applyNightResults}>
            🌄 Reveal Day
          </button>
        </div>
      )}
    </div>
  );
}
