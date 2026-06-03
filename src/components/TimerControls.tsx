import { Pause, Play, RotateCcw } from 'lucide-react'
import type { FocusStatus } from '../types/focus'

interface TimerControlsProps {
  status: FocusStatus
  onPause: () => void
  onReset: () => void
  onResume: () => void
  onStart: () => void
}

export function TimerControls({
  status,
  onPause,
  onReset,
  onResume,
  onStart,
}: TimerControlsProps) {
  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const startLabel = status === 'completed' ? 'Start new session' : 'Start'

  return (
    <div className="timer-controls" aria-label="Timer controls">
      {status === 'idle' || status === 'completed' ? (
        <button
          aria-label={startLabel}
          className="primary-button"
          onClick={onStart}
          title={startLabel}
          type="button"
        >
          <Play size={18} aria-hidden="true" />
          <span className="control-label">{startLabel}</span>
        </button>
      ) : null}

      {isRunning ? (
        <button
          aria-label="Pause"
          className="secondary-button"
          onClick={onPause}
          title="Pause"
          type="button"
        >
          <Pause size={18} aria-hidden="true" />
          <span className="control-label">Pause</span>
        </button>
      ) : null}

      {isPaused ? (
        <button
          aria-label="Resume"
          className="primary-button"
          onClick={onResume}
          title="Resume"
          type="button"
        >
          <Play size={18} aria-hidden="true" />
          <span className="control-label">Resume</span>
        </button>
      ) : null}

      <button
        className="ghost-button"
        disabled={status === 'idle'}
        onClick={onReset}
        aria-label="Reset"
        title="Reset"
        type="button"
      >
        <RotateCcw size={18} aria-hidden="true" />
        <span className="control-label">Reset</span>
      </button>
    </div>
  )
}
