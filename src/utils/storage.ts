import type { CompletedSession } from '../types/focus'

const SESSIONS_KEY = 'focusfox.completedSessions'
const MAX_SESSIONS = 20

export function loadCompletedSessions(): CompletedSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCompletedSessions(sessions: CompletedSession[]) {
  localStorage.setItem(
    SESSIONS_KEY,
    JSON.stringify(sessions.slice(0, MAX_SESSIONS)),
  )
}
