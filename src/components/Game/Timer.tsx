import { useEffect, useRef } from 'react';
import {
  DISCUSSION_TIME_STEP_SECONDS,
  MAX_DISCUSSION_TIME_SECONDS,
  MIN_DISCUSSION_TIME_SECONDS,
  useGameStore,
} from '../../store/gameStore';
import { useI18n } from '../../i18n';
import '../../styles/timer.css';

function formatTimer(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export default function Timer() {
  const { t } = useI18n();
  const timerRunning = useGameStore((s) => s.timerRunning);
  const timerRemaining = useGameStore((s) => s.timerRemaining);
  const discussionTimeSeconds = useGameStore((s) => s.discussionTimeSeconds);
  const startTimer = useGameStore((s) => s.startTimer);
  const stopTimer = useGameStore((s) => s.stopTimer);
  const tickTimer = useGameStore((s) => s.tickTimer);
  const resetTimer = useGameStore((s) => s.resetTimer);
  const adjustDiscussionTimer = useGameStore((s) => s.adjustDiscussionTimer);

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

  const totalSeconds = Math.max(MIN_DISCUSSION_TIME_SECONDS, discussionTimeSeconds);
  const progress = timerRemaining / totalSeconds;
  const isDanger = progress <= 0.25;
  const isWarning = progress <= 0.5 && !isDanger;
  const canDecrease = discussionTimeSeconds > MIN_DISCUSSION_TIME_SECONDS;
  const canIncrease = discussionTimeSeconds < MAX_DISCUSSION_TIME_SECONDS;

  return (
    <div className={`timer-widget ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}>
      <div className="timer-label">{t.timer.label}</div>
      <div className="timer-display" data-testid="timer-display">
        {formatTimer(timerRemaining)}
      </div>
      <div className="timer-bar-wrap">
        <div
          className="timer-bar"
          style={{ width: `${Math.max(0, progress * 100)}%` }}
        />
      </div>
      <div className="timer-adjust" aria-label={t.timer.adjustLabel}>
        <button
          className="timer-step-btn"
          type="button"
          onClick={() => adjustDiscussionTimer(-DISCUSSION_TIME_STEP_SECONDS)}
          disabled={!canDecrease}
          aria-label={t.timer.decrease}
          data-testid="timer-decrease"
        >
          -30s
        </button>
        <div className="timer-duration">
          <span>{t.timer.duration}</span>
          <strong data-testid="timer-duration">{formatTimer(discussionTimeSeconds)}</strong>
        </div>
        <button
          className="timer-step-btn"
          type="button"
          onClick={() => adjustDiscussionTimer(DISCUSSION_TIME_STEP_SECONDS)}
          disabled={!canIncrease}
          aria-label={t.timer.increase}
          data-testid="timer-increase"
        >
          +30s
        </button>
      </div>
      <div className="timer-controls">
        {!timerRunning ? (
          <button
            className="btn btn-green"
            onClick={startTimer}
            disabled={timerRemaining === 0}
            data-testid="timer-start"
          >
            {t.timer.start}
          </button>
        ) : (
          <button className="btn btn-yellow" onClick={stopTimer} data-testid="timer-pause">
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
