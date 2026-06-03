import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { DISTRACTION_REASONS } from '../types/focus'

interface DistractionButtonsProps {
  customReasons: string[]
  disabled: boolean
  onAddCustomReason: (reason: string) => boolean
  onRecord: (reason: string) => void
  onRemoveCustomReason: (reason: string) => void
}

export function DistractionButtons({
  customReasons,
  disabled,
  onAddCustomReason,
  onRecord,
  onRemoveCustomReason,
}: DistractionButtonsProps) {
  const [customReason, setCustomReason] = useState('')
  const allReasons = [...DISTRACTION_REASONS, ...customReasons]

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (onAddCustomReason(customReason)) {
      setCustomReason('')
    }
  }

  return (
    <section className="panel" aria-labelledby="distraction-title">
      <div>
        <p className="eyebrow">Gentle check-in</p>
        <h2 id="distraction-title">Notice a distraction</h2>
      </div>
      <div className="reason-grid">
        {allReasons.map((reason) => {
          const isCustom = customReasons.includes(reason)

          return (
            <div className="reason-chip" key={reason}>
              <button
                className="reason-button"
                disabled={disabled}
                onClick={() => onRecord(reason)}
                type="button"
              >
                {reason}
              </button>
              {isCustom ? (
                <button
                  aria-label={`Remove ${reason}`}
                  className="remove-reason-button"
                  onClick={() => onRemoveCustomReason(reason)}
                  type="button"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          )
        })}
      </div>

      <form className="custom-reason-form" onSubmit={handleSubmit}>
        <input
          maxLength={24}
          onChange={(event) => setCustomReason(event.target.value)}
          placeholder="Add custom reason"
          type="text"
          value={customReason}
        />
        <button className="secondary-button" type="submit">
          Add
        </button>
      </form>

      <p className="helper-copy">
        Only active focus sessions record details. Nothing here is a failure.
      </p>
    </section>
  )
}
