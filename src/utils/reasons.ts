import type { DistractionEvent } from '../types/focus'

const UNKNOWN_REASON = 'Unknown reason'

export function getDistractionReasonLabel(event: DistractionEvent) {
  return (
    event.reasonLabel?.trim() ||
    event.reason?.trim() ||
    event.reasonId?.trim() ||
    UNKNOWN_REASON
  )
}
