type Tone = {
  delayMs: number
  durationMs: number
  frequency: number
  maxGain?: number
}

type AudioContextConstructor = typeof AudioContext

declare global {
  interface Window {
    webkitAudioContext?: AudioContextConstructor
  }
}

let audioContext: AudioContext | null = null

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}

function getAudioContext() {
  if (typeof window === 'undefined') {
    return null
  }

  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext

  if (!AudioContextClass) {
    return null
  }

  audioContext ??= new AudioContextClass()
  return audioContext
}

function clampVolume(volume: number) {
  if (!Number.isFinite(volume)) {
    return 0.7
  }

  return Math.min(1, Math.max(0, volume))
}

async function playToneSequence(
  soundEnabled: boolean,
  soundVolume: number,
  tones: Tone[],
) {
  if (!soundEnabled) {
    return
  }

  const volume = clampVolume(soundVolume)

  if (volume <= 0) {
    return
  }

  try {
    const context = getAudioContext()

    if (!context) {
      return
    }

    if (context.state === 'suspended') {
      await context.resume()
    }

    const now = context.currentTime

    tones.forEach(({ delayMs, durationMs, frequency, maxGain = 0.1 }) => {
      const startTime = now + delayMs / 1000
      const endTime = startTime + durationMs / 1000
      const gain = maxGain * volume
      const oscillator = context.createOscillator()
      const envelope = context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, startTime)
      envelope.gain.setValueAtTime(0.0001, startTime)
      envelope.gain.exponentialRampToValueAtTime(gain, startTime + 0.015)
      envelope.gain.exponentialRampToValueAtTime(0.0001, endTime)

      oscillator.connect(envelope)
      envelope.connect(context.destination)
      oscillator.start(startTime)
      oscillator.stop(endTime + 0.02)
    })
  } catch {
    // Browsers may block or suspend audio. Visual countdown remains available.
  }
}

export function playCountdownBeep(soundEnabled: boolean, soundVolume: number) {
  void playToneSequence(soundEnabled, soundVolume, [
    { delayMs: 0, durationMs: 95, frequency: 640, maxGain: 0.12 },
  ])
}

export async function playStartChime(
  soundEnabled: boolean,
  soundVolume: number,
) {
  await playToneSequence(soundEnabled, soundVolume, [
    { delayMs: 0, durationMs: 120, frequency: 660, maxGain: 0.13 },
    { delayMs: 130, durationMs: 170, frequency: 880, maxGain: 0.1 },
  ])

  if (soundEnabled) {
    await wait(330)
  }
}

export function playCompletionChime(
  soundEnabled: boolean,
  soundVolume: number,
) {
  void playToneSequence(soundEnabled, soundVolume, [
    { delayMs: 0, durationMs: 120, frequency: 523.25, maxGain: 0.12 },
    { delayMs: 120, durationMs: 150, frequency: 659.25, maxGain: 0.1 },
    { delayMs: 260, durationMs: 230, frequency: 783.99, maxGain: 0.09 },
  ])
}
