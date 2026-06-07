import type { CompletedSession } from '../types/focus'
import { getDistractionDurationSeconds } from './reasons'

export function getPlannedDurationSeconds(session: CompletedSession) {
  return Math.max(
    0,
    session.plannedDurationSeconds ?? session.totalSeconds ?? 0,
  )
}

export function getActualDurationSeconds(session: CompletedSession) {
  return Math.max(
    0,
    session.actualDurationSeconds ?? session.totalSeconds ?? 0,
  )
}

export function getDistractedSeconds(session: CompletedSession) {
  return Math.max(
    0,
    session.distractedSeconds ??
      session.distractions.reduce(
        (total, distraction) =>
          total + getDistractionDurationSeconds(distraction),
        0,
      ),
  )
}

export function getNetFocusSeconds(session: CompletedSession) {
  return Math.max(
    0,
    session.netFocusSeconds ??
      getActualDurationSeconds(session) - getDistractedSeconds(session),
  )
}

export function getReportedFocusPercent(session: CompletedSession) {
  const actualDurationSeconds = getActualDurationSeconds(session)

  if (actualDurationSeconds <= 0) {
    return 100
  }

  return Math.max(
    0,
    Math.min(
      100,
      (getNetFocusSeconds(session) / actualDurationSeconds) * 100,
    ),
  )
}
