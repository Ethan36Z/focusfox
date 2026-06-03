import type { DistractionEpisode } from '../types/focus'

const UNKNOWN_REASON = 'Unknown reason'

export function getDistractionReasonLabel(event: DistractionEpisode) {
  return (
    event.reasonLabel?.trim() ||
    event.reason?.trim() ||
    event.reasonId?.trim() ||
    UNKNOWN_REASON
  )
}

export function getDistractionStartSeconds(event: DistractionEpisode) {
  return event.startElapsedSeconds ?? event.elapsedSeconds ?? 0
}

export function getDistractionEndSeconds(event: DistractionEpisode) {
  return (
    event.endElapsedSeconds ??
    event.elapsedSeconds ??
    getDistractionStartSeconds(event)
  )
}

export function getDistractionDurationSeconds(event: DistractionEpisode) {
  return Math.max(
    0,
    event.durationSeconds ??
      getDistractionEndSeconds(event) - getDistractionStartSeconds(event),
  )
}
