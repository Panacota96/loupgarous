import { LANGUAGE_OPTIONS, useI18n } from '../i18n';
import '../styles/language-toggle.css';

interface Props {
  compact?: boolean;
}

export default function LanguageToggle({ compact = false }: Props) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className={`language-toggle ${compact ? 'compact' : ''}`}>
      <span className="language-toggle__label">{t.languageLabel}</span>
      <div className="language-toggle__buttons" role="group" aria-label={t.languageLabel}>
        {LANGUAGE_OPTIONS.map((opt) => (
          <button
            key={opt.code}
            type="button"
            className={`language-toggle__btn ${language === opt.code ? 'active' : ''}`}
            aria-pressed={language === opt.code}
            onClick={() => setLanguage(opt.code)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
