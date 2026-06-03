import type { CompletedSession } from '../types/focus'

const SESSIONS_KEY = 'focusfox.completedSessions'
const CUSTOM_REASONS_KEY = 'focusfox.customReasons'
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

export function clearCompletedSessions() {
  localStorage.removeItem(SESSIONS_KEY)
}

export function loadCustomReasons(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_REASONS_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((reason): reason is string => typeof reason === 'string')
      : []
  } catch {
    return []
  }
}

export function saveCustomReasons(reasons: string[]) {
  localStorage.setItem(CUSTOM_REASONS_KEY, JSON.stringify(reasons))
}
