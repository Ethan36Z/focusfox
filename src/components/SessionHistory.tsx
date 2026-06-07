import type { CompletedSession } from '../types/focus'
import {
  getActualDurationSeconds,
  getDistractedSeconds,
  getReportedFocusPercent,
} from '../utils/sessionMetrics'
import { formatDateTime, formatTime } from '../utils/time'

interface SessionHistoryProps {
  onClearHistory: () => void
  onOpenSession: (sessionId: string) => void
  selectedSessionId: string | null
  sessions: CompletedSession[]
}

function getFocusRatioClass(focusRatio: number) {
  if (focusRatio >= 90) {
    return 'high'
  }

  if (focusRatio >= 75) {
    return 'good'
  }

  if (focusRatio >= 50) {
    return 'okay'
  }

  return 'low'
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
            const actualDurationSeconds = getActualDurationSeconds(session)
            const distractedSeconds = getDistractedSeconds(session)
            const focusRatio = Math.round(getReportedFocusPercent(session))
            const isStopped = session.status === 'stopped'

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
                  <div className="history-main">
                    <strong>
                      {formatTime(actualDurationSeconds)}
                      {isStopped ? ' stopped' : ''}
                    </strong>
                    <span>{formatDateTime(session.completedAt)}</span>
                  </div>
                  <span className="history-meta">
                    {session.distractions.length} episodes -{' '}
                    {formatTime(distractedSeconds)} distracted
                  </span>
                  <span
                    className={`focus-ratio-pill ${getFocusRatioClass(
                      focusRatio,
                    )}`}
                    title={`Reported focus: ${focusRatio}%. Based on recorded distraction time.`}
                  >
                    {focusRatio}%
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
