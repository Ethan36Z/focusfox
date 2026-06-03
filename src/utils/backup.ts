import type { CompletedSession } from '../types/focus'
import type { FocusSource } from '../types/media'

export const BACKUP_VERSION = 1

export interface FocusFoxBackup {
  app: 'FocusFox'
  version: number
  exportedAt: string
  completedSessions: CompletedSession[]
  customReasons: string[]
  focusSources: FocusSource[]
  selectedFocusSourceId: string | null
}

interface BackupValidationResult {
  data: FocusFoxBackup | null
  error: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object')
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isCompletedSession(value: unknown): value is CompletedSession {
  if (!isRecord(value)) {
    return false
  }

  return (
    isString(value.id) &&
    typeof value.durationMinutes === 'number' &&
    typeof value.totalSeconds === 'number' &&
    isString(value.startedAt) &&
    isString(value.completedAt) &&
    Array.isArray(value.distractions)
  )
}

function isFocusSource(value: unknown): value is FocusSource {
  if (!isRecord(value)) {
    return false
  }

  return (
    isString(value.id) &&
    isString(value.type) &&
    isString(value.title) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  )
}

export function createBackup(
  completedSessions: CompletedSession[],
  customReasons: string[],
  focusSources: FocusSource[],
  selectedFocusSourceId: string | null,
): FocusFoxBackup {
  return {
    app: 'FocusFox',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    completedSessions,
    customReasons,
    focusSources,
    selectedFocusSourceId,
  }
}

export function getBackupFileName(date = new Date()) {
  return `focusfox-backup-${date.toISOString().slice(0, 10)}.json`
}

export function validateBackup(value: unknown): BackupValidationResult {
  if (!isRecord(value)) {
    return { data: null, error: 'Backup file is not a valid JSON object.' }
  }

  if (value.app !== 'FocusFox' || value.version !== BACKUP_VERSION) {
    return { data: null, error: 'Backup version is not supported.' }
  }

  if (
    !Array.isArray(value.completedSessions) ||
    !value.completedSessions.every(isCompletedSession)
  ) {
    return { data: null, error: 'Completed sessions are missing or invalid.' }
  }

  if (
    !Array.isArray(value.customReasons) ||
    !value.customReasons.every(isString)
  ) {
    return { data: null, error: 'Custom reasons are missing or invalid.' }
  }

  if (
    !Array.isArray(value.focusSources) ||
    !value.focusSources.every(isFocusSource)
  ) {
    return { data: null, error: 'Focus sources are missing or invalid.' }
  }

  if (
    value.selectedFocusSourceId !== null &&
    value.selectedFocusSourceId !== undefined &&
    !isString(value.selectedFocusSourceId)
  ) {
    return { data: null, error: 'Selected focus source is invalid.' }
  }

  return {
    data: {
      app: 'FocusFox',
      version: BACKUP_VERSION,
      exportedAt: isString(value.exportedAt)
        ? value.exportedAt
        : new Date().toISOString(),
      completedSessions: value.completedSessions,
      customReasons: value.customReasons,
      focusSources: value.focusSources,
      selectedFocusSourceId: value.selectedFocusSourceId ?? null,
    },
    error: null,
  }
}
