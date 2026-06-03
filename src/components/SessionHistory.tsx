import type { CompletedSession } from '../types/focus'
import { formatDateTime } from '../utils/time'

interface SessionHistoryProps {
  sessions: CompletedSession[]
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
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
              <div>
                <strong>{session.durationMinutes} min</strong>
                <span>{formatDateTime(session.completedAt)}</span>
              </div>
              <span>{session.distractions.length} distractions</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
