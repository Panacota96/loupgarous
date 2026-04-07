import { useState } from 'react';
import { ROLES, getRoleTexts, getRoleName } from '../../data/roles';
import { getCampLabel, useI18n } from '../../i18n';
import '../../styles/roles.css';

export default function RoleReference() {
  const { language, t } = useI18n();
  const [filter, setFilter] = useState<'all' | 'night' | 'day'>('all');

  const filtered = ROLES.filter((r) => {
    if (filter === 'night') return r.nightOrder !== null;
    if (filter === 'day') return r.dayTrigger || r.revealTrigger;
    return true;
  });

  return (
    <div className="role-reference">
      <h3>{t.roles.referenceTitle}</h3>
      <div className="role-filter-tabs">
        <button
          className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t.roles.filters.all}
        </button>
        <button
          className={`tab-btn ${filter === 'night' ? 'active' : ''}`}
          onClick={() => setFilter('night')}
        >
          {t.roles.filters.night}
        </button>
        <button
          className={`tab-btn ${filter === 'day' ? 'active' : ''}`}
          onClick={() => setFilter('day')}
        >
          {t.roles.filters.day}
        </button>
      </div>
      <div className="role-cards-list">
        {filtered.map((r) => {
          const text = getRoleTexts(r, language);
          const name = getRoleName(r, language);
          return (
            <div key={r.id} className={`role-ref-card camp-${r.camp}`}>
              <div className="rrc-header">
                <span className="rrc-emoji">{r.emoji}</span>
                <div>
                  <strong>{name}</strong>
                </div>
                <span className={`camp-tag camp-${r.camp}`}>{getCampLabel(r.camp, language)}</span>
              </div>
              <p className="rrc-desc">{text.description}</p>
              {text.nightActionDescription && (
                <div className="rrc-action night-action">
                  🌙 <strong>{t.roles.labels.night}:</strong> {text.nightActionDescription}
                  {r.firstNightOnly && <span className="badge badge-once"> ({t.roles.labels.firstNightOnly})</span>}
                  {r.nightAction?.isOneTime && <span className="badge badge-once"> ({t.roles.labels.oneTime})</span>}
                  {r.everyOtherNight && <span className="badge badge-once"> ({t.roles.labels.everyOtherNight})</span>}
                  {r.oddNightsOnly && <span className="badge badge-once"> ({t.roles.labels.oddNightsOnly})</span>}
                </div>
              )}
              {text.dayTrigger && (
                <div className="rrc-action day-action">
                  ☀️ <strong>{t.roles.labels.day}:</strong> {text.dayTrigger}
                </div>
              )}
              {text.revealTrigger && (
                <div className="rrc-action reveal-action">
                  ⚡ <strong>{t.roles.labels.reveal}:</strong> {text.revealTrigger}
                </div>
              )}
              {text.optionalRule && (
                <div className="rrc-action optional-action">
                  ⚙️ <strong>{t.roles.labels.optional}:</strong> {text.optionalRule}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
