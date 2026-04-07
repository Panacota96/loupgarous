import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useI18n } from '../../i18n';
import '../../styles/timer.css';

export default function Timer() {
  const { t } = useI18n();
  const timerRunning = useGameStore((s) => s.timerRunning);
  const timerRemaining = useGameStore((s) => s.timerRemaining);
  const discussionTimeSeconds = useGameStore((s) => s.discussionTimeSeconds);
  const startTimer = useGameStore((s) => s.startTimer);
  const stopTimer = useGameStore((s) => s.stopTimer);
  const tickTimer = useGameStore((s) => s.tickTimer);
  const resetTimer = useGameStore((s) => s.resetTimer);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, tickTimer]);

  const minutes = Math.floor(timerRemaining / 60);
  const seconds = timerRemaining % 60;
  const progress = timerRemaining / discussionTimeSeconds;
  const isDanger = progress <= 0.25;
  const isWarning = progress <= 0.5 && !isDanger;

  return (
    <div className={`timer-widget ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}>
      <div className="timer-label">{t.timer.label}</div>
      <div className="timer-display">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="timer-bar-wrap">
        <div
          className="timer-bar"
          style={{ width: `${Math.max(0, progress * 100)}%` }}
        />
      </div>
      <div className="timer-controls">
        {!timerRunning ? (
          <button className="btn btn-green" onClick={startTimer} disabled={timerRemaining === 0}>
            {t.timer.start}
          </button>
        ) : (
          <button className="btn btn-yellow" onClick={stopTimer}>
            {t.timer.pause}
          </button>
        )}
        <button className="btn btn-ghost" onClick={resetTimer}>
          {t.timer.reset}
        </button>
      </div>
      {timerRemaining === 0 && (
        <div className="timer-alert">{t.timer.alert}</div>
      )}
    </div>
  );
}
