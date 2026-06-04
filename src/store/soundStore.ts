import { create } from 'zustand'

const SOUND_ENABLED_KEY = 'focusfox.soundEnabled'
const SOUND_VOLUME_KEY = 'focusfox.soundVolume'
const DEFAULT_SOUND_VOLUME = 0.7

interface SoundState {
  soundEnabled: boolean
  soundVolume: number
  setSoundVolume: (volume: number) => void
  toggleSound: () => void
}

function clampSoundVolume(volume: number) {
  if (!Number.isFinite(volume)) {
    return DEFAULT_SOUND_VOLUME
  }

  return Math.min(1, Math.max(0, volume))
}

function loadSoundEnabled() {
  try {
    return localStorage.getItem(SOUND_ENABLED_KEY) !== 'false'
  } catch {
    return true
  }
}

function loadSoundVolume() {
  try {
    const raw = localStorage.getItem(SOUND_VOLUME_KEY)

    if (!raw) {
      return DEFAULT_SOUND_VOLUME
    }

    return clampSoundVolume(Number(raw))
  } catch {
    return DEFAULT_SOUND_VOLUME
  }
}

function saveSoundEnabled(soundEnabled: boolean) {
  try {
    localStorage.setItem(SOUND_ENABLED_KEY, String(soundEnabled))
  } catch {
    // Sound still works for the current session if storage is unavailable.
  }
}

function saveSoundVolume(soundVolume: number) {
  try {
    localStorage.setItem(SOUND_VOLUME_KEY, String(soundVolume))
  } catch {
    // Sound still works for the current session if storage is unavailable.
  }
}

export const useSoundStore = create<SoundState>((set, get) => ({
  soundEnabled: loadSoundEnabled(),
  soundVolume: loadSoundVolume(),

  setSoundVolume: (volume) => {
    const soundVolume = clampSoundVolume(volume)
    saveSoundVolume(soundVolume)
    set({ soundVolume })
  },

  toggleSound: () => {
    const soundEnabled = !get().soundEnabled
    saveSoundEnabled(soundEnabled)
    set({ soundEnabled })
  },
}))
