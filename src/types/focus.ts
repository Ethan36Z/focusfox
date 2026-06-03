export type FocusStatus = 'idle' | 'running' | 'paused' | 'completed'

export type DistractionReason =
  | 'Phone'
  | 'Thoughts'
  | 'Web'
  | 'Tired'
  | 'Hungry'
  | 'Other'

export type DistractionReasonLabel = string

export interface ActiveDistractionEpisode {
  id: string
  reasonLabel: DistractionReasonLabel
  startElapsedSeconds: number
  startedAt: string
}

export interface DistractionEpisode extends ActiveDistractionEpisode {
  endElapsedSeconds: number
  durationSeconds: number
  endedAt: string
  reason?: DistractionReasonLabel
  reasonId?: DistractionReasonLabel
  timestamp?: string
  elapsedSeconds?: number
}

export interface CompletedSession {
  id: string
  durationMinutes: number
  totalSeconds: number
  startedAt: string
  completedAt: string
  distractions: DistractionEpisode[]
}

export const DISTRACTION_REASONS: DistractionReason[] = [
  'Phone',
  'Thoughts',
  'Web',
  'Tired',
  'Hungry',
  'Other',
]
