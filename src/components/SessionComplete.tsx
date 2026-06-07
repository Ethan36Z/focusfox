import { Sparkles } from 'lucide-react'
import type { CompletedSession } from '../types/focus'
import {
  getActualDurationSeconds,
  getReportedFocusPercent,
} from '../utils/sessionMetrics'
import { formatTime } from '../utils/time'

interface SessionCompleteProps {
  session: CompletedSession
  onChooseNext: () => void
  onViewDetails: () => void
}

export function SessionComplete({
  session,
  onChooseNext,
  onViewDetails,
}: SessionCompleteProps) {
  const actualDurationSeconds = getActualDurationSeconds(session)
  const focusRatio = Math.round(getReportedFocusPercent(session))
  const isStopped = session.status === 'stopped'

  return (
    <section className="completion-card" aria-labelledby="complete-title">
      <div className="completion-icon">
        <Sparkles size={24} aria-hidden="true" />
      </div>
      <h2 id="complete-title">{isStopped ? 'Session saved' : 'Well done!'}</h2>
      <div className="completion-facts">
        <span>
          <strong>{formatTime(actualDurationSeconds)}</strong>
          actual time
        </span>
        <span title="Based on recorded distraction time.">
          <strong>{focusRatio}%</strong>
          reported focus
        </span>
      </div>
      <div className="completion-actions">
        <button className="secondary-button" onClick={onViewDetails} type="button">
          View details
        </button>
        <button
          className="primary-button"
          onClick={onChooseNext}
          type="button"
        >
          Next session
        </button>
      </div>
    </section>
  )
}
