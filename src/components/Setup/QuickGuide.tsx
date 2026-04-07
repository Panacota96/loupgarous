import { useI18n } from '../../i18n';

export default function QuickGuide() {
  const { t } = useI18n();
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
    </section>
  );
}
