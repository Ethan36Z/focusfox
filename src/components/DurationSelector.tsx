import { useFocusStore } from '../store/focusStore'

const PRESET_MINUTES = [25, 45, 60]

export function DurationSelector() {
  const selectedMinutes = useFocusStore((state) => state.selectedMinutes)
  const customMinutes = useFocusStore((state) => state.customMinutes)
  const status = useFocusStore((state) => state.status)
  const setDuration = useFocusStore((state) => state.setDuration)
  const setCustomMinutes = useFocusStore((state) => state.setCustomMinutes)
  const isLocked = status === 'running' || status === 'paused'

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
    </section>
  )
}
