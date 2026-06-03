import { create } from 'zustand'
import type {
  CompletedSession,
  DistractionReason,
  DistractionEvent,
  FocusStatus,
} from '../types/focus'
import { loadCompletedSessions, saveCompletedSessions } from '../utils/storage'
import { minutesToSeconds } from '../utils/time'

interface FocusState {
  selectedMinutes: number
  customMinutes: number
  status: FocusStatus
  totalSeconds: number
  remainingSeconds: number
  startedAt: string | null
  distractions: DistractionEvent[]
  completedSession: CompletedSession | null
  completedSessions: CompletedSession[]
  showDetails: boolean
  setDuration: (minutes: number) => void
  setCustomMinutes: (minutes: number) => void
  startSession: () => void
  pauseSession: () => void
  resumeSession: () => void
  resetSession: () => void
  tick: () => void
  recordDistraction: (reason: DistractionReason) => void
  viewDetails: () => void
  startAnotherSession: () => void
}

const DEFAULT_MINUTES = 25

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function persistCompletedSession(
  session: CompletedSession,
  existingSessions: CompletedSession[],
) {
  const nextSessions = [session, ...existingSessions].slice(0, 20)
  saveCompletedSessions(nextSessions)
  return nextSessions
}

export const useFocusStore = create<FocusState>((set, get) => ({
  selectedMinutes: DEFAULT_MINUTES,
  customMinutes: DEFAULT_MINUTES,
  status: 'idle',
  totalSeconds: minutesToSeconds(DEFAULT_MINUTES),
  remainingSeconds: minutesToSeconds(DEFAULT_MINUTES),
  startedAt: null,
  distractions: [],
  completedSession: null,
  completedSessions: loadCompletedSessions(),
  showDetails: false,

  setDuration: (minutes) => {
    const seconds = minutesToSeconds(minutes)

    set({
      selectedMinutes: minutes,
      customMinutes: minutes,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      status: 'idle',
      distractions: [],
      startedAt: null,
      completedSession: null,
      showDetails: false,
    })
  },

  setCustomMinutes: (minutes) => {
    const clampedMinutes = Math.min(180, Math.max(1, Math.round(minutes || 1)))
    const seconds = minutesToSeconds(clampedMinutes)

    set({
      selectedMinutes: clampedMinutes,
      customMinutes: clampedMinutes,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      status: 'idle',
      distractions: [],
      startedAt: null,
      completedSession: null,
      showDetails: false,
    })
  },

  startSession: () => {
    const totalSeconds = minutesToSeconds(get().selectedMinutes)

    set({
      status: 'running',
      totalSeconds,
      remainingSeconds: totalSeconds,
      startedAt: new Date().toISOString(),
      distractions: [],
      completedSession: null,
      showDetails: false,
    })
  },

  pauseSession: () => {
    if (get().status === 'running') {
      set({ status: 'paused' })
    }
  },

  resumeSession: () => {
    if (get().status === 'paused') {
      set({ status: 'running' })
    }
  },

  resetSession: () => {
    const totalSeconds = minutesToSeconds(get().selectedMinutes)

    set({
      status: 'idle',
      totalSeconds,
      remainingSeconds: totalSeconds,
      startedAt: null,
      distractions: [],
      completedSession: null,
      showDetails: false,
    })
  },

  tick: () => {
    const state = get()

    if (state.status !== 'running') {
      return
    }

    if (state.remainingSeconds > 1) {
      set({ remainingSeconds: state.remainingSeconds - 1 })
      return
    }

    const completedAt = new Date().toISOString()
    const completedSession: CompletedSession = {
      id: createId('session'),
      durationMinutes: Math.round(state.totalSeconds / 60),
      totalSeconds: state.totalSeconds,
      startedAt: state.startedAt ?? completedAt,
      completedAt,
      distractions: state.distractions,
    }
    const completedSessions = persistCompletedSession(
      completedSession,
      state.completedSessions,
    )

    set({
      status: 'completed',
      remainingSeconds: 0,
      completedSession,
      completedSessions,
      showDetails: false,
    })
  },

  recordDistraction: (reason) => {
    const state = get()

    if (state.status !== 'running') {
      return
    }

    const event: DistractionEvent = {
      id: createId('distraction'),
      reason,
      timestamp: new Date().toISOString(),
      elapsedSeconds: state.totalSeconds - state.remainingSeconds,
    }

    set({ distractions: [...state.distractions, event] })
  },

  viewDetails: () => set({ showDetails: true }),

  startAnotherSession: () => {
    const totalSeconds = minutesToSeconds(get().selectedMinutes)

    set({
      status: 'idle',
      totalSeconds,
      remainingSeconds: totalSeconds,
      startedAt: null,
      distractions: [],
      completedSession: null,
      showDetails: false,
    })
  },
}))
