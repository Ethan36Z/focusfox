type Tone = {
  delayMs: number
  durationMs: number
  frequency: number
  maxGain?: number
  type?: OscillatorType
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

function getEffectiveVolume(volume: number) {
  const clampedVolume = clampVolume(volume)

  return Math.min(1, Math.max(0, clampedVolume ** 0.58))
}

async function playToneSequence(
  soundEnabled: boolean,
  soundVolume: number,
  tones: Tone[],
) {
  if (!soundEnabled) {
    return
  }

  const volume = getEffectiveVolume(soundVolume)

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
    const master = context.createGain()
    const compressor = context.createDynamicsCompressor()

    master.gain.setValueAtTime(1, now)
    compressor.threshold.setValueAtTime(-18, now)
    compressor.knee.setValueAtTime(18, now)
    compressor.ratio.setValueAtTime(8, now)
    compressor.attack.setValueAtTime(0.004, now)
    compressor.release.setValueAtTime(0.12, now)
    master.connect(compressor)
    compressor.connect(context.destination)

    tones.forEach(
      ({ delayMs, durationMs, frequency, maxGain = 0.16, type = 'sine' }) => {
      const startTime = now + delayMs / 1000
      const endTime = startTime + durationMs / 1000
      const gain = maxGain * volume
      const oscillator = context.createOscillator()
      const envelope = context.createGain()

      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, startTime)
      envelope.gain.setValueAtTime(0.0001, startTime)
      envelope.gain.exponentialRampToValueAtTime(gain, startTime + 0.018)
      envelope.gain.setTargetAtTime(0.0001, endTime - 0.045, 0.018)

      oscillator.connect(envelope)
      envelope.connect(master)
      oscillator.start(startTime)
      oscillator.stop(endTime + 0.05)
    })
  } catch {
    // Browsers may block or suspend audio. Visual countdown remains available.
  }
}

export function playCountdownBeep(
  soundEnabled: boolean,
  soundVolume: number,
) {
  void playToneSequence(soundEnabled, soundVolume, [
    { delayMs: 0, durationMs: 120, frequency: 740, maxGain: 0.2, type: 'triangle' },
    { delayMs: 14, durationMs: 100, frequency: 1480, maxGain: 0.045 },
  ])
}

export function playTestSound(
  soundEnabled: boolean,
  soundVolume: number,
) {
  void playToneSequence(soundEnabled, soundVolume, [
    { delayMs: 0, durationMs: 110, frequency: 740, maxGain: 0.19, type: 'triangle' },
    { delayMs: 125, durationMs: 170, frequency: 987.77, maxGain: 0.16 },
    { delayMs: 260, durationMs: 200, frequency: 1318.51, maxGain: 0.13 },
  ])
}

export function playFinalWarningBeep(
  soundEnabled: boolean,
  soundVolume: number,
) {
  void playToneSequence(soundEnabled, soundVolume, [
    { delayMs: 0, durationMs: 125, frequency: 830.61, maxGain: 0.2, type: 'triangle' },
  ])
}

export async function playStartChime(
  soundEnabled: boolean,
  soundVolume: number,
) {
  await playToneSequence(soundEnabled, soundVolume, [
    { delayMs: 0, durationMs: 140, frequency: 659.25, maxGain: 0.18 },
    { delayMs: 120, durationMs: 190, frequency: 987.77, maxGain: 0.15 },
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
    { delayMs: 0, durationMs: 150, frequency: 523.25, maxGain: 0.2 },
    { delayMs: 130, durationMs: 180, frequency: 783.99, maxGain: 0.18 },
    { delayMs: 285, durationMs: 260, frequency: 1046.5, maxGain: 0.15 },
    { delayMs: 315, durationMs: 230, frequency: 1318.51, maxGain: 0.055 },
  ])
}
