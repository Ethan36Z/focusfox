import { useState, type FormEvent } from 'react'
import {
  canHandleExternalLink,
  createExternalLinkSource,
} from '../media/adapters/ExternalLinkAdapter'
import {
  canHandleYouTubeUrl,
  createYouTubeSource,
} from '../media/adapters/YouTubeAdapter'
import { useMediaStore } from '../store/mediaStore'
import type { FocusSource, FocusSourceType } from '../types/media'

function formatSourceType(type: FocusSourceType) {
  const labels: Record<FocusSourceType, string> = {
    localAudio: 'Local audio',
    localVideo: 'Local video',
    youtube: 'YouTube',
    bilibili: 'Bilibili',
    bilibiliLive: 'Bilibili live',
    externalLink: 'External link',
    freeTubeExternal: 'FreeTube external',
  }

  return labels[type]
}

function getSourceDetail(source: FocusSource) {
  if (source.fileName) {
    return `${source.fileName} - re-select local file after refresh`
  }

  return source.url ?? source.notes ?? 'Saved source metadata'
}

export function FocusSourceLibrary() {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const focusSources = useMediaStore((state) => state.focusSources)
  const selectedFocusSourceId = useMediaStore(
    (state) => state.selectedFocusSourceId,
  )
  const addFocusSource = useMediaStore((state) => state.addFocusSource)
  const removeFocusSource = useMediaStore((state) => state.removeFocusSource)
  const selectFocusSource = useMediaStore((state) => state.selectFocusSource)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedUrl = url.trim()

    if (!trimmedTitle || !trimmedUrl) {
      setError('Add a title and URL.')
      return
    }

    if (!canHandleExternalLink(trimmedUrl)) {
      setError('Use a valid http or https URL.')
      return
    }

    const safeTitle = trimmedTitle.slice(0, 80)
    const source = canHandleYouTubeUrl(trimmedUrl)
      ? createYouTubeSource(safeTitle, trimmedUrl)
      : {
          ...createExternalLinkSource(trimmedUrl),
          title: safeTitle,
        }

    if (!source) {
      setError('That YouTube link could not be parsed for embedded playback.')
      return
    }

    addFocusSource(source)
    setTitle('')
    setUrl('')
    setError('')
  }

  return (
    <section
      className="panel focus-source-library"
      aria-labelledby="source-library-title"
    >
      <div className="source-library-heading">
        <div>
          <p className="eyebrow">Focus sources</p>
          <h2 id="source-library-title">Small source library</h2>
        </div>
        <p>Metadata only. Local files are not stored.</p>
      </div>

      <form className="source-form" onSubmit={handleSubmit}>
        <input
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Source title"
          type="text"
          value={title}
        />
        <input
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/focus"
          type="url"
          value={url}
        />
        <button className="secondary-button" type="submit">
          Add source
        </button>
      </form>

      {error ? <p className="source-form-error">{error}</p> : null}

      {focusSources.length === 0 ? (
        <p className="empty-state">
          Saved focus source metadata will appear here.
        </p>
      ) : (
        <ul className="source-list">
          {focusSources.map((source) => {
            const isSelected = source.id === selectedFocusSourceId

            return (
              <li className={isSelected ? 'selected' : ''} key={source.id}>
                <div className="source-main">
                  <strong>{source.title}</strong>
                  <span>{formatSourceType(source.type)}</span>
                  <p title={getSourceDetail(source)}>
                    {getSourceDetail(source)}
                  </p>
                </div>
                <div className="source-actions">
                  <button
                    className={isSelected ? 'primary-button' : 'secondary-button'}
                    disabled={isSelected}
                    onClick={() => selectFocusSource(source.id)}
                    type="button"
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                  <button
                    className="ghost-button"
                    onClick={() => removeFocusSource(source.id)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
