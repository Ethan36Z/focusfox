import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

type MediaKind = 'audio' | 'video'

export function FocusPlayer() {
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

      {mediaUrl && mediaKind ? (
        <div className={`media-surface media-surface-${mediaKind}`}>
          <p className="media-file-name" title={fileName}>
            {fileName}
          </p>
          {mediaKind === 'video' ? (
            <video src={mediaUrl} controls aria-label={`Playing ${fileName}`} />
          ) : (
            <audio src={mediaUrl} controls aria-label={`Playing ${fileName}`} />
          )}
        </div>
      ) : (
        <div className="media-empty">
          Choose a local audio or video file to create a focus atmosphere.
        </div>
      )}

      <p className="media-note">
        Local files stay in this browser session and are not saved.
      </p>
    </section>
  )
}
