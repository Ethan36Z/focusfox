import { Sparkles } from 'lucide-react'
import type { CompletedSession } from '../types/focus'

interface SessionCompleteProps {
  session: CompletedSession
  onStartAnother: () => void
  onViewDetails: () => void
}

export function SessionComplete({
  session,
  onStartAnother,
  onViewDetails,
}: SessionCompleteProps) {
  return (
    <section className="completion-card" aria-labelledby="complete-title">
      <div className="completion-icon">
        <Sparkles size={28} aria-hidden="true" />
      </div>
      <p className="eyebrow">Session complete</p>
      <h2 id="complete-title">You kept the promise. Nice and steady.</h2>
      <div className="completion-facts">
        <span>
          <strong>{session.durationMinutes}</strong>
          minutes focused
        </span>
        <span>
          <strong>{session.distractions.length}</strong>
          distractions noted
        </span>
      </div>
      <div className="completion-actions">
        <button className="secondary-button" onClick={onViewDetails} type="button">
          View details
        </button>
        <button
          className="primary-button"
          onClick={onStartAnother}
          type="button"
        >
          Start another session
        </button>
      </div>
    </section>
  )
}
