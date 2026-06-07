import { useState, type FormEvent } from 'react'
import { Coffee, X } from 'lucide-react'
import { DISTRACTION_REASONS } from '../types/focus'

interface DistractionButtonsProps {
  activeDurationSeconds: number
  activeReasonLabel: string | null
  customReasons: string[]
  disabled: boolean
  isOpen: boolean
  onAddCustomReason: (reason: string) => boolean
  onOpenChange: (isOpen: boolean) => void
  onRecord: (reason: string) => void
  onRemoveCustomReason: (reason: string) => void
}

export function DistractionButtons({
  activeReasonLabel,
  customReasons,
  disabled,
  isOpen,
  onAddCustomReason,
  onOpenChange,
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

  function handleReasonClick(reason: string) {
    onRecord(reason)
    onOpenChange(false)
  }

  return (
    <section
      className={isOpen ? 'distraction-panel open' : 'distraction-panel'}
      aria-label="Distraction controls"
    >
      <button
        aria-controls="distraction-menu"
        aria-expanded={isOpen}
        aria-label="Open distraction menu"
        className="distraction-menu-toggle"
        onClick={() => onOpenChange(!isOpen)}
        title="Distractions"
        type="button"
      >
        <Coffee size={16} aria-hidden="true" />
        {activeReasonLabel ? <span className="recording-dot" /> : null}
      </button>

      {isOpen ? (
        <div className="distraction-menu-body" id="distraction-menu">
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
                    className={
                      activeReasonLabel === reason
                        ? 'reason-button active'
                        : 'reason-button'
                    }
                    disabled={disabled}
                    onClick={() => handleReasonClick(reason)}
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
