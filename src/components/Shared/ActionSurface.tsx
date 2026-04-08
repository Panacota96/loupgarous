import type { ReactNode } from 'react';

interface MetricItem {
  label: string;
  value: string;
  tone?: 'neutral' | 'night' | 'day' | 'danger' | 'success';
}

interface ActionSurfaceProps {
  phase: 'prepare' | 'night' | 'day';
  title: string;
  subtitle?: string;
  metrics?: MetricItem[];
  quickPanel?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ActionSurface({
  phase,
  title,
  subtitle,
  metrics = [],
  quickPanel,
  footer,
  children,
  className = '',
}: ActionSurfaceProps) {
  return (
    <section className={`action-surface action-surface--${phase} ${className}`.trim()}>
      <header className="action-surface__header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="action-surface__subtitle">{subtitle}</p>}
        </div>
      </header>

      {metrics.length > 0 && (
        <div className="action-surface__metrics">
          {metrics.map((metric) => (
            <div
              key={`${metric.label}-${metric.value}`}
              className={`action-surface__metric action-surface__metric--${metric.tone ?? 'neutral'}`}
            >
              <span className="action-surface__metric-label">{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
      )}

      {quickPanel && <aside className="action-surface__quick-panel">{quickPanel}</aside>}

      <div className="action-surface__body">{children}</div>

      {footer && <footer className="action-surface__footer">{footer}</footer>}
    </section>
  );
}
