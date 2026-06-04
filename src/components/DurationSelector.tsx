import { Volume2, VolumeX } from 'lucide-react'
import { useFocusStore } from '../store/focusStore'
import { useSoundStore } from '../store/soundStore'

const PRESET_MINUTES = [25, 45, 60]

interface DurationSelectorProps {
  isStartCountdownActive?: boolean
}

export function DurationSelector({
  isStartCountdownActive = false,
}: DurationSelectorProps) {
  const selectedMinutes = useFocusStore((state) => state.selectedMinutes)
  const customMinutes = useFocusStore((state) => state.customMinutes)
  const status = useFocusStore((state) => state.status)
  const setDuration = useFocusStore((state) => state.setDuration)
  const setCustomMinutes = useFocusStore((state) => state.setCustomMinutes)
  const soundEnabled = useSoundStore((state) => state.soundEnabled)
  const soundVolume = useSoundStore((state) => state.soundVolume)
  const setSoundVolume = useSoundStore((state) => state.setSoundVolume)
  const toggleSound = useSoundStore((state) => state.toggleSound)
  const isLocked =
    status === 'running' || status === 'paused' || isStartCountdownActive
  const soundVolumePercent = Math.round(soundVolume * 100)

  return (
    <section className="panel duration-panel" aria-labelledby="duration-title">
      <div>
        <p className="eyebrow">Session length</p>
        <h2 id="duration-title">Choose a soft focus window</h2>
      </div>

      <div className="duration-options" aria-label="Focus duration">
        {PRESET_MINUTES.map((minutes) => (
          <button
            className={selectedMinutes === minutes ? 'pill active' : 'pill'}
            disabled={isLocked}
            key={minutes}
            onClick={() => setDuration(minutes)}
            type="button"
          >
            {minutes} min
          </button>
        ))}
      </div>

      <label className="custom-duration">
        <span>Custom</span>
        <input
          disabled={isLocked}
          min="1"
          max="180"
          onChange={(event) => setCustomMinutes(Number(event.target.value))}
          type="number"
          value={customMinutes}
        />
        <span>min</span>
      </label>

      <button
        aria-pressed={soundEnabled}
        className="sound-toggle"
        onClick={toggleSound}
        type="button"
      >
        {soundEnabled ? (
          <Volume2 size={16} aria-hidden="true" />
        ) : (
          <VolumeX size={16} aria-hidden="true" />
        )}
        <span>Sound {soundEnabled ? 'On' : 'Off'}</span>
      </button>

      <label
        className={soundEnabled ? 'sound-volume' : 'sound-volume muted'}
      >
        <span>Volume</span>
        <input
          aria-label="Session cue volume"
          max="100"
          min="0"
          onChange={(event) =>
            setSoundVolume(Number(event.target.value) / 100)
          }
          type="range"
          value={soundVolumePercent}
        />
        <strong>{soundVolumePercent}%</strong>
      </label>
    </section>
  )
}
