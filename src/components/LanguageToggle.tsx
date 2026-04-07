import { LANGUAGE_OPTIONS, useI18n } from '../i18n';
import '../styles/language-toggle.css';

interface Props {
  compact?: boolean;
  className?: string;
}

export default function LanguageToggle({ compact = false, className = '' }: Props) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      className={`language-toggle ${compact ? 'compact' : ''} ${className}`.trim()}
      role="group"
      aria-label={t.languageLabel}
    >
      <div className="language-toggle__buttons">
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
