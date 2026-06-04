import { create } from 'zustand'

const SOUND_ENABLED_KEY = 'focusfox.soundEnabled'

interface SoundState {
  soundEnabled: boolean
  toggleSound: () => void
}

function loadSoundEnabled() {
  try {
    return localStorage.getItem(SOUND_ENABLED_KEY) !== 'false'
  } catch {
    return true
  }
}

function saveSoundEnabled(soundEnabled: boolean) {
  try {
    localStorage.setItem(SOUND_ENABLED_KEY, String(soundEnabled))
  } catch {
    // Sound still works for the current session if storage is unavailable.
  }
}

export const useSoundStore = create<SoundState>((set, get) => ({
  soundEnabled: loadSoundEnabled(),

  toggleSound: () => {
    const soundEnabled = !get().soundEnabled
    saveSoundEnabled(soundEnabled)
    set({ soundEnabled })
  },
}))
