import { useState } from 'react';
import { ROLES } from '../../data/roles';
import '../../styles/roles.css';

export default function RoleReference() {
  const [filter, setFilter] = useState<'all' | 'night' | 'day'>('all');

  const filtered = ROLES.filter((r) => {
    if (filter === 'night') return r.nightOrder !== null;
    if (filter === 'day') return r.dayTrigger || r.revealTrigger;
    return true;
  });

  return (
    <div className="role-reference">
      <h3>📚 Role Reference</h3>
      <div className="role-filter-tabs">
        <button
          className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`tab-btn ${filter === 'night' ? 'active' : ''}`}
          onClick={() => setFilter('night')}
        >
          🌙 Night Actions
        </button>
        <button
          className={`tab-btn ${filter === 'day' ? 'active' : ''}`}
          onClick={() => setFilter('day')}
        >
          ☀️ Day Triggers
        </button>
      </div>
      <div className="role-cards-list">
        {filtered.map((r) => (
          <div key={r.id} className={`role-ref-card camp-${r.camp}`}>
            <div className="rrc-header">
              <span className="rrc-emoji">{r.emoji}</span>
              <div>
                <strong>{r.nameFr}</strong>
                <span className="rrc-name-en"> ({r.name})</span>
              </div>
              <span className={`camp-tag camp-${r.camp}`}>{r.camp}</span>
            </div>
            <p className="rrc-desc">{r.description}</p>
            {r.nightAction && (
              <div className="rrc-action night-action">
                🌙 <strong>Night:</strong> {r.nightAction.description}
                {r.firstNightOnly && <span className="badge badge-once"> (1st night only)</span>}
                {r.nightAction.isOneTime && <span className="badge badge-once"> (one-time)</span>}
              </div>
            )}
            {r.dayTrigger && (
              <div className="rrc-action day-action">
                ☀️ <strong>Day:</strong> {r.dayTrigger}
              </div>
            )}
            {r.revealTrigger && (
              <div className="rrc-action reveal-action">
                ⚡ <strong>On reveal/death:</strong> {r.revealTrigger}
              </div>
            )}
            {r.optionalRule && (
              <div className="rrc-action optional-action">
                ⚙️ <strong>Optional:</strong> {r.optionalRule}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
