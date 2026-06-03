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
        <button className="primary-button" onClick={onStart} type="button">
          <Play size={18} aria-hidden="true" />
          {startLabel}
        </button>
      ) : null}

      {isRunning ? (
        <button className="secondary-button" onClick={onPause} type="button">
          <Pause size={18} aria-hidden="true" />
          Pause
        </button>
      ) : null}

      {isPaused ? (
        <button className="primary-button" onClick={onResume} type="button">
          <Play size={18} aria-hidden="true" />
          Resume
        </button>
      ) : null}

      <button
        className="ghost-button"
        disabled={status === 'idle'}
        onClick={onReset}
        type="button"
      >
        <RotateCcw size={18} aria-hidden="true" />
        Reset
      </button>
    </div>
  )
}
