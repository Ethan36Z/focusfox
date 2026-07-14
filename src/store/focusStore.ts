import { create } from 'zustand'
import type {
  ActiveDistractionEpisode,
  CompletedSession,
  DistractionEpisode,
  DistractionReasonLabel,
  FocusStatus,
} from '../types/focus'
import { DISTRACTION_REASONS } from '../types/focus'
import {
  clearCompletedSessions,
  loadCompletedSessions,
  loadCustomReasons,
  saveCompletedSessions,
  saveCustomReasons,
} from '../utils/storage'
import { minutesToSeconds } from '../utils/time'

interface FocusState {
  selectedMinutes: number
  customMinutes: number
  status: FocusStatus
  totalSeconds: number
  remainingSeconds: number
  startedAt: string | null
  lastTickAtMs: number | null
  distractions: DistractionEpisode[]
  activeDistractionEpisode: ActiveDistractionEpisode | null
  completedSession: CompletedSession | null
  completedSessions: CompletedSession[]
  customReasons: string[]
  showDetails: boolean
  setDuration: (minutes: number) => void
  setCustomMinutes: (minutes: number) => void
  startSession: () => void
  pauseSession: () => void
  resumeSession: () => void
  resetSession: () => void
  stopSession: () => void
  tick: () => void
  recordDistraction: (reasonLabel: DistractionReasonLabel) => void
  addCustomReason: (reasonLabel: string) => boolean
  removeCustomReason: (reasonLabel: string) => void
  openCompletedSession: (sessionId: string) => void
  clearHistory: () => void
  viewDetails: () => void
  startAnotherSession: () => void
  restoreFocusData: (
    completedSessions: CompletedSession[],
    customReasons: string[],
  ) => void
}

const DEFAULT_MINUTES = 25
const MAX_REASON_LENGTH = 24

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

function getElapsedSeconds(totalSeconds: number, remainingSeconds: number) {
  return Math.min(totalSeconds, Math.max(0, totalSeconds - remainingSeconds))
}

function startDistractionEpisode(
  reasonLabel: DistractionReasonLabel,
  elapsedSeconds: number,
): ActiveDistractionEpisode {
  return {
    id: createId('distraction'),
    reasonLabel,
    startElapsedSeconds: elapsedSeconds,
    startedAt: new Date().toISOString(),
  }
}

function closeDistractionEpisode(
  activeEpisode: ActiveDistractionEpisode,
  endElapsedSeconds: number,
  endedAt = new Date().toISOString(),
): DistractionEpisode {
  const safeEndElapsedSeconds = Math.max(
    activeEpisode.startElapsedSeconds,
    endElapsedSeconds,
  )

  return {
    ...activeEpisode,
    endElapsedSeconds: safeEndElapsedSeconds,
    durationSeconds:
      safeEndElapsedSeconds - activeEpisode.startElapsedSeconds,
    endedAt,
  }
}

function createCompletedSession(
  state: FocusState,
  status: CompletedSession['status'],
  completedAt: string,
  actualDurationSeconds: number,
  distractions: DistractionEpisode[],
): CompletedSession {
  const plannedDurationSeconds = state.totalSeconds
  const distractedSeconds = distractions.reduce(
    (total, distraction) => total + distraction.durationSeconds,
    0,
  )
  const netFocusSeconds = Math.max(0, actualDurationSeconds - distractedSeconds)

  return {
    id: createId('session'),
    durationMinutes: Math.round(actualDurationSeconds / 60),
    totalSeconds: actualDurationSeconds,
    plannedDurationSeconds,
    actualDurationSeconds,
    distractedSeconds,
    netFocusSeconds,
    status,
    startedAt: state.startedAt ?? completedAt,
    completedAt,
    distractions,
  }
}

function normalizeReasonLabel(reasonLabel: string) {
  return reasonLabel.trim().slice(0, MAX_REASON_LENGTH)
}

