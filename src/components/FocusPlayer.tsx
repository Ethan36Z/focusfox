import { useEffect, useRef, useState } from 'react'
import { Clock3, FolderOpen } from 'lucide-react'
import type { ChangeEvent } from 'react'
import type { ReactNode } from 'react'
import type { FocusStatus } from '../types/focus'

type MediaKind = 'audio' | 'video'

interface FocusPlayerProps {
  activeDistractionDurationSeconds: number
  activeDistractionLabel: string | null
  completion: ReactNode
  controls: ReactNode
  distractions: ReactNode
  duration: ReactNode
  onEndActiveDistraction: () => void
  onStart: () => void
  status: FocusStatus
  timer: ReactNode
}

export function FocusPlayer({
  activeDistractionDurationSeconds,
  activeDistractionLabel,
  completion,
  controls,
  distractions,
  duration,
  onEndActiveDistraction,
  onStart,
  status,
  timer,
}: FocusPlayerProps) {
  const [isDurationOpen, setIsDurationOpen] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaKind, setMediaKind] = useState<MediaKind | null>(null)
  const [fileName, setFileName] = useState('')
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }

    const nextUrl = URL.createObjectURL(file)
    objectUrlRef.current = nextUrl
    setMediaUrl(nextUrl)
    setMediaKind(file.type.startsWith('video/') ? 'video' : 'audio')
    setFileName(file.name)
  }

  const handleStartFromSetup = () => {
    onStart()
    setIsDurationOpen(false)
  }

  return (
    <section className="focus-player" aria-labelledby="focus-player-title">
      <h2 className="visually-hidden" id="focus-player-title">
        Local focus player
      </h2>

      <div
        className={
          activeDistractionLabel
            ? 'focus-player-stage distraction-active'
            : 'focus-player-stage'
        }
      >
        {mediaUrl && mediaKind ? (
          <div className={`media-surface media-surface-${mediaKind}`}>
            {mediaKind === 'video' ? (
              <video
                src={mediaUrl}
                controls
                aria-label={`Playing ${fileName}`}
              />
            ) : (
              <div className="audio-focus-surface">
                <div className="audio-orb" aria-hidden="true" />
                <audio
                  src={mediaUrl}
                  controls
                  aria-label={`Playing ${fileName}`}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="media-empty">
            Choose a local audio or video file to create a focus atmosphere.
          </div>
        )}

        <div className="player-chrome">
          <p className="media-file-name" title={fileName || 'No media selected'}>
            {fileName || 'No local media selected'}
          </p>
          <div className="player-chrome-actions">
            <button
              aria-controls="duration-menu"
              aria-expanded={isDurationOpen}
              aria-label="Choose focus duration"
              className="player-chrome-button"
              onClick={() => setIsDurationOpen((current) => !current)}
              type="button"
            >
              <Clock3 size={16} aria-hidden="true" />
            </button>
            <label
              aria-label="Choose local audio or video file"
              className="player-chrome-button media-picker"
              title="Choose local media"
            >
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileChange}
                aria-label="Choose a local audio or video file"
              />
              <FolderOpen size={16} aria-hidden="true" />
            </label>
            {distractions}
          </div>
        </div>

        {isDurationOpen ? (
          <div className="duration-popover" id="duration-menu">
            {duration}
            {status === 'idle' || status === 'completed' ? (
              <button
                className="primary-button setup-start-button"
                onClick={handleStartFromSetup}
                type="button"
              >
                {status === 'completed' ? 'Start new session' : 'Start'}
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="player-timer-layer">{timer}</div>
        {activeDistractionLabel ? (
          <div className="active-distraction-overlay">
            <span>{activeDistractionLabel}</span>
            <strong>
              {Math.floor(activeDistractionDurationSeconds / 60)
                .toString()
                .padStart(2, '0')}
              :
              {(activeDistractionDurationSeconds % 60)
                .toString()
                .padStart(2, '0')}
            </strong>
            <button
              className="secondary-button active-distraction-end"
              onClick={onEndActiveDistraction}
              type="button"
            >
              End
            </button>
          </div>
        ) : null}
        {completion ? (
          <div className="player-completion-overlay">{completion}</div>
        ) : null}
      </div>

      <div className="player-control-layer">
        {controls}
        <div className="player-boundary-note">
          Media and timer controls stay separate for now.
        </div>
      </div>

      <p className="media-note">
        Local files stay in this browser session and are not saved.
      </p>
    </section>
  )
}
