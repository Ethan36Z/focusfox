import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { ReactNode } from 'react'

type MediaKind = 'audio' | 'video'

interface FocusPlayerProps {
  controls: ReactNode
  timer: ReactNode
}

export function FocusPlayer({ controls, timer }: FocusPlayerProps) {
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

  return (
    <section className="focus-player" aria-labelledby="focus-player-title">
      <div className="focus-player-header">
        <div>
          <p className="eyebrow">Focus atmosphere</p>
          <h2 id="focus-player-title">Local player</h2>
        </div>
        <label className="media-picker">
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={handleFileChange}
            aria-label="Choose a local audio or video file"
          />
          Choose file
        </label>
      </div>

      <div className="focus-player-stage">
        {mediaUrl && mediaKind ? (
          <div className={`media-surface media-surface-${mediaKind}`}>
            <p className="media-file-name" title={fileName}>
              {fileName}
            </p>
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

        <div className="player-timer-layer">{timer}</div>
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
