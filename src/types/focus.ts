export type FocusStatus = 'idle' | 'running' | 'paused' | 'completed'

export type DistractionReason =
  | 'Phone'
  | 'Thoughts'
  | 'Web'
  | 'Tired'
  | 'Hungry'
  | 'Other'

export type DistractionReasonLabel = string

export interface DistractionEvent {
  id: string
  reasonLabel: DistractionReasonLabel
  reason?: DistractionReasonLabel
  reasonId?: DistractionReasonLabel
  timestamp: string
  elapsedSeconds: number
}

export interface CompletedSession {
  id: string
  durationMinutes: number
  totalSeconds: number
  startedAt: string
  completedAt: string
  distractions: DistractionEvent[]
}

export const DISTRACTION_REASONS: DistractionReason[] = [
  'Phone',
  'Thoughts',
  'Web',
  'Tired',
  'Hungry',
  'Other',
]
