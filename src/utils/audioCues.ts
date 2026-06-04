type Tone = {
  delayMs: number
  durationMs: number
  frequency: number
  gain?: number
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

async function playToneSequence(soundEnabled: boolean, tones: Tone[]) {
  if (!soundEnabled) {
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

    tones.forEach(({ delayMs, durationMs, frequency, gain = 0.05 }) => {
      const startTime = now + delayMs / 1000
      const endTime = startTime + durationMs / 1000
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

export function playCountdownBeep(soundEnabled: boolean) {
  void playToneSequence(soundEnabled, [
    { delayMs: 0, durationMs: 95, frequency: 640, gain: 0.038 },
  ])
}

export async function playStartChime(soundEnabled: boolean) {
  await playToneSequence(soundEnabled, [
    { delayMs: 0, durationMs: 120, frequency: 660, gain: 0.043 },
    { delayMs: 130, durationMs: 170, frequency: 880, gain: 0.036 },
  ])

  if (soundEnabled) {
    await wait(330)
  }
}

export function playCompletionChime(soundEnabled: boolean) {
  void playToneSequence(soundEnabled, [
    { delayMs: 0, durationMs: 120, frequency: 523.25, gain: 0.042 },
    { delayMs: 120, durationMs: 150, frequency: 659.25, gain: 0.038 },
    { delayMs: 260, durationMs: 230, frequency: 783.99, gain: 0.034 },
  ])
}
