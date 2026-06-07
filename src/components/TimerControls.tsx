import { Pause, Play, RotateCcw, Square } from 'lucide-react'
import type { FocusStatus } from '../types/focus'

interface TimerControlsProps {
  status: FocusStatus
  isStartCountdownActive?: boolean
  onPause: () => void
  onReset: () => void
  onResume: () => void
  onStart: () => void
  onStop: () => void
}

export function TimerControls({
  status,
  isStartCountdownActive = false,
  onPause,
  onReset,
  onResume,
  onStart,
  onStop,
}: TimerControlsProps) {
  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const startLabel = status === 'completed' ? 'Start new session' : 'Start'
  const resetLabel = isStartCountdownActive ? 'Cancel countdown' : 'Reset'

  return (
    <div className="timer-controls" aria-label="Timer controls">
      {(status === 'idle' || status === 'completed') &&
      !isStartCountdownActive ? (
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

      {isRunning || isPaused ? (
        <button
          aria-label="Stop and save session"
          className="secondary-button"
          onClick={onStop}
          title="Stop and save session"
          type="button"
        >
          <Square size={17} aria-hidden="true" />
          <span className="control-label">Stop</span>
        </button>
      ) : null}

      <button
        className="ghost-button"
        disabled={status === 'idle' && !isStartCountdownActive}
        onClick={onReset}
        aria-label={
          status === 'running' || status === 'paused'
            ? 'Reset and discard session'
            : resetLabel
        }
        title={
          status === 'running' || status === 'paused'
            ? 'Reset and discard session'
            : resetLabel
        }
        type="button"
      >
        <RotateCcw size={18} aria-hidden="true" />
        <span className="control-label">
          {status === 'running' || status === 'paused' ? 'Discard' : resetLabel}
        </span>
      </button>
    </div>
  )
}
