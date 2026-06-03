import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { DISTRACTION_REASONS } from '../types/focus'
import { formatTime } from '../utils/time'

interface DistractionButtonsProps {
  activeDurationSeconds: number
  activeReasonLabel: string | null
  customReasons: string[]
  disabled: boolean
  onAddCustomReason: (reason: string) => boolean
  onRecord: (reason: string) => void
  onRemoveCustomReason: (reason: string) => void
}

export function DistractionButtons({
  activeDurationSeconds,
  activeReasonLabel,
  customReasons,
  disabled,
  onAddCustomReason,
  onRecord,
  onRemoveCustomReason,
}: DistractionButtonsProps) {
  const [customReason, setCustomReason] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const allReasons = [...DISTRACTION_REASONS, ...customReasons]

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (onAddCustomReason(customReason)) {
      setCustomReason('')
    }
  }

  return (
    <section
      className={isOpen ? 'distraction-panel open' : 'distraction-panel'}
      aria-label="Distraction controls"
    >
      <button
        aria-controls="distraction-menu"
        aria-expanded={isOpen}
        className="distraction-menu-toggle"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span>Distractions</span>
        {activeReasonLabel ? (
          <strong>
            {activeReasonLabel} {formatTime(activeDurationSeconds)}
          </strong>
        ) : null}
      </button>

      {isOpen ? (
        <div className="distraction-menu-body" id="distraction-menu">
          <div>
            <p className="eyebrow">Gentle check-in</p>
            <h2 id="distraction-title">Notice a distraction</h2>
          </div>

          {activeReasonLabel ? (
            <div className="active-distraction-hud">
              <span>{activeReasonLabel}</span>
              <strong>{formatTime(activeDurationSeconds)}</strong>
            </div>
          ) : null}

          <div className="reason-grid">
            {allReasons.map((reason) => {
              const isCustom = customReasons.includes(reason)

              return (
                <div className="reason-chip" key={reason}>
                  <button
                    className={
                      activeReasonLabel === reason
                        ? 'reason-button active'
                        : 'reason-button'
                    }
                    disabled={disabled}
                    onClick={() => onRecord(reason)}
                    type="button"
                  >
                    <span>{reason}</span>
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
            {disabled
              ? 'Start a focus session to record distraction episodes.'
              : 'Click a reason to start an episode. Click it again to stop.'}
          </p>
        </div>
      ) : null}
    </section>
  )
}
