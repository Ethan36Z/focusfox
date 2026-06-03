import { useRef, useState, type ChangeEvent } from 'react'
import { useFocusStore } from '../store/focusStore'
import { useMediaStore } from '../store/mediaStore'
import {
  createBackup,
  getBackupFileName,
  validateBackup,
} from '../utils/backup'

export function DataBackup() {
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const completedSessions = useFocusStore((state) => state.completedSessions)
  const customReasons = useFocusStore((state) => state.customReasons)
  const restoreFocusData = useFocusStore((state) => state.restoreFocusData)
  const focusSources = useMediaStore((state) => state.focusSources)
  const selectedFocusSourceId = useMediaStore(
    (state) => state.selectedFocusSourceId,
  )
  const restoreMediaData = useMediaStore((state) => state.restoreMediaData)

  function handleExport() {
    const backup = createBackup(
      completedSessions,
      customReasons,
      focusSources,
      selectedFocusSourceId,
    )
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = getBackupFileName()
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Backup exported as a JSON file.')
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      const parsed = JSON.parse(await file.text())
      const { data, error } = validateBackup(parsed)

      if (!data) {
        setMessage(error ?? 'Backup file could not be imported.')
        return
      }

      const confirmed = window.confirm(
        'Import this FocusFox backup? This will replace completed sessions, custom reasons, and focus source metadata on this device.',
      )

      if (!confirmed) {
        setMessage('Import cancelled.')
        return
      }

      restoreFocusData(data.completedSessions, data.customReasons)
      restoreMediaData(data.focusSources, data.selectedFocusSourceId)
      setMessage(
        'Backup imported. Local media files are not included and must be re-selected.',
      )
    } catch {
      setMessage('Backup file is not valid JSON.')
    }
  }

  return (
    <section className="panel data-backup" aria-labelledby="backup-title">
      <div className="data-backup-heading">
        <div>
          <p className="eyebrow">Local data only</p>
          <h2 id="backup-title">Data Backup</h2>
        </div>
        <span>No cloud sync</span>
      </div>

      <p className="helper-copy">
        Export completed sessions, custom reasons, and focus source metadata.
        Local media files are not included.
      </p>

      <div className="data-backup-actions">
        <button className="primary-button" onClick={handleExport} type="button">
          Export backup
        </button>
        <button
          className="secondary-button"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          Import backup
        </button>
        <input
          accept="application/json,.json"
          className="backup-file-input"
          onChange={handleImport}
          ref={fileInputRef}
          type="file"
        />
      </div>

      {message ? <p className="backup-message">{message}</p> : null}
    </section>
  )
}
