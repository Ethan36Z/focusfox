import type { CompletedSession } from '../types/focus'
import { getDistractionDurationSeconds } from '../utils/reasons'
import { formatDateTime, formatTime } from '../utils/time'

interface SessionHistoryProps {
  onOpenSession: (sessionId: string) => void
  sessions: CompletedSession[]
}

export function SessionHistory({ onOpenSession, sessions }: SessionHistoryProps) {
  return (
    <section className="panel history-panel" aria-labelledby="history-title">
      <div>
        <p className="eyebrow">Recent rhythm</p>
        <h2 id="history-title">Session history</h2>
      </div>

      {sessions.length === 0 ? (
        <p className="empty-state">Completed sessions will settle here.</p>
      ) : (
        <ul className="history-list">
          {sessions.slice(0, 8).map((session) => (
            <li key={session.id}>
              <button
                className="history-button"
                onClick={() => onOpenSession(session.id)}
                type="button"
              >
                <div>
                  <strong>{session.durationMinutes} min</strong>
                  <span>{formatDateTime(session.completedAt)}</span>
                </div>
                <span>
                  {session.distractions.length} episodes ·{' '}
                  {formatTime(
                    session.distractions.reduce(
                      (total, distraction) =>
                        total + getDistractionDurationSeconds(distraction),
                      0,
                    ),
                  )}{' '}
                  distracted
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
