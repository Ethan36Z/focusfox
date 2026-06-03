import { formatTime } from '../utils/time'

interface TimerDisplayProps {
  progressPercent: number
  remainingSeconds: number
  statusLabel: string
}

export function TimerDisplay({
  progressPercent,
  remainingSeconds,
  statusLabel,
}: TimerDisplayProps) {
  return (
    <section className="timer-card" aria-label="Focus timer">
      <p className="eyebrow">{statusLabel}</p>
      <div className="timer-time">{formatTime(remainingSeconds)}</div>
      <div
        aria-label={`${Math.round(progressPercent)} percent complete`}
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progressPercent)}
      >
        <span style={{ width: `${progressPercent}%` }} />
      </div>
      <p className="progress-copy">{Math.round(progressPercent)}% complete</p>
    </section>
  )
}
