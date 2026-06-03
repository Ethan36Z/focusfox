import { useEffect, useRef, useState } from 'react'
import {
  Clock3,
  Eye,
  EyeOff,
  FolderOpen,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import type { ChangeEvent } from 'react'
import type { ReactNode } from 'react'
import {
  canHandleLocalFile,
  createLocalFileSource,
} from '../media/adapters/LocalFileAdapter'
import { useMediaStore } from '../store/mediaStore'
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
  const playerRef = useRef<HTMLElement | null>(null)
  const [isDurationOpen, setIsDurationOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isTimerVisible, setIsTimerVisible] = useState(true)
  const [embedFailed, setEmbedFailed] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaKind, setMediaKind] = useState<MediaKind | null>(null)
  const [fileName, setFileName] = useState('')
  const objectUrlRef = useRef<string | null>(null)
  const selectedSource = useMediaStore((state) => state.selectedSource)
  const addFocusSource = useMediaStore((state) => state.addFocusSource)
  const setRuntimeLocalFile = useMediaStore(
    (state) => state.setRuntimeLocalFile,
  )

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === playerRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    setEmbedFailed(false)
  }, [selectedSource?.id])

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

    if (canHandleLocalFile(file)) {
      addFocusSource(createLocalFileSource(file))
      setRuntimeLocalFile({
        fileName: file.name,
        mimeType: file.type || undefined,
      })
    }
  }

  const handleStartFromSetup = () => {
    onStart()
    setIsDurationOpen(false)
  }

  const handleFullscreenToggle = async () => {
    if (document.fullscreenElement === playerRef.current) {
      await document.exitFullscreen()
      return
    }

    await playerRef.current?.requestFullscreen()
  }

  const isSelectedRuntimeLocalSource =
    selectedSource?.type === 'localAudio' || selectedSource?.type === 'localVideo'
  const shouldShowRuntimeMedia =
    Boolean(mediaUrl && mediaKind) &&
    (!selectedSource || isSelectedRuntimeLocalSource)
  const runtimeMediaUrl = shouldShowRuntimeMedia ? mediaUrl : null
  const runtimeMediaKind = shouldShowRuntimeMedia ? mediaKind : null
  const shouldShowYouTube =
    selectedSource?.type === 'youtube' && Boolean(selectedSource.embedUrl)
  const selectedYouTubeSource = shouldShowYouTube ? selectedSource : null
  const displayTitle =
    selectedSource?.title ?? (fileName || 'No local media selected')

  return (
    <section
      className="focus-player"
      ref={playerRef}
      aria-labelledby="focus-player-title"
    >
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
        {selectedYouTubeSource?.embedUrl ? (
          <div className="media-surface media-surface-youtube">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onError={() => setEmbedFailed(true)}
              src={selectedYouTubeSource.embedUrl}
              title={selectedYouTubeSource.title}
            />
            <div className="youtube-fallback">
              {embedFailed ? (
                <p>
                  This video may not allow embedded playback. Open it externally
                  instead.
                </p>
              ) : null}
              {selectedYouTubeSource.url ? (
                <a
                  href={selectedYouTubeSource.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open on YouTube
                </a>
              ) : null}
            </div>
          </div>
        ) : runtimeMediaUrl && runtimeMediaKind ? (
          <div className={`media-surface media-surface-${runtimeMediaKind}`}>
            {runtimeMediaKind === 'video' ? (
              <video
                src={runtimeMediaUrl}
                controls
                aria-label={`Playing ${fileName}`}
              />
            ) : (
              <div className="audio-focus-surface">
                <div className="audio-orb" aria-hidden="true" />
                <audio
                  src={runtimeMediaUrl}
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
          <p className="media-file-name" title={displayTitle}>
            {displayTitle}
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
            <button
              aria-label={isTimerVisible ? 'Hide timer HUD' : 'Show timer HUD'}
              className="player-chrome-button"
              onClick={() => setIsTimerVisible((current) => !current)}
              title={isTimerVisible ? 'Hide timer' : 'Show timer'}
              type="button"
            >
              {isTimerVisible ? (
                <EyeOff size={16} aria-hidden="true" />
              ) : (
                <Eye size={16} aria-hidden="true" />
              )}
            </button>
            <button
              aria-label={
                isFullscreen
                  ? 'Exit FocusFox fullscreen'
                  : 'Enter FocusFox fullscreen'
              }
              className="player-chrome-button"
              onClick={handleFullscreenToggle}
              title={isFullscreen ? 'Exit fullscreen' : 'FocusFox fullscreen'}
              type="button"
            >
              {isFullscreen ? (
                <Minimize2 size={16} aria-hidden="true" />
              ) : (
                <Maximize2 size={16} aria-hidden="true" />
              )}
            </button>
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

        {isTimerVisible ? (
          <div className="player-timer-layer">{timer}</div>
        ) : null}
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
        <div className="player-control-layer">{controls}</div>
      </div>
    </section>
  )
}