function hasReasonLabel(reasonLabel: string, customReasons: string[]) {
  const normalized = reasonLabel.toLocaleLowerCase()
  return [...DISTRACTION_REASONS, ...customReasons].some(
    (reason) => reason.toLocaleLowerCase() === normalized,
  )
}

export const useFocusStore = create<FocusState>((set, get) => ({
  selectedMinutes: DEFAULT_MINUTES,
  customMinutes: DEFAULT_MINUTES,
  status: 'idle',
  totalSeconds: minutesToSeconds(DEFAULT_MINUTES),
  remainingSeconds: minutesToSeconds(DEFAULT_MINUTES),
  startedAt: null,
  lastTickAtMs: null,
  distractions: [],
  activeDistractionEpisode: null,
  completedSession: null,
  completedSessions: loadCompletedSessions(),
  customReasons: loadCustomReasons(),
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
      activeDistractionEpisode: null,
      startedAt: null,
      lastTickAtMs: null,
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
      activeDistractionEpisode: null,
      startedAt: null,
      lastTickAtMs: null,
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
      lastTickAtMs: Date.now(),
      distractions: [],
      activeDistractionEpisode: null,
      completedSession: null,
      showDetails: false,
    })
  },

  pauseSession: () => {
    if (get().status !== 'running') {
      return
    }

    get().tick()

    if (get().status === 'running') {
      set({ status: 'paused', lastTickAtMs: null })
    }
  },

  resumeSession: () => {
    if (get().status === 'paused') {
      set({ status: 'running', lastTickAtMs: Date.now() })
    }
  },

  resetSession: () => {
    const totalSeconds = minutesToSeconds(get().selectedMinutes)

    set({
      status: 'idle',
      totalSeconds,
      remainingSeconds: totalSeconds,
      startedAt: null,
      lastTickAtMs: null,
      distractions: [],
      activeDistractionEpisode: null,
      completedSession: null,
      showDetails: false,
    })
  },

  stopSession: () => {
    if (get().status === 'running') {
      get().tick()
    }

    const state = get()

    if (state.status !== 'running' && state.status !== 'paused') {
      return
    }

    const completedAt = new Date().toISOString()
    const actualDurationSeconds = getElapsedSeconds(
      state.totalSeconds,
      state.remainingSeconds,
    )
    const distractions = state.activeDistractionEpisode
      ? [
          ...state.distractions,
          closeDistractionEpisode(
            state.activeDistractionEpisode,
            actualDurationSeconds,
            completedAt,
          ),
        ]
      : state.distractions
    const completedSession = createCompletedSession(
      state,
      'stopped',
      completedAt,
      actualDurationSeconds,
      distractions,
    )
    const completedSessions = persistCompletedSession(
      completedSession,
      state.completedSessions,
    )

    set({
      status: 'completed',
      remainingSeconds: Math.max(0, state.totalSeconds - actualDurationSeconds),
      lastTickAtMs: null,
      distractions,
      activeDistractionEpisode: null,
      completedSession,
      completedSessions,
      showDetails: false,
    })
  },

  tick: () => {
    const state = get()

    if (state.status !== 'running') {
      return
    }

    const now = Date.now()

    if (state.lastTickAtMs === null) {
      set({ lastTickAtMs: now })
      return
    }

    const elapsedSeconds = Math.max(
      0,
      Math.floor((now - state.lastTickAtMs) / 1000),
    )

    if (elapsedSeconds < 1) {
      return
    }

    const nextLastTickAtMs = state.lastTickAtMs + elapsedSeconds * 1000

    if (state.remainingSeconds > elapsedSeconds) {
      set({
        remainingSeconds: state.remainingSeconds - elapsedSeconds,
        lastTickAtMs: nextLastTickAtMs,
      })
      return
    }

    const completedAt = new Date(
      state.lastTickAtMs + state.remainingSeconds * 1000,
    ).toISOString()
    const distractions = state.activeDistractionEpisode
      ? [
          ...state.distractions,
          closeDistractionEpisode(
            state.activeDistractionEpisode,
            state.totalSeconds,
            completedAt,
          ),
        ]
      : state.distractions
    const completedSession = createCompletedSession(
      state,
      'completed',
      completedAt,
      state.totalSeconds,
      distractions,
    )
    const completedSessions = persistCompletedSession(
      completedSession,
      state.completedSessions,
    )

    set({
      status: 'completed',
      remainingSeconds: 0,
      lastTickAtMs: null,
      distractions,
      activeDistractionEpisode: null,
      completedSession,
      completedSessions,
      showDetails: false,
    })
  },

  recordDistraction: (reasonLabel) => {
    if (get().status === 'running') {
      get().tick()
    }

    const state = get()

    if (state.status !== 'running') {
      return
    }

    const elapsedSeconds = getElapsedSeconds(
      state.totalSeconds,
      state.remainingSeconds,
    )

    if (!state.activeDistractionEpisode) {
      set({
        activeDistractionEpisode: startDistractionEpisode(
          reasonLabel,
          elapsedSeconds,
        ),
      })
      return
    }

    const closedEpisode = closeDistractionEpisode(
      state.activeDistractionEpisode,
      elapsedSeconds,
    )
    const distractions = [...state.distractions, closedEpisode]

    if (state.activeDistractionEpisode.reasonLabel === reasonLabel) {
      set({
        distractions,
        activeDistractionEpisode: null,
      })
      return
    }

    set({
      distractions,
      activeDistractionEpisode: startDistractionEpisode(
        reasonLabel,
        elapsedSeconds,
      ),
    })
  },

  addCustomReason: (reasonLabel) => {
    const label = normalizeReasonLabel(reasonLabel)

    if (!label || hasReasonLabel(label, get().customReasons)) {
      return false
    }

    const customReasons = [...get().customReasons, label]
    saveCustomReasons(customReasons)
    set({ customReasons })
    return true
  },

  removeCustomReason: (reasonLabel) => {
    const customReasons = get().customReasons.filter(
      (reason) =>
        reason.toLocaleLowerCase() !== reasonLabel.trim().toLocaleLowerCase(),
    )

    saveCustomReasons(customReasons)
    set({ customReasons })
  },

  openCompletedSession: (sessionId) => {
    const completedSession = get().completedSessions.find(
      (session) => session.id === sessionId,
    )

    if (completedSession) {
      set({
        completedSession,
        showDetails: true,
        status: 'completed',
        totalSeconds: completedSession.totalSeconds,
        remainingSeconds: 0,
        distractions: completedSession.distractions,
        activeDistractionEpisode: null,
        startedAt: completedSession.startedAt,
        lastTickAtMs: null,
      })
    }
  },

  clearHistory: () => {
    clearCompletedSessions()
    set({
      completedSessions: [],
      completedSession: null,
      showDetails: false,
    })
  },

  viewDetails: () => set({ showDetails: true }),

  startAnotherSession: () => {
    const totalSeconds = minutesToSeconds(get().selectedMinutes)

    set({
      status: 'idle',
      totalSeconds,
      remainingSeconds: totalSeconds,
      startedAt: null,
      lastTickAtMs: null,
      distractions: [],
      activeDistractionEpisode: null,
      completedSession: null,
      showDetails: false,
    })
  },

  restoreFocusData: (completedSessions, customReasons) => {
    const normalizedReasons = customReasons
      .map(normalizeReasonLabel)
      .filter(Boolean)
    const uniqueReasons = Array.from(
      new Map(
        normalizedReasons.map((reason) => [
          reason.toLocaleLowerCase(),
          reason,
        ]),
      ).values(),
    )

    saveCompletedSessions(completedSessions)
    saveCustomReasons(uniqueReasons)
    set({
      status: 'idle',
      totalSeconds: minutesToSeconds(get().selectedMinutes),
      remainingSeconds: minutesToSeconds(get().selectedMinutes),
      startedAt: null,
      lastTickAtMs: null,
      distractions: [],
      activeDistractionEpisode: null,
      completedSession: null,
      completedSessions,
      customReasons: uniqueReasons,
      showDetails: false,
    })
  },
}))
