import { useI18n } from '../../i18n';
import { ROLE_MAP, getRoleName } from '../../data/roles';

type StarterPreset = {
  id: string;
  title: string;
  description: string;
  players: number;
  roles: string[];
};

interface QuickGuideProps {
  onApplyPreset?: (preset: StarterPreset) => void;
}

export default function QuickGuide({ onApplyPreset }: QuickGuideProps) {
  const { t, language } = useI18n();
  const starterSets = t.quickGuide.starterSets as StarterPreset[];

  const renderPresetRoles = (preset: StarterPreset) => {
    const counts: Record<string, number> = {};
    preset.roles.forEach((id) => { counts[id] = (counts[id] ?? 0) + 1; });
    return Object.entries(counts)
      .map(([roleId, count]) => {
        const def = ROLE_MAP[roleId];
        if (!def) return null;
        const label = `${getRoleName(def, language)}${count > 1 ? ` ×${count}` : ''}`;
        return (
          <span key={roleId} className={`role-pill camp-${def.camp}`}>
            {def.emoji} {label}
          </span>
        );
      })
      .filter(Boolean);
  };

  return (
    <section className="setup-section quick-guide">
      <div className="guide-header">
        <div>
          <h2>{t.quickGuide.title}</h2>
          <p className="guide-subtitle">{t.quickGuide.subtitle}</p>
        </div>
      </div>

      <div className="guide-grid">
        <div className="guide-card">
          <h3>{t.quickGuide.balanceTitle}</h3>
          <ul className="guide-list">
            {t.quickGuide.balance.map((line, idx) => <li key={idx}>{line}</li>)}
          </ul>
        </div>

        <div className="guide-card">
          <h3>{t.quickGuide.difficultyTitle}</h3>
          <div className="guide-tags">
            <div className="guide-tag soft">
              {t.quickGuide.beginner}
            </div>
            <div className="guide-tag spicy">
              {t.quickGuide.spicy}
            </div>
          </div>
        </div>
      </div>

      <div className="guide-card ratio-card">
        <h3>{t.quickGuide.ratioTitle}</h3>
        <ul className="ratio-list">
          {t.quickGuide.ratios.map((line, idx) => <li key={idx}>{line}</li>)}
        </ul>
      </div>

      <div className="guide-card starter-card">
        <div className="starter-header">
          <div>
            <h3>{t.quickGuide.startersTitle}</h3>
            <p className="guide-subtitle">{t.quickGuide.startersSubtitle}</p>
          </div>
        </div>
        <div className="starter-grid">
          {starterSets.map((preset) => (
            <div key={preset.id} className="starter-pill">
              <div className="starter-pill__top">
                <div>
                  <p className="starter-title">{preset.title}</p>
                  <p className="starter-meta">{t.quickGuide.playersLabel(preset.players)}</p>
                </div>
                {onApplyPreset && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onApplyPreset(preset)}
                  >
                    {t.quickGuide.applyPreset}
                  </button>
                )}
              </div>
              <p className="starter-description">{preset.description}</p>
              <div className="starter-roles">{renderPresetRoles(preset)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
