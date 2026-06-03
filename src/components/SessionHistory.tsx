import type { CompletedSession } from '../types/focus'
import { getDistractionDurationSeconds } from '../utils/reasons'
import { formatDateTime, formatTime } from '../utils/time'

interface SessionHistoryProps {
  onClearHistory: () => void
  onOpenSession: (sessionId: string) => void
  selectedSessionId: string | null
  sessions: CompletedSession[]
}

export function SessionHistory({
  onClearHistory,
  onOpenSession,
  selectedSessionId,
  sessions,
}: SessionHistoryProps) {
  function handleClearHistory() {
    if (window.confirm('Clear completed session history?')) {
      onClearHistory()
    }
  }

  return (
    <section className="panel history-panel" aria-labelledby="history-title">
      <div className="history-heading">
        <div>
          <p className="eyebrow">Recent rhythm</p>
          <h2 id="history-title">Session history</h2>
        </div>
        {sessions.length > 0 ? (
          <button
            className="clear-history-button"
            onClick={handleClearHistory}
            type="button"
          >
            Clear history
          </button>
        ) : null}
      </div>

      {sessions.length === 0 ? (
        <p className="empty-state">
          Completed sessions will settle here after a calm focus block.
        </p>
      ) : (
        <ul className="history-list">
          {sessions.slice(0, 8).map((session) => {
            const distractedSeconds = session.distractions.reduce(
              (total, distraction) =>
                total + getDistractionDurationSeconds(distraction),
              0,
            )

            return (
              <li key={session.id}>
                <button
                  className={
                    selectedSessionId === session.id
                      ? 'history-button selected'
                      : 'history-button'
                  }
                  onClick={() => onOpenSession(session.id)}
                  type="button"
                >
                  <div>
                    <strong>{session.durationMinutes} min</strong>
                    <span>{formatDateTime(session.completedAt)}</span>
                  </div>
                  <span>
                    {session.distractions.length} episodes ·{' '}
                    {formatTime(distractedSeconds)} distracted
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
