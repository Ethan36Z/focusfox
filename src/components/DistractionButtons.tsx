import { DISTRACTION_REASONS, type DistractionReason } from '../types/focus'

interface DistractionButtonsProps {
  disabled: boolean
  onRecord: (reason: DistractionReason) => void
}

export function DistractionButtons({
  disabled,
  onRecord,
}: DistractionButtonsProps) {
  return (
    <section className="panel" aria-labelledby="distraction-title">
      <div>
        <p className="eyebrow">Gentle check-in</p>
        <h2 id="distraction-title">Notice a distraction</h2>
      </div>
      <div className="reason-grid">
        {DISTRACTION_REASONS.map((reason) => (
          <button
            className="reason-button"
            disabled={disabled}
            key={reason}
            onClick={() => onRecord(reason)}
            type="button"
          >
            {reason}
          </button>
        ))}
      </div>
      <p className="helper-copy">
        Only active focus sessions record details. Nothing here is a failure.
      </p>
    </section>
  )
}
